import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardBody, CardFooter } from './Card';

const LOREM = 'Lorem Ipsum is simply dummy text.';

describe('Card', () => {
  it('renders without errors', () => {
    render(<Card />);
    expect(document.querySelector('.sol-card')).toBeTruthy();
  });

  describe('body and footer', () => {
    it('renders sol-card-body wrapper when CardBody is provided', () => {
      render(
        <Card>
          <CardBody>{LOREM}</CardBody>
        </Card>
      );
      expect(document.querySelector('.sol-card-body')).toBeTruthy();
      expect(screen.getByText(LOREM)).toBeTruthy();
    });

    it('renders sol-card-footer wrapper when CardFooter is provided', () => {
      render(
        <Card>
          <CardFooter>{LOREM}</CardFooter>
        </Card>
      );
      expect(document.querySelector('.sol-card-footer')).toBeTruthy();
    });

    it('renders both body and footer when both are provided', () => {
      render(
        <Card>
          <CardBody>Body content</CardBody>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(document.querySelector('.sol-card-body')).toBeTruthy();
      expect(document.querySelector('.sol-card-footer')).toBeTruthy();
    });

    it('does not render sol-card-body when CardBody is absent', () => {
      render(<Card />);
      expect(document.querySelector('.sol-card-body')).toBeNull();
    });

    it('does not render sol-card-footer when CardFooter is absent', () => {
      render(
        <Card>
          <CardBody>{LOREM}</CardBody>
        </Card>
      );
      expect(document.querySelector('.sol-card-footer')).toBeNull();
    });
  });

  describe('divider', () => {
    it('adds show-divider class when both body and footer present and divider=true (default)', () => {
      render(
        <Card>
          <CardBody>Body</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(document.querySelector('.sol-card')!.classList).toContain('show-divider');
    });

    it('does NOT add show-divider when divider=false', () => {
      render(
        <Card divider={false}>
          <CardBody>Body</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(document.querySelector('.sol-card')!.classList).not.toContain('show-divider');
    });

    it('does NOT add show-divider when footer is absent', () => {
      render(
        <Card>
          <CardBody>Body</CardBody>
        </Card>
      );
      expect(document.querySelector('.sol-card')!.classList).not.toContain('show-divider');
    });
  });

  describe('hoverable', () => {
    it('adds hoverable class when enableHover=true', () => {
      render(<Card enableHover />);
      expect(document.querySelector('.sol-card')!.classList).toContain('hoverable');
    });

    it('does not add hoverable class by default', () => {
      render(<Card />);
      expect(document.querySelector('.sol-card')!.classList).not.toContain('hoverable');
    });
  });

  describe('alternative background', () => {
    it('adds use-alternate-background-color class when prop is true', () => {
      render(<Card useAlternativeBackgroundColor />);
      expect(document.querySelector('.sol-card')!.classList).toContain('use-alternate-background-color');
    });

    it('does not add use-alternate-background-color class by default', () => {
      render(<Card />);
      expect(document.querySelector('.sol-card')!.classList).not.toContain('use-alternate-background-color');
    });
  });

  describe('accessibility', () => {
    it('sets aria-labelledby when provided', () => {
      render(<Card ariaLabelledby="card-title" />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-labelledby')).toBe('card-title');
    });

    it('sets aria-describedby when provided', () => {
      render(<Card ariaDescribedby="card-desc" />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-describedby')).toBe('card-desc');
    });

    it('sets aria-live when provided', () => {
      render(<Card ariaLive="polite" />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-live')).toBe('polite');
    });

    it('sets aria-selected when selectable=true and selected=true', () => {
      render(<Card selectable selected />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-selected')).toBe('true');
    });

    it('sets aria-selected=false when selectable=true and selected=false', () => {
      render(<Card selectable selected={false} />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-selected')).toBe('false');
    });

    it('does NOT set aria-selected when selectable=false', () => {
      render(<Card selected />);
      expect(document.querySelector('.sol-card')!.getAttribute('aria-selected')).toBeNull();
    });
  });
});

describe('CardBody', () => {
  it('renders its children', () => {
    render(<CardBody>Body text</CardBody>);
    expect(screen.getByText('Body text')).toBeTruthy();
  });
});

describe('CardFooter', () => {
  it('renders its children', () => {
    render(<CardFooter>Footer text</CardFooter>);
    expect(screen.getByText('Footer text')).toBeTruthy();
  });
});
