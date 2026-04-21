import React, { useEffect, useRef } from 'react';
import { createApp, type Component } from 'vue';
import type { Meta, StoryObj } from '@storybook/react';
import TextAreaVue from '../TextArea.vue';
import type { TextAreaProps } from '../TextArea.types';

// Mounts a Vue SFC inside a React Storybook story.
// Re-mounts whenever props change (JSON key comparison).
function VueWrapper({ component, props }: Readonly<{ component: Component; props: Record<string, unknown> }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsKey = JSON.stringify(props);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    const mountEl = document.createElement('div');
    el.appendChild(mountEl);
    const app = createApp(component, props);
    app.mount(mountEl);
    return () => app.unmount();
  }, [propsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} />;
}

function TextAreaStory(args: Partial<TextAreaProps>) {
  return (
    <div style={{ maxWidth: '310px' }}>
      <VueWrapper component={TextAreaVue} props={args as Record<string, unknown>} />
    </div>
  );
}

const defaultArgs: Partial<TextAreaProps> = {
  id: '',
  modelValue: '',
  placeholder: 'Enter text here',
  minRows: 2,
  cols: 30,
  label: 'Label',
  labelHelpText: 'This is help text for the label',
  readonly: false,
  disabled: false,
  errorState: false,
  required: false,
  maxLength: 0,
  infoMessage: '',
  resizeTextarea: false,
  preventEnterKey: false,
};

const meta: Meta<typeof TextAreaStory> = {
  title: 'Components/Textarea/Examples',
  component: TextAreaStory,
  argTypes: {
    modelValue:       { control: 'text',    description: 'Current value (v-model)' },
    placeholder:      { control: 'text',    description: 'Placeholder text' },
    label:            { control: 'text',    description: 'Label text' },
    labelHelpText:    { control: 'text',    description: 'Help text alongside the label' },
    disabled:         { control: 'boolean', description: 'Disables the textarea' },
    readonly:         { control: 'boolean', description: 'Makes the textarea read-only' },
    required:         { control: 'boolean', description: 'Marks as required' },
    errorState:       { control: 'boolean', description: 'Error state' },
    errorMessage:     { control: 'text',    description: 'Error message' },
    maxLength:        { control: 'number',  description: 'Max character length — shows counter' },
    minRows:          { control: 'number',  description: 'Minimum visible rows' },
    cols:             { control: 'number',  description: 'Number of columns' },
    resizeTextarea:   { control: 'boolean', description: 'Allow user resizing' },
    preventEnterKey:  { control: 'boolean', description: 'Prevent Enter key new lines' },
    infoMessage:      { control: 'text',    description: 'Info message below textarea' },
  },
};

export default meta;
type Story = StoryObj<typeof TextAreaStory>;

export const WithValue: Story = {
  args: { ...defaultArgs },
};

export const withErrorMessage: Story = {
  args: {
    ...defaultArgs,
    errorState: true,
    errorMessage: 'This is CUSTOM error message',
  },
};
