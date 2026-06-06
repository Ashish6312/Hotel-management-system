const express = require('express');
const router = express.Router();
const db = require('./db');

// --- AUTHENTICATION ---

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const cleanEmail = email.toLowerCase().trim();
  
  // Hardcoded fallback for default receptionist to prevent setup catch-22s
  if (cleanEmail === 'priya@grandview.co.in' && password === 'password') {
    return res.json({
      name: 'Priya Sharma',
      email: 'priya@grandview.co.in',
      role: 'Receptionist'
    });
  }

  try {
    const staffMember = await db.get('SELECT * FROM staff WHERE email = ?', [cleanEmail]);
    if (!staffMember) {
      return res.status(401).json({ error: 'Invalid email address. No staff profile found.' });
    }
    if (password !== 'password') {
      return res.status(401).json({ error: 'Incorrect password. Try using "password".' });
    }
    res.json({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DASHBOARD ANALYTICS ---

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalRoomsRow = await db.get('SELECT COUNT(*) as count FROM rooms');
    const occupiedRoomsRow = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Occupied'");
    const availableRoomsRow = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Available'");
    const maintenanceRoomsRow = await db.get("SELECT COUNT(*) as count FROM rooms WHERE status = 'Maintenance'");

    // Revenue
    const today = new Date().toISOString().split('T')[0];
    const todayRevenueRow = await db.get('SELECT SUM(amount) as total FROM transactions WHERE TO_CHAR(payment_date, \'YYYY-MM-DD\') = ?', [today]);
    const totalRevenueRow = await db.get('SELECT SUM(amount) as total FROM transactions');

    // Recent Bookings/Activity
    const recentActivity = await db.query(`
      SELECT b.id, b.status, b.check_in_date, b.check_out_date, b.created_at,
             g.first_name, g.last_name, r.room_number, r.type
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC LIMIT 5
    `);

    res.json({
      rooms: {
        total: totalRoomsRow.count || 0,
        occupied: occupiedRoomsRow.count || 0,
        available: availableRoomsRow.count || 0,
        maintenance: maintenanceRoomsRow.count || 0,
        occupancyRate: totalRoomsRow.count ? Math.round((occupiedRoomsRow.count / totalRoomsRow.count) * 100) : 0
      },
      revenue: {
        today: todayRevenueRow.total || 0,
        total: totalRevenueRow.total || 0
      },
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/revenue-analytics
router.get('/dashboard/revenue-analytics', async (req, res) => {
  try {
    // Get revenue grouped by day for the last 14 days
    const revenueHistory = await db.query(`
      SELECT TO_CHAR(payment_date, 'YYYY-MM-DD') as date, SUM(amount) as amount
      FROM transactions
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM-DD')
      ORDER BY TO_CHAR(payment_date, 'YYYY-MM-DD') ASC
      LIMIT 14
    `);

    // Get revenue grouped by payment method
    const paymentMethods = await db.query(`
      SELECT payment_method as name, SUM(amount) as value
      FROM transactions
      GROUP BY payment_method
    `);

    // Get room type occupancy
    const roomTypeOccupancy = await db.query(`
      SELECT r.type, COUNT(b.id) as bookingsCount
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      GROUP BY r.type
    `);

    res.json({
      revenueHistory,
      paymentMethods,
      roomTypeOccupancy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- ROOMS API ---

// GET /api/rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rooms/:id/status (Maintenance toggle, etc.)
router.put('/rooms/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['Available', 'Occupied', 'Maintenance'].includes(status)) {
    return res.status(400).json({ error: 'Invalid room status' });
  }
  try {
    await db.run('UPDATE rooms SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Room status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- GUESTS API ---

// GET /api/guests
router.get('/guests', async (req, res) => {
  try {
    const guests = await db.query('SELECT * FROM guests ORDER BY last_name ASC');
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guests
router.post('/guests', async (req, res) => {
  const { first_name, last_name, email, phone, document_id } = req.body;
  if (!first_name || !last_name || !email || !phone || !document_id) {
    return res.status(400).json({ error: 'Missing required guest fields' });
  }
  try {
    const result = await db.run(
      'INSERT INTO guests (first_name, last_name, email, phone, document_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, document_id]
    );
    res.status(201).json({ id: result.lastID, first_name, last_name, email, phone, document_id });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: guests.email') || err.message.includes('guests_email_key') || err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'A guest with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});


// --- BOOKINGS API ---

// GET /api/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await db.query(`
      SELECT b.*, 
             r.room_number, r.type as room_type, r.price as room_price,
             g.first_name, g.last_name, g.email as guest_email, g.phone as guest_phone, g.document_id
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN guests g ON b.guest_id = g.id
      ORDER BY b.id DESC
    `);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings (Create a booking / Check-in)
router.post('/bookings', async (req, res) => {
  const { room_id, guest_id, guest_data, check_in_date, check_out_date, status, total_price, payment_method } = req.body;
  
  if (!room_id || (!guest_id && !guest_data) || !check_in_date || !check_out_date || !total_price) {
    return res.status(400).json({ error: 'Missing required booking parameters' });
  }

  try {
    let finalGuestId = guest_id;

    // Check if we need to create a guest first
    if (!finalGuestId && guest_data) {
      // Check if email already exists
      const existingGuest = await db.get('SELECT id FROM guests WHERE email = ?', [guest_data.email]);
      if (existingGuest) {
        finalGuestId = existingGuest.id;
      } else {
        const guestResult = await db.run(
          'INSERT INTO guests (first_name, last_name, email, phone, document_id) VALUES (?, ?, ?, ?, ?)',
          [guest_data.first_name, guest_data.last_name, guest_data.email, guest_data.phone, guest_data.document_id]
        );
        finalGuestId = guestResult.lastID;
      }
    }

    // Check if room is available
    const room = await db.get('SELECT status FROM rooms WHERE id = ?', [room_id]);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Create the booking
    const bookingStatus = status || 'Booked';
    const bookingResult = await db.run(
      'INSERT INTO bookings (room_id, guest_id, check_in_date, check_out_date, status, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [room_id, finalGuestId, check_in_date, check_out_date, bookingStatus, total_price]
    );

    const bookingId = bookingResult.lastID;

    // If immediate check-in
    if (bookingStatus === 'CheckedIn') {
      await db.run("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [room_id]);
      
      // Create transaction record
      const payMethod = payment_method || 'Credit Card';
      const today = new Date().toISOString().split('T')[0];
      await db.run(
        'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
        [bookingId, total_price, payMethod, today]
      );
    }

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId,
      guestId: finalGuestId,
      status: bookingStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/check-in
router.post('/bookings/:id/check-in', async (req, res) => {
  const { payment_method } = req.body;
  try {
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'Booked') {
      return res.status(400).json({ error: 'Booking is not in Booked state' });
    }

    // Check room availability
    const room = await db.get('SELECT status FROM rooms WHERE id = ?', [booking.room_id]);
    if (room.status === 'Occupied') {
      return res.status(400).json({ error: 'Room is already occupied by another guest' });
    }

    // Update booking and room
    await db.run("UPDATE bookings SET status = 'CheckedIn' WHERE id = ?", [req.params.id]);
    await db.run("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [booking.room_id]);

    // Record transaction
    const payMethod = payment_method || 'Credit Card';
    const today = new Date().toISOString().split('T')[0];
    await db.run(
      'INSERT INTO transactions (booking_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?)',
      [req.params.id, booking.total_price, payMethod, today]
    );

    res.json({ message: 'Checked in successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/check-out
router.post('/bookings/:id/check-out', async (req, res) => {
  try {
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'CheckedIn') {
      return res.status(400).json({ error: 'Booking is not in CheckedIn state' });
    }

    // Update booking and room
    await db.run("UPDATE bookings SET status = 'CheckedOut' WHERE id = ?", [req.params.id]);
    await db.run("UPDATE rooms SET status = 'Available' WHERE id = ?", [booking.room_id]);

    res.json({ message: 'Checked out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/cancel
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.run("UPDATE bookings SET status = 'Cancelled' WHERE id = ?", [req.params.id]);
    
    // If the guest was checked in, make the room available
    if (booking.status === 'CheckedIn') {
      await db.run("UPDATE rooms SET status = 'Available' WHERE id = ?", [booking.room_id]);
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- STAFF API ---

// GET /api/staff
router.get('/staff', async (req, res) => {
  try {
    const staff = await db.query('SELECT * FROM staff ORDER BY role, name ASC');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff
router.post('/staff', async (req, res) => {
  const { name, role, email, phone, status } = req.body;
  if (!name || !role || !email || !phone) {
    return res.status(400).json({ error: 'Missing required staff fields' });
  }
  try {
    const result = await db.run(
      'INSERT INTO staff (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      [name, role, email, phone, status || 'Active']
    );
    res.status(201).json({ id: result.lastID, name, role, email, phone, status: status || 'Active' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: staff.email') || err.message.includes('staff_email_key') || err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'A staff member with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/staff/:id
router.put('/staff/:id', async (req, res) => {
  const { name, role, email, phone, status } = req.body;
  try {
    await db.run(
      'UPDATE staff SET name = ?, role = ?, email = ?, phone = ?, status = ? WHERE id = ?',
      [name, role, email, phone, status, req.params.id]
    );
    res.json({ message: 'Staff member updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- SYSTEM RESET / RESEED ---

router.post('/system/reset', async (req, res) => {
  try {
    // Drop and recreate DB
    const fs = require('fs');
    const path = require('path');
    const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

    await db.exec(schemaSql);
    await db.seedData();

    res.json({ message: 'System database reset and seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
