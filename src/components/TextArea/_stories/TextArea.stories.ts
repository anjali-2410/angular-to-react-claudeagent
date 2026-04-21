import TextArea from '../TextArea.vue';
import type { TextAreaProps } from '../TextArea.types';

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

const storyTemplate = (args: Partial<TextAreaProps>) => ({
  components: { TextArea },
  setup: () => ({ args }),
  template: `
    <main>
      <h1 class="sol-screenreader-only">Text Area</h1>
      <div style="max-width: 310px">
        <TextArea v-bind="args" />
      </div>
    </main>
  `,
});

export default {
  title: 'Components/Textarea/Examples',
  component: TextArea,
  argTypes: {
    modelValue: { control: 'text', description: 'The current value (v-model)' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    label: { control: 'text', description: 'Label text' },
    labelHelpText: { control: 'text', description: 'Help text alongside the label' },
    disabled: { control: 'boolean', description: 'Disables the textarea' },
    readonly: { control: 'boolean', description: 'Makes the textarea read-only' },
    required: { control: 'boolean', description: 'Marks as required' },
    errorState: { control: 'boolean', description: 'Error state' },
    errorMessage: { control: 'text', description: 'Error message' },
    maxLength: { control: 'number', description: 'Max character length — shows counter' },
    minRows: { control: 'number', description: 'Minimum visible rows' },
    cols: { control: 'number', description: 'Number of columns' },
    resizeTextarea: { control: 'boolean', description: 'Allow user resizing' },
    preventEnterKey: { control: 'boolean', description: 'Prevent Enter key new lines' },
    infoMessage: { control: 'text', description: 'Info message below textarea' },
  },
};

export const WithValue = {
  args: { ...defaultArgs },
  render: (args: Partial<TextAreaProps>) => storyTemplate(args),
};

export const withErrorMessage = {
  args: {
    ...defaultArgs,
    errorState: true,
    errorMessage: 'This is CUSTOM error message',
  },
  render: (args: Partial<TextAreaProps>) => storyTemplate(args),
};
