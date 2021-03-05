/**
 * External dependencies
 */
// See https://babeljs.io/docs/en/babel-types
const { types: babelTypes } = require( '@babel/core' );

/* eslint-disable jsdoc/valid-types */
/** @typedef {ReturnType<import('comment-parser').parse>[0]} CommentBlock */
/** @typedef {CommentBlock['tags'][0]} CommentTag */
/** @typedef {babelTypes.TSType} TypeAnnotation */
/** @typedef {import('@babel/core').Node} ASTNode */
/* eslint-enable jsdoc/valid-types */

/**
 * @param {babelTypes.TSCallSignatureDeclaration | babelTypes.TSFunctionType} typeAnnotation
 * @param {' => ' | ': '} returnIndicator The return indicator to use. Allows using the same function for function annotations and object call properties.
 */
function getFunctionTypeAnnotation( typeAnnotation, returnIndicator ) {
	const params = typeAnnotation.parameters
		.map(
			( p ) =>
				`${ p.name }: ${ getTypeAnnotation(
					p.typeAnnotation.typeAnnotation
				) }`
		)
		.join( ', ' );
	const returnType = getTypeAnnotation(
		typeAnnotation.returnType ||
			typeAnnotation.typeAnnotation.typeAnnotation
	);
	return `( ${ params } )${ returnIndicator }${ returnType }`;
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralCallSignatureDeclarationTypeAnnotations(
	typeAnnotation
) {
	const callProperties = typeAnnotation.members
		.filter( ( m ) => babelTypes.isTSCallSignatureDeclaration( m ) )
		.map( ( callProperty ) => {
			return getFunctionTypeAnnotation( callProperty, ': ' );
		} );

	if ( callProperties.length ) {
		return `${ callProperties.join( '; ' ) }; `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralIndexSignatureTypeAnnotations( typeAnnotation ) {
	const indexers = typeAnnotation.members
		.filter( ( m ) => babelTypes.isTSIndexSignature( m ) )
		.map( ( indexer ) => {
			const parameter = indexer.parameters[ 0 ];
			return `[ ${ parameter.name }: ${ getTypeAnnotation(
				parameter.typeAnnotation.typeAnnotation
			) } ]: ${ getTypeAnnotation(
				indexer.typeAnnotation.typeAnnotation
			) }`;
		} );

	if ( indexers.length ) {
		return `${ indexers.join( '; ' ) }; `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralPropertyTypeAnnotations( typeAnnotation ) {
	const properties = typeAnnotation.members
		.filter( ( m ) => babelTypes.isTSPropertySignature( m ) )
		.map( ( prop ) => {
			return `${ prop.key.name }${
				prop.optional ? '?' : ''
			}: ${ getTypeAnnotation( prop.typeAnnotation.typeAnnotation ) }`;
		} );

	if ( properties.length ) {
		return `${ properties.join( '; ' ) }; `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralTypeAnnotation( typeAnnotation ) {
	const callProperties = getTypeLiteralCallSignatureDeclarationTypeAnnotations(
		typeAnnotation
	);
	const indexers = getTypeLiteralIndexSignatureTypeAnnotations(
		typeAnnotation
	);
	const properties = getTypeLiteralPropertyTypeAnnotations( typeAnnotation );

	return `{ ${ callProperties }${ properties }${ indexers }}`;
}

/**
 * @param {babelTypes.TSUnionType} typeAnnotation
 */
function getUnionTypeAnnotation( typeAnnotation ) {
	return typeAnnotation.types.map( getTypeAnnotation ).join( ' | ' );
}

/**
 * @param {babelTypes.TSIntersectionType} typeAnnotation
 */
function getIntersectionTypeAnnotation( typeAnnotation ) {
	return typeAnnotation.types.map( getTypeAnnotation ).join( ' & ' );
}

/**
 * @param {babelTypes.TSArrayType} typeAnnotation
 * @return {string} The type annotation
 */
function getArrayTypeAnnotation( typeAnnotation ) {
	return `${ getTypeAnnotation( typeAnnotation.elementType ) }[]`;
}

/**
 * @param {babelTypes.TSTupleType} typeAnnotation
 */
function getTupleTypeAnnotation( typeAnnotation ) {
	const types = typeAnnotation.elementTypes
		.map( getTypeAnnotation )
		.join( ', ' );
	if ( types.length ) {
		return `[ ${ types } ]`;
	}
	return '[]';
}

/**
 * @param {babelTypes.TSQualifiedName} qualifiedName
 */
function unifyQualifiedName( qualifiedName ) {
	if ( ! qualifiedName.right ) {
		if ( ! qualifiedName.left ) {
			return qualifiedName.name;
		}
		return qualifiedName.left.name;
	}
	return `${ unifyQualifiedName( qualifiedName.left ) }.${
		qualifiedName.right.name
	}`;
}

/**
 * @param {babelTypes.TSImportType} typeAnnotation
 */
function getImportTypeAnnotation( typeAnnotation ) {
	// Should this just return the unqualified name (i.e., typeAnnotation.name || typeAnnotation.right.name)?
	return `import( '${
		typeAnnotation.argument.value
	}' ).${ unifyQualifiedName( typeAnnotation.qualifier ) }`;
}

/**
 *
 * @param {babelTypes.TSType} objectType
 */
function getIndexedAccessTypeAnnotationObjectName( objectType ) {
	if ( babelTypes.isTSImportType( objectType ) ) {
		return getImportTypeAnnotation( objectType );
	}
	return objectType.typeName.name;
}

/**
 * @param {babelTypes.TSIndexedAccessType} typeAnnotation
 */
function getIndexedAccessTypeAnnotation( typeAnnotation ) {
	const objName = getIndexedAccessTypeAnnotationObjectName(
		typeAnnotation.objectType
	);
	const index = typeAnnotation.indexType.literal.value;
	return `${ objName }[ '${ index }' ]`;
}

/**
 *
 * @param {babelTypes.TSLiteralType} typeAnnotation
 */
function getLiteralTypeAnnotation( typeAnnotation ) {
	switch ( typeAnnotation.literal.type ) {
		case 'BigIntLiteral': {
			return `${ typeAnnotation.literal.value }n`;
		}
		case 'NumericLiteral':
		case 'BooleanLiteral': {
			return typeAnnotation.literal.value.toString();
		}
		case 'StringLiteral': {
			return `'${ typeAnnotation.literal.value }'`;
		}
	}
}

/**
 * @param {babelTypes.TSMappedType} typeAnnotation
 */
function getMappedTypeAnnotation( typeAnnotation ) {
	const typeParam = typeAnnotation.typeParameter.name;
	const constraintOperator = typeAnnotation.typeParameter.constraint.operator;
	const constraintAnnotation = getTypeAnnotation(
		typeAnnotation.typeParameter.constraint.typeAnnotation
	);
	const mappedValue = getTypeAnnotation( typeAnnotation.typeAnnotation );
	return `[ ${ typeParam } in ${ constraintOperator } ${ constraintAnnotation } ]: ${ mappedValue }`;
}

/**
 * @param {babelTypes.TSTypeReference} typeAnnotation
 */
function getTypeReferenceTypeAnnotation( typeAnnotation ) {
	if ( ! typeAnnotation.typeParameters ) {
		if ( babelTypes.isTSQualifiedName( typeAnnotation.typeName ) ) {
			return unifyQualifiedName( typeAnnotation.typeName );
		}
		return typeAnnotation.typeName.name;
	}
	const typeParams = typeAnnotation.typeParameters.params
		.map( getTypeAnnotation )
		.join( ', ' );
	return `${ typeAnnotation.typeName.name }< ${ typeParams } >`;
}

/**
 * @param {TypeAnnotation} typeAnnotation
 * @return {string | null} The type or null if not an identifiable type.
 */
function getTypeAnnotation( typeAnnotation ) {
	switch ( typeAnnotation.type ) {
		case 'TSAnyKeyword': {
			return 'any';
		}
		case 'TSArrayType': {
			return getArrayTypeAnnotation( typeAnnotation );
		}
		case 'TSBigIntKeyword': {
			return 'BigInt';
		}
		case 'TSBooleanKeyword': {
			return 'boolean';
		}
		case 'TSConditionalType': {
			// Unsure what this is
			return '';
		}
		case 'TSConstructorType': {
			return `new ${ getFunctionTypeAnnotation( typeAnnotation ) }`;
		}
		case 'TSExpressionWithTypeArguments': {
			// Unsure with this is
			return '';
		}
		case 'TSFunctionType': {
			return getFunctionTypeAnnotation( typeAnnotation );
		}
		case 'TSImportType': {
			return getImportTypeAnnotation( typeAnnotation );
		}
		case 'TSIndexedAccessType': {
			return getIndexedAccessTypeAnnotation( typeAnnotation );
		}
		case 'TSIntersectionType': {
			return getIntersectionTypeAnnotation( typeAnnotation );
		}
		case 'TSLiteralType': {
			return getLiteralTypeAnnotation( typeAnnotation );
		}
		case 'TSMappedType': {
			return getMappedTypeAnnotation( typeAnnotation );
		}
		case 'TSNeverKeyword': {
			return 'never';
		}
		case 'TSNullKeyword': {
			return 'null';
		}
		case 'TSNumberKeyword': {
			return 'number';
		}
		case 'TSObjectKeyword': {
			return 'object';
		}
		case 'TSOptionalType': {
			return `${ getTypeAnnotation( typeAnnotation.typeAnnotation ) }?`;
		}
		case 'TSParenthesizedType': {
			return `( ${ getTypeAnnotation(
				typeAnnotation.typeAnnotation
			) } )`;
		}
		case 'TSRestType': {
			return `...${ getTypeAnnotation( typeAnnotation.typeAnnotation ) }`;
		}
		case 'TSStringKeyword': {
			return 'string';
		}
		case 'TSSymbolKeyword': {
			return 'symbol';
		}
		case 'TSThisType': {
			return 'this';
		}
		case 'TSTupleType': {
			return getTupleTypeAnnotation( typeAnnotation );
		}
		case 'TSTypeLiteral': {
			return getTypeLiteralTypeAnnotation( typeAnnotation );
		}
		case 'TSTypeOperator': {
			return `${ typeAnnotation.operator } ${ getTypeAnnotation(
				typeAnnotation.typeAnnotation
			) }`;
		}
		case 'TSTypePredicate': {
			return `${
				typeAnnotation.parameterName.name
			} is ${ getTypeAnnotation(
				typeAnnotation.typeAnnotation.typeAnnotation
			) }`;
		}
		case 'TSTypeQuery': {
			// unsure what this is
			return '';
		}
		case 'TSTypeReference': {
			return getTypeReferenceTypeAnnotation( typeAnnotation );
		}
		case 'TSUndefinedKeyword': {
			return 'undefined';
		}
		case 'TSUnionType': {
			return getUnionTypeAnnotation( typeAnnotation );
		}
		case 'TSUnknownKeyword': {
			return 'unknown';
		}
		case 'TSVoidKeyword': {
			return 'void';
		}
		default: {
			return '';
		}
	}
}

/**
 * @param {ASTNode} token
 * @return {babelTypes.ArrowFunctionExpression | babelTypes.FunctionDeclaration} The function token.
 */
function getFunctionToken( token ) {
	let resolvedToken = token;
	if ( babelTypes.isExportNamedDeclaration( resolvedToken ) ) {
		resolvedToken = resolvedToken.declaration;
	}

	if ( babelTypes.isVariableDeclaration( resolvedToken ) ) {
		// ignore multiple variable declarations
		resolvedToken = resolvedToken.declarations[ 0 ].init;
	}

	return resolvedToken;
}

function getFunctionNameForError( declarationToken ) {
	let namedFunctionToken = declarationToken;
	if ( babelTypes.isExportNamedDeclaration( declarationToken ) ) {
		namedFunctionToken = declarationToken;
	}

	if ( babelTypes.isVariableDeclaration( namedFunctionToken ) ) {
		namedFunctionToken = namedFunctionToken.declarations[ 0 ];
	}

	return namedFunctionToken.id.name;
}

/**
 * @param {CommentTag} tag The documented parameter.
 * @param {ASTNode} declarationToken The function the parameter is documented on.
 * @return {null | string} The parameter's type annotation.
 */
function getParamTypeAnnotation( tag, declarationToken ) {
	const functionToken = getFunctionToken( declarationToken );

	// otherwise find the corresponding parameter token for the documented parameter
	/** @type {babelTypes.Identifier} */
	const paramToken = functionToken.params.reduce( ( found, pToken ) => {
		if ( found ) return found;
		const tokenName = babelTypes.isRestElement( pToken )
			? pToken.argument.name
			: pToken.name;
		return tokenName === tag.name ? pToken : found;
	}, null );

	// This shouldn't happen due to our ESLint enforcing correctly documented parameter names but just in case
	// we'll give a descriptive error so that it's easy to diagnose the issue.
	if ( ! paramToken ) {
		throw new Error(
			`Could not find corresponding parameter token for documented parameter '${
				tag.name
			}' in function '${ getFunctionNameForError( declarationToken ) }'.`
		);
	}

	try {
		/** @type {babelTypes.TSTypeAnnotation} */
		const typeAnnotation = paramToken.typeAnnotation.typeAnnotation;
		return getTypeAnnotation( typeAnnotation );
	} catch ( e ) {
		throw new Error(
			`Could not find type for parameter '${
				tag.name
			}' in function '${ getFunctionNameForError( declarationToken ) }'.`
		);
	}
}

/**
 * @param {ASTNode} declarationToken A function token.
 * @return {null | string} The function's return type annoation.
 */
function getReturnTypeAnnotation( declarationToken ) {
	const functionToken = getFunctionToken( declarationToken );

	try {
		return getTypeAnnotation( functionToken.returnType.typeAnnotation );
	} catch ( e ) {
		throw new Error(
			`Could not find return type for function '${ getFunctionNameForError(
				declarationToken
			) }'.`
		);
	}
}

module.exports =
	/**
	 * @param {CommentTag} tag A comment tag.
	 * @param {ASTNode} token A function token.
	 * @return {null | string} The type annotation for the given tag or null if the tag has no type annotation.
	 */
	function ( tag, token ) {
		// If the file is using JSDoc type annotations, use the JSDoc.
		if ( tag.type ) {
			return tag.type;
		}

		switch ( tag.tag ) {
			case 'param': {
				return getParamTypeAnnotation( tag, token );
			}
			case 'return': {
				return getReturnTypeAnnotation( token );
			}
			default: {
				return '';
			}
		}
	};
