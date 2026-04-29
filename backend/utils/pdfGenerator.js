const PDFDocument = require('pdfkit');

const generateTicketPDF = (booking, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // Header
  doc.rect(0, 0, 612, 100).fill('#1e3a8a');
  doc.fillColor('white')
     .fontSize(25)
     .text('SKYBOUND AIRLINES', 50, 35, { characterSpacing: 2 });
  
  doc.fontSize(10)
     .text('E-TICKET / BOARDING PASS', 50, 65);

  // Booking Info
  doc.fillColor('black').fontSize(12);
  doc.text(`Booking Reference: #SB-${booking.id}00${booking.id}`, 50, 120, { bold: true });
  doc.text(`Status: ${booking.status.toUpperCase()}`, 400, 120);

  doc.moveDown();
  doc.lineWidth(1).moveTo(50, 145).lineTo(550, 145).stroke();

  // Flight Details Section
  doc.fontSize(14).text('FLIGHT INFORMATION', 50, 170, { underline: true });
  
  doc.fontSize(12);
  doc.text(`Airline: ${booking.airline}`, 50, 200);
  doc.text(`Flight Date: ${new Date(booking.departure_time).toLocaleDateString()}`, 300, 200);
  
  doc.fontSize(20).text(`${booking.departure_city}`, 50, 240);
  doc.fontSize(12).text('FROM', 50, 230);
  
  doc.fontSize(20).text('>>>>>', 250, 240);
  
  doc.fontSize(20).text(`${booking.arrival_city}`, 400, 240);
  doc.fontSize(12).text('TO', 400, 230);

  doc.fontSize(12);
  doc.text(`Departure: ${new Date(booking.departure_time).toLocaleTimeString()}`, 50, 280);
  doc.text(`Arrival: ${new Date(booking.arrival_time).toLocaleTimeString()}`, 400, 280);

  doc.moveDown(2);
  doc.lineWidth(1).moveTo(50, 310).lineTo(550, 310).stroke();

  // Passenger Section
  doc.fontSize(14).text('PASSENGER DETAILS', 50, 340, { underline: true });
  
  booking.passengers.forEach((p, index) => {
    doc.fontSize(12).text(`${index + 1}. ${p.name} (${p.email || 'N/A'})`, 70, 370 + (index * 20));
  });

  // Footer / QR Mock
  doc.rect(400, 450, 100, 100).stroke();
  doc.fontSize(8).text('SCAN FOR BOARDING', 407, 555);
  
  doc.fontSize(10)
     .fillColor('gray')
     .text('Thank you for choosing SkyBound Airlines. Please arrive at the airport 2 hours before departure.', 50, 700, { align: 'center' });

  doc.end();
};

module.exports = { generateTicketPDF };
