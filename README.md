# Visitor Management System (VMS) – Backend API

The **Visitor Management System (VMS)** is a role-based backend API built with **Node.js**, **Express**, and **MongoDB**. It helps organizations track visitor check-ins and check-outs, manage hosts and user roles, generate reports, and notify hosts of incoming visits.

---

## 🚀 Features

### ✅ Authentication & Security

- JWT-based authentication (access & refresh tokens)
- Secure password storage with bcrypt hashing
- Role-based access control (`super admin`, `admin`, `host`, `receptionist`, `soldier`)
- OTP-based password reset with short-lived reset tokens

### ✅ Visitor Management

- Visitor check-in and check-out flows
- Host availability enforcement using defined schedules
- Track visit status (`checked-in`, `checked-out`)
- Daily and full log endpoints with pagination and filters

### ✅ User Management

- Admins can manage hosts, receptionists, and soldiers
- Super admins have full control, including over admins
- Users can update personal info and change their passwords securely

### ✅ Notifications System

- Hosts receive notifications when a visitor checks in
- Notifications are stored in the database
- Dedicated endpoint to fetch all or unread notifications for the logged-in host
- Notifications are displayed on a frontend notifications page

### ✅ Scheduling

- Hosts and receptionists can define their working availability
- Visit scheduling respects the host’s schedule

### ✅ Reporting

- Admins and super admins can:
  - Generate monthly visit reports in PDF format
  - View top 5 reasons for visit
  - View top 3 most-visited hosts
  - See total visitor count for the month

---

## 🛠️ Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Bcrypt** for secure password handling
- **PDFKit** for PDF generation
- **Date-fns** for date manipulation
- **Nodemailer** for password reset emails

---

## 📁 Folder Structure

```
vms-backend/
│
├── controllers/        ── Route logic
├── middleware/         ── Auth, error, and role checking
├── models/             ── Business logic and database operations
├── routes/             ── Express route definitions
├── schemas/            ── Mongoose schemas
├── utils/              ── Utility functions (emails, validation, notifications, reports)
├── constants/          ── JWT settings, roles, OTP config
├── server.js           ── Entry point
└── public/             ── Static files if needed
```

---

## 📦 API Endpoints Overview

### Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `PATCH /api/auth/reset-password`

### User Endpoints

- `GET /api/users` – List users (admin only)
- `GET /api/users/:id` – Get single user (with access control)
- `PATCH /api/users/:id` – Update user
- `DELETE /api/users/:id` – Delete user
- `GET /api/roles` – Fetch assignable roles based on the logged-in user

### Visitor Endpoints

- `POST /api/visits/new` – Visitor check-in
- `PATCH /api/visits/check-out/:id` – Visitor check-out
- `GET /api/visits/today` – Today's visits
- `GET /api/visits` – Full visit log with pagination and filters

### Schedule Endpoints

- `GET /api/schedule/:hostId` – Get all schedules for a host or receptionist.
- `POST /api/schedule/:hostId` – Create availability schedule for a host or receptionist
- `PATCH /api/schedule/:hostId/:scheduleId` – Update a single schedule for host or receptionist
- `DELETE /api/schedule/:hostId/:scheduleId` – Delete a single schedule for host or receptionist

### Notifications Endpoints

- `GET /api/notifications` – Fetch all or unread notifications for the logged-in host
- `PATCH /api/notifications/:id` – Mark a notification as read

### Reports

- `GET /api/reports/` – Generate monthly PDF report

---

## 🔐 Role & Permission Matrix

| Action / Role      | Super Admin | Admin | Host | Receptionist | Soldier |
| ------------------ | ----------- | ----- | ---- | ------------ | ------- |
| Manage Users       | ✅          | ✅    | ❌   | ❌           | ❌      |
| View Visit Logs    | ✅          | ✅    | ❌   | ❌           | ✅      |
| Check In Visitors  | ❌          | ❌    | ❌   | ❌           | ✅      |
| Check Out Visitors | ❌          | ❌    | ❌   | ❌           | ✅      |
| Set Availability   | ❌          | ❌    | ✅   | ✅           | ❌      |
| View Notifications | ❌          | ❌    | ✅   | ✅           | ❌      |
| Generate Reports   | ✅          | ✅    | ❌   | ❌           | ❌      |

---

## 📄 Monthly Report Content

The monthly PDF report includes:

- Total number of visitors
- Top 5 reasons for visit
- Top 3 hosts with the most visits
- Generated on the fly and downloadable via `GET /api/reports` endpoint.

---

## 🔧 Setup & Installation

```bash
# Clone the project
git clone https://github.com/Trans-Business-Machines/VMS-Backend.git

# Move into the directory
cd vms-backend

# Install dependencies
npm install

# Start the development server
npm start
```
