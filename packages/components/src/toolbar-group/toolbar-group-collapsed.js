/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DropdownMenu from '../dropdown-menu';
import ToolbarContext from '../toolbar-context';
import ToolbarItem from '../toolbar-item';

function ToolbarGroupCollapsed( { controls = [], toggleProps, ...props } ) {
	// It'll contain state if `ToolbarGroup` is being used within
	// `<Toolbar label="label" />`
	const accessibleToolbarState = useContext( ToolbarContext );

	const renderDropdownMenu = ( internalToggleProps ) => (
		<DropdownMenu
			controls={ controls }
			toggleProps={ {
				...internalToggleProps,
				...toggleProps,
				'data-toolbar-item': true,
			} }
			{ ...props }
		/>
	);

	if ( accessibleToolbarState ) {
		return <ToolbarItem>{ renderDropdownMenu }</ToolbarItem>;
	}

	return renderDropdownMenu();
}

export default ToolbarGroupCollapsed;
