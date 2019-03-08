URLPopover
===========

URLPopover is a presentational React component used to render a popover used for editing and viewing a url.

## Setup

The component will be rendered adjacent to its parent.

```jsx
import { Fragment } from '@wordpress/elements';
import { ToggleControl, IconButton, Button } from '@wordpress/components';
import { URLPopover } from '@wordpress/block-editor';

class MyURLPopover extends Component {
	constructor() {
		super( ...arguments );

		this.onChangeURL = this.onChangeURL.bind( this );
		this.openURLPopover = this.closeURLPopover.bind( this );
		this.closeURLPopover = this.closeURLPopover.bind( this );
		this.submitURL = this.submitURL.bind( this );
		this.setTarget = this.setTarget.bind( this );

		this.state = {
			isVisible: false,
		};
	}

	onChangeURL( url ) {
		this.setState( { url } );
	}

	openURLPopover() {
		this.setState( {
			isVisible: true,
		} );
	}

	closeURLPopover() {
		this.setState( {
			isVisible: false,
		} );
	}

	submitURL() {
		// Not shown: Store the updated url.

		this.closeURLPopover();
	}

	setTarget() {
		// Not shown: Store the updated 'opensInNewWindow' setting.
	}

	render() {
		const { opensInNewWindow } = this.props;
		const { url, isVisible, isEditing } = this.state;

		return (
			<Fragment>
				<Button onClick={ this.openURLPopover }>Edit URL</Button>
				{ isVisible && (
					<URLPopover
						onClose={ this.closeURLPopover }
						renderSettings={ () => (
							<ToggleControl
								label={ __( 'Open in New Tab' ) }
								checked={ opensInNewWindow }
								onChange={ this.setTarget }
							/>
						) }
					>
						<form onSubmit={ this.submitURL }>
							<input type="url" value={ url } onChange={ this.onChangeURL } />
							<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
						</form>
					</URLPopover>
				) }
			</Fragment>
		);
	}
}
```

## Props

The component accepts the following props.

### position

Where the Popover should be positioned relative to its parent. Defaults to "bottom center".

- Type: `String`
- Required: No
- Default: "bottom center"

### focusOnMount

Provides control over which element is focused when the URLPopover mounts. Pass `false` to avoid focusing
an element.

- Type: `String`
- Required: No
- Default: "firstElement"

### onClose

Callback that triggers when the user indicates the popover should close (e.g. they've used the escape key or clicked
outside of the popover.)

- Type: `Function`
- Required: No

### renderSettings

Callback used to return the React Elements that will be rendered inside the settings drawer. When this function
is provided, a toggle button will be rendered in the popover that allows the user to open and close the settings
drawer.

- Type: `Function`
- Required: No
