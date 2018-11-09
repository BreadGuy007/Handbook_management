/**
 * External dependencies
 */
import uuid from 'uuid/v4';

/**
 * Adds an annotation to a block.
 *
 * The `block` attribute refers to a block ID that needs to be annotated.
 * `isBlockAnnotation` controls whether or not the annotation is a block
 * annotation. The `source` is the source of the annotation, this will be used
 * to identity groups of annotations.
 *
 * The `range` property is only relevant if the selector is 'range'.
 *
 * @param {Object} annotation         The annotation to add.
 * @param {string} blockClientId      The blockClientId to add the annotation to.
 * @param {string} richTextIdentifier Identifier for the RichText instance the annotation applies to.
 * @param {Object} range              The range at which to apply this annotation.
 * @param {number} range.start        The offset where the annotation should start.
 * @param {number} range.end          The offset where the annotation should end.
 * @param {string} [selector="range"] The way to apply this annotation.
 * @param {string} [source="default"] The source that added the annotation.
 * @param {string} [id=uuid()]        The ID the annotation should have.
 *                                    Generates a UUID by default.
 *
 * @return {Object} Action object.
 */
export function __experimentalAddAnnotation( { blockClientId, richTextIdentifier = null, range = null, selector = 'range', source = 'default', id = uuid() } ) {
	const action = {
		type: 'ANNOTATION_ADD',
		id,
		blockClientId,
		richTextIdentifier,
		source,
		selector,
	};

	if ( selector === 'range' ) {
		action.range = range;
	}

	return action;
}

/**
 * Removes an annotation with a specific ID.
 *
 * @param {string} annotationId The annotation to remove.
 *
 * @return {Object} Action object.
 */
export function __experimentalRemoveAnnotation( annotationId ) {
	return {
		type: 'ANNOTATION_REMOVE',
		annotationId,
	};
}

/**
 * Removes all annotations of a specific source.
 *
 * @param {string} source The source to remove.
 *
 * @return {Object} Action object.
 */
export function __experimentalRemoveAnnotationsBySource( source ) {
	return {
		type: 'ANNOTATION_REMOVE_SOURCE',
		source,
	};
}
