/**
 * External dependencies
 */
import { map, sortBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, PanelBody, TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getBlockType } from '@wordpress/blocks';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	useGlobalStylesContext,
	useGlobalStylesReset,
} from '../editor/global-styles-provider';
import DefaultSidebar from './default-sidebar';
import { GLOBAL_CONTEXT_NAME } from '../editor/utils';
import {
	default as TypographyPanel,
	useHasTypographyPanel,
} from './typography-panel';
import { default as ColorPanel, useHasColorPanel } from './color-panel';

function GlobalStylesPanel( {
	wrapperPanelTitle,
	context,
	getStyleProperty,
	setStyleProperty,
	getSetting,
	setSetting,
} ) {
	const hasColorPanel = useHasColorPanel( context );
	const hasTypographyPanel = useHasTypographyPanel( context );

	if ( ! hasColorPanel && ! hasTypographyPanel ) {
		return null;
	}

	const content = (
		<>
			{ hasTypographyPanel && (
				<TypographyPanel
					context={ context }
					getStyleProperty={ getStyleProperty }
					setStyleProperty={ setStyleProperty }
				/>
			) }
			{ hasColorPanel && (
				<ColorPanel
					context={ context }
					getStyleProperty={ getStyleProperty }
					setStyleProperty={ setStyleProperty }
					getSetting={ getSetting }
					setSetting={ setSetting }
				/>
			) }
		</>
	);
	if ( ! wrapperPanelTitle ) {
		return content;
	}
	return (
		<PanelBody title={ wrapperPanelTitle } initialOpen={ false }>
			{ content }
		</PanelBody>
	);
}

function getPanelTitle( context ) {
	/*
	 * We use the block's name as the panel title.
	 *
	 * Some blocks (eg: core/heading) can represent different
	 * contexts (eg: core/heading/h1, core/heading/h2).
	 * For those, we attach the selector (h1) after the block's name.
	 *
	 * The title can't be accessed in the server,
	 * as it's translatable and the block.json doesn't
	 * have it yet.
	 */
	const blockType = getBlockType( context.blockName );
	// Protect against blocks that aren't registered
	// eg: widget-area
	if ( blockType === undefined ) {
		return blockType;
	}

	let panelTitle = blockType.title;
	if ( 'object' === typeof blockType?.supports?.__experimentalSelector ) {
		panelTitle += ` (${ context.title })`;
	}
	return panelTitle;
}

function GlobalStylesBlockPanels( {
	contexts,
	getStyleProperty,
	setStyleProperty,
	getSetting,
	setSetting,
} ) {
	const panels = useMemo(
		() =>
			sortBy(
				map( contexts, ( context, name ) => {
					return {
						context,
						name,
						wrapperPanelTitle: getPanelTitle( context ),
					};
				} ),
				( { wrapperPanelTitle } ) => wrapperPanelTitle
			),
		[ contexts ]
	);

	return map( panels, ( { context, name, wrapperPanelTitle } ) => {
		if ( name === GLOBAL_CONTEXT_NAME ) {
			return null;
		}
		return (
			<GlobalStylesPanel
				key={ 'panel-' + name }
				wrapperPanelTitle={ wrapperPanelTitle }
				context={ { ...context, name } }
				getStyleProperty={ getStyleProperty }
				setStyleProperty={ setStyleProperty }
				getSetting={ getSetting }
				setSetting={ setSetting }
			/>
		);
	} );
}

export default function GlobalStylesSidebar( {
	identifier,
	title,
	icon,
	closeLabel,
} ) {
	const {
		contexts,
		getStyleProperty,
		setStyleProperty,
		getSetting,
		setSetting,
	} = useGlobalStylesContext();
	const [ canRestart, onReset ] = useGlobalStylesReset();

	if ( typeof contexts !== 'object' || ! contexts?.[ GLOBAL_CONTEXT_NAME ] ) {
		// No sidebar is shown.
		return null;
	}

	return (
		<DefaultSidebar
			className="edit-site-global-styles-sidebar"
			identifier={ identifier }
			title={ title }
			icon={ icon }
			closeLabel={ closeLabel }
			header={
				<>
					<strong>{ title }</strong>
					<Button
						className="edit-site-global-styles-sidebar__reset-button"
						isSmall
						isTertiary
						disabled={ ! canRestart }
						onClick={ onReset }
					>
						{ __( 'Reset to defaults' ) }
					</Button>
				</>
			}
		>
			<TabPanel
				tabs={ [
					{ name: 'global', title: __( 'Global' ) },
					{ name: 'block', title: __( 'By Block Type' ) },
				] }
			>
				{ ( tab ) => {
					/* Per Block Context */
					if ( 'block' === tab.name ) {
						return (
							<GlobalStylesBlockPanels
								contexts={ contexts }
								getStyleProperty={ getStyleProperty }
								setStyleProperty={ setStyleProperty }
								getSetting={ getSetting }
								setSetting={ setSetting }
							/>
						);
					}
					return (
						<GlobalStylesPanel
							hasWrapper={ false }
							context={ {
								...contexts[ GLOBAL_CONTEXT_NAME ],
								name: GLOBAL_CONTEXT_NAME,
							} }
							getStyleProperty={ getStyleProperty }
							setStyleProperty={ setStyleProperty }
							getSetting={ getSetting }
							setSetting={ setSetting }
						/>
					);
				} }
			</TabPanel>
		</DefaultSidebar>
	);
}
