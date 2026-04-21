export interface TextAreaProps {
  modelValue?: string;
  placeholder?: string;
  name?: string;
  cols?: number;
  minLength?: number;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  autocomplete?: string;
  hideCharacterCounter?: boolean;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  resizeTextarea?: boolean;
  fontSize?: 'small' | 'large';
  wrap?: string;
  ariaLabel?: string;
  ariaLabelledby?: string | null;
  errorState?: boolean;
  preventEnterKey?: boolean;
  label?: string;
  labelHelpText?: string;
  errorMessage?: string;
  infoMessage?: string;
}
