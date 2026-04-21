<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, useId, useTemplateRef } from 'vue';

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

const props = withDefaults(defineProps<TextAreaProps>(), {
  modelValue: '',
  placeholder: '',
  autocomplete: 'off',
  hideCharacterCounter: false,
  id: '',
  disabled: false,
  required: false,
  readonly: false,
  resizeTextarea: false,
  fontSize: 'small',
  wrap: 'on',
  ariaLabel: '',
  ariaLabelledby: null,
  errorState: false,
  preventEnterKey: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  valueChange: [value: string];
}>();

const uid = useId();
const textAreaEl = useTemplateRef<HTMLTextAreaElement>('textArea');
const numberOfLines = ref<number | undefined>(props.maxRows);
let intersectionObserver: IntersectionObserver | undefined;

const currentId = computed(() => props.id || uid);
const counterId = computed(() => 'text-counter-' + currentId.value);
const showCounter = computed(() => typeof props.maxLength === 'number' && props.maxLength > 0 && !props.readonly);
const ariaDescribedBy = computed(() => (showCounter.value ? counterId.value : null));
const internalAriaLabel = computed(() => props.label ?? null);
const effectiveAriaLabel = computed(() => props.ariaLabel || internalAriaLabel.value || null);
const textareaFontSizeClass = computed(() => 'font-size-' + props.fontSize);
const currentLength = computed(() => (props.modelValue ?? '').length);

const hideScroll = computed(() => {
  if (props.maxRows && numberOfLines.value) return numberOfLines.value <= props.maxRows;
  return true;
});

const resizeStyle = computed(() => {
  if (!props.resizeTextarea) return {};
  const minW = (props.cols ?? 0) > 0 ? props.cols + 'ch' : '12rem';
  return { '--sol-text-area-min-width': minW };
});

function getNumberOfLines(textarea: HTMLTextAreaElement): number {
  const style = window.getComputedStyle(textarea);
  const lineHeight = parseInt(style.lineHeight, 10);
  const padding = parseInt(style.paddingTop, 10) + parseInt(style.paddingBottom, 10);
  return Math.round((textarea.scrollHeight - padding) / lineHeight);
}

function onInput(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  numberOfLines.value = getNumberOfLines(textarea);
  emit('update:modelValue', textarea.value);
  emit('valueChange', textarea.value);
}

function onChange(event: Event) {
  event.stopPropagation();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && props.preventEnterKey) {
    event.preventDefault();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    textAreaEl.value?.blur();
  }
}

onMounted(() => {
  const el = textAreaEl.value;
  if (el) {
    intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { entry.isIntersecting; });
    });
    intersectionObserver.observe(el);
  }
});

onUnmounted(() => {
  const el = textAreaEl.value;
  if (intersectionObserver && el) {
    intersectionObserver.unobserve(el);
    intersectionObserver.disconnect();
  }
});
</script>

<template>
  <div
    class="sol-text-area"
    :class="{ 'is-resizable': resizeTextarea }"
    :style="resizeStyle"
  >
    <div class="sol-input-label-area">
      <label v-if="label" :for="currentId" class="sol-label">
        {{ label }}
        <span v-if="labelHelpText" class="sol-label-help-text">{{ labelHelpText }}</span>
        <span v-if="required" class="sol-label-required" aria-hidden="true">*</span>
      </label>
      <div
        v-if="showCounter && !hideCharacterCounter"
        :id="counterId"
        class="sol-text-counter-text"
        aria-live="polite"
      >
        {{ currentLength }}/{{ maxLength }}
      </div>
    </div>

    <div class="sol-input-container" :class="{ 'error-border': errorState }">
      <textarea
        ref="textArea"
        :id="currentId"
        :name="name"
        :class="[
          'sol-input',
          'body-md',
          textareaFontSizeClass,
          { 'resize-textarea': resizeTextarea, 'hide-scroll': hideScroll, 'wrap-off': wrap === 'off' }
        ]"
        :value="modelValue"
        :placeholder="placeholder"
        :cols="cols"
        :rows="minRows"
        :minlength="minLength"
        :maxlength="showCounter ? maxLength : undefined"
        :autocomplete="autocomplete"
        :wrap="wrap"
        :disabled="disabled || undefined"
        :required="required || undefined"
        :readonly="readonly || undefined"
        :aria-label="effectiveAriaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedBy"
        @input="onInput"
        @change="onChange"
        @keydown="onKeydown"
      />
    </div>

    <div v-if="errorState && errorMessage" class="sol-error-message" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="infoMessage" class="sol-info-message">
      {{ infoMessage }}
    </div>
  </div>
</template>

<style>
:global(.sol-text-area) {
  display: block;
  line-height: normal;
}

:global(.sol-text-area .sol-input-container) {
  height: auto;
  padding: var(--sol-size-spacing-xs);
}

:global(.sol-text-area.is-resizable) {
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  min-width: var(--sol-text-area-min-width, 12rem);
}

:global(.sol-text-area.is-resizable .sol-input-container) {
  width: fit-content;
  min-width: var(--sol-text-area-min-width, 12rem);
  max-width: none;
}

:global(.sol-text-area .sol-input) {
  width: 100%;
  min-width: var(--sol-text-area-min-width, 12rem);
  max-width: 50rem;
  background-color: transparent;
  border: none;
  min-height: calc(var(--sol-typography-body-md-line-height) * 1.5);
  resize: none;
}

:global(.sol-text-area .sol-input::placeholder) {
  color: var(--sol-color-text-placeholder);
}

:global(.sol-text-area .sol-input.resize-textarea) {
  resize: both;
}

:global(.sol-text-area.is-resizable .sol-input.resize-textarea) {
  width: var(--sol-text-area-min-width, 12rem);
  min-width: var(--sol-text-area-min-width, 12rem);
  max-width: none;
}

:global(.sol-text-area .sol-input:hover),
:global(.sol-text-area .sol-input:active) {
  border: none;
}

:global(.sol-text-area .sol-input:focus-within),
:global(.sol-text-area .sol-input:focus-visible) {
  outline: none;
}

:global(.sol-text-area .sol-input:read-only),
:global(.sol-text-area .sol-input:disabled) {
  border: none;
  background: none;
}
</style>
