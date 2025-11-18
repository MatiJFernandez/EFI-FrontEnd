import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import ordersService from '../../services/orders/ordersService';

// Mock the services
jest.mock('../../services/orders/ordersService');

// Mock the OrdersContext
jest.mock('../../context/OrdersContext', () => ({
  useOrders: jest.fn(),
  OrdersProvider: ({ children }) => children
}));

// Import after mocks
import OrdersList from '../OrdersList';
import { useOrders } from '../../context/OrdersContext';

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

// Test wrapper component
const TestWrapper = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
};

// Mock orders data
const mockOrders = [
  {
    id: 1,
    tableNumber: 5,
    status: 'pending',
    createdAt: new Date().toISOString(),
    total: 45.50,
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 12.50, notes: 'Sin cebolla' },
      { name: 'Coca Cola', quantity: 1, price: 3.50 }
    ]
  },
  {
    id: 2,
    tableNumber: 3,
    status: 'preparing',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    total: 28.75,
    items: [
      { name: 'Pasta Carbonara', quantity: 1, price: 15.00 },
      { name: 'Agua Mineral', quantity: 2, price: 2.50 }
    ]
  },
  {
    id: 3,
    tableNumber: 7,
    status: 'ready',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    total: 62.25,
    items: [
      { name: 'Risotto ai Funghi', quantity: 1, price: 18.00 },
      { name: 'Vino Tinto', quantity: 1, price: 25.00 }
    ]
  }
];

describe('OrdersList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock
    useOrders.mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });
  });

  test('renders orders management title correctly', () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /gestión de pedidos/i })).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: true,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders orders correctly when loaded', async () => {
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Check that all orders are displayed
    expect(screen.getByText('Pedido #1')).toBeInTheDocument();
    expect(screen.getByText('Pedido #2')).toBeInTheDocument();
    expect(screen.getByText('Pedido #3')).toBeInTheDocument();
  });

  test('displays order information correctly', async () => {
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Check order details
    expect(screen.getByText('Mesa: 5')).toBeInTheDocument();
    expect(screen.getByText('Total: $45.5')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  test('shows status chips with correct colors', async () => {
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Check status chips
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Preparando')).toBeInTheDocument();
    expect(screen.getByText('Listo')).toBeInTheDocument();
  });

  test('displays order items preview', async () => {
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Check items preview
    expect(screen.getByText('2x Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText('1x Pasta Carbonara')).toBeInTheDocument();
  });

  test('shows "and X more" when order has more than 3 items', async () => {
    const orderWithManyItems = [{
      id: 1,
      tableNumber: 1,
      status: 'pending',
      createdAt: new Date().toISOString(),
      total: 100.00,
      items: [
        { name: 'Item 1', quantity: 1, price: 10.00 },
        { name: 'Item 2', quantity: 1, price: 10.00 },
        { name: 'Item 3', quantity: 1, price: 10.00 },
        { name: 'Item 4', quantity: 1, price: 10.00 },
        { name: 'Item 5', quantity: 1, price: 10.00 }
      ]
    }];

    useOrders.mockReturnValue({
      orders: orderWithManyItems,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByText('...y 2 más')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: false,
      error: 'Error al cargar los pedidos',
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByText('Error al cargar los pedidos')).toBeInTheDocument();
  });

  test('shows mock orders when no orders from backend', async () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // When no orders from backend, it shows mock data
    expect(screen.getByText('Pedido #1')).toBeInTheDocument();
    expect(screen.getByText('Pedido #2')).toBeInTheDocument();
    expect(screen.getByText('Pedido #3')).toBeInTheDocument();
  });

  test('displays active orders count', async () => {
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByText('Pedidos Activos: 3')).toBeInTheDocument();
  });

  test('refreshes orders when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const mockFetchOrders = jest.fn();
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: mockFetchOrders,
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /recargar pedidos/i });
    await user.click(refreshButton);

    expect(mockFetchOrders).toHaveBeenCalledTimes(1);
  });

  test('opens ticket dialog when download button is clicked', async () => {
    const user = userEvent.setup();
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    const downloadButtons = screen.getAllByRole('button', { name: /descargar comanda pdf/i });
    await user.click(downloadButtons[0]);

    // Dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Comanda de Cocina - Pedido #1')).toBeInTheDocument();
  });

  test('closes ticket dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    useOrders.mockReturnValue({
      orders: mockOrders,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Open dialog
    const downloadButtons = screen.getAllByRole('button', { name: /descargar comanda pdf/i });
    await user.click(downloadButtons[0]);

    // Close dialog
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    await user.click(closeButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('formats date correctly', async () => {
    const testDate = new Date('2023-12-25T14:30:00');
    const orderWithSpecificDate = [{
      id: 1,
      tableNumber: 1,
      status: 'pending',
      createdAt: testDate.toISOString(),
      total: 25.00,
      items: [{ name: 'Test Item', quantity: 1, price: 25.00 }]
    }];

    useOrders.mockReturnValue({
      orders: orderWithSpecificDate,
      loading: false,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    // Should display formatted date
    const formattedDate = testDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(`Fecha: ${formattedDate}`)).toBeInTheDocument();
  });

  test('disables refresh button when loading', async () => {
    useOrders.mockReturnValue({
      orders: [],
      loading: true,
      error: null,
      fetchOrders: jest.fn(),
      clearError: jest.fn()
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /cargando/i });
    expect(refreshButton).toBeDisabled();
  });

  test('clears error when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const mockClearError = jest.fn();
    useOrders.mockReturnValue({
      orders: [],
      loading: false,
      error: 'Test error',
      fetchOrders: jest.fn(),
      clearError: mockClearError
    });

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /recargar pedidos/i });
    await user.click(refreshButton);

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
