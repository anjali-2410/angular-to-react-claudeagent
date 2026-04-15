/**
 * CheckboxGroup forms stories.
 * Converted from: checkbox-group-forms.stories.ts
 *
 * Angular used ReactiveFormsModule (FormGroup + formControlName) and template-driven forms
 * (ngModel). React equivalents use useState with the controlled component pattern.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

const meta: Meta = {
  title: 'Components/Checkbox Group/Examples',
};
export default meta;

// ── reactiveForms ─────────────────────────────────────────────────────────────
// Angular: CheckboxGroup with formControlName + Validators.required (pre-selected: email, push)
// React:   controlled CheckboxGroup with useState

const CheckboxGroupControlledStory = () => {
  const [selected, setSelected] = useState<string[]>(['email', 'push']);

  return (
    <main>
      <h1 className="sol-screenreader-only">Checkbox Group in controlled state</h1>
      <CheckboxGroup
        name="preferences"
        label="Choose your preferences"
        value={selected}
        onClicked={vals => {
          setSelected(vals);
          action('click event triggered')(vals);
        }}
      >
        <Checkbox value="email">Email notifications</Checkbox>
        <Checkbox value="sms">SMS notifications</Checkbox>
        <Checkbox value="push">Push notifications</Checkbox>
      </CheckboxGroup>
      <br />
      <p>
        Selected options: <strong>{JSON.stringify(selected)}</strong>
      </p>
    </main>
  );
};

export const reactiveForms: StoryObj = {
  name: 'reactiveForms',
  render: () => <CheckboxGroupControlledStory />,
};

// ── templateFormWithOptions ───────────────────────────────────────────────────
// Angular: CheckboxGroup with [(ngModel)] + required + form submission button
// React:   controlled CheckboxGroup with useState + inline form validation

interface TemplateFormProps {
  disabled: boolean;
}

const CheckboxGroupFormValidationStory = ({ disabled }: TemplateFormProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['option2']);
  const isValid = selectedOptions.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      action('form submitted')(selectedOptions);
    }
  };

  return (
    <main>
      <h1 className="sol-screenreader-only">Checkbox Group with validation</h1>
      <form onSubmit={handleSubmit}>
        <CheckboxGroup
          name="options"
          label="Select at least one option (required)"
          required
          disabled={disabled}
          value={selectedOptions}
          onClicked={vals => {
            setSelectedOptions(vals);
            action('click event triggered')(vals);
          }}
        >
          <Checkbox value="option1">Option 1</Checkbox>
          <Checkbox value="option2">Option 2</Checkbox>
          <Checkbox value="option3">Option 3</Checkbox>
        </CheckboxGroup>
        <br />
        <button type="submit" disabled={!isValid}>
          Submit
        </button>
        <br />
        <br />
        <div>
          Form valid: {String(isValid)}
          <br />
          Selected options: {JSON.stringify(selectedOptions)}
        </div>
      </form>
    </main>
  );
};

export const templateFormWithOptions: StoryObj<TemplateFormProps> = {
  name: 'templateFormWithOptions',
  args: { disabled: false },
  argTypes: { disabled: { control: 'boolean' } },
  render: args => <CheckboxGroupFormValidationStory disabled={args.disabled ?? false} />,
};
