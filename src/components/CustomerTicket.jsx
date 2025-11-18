import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerTicket = ({ order, onDownload }) => {
  const ticketRef = useRef();

  // Generate PDF from the ticket
  const generatePDF = async () => {
    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Set margins for better formatting
      const margin = 10; // 10mm margin
      const pdfWidth = 210 - (margin * 2); // A4 width minus margins
      const pdfHeight = 297 - (margin * 2); // A4 height minus margins

      // Calculate dimensions to fit the content within margins
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = margin;

      // Add first page with margins
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Add metadata to PDF
      pdf.setProperties({
        title: `Ticket Cliente #${order.id}`,
        subject: 'Ticket de restaurante',
        author: 'Sistema de Gestión de Pedidos',
        keywords: 'ticket, restaurante, pedido',
        creator: 'Sistema de Gestión de Pedidos'
      });

      // Download the PDF
      const fileName = `ticket-cliente-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
  };

  // Print the ticket
  const handlePrint = () => {
    window.print();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get status label in Spanish
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generatePDF}
          color="primary"
        >
          Descargar PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          color="secondary"
        >
          Imprimir
        </Button>
      </Box>

      {/* Ticket Content */}
      <Paper
        ref={ticketRef}
        elevation={2}
        sx={{
          p: 3,
          maxWidth: 400,
          mx: 'auto',
          backgroundColor: 'white',
          '@media print': {
            boxShadow: 'none',
            border: '1px solid #000'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            🍽️ RESTAURANTE
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ticket del Cliente
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Box>

        {/* Order Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Número de Pedido:</strong> #{order.id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Fecha:</strong> {formatDate(order.createdAt || new Date())}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Mesa:</strong> {order.tableNumber || 'Para llevar'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" component="span">
              <strong>Estado:</strong>
            </Typography>
            <Chip
              label={getStatusLabel(order.status)}
              color={getStatusColor(order.status)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Order Items */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
            Detalle del Pedido
          </Typography>

          {order.items && order.items.map((item, index) => (
            <Box key={index} sx={{ mb: 1, pb: 1, borderBottom: '1px dashed #ccc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.quantity}x {item.name}
                  </Typography>
                  {item.notes && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 0.5 }}>
                      Nota: {item.notes}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ${item.price * item.quantity}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Total: ${order.total || 0}
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
            ¡Gracias por su visita!
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
            Esperamos que disfrute su comida.
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Generado el {new Date().toLocaleString('es-ES')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerTicket;
