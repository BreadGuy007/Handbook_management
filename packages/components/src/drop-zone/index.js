/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useContext, useEffect, useState, useRef } from '@wordpress/element';
import { upload, Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Context } from './provider';

export function useDropZone( {
	element,
	onFilesDrop,
	onHTMLDrop,
	onDrop,
	isDisabled,
	withPosition,
	__unstableIsRelative: isRelative = false,
} ) {
	const dropZones = useContext( Context );
	const [ state, setState ] = useState( {
		isDraggingOverDocument: false,
		isDraggingOverElement: false,
		type: null,
	} );

	useEffect( () => {
		if ( ! isDisabled ) {
			const dropZone = {
				element,
				onDrop,
				onFilesDrop,
				onHTMLDrop,
				setState,
				withPosition,
				isRelative,
			};
			dropZones.add( dropZone );
			return () => {
				dropZones.delete( dropZone );
			};
		}
	}, [
		isDisabled,
		onDrop,
		onFilesDrop,
		onHTMLDrop,
		withPosition,
		isRelative,
	] );

	return state;
}

export default function DropZoneComponent( {
	className,
	label,
	onFilesDrop,
	onHTMLDrop,
	onDrop,
} ) {
	const element = useRef();
	const { isDraggingOverDocument, isDraggingOverElement, type } = useDropZone(
		{
			element,
			onFilesDrop,
			onHTMLDrop,
			onDrop,
			__unstableIsRelative: true,
		}
	);

	let children;

	if ( isDraggingOverElement ) {
		children = (
			<div className="components-drop-zone__content">
				<Icon
					icon={ upload }
					className="components-drop-zone__content-icon"
				/>
				<span className="components-drop-zone__content-text">
					{ label ? label : __( 'Drop files to upload' ) }
				</span>
			</div>
		);
	}

	const classes = classnames( 'components-drop-zone', className, {
		'is-active':
			( isDraggingOverDocument || isDraggingOverElement ) &&
			( ( type === 'file' && onFilesDrop ) ||
				( type === 'html' && onHTMLDrop ) ||
				( type === 'default' && onDrop ) ),
		'is-dragging-over-document': isDraggingOverDocument,
		'is-dragging-over-element': isDraggingOverElement,
		[ `is-dragging-${ type }` ]: !! type,
	} );

	return (
		<div ref={ element } className={ classes }>
			{ children }
		</div>
	);
}
