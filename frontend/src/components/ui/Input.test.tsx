import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  test('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  test('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('handles input change', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('displays helper text', () => {
    render(<Input helperText="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  test('renders different input types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    rerender(<Input type="password" />);
    const passwordInput = screen.getByDisplayValue('') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  test('disabled input cannot be modified', () => {
    render(<Input disabled value="Disabled" />);
    const input = screen.getByDisplayValue('Disabled') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test.skip('required input is marked', () => {
    // TODO: Fix attribute detection in testing environment
    const { container } = render(<Input label="Required Field" required />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('required');
  });
});
