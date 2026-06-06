-- SQLite Database Schema for Hotel Management Dashboard

-- Drop tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS staff;

-- Rooms Table
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('Single', 'Double', 'Suite', 'Deluxe')) NOT NULL,
    status TEXT CHECK(status IN ('Available', 'Occupied', 'Maintenance')) DEFAULT 'Available',
    price REAL NOT NULL,
    amenities TEXT -- Comma-separated list e.g., 'Free WiFi, AC, TV, Mini Bar'
);

-- Guests Table
CREATE TABLE guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    document_id TEXT NOT NULL
);

-- Bookings Table
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    guest_id INTEGER NOT NULL,
    check_in_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    check_out_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    status TEXT CHECK(status IN ('Booked', 'CheckedIn', 'CheckedOut', 'Cancelled')) DEFAULT 'Booked',
    total_price REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY(guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- Staff Table
CREATE TABLE staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('Manager', 'Receptionist', 'Housekeeper', 'Security')) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Off-Duty')) DEFAULT 'Active'
);

-- Transactions Table (Revenue Tracking)
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('Credit Card', 'Cash', 'Bank Transfer', 'Digital Wallet')) NOT NULL,
    payment_date TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
