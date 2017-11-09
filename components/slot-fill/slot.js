/**
 * External dependencies
 */
import { noop, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Children, cloneElement } from '@wordpress/element';

class Slot extends Component {
	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
	}

	componentDidMount() {
		const { registerSlot = noop } = this.context;

		registerSlot( this.props.name, this );
	}

	componentWillUnmount() {
		const { unregisterSlot = noop } = this.context;

		unregisterSlot( this.props.name, this );
	}

	componentWillReceiveProps( nextProps ) {
		const { name } = nextProps;
		const {
			unregisterSlot = noop,
			registerSlot = noop,
		} = this.context;

		if ( this.props.name !== name ) {
			unregisterSlot( this.props.name );
			registerSlot( name, this );
		}
	}

	bindNode( node ) {
		this.node = node;
	}

	render() {
		const { name, bubblesVirtually = false } = this.props;
		const { getFills = noop } = this.context;

		if ( bubblesVirtually ) {
			return <div ref={ this.bindNode } />;
		}

		return (
			<div ref={ this.bindNode }>
				{ map( getFills( name ), ( fill ) => {
					const fillKey = fill.props.instanceId;
					return Children.map( fill.props.children, ( child, childIndex ) => {
						const childKey = fillKey + '---' + ( child.props.key || childIndex );
						return cloneElement( child, { key: childKey } );
					} );
				} ) }
			</div>
		);
	}
}

Slot.contextTypes = {
	registerSlot: noop,
	unregisterSlot: noop,
	getFills: noop,
};

export default Slot;
