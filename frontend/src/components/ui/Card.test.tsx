import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  test('renders card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  test('renders card with footer', () => {
    const footer = <div>Footer content</div>;
    render(<Card footer={footer}>Content</Card>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  test('renders different variants', () => {
    const { container, rerender } = render(
      <Card variant="default">Default</Card>
    );
    expect(container.firstChild).toBeInTheDocument();
    
    rerender(<Card variant="bordered">Bordered</Card>);
    expect(screen.getByText('Bordered')).toBeInTheDocument();
    
    rerender(<Card variant="elevated">Elevated</Card>);
    expect(screen.getByText('Elevated')).toBeInTheDocument();
  });

  test('renders with different colors', () => {
    const { rerender } = render(<Card color="income">Income</Card>);
    expect(screen.getByText('Income')).toBeInTheDocument();
    
    rerender(<Card color="property">Property</Card>);
    expect(screen.getByText('Property')).toBeInTheDocument();
  });
});
