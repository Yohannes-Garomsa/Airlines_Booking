const PDFDocument = require('pdfkit');

const generateTicketPDF = (ticket, stream) => {
  const doc = new PDFDocument({ 
    size: 'A4',
    margin: 0
  });

  doc.pipe(stream);

  // Background Colors
  const primaryColor = '#1e3a8a';
  const secondaryColor = '#f8fafc';
  const accentColor = '#3b82f6';

  // --- Header ---
  doc.rect(0, 0, 595, 120).fill(primaryColor);
  
  doc.fillColor('white')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('SKYBOUND', 40, 35, { characterSpacing: 4 });
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('AIRLINES BOARDING PASS', 42, 70);

  doc.fillColor('white')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(ticket.cabin_class || 'ECONOMY', 450, 45, { align: 'right' });

  // --- Main Ticket Section ---
  doc.rect(0, 120, 595, 280).fill(secondaryColor);

  // Route Info
  doc.fillColor(primaryColor)
     .fontSize(50)
     .font('Helvetica-Bold')
     .text(ticket.departure_iata, 40, 160);
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('gray')
     .text(ticket.departure_city.toUpperCase(), 45, 215);

  // Plane Icon Mock
  doc.fillColor(accentColor)
     .fontSize(20)
     .text('✈', 280, 175);
  doc.rect(140, 185, 130, 2).fill(accentColor);
  doc.rect(320, 185, 130, 2).fill(accentColor);

  doc.fillColor(primaryColor)
     .fontSize(50)
     .font('Helvetica-Bold')
     .text(ticket.arrival_iata, 450, 160, { align: 'right' });

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('gray')
     .text(ticket.arrival_city.toUpperCase(), 450, 215, { align: 'right' });

  // Details Grid
  const gridY = 260;
  
  // Passenger
  doc.fillColor('gray').fontSize(8).text('PASSENGER NAME', 40, gridY);
  doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(ticket.passenger_name.toUpperCase(), 40, gridY + 12);

  // Flight Info
  doc.fillColor('gray').fontSize(8).text('FLIGHT', 250, gridY);
  doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(ticket.flight_number || 'SB101', 250, gridY + 12);

  // Date
  doc.fillColor('gray').fontSize(8).text('DATE', 450, gridY);
  doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(new Date(ticket.departure_time).toLocaleDateString(), 450, gridY + 12);

  // Row 2
  const gridY2 = 320;
  
  // Gate
  doc.fillColor('gray').fontSize(8).text('GATE', 40, gridY2);
  doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(ticket.gate || 'B24', 40, gridY2 + 12);

  // Seat
  doc.fillColor('gray').fontSize(8).text('SEAT', 140, gridY2);
  doc.fillColor('black').fontSize(18).font('Helvetica-Bold').text(ticket.seat_number || '14A', 140, gridY2 + 12);

  // Boarding Time
  doc.rect(240, gridY2 - 10, 150, 50).fill('#eff6ff');
  doc.fillColor(accentColor).fontSize(8).text('BOARDING TIME', 250, gridY2);
  doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text(new Date(ticket.boarding_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 250, gridY2 + 12);

  // PNR
  doc.fillColor('gray').fontSize(8).text('BOOKING REF (PNR)', 450, gridY2);
  doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(ticket.pnr || 'XJ82K1', 450, gridY2 + 12);

  // --- QR Section ---
  if (ticket.qr_code_data) {
    const qrImage = ticket.qr_code_data.split(',')[1];
    const qrBuffer = Buffer.from(qrImage, 'base64');
    doc.image(qrBuffer, 440, 450, { width: 120 });
  }

  doc.fillColor('gray').fontSize(8).text('SCAN AT GATE', 475, 575);
  
  // Ticket Number
  doc.fillColor('lightgray')
     .fontSize(8)
     .text(`TICKET NO: ${ticket.ticket_number}`, 40, 580);

  // --- Legal / Info ---
  doc.rect(40, 620, 515, 100).dash(5, { space: 5 }).stroke('#cbd5e1');
  doc.fillColor('black').fontSize(10).font('Helvetica-Bold').text('IMPORTANT INFORMATION', 60, 640);
  doc.fillColor('gray').fontSize(8).font('Helvetica')
     .text('• Please arrive at the airport at least 2 hours before departure.', 60, 660)
     .text('• Gate closes 20 minutes before scheduled departure.', 60, 675)
     .text('• Carry valid government-issued ID and travel documents.', 60, 690);

  // Final End
  doc.end();
};

module.exports = { generateTicketPDF };
