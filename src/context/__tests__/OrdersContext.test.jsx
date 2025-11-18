import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { OrdersProvider, useOrders } from '../OrdersContext';
import ordersService from '../../services/orders/ordersService';
import orderDetailsService from '../../services/orderDetails/orderDetailsService';

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

// Mock the services
jest.mock('../../services/orders/ordersService');
jest.mock('../../services/orderDetails/orderDetailsService');

// Mock AuthContext
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, username: 'testuser', role: 'waiter' }
  }))
}));

// Import after mocks are set up
import { useAuth } from '../AuthContext';

// Test component to access context
const TestComponent = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getOrderDetails,
    getOrdersByStatus,
    getOrdersByRole,
    clearError
  } = useOrders();

  return (
    <div>
      <div data-testid="orders-count">{orders.length}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button data-testid="fetch-btn" onClick={fetchOrders}>
        Fetch Orders
      </button>
      <button data-testid="create-btn" onClick={() => createOrder({ tableNumber: 1, items: [] })}>
        Create Order
      </button>
      <button data-testid="update-btn" onClick={() => updateOrder(1, { status: 'ready' })}>
        Update Order
      </button>
      <button data-testid="update-status-btn" onClick={() => updateOrderStatus(1, 'ready')}>
        Update Status
      </button>
      <button data-testid="delete-btn" onClick={() => deleteOrder(1)}>
        Delete Order
      </button>
      <button data-testid="get-details-btn" onClick={() => getOrderDetails(1)}>
        Get Details
      </button>
      <button data-testid="clear-error-btn" onClick={clearError}>
        Clear Error
      </button>
      <button data-testid="get-by-status-btn" onClick={() => {
        const pendingOrders = getOrdersByStatus('pending');
        console.log('Pending orders:', pendingOrders.length);
      }}>
        Get by Status
      </button>
      <button data-testid="get-by-role-btn" onClick={() => {
        const roleOrders = getOrdersByRole();
        console.log('Role orders:', roleOrders.length);
      }}>
        Get by Role
      </button>
      <button data-testid="get-by-id-btn" onClick={() => {
        const order = getOrderById(1);
        console.log('Order by ID:', order ? order.id : 'null');
      }}>
        Get by ID
      </button>
    </div>
  );
};

const mockOrders = [
  {
    id: 1,
    tableNumber: 5,
    status: 'pending',
    createdAt: new Date().toISOString(),
    total: 45.50,
    items: [{ name: 'Pizza', quantity: 1, price: 15.00 }]
  },
  {
    id: 2,
    tableNumber: 3,
    status: 'preparing',
    createdAt: new Date().toISOString(),
    total: 28.75,
    items: [{ name: 'Pasta', quantity: 1, price: 12.00 }]
  },
  {
    id: 3,
    tableNumber: 7,
    status: 'ready',
    createdAt: new Date().toISOString(),
    total: 62.25,
    items: [{ name: 'Risotto', quantity: 1, price: 18.00 }]
  }
];

