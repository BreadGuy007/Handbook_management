/* CSS properties */
export const FONT_SIZE = 'font-size';
export const LINK_COLOR = '--wp--style--color--link';
export const BACKGROUND_COLOR = 'background-color';
export const GRADIENT_COLOR = 'background';
export const TEXT_COLOR = 'color';
export const LINE_HEIGHT = 'line-height';

/* Supporting data */
export const GLOBAL_CONTEXT = 'global';
export const PRESET_CATEGORIES = [ 'color', 'font-size', 'gradient' ];
export const STYLE_PROPS = {
	[ FONT_SIZE ]: 'typography.fontSize',
	[ LINE_HEIGHT ]: 'typography.lineHeight',
	[ TEXT_COLOR ]: 'color.text',
	[ BACKGROUND_COLOR ]: 'color.background',
	[ GRADIENT_COLOR ]: 'color.gradient',
	[ LINK_COLOR ]: 'color.link',
};
export const LINK_COLOR_DECLARATION = `a { color: var(${ LINK_COLOR }, #00e); }`;

/* Helpers for unit processing */
export const fromPx = ( value ) => {
	switch ( typeof value ) {
		case 'string':
			return +value.replace( 'px', '' );
		case 'number':
		default:
			return value;
	}
};

export const toPx = ( value ) => ( value ? value + 'px' : value );
