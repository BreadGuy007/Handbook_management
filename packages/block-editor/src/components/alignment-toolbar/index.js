/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Toolbar } from '@wordpress/components';

const DEFAULT_ALIGNMENT_CONTROLS = [
	{
		icon: 'editor-alignleft',
		title: __( 'Align Text Left' ),
		align: 'left',
	},
	{
		icon: 'editor-aligncenter',
		title: __( 'Align Text Center' ),
		align: 'center',
	},
	{
		icon: 'editor-alignright',
		title: __( 'Align Text Right' ),
		align: 'right',
	},
];

export function AlignmentToolbar( props ) {
	const {
		value,
		onChange,
		alignmentControls = DEFAULT_ALIGNMENT_CONTROLS,
		label = __( 'Change text alignment' ),
		isCollapsed = true,
	} = props;

	function applyOrUnset( align ) {
		return () => onChange( value === align ? undefined : align );
	}

	const activeAlignment = find( alignmentControls, ( control ) => control.align === value );

	return (
		<Toolbar
			isCollapsed={ isCollapsed }
			icon={ activeAlignment ? activeAlignment.icon : 'editor-alignleft' }
			label={ label }
			controls={ alignmentControls.map( ( control ) => {
				const { align } = control;
				const isActive = ( value === align );

				return {
					...control,
					isActive,
					onClick: applyOrUnset( align ),
				};
			} ) }
		/>
	);
}

export default AlignmentToolbar;
