import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderTicket from '../OrderTicket';

// Mock jsPDF and html2canvas
jest.mock('jspdf', () => jest.fn());
jest.mock('html2canvas');

// Mock window.print
delete global.window.print;
global.window.print = jest.fn();

const mockOrder = {
  id: 1,
  tableNumber: 5,
  status: 'pending',
  createdAt: '2023-12-25T14:30:00.000Z',
  total: 45.50,
  items: [
    { name: 'Pizza Margherita', quantity: 2, price: 12.50, notes: 'Sin cebolla' },
    { name: 'Coca Cola', quantity: 1, price: 3.50 }
  ]
};

const mockOrderWithoutNotes = {
  id: 2,
  tableNumber: 3,
  status: 'preparing',
  createdAt: '2023-12-25T15:45:00.000Z',
  total: 28.75,
  items: [
    { name: 'Pasta Carbonara', quantity: 1, price: 15.00 },
    { name: 'Agua Mineral', quantity: 2, price: 2.50 }
  ]
};

describe('OrderTicket Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders order ticket with basic information', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByText('🍽️ RESTAURANTE')).toBeInTheDocument();
    expect(screen.getByText('Comanda de Cocina')).toBeInTheDocument();
    expect(screen.getByText('Pedido #:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Mesa:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Estado:')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  test('displays formatted date correctly', () => {
    render(<OrderTicket order={mockOrder} />);

    const expectedDate = new Date('2023-12-25T14:30:00.000Z').toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    expect(screen.getByText('Fecha:')).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  test('renders order items correctly', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByText('2x Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText('1x Coca Cola')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument(); // 2 * 12.50
    expect(screen.getByText('$3.50')).toBeInTheDocument();
  });

  test('displays item notes when present', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByText('Nota: Sin cebolla')).toBeInTheDocument();
  });

  test('does not display notes section when no notes', () => {
    render(<OrderTicket order={mockOrderWithoutNotes} />);

    expect(screen.queryByText('Nota:')).not.toBeInTheDocument();
  });

  test('displays total correctly', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByText('Total: $45.50')).toBeInTheDocument();
  });

  test('displays footer message', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByText('¡Gracias por su preferencia!')).toBeInTheDocument();
  });

  test('displays generation timestamp', () => {
    const originalDate = Date;
    const mockDate = new Date('2023-12-25T16:00:00.000Z');
    global.Date = jest.fn(() => mockDate);
    global.Date.toLocaleString = originalDate.toLocaleString;

    render(<OrderTicket order={mockOrder} />);

    const expectedTimestamp = mockDate.toLocaleString('es-ES');
    expect(screen.getByText(`Generado el ${expectedTimestamp}`)).toBeInTheDocument();

    global.Date = originalDate;
  });

  test('shows download and print buttons', () => {
    render(<OrderTicket order={mockOrder} />);

    expect(screen.getByRole('button', { name: /descargar pdf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /imprimir/i })).toBeInTheDocument();
  });

  test('calls onDownload when provided and PDF generation succeeds', async () => {
    const user = userEvent.setup();
    const mockOnDownload = jest.fn();

    // Mock Date to return a date that gives '2023-12-25' for filename
    const originalDate = Date;
    const mockDateObj = {
      toISOString: () => '2023-12-25T16:00:00.000Z',
      toLocaleString: () => '25/12/2023, 13:00'
    };
    global.Date = jest.fn(() => mockDateObj);

    // Mock html2canvas to resolve successfully
    const mockHtml2canvas = require('html2canvas');
    mockHtml2canvas.mockResolvedValue({
      toDataURL: jest.fn(() => 'data:image/png;base64,mockData')
    });

    // Mock jsPDF
    const mockJsPDF = require('jspdf');
    const mockPdfInstance = {
      addImage: jest.fn(),
      save: jest.fn(),
      addPage: jest.fn(),
      setPage: jest.fn()
    };
    mockJsPDF.mockReturnValue(mockPdfInstance);

    render(<OrderTicket order={mockOrder} onDownload={mockOnDownload} />);

    const downloadButton = screen.getByRole('button', { name: /descargar pdf/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockOnDownload).toHaveBeenCalledTimes(1);
      expect(mockPdfInstance.save).toHaveBeenCalledWith('comanda-1-2023-12-25.pdf');
    });

    global.Date = originalDate;
  });

  test('handles PDF generation errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock html2canvas to reject
    const mockHtml2canvas = require('html2canvas');
    mockHtml2canvas.mockRejectedValue(new Error('Canvas error'));

    render(<OrderTicket order={mockOrder} />);

    const downloadButton = screen.getByRole('button', { name: /descargar pdf/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error generating PDF:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test('calls window.print when print button is clicked', async () => {
    const user = userEvent.setup();

    render(<OrderTicket order={mockOrder} />);

    const printButton = screen.getByRole('button', { name: /imprimir/i });
    await user.click(printButton);

    expect(global.window.print).toHaveBeenCalledTimes(1);
  });

  test('displays status chip with correct color for pending', () => {
    render(<OrderTicket order={mockOrder} />);

    const statusChip = screen.getByText('Pendiente');
    expect(statusChip).toBeInTheDocument();
    // The chip should have outlined variant
    expect(statusChip.closest('[class*="MuiChip-root"]')).toHaveClass('MuiChip-outlined');
  });

  test('displays status chip with correct color for preparing', () => {
    render(<OrderTicket order={mockOrderWithoutNotes} />);

    const statusChip = screen.getByText('Preparando');
    expect(statusChip).toBeInTheDocument();
  });

  test('displays status chip with correct color for ready', () => {
    const readyOrder = { ...mockOrder, status: 'ready' };
    render(<OrderTicket order={readyOrder} />);

    expect(screen.getByText('Listo')).toBeInTheDocument();
  });

  test('displays status chip with correct color for delivered', () => {
    const deliveredOrder = { ...mockOrder, status: 'delivered' };
    render(<OrderTicket order={deliveredOrder} />);

    expect(screen.getByText('Entregado')).toBeInTheDocument();
  });

  test('displays status chip with correct color for cancelled', () => {
    const cancelledOrder = { ...mockOrder, status: 'cancelled' };
    render(<OrderTicket order={cancelledOrder} />);

    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  test('handles order without table number', () => {
    const orderWithoutTable = { ...mockOrder, tableNumber: undefined };
    render(<OrderTicket order={orderWithoutTable} />);

    expect(screen.getByText('Mesa:')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('handles order without createdAt date', () => {
    const orderWithoutDate = { ...mockOrder, createdAt: undefined };
    const originalDate = Date;
    const mockDate = new Date('2023-12-25T16:00:00.000Z');
    global.Date = jest.fn(() => mockDate);

    render(<OrderTicket order={orderWithoutDate} />);

    const expectedDate = mockDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    expect(screen.getByText('Fecha:')).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();

    global.Date = originalDate;
  });

  test('handles order without total', () => {
    const orderWithoutTotal = { ...mockOrder, total: undefined };
    render(<OrderTicket order={orderWithoutTotal} />);

    expect(screen.getByText('Total: $0.00')).toBeInTheDocument();
  });

  test('handles order without items', () => {
    const orderWithoutItems = { ...mockOrder, items: undefined };
    render(<OrderTicket order={orderWithoutItems} />);

    // Should not crash and still show total
    expect(screen.getByText('Total: $45.50')).toBeInTheDocument();
  });

  test('calculates item totals correctly', () => {
    const orderWithComplexItems = {
      ...mockOrder,
      items: [
        { name: 'Pizza', quantity: 3, price: 10.00 }, // 3 * 10.00 = 30.00
        { name: 'Drink', quantity: 2, price: 5.50 }   // 2 * 5.50 = 11.00
      ],
      total: 41.00
    };

    render(<OrderTicket order={orderWithComplexItems} />);

    expect(screen.getByText('$30.00')).toBeInTheDocument();
    expect(screen.getByText('$11.00')).toBeInTheDocument();
    expect(screen.getByText('Total: $41.00')).toBeInTheDocument();
  });

  test('applies correct styling to ticket paper', () => {
    render(<OrderTicket order={mockOrder} />);

    const ticketPaper = screen.getByText('🍽️ RESTAURANTE').closest('[class*="MuiPaper-root"]');
    expect(ticketPaper).toHaveStyle('max-width: 400px');
    expect(ticketPaper).toHaveStyle('background-color: rgb(255, 255, 255)');
  });

  test('ticket has correct print styles', () => {
    render(<OrderTicket order={mockOrder} />);

    const ticketPaper = screen.getByText('🍽️ RESTAURANTE').closest('[class*="MuiPaper-root"]');
    // Check that it has some elevation/box-shadow (default for Paper component)
    expect(ticketPaper).toHaveStyle('box-shadow: var(--Paper-shadow)');
  });
});
