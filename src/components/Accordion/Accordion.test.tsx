import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AccordionGroup } from './Accordion';
import { AccordionItem } from './AccordionItem';

// ── AccordionGroup ────────────────────────────────────────────────────────────

describe('AccordionGroup', () => {
  it('renders without errors', () => {
    render(<AccordionGroup />);
    expect(document.querySelector('.sol-accordion-group')).toBeTruthy();
  });

  it('applies id attribute when provided', () => {
    render(<AccordionGroup id="my-acc" />);
    expect(document.querySelector('#my-acc')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item 1">Content 1</AccordionItem>
        <AccordionItem header="Item 2">Content 2</AccordionItem>
        <AccordionItem header="Item 3">Content 3</AccordionItem>
      </AccordionGroup>
    );
    expect(document.querySelectorAll('.sol-accordion-panel')).toHaveLength(3);
  });

  it('in single mode (default): opening one item closes another', async () => {
    const user = userEvent.setup();
    render(
      <AccordionGroup>
        <AccordionItem header="Item 1" selected>Content 1</AccordionItem>
        <AccordionItem header="Item 2">Content 2</AccordionItem>
      </AccordionGroup>
    );

    const headers = document.querySelectorAll('.sol-accordion-panel-header');
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');

    await user.click(headers[1] as HTMLElement);

    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('in multiple mode: multiple items can be open simultaneously', async () => {
    const user = userEvent.setup();
    render(
      <AccordionGroup multiple>
        <AccordionItem header="Item 1">Content 1</AccordionItem>
        <AccordionItem header="Item 2">Content 2</AccordionItem>
      </AccordionGroup>
    );

    const headers = document.querySelectorAll('.sol-accordion-panel-header');
    await user.click(headers[0] as HTMLElement);
    await user.click(headers[1] as HTMLElement);

    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });
});

// ── AccordionItem ─────────────────────────────────────────────────────────────

describe('AccordionItem', () => {
  it('renders without errors', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Test" />
      </AccordionGroup>
    );
    expect(document.querySelector('.sol-accordion-panel')).toBeTruthy();
  });

  it('shows header text', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Accordion 1">Content</AccordionItem>
      </AccordionGroup>
    );
    expect(screen.getByText('Accordion 1')).toBeTruthy();
  });

  it('is collapsed by default', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item">Content</AccordionItem>
      </AccordionGroup>
    );
    expect(document.querySelector('.sol-accordion-panel-header')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('is initially expanded when selected=true', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item" selected>Content</AccordionItem>
      </AccordionGroup>
    );
    const panel = document.querySelector('.sol-accordion-panel');
    expect(panel!.classList).toContain('expanded');
    expect(document.querySelector('.sol-accordion-panel-header')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('expands on click', async () => {
    const user = userEvent.setup();
    render(
      <AccordionGroup>
        <AccordionItem header="Item">Content</AccordionItem>
      </AccordionGroup>
    );
    const header = document.querySelector('.sol-accordion-panel-header') as HTMLElement;
    await user.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses on second click', async () => {
    const user = userEvent.setup();
    render(
      <AccordionGroup>
        <AccordionItem header="Item" selected>Content</AccordionItem>
      </AccordionGroup>
    );
    const header = document.querySelector('.sol-accordion-panel-header') as HTMLElement;
    await user.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('false');
  });

  it('calls onOpened when opened', async () => {
    const user = userEvent.setup();
    const onOpened = vi.fn();
    render(
      <AccordionGroup>
        <AccordionItem header="Item" onOpened={onOpened}>Content</AccordionItem>
      </AccordionGroup>
    );
    await user.click(document.querySelector('.sol-accordion-panel-header') as HTMLElement);
    expect(onOpened).toHaveBeenCalled();
  });

  it('calls onClosed when closed', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(
      <AccordionGroup>
        <AccordionItem header="Item" selected onClosed={onClosed}>Content</AccordionItem>
      </AccordionGroup>
    );
    await user.click(document.querySelector('.sol-accordion-panel-header') as HTMLElement);
    expect(onClosed).toHaveBeenCalled();
  });

  it('calls onToggle on every click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <AccordionGroup>
        <AccordionItem header="Item" onToggle={onToggle}>Content</AccordionItem>
      </AccordionGroup>
    );
    const header = document.querySelector('.sol-accordion-panel-header') as HTMLElement;
    await user.click(header);
    await user.click(header);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onOpened = vi.fn();
    render(
      <AccordionGroup>
        <AccordionItem header="Item" disabled onOpened={onOpened}>Content</AccordionItem>
      </AccordionGroup>
    );
    await user.click(document.querySelector('.sol-accordion-panel-header') as HTMLElement);
    expect(onOpened).not.toHaveBeenCalled();
  });

  it('applies disabled class and aria-disabled when disabled', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item" disabled>Content</AccordionItem>
      </AccordionGroup>
    );
    expect(document.querySelector('.sol-accordion-panel')!.classList).toContain('disabled');
    expect(
      document.querySelector('.sol-accordion-panel-header')!.getAttribute('aria-disabled')
    ).toBe('true');
  });

  it('renders custom header content', () => {
    render(
      <AccordionGroup>
        <AccordionItem customHeader={<span>Custom Header</span>}>Content</AccordionItem>
      </AccordionGroup>
    );
    expect(screen.getByText('Custom Header')).toBeTruthy();
  });

  it('hides arrow icon when hideToggle=true', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item" hideToggle>Content</AccordionItem>
      </AccordionGroup>
    );
    expect(document.querySelector('.sol-accordion-arrow-icon')).toBeNull();
  });

  it('renders body content when expanded', async () => {
    const user = userEvent.setup();
    render(
      <AccordionGroup>
        <AccordionItem header="Item">Body content here</AccordionItem>
      </AccordionGroup>
    );
    await user.click(document.querySelector('.sol-accordion-panel-header') as HTMLElement);
    expect(screen.getByText('Body content here')).toBeTruthy();
  });

  it('is keyboard accessible — Enter key toggles', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item">Content</AccordionItem>
      </AccordionGroup>
    );
    const header = document.querySelector('.sol-accordion-panel-header') as HTMLElement;
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('is keyboard accessible — Space key toggles', () => {
    render(
      <AccordionGroup>
        <AccordionItem header="Item">Content</AccordionItem>
      </AccordionGroup>
    );
    const header = document.querySelector('.sol-accordion-panel-header') as HTMLElement;
    fireEvent.keyDown(header, { key: ' ' });
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });
});
