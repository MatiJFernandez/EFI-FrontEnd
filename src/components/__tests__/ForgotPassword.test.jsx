import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import authService from '../../services/auth/authService';

// Mock the auth service
jest.mock('../../services/auth/authService');

// Mock the validations
jest.mock('../../utils/validations', () => ({
  validateField: jest.fn(),
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders forgot password form correctly', () => {
    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    expect(screen.getByText(/Ingresa tu correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
    expect(screen.getByText(/volver al inicio de sesión/i)).toBeInTheDocument();
  });

  test('updates email input on change', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput.value).toBe('test@example.com');
  });

  test('validates email field on change', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('Email inválido');

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'invalid-email');

    expect(validateField).toHaveBeenCalledWith('email', 'invalid-email');
  });

  test('shows validation error when email is invalid on submit', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('Email requerido');

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const form = screen.getByTestId('forgot-password-form');
    fireEvent.submit(form);

    expect(validateField).toHaveBeenCalledWith('email', '');
  });

  test('handles successful forgot password request', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    const mockResponse = {
      success: true,
      message: 'Password reset email sent'
    };

    authService.forgotPassword.mockResolvedValue(mockResponse);

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText(/Si el correo existe/i)).toBeInTheDocument();
    });
  });

  test('handles forgot password failure', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    const errorMessage = 'Usuario no encontrado';
    authService.forgotPassword.mockResolvedValue({
      success: false,
      error: errorMessage
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  test('handles network error during forgot password', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    const errorMessage = 'Error inesperado. Intente nuevamente.';
    authService.forgotPassword.mockRejectedValue(new Error('Network Error'));

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows loading state during forgot password request', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    // Mock a delayed response
    authService.forgotPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(screen.getByText('Enviando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Enviando...')).not.toBeInTheDocument();
    });
  });

  test('clears email input after successful submission', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    authService.forgotPassword.mockResolvedValue({
      success: true,
      message: 'Email sent'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
    });
  });

  test('navigates to login page', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const loginLink = screen.getByText(/volver al inicio de sesión/i);
    await user.click(loginLink);

    // Verify the link is present
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('prevents multiple submissions while loading', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    authService.forgotPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled();

    // Should only be called once
    expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
  });

  test('shows success message for successful requests', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('');

    authService.forgotPassword.mockResolvedValue({
      success: true,
      message: 'Email sent successfully'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ForgotPassword />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Si el correo existe/i)).toBeInTheDocument();
    });
  });
});
