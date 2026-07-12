-- MySQL DDL script to initialize login, signup, and asset management schema

CREATE DATABASE IF NOT EXISTS assetflow;
USE assetflow;

-- 1. User Table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Increased size to accommodate hashes safely
    role ENUM('Admin', 'Asset Manager', 'Department Head', 'Employee') NOT NULL DEFAULT 'Employee',
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_location (building, floor, room)
);

-- 4. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100) NOT NULL UNIQUE,
    serial_number VARCHAR(100),
    category_id INT,
    location_id INT,
    employee_id INT, -- Custodian (refers to user table)
    is_shared BOOLEAN DEFAULT FALSE,
    purchase_date DATE NOT NULL,
    purchase_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) NOT NULL,
    salvage_value DECIMAL(10, 2) DEFAULT 0.00,
    useful_life_months INT NOT NULL,
    depreciation_method ENUM('straight_line', 'declining_balance', 'sum_of_years') NOT NULL DEFAULT 'straight_line',
    state ENUM('draft', 'available', 'allocated', 'under_maintenance', 'disposed') NOT NULL DEFAULT 'available',
    warranty_expiry DATE,
    expected_return_date DATE,
    `condition` ENUM('new', 'good', 'fair', 'damaged', 'needs_repair') NOT NULL DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_asset_state (state),
    INDEX idx_asset_code (asset_code)
);

-- 5. Bookings Table (For Shared Resources)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    time_from TIME NOT NULL,
    time_to TIME NOT NULL,
    purpose VARCHAR(255),
    state ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_booking_date (date)
);

-- 6. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    requested_by INT NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    assigned_to INT,
    approved_by INT,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    resolution TEXT,
    state ENUM('draft', 'pending_approval', 'approved', 'in_progress', 'done', 'rejected') NOT NULL DEFAULT 'pending_approval',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES user(id) ON DELETE SET NULL
);

-- 7. Audit Cycles Table
CREATE TABLE IF NOT EXISTS audit_cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    scope_type ENUM('department', 'location', 'category', 'all') NOT NULL DEFAULT 'all',
    scope_id INT, -- Refers to loc_id or cat_id depending on scope_type
    auditor_id INT NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    state ENUM('draft', 'in_progress', 'pending_resolution', 'closed') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auditor_id) REFERENCES user(id) ON DELETE RESTRICT
);

-- 8. Audit Discrepancies Table
CREATE TABLE IF NOT EXISTS audit_discrepancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cycle_id INT NOT NULL,
    asset_id INT NOT NULL,
    discrepancy_type ENUM('missing', 'location_mismatch', 'condition_mismatch') NOT NULL,
    expected_value VARCHAR(255),
    actual_value VARCHAR(255),
    resolution TEXT,
    resolved_by INT,
    state ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cycle_id) REFERENCES audit_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES user(id) ON DELETE SET NULL
);

-- Seed Initial Default Categories
INSERT IGNORE INTO categories (id, name) VALUES 
(1, 'Laptops & Workstations'),
(2, 'Mobile Devices'),
(3, 'Office Furniture'),
(4, 'Networking Equipment');

-- Seed Initial Default Locations
INSERT IGNORE INTO locations (id, building, floor, room) VALUES 
(1, 'HQ Building', 'Floor 1', 'Room 101'),
(2, 'HQ Building', 'Floor 2', 'Room 205'),
(3, 'Warehouse A', 'Ground', 'A-4');
