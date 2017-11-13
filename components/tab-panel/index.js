/**
 * External dependencies
 */
import { partial, noop, omit } from 'lodash';

/**
 * WordPress dependencies
 */
// import './style.scss';
import { Component } from '@wordpress/element';

/**
 * Internal Dependencies
 */
import { default as withInstanceId } from '../higher-order/with-instance-id';
import { NavigableMenu } from '../navigable-container';

const TabButton = ( { tabId, onClick, children, selected, ...rest } ) => {
	return <button role="tab"
		tabIndex={ selected ? null : -1 }
		aria-selected={ selected }
		id={ tabId }
		onClick={ onClick }
		{ ...rest }
	>
		{ children }
	</button>;
};

class TabPanel extends Component {
	constructor() {
		super( ...arguments );

		this.handleClick = this.handleClick.bind( this );
		this.onNavigate = this.onNavigate.bind( this );

		this.state = {
			selected: this.props.tabs.length > 0 ? this.props.tabs[ 0 ].name : null,
		};
	}

	handleClick( tabKey ) {
		const { onSelect = noop } = this.props;
		this.setState( {
			selected: tabKey,
		} );
		onSelect( tabKey );
	}

	onNavigate( childIndex, child ) {
		child.click();
	}

	render() {
		const { selected } = this.state;
		const { instanceId, tabs, activeClass = 'is-active', className, orientation = 'horizontal' } = this.props;

		const selectedTab = tabs.find( ( t ) => t.name === selected );
		const selectedId = instanceId + '-' + selectedTab.name;

		return (
			<div>
				<NavigableMenu
					role="tablist"
					orientation={ orientation }
					onNavigate={ this.onNavigate }
					className={ className }
				>
					{ tabs.map( ( tab ) =>
						<TabButton className={ `${ tab.className } ${ tab.name === selected ? activeClass : '' }` }
							tabId={ instanceId + '-' + tab.name }
							aria-controls={ instanceId + '-' + tab.name + '-view' }
							selected={ tab.name === selected }
							key={ tab.name }
							onClick={ partial( this.handleClick, tab.name ) }
						>
							{ tab.title }
						</TabButton> )
					}
				</NavigableMenu>
				{
					selectedTab &&
						<div aria-labelledby={ selectedId }
							role="tabpanel"
							id={ selectedId + '-view' }>
							{ this.props.children( selectedTab.name ) }
						</div>
				}
			</div>
		);
	}
}

export default withInstanceId( TabPanel );
