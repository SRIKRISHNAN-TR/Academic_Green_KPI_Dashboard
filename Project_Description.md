# Project Report: Academic Green KPI Dashboard

## 1. Project Overview
The **Academic Green KPI Dashboard** is a state-of-the-art environmental management system designed for academic institutions. Its primary goal is to provide a centralized, data-driven platform for monitoring and improving the sustainability performance of various campus facilities. By tracking Key Performance Indicators (KPIs) such as electricity, water, and waste, the institution can make informed decisions to reduce its environmental footprint and meet sustainability targets.

## 2. Problem Statement
Many academic institutions lack a unified system to track their environmental impact across multiple locations (hostels, libraries, academic blocks, etc.). Data is often scattered in spreadsheets or paper records, making it difficult to:
- Compare performance between different buildings.
- Identify "high-usage" areas in real-time.
- Track progress against annual sustainability goals.
- Generate high-quality reports for stakeholders.

## 3. System Architecture
The project follows a modern **MERN** (MongoDB, Express.js, React, Node.js) stack architecture, ensuring scalability, performance, and a seamless user experience.

- **Frontend**: A responsive Single Page Application (SPA) built with React 18, TypeScript, and Vite.
- **Backend**: A RESTful API built with Node.js and Express.js, handling business logic, authentication, and database operations.
- **Database**: MongoDB (NoSQL), providing flexible data modeling for varied environmental metrics.
- **Authentication**: Secure JWT-based authentication with role-based access control (Admin, Data Entry, Viewer).

## 4. Technical Specifications

### 4.1 Frontend Technology Stack
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS for responsive and modern UI layout.
- **Component Library**: **Shadcn UI** and **Radix UI** for accessible, premium-feeling components.
- **State Management**: TanStack React Query for efficient data fetching and caching.
- **Data Visualization**: Recharts for dynamic, interactive performance graphs.
- **Forms**: React Hook Form with Zod schema validation.
- **Icons**: Lucide React and Tabler Icons.

### 4.2 Backend Technology Stack
- **Server**: Node.js & Express.js
- **Database ORM**: Mongoose
- **Security**: 
  - `bcryptjs` for password hashing.
  - `jsonwebtoken` (JWT) for secure session management.
  - `express-rate-limit` to prevent brute-force attacks.
  - `cors` for cross-origin resource sharing.
- **Utility**: `nodemailer` for automated email alerts and password resets.

## 5. Functional Modules & Features

### 5.1 Real-time Sustainability Dashboard
- **MTD (Month-to-Date) & YTD (Year-to-Date) Summaries**: Real-time aggregation of energy, water, and waste data.
- **RAG Status System**: Automated visual indicators (Red, Amber, Green) based on performance against targets:
  - **Green**: Under or at target (On track).
  - **Yellow**: Within 10% of exceeding target (Warning).
  - **Red**: Exceeded target (Action required).
- **Interactive Charts**: Visual representation of trends and comparisons.

### 5.2 Multi-Metric Tracking
- **Electricity**: Measured in kWh, tracked by location and meter source.
- **Water Consumption**: Measured in m³, helping identify leaks or high-usage periods.
- **Waste Management**: Tracks the "Waste Diversion Rate" (percentage of waste recycled or composted vs. landfill).
- **Carbon Footprint**: Automated calculation of CO₂e emissions based on resource usage.

### 5.3 Advanced Analytics
- **Highest Usage Ranking**: Automatically identifies and ranks the top 5 highest resource-consuming locations on campus.
- **Sustainability Score**: A calculated 0-100 score representing the institution's overall environmental health.

### 5.4 Data Entry & Management
- **Role-based Access**: Only "Data Entry" and "Admin" users can input new data.
- **Input Validation**: Strict validation ensures no erroneous data enters the system.
- **Location Management**: Ability to categorize data by specific buildings or departments.

### 5.5 Reporting & Documentation
- **KPI Snapshots**: Allows admins to "freeze" data at the end of a month for historical record-keeping.
- **PDF/Docx Export**: Integrated functionality to download professional reports for board meetings or accreditation (e.g., NAAC/NIRF context).

### 5.6 Communication & Alerts
- **Notification Center**: In-app alerts for target breaches.
- **Email Alerts**: Integration with SMTP to notify admins of critical sustainability issues.

## 6. Database Schema Design (Key Models)
- **User**: Stores credentials, roles (Admin/DataEntry), and profile info.
- **Energy/Water/Waste/Carbon**: Stores periodic data including `actual` usage, `target` values, `month`, `year`, and `location`.
- **Target**: Stores specific sustainability goals set by the administration for each metric.
- **Notification**: Stores logs of triggered alerts for different users.

## 7. Security Features
- **Sensitive Data Protection**: Passwords are never stored in plain text (Bcrypt).
- **Route Guarding**: Frontend and Backend routes are protected; unauthorized users cannot access admin panels or data entry forms.
- **Environment Management**: Configuration stored in secure `.env` files for production and development environments.

## 8. Conclusion
The Academic Green KPI Dashboard is more than just a tracking tool; it is a strategic asset for any academic institution aiming for excellence in environmental stewardship. Its robust tech stack, combined with a user-centric design and powerful analytical capabilities, makes it a benchmark for sustainability management in the education sector.
