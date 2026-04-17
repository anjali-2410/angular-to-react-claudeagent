import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from '../Dropdown';

const taskStatusOptions = [
  { name: 'New', value: 'new' },
  { name: 'To Do', value: 'to-do' },
  { name: 'In Progress', value: 'in-progress' },
  { name: 'In Review', value: 'in-review' },
  { name: 'Done', value: 'done' },
];

const priorityOptions = [
  { name: 'P1', value: 'p1' },
  { name: 'P2', value: 'p2' },
  { name: 'P3', value: 'p3' },
  { name: 'P4', value: 'p4' },
];

const colorOptions = [
  { name: 'Yellow', value: 'yellow' },
  { name: 'Blue', value: 'blue' },
  { name: 'White', value: 'white' },
  { name: 'Red', value: 'red' },
];

const meta: Meta = {
  title: 'Forms/Examples',
};
export default meta;

export const TemplateForm: StoryObj = {
  render: () => {
    const [status, setStatus] = useState<any>(null);
    const [priority, setPriority] = useState<any>(null);
    const [color, setColor] = useState<any>(null);

    return (
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <h3>Template Form</h3>

        <label>Status</label>
        <Dropdown
          options={taskStatusOptions}
          value={status}
          onSelectionChange={setStatus}
          placeholder="Select status"
        />

        <label>Priority</label>
        <Dropdown
          options={priorityOptions}
          value={priority}
          onSelectionChange={setPriority}
          placeholder="Select priority"
        />

        <label>Color</label>
        <Dropdown
          options={colorOptions}
          value={color}
          onSelectionChange={setColor}
          placeholder="Select color"
        />

        <button type="submit">Submit</button>
      </form>
    );
  },
};

export const ReactiveForm: StoryObj = {
  render: () => {
    const [status, setStatus] = useState<any>(null);
    const [priority, setPriority] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
      const errs: Record<string, string> = {};
      if (!status) errs.status = 'Status is required';
      if (!priority) errs.priority = 'Priority is required';
      return errs;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) setSubmitted(true);
    };

    return (
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}
      >
        <h3>Reactive Form</h3>

        <label>Status *</label>
        <Dropdown
          options={taskStatusOptions}
          value={status}
          onSelectionChange={setStatus}
          placeholder="Select status"
          required
        />
        {errors.status && <span style={{ color: 'red' }}>{errors.status}</span>}

        <label>Priority *</label>
        <Dropdown
          options={priorityOptions}
          value={priority}
          onSelectionChange={setPriority}
          placeholder="Select priority"
          required
        />
        {errors.priority && <span style={{ color: 'red' }}>{errors.priority}</span>}

        <button type="submit">Submit</button>
        {submitted && (
          <p style={{ color: 'green' }}>
            Submitted: {status?.name} / {priority?.name}
          </p>
        )}
      </form>
    );
  },
};

export const DynamicForm: StoryObj = {
  render: () => {
    const [fields, setFields] = useState([{ id: 1, value: null as any }]);

    const addField = () =>
      setFields((f) => [...f, { id: Date.now(), value: null }]);

    const updateField = (id: number, value: any) =>
      setFields((f) => f.map((field) => (field.id === id ? { ...field, value } : field)));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <h3>Dynamic Form</h3>
        {fields.map((field) => (
          <div key={field.id}>
            <label>Color {field.id}</label>
            <Dropdown
              options={colorOptions}
              value={field.value}
              onSelectionChange={(v) => updateField(field.id, v)}
              placeholder="Select color"
            />
          </div>
        ))}
        <button type="button" onClick={addField}>
          Add field
        </button>
      </div>
    );
  },
};
