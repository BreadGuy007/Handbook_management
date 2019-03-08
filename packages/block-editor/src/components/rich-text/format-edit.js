/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { getActiveFormat } from '@wordpress/rich-text';

const FormatEdit = ( { formatTypes, onChange, value } ) => {
	return (
		<Fragment>
			{ formatTypes.map( ( { name, edit: Edit } ) => {
				if ( ! Edit ) {
					return null;
				}

				const activeFormat = getActiveFormat( value, name );
				const isActive = activeFormat !== undefined;
				const activeAttributes = isActive ? activeFormat.attributes || {} : {};

				return (
					<Edit
						key={ name }
						isActive={ isActive }
						activeAttributes={ activeAttributes }
						value={ value }
						onChange={ onChange }
					/>
				);
			} ) }
		</Fragment>
	);
};

export default withSelect(
	( select ) => {
		const { getFormatTypes } = select( 'core/rich-text' );

		return {
			formatTypes: getFormatTypes(),
		};
	}
)( FormatEdit );
