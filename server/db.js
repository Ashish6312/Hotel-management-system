const { Pool, types } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Set pg type parsers to return numeric fields as JS Numbers
types.setTypeParser(1700, (val) => parseFloat(val)); // NUMERIC
types.setTypeParser(20, (val) => parseInt(val, 10));  // INT8 / BIGINT

// Load environment variables in case they are not already loaded
dotenv.config();

const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper to convert SQLite "?" placeholders to PostgreSQL "$1", "$2", etc.
function convertPlaceholders(sql) {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

// Promise wrappers for PG pool
const query = async (sql, params = []) => {
  const finalSql = convertPlaceholders(sql);
  const res = await pool.query(finalSql, params);
  return res.rows;
};

const get = async (sql, params = []) => {
  const finalSql = convertPlaceholders(sql);
  const res = await pool.query(finalSql, params);
  return res.rows[0] || null;
};

const run = async (sql, params = []) => {
  let finalSql = convertPlaceholders(sql);
  
  // Detect if this is an INSERT statement
  const isInsert = finalSql.trim().toLowerCase().startsWith('insert');
  
  // Append RETURNING id to get the auto-generated ID for inserts
  if (isInsert && !finalSql.toLowerCase().includes('returning')) {
    finalSql += ' RETURNING id';
  }
  
  const res = await pool.query(finalSql, params);
  
  let lastID = null;
  if (isInsert && res.rows.length > 0) {
    // Return the id of the first returned row
    lastID = res.rows[0].id;
  }
  
  return { lastID, changes: res.rowCount };
};

const exec = async (sql) => {
  // Execute raw query block (supports multiple statements in pg)
  await pool.query(sql);
};

// Seed initial data
async function seedData() {
  console.log('Seeding initial data...');
  
  // 1. Seed Staff (Indian Names)
  const staff = [
    ['Priya Sharma', 'Receptionist', 'priya@grandview.co.in', '+91 98765 43210', 'Active'],
    ['Arjun Mehta', 'Manager', 'arjun@grandview.co.in', '+91 98234 56789', 'Active'],
    ['Rajesh Kumar', 'Housekeeper', 'rajesh@grandview.co.in', '+91 97654 32109', 'Active'],
    ['Karan Singh', 'Security', 'karan@grandview.co.in', '+91 96543 21098', 'Active'],
    ['Sunita Rao', 'Housekeeper', 'sunita@grandview.co.in', '+91 95432 10987', 'Off-Duty']
  ];
  for (const member of staff) {
    await run(
      'INSERT INTO staff (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      member
    );
  }

  // 2. Seed Rooms (20 total rooms: Single, Double, Deluxe, Suite - Prices in INR)
  const rooms = [
    // 1st Floor - Single Rooms (₹2,500)
    ['101', 'Single', 'Available', 2500.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['102', 'Single', 'Available', 2500.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['103', 'Single', 'Maintenance', 2500.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['104', 'Single', 'Available', 2700.00, 'Free WiFi, AC, Smart TV, Balcony, Shower'],
    ['105', 'Single', 'Available', 2500.00, 'Free WiFi, AC, Smart TV, Shower'],
    // 2nd Floor - Double Rooms (₹4,500)
    ['201', 'Double', 'Available', 4500.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['202', 'Double', 'Available', 4500.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['203', 'Double', 'Available', 4700.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Balcony, Bath'],
    ['204', 'Double', 'Available', 4500.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['205', 'Double', 'Available', 4500.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    // 3rd Floor - Deluxe Rooms (₹7,500)
    ['301', 'Deluxe', 'Available', 7500.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['302', 'Deluxe', 'Available', 7500.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['303', 'Deluxe', 'Available', 7800.00, 'Free WiFi, AC, 4K TV, Mini Bar, Balcony, Bath, Room Service'],
    ['304', 'Deluxe', 'Available', 7500.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['305', 'Deluxe', 'Available', 7500.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    // 4th Floor - Suites (₹15,000)
    ['401', 'Suite', 'Available', 15000.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['402', 'Suite', 'Available', 15000.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['403', 'Suite', 'Available', 16000.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['404', 'Suite', 'Available', 15000.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['405', 'Suite', 'Available', 18000.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler']
  ];
  for (const room of rooms) {
    await run(
      'INSERT INTO rooms (room_number, type, status, price, amenities) VALUES (?, ?, ?, ?, ?)',
      room
    );
  }

  // 3. Seed Guests (15 Indian Guests)
  const guests = [
    ['Aarav', 'Patel', 'aarav.patel@gmail.com', '+91 98765 43210', 'Aadhar-8877'],
    ['Dia', 'Sen', 'dia.sen@yahoo.co.in', '+91 98234 56789', 'PAN-3344'],
    ['Kabir', 'Kapoor', 'kabir.k@outlook.com', '+91 97654 32109', 'Aadhar-1122'],
    ['Ishaan', 'Nair', 'ishaan.nair@gmail.com', '+91 96543 21098', 'Passport-4455'],
    ['Ananya', 'Iyer', 'ananya.iyer@gmail.com', '+91 95432 10987', 'Aadhar-9900'],
    ['Rohan', 'Gupta', 'rohan.gupta@gmail.com', '+91 94321 09876', 'PAN-5566'],
    ['Meera', 'Joshi', 'meera.j@gmail.com', '+91 93210 98765', 'Aadhar-6677'],
    ['Vihaan', 'Sharma', 'vihaan.s@gmail.com', '+91 92109 87654', 'Passport-5544'],
    ['Aditi', 'Rao', 'aditi.rao@gmail.com', '+91 91098 76543', 'PAN-9988'],
    ['Dev', 'Verma', 'dev.verma@gmail.com', '+91 90987 65432', 'Aadhar-1234'],
    ['Kiara', 'Advani', 'kiara.a@gmail.com', '+91 98987 65432', 'Passport-8877'],
    ['Pranav', 'Reddy', 'pranav.r@gmail.com', '+91 97876 54321', 'Aadhar-3322'],
    ['Riya', 'Chawla', 'riya.c@gmail.com', '+91 96765 43210', 'PAN-5566'],
    ['Siddharth', 'Malhotra', 'sid.m@gmail.com', '+91 95654 32109', 'Passport-1122'],
    ['Tara', 'Sutaria', 'tara.s@gmail.com', '+91 94543 21098', 'Aadhar-8899']
  ];
  for (const guest of guests) {
    await run(
      'INSERT INTO guests (first_name, last_name, email, phone, document_id) VALUES (?, ?, ?, ?, ?)',
      guest
    );
  }

  // 4. Seed historical bookings & transactions (last 14 days)
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  for (let i = 14; i >= 1; i--) {
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() - i - 2);
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() - i);
    
    const roomId = (i % 8) + 1;
    const guestId = (i % 8) + 1;
    const price = (i % 2 === 0) ? 4500.00 : 2500.00;
    const nights = 2;
    const totalPrice = price * nights;
    
    let res = await run(
      'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [roomId, guestId, formatDate(checkIn), formatDate(checkOut), 'CheckedOut', totalPrice]
    );
    
    const payMethod = ['Credit Card', 'Cash', 'Digital Wallet', 'Bank Transfer'][i % 4];
    await run(
      'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
      [res.lastID, totalPrice, payMethod, formatDate(checkOut)]
    );
  }

  // 5. Seed active CheckedIn Bookings (rooms occupied right now)
  const activeBookings = [
    // roomId, guestId, checkInOffset, checkOutOffset, roomPrice
    [10, 9, -2, 3, 4500.00],  // Room 205 occupied by guest 9, checking out in 3 days
    [11, 10, -1, 4, 7500.00], // Room 301 occupied by guest 10, checking out in 4 days
    [12, 11, 0, 5, 7500.00],  // Room 302 occupied by guest 11, checking out in 5 days
    [16, 12, -3, 2, 15000.00], // Room 401 occupied by guest 12, checking out in 2 days
    [17, 13, -1, 2, 15000.00]  // Room 402 occupied by guest 13, checking out in 2 days
  ];
  
  for (const b of activeBookings) {
    const checkIn = new Date(today); checkIn.setDate(today.getDate() + b[2]);
    const checkOut = new Date(today); checkOut.setDate(today.getDate() + b[3]);
    const nights = b[3] - b[2];
    const totalPrice = nights * b[4];
    
    let res = await run(
      'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [b[0], b[1], formatDate(checkIn), formatDate(checkOut), 'CheckedIn', totalPrice]
    );
    
    // Set room as occupied
    await run('UPDATE rooms SET status = \'Occupied\' WHERE id = ?', [b[0]]);
    
    // Create transaction (payment received at check-in)
    const payMethod = ['Credit Card', 'Cash', 'Digital Wallet'][b[0] % 3];
    await run(
      'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
      [res.lastID, totalPrice, payMethod, formatDate(checkIn)]
    );
  }

  // 6. Seed upcoming reservations (status: Booked)
  const upcomingBookings = [
    // roomId, guestId, checkInOffset, checkOutOffset, roomPrice
    [13, 14, 2, 5, 7800.00], // Room 303 booked for guest 14, check-in in 2 days
    [18, 15, 3, 7, 16000.00]  // Room 403 booked for guest 15, check-in in 3 days
  ];
  for (const b of upcomingBookings) {
    const checkIn = new Date(today); checkIn.setDate(today.getDate() + b[2]);
    const checkOut = new Date(today); checkOut.setDate(today.getDate() + b[3]);
    const nights = b[3] - b[2];
    const totalPrice = nights * b[4];
    
    await run(
      'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [b[0], b[1], formatDate(checkIn), formatDate(checkOut), 'Booked', totalPrice]
    );
  }

  console.log('Seeding completed successfully!');
}

async function initDb() {
  try {
    // Check if tables already exist
    const tableExists = await get("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='rooms'");
    
    if (!tableExists) {
      console.log('Database empty. Creating tables from schema...');
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      await exec(schemaSql);
      await seedData();
    } else {
      console.log('Database already exists. Skipping initialization.');
    }
  } catch (err) {
    console.error('Error initializing database', err);
  }
}

module.exports = {
  query,
  get,
  run,
  exec,
  initDb,
  seedData,
  db: pool
};
