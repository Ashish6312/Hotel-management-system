-- PostgreSQL Database Schema for Hotel Management Dashboard

-- Drop tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- Rooms Table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK(type IN ('Single', 'Double', 'Suite', 'Deluxe')) NOT NULL,
    status VARCHAR(50) CHECK(status IN ('Available', 'Occupied', 'Maintenance')) DEFAULT 'Available',
    price DECIMAL(10, 2) NOT NULL,
    amenities TEXT -- Comma-separated list e.g., 'Free WiFi, AC, TV, Mini Bar'
);

-- Guests Table
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    document_id VARCHAR(100) NOT NULL
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    check_in_date VARCHAR(50) NOT NULL, -- Format: YYYY-MM-DD
    check_out_date VARCHAR(50) NOT NULL, -- Format: YYYY-MM-DD
    status VARCHAR(50) CHECK(status IN ('Booked', 'CheckedIn', 'CheckedOut', 'Cancelled')) DEFAULT 'Booked',
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK(role IN ('Manager', 'Receptionist', 'Housekeeper', 'Security')) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) CHECK(status IN ('Active', 'Off-Duty')) DEFAULT 'Active'
);

-- Transactions Table (Revenue Tracking)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK(payment_method IN ('Credit Card', 'Cash', 'Bank Transfer', 'Digital Wallet')) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
