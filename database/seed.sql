USE water_alert_db;

-- Seed users (password for all: Password@123)
INSERT INTO users (name, email, password, mobile, house_number, family_name, members_count, role) VALUES
('Sriram R',      'sriram@example.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210', '24', 'Sriram Family',   4, 'member'),
('Rajan Kumar',   'rajan@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9841200000', '3',  'Kumar Family',    4, 'member'),
('Kavitha S',     'kavitha@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9443200000', '11', 'Subramanian Fam', 3, 'member'),
('Priya Mohan',   'priya@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9003400000', '7',  'Mohan Family',    2, 'member'),
('Murugan G',     'murugan@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9783200000', '8',  'Govindan Family', 5, 'member');

-- Seed houses
INSERT INTO houses (house_number, family_name, members_count, user_id) VALUES
('24', 'Sriram Family',      4, 2),
('3',  'Kumar Family',       4, 3),
('11', 'Subramanian Family', 3, 4),
('7',  'Mohan Family',       2, 5),
('8',  'Govindan Family',    5, 6);

-- Seed announcements
INSERT INTO announcements (title, body, tag, posted_by) VALUES
('Water timing changed to 7:00 AM', 'Starting Monday, the municipal supply will begin at 7:00 AM. Please adjust your collection schedule accordingly.', 'water', 1),
('Cleaning drive this Sunday at 8 AM', 'Monthly neighborhood cleaning drive on Sunday at 8:00 AM. All residents are requested to participate.', 'event', 1),
('Power cut Tuesday 10 AM to 2 PM', 'TANGEDCO maintenance scheduled Tuesday. Plan your water collection before 10 AM.', 'alert', 1),
('Festival meeting — Aadi celebrations', 'Community meeting on 5 July at 6:00 PM to discuss Aadi festival plans. Venue: Community hall near House 1.', 'event', 1);

-- Seed water history
INSERT INTO water_history (date, start_time, stop_time, started_by, stopped_by, duration_minutes) VALUES
('2026-06-27', '2026-06-27 07:12:00', '2026-06-27 09:02:00', 3, 4, 110),
('2026-06-26', '2026-06-26 07:08:00', '2026-06-26 09:05:00', 5, 3, 117),
('2026-06-25', '2026-06-25 07:20:00', '2026-06-25 08:52:00', 4, 2, 92),
('2026-06-24', '2026-06-24 07:10:00', '2026-06-24 09:15:00', 2, 2, 125),
('2026-06-23', '2026-06-23 07:05:00', '2026-06-23 09:00:00', 6, 6, 115);

-- Seed chat messages
INSERT INTO chat_messages (user_id, message) VALUES
(3, 'Water started at House 3, everyone!'),
(4, 'Thank you Rajan! Going to collect now'),
(2, 'Water has started here too. Sent alert.'),
(5, 'Can someone collect for House 7? I am at work.'),
(6, 'I will help, Priya!');

-- Seed help requests
INSERT INTO help_requests (requester_id, title, description, status) VALUES
(4, 'Can someone collect water for House 18?', 'Mrs. Saradha needs one pot collected. She is unwell today.', 'open'),
(5, 'Extra containers needed at House 42', 'Anyone with spare 20L cans? Lost them in the flooding.', 'open');

-- Seed volunteers
INSERT INTO volunteers (user_id, description) VALUES
(6, 'Helps elderly residents collect water'),
(3, 'Available early morning for help');

-- Seed notifications
INSERT INTO notifications (type, title, message, sent_by, is_global) VALUES
('water_start',  'Water has started',                     'Water supply started at House 24', 2, TRUE),
('announcement', 'Water timing changed to 7 AM',          'New water timing effective Monday', 1, TRUE),
('emergency',    'Emergency at House 36 — pipe burst',    'Pipe burst at House 36. Immediate help needed.', 6, TRUE),
('water_stop',   'Water supply stopped',                  'Water supply stopped at House 11', 4, TRUE);