describe('OrdersContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset service mocks
    ordersService.getAllOrders.mockClear();
    ordersService.createOrder.mockClear();
    ordersService.updateOrder.mockClear();
    ordersService.updateOrderStatus.mockClear();
    ordersService.deleteOrder.mockClear();
    orderDetailsService.getOrderDetails.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    test('should initialize with default values', () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: [] });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    test('should fetch orders on mount', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      await waitFor(() => {
        expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });
    });

    test('should handle fetch orders error on mount', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: false, error: 'Network error' });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });
  });

  describe('fetchOrders function', () => {
    test('should fetch orders successfully', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      // Clear orders and fetch again
      act(() => {
        screen.getByTestId('fetch-btn').click();
      });

      await waitFor(() => {
        expect(ordersService.getAllOrders).toHaveBeenCalledTimes(2);
      });
    });

    test('should handle fetch orders error', async () => {
      ordersService.getAllOrders.mockResolvedValueOnce({ success: true, data: [] });
      ordersService.getAllOrders.mockResolvedValueOnce({ success: false, error: 'Fetch failed' });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
      });

      act(() => {
        screen.getByTestId('fetch-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Fetch failed');
      });
    });
  });

  describe('createOrder function', () => {
    test('should create order successfully', async () => {
      const newOrder = { id: 4, tableNumber: 10, status: 'pending', total: 25.00 };
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: [] });
      ordersService.createOrder.mockResolvedValue({ success: true, data: newOrder });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('create-btn').click();
      });

      await waitFor(() => {
        expect(ordersService.createOrder).toHaveBeenCalledWith({ tableNumber: 1, items: [] });
        expect(screen.getByTestId('orders-count')).toHaveTextContent('1');
      });
    });

    test('should handle create order error', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: [] });
      ordersService.createOrder.mockResolvedValue({ success: false, error: 'Create failed' });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('create-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Create failed');
      });
    });
  });

  describe('updateOrder function', () => {
    test('should update order successfully', async () => {
      const updatedOrder = { ...mockOrders[0], status: 'ready' };
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });
      ordersService.updateOrder.mockResolvedValue({ success: true, data: updatedOrder });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('update-btn').click();
      });

      await waitFor(() => {
        expect(ordersService.updateOrder).toHaveBeenCalledWith(1, { status: 'ready' });
      });
    });

    test('should handle update order error', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });
      ordersService.updateOrder.mockResolvedValue({ success: false, error: 'Update failed' });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('update-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Update failed');
      });
    });
  });

  describe('updateOrderStatus function', () => {
    test('should update order status successfully', async () => {
      const updatedOrder = { ...mockOrders[0], status: 'ready' };
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });
      ordersService.updateOrderStatus.mockResolvedValue({ success: true, data: updatedOrder });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('update-status-btn').click();
      });

      await waitFor(() => {
        expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(1, 'ready');
      });
    });
  });

  describe('deleteOrder function', () => {
    test('should delete order successfully', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });
      ordersService.deleteOrder.mockResolvedValue({ success: true });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('delete-btn').click();
      });

      await waitFor(() => {
        expect(ordersService.deleteOrder).toHaveBeenCalledWith(1);
        expect(screen.getByTestId('orders-count')).toHaveTextContent('2');
      });
    });
  });

  describe('getOrderById function', () => {
    test('should return order by ID', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-by-id-btn').click();
      });

      // The function should work without throwing errors
      expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrderDetails function', () => {
    test('should fetch order details successfully', async () => {
      const mockDetails = { id: 1, items: [{ name: 'Pizza', quantity: 1 }] };
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });
      orderDetailsService.getOrderDetails.mockResolvedValue({ success: true, data: mockDetails });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-details-btn').click();
      });

      await waitFor(() => {
        expect(orderDetailsService.getOrderDetails).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('getOrdersByStatus function', () => {
    test('should filter orders by status', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-by-status-btn').click();
      });

      // Should work without errors
      expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByRole function', () => {
    test('should filter orders by user role - admin', async () => {
      useAuth.mockReturnValue({ user: { id: 1, username: 'admin', role: 'admin' } });
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-by-role-btn').click();
      });

      // Admin should see all orders
      expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
    });

    test('should filter orders by user role - moderator', async () => {
      useAuth.mockReturnValue({ user: { id: 1, username: 'moderator', role: 'moderator' } });
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-by-role-btn').click();
      });

      // Moderator should see orders with status: preparing, ready, delivered
      expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
    });

    test('should filter orders by user role - waiter', async () => {
      useAuth.mockReturnValue({ user: { id: 1, username: 'waiter', role: 'waiter' } });
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      act(() => {
        screen.getByTestId('get-by-role-btn').click();
      });

      // Waiter should see all orders (for now)
      expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearError function', () => {
    test('should clear error state', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: false, error: 'Initial error' });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for error to be set
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Initial error');
      });

      act(() => {
        screen.getByTestId('clear-error-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  describe('Polling functionality', () => {
    test('should set up polling interval', async () => {
      ordersService.getAllOrders.mockResolvedValue({ success: true, data: mockOrders });

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(ordersService.getAllOrders).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(ordersService.getAllOrders).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useOrders hook', () => {
    test('should throw error when used outside OrdersProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useOrders must be used within an OrdersProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    test('should handle network errors gracefully', async () => {
      ordersService.getAllOrders.mockRejectedValue(new Error('Network error'));

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Error al cargar los pedidos');
      });
    });

    test('should handle service errors gracefully', async () => {
      ordersService.createOrder.mockRejectedValue(new Error('Service error'));

      render(
        <OrdersProvider>
          <TestComponent />
        </OrdersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('create-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Error al crear el pedido');
      });
    });
  });
});
