import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from '../Dropdown';

const options = [
  { name: 'Yellow', value: 'yellow' },
  { name: 'Blue', value: 'blue' },
  { name: 'White', value: 'white' },
  { name: 'Red', value: 'red' },
  { name: 'Magenta', value: 'magenta' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Dark Red', value: 'darkred' },
  { name: 'Grey', value: 'grey' },
  { name: 'Orange', value: 'orange' },
  { name: 'Purple', value: 'purple' },
  { name: 'Green', value: 'green' },
  { name: 'Black', value: 'black' },
];

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown/Examples',
  component: Dropdown,
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    searchEnabled: { control: 'boolean' },
    sortEnabled: { control: 'boolean' },
    sortOrder: { control: { type: 'select', options: ['asc', 'desc'] } },
    loading: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    multiple: { control: 'boolean' },
    maxSelectionLimit: { control: 'number' },
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const SingleSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState<any>(null);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          {...args}
          options={options}
          value={value}
          onSelectionChange={setValue}
          placeholder="Select a color"
        />
      </div>
    );
  },
  args: {
    disabled: false,
    readOnly: false,
    searchEnabled: false,
    sortEnabled: true,
    sortOrder: 'asc',
  },
};

export const SingleSelectReadOnly: Story = {
  render: () => {
    const [value] = useState(options[0]);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown options={options} value={value} readOnly placeholder="Select a color" />
      </div>
    );
  },
};

export const SingleSelectDisabled: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <Dropdown options={options} disabled placeholder="Select a color" />
    </div>
  ),
};

export const MultiSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState<any[]>([]);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          {...args}
          options={options}
          value={value}
          multiple
          onSelectionChange={(v) => setValue(Array.isArray(v) ? v : [])}
          placeholder="Select colors"
        />
      </div>
    );
  },
  args: {
    searchEnabled: false,
    showFooter: false,
    maxSelectionLimit: 10,
  },
};

export const ReactiveForm: Story = {
  render: () => {
    const [value, setValue] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    return (
      <div style={{ width: '300px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <Dropdown
            options={options}
            value={value}
            required
            onSelectionChange={setValue}
            placeholder="Select a color (required)"
          />
          <button type="submit" style={{ marginTop: '1rem' }}>
            Submit
          </button>
        </form>
        {submitted && <p>Selected: {value ? value.name : 'none'}</p>}
      </div>
    );
  },
};

export const CustomSearch: Story = {
  render: () => {
    const [value, setValue] = useState<any>(null);
    const searchFunction = (opt: any, q: string) =>
      opt.name.toLowerCase().startsWith(q.toLowerCase());
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          options={options}
          value={value}
          searchEnabled
          onSelectionChange={setValue}
          placeholder="Search (starts-with only)"
        />
      </div>
    );
  },
};

export const MultiSelectWithCategories: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>([]);
    const categorized = [
      { name: 'Warm colors', value: 'group-warm', group: true },
      { name: 'Yellow', value: 'yellow' },
      { name: 'Red', value: 'red' },
      { name: 'Orange', value: 'orange' },
      { name: 'Cool colors', value: 'group-cool', group: true },
      { name: 'Blue', value: 'blue' },
      { name: 'Cyan', value: 'cyan' },
      { name: 'Green', value: 'green' },
    ];
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          options={categorized}
          value={value}
          multiple
          onSelectionChange={(v) => setValue(Array.isArray(v) ? v : [])}
          placeholder="Select colors"
        />
      </div>
    );
  },
};

export const MultipleSelectCustomTemplate: Story = {
  render: () => {
    const [value, setValue] = useState<any[]>([]);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          options={options}
          value={value}
          multiple
          onSelectionChange={(v) => setValue(Array.isArray(v) ? v : [])}
          placeholder="Select colors"
          optionTemplate={(opt) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  background: opt.value,
                  border: '1px solid #ccc',
                }}
              />
              {opt.name}
            </span>
          )}
        />
      </div>
    );
  },
};

export const ExternalSearch: Story = {
  render: () => {
    const [value, setValue] = useState<any>(null);
    const [opts, setOpts] = useState(options.slice(0, 3));
    const [loading, setLoading] = useState(false);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          options={opts}
          value={value}
          searchEnabled
          loading={loading}
          externalSearchOptions={{ enabled: true, keyStrokeDelay: 500, resultsCount: opts.length }}
          onExternalSearch={({ searchQuery }) => {
            setLoading(true);
            setTimeout(() => {
              setOpts(
                options.filter((o) =>
                  o.name.toLowerCase().includes((searchQuery as string).toLowerCase())
                )
              );
              setLoading(false);
            }, 500);
          }}
          onSelectionChange={setValue}
          placeholder="Search (external)"
        />
      </div>
    );
  },
};

export const SingleSelectSort: Story = {
  render: (args) => {
    const [value, setValue] = useState<any>(null);
    return (
      <div style={{ width: '300px' }}>
        <Dropdown
          {...args}
          options={options}
          value={value}
          onSelectionChange={setValue}
          placeholder="Sorted dropdown"
          sortEnabled
          sortKey="name"
          sortOrder="asc"
        />
      </div>
    );
  },
  args: {
    sortOrder: "desc",
    id: "mlkm"
  },
};
