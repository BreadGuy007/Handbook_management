/**
 * WordPress dependencies
 */
import {
	useState,
} from '@wordpress/element';
import {
	useSelect,
	useDispatch,
} from '@wordpress/data';
import {
	__experimentalBlockNavigationList,
} from '@wordpress/block-editor';
import {
	IconButton,
	SVG,
	Path,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const NavigatorIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
		<Path d="M5 5H3v2h2V5zm3 8h11v-2H8v2zm9-8H6v2h11V5zM7 11H5v2h2v-2zm0 8h2v-2H7v2zm3-2v2h11v-2H10z" />
	</SVG>
);

export default function useBlockNavigator( clientId ) {
	const [ isNavigationListOpen, setIsNavigationListOpen ] = useState( false );

	const {
		block,
		selectedBlockClientId,
	} = useSelect( ( select ) => {
		const {
			getSelectedBlockClientId,
			getBlock,
		} = select( 'core/block-editor' );

		return {
			block: getBlock( clientId ),
			selectedBlockClientId: getSelectedBlockClientId(),
		};
	}, [ clientId ] );

	const {
		selectBlock,
	} = useDispatch( 'core/block-editor' );

	const navigatorToolbarButton = (
		<IconButton
			className="components-toolbar__control"
			label={ __( 'Open block navigator' ) }
			onClick={ () => setIsNavigationListOpen( true ) }
			icon={ NavigatorIcon }
		/>
	);

	const navigatorModal = isNavigationListOpen && (
		<Modal
			title={ __( 'Block Navigator' ) }
			closeLabel={ __( 'Close' ) }
			onRequestClose={ () => {
				setIsNavigationListOpen( false );
			} }
		>
			<__experimentalBlockNavigationList
				blocks={ [ block ] }
				selectedBlockClientId={ selectedBlockClientId }
				selectBlock={ selectBlock }
				showNestedBlocks
			/>
		</Modal>
	);

	return {
		navigatorToolbarButton,
		navigatorModal,
	};
}
