const db = require('../config/db');

const mapToFrontend = (row) => ({
  id: row.id,
  paxId: row.pax_id,
  firstName: row.first_name,
  middleName: row.middle_name,
  lastName: row.last_name,
  gender: row.gender,
  dateOfBirth: row.date_of_birth,
  flightType: row.flight_type,
  documentType: row.document_type,
  fanNumber: row.fan_number,
  finNumber: row.fin_number,
  passportNumber: row.passport_number,
  passportExpiry: row.passport_expiry,
  nationality: row.nationality,
  passportCountry: row.passport_country,
  passportIssueDate: row.passport_issue_date,
  passportType: row.passport_type,
  residenceCountry: row.residence_country,
  dualCitizenship: row.dual_citizenship,
  phoneNumber: row.phone_number,
  email: row.email,
  emergencyContactName: row.emergency_contact_name,
  emergencyContactPhone: row.emergency_contact_phone,
  emergencyRelationship: row.emergency_relationship,
  status: row.status,
  adminNotes: row.admin_notes,
  registrationDate: row.created_at,
  updatedAt: row.updated_at
});

const getAllPassengers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM passengers ORDER BY created_at DESC');
    res.json(result.rows.map(mapToFrontend));
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({ message: 'Error fetching passengers' });
  }
};

const getPassengerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM passengers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json(mapToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error fetching passenger:', error);
    res.status(500).json({ message: 'Error fetching passenger' });
  }
};

const createPassenger = async (req, res) => {
  const {
    firstName, middleName, lastName, gender, dateOfBirth, flightType,
    documentType, fanNumber, finNumber, passportNumber, passportExpiry,
    nationality, passportCountry, passportIssueDate, passportType,
    residenceCountry, dualCitizenship, phoneNumber, email,
    emergencyContactName, emergencyContactPhone, emergencyRelationship,
    status, adminNotes
  } = req.body;

  try {
    const pax_id = 'PAX-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const query = `
      INSERT INTO passengers (
        pax_id, first_name, middle_name, last_name, gender, date_of_birth, flight_type,
        document_type, fan_number, fin_number, passport_number, passport_expiry,
        nationality, passport_country, passport_issue_date, passport_type,
        residence_country, dual_citizenship, phone_number, email,
        emergency_contact_name, emergency_contact_phone, emergency_relationship,
        status, admin_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *
    `;

    const values = [
      pax_id, firstName, middleName, lastName, gender, dateOfBirth, flightType,
      documentType, fanNumber, finNumber, passportNumber, passportExpiry,
      nationality, passportCountry, passportIssueDate, passportType,
      residenceCountry, dualCitizenship, phoneNumber, email,
      emergencyContactName, emergencyContactPhone, emergencyRelationship,
      status || 'Pending', adminNotes
    ];

    const result = await db.query(query, values);
    res.status(201).json(mapToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error creating passenger:', error);
    res.status(500).json({ message: 'Error creating passenger' });
  }
};

const updatePassenger = async (req, res) => {
  const { id } = req.params;
  const {
    firstName, middleName, lastName, gender, dateOfBirth, flightType,
    documentType, fanNumber, finNumber, passportNumber, passportExpiry,
    nationality, passportCountry, passportIssueDate, passportType,
    residenceCountry, dualCitizenship, phoneNumber, email,
    emergencyContactName, emergencyContactPhone, emergencyRelationship,
    status, adminNotes
  } = req.body;

  try {
    const query = `
      UPDATE passengers SET
        first_name = $1, middle_name = $2, last_name = $3, gender = $4, date_of_birth = $5, flight_type = $6,
        document_type = $7, fan_number = $8, fin_number = $9, passport_number = $10, passport_expiry = $11,
        nationality = $12, passport_country = $13, passport_issue_date = $14, passport_type = $15,
        residence_country = $16, dual_citizenship = $17, phone_number = $18, email = $19,
        emergency_contact_name = $20, emergency_contact_phone = $21, emergency_relationship = $22,
        status = $23, admin_notes = $24, updated_at = CURRENT_TIMESTAMP
      WHERE id = $25 RETURNING *
    `;

    const values = [
      firstName, middleName, lastName, gender, dateOfBirth, flightType,
      documentType, fanNumber, finNumber, passportNumber, passportExpiry,
      nationality, passportCountry, passportIssueDate, passportType,
      residenceCountry, dualCitizenship, phoneNumber, email,
      emergencyContactName, emergencyContactPhone, emergencyRelationship,
      status, adminNotes, id
    ];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json(mapToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error updating passenger:', error);
    res.status(500).json({ message: 'Error updating passenger' });
  }
};

const deletePassenger = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM passengers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json({ message: 'Passenger deleted successfully' });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    res.status(500).json({ message: 'Error deleting passenger' });
  }
};

const verifyPassenger = async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    const result = await db.query(
      'UPDATE passengers SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, adminNotes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json(mapToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error verifying passenger:', error);
    res.status(500).json({ message: 'Error verifying passenger' });
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  verifyPassenger
};
