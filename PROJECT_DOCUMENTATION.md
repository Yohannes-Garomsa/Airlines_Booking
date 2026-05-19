# Airline Booking System - Comprehensive Project Documentation

## 1. Executive Summary
The Airline Booking System is a full-stack, enterprise-grade web application designed to facilitate online flight reservations, automated ticket generation, payment processing, and administrative flight management. It leverages a modern JavaScript-based tech stack, providing a scalable and responsive experience for both end-users and administrators.

## 2. System Architecture
The application follows a standard Data-driven Client-Server architectural pattern.
- **Frontend (Client-Tier)**: Developed with React.js using Vite, serving as the user interface for passengers and administrators. It communicates with the backend via RESTful APIs and real-time WebSockets.
- **Backend (Server-Tier)**: Developed with Node.js and Express.js. It handles business logic, security, payment mock-processing, and database transactions.
- **Database (Data-Tier)**: Relational Data Base Management System (PostgreSQL) is utilized to ensure ACID compliance for booking and seat reservations.

## 3. Technology Stack
### 3.1 Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Radix UI Primitives (shadcn/ui), Framer Motion (for animations)
- **Routing**: React Router DOM (v6)
- **Form Management & Validation**: React Hook Form, Zod
- **API Communication**: Axios, Socket.io-client
- **Date Handling**: date-fns, react-day-picker

### 3.2 Backend
- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Authentication/Security**: JSON Web Tokens (JWT), bcryptjs (password hashing), Helmet (HTTP headers security), Express-Rate-Limit
- **Real-Time Communication**: Socket.io
- **PDF Generation**: PDFKit (for generating e-tickets)
- **Email Service**: Nodemailer (for booking confirmations)
- **Utility**: QR Code extraction (`qrcode`)

## 4. Module Details 

### 4.1 Frontend Modules
The frontend application comprises multiple dynamic pages to provide a structured user flow:
- **`HomePage` (`/`)**: Landing page displaying search components and promotional content.
- **Authentication Pages (`/login`, `/register`, `/admin/login`)**: Secure gateways for passenger and administrative access.
- **`DashboardPage` (`/dashboard`)**: User portal displaying booking history and profile details.
- **`BookingPage` (`/booking/:flightId`)**: Passenger detail entry and seat selection.
- **`PaymentPage` (`/payment/:bookingId`)**: Payment gateway mock integration.
- **`TicketPage` (`/ticket/:bookingId`)**: Displays the generated boarding pass with QR code integration. Publicly viewable link for sharing.
- **`AdminDashboard` (`/admin`)**: Protected route for system managers to add/edit flights, manage bookings, and view system analytics.
- **`AdminVerifyTicket` (`/admin/verify`)**: Endpoint for ticket validation by administrative staff using QR/Ticket-ID algorithms.

### 4.2 Backend API Services
The Express application is strictly modular, dividing responsibilities among separated route files and controllers:
- **Auth Routes (`/api/auth`)**: Login, registration, and token validation.
- **User Routes (`/api/users`)**: Profile data manipulation.
- **Flight Routes (`/api/flights`)**: CRUD operations for flights (creation, scheduling, pricing).
- **Booking & Passenger Routes (`/api/bookings`, `/api/passengers`)**: Handles reservation state machines, calculating prices, and associating passengers.
- **Payment Routes (`/api/payments`)**: Secures transaction handling.
- **Seat Routes (`/api/seats`)**: Concurrent seat reservation handling to prevent double-booking.
- **Ticket Routes (`/api/tickets`)**: Dynamic PDF and QR code ticket generation using PDFKit.
- **Admin Routes (`/api/admin`)**: Master-level actions overriding standard user restrictions.

## 5. Database Schema
The database uses a robust PostgreSQL relational setup to maintain integrity across operations. Key entities include:

- **`users`**: `id`, `name`, `email` (UNIQUE), `password`, `role` (Admin/User), `created_at`.
- **`flights`**: `id`, `airline`, `departure_city`, `arrival_city`, `departure_time`, `arrival_time`, pricing columns (economy/business), seat capacities.
- **`bookings`**: `id`, `user_id` (FK), `flight_id` (FK), `total_price`, `cabin_class`, `status` (pending/confirmed/cancelled).
- **`passengers`**: `id`, `booking_id` (FK), `name`, `email`. One booking can have multiple passengers.
- **`payments`**: `id`, `booking_id` (FK), `amount`, `payment_method`, `status`, `transaction_id`.
- **`seats`**: `id`, `flight_id` (FK), `seat_number`, `is_occupied`, `seat_class`, `booking_id` (FK). Uses a composite unique constraint on `flight_id` and `seat_number`.

## 6. Implementation of Key Features
1. **Concurrency Control**: Implements database locks and transaction strategies (likely via ACID properties) to prevent race conditions during seat booking. Socket.io is used to broadcast real-time seat availability to connected clients.
2. **Security Infrastructure**: Password hashing via Bcrypt prevents leakages. JWT ensures stateless yet secure session management. Helmet protects against common web vulnerabilities, and Rate Limiting prevents brute-force attacks on the APIs.
3. **Automated Documentation & E-Tickets**: PDFKit draws out professional flight layouts combined with generated QR Codes indicating verifiable ticket references.

## 7. Deployment & Setup Instructions

### 7.1 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Git

### 7.2 Local Setup
1. **Clone the Repository**: Ensure you have both `frontend` and `backend` folders locally.
2. **Database Initialization**: 
    - Create a PostgreSQL database (e.g., `airline_db`).
    - Run the scripts contained within `schema.sql` (and optionally `schema_v2/v3/v4.sql`) on PostgreSQL to layout the tables.
    - Run backend seed files `node backend/seed.js` to populate mock flights.
3. **Backend Environment Configuration**:
    - Inside `/backend`, create a `.env` file containing:
      ```
      PORT=5000
      DATABASE_URL=postgres://user:password@localhost:5432/airline_db
      JWT_SECRET=your_jwt_secret
      SMTP_HOST=... (email configuration for nodemailer)
      ```
4. **Install Dependencies & Start**:
    - **Backend**: 
      ```bash
      cd backend
      npm install
      npm run dev
      ```
    - **Frontend**:
      ```bash
      cd frontend
      npm install
      npm run dev
      ```
5. **Access Application**: Navigate to `http://localhost:5173` (default Vite port) in your browser. Complete REST APIs run successfully on `http://localhost:5000`.

## 8. Conclusion
The Airline Booking System is a strong template for real-world enterprise projects, delivering highly sought-after system designs encompassing concurrent database modifications, responsive interfaces, secure APIs, and real-time connectivity natively constructed over Node.js and React.
