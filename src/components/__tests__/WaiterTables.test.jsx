import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import WaiterTables from '../WaiterTables';
import { TablesProvider } from '../../context/TablesContext';
import tablesService from '../../services/tables/tablesService';

// Mock the tables service
jest.mock('../../services/tables/tablesService');

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }) => <div data-testid="grid" {...props}>{children}</div>,
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  Typography: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  CircularProgress: () => <div data-testid="circular-progress">Loading...</div>,
  Alert: ({ children, severity }) => <div data-testid={`alert-${severity}`}>{children}</div>,
}));

describe('WaiterTables', () => {
  beforeEach(() => {
    // Reset service mocks
    tablesService.getAllTables.mockClear();
  });

  describe('Initial render', () => {
    test('should render loading state initially', () => {
      tablesService.getAllTables.mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      expect(screen.getByText('Mesas disponibles')).toBeInTheDocument();
      // When loading, button shows CircularProgress instead of 'Refrescar'
      expect(screen.getAllByTestId('circular-progress')).toHaveLength(2); // One in button, one in loading box
    });

    test('should render available tables when loaded', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, location: 'Window', available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, location: 'Center', available: false, occupied: true },
        { id: 3, number: 3, name: 'Table 3', capacity: 2, available: true }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Mesa 1 - Table 1')).toBeInTheDocument();
        expect(screen.getByText('Capacidad: 4')).toBeInTheDocument();
        expect(screen.getByText('Ubicación: Window')).toBeInTheDocument();

        expect(screen.getByText('Mesa 3 - Table 3')).toBeInTheDocument();
        expect(screen.getByText('Capacidad: 2')).toBeInTheDocument();

        // Should show multiple "Disponible" for available tables
        expect(screen.getAllByText('Disponible')).toHaveLength(2);

        // Should not show occupied table
        expect(screen.queryByText('Mesa 2 - Table 2')).not.toBeInTheDocument();
      });
    });

    test('should show "no tables available" message when no available tables', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, available: false, occupied: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, available: false, occupied: true }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No hay mesas disponibles en este momento.')).toBeInTheDocument();
      });
    });

    test('should show error message when fetch fails', async () => {
      tablesService.getAllTables.mockResolvedValue({ success: false, error: 'Failed to load tables' });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load tables')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh functionality', () => {
    test('should call fetchTables when refresh button is clicked', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4, available: true }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        // Provider calls once on mount, component may call again if tables empty
        expect(tablesService.getAllTables).toHaveBeenCalledTimes(2);
      });

      const refreshButton = screen.getByText('Refrescar');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(tablesService.getAllTables).toHaveBeenCalledTimes(3);
      });
    });

    test('should disable refresh button when loading', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4, available: true }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        // Wait for tables to load
        expect(screen.getByText('Refrescar')).toBeInTheDocument();
      });

      // Mock loading state by clicking refresh
      tablesService.getAllTables.mockReturnValue(new Promise(() => {})); // Never resolves

      const refreshButton = screen.getByText('Refrescar');
      fireEvent.click(refreshButton);

      // Button should now show loading state (CircularProgress instead of text)
      expect(screen.queryByText('Refrescar')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('circular-progress')).toHaveLength(1); // Only in button now
    });
  });

  describe('Table display', () => {
    test('should display table number and name correctly', async () => {
      const mockTables = [
        { id: 1, number: 5, name: 'Corner Table', capacity: 4, available: true },
        { id: 2, number: 10, name: '', capacity: 2, available: true } // Table without name
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Mesa 5 - Corner Table')).toBeInTheDocument();
        expect(screen.getByText('Mesa 10')).toBeInTheDocument(); // No name, just number
      });
    });

    test('should display capacity for all tables', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 8, available: true }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Capacidad: 4')).toBeInTheDocument();
        expect(screen.getByText('Capacidad: 8')).toBeInTheDocument();
      });
    });

    test('should display location when available', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, location: 'Window', available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, available: true } // No location
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Ubicación: Window')).toBeInTheDocument();
        expect(screen.queryByText('Ubicación:')).not.toBeInTheDocument(); // Should not show for table without location
      });
    });

    test('should show availability status correctly', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, available: false, occupied: true }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        // Only available table should be shown
        expect(screen.getByText('Disponible')).toBeInTheDocument();
        expect(screen.queryByText('No disponible')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    test('should show loading spinner when initially loading', () => {
      tablesService.getAllTables.mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      // Initial state should show loading spinners
      expect(screen.getAllByTestId('circular-progress')).toHaveLength(2);
    });

    test('should not show loading spinner when tables are loaded', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4, available: true }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    test('should display error alert when there is an error', async () => {
      tablesService.getAllTables.mockResolvedValue({ success: false, error: 'Network error' });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('should not display error alert when there is no error', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4, available: true }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <WaiterTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument();
      });
    });
  });
});
