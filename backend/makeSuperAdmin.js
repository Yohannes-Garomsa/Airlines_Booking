const db = require('./config/db');

const email = 'admin@skybound.com'; // You can change this to your preferred email

async function makeSuperAdmin() {
  try {
    const result = await db.query(
      "UPDATE users SET role = 'superadmin' WHERE email = $1 RETURNING *",
      [email]
    );

    if (result.rows.length > 0) {
      console.log(`--- SUCCESS ---`);
      console.log(`User ${email} is now a SUPER ADMIN.`);
      console.log(`Role: ${result.rows[0].role}`);
    } else {
      console.log(`--- ERROR ---`);
      console.log(`User ${email} not found. Please register first.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

makeSuperAdmin();
