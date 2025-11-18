import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import authService from '../../services/auth/authService';

// Mock the auth service
jest.mock('../../services/auth/authService');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the validations
jest.mock('../../utils/validations', () => ({
  validateField: jest.fn(),
  validateForm: jest.fn(),
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders login form correctly', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument();
    expect(screen.getByText(/¿no tienes cuenta\?/i)).toBeInTheDocument();
  });

  test('updates form data on input change', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows validation errors when form is invalid', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({
      username: 'Usuario requerido',
      password: 'Contraseña requerida'
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const form = screen.getByTestId('login-form');
    fireEvent.submit(form);

    expect(validateForm).toHaveBeenCalled();
  });

  test('handles successful login', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    authService.login.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'testuser' },
      token: 'mock-token'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login failure', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    const errorMessage = 'Credenciales inválidas';
    authService.login.mockResolvedValue({ success: false, error: errorMessage });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    expect(document.body).toHaveTextContent(errorMessage);
  });

  test('shows loading state during login', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    // Mock a delayed response
    authService.login.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, user: { id: 1, username: 'testuser' }, token: 'mock-token' }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('navigates to forgot password page', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i);
    await user.click(forgotPasswordLink);

    // Since we're using BrowserRouter, we can't easily test navigation
    // but we can verify the link is present
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  test('navigates to register page', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const registerLink = screen.getByText(/¿no tienes cuenta\?/i);
    await user.click(registerLink);

    // Verify the link is present
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('prevents form submission when loading', async () => {
    const { validateForm } = require('../../utils/validations');
    validateForm.mockReturnValue({});

    authService.login.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, user: { id: 1, username: 'testuser' }, token: 'mock-token' }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Try to click again while loading
    fireEvent.click(submitButton);

    // Should only be called once
    expect(authService.login).toHaveBeenCalledTimes(1);
  });
});
