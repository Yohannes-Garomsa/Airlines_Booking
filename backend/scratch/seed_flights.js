const db = require('../config/db');

// Airport IDs: 1=Dubai, 2=London, 3=New York, 4=Tokyo, 5=Singapore
//              6=Paris, 7=Doha, 8=Istanbul, 9=Los Angeles, 10=Hong Kong
//              11=Addis Ababa, 12=Nairobi, 13=Cairo, 14=Frankfurt, 15=Amsterdam
// Airline IDs: 1=Ethiopian, 2=Emirates, 3=Qatar, 4=Singapore, 5=Turkish, 6=Lufthansa, 7=BA
// Aircraft IDs: 1-5

const now = new Date();
const d = (days, hours = 0) => {
  const t = new Date(now);
  t.setDate(t.getDate() + days);
  t.setHours(hours, 0, 0, 0);
  return t.toISOString();
};
const gates = ['A1','A2','A3','B1','B2','B3','C1','C2','C3','D4','E5'];
const terms = ['T1','T2','T3'];
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

const flights = [
  // Ethiopian Airlines (airline_id=1)
  { dep:11, arr:1,  depT:d(1,6),  arrT:d(1,12), al:1, num:'ET601', price:480,  ac:1 },
  { dep:11, arr:2,  depT:d(1,8),  arrT:d(1,18), al:1, num:'ET501', price:620,  ac:2 },
  { dep:11, arr:3,  depT:d(2,22), arrT:d(3,14), al:1, num:'ET509', price:890,  ac:3 },
  { dep:11, arr:12, depT:d(1,9),  arrT:d(1,11), al:1, num:'ET321', price:220,  ac:1 },
  { dep:11, arr:7,  depT:d(2,6),  arrT:d(2,10), al:1, num:'ET685', price:390,  ac:2 },
  { dep:11, arr:13, depT:d(1,10), arrT:d(1,13), al:1, num:'ET722', price:310,  ac:1 },
  { dep:11, arr:8,  depT:d(3,7),  arrT:d(3,13), al:1, num:'ET409', price:540,  ac:3 },

  // Emirates (airline_id=2)
  { dep:1,  arr:2,  depT:d(1,10), arrT:d(1,17), al:2, num:'EK001', price:750,  ac:4 },
  { dep:1,  arr:3,  depT:d(1,14), arrT:d(2,4),  al:2, num:'EK201', price:1100, ac:5 },
  { dep:1,  arr:6,  depT:d(2,7),  arrT:d(2,13), al:2, num:'EK073', price:680,  ac:4 },
  { dep:1,  arr:9,  depT:d(3,2),  arrT:d(3,16), al:2, num:'EK215', price:950,  ac:3 },
  { dep:1,  arr:11, depT:d(1,20), arrT:d(2,2),  al:2, num:'EK723', price:460,  ac:2 },

  // Qatar Airways (airline_id=3)
  { dep:7,  arr:2,  depT:d(1,6),  arrT:d(1,12), al:3, num:'QR001', price:700,  ac:2 },
  { dep:7,  arr:4,  depT:d(2,1),  arrT:d(2,17), al:3, num:'QR807', price:980,  ac:5 },
  { dep:7,  arr:11, depT:d(1,9),  arrT:d(1,13), al:3, num:'QR139', price:380,  ac:1 },
  { dep:7,  arr:9,  depT:d(3,14), arrT:d(4,4),  al:3, num:'QR740', price:870,  ac:4 },

  // British Airways (airline_id=7)
  { dep:2,  arr:3,  depT:d(1,11), arrT:d(1,21), al:7, num:'BA177', price:820,  ac:3 },
  { dep:2,  arr:14, depT:d(2,7),  arrT:d(2,10), al:7, num:'BA902', price:310,  ac:2 },
  { dep:2,  arr:1,  depT:d(3,15), arrT:d(3,23), al:7, num:'BA109', price:740,  ac:4 },

  // Turkish Airlines (airline_id=5)
  { dep:8,  arr:2,  depT:d(1,8),  arrT:d(1,11), al:5, num:'TK001', price:430,  ac:2 },
  { dep:8,  arr:11, depT:d(2,14), arrT:d(2,19), al:5, num:'TK607', price:510,  ac:1 },
  { dep:8,  arr:3,  depT:d(2,10), arrT:d(2,21), al:5, num:'TK003', price:590,  ac:3 },

  // Singapore Airlines (airline_id=4)
  { dep:5,  arr:4,  depT:d(1,7),  arrT:d(1,13), al:4, num:'SQ621', price:560,  ac:5 },
  { dep:5,  arr:2,  depT:d(2,22), arrT:d(3,6),  al:4, num:'SQ317', price:790,  ac:4 },
  { dep:5,  arr:9,  depT:d(3,0),  arrT:d(3,16), al:4, num:'SQ011', price:840,  ac:5 },

  // Lufthansa (airline_id=6)
  { dep:14, arr:3,  depT:d(1,12), arrT:d(1,22), al:6, num:'LH400', price:870,  ac:3 },
  { dep:14, arr:2,  depT:d(1,6),  arrT:d(1,8),  al:6, num:'LH902', price:280,  ac:2 },
  { dep:14, arr:11, depT:d(2,9),  arrT:d(2,14), al:6, num:'LH592', price:620,  ac:1 },
];

const seed = async () => {
  console.log(`Seeding ${flights.length} flights...`);
  let count = 0;
  for (const f of flights) {
    const ac = await db.query('SELECT economy_capacity, business_capacity FROM aircraft WHERE id = $1', [f.ac]);
    const economy_seats  = ac.rows[0].economy_capacity;
    const business_seats = ac.rows[0].business_capacity;
    const total_seats    = economy_seats + business_seats;
    const business_price = (f.price * 1.1).toFixed(2);

    await db.query(`
      INSERT INTO flights 
        (airline_id, flight_number, departure_airport_id, arrival_airport_id,
         departure_time, arrival_time, economy_price, business_price,
         economy_seats, business_seats, total_seats, available_seats,
         aircraft_id, status, gate, terminal)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    `, [
      f.al, f.num, f.dep, f.arr,
      f.depT, f.arrT, f.price, business_price,
      economy_seats, business_seats, total_seats, total_seats,
      f.ac, 'Scheduled', rnd(gates), rnd(terms)
    ]);
    count++;
    process.stdout.write(`\r  Inserted ${count}/${flights.length}`);
  }
  console.log('\nDone! ✓');
  process.exit(0);
};

seed().catch(e => { console.error('\nError:', e.message); process.exit(1); });
