// Mock localStorage before importing anything
const localStorageMock = new Map();
delete global.localStorage;
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn((key) => localStorageMock.get(key) || null),
    setItem: jest.fn((key, value) => {
      localStorageMock.set(key, value);
    }),
    removeItem: jest.fn((key) => {
      localStorageMock.delete(key);
    }),
    clear: jest.fn(() => {
      localStorageMock.clear();
    }),
  },
  writable: true,
});

// Mock the API module
jest.mock('../../api/api', () => {
  const mockSetAuthToken = jest.fn((token) => {
    if (token) {
      global.localStorage.setItem('token', token);
    } else {
      global.localStorage.removeItem('token');
    }
  });

  const mockRemoveAuthToken = jest.fn(() => {
    global.localStorage.removeItem('token');
    global.localStorage.removeItem('user');
  });

  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
      defaults: {
        headers: {
          common: {},
        },
      },
    },
    setAuthToken: mockSetAuthToken,
    removeAuthToken: mockRemoveAuthToken,
  };
});

// Import the mocked api
import api from '../../api/api';

// Import after mocks are set up
import { authService } from '../authService';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the localStorage mock completely
    localStorageMock.clear();
  });

  describe('login', () => {
    test('should login successfully and store user data', async () => {
      const mockCredentials = { username: 'testuser', password: 'password' };
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, username: 'testuser', email: 'test@example.com' }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(result).toEqual({
        success: true,
        user: mockResponse.data.user,
        token: mockResponse.data.token
      });
      expect(localStorage.getItem('token')).toBe(mockResponse.data.token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    });

    test('should handle login failure', async () => {
      const mockCredentials = { username: 'testuser', password: 'wrongpassword' };
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });

    test('should handle network error during login', async () => {
      const mockCredentials = { username: 'testuser', password: 'password' };
      const mockError = new Error('Network Error');

      api.post.mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(result).toEqual({
        success: false,
        error: 'Error al iniciar sesión'
      });
    });
  });

  describe('register', () => {
    test('should register successfully and store user data', async () => {
      const mockUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123'
      };
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, username: 'johndoe', email: 'john@example.com' }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register(mockUserData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', mockUserData);
      expect(result).toEqual({
        success: true,
        user: mockResponse.data.user,
        token: mockResponse.data.token
      });
      expect(localStorage.getItem('token')).toBe(mockResponse.data.token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    });

    test('should handle registration failure', async () => {
      const mockUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123'
      };
      const mockError = {
        response: {
          data: { message: 'User already exists' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await authService.register(mockUserData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', mockUserData);
      expect(result).toEqual({
        success: false,
        error: 'User already exists'
      });
    });
  });

  describe('logout', () => {
    test('should clear localStorage', () => {
      // Set up initial data
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    test('should return parsed user from localStorage', () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    test('should return null when no user in localStorage', () => {
      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });

    test('should return null when user data is invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      localStorage.setItem('token', 'mock-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    test('should return false when no token exists', () => {
      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    test('should send forgot password request successfully', async () => {
      const mockEmail = 'test@example.com';
      const mockResponse = {
        data: { message: 'Password reset email sent' }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword(mockEmail);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockEmail });
      expect(result).toEqual({
        success: true,
        message: mockResponse.data.message
      });
    });

    test('should handle forgot password failure', async () => {
      const mockEmail = 'nonexistent@example.com';
      const mockError = {
        response: {
          data: { message: 'User not found' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await authService.forgotPassword(mockEmail);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockEmail });
      expect(result).toEqual({
        success: false,
        error: 'User not found'
      });
    });

    test('should handle network error during forgot password', async () => {
      const mockEmail = 'test@example.com';
      const mockError = new Error('Network Error');

      api.post.mockRejectedValue(mockError);

      const result = await authService.forgotPassword(mockEmail);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockEmail });
      expect(result).toEqual({
        success: false,
        error: 'Error al procesar la solicitud'
      });
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const mockResetData = {
        token: 'reset-token-123',
        password: 'newpassword123'
      };
      const mockResponse = {
        data: { message: 'Password reset successfully' }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword(mockResetData);

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', mockResetData);
      expect(result).toEqual({
        success: true,
        message: mockResponse.data.message
      });
    });

    test('should handle reset password failure', async () => {
      const mockResetData = {
        token: 'invalid-token',
        password: 'newpassword123'
      };
      const mockError = {
        response: {
          data: { message: 'Invalid or expired token' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await authService.resetPassword(mockResetData);

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', mockResetData);
      expect(result).toEqual({
        success: false,
        error: 'Invalid or expired token'
      });
    });

    test('should handle network error during reset password', async () => {
      const mockResetData = {
        token: 'reset-token-123',
        password: 'newpassword123'
      };
      const mockError = new Error('Network Error');

      api.post.mockRejectedValue(mockError);

      const result = await authService.resetPassword(mockResetData);

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', mockResetData);
      expect(result).toEqual({
        success: false,
        error: 'Error al restablecer la contraseña'
      });
    });
  });
});
