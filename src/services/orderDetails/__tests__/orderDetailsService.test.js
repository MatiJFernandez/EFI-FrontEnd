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
jest.mock('../../api/api.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Import the mocked api
import api from '../../api/api.js';

// Import after mocks are set up
import orderDetailsService from '../orderDetailsService';

describe('orderDetailsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the localStorage mock completely
    localStorageMock.clear();
  });

  describe('getOrderDetails', () => {
    test('should fetch order details successfully', async () => {
      const orderId = 1;
      const mockResponse = {
        data: {
          id: orderId,
          orderId: orderId,
          items: [
            {
              id: 1,
              dishId: 1,
              dishName: 'Pizza Margherita',
              quantity: 2,
              price: 12.50,
              notes: 'Sin cebolla',
              subtotal: 25.00
            },
            {
              id: 2,
              dishId: 2,
              dishName: 'Coca Cola',
              quantity: 1,
              price: 3.50,
              notes: null,
              subtotal: 3.50
            }
          ],
          total: 28.50,
          createdAt: '2023-12-25T14:30:00.000Z',
          updatedAt: '2023-12-25T14:30:00.000Z'
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(api.get).toHaveBeenCalledWith('/order_details/1');
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle order details not found', async () => {
      const orderId = 999;
      const mockError = {
        response: {
          data: { message: 'Order details not found' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(api.get).toHaveBeenCalledWith('/order_details/999');
      expect(result).toEqual({
        success: false,
        error: 'Order details not found'
      });
    });

    test('should handle network error', async () => {
      const orderId = 1;
      const mockError = new Error('Network Error');

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(api.get).toHaveBeenCalledWith('/order_details/1');
      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    });

    test('should handle error without response data', async () => {
      const orderId = 1;
      const mockError = {
        response: {}
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    });

    test('should handle invalid order ID', async () => {
      const invalidOrderId = 'invalid';
      const mockError = {
        response: {
          data: { message: 'Invalid order ID' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(invalidOrderId);

      expect(api.get).toHaveBeenCalledWith('/order_details/invalid');
      expect(result).toEqual({
        success: false,
        error: 'Invalid order ID'
      });
    });

    test('should handle empty order details', async () => {
      const orderId = 1;
      const mockResponse = {
        data: {
          id: orderId,
          orderId: orderId,
          items: [],
          total: 0,
          createdAt: '2023-12-25T14:30:00.000Z',
          updatedAt: '2023-12-25T14:30:00.000Z'
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
      expect(result.data.items).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    test('should handle order details with complex items', async () => {
      const orderId = 1;
      const mockResponse = {
        data: {
          id: orderId,
          orderId: orderId,
          items: [
            {
              id: 1,
              dishId: 1,
              dishName: 'Pizza Margherita',
              quantity: 3,
              price: 12.50,
              notes: 'Extra cheese, sin cebolla',
              subtotal: 37.50
            },
            {
              id: 2,
              dishId: 3,
              dishName: 'Tiramisú',
              quantity: 2,
              price: 6.00,
              notes: null,
              subtotal: 12.00
            },
            {
              id: 3,
              dishId: 4,
              dishName: 'Café Espresso',
              quantity: 1,
              price: 2.50,
              notes: 'Sin azúcar',
              subtotal: 2.50
            }
          ],
          total: 52.00,
          createdAt: '2023-12-25T14:30:00.000Z',
          updatedAt: '2023-12-25T15:00:00.000Z'
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(orderId);

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(3);
      expect(result.data.total).toBe(52.00);
      expect(result.data.items[0].notes).toBe('Extra cheese, sin cebolla');
      expect(result.data.items[1].notes).toBeNull();
      expect(result.data.items[2].notes).toBe('Sin azúcar');
    });
  });

  describe('Error handling patterns', () => {
    test('should handle server internal errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error'
      });
    });

    test('should handle unauthorized access', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized'
      });
    });

    test('should handle forbidden access', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Forbidden'
      });
    });

    test('should handle not found errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Order not found' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Order not found'
      });
    });
  });

  describe('Network error handling', () => {
    test('should handle timeout errors', async () => {
      const mockError = new Error('Timeout');
      mockError.code = 'ECONNABORTED';

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    });

    test('should handle connection refused errors', async () => {
      const mockError = new Error('Connection refused');
      mockError.code = 'ECONNREFUSED';

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    });

    test('should handle DNS resolution errors', async () => {
      const mockError = new Error('ENOTFOUND');
      mockError.code = 'ENOTFOUND';

      api.get.mockRejectedValue(mockError);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    });
  });

  describe('Data validation', () => {
    test('should handle malformed response data', async () => {
      const mockResponse = {
        data: null // Invalid data structure
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(1);

      // The service doesn't validate the response structure, just passes it through
      expect(result).toEqual({
        success: true,
        data: null
      });
    });

    test('should handle response with missing fields', async () => {
      const mockResponse = {
        data: {
          id: 1,
          // Missing orderId, items, total, etc.
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      // Missing fields would be undefined
    });

    test('should handle response with invalid item structure', async () => {
      const mockResponse = {
        data: {
          id: 1,
          orderId: 1,
          items: [
            { invalidField: 'value' }, // Missing required fields
            null, // Invalid item
            {} // Empty item
          ],
          total: 10.00
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await orderDetailsService.getOrderDetails(1);

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(3);
      // The service doesn't validate item structure, just passes it through
    });
  });

  describe('Concurrent requests', () => {
    test('should handle multiple concurrent requests', async () => {
      const mockResponse1 = {
        data: { id: 1, orderId: 1, items: [], total: 0 }
      };
      const mockResponse2 = {
        data: { id: 2, orderId: 2, items: [], total: 0 }
      };

      api.get
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [result1, result2] = await Promise.all([
        orderDetailsService.getOrderDetails(1),
        orderDetailsService.getOrderDetails(2)
      ]);

      expect(result1.success).toBe(true);
      expect(result1.data.id).toBe(1);
      expect(result2.success).toBe(true);
      expect(result2.data.id).toBe(2);
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
