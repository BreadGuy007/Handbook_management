/**
 * Validate a namespace string.
 *
 * @param  {string} namespace The namespace to validate - should take the form
 *                            `my-plugin-slug/functionDescription`.
 *
 * @return {bool}             Whether the namespace is valid.
 */
function validateNamespace( namespace ) {

	if ( 'string' !== typeof namespace || '' === namespace ) {
		console.error( 'The namespace must be a non-empty string.' );
		return false;
	}

	if ( ! /^[a-zA-Z][a-zA-Z0-9_.-/]*$/.test( namespace ) ) {
		console.error( 'The namespace can only contain numbers, letters, dashes, periods and underscores, plus the forward slash dividing slug and description in the namespace.' );
		return false;
	}

	if ( ! /^[a-zA-Z][a-zA-Z0-9_.-]*\/[a-zA-Z][a-zA-Z0-9_.-]*\/[a-zA-Z][a-zA-Z0-9_.-]*$/.test( namespace ) ) {
		console.error( 'The namespace must take the form `vendorName/pluginName/functionName`.' );
		return false;
	}

	return true;
}

export default validateNamespace;
