-- Smart Neighborhood Water Alert System
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS water_alert_db;
USE water_alert_db;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  house_number VARCHAR(20),
  family_name VARCHAR(100),
  members_count INT DEFAULT 1,
  address TEXT,
  profile_picture VARCHAR(255),
  role ENUM('admin','member') DEFAULT 'member',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Houses table
CREATE TABLE houses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  house_number VARCHAR(20) UNIQUE NOT NULL,
  family_name VARCHAR(100),
  address TEXT,
  members_count INT DEFAULT 1,
  is_available BOOLEAN DEFAULT TRUE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Neighbors table
CREATE TABLE neighbors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  neighbor_user_id INT,
  house_number VARCHAR(20) NOT NULL,
  family_name VARCHAR(100),
  phone VARCHAR(20),
  members_count INT DEFAULT 1,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (neighbor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Water status table
CREATE TABLE water_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('available','unavailable') DEFAULT 'unavailable',
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Water history table
CREATE TABLE water_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_time TIMESTAMP NULL,
  stop_time TIMESTAMP NULL,
  started_by INT,
  stopped_by INT,
  date DATE NOT NULL,
  duration_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (started_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (stopped_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('water_start','water_stop','emergency','announcement','chat_mention') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  sent_by INT,
  is_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);

-- User notification read status
CREATE TABLE notification_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_notif_user (notification_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  tag ENUM('water','alert','event','maintenance','general') DEFAULT 'general',
  posted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Emergency alerts table
CREATE TABLE emergency_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  house_number VARCHAR(20) NOT NULL,
  message TEXT,
  sent_by INT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat messages table
CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table
CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(512) NOT NULL,
  ip_address VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Help requests table
CREATE TABLE help_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('open','accepted','closed') DEFAULT 'open',
  accepted_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (accepted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Volunteers table
CREATE TABLE volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed: initial water status row
INSERT INTO water_status (status) VALUES ('unavailable');

-- Seed: admin user (password: Admin@123)
INSERT INTO users (name, email, password, mobile, house_number, family_name, members_count, role)
VALUES ('Admin', 'admin@watералert.com', '$2b$10$rQZ9uAVQU7n9mxDmtFkzAO7J5xG8zL1kN2pM3oV4hY6iE8wC0dRuS', '9999999999', '1', 'Admin Family', 1, 'admin');
