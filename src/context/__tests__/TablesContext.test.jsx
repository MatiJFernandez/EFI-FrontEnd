import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { TablesProvider, useTables } from '../TablesContext';
import tablesService from '../../services/tables/tablesService';

// Mock the tables service
jest.mock('../../services/tables/tablesService');

// Test component to access context
const TestComponent = () => {
  const {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    setTableStatus,
    getTableById,
    getAvailableTables,
    clearError
  } = useTables();

  return (
    <div>
      <div data-testid="tables">{JSON.stringify(tables)}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button data-testid="fetch-btn" onClick={() => fetchTables()}>
        Fetch Tables
      </button>
      <button data-testid="create-btn" onClick={() => createTable({ number: 1, name: 'Test Table' })}>
        Create Table
      </button>
      <button data-testid="update-btn" onClick={() => updateTable(1, { name: 'Updated Table' })}>
        Update Table
      </button>
      <button data-testid="delete-btn" onClick={() => deleteTable(1)}>
        Delete Table
      </button>
      <button data-testid="set-status-btn" onClick={() => setTableStatus(1, { occupied: true })}>
        Set Status
      </button>
      <button data-testid="get-by-id-btn" onClick={() => getTableById(1)}>
        Get By ID
      </button>
      <button data-testid="get-available-btn" onClick={getAvailableTables}>
        Get Available
      </button>
      <button data-testid="clear-error-btn" onClick={clearError}>
        Clear Error
      </button>
    </div>
  );
};

