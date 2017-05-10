/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';
import Dashicon from 'components/dashicon';

function Placeholder( { icon, children, label, instructions, className, ...additionalProps } ) {
	const classes = classnames( 'components-placeholder', className );

	return (
		<div { ...additionalProps } aria-label={ label } className={ classes }>
			<div className="components-placeholder__label">
				<Dashicon icon={ icon } />
				{ label }
			</div>
			{ !! instructions && <div className="components-placeholder__instructions">{ instructions }</div> }
			<div className="components-placeholder__fieldset">
				{ children }
			</div>
		</div>
	);
}

export default Placeholder;
