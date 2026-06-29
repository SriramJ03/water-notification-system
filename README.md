# Smart Neighborhood Water Alert & Community Communication System

A full-stack web application for neighborhood water supply alerts, real-time community chat, neighbor management, announcements, and emergency coordination.

## 📁 Project Structure

```
neighborhood-water-alert/
├── client/          # React.js frontend
├── server/          # Node.js + Express backend
└── database/        # MySQL schema & seed data
```

## 🛠 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React.js, React Router, Axios, CSS      |
| Backend  | Node.js, Express.js, Socket.IO          |
| Database | MySQL                                   |
| Auth     | JWT + bcryptjs                          |
| Realtime | Socket.IO (water alerts, chat, online)  |

---

## ⚙️ Setup Instructions

### 1. Database

Open MySQL and run:

```sql
source database/schema.sql
source database/seed.sql
```

This creates the `water_alert_db` database with all tables and sample data.

---

### 2. Backend (server/)

```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials and a JWT secret
npm install
npm run dev
```

The server runs on **http://localhost:5000**

---

### 3. Frontend (client/)

```bash
cd client
npm install
npm start
```

The React app runs on **http://localhost:3000** and proxies API calls to port 5000.

---

## 🔑 Default Accounts (after seed)

| Email                  | Password      | Role   | House |
|------------------------|---------------|--------|-------|
| admin@wateralert.com   | Admin@123     | Admin  | 1     |
| sriram@example.com     | Password@123  | Member | 24    |
| rajan@example.com      | Password@123  | Member | 3     |
| kavitha@example.com    | Password@123  | Member | 11    |

---

## 🚀 Features

- **One-click water alert** — broadcasts to all connected users via Socket.IO
- **Emergency alert** — instant full-screen red notification
- **Real-time community chat** — with typing indicators, online users, delete messages
- **Neighbor directory** — add, edit, remove neighbors with house/phone details
- **Announcements** — admin can post tagged community notices
- **Water history** — log of every start/stop with duration and who updated
- **Help center** — request & accept help; volunteer registration
- **Notification center** — unread/read, mark all read
- **Admin panel** — manage users, view stats, enable/disable accounts
- **Profile & Settings** — edit profile, change password, notification toggles

---

## 📡 API Endpoints

| Module        | Method | Path                         |
|---------------|--------|------------------------------|
| Auth          | POST   | /api/auth/register           |
| Auth          | POST   | /api/auth/login              |
| Auth          | GET    | /api/auth/profile            |
| Auth          | PUT    | /api/auth/profile            |
| Auth          | PUT    | /api/auth/change-password    |
| Water         | GET    | /api/water/status            |
| Water         | POST   | /api/water/status            |
| Water         | GET    | /api/water/history           |
| Water         | GET    | /api/water/stats             |
| Notifications | GET    | /api/notifications           |
| Notifications | PUT    | /api/notifications/:id/read  |
| Chat          | GET    | /api/chat                    |
| Chat          | DELETE | /api/chat/:id                |
| Neighbors     | GET    | /api/neighbors               |
| Neighbors     | POST   | /api/neighbors               |
| Neighbors     | PUT    | /api/neighbors/:id           |
| Neighbors     | DELETE | /api/neighbors/:id           |
| Announcements | GET    | /api/announcements           |
| Announcements | POST   | /api/announcements           |
| Emergency     | POST   | /api/emergency               |
| Help          | GET    | /api/help                    |
| Help          | POST   | /api/help                    |
| Help          | PUT    | /api/help/:id/accept         |
| Admin         | GET    | /api/admin/users             |
| Admin         | GET    | /api/admin/stats             |

---

## 🔌 Socket.IO Events

| Event                | Direction        | Description                        |
|----------------------|------------------|------------------------------------|
| `send_message`       | Client → Server  | Send a chat message                |
| `new_message`        | Server → Client  | Broadcast new chat message         |
| `water_status_update`| Server → Client  | Broadcast water on/off             |
| `new_notification`   | Server → Client  | Push notification to all           |
| `emergency_alert`    | Server → Client  | Emergency broadcast                |
| `typing`             | Client → Server  | User is typing                     |
| `user_typing`        | Server → Client  | Show typing indicator              |
| `online_users`       | Server → Client  | Updated online users list          |
| `message_deleted`    | Server → Client  | Remove deleted message             |