describe('TablesContext', () => {
  beforeEach(() => {
    // Reset service mocks
    tablesService.getAllTables.mockClear();
    tablesService.createTable.mockClear();
    tablesService.updateTable.mockClear();
    tablesService.deleteTable.mockClear();
  });

  describe('Initial state', () => {
    test('should initialize with default values', () => {
      tablesService.getAllTables.mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      expect(screen.getByTestId('tables')).toHaveTextContent('[]');
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    test('should fetch tables on mount', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, available: false }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(tablesService.getAllTables).toHaveBeenCalled();
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify(mockTables));
      });
    });
  });

  describe('fetchTables function', () => {
    test('should handle successful fetch', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Test Table' }];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const fetchButton = screen.getByTestId('fetch-btn');
      act(() => {
        fetchButton.click();
      });

      await waitFor(() => {
        expect(tablesService.getAllTables).toHaveBeenCalledTimes(2); // Initial + button click
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify(mockTables));
      });
    });

    test('should handle fetch error', async () => {
      tablesService.getAllTables.mockResolvedValue({ success: false, error: 'Fetch failed' });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Fetch failed');
      });
    });
  });

  describe('createTable function', () => {
    test('should handle creation error', async () => {
      tablesService.createTable.mockResolvedValue({ success: false, error: 'Creation failed' });

      let createFunction;
      const TestComponentWithCreate = () => {
        const { createTable } = useTables();
        createFunction = createTable;
        return <div>Test</div>;
      };

      render(
        <TablesProvider>
          <TestComponentWithCreate />
        </TablesProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(createFunction).toBeDefined();
      });

      await act(async () => {
        const result = await createFunction({ number: 1, name: 'Test' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Creation failed');
      });
    });
  });

  describe('updateTable function', () => {
    test('should handle successful update', async () => {
      const initialTables = [{ id: 1, number: 1, name: 'Old Name' }];
      const updatedTable = { id: 1, number: 1, name: 'Updated Name' };

      tablesService.getAllTables.mockResolvedValue({ success: true, data: initialTables });
      tablesService.updateTable.mockResolvedValue({ success: true, data: updatedTable });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      // Wait for initial tables to load
      await waitFor(() => {
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify(initialTables));
      });

      const updateButton = screen.getByTestId('update-btn');
      act(() => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(tablesService.updateTable).toHaveBeenCalledWith(1, { name: 'Updated Table' });
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify([updatedTable]));
      });
    });
  });

  describe('deleteTable function', () => {
    test('should handle successful deletion', async () => {
      const initialTables = [
        { id: 1, number: 1, name: 'Table 1' },
        { id: 2, number: 2, name: 'Table 2' }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: initialTables });
      tablesService.deleteTable.mockResolvedValue({ success: true });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      // Wait for initial tables to load
      await waitFor(() => {
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify(initialTables));
      });

      const deleteButton = screen.getByTestId('delete-btn');
      act(() => {
        deleteButton.click();
      });

      await waitFor(() => {
        expect(tablesService.deleteTable).toHaveBeenCalledWith(1);
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify([{ id: 2, number: 2, name: 'Table 2' }]));
      });
    });
  });

  describe('setTableStatus function', () => {
    test('should update table status', async () => {
      const initialTables = [{ id: 1, number: 1, name: 'Table 1', available: true }];
      const updatedTable = { id: 1, number: 1, name: 'Table 1', available: true, occupied: true };

      tablesService.getAllTables.mockResolvedValue({ success: true, data: initialTables });
      tablesService.updateTable.mockResolvedValue({ success: true, data: updatedTable });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      // Wait for initial tables to load
      await waitFor(() => {
        expect(screen.getByTestId('tables')).toHaveTextContent(JSON.stringify(initialTables));
      });

      const setStatusButton = screen.getByTestId('set-status-btn');
      act(() => {
        setStatusButton.click();
      });

      await waitFor(() => {
        expect(tablesService.updateTable).toHaveBeenCalledWith(1, { id: 1, number: 1, name: 'Table 1', available: true, occupied: true });
      });
    });

    test('should handle table not found', async () => {
      const initialTables = [{ id: 1, number: 1, name: 'Table 1' }];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: initialTables });

      let setStatusFunction;
      const TestComponentWithSetStatus = () => {
        const { setTableStatus } = useTables();
        setStatusFunction = setTableStatus;
        return <div>Test</div>;
      };

      render(
        <TablesProvider>
          <TestComponentWithSetStatus />
        </TablesProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(setStatusFunction).toBeDefined();
      });

      const result = await setStatusFunction(999, { occupied: true });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mesa no encontrada');
    });
  });

  describe('getTableById function', () => {
    test('should return table by id', async () => {
      const tables = [
        { id: 1, number: 1, name: 'Table 1' },
        { id: 2, number: 2, name: 'Table 2' }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: tables });

      let getTableFunction;
      const TestComponentWithGetTable = () => {
        const { getTableById } = useTables();
        getTableFunction = getTableById;
        return <div>Test</div>;
      };

      render(
        <TablesProvider>
          <TestComponentWithGetTable />
        </TablesProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(getTableFunction).toBeDefined();
      });

      const result = getTableFunction(1);
      expect(result).toEqual({ id: 1, number: 1, name: 'Table 1' });
    });
  });

  describe('getAvailableTables function', () => {
    test('should return available tables', async () => {
      const tables = [
        { id: 1, number: 1, name: 'Table 1', available: true },
        { id: 2, number: 2, name: 'Table 2', available: false, occupied: true },
        { id: 3, number: 3, name: 'Table 3', available: true }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: tables });

      let getAvailableFunction;
      const TestComponentWithGetAvailable = () => {
        const { getAvailableTables } = useTables();
        getAvailableFunction = getAvailableTables;
        return <div>Test</div>;
      };

      render(
        <TablesProvider>
          <TestComponentWithGetAvailable />
        </TablesProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(getAvailableFunction).toBeDefined();
      });

      const result = getAvailableFunction();
      expect(result).toEqual([
        { id: 1, number: 1, name: 'Table 1', available: true },
        { id: 3, number: 3, name: 'Table 3', available: true }
      ]);
    });
  });

  describe('clearError function', () => {
    test('should clear error state', async () => {
      tablesService.getAllTables.mockResolvedValue({ success: false, error: 'Test error' });

      render(
        <TablesProvider>
          <TestComponent />
        </TablesProvider>
      );

      // Wait for error to be set
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error');
      });

      const clearErrorButton = screen.getByTestId('clear-error-btn');
      act(() => {
        clearErrorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  describe('useTables hook', () => {
    test('should throw error when used outside TablesProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTables must be used within a TablesProvider');

      consoleSpy.mockRestore();
    });
  });
});
