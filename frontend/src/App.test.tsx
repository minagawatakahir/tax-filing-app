import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 確定申告アシスタント header', () => {
  render(<App />);
  const headerElement = screen.getAllByText(/確定申告アシスタント/i)[0];
  expect(headerElement).toBeInTheDocument();
});

test('renders dashboard by default', () => {
  render(<App />);
  expect(screen.getByText(/ダッシュボード/i)).toBeInTheDocument();
});

test('renders main navigation items', () => {
  render(<App />);
  // Sidebar should have income input section
  const incomeInputElements = screen.getAllByText(/所得入力/i);
  expect(incomeInputElements.length).toBeGreaterThan(0);
});
