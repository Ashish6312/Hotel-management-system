const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(__dirname, 'hotel.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Promise wrappers
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Batch/Serialize run
const exec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
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
    ['Jessica Albright', 'Housekeeper', 'jessica@grandview.com', '+1 (555) 019-7744', 'Off-Duty']
  ];
  for (const member of staff) {
    await run(
      'INSERT INTO staff (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      member
    );
  }

  // 2. Seed Rooms
  const rooms = [
    // Single Rooms
    ['101', 'Single', 'Available', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['102', 'Single', 'Available', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['103', 'Single', 'Maintenance', 80.00, 'Free WiFi, AC, Smart TV, Shower'],
    ['104', 'Single', 'Available', 85.00, 'Free WiFi, AC, Smart TV, Balcony, Shower'],
    // Double Rooms
    ['201', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['202', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    ['203', 'Double', 'Available', 125.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Balcony, Bath'],
    ['204', 'Double', 'Available', 120.00, 'Free WiFi, AC, Smart TV, Mini Fridge, Bath'],
    // Deluxe Rooms
    ['301', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['302', 'Deluxe', 'Available', 180.00, 'Free WiFi, AC, 4K TV, Mini Bar, Coffee Maker, Bath, Room Service'],
    ['303', 'Deluxe', 'Available', 190.00, 'Free WiFi, AC, 4K TV, Mini Bar, Balcony, Bath, Room Service'],
    // Suites
    ['401', 'Suite', 'Available', 350.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler'],
    ['402', 'Suite', 'Available', 350.00, 'Free WiFi, AC, 2x 4K TV, Mini Bar, Coffee Maker, Kitchenette, Jacuzzi, Balcony, Lounge Access, 24/7 Butler']
  ];
  for (const room of rooms) {
    await run(
      'INSERT INTO rooms (room_number, type, status, price, amenities) VALUES (?, ?, ?, ?, ?)',
      room
    );
  }

  // 3. Seed Guests
  const guests = [
    ['Alice', 'Smith', 'alice.smith@gmail.com', '+1 (555) 123-4567', 'ID-99823'],
    ['Bob', 'Johnson', 'bob.johnson@yahoo.com', '+1 (555) 234-5678', 'PP-88273'],
    ['Charlie', 'Brown', 'charlie.brown@outlook.com', '+1 (555) 345-6789', 'DL-11223'],
    ['David', 'Miller', 'david.miller@gmail.com', '+1 (555) 456-7890', 'ID-33445'],
    ['Emma', 'Wilson', 'emma.wilson@hotmail.com', '+1 (555) 567-8901', 'PP-99001']
  ];
  for (const guest of guests) {
    await run(
      'INSERT INTO guests (first_name, last_name, email, phone, document_id) VALUES (?, ?, ?, ?, ?)',
      guest
    );
  }

  // 4. Seed Bookings & Transactions (simulated history + some active/upcoming)
  // Let's get today's date formatted as YYYY-MM-DD
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  const dMinus10 = new Date(today); dMinus10.setDate(today.getDate() - 10);
  const dMinus7 = new Date(today); dMinus7.setDate(today.getDate() - 7);
  const dMinus5 = new Date(today); dMinus5.setDate(today.getDate() - 5);
  const dMinus2 = new Date(today); dMinus2.setDate(today.getDate() - 2);
  const dPlus2 = new Date(today); dPlus2.setDate(today.getDate() + 2);
  const dPlus5 = new Date(today); dPlus5.setDate(today.getDate() + 5);
  const dPlus10 = new Date(today); dPlus10.setDate(today.getDate() + 10);

  // A. Past Completed Booking (Alice in 101, Checked Out)
  let res1 = await run(
    'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 1, formatDate(dMinus10), formatDate(dMinus7), 'CheckedOut', 240.00]
  );
  await run(
    'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
    [res1.lastID, 240.00, 'Credit Card', formatDate(dMinus7)]
  );

  // B. Past Completed Booking (Bob in 201, Checked Out)
  let res2 = await run(
    'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [5, 2, formatDate(dMinus7), formatDate(dMinus5), 'CheckedOut', 240.00]
  );
  await run(
    'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
    [res2.lastID, 240.00, 'Cash', formatDate(dMinus5)]
  );

  // C. Active CheckedIn Booking (Charlie in 202, Checked In since 2 days ago, check-out in 3 days)
  let res3 = await run(
    'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [6, 3, formatDate(dMinus2), formatDate(dPlus5), 'CheckedIn', 840.00]
  );
  // Mark room as Occupied
  await run('UPDATE rooms SET status = "Occupied" WHERE id = 6');
  // Record partial or full transaction
  await run(
    'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
    [res3.lastID, 840.00, 'Credit Card', formatDate(dMinus2)]
  );

  // D. Active CheckedIn Booking (Emma in 401, Checked In since today, check-out in 5 days)
  let res4 = await run(
    'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [12, 5, formatDate(today), formatDate(dPlus5), 'CheckedIn', 1750.00]
  );
  await run('UPDATE rooms SET status = "Occupied" WHERE id = 12');
  await run(
    'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
    [res4.lastID, 1750.00, 'Bank Transfer', formatDate(today)]
  );

  // E. Upcoming Booked Reservation (David in 301, check-in in 2 days, checkout in 5 days)
  await run(
    'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [9, 4, formatDate(dPlus2), formatDate(dPlus5), 'Booked', 540.00]
  );

  console.log('Seeding completed successfully!');
}

async function initDb() {
  try {
    // Check if tables already exist
    const tableExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='rooms'");
    
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
  db
};
