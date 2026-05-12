const db = require('../backend/config/db');

async function fixForeignKey() {
  try {
    console.log('Adding ON DELETE CASCADE to bookings(user_id)...');
    
    // First, find the constraint name
    const constraintResult = await db.query(`
      SELECT constraint_name 
      FROM information_schema.key_column_usage 
      WHERE table_name = 'bookings' AND column_name = 'user_id'
    `);
    
    if (constraintResult.rows.length > 0) {
      const constraintName = constraintResult.rows[0].constraint_name;
      console.log(`Found constraint: ${constraintName}`);
      
      await db.query(`ALTER TABLE bookings DROP CONSTRAINT ${constraintName}`);
      await db.query(`ALTER TABLE bookings ADD CONSTRAINT ${constraintName} FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
      
      console.log('Constraint updated successfully!');
    } else {
      console.log('Constraint not found. It might already be set or name is different.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error fixing foreign key:', err);
    process.exit(1);
  }
}

fixForeignKey();
