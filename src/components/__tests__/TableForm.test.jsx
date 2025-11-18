import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TableForm from '../TableForm';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Box: ({ children, component, onSubmit, ...props }) => {
    if (component === 'form') {
      return <form onSubmit={onSubmit} {...props}>{children}</form>;
    }
    return <div {...props}>{children}</div>;
  },
  Button: ({ children, onClick, type, variant, disabled, ...props }) => (
    <button onClick={onClick} type={type} disabled={disabled} {...props}>{children}</button>
  ),
  TextField: ({ label, name, value, onChange, required, error, helperText, type, ...props }) => {
    const id = `input-${name}`;
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          type={type || 'text'}
          {...props}
        />
        {error && helperText && <span data-testid={`error-${name}`}>{helperText}</span>}
      </div>
    );
  },
  Typography: ({ children, variant, gutterBottom }) => <div>{children}</div>,
  Paper: ({ children, elevation }) => <div data-testid="paper">{children}</div>,
  FormControlLabel: ({ control, label }) => (
    <label>
      {control}
      {label}
    </label>
  ),
  Switch: ({ checked, onChange, name }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      name={name}
      data-testid="available-switch"
    />
  ),
}));

// Mock the validateField function
jest.mock('../../utils/validations', () => ({
  validateField: jest.fn(() => null),
}));

describe('TableForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Initial render', () => {
    test('should render create form with default values', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Nueva Mesa')).toBeInTheDocument();
      expect(screen.getByLabelText('Número')).toBeInTheDocument();
      expect(screen.getByText('Crear')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    test('should render edit form with initial data', () => {
      const initialData = {
        id: 1,
        number: '5',
        name: 'Corner Table',
        capacity: '4',
        location: 'Window',
        available: false
      };

      render(
        <TableForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Editar Mesa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Corner Table')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Window')).toBeInTheDocument();
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    test('should initialize with default available value as true', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const switchElement = screen.getByTestId('available-switch');
      expect(switchElement).toBeChecked();
    });
  });

  describe('Form interactions', () => {
    test('should update form data when inputs change', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const numberInput = screen.getByLabelText('Número');
      const nameInput = screen.getByLabelText('Nombre');
      const capacityInput = screen.getByLabelText('Capacidad');
      const locationInput = screen.getByLabelText('Ubicación');

      fireEvent.change(numberInput, { target: { name: 'number', value: '10' } });
      fireEvent.change(nameInput, { target: { name: 'name', value: 'Test Table' } });
      fireEvent.change(capacityInput, { target: { name: 'capacity', value: '6' } });
      fireEvent.change(locationInput, { target: { name: 'location', value: 'Center' } });

      expect(numberInput).toHaveValue('10');
      expect(nameInput).toHaveValue('Test Table');
      expect(capacityInput).toHaveValue(6);
      expect(locationInput).toHaveValue('Center');
    });

    test('should toggle available switch', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const switchElement = screen.getByTestId('available-switch');
      expect(switchElement).toBeChecked();

      fireEvent.click(switchElement);
      expect(switchElement).not.toBeChecked();

      fireEvent.click(switchElement);
      expect(switchElement).toBeChecked();
    });
  });

  describe('Form validation', () => {
    test('should prevent submission when required fields are empty', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByText('Crear');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should allow submission when all required fields are filled', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields
      const numberInput = screen.getByLabelText('Número');
      const nameInput = screen.getByLabelText('Nombre');
      const capacityInput = screen.getByLabelText('Capacidad');

      fireEvent.change(numberInput, { target: { name: 'number', value: '1' } });
      fireEvent.change(nameInput, { target: { name: 'name', value: 'Test Table' } });
      fireEvent.change(capacityInput, { target: { name: 'capacity', value: '4' } });

      const submitButton = screen.getByText('Crear');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        number: '1',
        name: 'Test Table',
        capacity: 4,
        location: '',
        available: true
      });
    });
  });

  describe('Form submission', () => {
    test('should submit form with correct data for create', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill form
      const numberInput = screen.getByLabelText('Número');
      const nameInput = screen.getByLabelText('Nombre');
      const capacityInput = screen.getByLabelText('Capacidad');
      const locationInput = screen.getByLabelText('Ubicación');

      fireEvent.change(numberInput, { target: { name: 'number', value: '5' } });
      fireEvent.change(nameInput, { target: { name: 'name', value: 'Corner Table' } });
      fireEvent.change(capacityInput, { target: { name: 'capacity', value: '4' } });
      fireEvent.change(locationInput, { target: { name: 'location', value: 'Window' } });

      // Uncheck available switch
      const switchElement = screen.getByTestId('available-switch');
      fireEvent.click(switchElement);

      const submitButton = screen.getByText('Crear');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        number: '5',
        name: 'Corner Table',
        capacity: 4, // Should be converted to number
        location: 'Window',
        available: false
      });
    });

    test('should submit form with correct data for update', () => {
      const initialData = {
        id: 1,
        number: '1',
        name: 'Old Name',
        capacity: '2',
        location: 'Old Location',
        available: true
      };

      render(
        <TableForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Modify some fields
      const nameInput = screen.getByDisplayValue('Old Name');
      const capacityInput = screen.getByDisplayValue('2');

      fireEvent.change(nameInput, { target: { name: 'name', value: 'Updated Name' } });
      fireEvent.change(capacityInput, { target: { name: 'capacity', value: '6' } });

      const submitButton = screen.getByText('Actualizar');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: 1,
        number: '1',
        name: 'Updated Name',
        capacity: 6, // Should be converted to number
        location: 'Old Location',
        available: true
      });
    });

    test('should disable submit button when loading', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const submitButton = screen.getByText('Guardando...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Cancel functionality', () => {
    test('should call onCancel when cancel button is clicked', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('should not show cancel button when onCancel is not provided', () => {
      render(
        <TableForm
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
    });
  });

  describe('Form reset on initialData change', () => {
    test('should reset form when initialData changes', () => {
      const { rerender } = render(
        <TableForm
          initialData={{ number: '1', name: 'Table 1', capacity: '4' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('1')).toBeInTheDocument();

      // Change initialData
      rerender(
        <TableForm
          initialData={{ number: '2', name: 'Table 2', capacity: '6' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Table 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    });
  });
});
