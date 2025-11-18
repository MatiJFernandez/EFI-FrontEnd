import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import authService from '../../services/auth/authService';
import { validateForm } from '../../utils/validations';

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

// Mock the AuthContext
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    loading: false,
    token: null
  })
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      {children}
    </ToastProvider>
  </BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders register form correctly', () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido *')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de Usuario *')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByText(/¿ya tienes cuenta\?/i)).toBeInTheDocument();
  });

  test('updates form data on input change', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(usernameInput.value).toBe('johndoe');
    expect(passwordInput.value).toBe('Password123');
    expect(confirmPasswordInput.value).toBe('Password123');
  });

  test('shows validation errors when form is invalid', async () => {
    validateForm.mockReturnValue({
      firstName: 'Nombre requerido',
      email: 'Email inválido'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'invalid-email');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(validateForm).toHaveBeenCalled();
    });
  });

  test('handles successful registration and auto-login', async () => {
    validateForm.mockReturnValue({});

    const mockRegisterResponse = {
      success: true,
      user: { id: 1, username: 'johndoe' },
      token: 'mock-token'
    };

    const mockLoginResponse = {
      success: true,
      user: { id: 1, username: 'johndoe' }
    };

    authService.register.mockResolvedValue(mockRegisterResponse);
    mockLogin.mockResolvedValue(mockLoginResponse);

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'Password123'
      });
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'johndoe',
        password: 'Password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles registration failure', async () => {
    validateForm.mockReturnValue({});

    const errorMessage = 'Usuario ya existe';
    authService.register.mockResolvedValue({
      success: false,
      error: errorMessage
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'existing@example.com');
    await user.type(usernameInput, 'existinguser');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  test('shows success message after successful registration', async () => {
    validateForm.mockReturnValue({});

    const mockRegisterResponse = {
      success: true,
      user: { id: 1, username: 'johndoe' },
      token: 'mock-token'
    };

    authService.register.mockResolvedValue(mockRegisterResponse);

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cuenta creada exitosamente')).toBeInTheDocument();
    });
  });

  test('shows loading state during registration', async () => {
    validateForm.mockReturnValue({});

    // Mock a delayed response
    authService.register.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent('Creando cuenta...');
    expect(submitButton).toBeDisabled();
  });

  test('navigates to login page', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const loginLink = screen.getByText(/¿ya tienes cuenta\?/i);
    await user.click(loginLink);

    // Verify the link is present
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  test('excludes confirmPassword from registration data', async () => {
    validateForm.mockReturnValue({});

    authService.register.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'johndoe' },
      token: 'mock-token'
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText('Nombre *');
    const lastNameInput = screen.getByLabelText('Apellido *');
    const emailInput = screen.getByLabelText('Correo Electrónico *');
    const usernameInput = screen.getByLabelText('Nombre de Usuario *');
    const passwordInput = screen.getByLabelText('Contraseña *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña *');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(usernameInput, 'johndoe');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      const registerCall = authService.register.mock.calls[0][0];
      expect(registerCall).not.toHaveProperty('confirmPassword');
      expect(registerCall).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'Password123'
      });
    });
  });
});
