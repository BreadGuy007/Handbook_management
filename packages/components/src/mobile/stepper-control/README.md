# StepperControl

`StepperControl` shows a stepper control to change a value wrapped in a `StepperCell` component.

## Usage

Usage example

```jsx
import { StepperControl } from '@wordpress/components';
import { more } from '@wordpress/icons';

function Stepper( { onChange, value } ) {
	return (
		<StepperControl
			icon={ more }
			label="Columns"
			max={ 8 }
			min={ 1 }
			onChange={ onChange }
			value={ value }
		/>
	);
}
```

## Props

### max 

Maximum value of the stepper.

-   Type: `Number`
-   Required: Yes
-   Platform: Mobile

### min 

Minimum value of the stepper.

-   Type: `Number`
-   Required: Yes
-   Platform: Mobile

### step

Step increment value.

-   Type: `Number`
-   Required: No
-   Platform: Mobile

### value

Current value of the stepper.

-   Type: `Number`
-   Required: Yes
-   Platform: Mobile

### onChange

Callback called when the value has changed

-   Type: `Function`
-   Required: Yes
-   Platform: Mobile

The argument of the callback is the updated value as a `Number`.
