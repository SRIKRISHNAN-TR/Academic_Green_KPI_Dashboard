# Academic Green KPI Dashboard

The Academic Green KPI Dashboard is a comprehensive web application designed to track, manage, and analyze environmental Key Performance Indicators (KPIs) for academic institutions.

It features a full-stack architecture comprising a React front-end and a Node.js/Express back-end.

## Tech Stack

### Frontend
- **Framework**: React 18, utilizing Vite for fast builds and hot-module replacement (HMR).
- **Language**: TypeScript
- **Styling**: Tailwind CSS for utility-first styling.
- **UI Components**: Shadcn UI & Radix UI primitives for accessible, high-quality component design.
- **Routing**: React Router DOM
- **Data Fetching & State**: TanStack React Query
- **Charts**: Recharts for visualizing KPI data.
- **Forms**: React Hook Form with Zod validation.
- **Other utilities**: lucide-react for icons, date-fns for time formatting, jspdf and docx for exports.

### Backend
- **Framework**: Express on Node.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for password hashing
- **Security**: cors, express-rate-limit
- **Mail**: Nodemailer for sending automated emails.

## Project Structure

This repository is organized into two main directories:
- `/frontend`: Contains the Vite + React client application.
- `/backend`: Contains the Express.js server and database connection logic.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with a package manager like npm or yarn. You will also need a MongoDB instance running locally or via MongoDB Atlas.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd "Academic Green KPI Dashboard"
   ```

2. Setup the backend:
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory based on required environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, etc.).*

3. Setup the frontend:
   ```bash
   cd ../frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory if there are any specific local Vite environment variables required.*

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   This will start the Node server using nodemon for automatic restarts.

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   This will start Vite on the configured localhost port.

## License
MIT
