import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import authService from '../../services/auth/authService';

// Mock the auth service
jest.mock('../../services/auth/authService');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('?token=reset-token-123')],
}));

// Mock the validations
jest.mock('../../utils/validations', () => ({
  validateField: jest.fn(),
  validateForm: jest.fn(),
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders reset password form when token is present', () => {
    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Restablecer Contraseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva Contraseña *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Nueva Contraseña *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restablecer contraseña/i })).toBeInTheDocument();
    expect(screen.getByText(/volver al inicio de sesión/i)).toBeInTheDocument();
  });

  test('shows error when no token is present', () => {
    // Temporarily override the search params for this test
    const originalUseSearchParams = require('react-router-dom').useSearchParams;
    require('react-router-dom').useSearchParams = () => [new URLSearchParams('')];

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    expect(screen.getByText(/Token de restablecimiento no válido o faltante/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitar nuevo enlace de restablecimiento/i)).toBeInTheDocument();

    // Restore original
    require('react-router-dom').useSearchParams = originalUseSearchParams;
  });

  test('updates form data on input change', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');

    expect(passwordInput.value).toBe('NewPassword123');
    expect(confirmPasswordInput.value).toBe('NewPassword123');
  });

  test('validates form fields on change', async () => {
    const { validateField } = require('../../utils/validations');
    validateField.mockReturnValue('Contraseña requerida');

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    await user.type(passwordInput, 'weak');

    expect(validateField).toHaveBeenCalledWith('password', 'weak', expect.any(Object));
  });

  test('shows validation errors when form is invalid', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({
      password: 'Contraseña muy débil',
      confirmPassword: 'Las contraseñas no coinciden'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'weak');
    await user.type(confirmPasswordInput, 'different');
    await user.click(submitButton);

    expect(validateForm).toHaveBeenCalled();
  });

  test('handles successful password reset', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    const mockResponse = {
      success: true,
      message: 'Password reset successfully'
    };

    authService.resetPassword.mockResolvedValue(mockResponse);

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-123',
        password: 'NewPassword123'
      });
      expect(screen.getByText(/¡Contraseña restablecida exitosamente!/i)).toBeInTheDocument();
    });

    // Should navigate to login after 2 seconds
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('handles password reset failure', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    const errorMessage = 'Token inválido o expirado';
    authService.resetPassword.mockResolvedValue({
      success: false,
      error: errorMessage
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  test('handles network error during password reset', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    const errorMessage = 'Error inesperado. Intente nuevamente.';
    authService.resetPassword.mockRejectedValue(new Error('Network Error'));

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows loading state during password reset', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    // Mock a delayed response
    authService.resetPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Password reset successfully' }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    expect(screen.getByText('Restableciendo...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Restableciendo...')).not.toBeInTheDocument();
    });
  });

  test('navigates to login page', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const loginLink = screen.getByText(/volver al inicio de sesión/i);
    await user.click(loginLink);

    // Verify the link is present
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('navigates to forgot password when token is invalid', async () => {
    // Temporarily override the search params for this test
    const originalUseSearchParams = require('react-router-dom').useSearchParams;
    require('react-router-dom').useSearchParams = () => [new URLSearchParams('')];

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const forgotPasswordLink = screen.getByText(/Solicitar nuevo enlace de restablecimiento/i);
    await user.click(forgotPasswordLink);

    // Verify the link is present
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');

    // Restore original
    require('react-router-dom').useSearchParams = originalUseSearchParams;
  });

  test('prevents form submission when loading', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    authService.resetPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Password reset successfully' }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    // Try to click again while loading
    fireEvent.click(submitButton);

    // Should only be called once
    expect(authService.resetPassword).toHaveBeenCalledTimes(1);
  });

  test('disables submit button after successful reset', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    authService.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successfully'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('includes token from URL in reset request', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    authService.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successfully'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ResetPassword />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Nueva Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nueva Contraseña *');
    const submitButton = screen.getByRole('button', { name: /restablecer contraseña/i });

    await user.type(passwordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-123',
        password: 'NewPassword123'
      });
    });
  });
});
