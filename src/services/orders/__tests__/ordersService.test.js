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
jest.mock('../../api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Import the mocked api
import api from '../../api/api';

// Import after mocks are set up
import ordersService from '../ordersService';

describe('ordersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the localStorage mock completely
    localStorageMock.clear();
  });

  describe('getAllOrders', () => {
    test('should fetch all orders successfully', async () => {
      const mockResponse = {
        data: [
          { id: 1, tableNumber: 5, status: 'pending', total: 45.50 },
          { id: 2, tableNumber: 3, status: 'preparing', total: 28.75 }
        ]
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await ordersService.getAllOrders();

      expect(api.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle API error response', async () => {
      const mockError = {
        response: {
          data: { message: 'Database connection failed' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getAllOrders();

      expect(api.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual({
        success: false,
        error: 'Database connection failed'
      });
    });

    test('should handle network error', async () => {
      const mockError = new Error('Network Error');

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getAllOrders();

      expect(api.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los pedidos'
      });
    });

    test('should handle error without response data', async () => {
      const mockError = {
        response: {}
      };

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getAllOrders();

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los pedidos'
      });
    });
  });

  describe('getOrderById', () => {
    test('should fetch order by ID successfully', async () => {
      const mockOrder = { id: 1, tableNumber: 5, status: 'pending', total: 45.50 };
      const mockResponse = {
        data: mockOrder
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await ordersService.getOrderById(1);

      expect(api.get).toHaveBeenCalledWith('/orders/1');
      expect(result).toEqual({
        success: true,
        data: mockOrder
      });
    });

    test('should handle order not found', async () => {
      const mockError = {
        response: {
          data: { message: 'Order not found' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getOrderById(999);

      expect(api.get).toHaveBeenCalledWith('/orders/999');
      expect(result).toEqual({
        success: false,
        error: 'Order not found'
      });
    });
  });

  describe('createOrder', () => {
    test('should create order successfully', async () => {
      const orderData = {
        tableNumber: 5,
        items: [
          { dishId: 1, quantity: 2, notes: 'Sin cebolla' },
          { dishId: 2, quantity: 1 }
        ]
      };
      const mockResponse = {
        data: {
          id: 1,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          total: 45.50
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await ordersService.createOrder(orderData);

      expect(api.post).toHaveBeenCalledWith('/orders', orderData);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle validation error', async () => {
      const invalidOrderData = { tableNumber: 'invalid' };
      const mockError = {
        response: {
          data: { message: 'Invalid table number' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await ordersService.createOrder(invalidOrderData);

      expect(api.post).toHaveBeenCalledWith('/orders', invalidOrderData);
      expect(result).toEqual({
        success: false,
        error: 'Invalid table number'
      });
    });

    test('should handle duplicate order error', async () => {
      const orderData = { tableNumber: 1, items: [] };
      const mockError = {
        response: {
          data: { message: 'Table already has an active order' }
        }
      };

      api.post.mockRejectedValue(mockError);

      const result = await ordersService.createOrder(orderData);

      expect(result).toEqual({
        success: false,
        error: 'Table already has an active order'
      });
    });
  });

  describe('updateOrder', () => {
    test('should update order successfully', async () => {
      const orderId = 1;
      const updateData = { status: 'preparing', total: 50.00 };
      const mockResponse = {
        data: {
          id: orderId,
          tableNumber: 5,
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await ordersService.updateOrder(orderId, updateData);

      expect(api.put).toHaveBeenCalledWith('/orders/1', updateData);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle order not found during update', async () => {
      const mockError = {
        response: {
          data: { message: 'Order not found' }
        }
      };

      api.put.mockRejectedValue(mockError);

      const result = await ordersService.updateOrder(999, { status: 'ready' });

      expect(result).toEqual({
        success: false,
        error: 'Order not found'
      });
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status successfully', async () => {
      const orderId = 1;
      const newStatus = 'ready';
      const mockResponse = {
        data: {
          id: orderId,
          tableNumber: 5,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await ordersService.updateOrderStatus(orderId, newStatus);

      expect(api.patch).toHaveBeenCalledWith('/orders/1/status', { status: newStatus });
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle invalid status transition', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid status transition' }
        }
      };

      api.patch.mockRejectedValue(mockError);

      const result = await ordersService.updateOrderStatus(1, 'invalid-status');

      expect(result).toEqual({
        success: false,
        error: 'Invalid status transition'
      });
    });

    test('should handle status update for non-existent order', async () => {
      const mockError = {
        response: {
          data: { message: 'Order not found' }
        }
      };

      api.patch.mockRejectedValue(mockError);

      const result = await ordersService.updateOrderStatus(999, 'ready');

      expect(result).toEqual({
        success: false,
        error: 'Order not found'
      });
    });
  });

  describe('deleteOrder', () => {
    test('should delete order successfully', async () => {
      api.delete.mockResolvedValue({});

      const result = await ordersService.deleteOrder(1);

      expect(api.delete).toHaveBeenCalledWith('/orders/1');
      expect(result).toEqual({
        success: true
      });
    });

    test('should handle order not found during deletion', async () => {
      const mockError = {
        response: {
          data: { message: 'Order not found' }
        }
      };

      api.delete.mockRejectedValue(mockError);

      const result = await ordersService.deleteOrder(999);

      expect(result).toEqual({
        success: false,
        error: 'Order not found'
      });
    });

    test('should handle deletion of order with dependencies', async () => {
      const mockError = {
        response: {
          data: { message: 'Cannot delete order with active payments' }
        }
      };

      api.delete.mockRejectedValue(mockError);

      const result = await ordersService.deleteOrder(1);

      expect(result).toEqual({
        success: false,
        error: 'Cannot delete order with active payments'
      });
    });
  });

  describe('getOrdersByStatus', () => {
    test('should fetch orders by status successfully', async () => {
      const status = 'pending';
      const mockResponse = {
        data: [
          { id: 1, tableNumber: 5, status: 'pending', total: 45.50 },
          { id: 3, tableNumber: 7, status: 'pending', total: 32.25 }
        ]
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await ordersService.getOrdersByStatus(status);

      expect(api.get).toHaveBeenCalledWith('/orders?status=pending');
      expect(result).toEqual({
        success: true,
        data: mockResponse.data
      });
    });

    test('should handle empty results for status filter', async () => {
      const mockResponse = {
        data: []
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await ordersService.getOrdersByStatus('completed');

      expect(result).toEqual({
        success: true,
        data: []
      });
    });

    test('should handle invalid status parameter', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid status parameter' }
        }
      };

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getOrdersByStatus('invalid-status');

      expect(result).toEqual({
        success: false,
        error: 'Invalid status parameter'
      });
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

      const result = await ordersService.getAllOrders();

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

      api.post.mockRejectedValue(mockError);

      const result = await ordersService.createOrder({ tableNumber: 1, items: [] });

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

      api.delete.mockRejectedValue(mockError);

      const result = await ordersService.deleteOrder(1);

      expect(result).toEqual({
        success: false,
        error: 'Forbidden'
      });
    });

    test('should handle malformed request data', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Bad Request' }
        }
      };

      api.put.mockRejectedValue(mockError);

      const result = await ordersService.updateOrder(1, { invalidField: 'value' });

      expect(result).toEqual({
        success: false,
        error: 'Bad Request'
      });
    });
  });

  describe('Network error handling', () => {
    test('should handle timeout errors', async () => {
      const mockError = new Error('Timeout');
      mockError.code = 'ECONNABORTED';

      api.get.mockRejectedValue(mockError);

      const result = await ordersService.getAllOrders();

      expect(result).toEqual({
        success: false,
        error: 'Error al obtener los pedidos'
      });
    });

    test('should handle connection refused errors', async () => {
      const mockError = new Error('Connection refused');
      mockError.code = 'ECONNREFUSED';

      api.post.mockRejectedValue(mockError);

      const result = await ordersService.createOrder({ tableNumber: 1, items: [] });

      expect(result).toEqual({
        success: false,
        error: 'Error al crear el pedido'
      });
    });

    test('should handle DNS resolution errors', async () => {
      const mockError = new Error('ENOTFOUND');
      mockError.code = 'ENOTFOUND';

      api.patch.mockRejectedValue(mockError);

      const result = await ordersService.updateOrderStatus(1, 'ready');

      expect(result).toEqual({
        success: false,
        error: 'Error al actualizar el estado del pedido'
      });
    });
  });
});
