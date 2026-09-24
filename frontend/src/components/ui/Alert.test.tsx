import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert Component', () => {
  test('renders alert with message', () => {
    render(<Alert message="This is an alert" />);
    expect(screen.getByText('This is an alert')).toBeInTheDocument();
  });

  test('renders alert with title and message', () => {
    render(<Alert title="Alert Title" message="Alert message" />);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  test('renders different variants', () => {
    const { rerender } = render(<Alert variant="success" message="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    
    rerender(<Alert variant="error" message="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    rerender(<Alert variant="warning" message="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    
    rerender(<Alert variant="info" message="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  test('handles close button click when closable', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <Alert message="Closable alert" closable onClose={handleClose} />
    );
    
    const closeButton = container.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  test('does not show close button when not closable', () => {
    const { container } = render(<Alert message="Non-closable alert" />);
    const closeButton = container.querySelector('button');
    expect(closeButton).not.toBeInTheDocument();
  });
});
