import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AdminTables from '../AdminTables';
import { TablesProvider } from '../../context/TablesContext';
import tablesService from '../../services/tables/tablesService';

// Mock the tables service
jest.mock('../../services/tables/tablesService');

// Mock Material-UI components that might cause issues
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  TableContainer: ({ children }) => <div data-testid="table-container">{children}</div>,
  Table: ({ children }) => <table>{children}</table>,
  TableHead: ({ children }) => <thead>{children}</thead>,
  TableBody: ({ children }) => <tbody>{children}</tbody>,
  TableRow: ({ children }) => <tr>{children}</tr>,
  TableCell: ({ children }) => <td>{children}</td>,
  IconButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material/Edit', () => () => <span>Edit</span>);
jest.mock('@mui/icons-material/Delete', () => () => <span>Delete</span>);
jest.mock('@mui/icons-material/Add', () => () => <span>Add</span>);

// Mock TableForm component
jest.mock('../TableForm', () => {
  return function MockTableForm({ onSubmit, onCancel, loading, initialData }) {
    return (
      <div data-testid="table-form">
        <button
          data-testid="submit-form"
          onClick={() => onSubmit({ number: 1, name: 'Test Table', capacity: 4 })}
          disabled={loading}
        >
          Submit
        </button>
        <button data-testid="cancel-form" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

// Mock window.confirm
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

describe('AdminTables', () => {
  beforeEach(() => {
    // Reset service mocks
    tablesService.getAllTables.mockClear();
    tablesService.createTable.mockClear();
    tablesService.updateTable.mockClear();
    tablesService.deleteTable.mockClear();
    mockConfirm.mockClear();
  });

  describe('Initial render', () => {
    test('should render loading state initially', () => {
      tablesService.getAllTables.mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      expect(screen.getByText('Administración de Mesas')).toBeInTheDocument();
    });

    test('should render tables when loaded', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4, location: 'Window', available: true },
        { id: 2, number: 2, name: 'Table 2', capacity: 6, location: 'Center', available: false }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Table 1')).toBeInTheDocument();
        expect(screen.getByText('Table 2')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByText('Window')).toBeInTheDocument();
        expect(screen.getByText('Center')).toBeInTheDocument();
        expect(screen.getAllByText('Sí')).toHaveLength(1);
        expect(screen.getAllByText('No')).toHaveLength(1);
      });
    });

    test('should show error message when fetch fails', async () => {
      tablesService.getAllTables.mockResolvedValue({ success: false, error: 'Failed to load tables' });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load tables')).toBeInTheDocument();
      });
    });
  });

  describe('Create table', () => {
    test('should show form when create button is clicked', async () => {
      const mockTables = [];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Nueva Mesa')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Nueva Mesa');
      fireEvent.click(createButton);

      expect(screen.getByTestId('table-form')).toBeInTheDocument();
    });

    test('should create table successfully', async () => {
      const mockTables = [];
      const newTable = { id: 1, number: 1, name: 'Test Table', capacity: 4 };

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      tablesService.createTable.mockResolvedValue({ success: true, data: newTable });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const createButton = screen.getByText('Nueva Mesa');
        fireEvent.click(createButton);
      });

      const submitButton = screen.getByTestId('submit-form');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(tablesService.createTable).toHaveBeenCalledWith({ number: 1, name: 'Test Table', capacity: 4 });
        expect(screen.getByText('Test Table')).toBeInTheDocument();
      });
    });

    test('should show error when create fails', async () => {
      const mockTables = [];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      tablesService.createTable.mockResolvedValue({ success: false, error: 'Create failed' });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const createButton = screen.getByText('Nueva Mesa');
        fireEvent.click(createButton);
      });

      const submitButton = screen.getByTestId('submit-form');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Create failed')).toBeInTheDocument();
      });
    });
  });

  describe('Update table', () => {
    test('should show form with data when edit button is clicked', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4, location: 'Window', available: true }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByTestId('table-form')).toBeInTheDocument();
    });

    test('should update table successfully', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4 }];
      const updatedTable = { id: 1, number: 1, name: 'Updated Table', capacity: 4 };

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      tablesService.updateTable.mockResolvedValue({ success: true, data: updatedTable });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
      });

      const submitButton = screen.getByTestId('submit-form');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(tablesService.updateTable).toHaveBeenCalledWith(1, { number: 1, name: 'Test Table', capacity: 4 });
        expect(screen.getByText('Updated Table')).toBeInTheDocument();
      });
    });
  });

  describe('Delete table', () => {
    test('should delete table when confirmed', async () => {
      const mockTables = [
        { id: 1, number: 1, name: 'Table 1', capacity: 4 },
        { id: 2, number: 2, name: 'Table 2', capacity: 6 }
      ];

      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      tablesService.deleteTable.mockResolvedValue({ success: true });
      mockConfirm.mockReturnValue(true);

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith('¿Eliminar mesa?');
        expect(tablesService.deleteTable).toHaveBeenCalledWith(1);
        expect(screen.queryByText('Table 1')).not.toBeInTheDocument();
        expect(screen.getByText('Table 2')).toBeInTheDocument();
      });
    });

    test('should not delete table when not confirmed', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4 }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      mockConfirm.mockReturnValue(false);

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      expect(mockConfirm).toHaveBeenCalledWith('¿Eliminar mesa?');
      expect(tablesService.deleteTable).not.toHaveBeenCalled();
      expect(screen.getByText('Table 1')).toBeInTheDocument();
    });

    test('should show error when delete fails', async () => {
      const mockTables = [{ id: 1, number: 1, name: 'Table 1', capacity: 4 }];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });
      tablesService.deleteTable.mockResolvedValue({ success: false, error: 'Delete failed' });
      mockConfirm.mockReturnValue(true);

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Delete failed')).toBeInTheDocument();
      });
    });
  });

  describe('Form interactions', () => {
    test('should hide form when cancel is clicked', async () => {
      const mockTables = [];
      tablesService.getAllTables.mockResolvedValue({ success: true, data: mockTables });

      render(
        <TablesProvider>
          <AdminTables />
        </TablesProvider>
      );

      await waitFor(() => {
        const createButton = screen.getByText('Nueva Mesa');
        fireEvent.click(createButton);
      });

      expect(screen.getByTestId('table-form')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel-form');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('table-form')).not.toBeInTheDocument();
    });
  });
});
