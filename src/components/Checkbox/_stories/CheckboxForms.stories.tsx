/**
 * Checkbox forms stories — controlled-component equivalent of Angular's ReactiveFormsModule.
 * Converted from: checkbox-reactive-forms.stories.ts
 *
 * Angular used FormGroup + formControlName. React equivalent uses useState (controlled pattern).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Checkbox } from '../Checkbox';

const meta: Meta = {
  title: 'Components/Checkbox/Examples',
};
export default meta;

const CheckboxWithControlledState = () => {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <main>
      <h1 className="sol-screenreader-only">Checkbox with controlled state</h1>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={e => {
          setChecked(e.checked);
          action('checked')(e);
        }}
        onIndeterminateChange={action('indeterminate')}
      >
        Checkbox in a controlled form
      </Checkbox>
      <button
        onClick={() => setDisabled(d => !d)}
        style={{ margin: '16px 0', display: 'block' }}
      >
        Toggle disabled state
      </button>
      <p>
        Variable in component: <strong>{String(checked)}</strong>
      </p>
    </main>
  );
};

export const CheckboxWithReactiveForm: StoryObj = {
  name: 'CheckboxWithReactiveForm',
  render: () => <CheckboxWithControlledState />,
};
