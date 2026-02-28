# ⚖️ Brieflytix — Attorney Case Management Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

**Brieflytix** is a full-stack **MERN** (MongoDB · Express · React · Node.js) legal case management dashboard built for law firms and solo practitioners. Featuring a refined dark navy-and-gold design system, it provides end-to-end management of cases, clients, documents, tasks, billing/invoicing, analytics, a calendar, and more — all from a single unified interface.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Default User Accounts](#default-user-accounts)
5. [Project Structure](#project-structure)
6. [Pages & Components](#pages--components)
7. [API Reference](#api-reference)
8. [Authentication & Authorization](#authentication--authorization)
9. [File Uploads](#file-uploads)
10. [Notifications](#notifications)
11. [Global Search](#global-search)
12. [Calendar](#calendar)
13. [Analytics & Reporting](#analytics--reporting)
14. [Billing & Invoicing](#billing--invoicing)
15. [Seed Data](#seed-data)
16. [Smart Defaults](#smart-defaults)
17. [Design System](#design-system)
18. [Environment Variables](#environment-variables)
19. [Scripts](#scripts)
20. [Troubleshooting](#troubleshooting)

---

## Features

### Core Modules

- **Cases** — Full CRUD with auto-generated case numbers (`CASE-YYYY-NNN`), 6 practice area types, 4 statuses, 3 priority levels, court dates, and client linking
- **Clients** — Individual and Corporate client management with card grid layout, cascade delete (removes linked cases, documents, and tasks)
- **Documents** — 7 document types through a 5-stage workflow (Draft → Filed), drag-and-drop file upload, physical file cleanup on delete, document viewer
- **Tasks** — Task tracking with completion percentage (0–100 range slider), status management, priority badges, overdue highlighting
- **Billing** — Invoice lifecycle management (Draft → Sent → Paid / Overdue / Cancelled), auto-generated invoice numbers (`INV-YYYY-NNNN`), auto-computed amounts (hours × rate), one-click Mark Paid, billing summary dashboard

### Cross-Cutting Features

- **Global Search** — Command palette (Ctrl+K) that searches across cases, clients, documents, and tasks simultaneously with full keyboard navigation
- **Real-Time Notifications** — Backend notifications with per-user read tracking, 30-second polling in the navbar, color-coded by severity
- **Calendar** — Monthly grid view aggregating court dates, task deadlines, document deadlines, and filing dates with color-coded event categories
- **Analytics** — 12 data visualizations including Monthly Intake, Client Growth, Attorney Caseload, Task Velocity, Monthly Revenue, Revenue by Practice Area, and more
- **File Upload** — Drag-and-drop with 20MB limit, supports PDF, Word, Excel, text, and images
- **CSV Export** — One-click export on Cases, Documents, Tasks, and Billing pages
- **Column Sorting** — Client-side sortable table columns with directional indicators
- **Pagination** — Sliding-window pagination with ellipsis for large datasets
- **Seed Data** — One-click button to populate 94 interconnected demo records

### User Experience

- **Smart Attorney Auto-Fill** — When creating cases, documents, or invoices, the logged-in attorney's name is pre-filled automatically (still changeable)
- **Context-Aware Auto-Fill** — Selecting a case in the billing form auto-fills client and attorney fields
- **Dark Theme** — Refined navy-and-gold design with Playfair Display headings and DM Sans body text
- **Responsive Layout** — Collapsible sidebar, mobile-friendly navigation
- **Toast Notifications** — User feedback for all CRUD operations via hot toast
- **Skeleton Loading** — Smooth loading states across all data views

---

## Tech Stack

### Backend

| Package           | Version | Purpose               |
| ----------------- | ------- | --------------------- |
| Express           | 4.18.2  | HTTP framework        |
| Mongoose          | 7.6.3   | MongoDB ODM           |
| CORS              | 2.8.5   | Cross-origin requests |
| Helmet            | 7.1.0   | Security headers      |
| Multer            | 2.0.2   | File upload handling  |
| dotenv            | 16.3.1  | Environment variables |
| express-validator | 7.0.1   | Input validation      |

### Frontend

| Package           | Version | Purpose                       |
| ----------------- | ------- | ----------------------------- |
| React             | 18.2.0  | UI library                    |
| React Router      | 6.18.0  | Client-side routing           |
| Axios             | 1.6.0   | HTTP client                   |
| Recharts          | 2.9.0   | Charts (Area, Bar, Pie, Line) |
| react-hot-toast   | 2.4.1   | Toast notifications           |
| lucide-react      | 0.292.0 | Icon library                  |
| @headlessui/react | 1.7.17  | Accessible UI primitives      |
| Tailwind CSS      | 3.3.5   | Utility-first CSS             |
| Vite              | 4.5.0   | Build tool + dev server       |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally on port 27017 (or a remote URI)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShivaprasadMurashillin/Brieflytix-Legal-Dashboard.git
cd Brieflytix-Legal-Dashboard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
cd frontend
npm install
```

### Configuration

Create `.env` files in both directories:

**backend/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/brieflytix
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
# Terminal 1 — Start the backend
cd backend
npm run dev

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**.

### Seed Demo Data

After starting both servers, click the **🌱 Seed Data** button in the navbar (or visit `http://localhost:5000/api/seed?confirm=yes`). This populates the database with 94 interconnected demo records.

---

## Default User Accounts

All accounts share the password **`Brieflytix2026`**:

| Email                    | Name               | Role               | Admin |
| ------------------------ | ------------------ | ------------------ | ----- |
| `admin@brieflytix.com`   | Elena Novak        | Senior Partner     | ✅    |
| `marcus@brieflytix.com`  | Marcus Garrison    | Partner            | —     |
| `isabela@brieflytix.com` | Isabela de la Cruz | Associate Attorney | —     |
| `chidi@brieflytix.com`   | Chidi Okonkwo      | Associate Attorney | —     |
| `fiona@brieflytix.com`   | Fiona Brennan      | Junior Associate   | —     |

> User accounts are stored in the browser's `localStorage` with automatic versioned refresh — when defaults are updated in the source code, existing sessions are seamlessly upgraded on next page load.

---

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── Billing.js             # Invoice schema (auto-computes amount)
│   │   ├── Case.js                # Case schema (6 types, 4 statuses, 3 priorities)
│   │   ├── Client.js              # Client schema (Individual / Corporate)
│   │   ├── Document.js            # Document schema (7 types, 5 statuses)
│   │   ├── Notification.js        # Notification schema (per-user read tracking)
│   │   └── Task.js                # Task schema (completion %, priority, status)
│   ├── routes/
│   │   ├── analytics.js           # 12-section analytics aggregation
│   │   ├── billing.js             # Invoice CRUD + summary + mark-paid
│   │   ├── calendar.js            # Monthly event aggregation
│   │   ├── cases.js               # Case CRUD (auto caseNumber, cascade delete)
│   │   ├── clients.js             # Client CRUD (cascade delete)
│   │   ├── documents.js           # Document CRUD (file cleanup on delete)
│   │   ├── notifications.js       # Notification CRUD (per-user read state)
│   │   ├── search.js              # Global search across all entities
│   │   ├── seed.js                # One-click demo data seeder (94 records)
│   │   ├── stats.js               # Dashboard statistics
│   │   ├── tasks.js               # Task CRUD
│   │   └── upload.js              # Multer file upload + delete
│   ├── utils/
│   │   ├── escapeRegex.js         # Regex escaping for MongoDB queries
│   │   └── notificationHelper.js  # Auto-generates notification records
│   ├── uploads/                   # Uploaded files directory (auto-created)
│   ├── server.js                  # Express entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BarChartWidget.jsx      # Recharts bar chart wrapper
│   │   │   ├── CaseModal.jsx           # Create/edit case form
│   │   │   ├── CaseTable.jsx           # Sortable case table
│   │   │   ├── ClientCard.jsx          # Client display card
│   │   │   ├── ClientModal.jsx         # Create/edit client form
│   │   │   ├── DocumentTable.jsx       # Document list table
│   │   │   ├── GlobalSearch.jsx        # Ctrl+K command palette
│   │   │   ├── Navbar.jsx              # Top bar (search, seed, notifications, logout)
│   │   │   ├── NotificationsPanel.jsx  # Notification dropdown
│   │   │   ├── Pagination.jsx          # Sliding-window pagination
│   │   │   ├── PieChartWidget.jsx      # Recharts donut chart wrapper
│   │   │   ├── ProgressWidget.jsx      # Task progress bars
│   │   │   ├── SearchFilter.jsx        # Reusable search + filter bar
│   │   │   ├── Sidebar.jsx             # Collapsible sidebar navigation
│   │   │   ├── StatCard.jsx            # KPI stat card with trend indicator
│   │   │   ├── TaskModal.jsx           # Create/edit task form
│   │   │   └── TaskTable.jsx           # Task list table
│   │   ├── pages/
│   │   │   ├── Analytics.jsx           # 12-chart analytics dashboard
│   │   │   ├── Billing.jsx             # Invoice management + summary
│   │   │   ├── Calendar.jsx            # Monthly calendar grid
│   │   │   ├── CaseDetail.jsx          # Single case view (tabs)
│   │   │   ├── Cases.jsx               # Case list with CRUD
│   │   │   ├── Clients.jsx             # Client card grid with CRUD
│   │   │   ├── Dashboard.jsx           # Main dashboard (KPIs, charts, tables)
│   │   │   ├── Documents.jsx           # Document management + file upload
│   │   │   ├── Login.jsx               # Login page with credentials hint
│   │   │   ├── Profile.jsx             # User profile + password change
│   │   │   ├── Tasks.jsx               # Task list with CRUD
│   │   │   └── Users.jsx               # Admin user management
│   │   ├── utils/
│   │   │   ├── badgeStyles.js          # Tailwind badge class maps
│   │   │   ├── exportCSV.js            # CSV export utility
│   │   │   ├── notificationStore.js    # localStorage notification management
│   │   │   └── userStore.js            # localStorage user management
│   │   ├── api/
│   │   │   └── index.js               # Axios client + API modules
│   │   ├── App.jsx                     # Root component (routing, auth, layout)
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Tailwind + custom component styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Pages & Components

### Pages (12)

| Page            | Route        | Description                                                                                                                                                                                                                                              |
| --------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**   | `/`          | Executive overview — 4 stat cards, 4 quick insights, 3 billing highlights, cases-by-type bar chart, case-status pie chart, recent cases table, active tasks progress, upcoming court dates with urgency coloring                                         |
| **Cases**       | `/cases`     | Full case management — searchable, filterable (status/type/priority), sortable table, create/edit modal, CSV export, delete with confirmation                                                                                                            |
| **Case Detail** | `/cases/:id` | Deep case view — tabbed interface (Overview, Documents, Tasks), summary stat strip, linked document deadlines, task progress rings                                                                                                                       |
| **Clients**     | `/clients`   | Client directory — card grid layout, individual/corporate type icons, cascade delete warning, search and filter                                                                                                                                          |
| **Documents**   | `/documents` | Document management — drag-and-drop file upload, type-specific icons, 5-stage workflow status, document viewer, deadline tracking, CSV export                                                                                                            |
| **Tasks**       | `/tasks`     | Task tracking — completion percentage with color-coded progress bars, priority badges, overdue highlighting, CSV export                                                                                                                                  |
| **Billing**     | `/billing`   | Invoice management — summary cards (Total Billed, Collected, Outstanding, Overdue), create/edit modal with auto-computed amounts, case→client→attorney auto-fill, mark-paid action, CSV export                                                           |
| **Calendar**    | `/calendar`  | Monthly grid — task deadlines (gold), document deadlines (amber), court dates (red), filing dates (green), day detail panel, month navigation                                                                                                            |
| **Analytics**   | `/analytics` | 12 visualizations — Monthly Intake (Area), Client Growth (Line), Attorney Caseload (Bar), Priority by Attorney (Stacked Bar), Task Velocity (Bar), Monthly Revenue (Area), Document Pipeline (Donut), Revenue by Practice Area, KPI cards, activity feed |
| **Login**       | `/login`     | Authentication — email/password form, demo credentials hint, gold scale icon branding                                                                                                                                                                    |
| **Profile**     | `/profile`   | User settings — edit name/phone/nationality, change password (current/new/confirm validation), admin badge, initials avatar                                                                                                                              |
| **Users**       | `/users`     | Admin-only — user CRUD, role management (6 roles), admin toggle with safety guards (can't delete self, can't remove last admin)                                                                                                                          |

### Components (17)

| Component              | Purpose                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sidebar**            | Collapsible navigation — 8 main nav items + Profile + User Management (admin only), gold active indicator, tooltip on collapse                |
| **Navbar**             | Top bar — dynamic page title, Ctrl+K search trigger, Seed Data button, notification bell with unread badge + 30s polling, user avatar, logout |
| **GlobalSearch**       | Command palette modal — debounced search (250ms), results grouped by entity type, full keyboard nav (↑↓ Enter Escape)                         |
| **NotificationsPanel** | Notification dropdown — severity icons/colors, relative time display, mark individual/all read, clear all                                     |
| **CaseModal**          | Case create/edit form — title, type, status, priority, client dropdown, attorney dropdown (auto-filled), court/filing dates, description      |
| **CaseTable**          | Sortable case table — column headers toggle ascending/descending, skeleton loading, links to case detail                                      |
| **ClientCard**         | Client display card — initials avatar (individual vs corporate icon), status badge, contact info, active cases count                          |
| **ClientModal**        | Client create/edit form — name, email (validated), phone, company, type, status, address, joined date                                         |
| **DocumentTable**      | Document table — type-specific emoji icons, status badges, overdue deadline highlighting, view/edit/delete actions                            |
| **TaskTable**          | Task table — status + priority badges, color-coded progress bar (red < 40%, gold 40–75%, green ≥ 75%), overdue highlighting                   |
| **TaskModal**          | Task create/edit form — title, description, case dropdown, assigned attorney, priority, status, due date, completion slider                   |
| **SearchFilter**       | Reusable search + filter bar — configurable filter dropdowns, clear-all button when filters are active                                        |
| **Pagination**         | Sliding-window pagination — configurable window size, ellipsis for large datasets, gold active page highlight                                 |
| **StatCard**           | KPI display card — icon, title, value, accent color, trend indicator (up/down/neutral)                                                        |
| **BarChartWidget**     | Recharts BarChart wrapper — gold/dark-gold alternating bars, card container                                                                   |
| **PieChartWidget**     | Recharts PieChart donut wrapper — status-based colors with legend                                                                             |
| **ProgressWidget**     | Task progress list — color-coded progress bars, priority badges, due dates with overdue highlighting                                          |

---

## API Reference

### Health

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| `GET`  | `/api/health` | Server health check |

### Clients

| Method   | Endpoint           | Description                                                                                 |
| -------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `GET`    | `/api/clients`     | List clients (paginated, searchable by name/email/company/phone, filterable by status/type) |
| `GET`    | `/api/clients/:id` | Get single client                                                                           |
| `POST`   | `/api/clients`     | Create client                                                                               |
| `PUT`    | `/api/clients/:id` | Update client                                                                               |
| `DELETE` | `/api/clients/:id` | Delete client + cascade delete linked cases, documents, and tasks                           |

### Cases

| Method   | Endpoint         | Description                                                                             |
| -------- | ---------------- | --------------------------------------------------------------------------------------- |
| `GET`    | `/api/cases`     | List cases (paginated, searchable, filterable by status/type/priority)                  |
| `GET`    | `/api/cases/:id` | Get single case (populates client)                                                      |
| `POST`   | `/api/cases`     | Create case (auto-generates `CASE-YYYY-NNN` number, increments client `activeCases`)    |
| `PUT`    | `/api/cases/:id` | Update case                                                                             |
| `DELETE` | `/api/cases/:id` | Delete case + cascade delete linked documents and tasks, decrement client `activeCases` |

### Documents

| Method   | Endpoint             | Description                                                              |
| -------- | -------------------- | ------------------------------------------------------------------------ |
| `GET`    | `/api/documents`     | List documents (paginated, searchable, filterable by status/type/caseId) |
| `GET`    | `/api/documents/:id` | Get single document                                                      |
| `POST`   | `/api/documents`     | Create document record                                                   |
| `PUT`    | `/api/documents/:id` | Update document                                                          |
| `DELETE` | `/api/documents/:id` | Delete document record + remove uploaded physical file                   |

### Tasks

| Method   | Endpoint         | Description                                                                         |
| -------- | ---------------- | ----------------------------------------------------------------------------------- |
| `GET`    | `/api/tasks`     | List tasks (paginated, searchable, filterable by status/priority/assignedTo/caseId) |
| `GET`    | `/api/tasks/:id` | Get single task                                                                     |
| `POST`   | `/api/tasks`     | Create task                                                                         |
| `PUT`    | `/api/tasks/:id` | Update task                                                                         |
| `DELETE` | `/api/tasks/:id` | Delete task                                                                         |

### Billing

| Method   | Endpoint               | Description                                                                                               |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/billing`         | List invoices (paginated, searchable, filterable by status)                                               |
| `GET`    | `/api/billing/summary` | Billing summary — status breakdown, grand totals (billed/paid/outstanding/overdue), 6-month revenue trend |
| `GET`    | `/api/billing/:id`     | Get single invoice                                                                                        |
| `POST`   | `/api/billing`         | Create invoice (auto-generates `INV-YYYY-NNNN`, auto-computes amount = hours × hourlyRate)                |
| `PUT`    | `/api/billing/:id`     | Update invoice                                                                                            |
| `PUT`    | `/api/billing/:id/pay` | Mark invoice as Paid (sets paidDate to now)                                                               |
| `DELETE` | `/api/billing/:id`     | Delete invoice                                                                                            |

### Dashboard & Analytics

| Method | Endpoint         | Description                                                                                                                                                                                                                    |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/stats`     | Dashboard statistics — total/active cases, pending tasks, documents filed, task completion rate, cases by status/type, recent cases, upcoming deadlines                                                                        |
| `GET`  | `/api/analytics` | 12-section analytics — monthly intake, attorney workload, case outcomes, task velocity, doc pipeline, client growth, priority breakdown, overdue analysis, revenue by type, billing overview, monthly revenue, recent activity |

### Notifications

| Method   | Endpoint                           | Description                                                                |
| -------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `GET`    | `/api/notifications`               | List last 40 notifications (per-user read state via `x-user-email` header) |
| `PUT`    | `/api/notifications/mark-all-read` | Mark all notifications as read for current user                            |
| `PUT`    | `/api/notifications/:id/read`      | Mark a single notification as read                                         |
| `DELETE` | `/api/notifications`               | Clear all notifications                                                    |

### File Upload

| Method   | Endpoint                | Description                                                       |
| -------- | ----------------------- | ----------------------------------------------------------------- |
| `POST`   | `/api/upload`           | Upload a file (multipart/form-data, field name: `file`, max 20MB) |
| `DELETE` | `/api/upload/:filename` | Delete an uploaded file (path-traversal protected)                |

### Search & Calendar

| Method | Endpoint                     | Description                                                                     |
| ------ | ---------------------------- | ------------------------------------------------------------------------------- |
| `GET`  | `/api/search?q=`             | Global search across cases, clients, documents, and tasks (8 results per type)  |
| `GET`  | `/api/calendar?year=&month=` | Calendar events for a given month — tasks, documents, court dates, filing dates |

### Seed

| Method | Endpoint                | Description                                                          |
| ------ | ----------------------- | -------------------------------------------------------------------- |
| `GET`  | `/api/seed?confirm=yes` | **⚠️ Destructive** — Wipes all collections and seeds 94 demo records |

---

## Authentication & Authorization

Brieflytix implements a **client-side authentication** system with role-based access control:

1. **Login** — Email and password credentials are validated against the user store via `findUser()` in `userStore.js`
2. **Session Management** — On successful login, a session object (`id`, `name`, `role`, `email`, `isAdmin`) is persisted to `localStorage` under `brieflytix_auth`
3. **Auto Session Refresh** — On every page load, `loadUser()` in `App.jsx` automatically syncs the session with the latest user data, ensuring name/role changes are reflected without re-login
4. **Request Identity** — Axios interceptors attach `x-user-name` and `x-user-email` headers to every API request, enabling per-user features like notification read tracking
5. **Role-Based Access** — Admin-only routes (e.g., `/users`) are protected with client-side guards that redirect unauthorized users to the dashboard

---

## File Uploads

- Handled by **Multer** on the backend
- **Drop zone** in the Documents page — drag-and-drop or click to browse
- **Allowed types:** PDF, Word (.doc/.docx), Excel (.xls/.xlsx), text files, images (PNG, JPEG, GIF, WebP)
- **Maximum size:** 20MB per file
- **Storage:** Files saved to `backend/uploads/` with timestamped filenames (`1234567890_original-name.pdf`)
- **Cleanup:** Deleting a document record also removes the physical file from disk
- **Security:** Path traversal protection on file deletion

---

## Notifications

Brieflytix has a **dual notification system**:

### Backend Notifications (MongoDB)

- Stored in the `Notification` model with per-user read tracking via the `readBy` array
- Automatically created when cases, clients, documents, or tasks are created/updated/deleted
- Emoji-prefixed titles generated by `notificationHelper.js`
- Accessed via `/api/notifications` with user identification through `x-user-email` header

### Frontend Notifications (localStorage)

- 5 seeded demo notifications managed by `notificationStore.js`
- Used as a fallback/supplement — versioned refresh ensures updates propagate

### Polling

- The **Navbar** polls `/api/notifications` every **30 seconds** for new notifications
- Unread count shown as a badge on the bell icon
- Notifications panel shows relative timestamps ("2 hours ago"), mark-read actions, and clear-all

---

## Global Search

Press **Ctrl+K** (or click the search icon in the navbar) to open the command palette:

- Searches across **Cases**, **Clients**, **Documents**, and **Tasks** simultaneously
- Debounced at 250ms for performance
- Results grouped by entity type with contextual labels and metadata
- Full keyboard navigation: ↑↓ arrows to move, Enter to select, Escape to close
- Navigates directly to the relevant page on selection

---

## Calendar

The monthly calendar view aggregates events from multiple sources:

| Color    | Event Type         | Source              |
| -------- | ------------------ | ------------------- |
| 🟡 Gold  | Task deadlines     | `Task.dueDate`      |
| 🟠 Amber | Document deadlines | `Document.deadline` |
| 🔴 Red   | Court dates        | `Case.courtDate`    |
| 🟢 Green | Filing dates       | `Case.filingDate`   |

Features:

- Click any day to view its events in a detail panel
- Navigate between months with arrow buttons
- "Today" button to jump to current month
- Events are fetched from `/api/calendar?year=&month=`

---

## Analytics & Reporting

The Analytics page displays **12 data visualizations** powered by Recharts:

| Section                  | Chart Type     | Data Source                     |
| ------------------------ | -------------- | ------------------------------- |
| Monthly Case Intake      | Area Chart     | 12-month case creation trend    |
| Client Growth            | Line Chart     | Cumulative client onboarding    |
| Attorney Caseload        | Horizontal Bar | Cases per attorney              |
| Priority by Attorney     | Stacked Bar    | Priority breakdown per attorney |
| Task Velocity            | Bar Chart      | 6-month task completion trend   |
| Monthly Revenue          | Area Chart     | Paid invoices over 6 months     |
| Document Pipeline        | Donut (Pie)    | Documents by workflow status    |
| Revenue by Practice Area | Bar Chart      | Revenue grouped by case type    |
| Overdue Analysis         | Summary        | Overdue tasks and invoices      |
| Case Closure Rate        | KPI Card       | Percentage of closed cases      |
| Active Caseload          | KPI Card       | Currently active case count     |
| Recent Activity          | Feed           | Last 10 notification entries    |

All analytics data is computed via MongoDB aggregation pipelines in `/api/analytics`.

---

## Billing & Invoicing

### Invoice Lifecycle

```
Draft → Sent → Paid
                └→ Overdue
                └→ Cancelled
```

### Features

- **Auto-generated invoice numbers** — format: `INV-YYYY-NNNN` (e.g., `INV-2026-0017`)
- **Auto-computed amounts** — `amount = hours × hourlyRate` (calculated via Mongoose pre-save hook)
- **Smart auto-fill** — selecting a case auto-fills the client and attorney fields
- **Attorney pre-fill** — logged-in user's name is default attorney on new invoices
- **Mark Paid** — one-click action that sets status to "Paid" and records the payment date
- **Summary dashboard** — 4 KPI cards (Total Billed, Total Collected, Outstanding, Overdue) + 6-month revenue trend
- **CSV export** — export invoice data including client, case, attorney, hours, rate, amount, status, dates

### Dashboard Integration

The main Dashboard includes billing KPI rows pulling real data from `/api/billing/summary`, and the Analytics page uses billing data for Revenue by Practice Area and Monthly Revenue charts.

---

## Seed Data

Click the **🌱 Seed Data** button in the navbar to populate the database with a complete demo dataset:

| Entity        | Count  | Details                                                                       |
| ------------- | ------ | ----------------------------------------------------------------------------- |
| Clients       | 10     | Mix of individual and corporate clients                                       |
| Cases         | 18     | Across 6 practice areas (Criminal, Civil, Family, Corporate, Immigration, IP) |
| Documents     | 18     | Contracts, motions, briefs, evidence, affidavits                              |
| Tasks         | 20     | Various statuses and completion percentages                                   |
| Notifications | 12     | Recent activity log entries                                                   |
| Invoices      | 16     | Draft, Sent, Paid, and Overdue invoices                                       |
| **Total**     | **94** | All records are interconnected with proper references                         |

**⚠️ Warning:** Seeding deletes ALL existing data. The endpoint requires `?confirm=yes` as a safety measure.

### Attorneys in Seed Data

All 5 default attorneys are referenced throughout:

- **Elena Novak** — Senior Partner
- **Marcus Garrison** — Partner
- **Isabela de la Cruz** — Associate Attorney
- **Chidi Okonkwo** — Associate Attorney
- **Fiona Brennan** — Junior Associate

---

## Smart Defaults

Brieflytix reduces repetitive data entry with intelligent form defaults:

- **Attorney auto-fill** — When creating a new case, document, or invoice, the logged-in attorney is automatically selected as the assigned attorney / uploader. You can still change it to another attorney if needed.
- **Case → Client + Attorney** — In the billing form, selecting a case auto-fills both the client and the assigned attorney from that case.
- **Session refresh** — If user data is updated (e.g., role change, name update), the session is automatically refreshed on next page load without requiring re-login.
- **Versioned localStorage** — Both user accounts and demo notifications use version tracking. When defaults change in the source code, stale localStorage data is automatically replaced.

---

## Design System

### Theme

- **Background:** Dark navy gradient — `#0A0F1C` (sidebar) → `#101729` (main) → `#1A2035` (cards)
- **Accent:** Gold — `#C9A84C` (buttons, active states, highlights)
- **Text:** `#E2E8F0` (primary), `#94A3B8` (secondary/muted)
- **Semantic:** Green (success), Yellow (warning), Red (danger), Blue (info)

### Typography

- **Headings:** Playfair Display (serif) — via Google Fonts
- **Body:** DM Sans (sans-serif) — via Google Fonts

### Component Classes

Defined in `index.css` using Tailwind's `@apply`:

- `.card` — Dark card with border and rounded corners
- `.btn-primary` — Gold button with hover darkening
- `.btn-ghost` — Transparent button with hover background
- `.btn-danger` — Red delete button
- `.input`, `.select` — Dark-themed form controls
- `.badge` — Small rounded status/priority indicators
- `.table-header`, `.table-row`, `.table-cell` — Consistent table styling

### Custom Tailwind Extensions

Colors, font families, and semantic tokens are configured in `tailwind.config.js`:

- Navy scale: `navy-600` through `navy-900`
- Gold: `gold` accent color
- Semantic: `lex-text`, `lex-muted`, `lex-success`, `lex-warning`, `lex-danger`, `lex-info`
- Font families: `heading` (Playfair Display), `body` (DM Sans)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Default                                | Description               |
| -------------- | -------------------------------------- | ------------------------- |
| `PORT`         | `5000`                                 | Express server port       |
| `MONGODB_URI`  | `mongodb://localhost:27017/brieflytix` | MongoDB connection string |
| `NODE_ENV`     | `development`                          | Environment mode          |
| `FRONTEND_URL` | `http://localhost:5173`                | Allowed CORS origin       |

### Frontend (`frontend/.env`)

| Variable       | Default                     | Description          |
| -------------- | --------------------------- | -------------------- |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

> In development, Vite proxies `/api` requests to the backend (configured in `vite.config.js`).

---

## Scripts

### Backend

```bash
npm start        # Start production server (node server.js)
npm run dev      # Start development server with auto-reload (nodemon)
```

### Frontend

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Troubleshooting

| Problem                       | Solution                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MongoDB connection error**  | Ensure MongoDB is running (`mongod`) and `MONGODB_URI` in `.env` is correct                                                                              |
| **CORS errors**               | Verify `FRONTEND_URL` in backend `.env` matches the frontend origin                                                                                      |
| **Old user names showing**    | The app uses versioned localStorage — refresh the page. If names still persist, clear `brieflytix_users` and `brieflytix_auth` from browser localStorage |
| **Old notifications showing** | Clear `brieflytix_notifications` from browser localStorage, then refresh                                                                                 |
| **Seed button not working**   | Ensure the backend is running and accessible at the configured URL                                                                                       |
| **File upload fails**         | Check that `backend/uploads/` directory exists (auto-created on first upload) and file is under 20MB                                                     |
| **Blank page after build**    | Run `npm run build` in the frontend directory and check for any build errors                                                                             |
| **Port already in use**       | Change `PORT` in backend `.env` or kill the process using the port                                                                                       |

---

<p align="center">
  <strong>⚖️ Brieflytix</strong> — Built for attorneys who demand clarity.<br>
  <sub>MERN Stack · Dark Theme · Real-Time Analytics · Smart Defaults</sub>
</p>
