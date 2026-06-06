const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

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
  
  // 1. Seed Staff
  const staff = [
    ['Sarah Jenkins', 'Receptionist', 'sarah@grandview.com', '+1 (555) 019-2834', 'Active'],
    ['Marcus Vance', 'Manager', 'marcus@grandview.com', '+1 (555) 019-5823', 'Active'],
    ['Elena Rostova', 'Receptionist', 'elena@grandview.com', '+1 (555) 019-1122', 'Active'],
    ['Thomas Miller', 'Housekeeper', 'thomas@grandview.com', '+1 (555) 019-9988', 'Active'],
    ['Jessica Albright', 'Housekeeper', 'jessica@grandview.com', '+1 (555) 019-7744', 'Off-Duty'],
    ['David Kross', 'Security', 'david.k@grandview.com', '+1 (555) 019-8833', 'Active'],
    ['Samantha Reed', 'Manager', 'samantha.r@grandview.com', '+1 (555) 019-4400', 'Active'],
    ['Amir Patel', 'Receptionist', 'amir.p@grandview.com', '+1 (555) 019-3355', 'Active'],
    ['Linda Zhao', 'Housekeeper', 'linda.z@grandview.com', '+1 (555) 019-1244', 'Active']
  ];
  for (const member of staff) {
    await run(
      'INSERT INTO staff (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      member
    );
  }

  // 2. Seed Rooms (20 total rooms: Single, Double, Deluxe, Suite)
  const rooms = [
    // 1st Floor - Single Rooms
    ['101', 'Single', 'Available', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['102', 'Single', 'Available', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['103', 'Single', 'Maintenance', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['104', 'Single', 'Available', 85.00, 'Free WiFi, AC, Smart TV, Balcony, Shower'],
    ['105', 'Single', 'Available', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    // 2nd Floor - Double Rooms
    ['201', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['202', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['203', 'Double', 'Available', 125.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Balcony, Bath'],
    ['204', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['205', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    // 3rd Floor - Deluxe Rooms
    ['301', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['302', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['303', 'Deluxe', 'Available', 190.00, 'Free WiFi, AC, 4K TV, Mini Bar, Balcony, Bath, Room Service'],
    ['304', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['305', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    // 4th Floor - Suites
    ['401', 'Suite', 'Available', 350.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['402', 'Suite', 'Available', 350.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['403', 'Suite', 'Available', 360.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['404', 'Suite', 'Available', 350.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['405', 'Suite', 'Available', 380.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler']
  ];
  for (const room of rooms) {
    await run(
      'INSERT INTO rooms (room_number, type, status, price, amenities) VALUES (?, ?, ?, ?, ?)',
      room
    );
  }

  // 3. Seed Guests (15 total guests)
  const guests = [
    ['Alice', 'Smith', 'alice.smith@gmail.com', '+1 (555) 123-4567', 'ID-99823'],
    ['Bob', 'Johnson', 'bob.johnson@yahoo.com', '+1 (555) 234-5678', 'PP-88273'],
    ['Charlie', 'Brown', 'charlie.brown@outlook.com', '+1 (555) 345-6789', 'DL-11223'],
    ['David', 'Miller', 'david.miller@gmail.com', '+1 (555) 456-7890', 'ID-33445'],
    ['Emma', 'Wilson', 'emma.wilson@hotmail.com', '+1 (555) 567-8901', 'PP-99001'],
    ['Frank', 'Gomez', 'frank.gomez@gmail.com', '+1 (555) 678-9012', 'DL-44556'],
    ['Grace', 'Kelly', 'grace.k@gmail.com', '+1 (555) 789-0123', 'ID-66778'],
    ['Henry', 'Ford', 'henry.ford@ford.com', '+1 (555) 890-1234', 'PP-55443'],
    ['Irene', 'Adler', 'irene.a@gmail.com', '+1 (555) 901-2345', 'DL-99887'],
    ['Jack', 'Reacher', 'jack.r@army.mil', '+1 (555) 012-3456', 'ID-12345'],
    ['Kate', 'Middleton', 'kate.m@royals.uk', '+1 (555) 123-9876', 'PP-88776'],
    ['Leo', 'Tolstoy', 'leo.t@literature.ru', '+1 (555) 234-8765', 'DL-33221'],
    ['Mary', 'Shelley', 'mary.s@gmail.com', '+1 (555) 345-7654', 'ID-55667'],
    ['Nathan', 'Drake', 'nathan.d@uncharted.com', '+1 (555) 456-6543', 'PP-11229'],
    ['Olivia', 'Wilde', 'olivia.w@gmail.com', '+1 (555) 567-5432', 'DL-88990']
  ];
  for (const guest of guests) {
    await run(
      'INSERT INTO guests (first_name, last_name, email, phone, document_id) VALUES (?, ?, ?, ?, ?)',
      guest
    );
  }

  // 4. Seed historical bookings & transactions (last 14 days)
  // Generating daily transactions so that the line chart is fully populated
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  for (let i = 14; i >= 1; i--) {
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() - i - 2); // Checked in i+2 days ago
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() - i); // Checked out i days ago
    
    // Distribute rooms (1 to 8) and guests (1 to 8)
    const roomId = (i % 8) + 1;
    const guestId = (i % 8) + 1;
    const price = (i % 2 === 0) ? 120.00 : 80.00;
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
    [10, 9, -2, 3, 120.00],  // Room 205 occupied by guest 9 since 2 days ago, checking out in 3 days
    [11, 10, -1, 4, 180.00], // Room 301 occupied by guest 10 since 1 day ago, checking out in 4 days
    [12, 11, 0, 5, 180.00],  // Room 302 occupied by guest 11 since today, checking out in 5 days
    [16, 12, -3, 2, 350.00], // Room 401 occupied by guest 12 since 3 days ago, checking out in 2 days
    [17, 13, -1, 2, 350.00]  // Room 402 occupied by guest 13 since 1 day ago, checking out in 2 days
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
    [13, 14, 2, 5, 190.00], // Room 303 booked for guest 14, check-in in 2 days, checking out in 5 days
    [18, 15, 3, 7, 360.00]  // Room 403 booked for guest 15, check-in in 3 days, checking out in 7 days
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
