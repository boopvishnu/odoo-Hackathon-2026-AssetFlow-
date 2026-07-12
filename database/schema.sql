-- MySQL DDL script to initialize Project

CREATE DATABASE IF NOT EXISTS booking_system;
USE booking_system;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Storing hashed password
    role ENUM('admin', 'asset_manager', 'dept_head', 'employee') NOT NULL DEFAULT 'employee',
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Seed Initial Default Departments
INSERT IGNORE INTO departments (id, name, code) VALUES 
(1, 'Information Technology', 'IT'),
(2, 'Human Resources', 'HR'),
(3, 'Finance', 'FIN'),
(4, 'Operations', 'OPS');
