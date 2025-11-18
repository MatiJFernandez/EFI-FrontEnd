import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import authService from '../../services/auth/authService';
import usersService from '../../services/users/usersService';

// Mock localStorage
const localStorageMock = {};
delete global.localStorage;
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn((key) => localStorageMock[key] || null),
    setItem: jest.fn((key, value) => {
      localStorageMock[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete localStorageMock[key];
    }),
    clear: jest.fn(() => {
      Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    }),
  },
  writable: true,
});

// Mock implementation for localStorage.getItem is already set in global.localStorage

// Mock the services
jest.mock('../../services/auth/authService');
jest.mock('../../services/users/usersService');

// Mock implementations
authService.getCurrentUser.mockReturnValue(null);
authService.logout.mockImplementation(() => {});

// Test component to access context
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUserProfile,
    loading,
    token
  } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="token">{token || 'null'}</div>
      <button data-testid="login-btn" onClick={() => login({ username: 'test', password: 'pass' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="forgot-btn" onClick={() => forgotPassword('test@email.com')}>
        Forgot Password
      </button>
      <button data-testid="reset-btn" onClick={() => resetPassword({ token: '123', password: 'newpass' })}>
        Reset Password
      </button>
      <button data-testid="profile-btn" onClick={getUserProfile}>
        Get Profile
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset localStorage mock
    Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);

    // Reset service mocks
    authService.getCurrentUser.mockClear();
    authService.logout.mockClear();
    authService.login.mockClear();
    authService.forgotPassword.mockClear();
    authService.resetPassword.mockClear();
    usersService.getUserProfile.mockClear();
  });

  describe('Initial state', () => {
    test('should initialize with default values when no stored session', () => {
      localStorage.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });

    test('should initialize with stored session data', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockToken = 'mock-token';

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'token') return mockToken;
        return null;
      });

      authService.getCurrentUser.mockReturnValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
      });
    });
  });

  describe('login function', () => {
    test('should handle successful login', async () => {
      const mockCredentials = { username: 'test', password: 'pass' };
      const mockResponse = {
        success: true,
        user: { id: 1, username: 'testuser' },
        token: 'mock-token'
      };

      authService.login.mockResolvedValue(mockResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      act(() => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith(mockCredentials);
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockResponse.user));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    test('should handle login failure', async () => {
      const mockCredentials = { username: 'testuser', password: 'wrongpassword' };
      const mockError = new Error('Invalid credentials');

      authService.login.mockRejectedValue(mockError);

      let loginFunction;
      const TestComponentWithLogin = () => {
        const { login } = useAuth();
        loginFunction = login;
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogin />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(loginFunction).toBeDefined();
      });

      // Test that login throws an error
      await expect(loginFunction(mockCredentials)).rejects.toThrow('Invalid credentials');
      expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    });
  });

  describe('logout function', () => {
    test('should clear user data and call authService.logout', async () => {
      const mockUser = { id: 1, username: 'testuser' };

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'token') return 'mock-token';
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for user to be loaded
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutButton = screen.getByTestId('logout-btn');
      act(() => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('forgotPassword function', () => {
    test('should call authService.forgotPassword and return result', async () => {
      const mockEmail = 'test@email.com';
      const mockResponse = { success: true, message: 'Email sent' };

      authService.forgotPassword.mockResolvedValue(mockResponse);

      let forgotPasswordFunction;
      const TestComponentWithForgot = () => {
        const { forgotPassword } = useAuth();
        forgotPasswordFunction = forgotPassword;
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponentWithForgot />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(forgotPasswordFunction).toBeDefined();
      });

      const result = await forgotPasswordFunction(mockEmail);
      expect(result).toEqual(mockResponse);
      expect(authService.forgotPassword).toHaveBeenCalledWith(mockEmail);
    });
  });

  describe('resetPassword function', () => {
    test('should call authService.resetPassword and return result', async () => {
      const mockResetData = { token: 'reset-token', password: 'newpassword' };
      const mockResponse = { success: true, message: 'Password reset successful' };

      authService.resetPassword.mockResolvedValue(mockResponse);

      let resetPasswordFunction;
      const TestComponentWithReset = () => {
        const { resetPassword } = useAuth();
        resetPasswordFunction = resetPassword;
        return <div>Test</div>;
      };

      render(
        <AuthProvider>
          <TestComponentWithReset />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(resetPasswordFunction).toBeDefined();
      });

      const result = await resetPasswordFunction(mockResetData);
      expect(result).toEqual(mockResponse);
      expect(authService.resetPassword).toHaveBeenCalledWith(mockResetData);
    });
  });

  describe('getUserProfile function', () => {
    test('should call usersService.getUserProfile and update user state', async () => {
      const mockProfileResponse = {
        success: true,
        data: { id: 1, username: 'updateduser', email: 'test@email.com' }
      };

      usersService.getUserProfile.mockResolvedValue(mockProfileResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const profileButton = screen.getByTestId('profile-btn');
      act(() => {
        profileButton.click();
      });

      await waitFor(() => {
        expect(usersService.getUserProfile).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockProfileResponse.data));
      });
    });
  });

  describe('useAuth hook', () => {
    test('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
