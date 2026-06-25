# WorkWave
> Connect, Apply, and Hire. A modern, premium MERN-stack Job Portal featuring role-based dashboards, interactive analytics, and professional report exports.

---

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Screenshots](#screenshots)
5. [Database Design](#database-design)
6. [API Overview](#api-overview)
7. [Security Features](#security-features)
8. [Project Structure](#project-structure)
9. [Installation & Setup](#installation--setup)
10. [Environment Variables](#environment-variables)
11. [Usage Guide](#usage-guide)
12. [Future Enhancements](#future-enhancements)
13. [Contributors](#contributors)
14. [License](#license)
15. [Acknowledgements](#acknowledgements)

---

## Overview
**WorkWave** is a robust and visually stunning job portal built on the MERN stack. Designed with clean aesthetics, glassmorphism, and responsive layouts, it streamlines the job hunting and recruiting experience. 

- **Problem Solved**: Bridge the gap between developer talent and hiring employers by eliminating cluttered interfaces, ensuring singular application integrity, and providing actionable hiring statistics.
- **Target Users**: Tech Candidates looking for their next milestone and Recruiters/Employers trying to scale their engineering teams.
- **Objectives**: Ensure high application integrity (preventing spam/duplicates), deliver smooth profile exports, and provide clean user flows.

---

## Key Features

### Candidate Features
* **Authentication**: Secure sign-up/login with standard accounts, validation, and password reset functionalities.
* **Browse Jobs**: Highly interactive feed featuring filter chips for quick-access parameters (Internship, Full Time, Part Time, Remote, Frontend, Backend, etc.).
* **Search & Filter**: Real-time search bar scanning titles, companies, and skill lists.
* **Apply for Jobs**: Interactive application flow prompting for optional cover letters.
* **Duplicate Prevention**: Guaranteed singular application state; the frontend replaces the apply button with **Applied** (including checkmark icons) dynamically across the dashboard, job details, and search listings, while the database enforces uniqueness.
* **Application Tracker**: "My Applications" tab to view real-time status updates (Pending, Shortlisted, Interview Scheduled, Accepted, Hired, Rejected).
* **Saved Jobs**: Local and database-backed bookmarks to watchlist positions of interest.
* **Notifications**: Immediate toast alerts and notification center logs for interview schedules, status updates, and hiring offers.
* **Public Employer Profiles**: Dedicated brand pages containing company statistics, missions, gallery components, and available jobs.
* **Profile Management**: Profile page calculating percentage completion based on uploaded resume details, skills tags, social links, education, and experience.

### Employer Features
* **Company Profiles**: Customizable brand portal with gallery banners, Recruiter info, size, industry, mission statement, and core values.
* **Job Posting & Operations**: Intuitive form to post jobs with criteria like salary ranges, benefits, required skills, and deadlines. Support for editing, archiving, and deleting listings.
* **Applicant Management**: Dedicated view to track candidates applying for posted jobs. Recruiters can transition statuses (Reviewed, Shortlisted, Hired, Rejected) with customizable reason messages.
* **Interview Scheduler**: Comprehensive booking tool to invite candidates to Google Meet, MS Teams, Zoom, or offline venues, generating automated candidate notification logs.
* **Employer Analytics**: Visual dashboard rendering statistics like Total Applications, Hires, and Funnel Conversion Rates.
* **Export Analytics PDF**: Generate professional, publication-quality PDF reports summarizing recruitment trends, hiring conversion rates, and monthly workloads via native custom engines.
* **Recruiter Settings**: Toggle-driven notification rules and secure credentials management.

### Admin Features
* *(Partially Implemented)*: Under development. Database supports the `"admin"` role, and TypeScript types allow for expansion into system-wide user/employer management, reporting analytics, and health monitoring.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS, Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **HTTP Client**: Axios
- **Toasts**: React Hot Toast
- **PDF Generation**: jsPDF, html2canvas

### Backend
- **Runtime**: Node.js
- **Framework**: Express (with CORS middleware)
- **Database Wrapper**: Mongoose
- **File Uploads**: Multer
- **Email Dispatch**: Nodemailer
- **Authentication**: JSON Web Token (JWT), BcryptJS
- **Process Manager**: Nodemon (Development)

### Database
- **Provider**: MongoDB (Atlas)

---

## Screenshots

> *Add screenshots or walkthrough videos here once UI captures are available.*

| Candidate Dashboard | Jobs Search Grid |
| :---: | :---: |
| *[Dashboard Preview Placeholder]* | *[Jobs Preview Placeholder]* |

| Job Details Page | Employer Analytics Report |
| :---: | :---: |
| *[Job Details Placeholder]* | *[Analytics Report Placeholder]* |

---

## Database Design

MongoDB collections and schemas are defined as:
1. **User (`User.js`)**: Stores authentication details, role (`candidate` | `employer` | `admin`), candidate profile details (resumes, experience, education, skills), and employer brand fields (benefits, mission, values, banner images).
2. **Job (`Job.js`)**: Contains posting details including company, title, requirements, skills, location, type, salary range, and status (`active` | `closed` | `archived`).
3. **Application (`Application.js`)**: Tracks candidate submissions. Enforces unique combinations of `(user, job)` and `(candidate, job)` through native database indexes. Stores interview details, status history, meeting links, and feedback.
4. **SavedJob (`SavedJob.js`)**: Links users to jobs they have bookmarked for later.
5. **Notification (`Notification.js`)**: Logs messages, alerts, and system updates for individual users.

---

## API Overview

### Authentication
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate credentials and receive a JWT token.
- `POST /api/auth/forgot-password` - Request a password reset email.
- `POST /api/auth/reset-password/:token` - Process password reset updates.

### Jobs
- `GET /api/jobs` - List all active jobs.
- `GET /api/jobs/:id` - Fetch details for a specific job.
- `POST /api/jobs` - Create a new job posting (Employer only).
- `PUT /api/jobs/:id` - Update job details (Employer only).
- `DELETE /api/jobs/:id` - Archive or remove a job (Employer only).

### Applications
- `GET /api/applications/my` - Retrieve logged-in candidate's applications.
- `POST /api/applications` - Submit an application for a job.
- `DELETE /api/applications/:id` - Withdraw an application.
- `GET /api/applications/employer` - Retrieve applicant lists for the employer's listings.
- `PATCH /api/applications/:id/status` - Change application status (Employer only).
- `PATCH /api/applications/:id/interview` - Schedule interview details (Employer only).

### User Settings & Bookmarks
- `GET /api/user/saved-jobs` - Get bookmarked jobs.
- `POST /api/user/saved-jobs` - Save a job posting.
- `DELETE /api/user/saved-jobs/:jobId` - Unsave a job posting.
- `PUT /api/user/settings` - Save notification toggles and profile updates.

---

## Security Features
* **JWT-based Session Management**: Secure tokens transmitted in headers for all private API routes.
* **Bcrypt Password Encryption**: Passwords salted and hashed before storing in the database.
* **Database Unique Constraints**: Prevents duplicate applications at the database engine level via unique compound indexes.
* **CORS Protection**: Restricted cross-origin resource sharing configured on the Express backend.
* **Route Protection**: React Router guards ensuring only authenticated users and correct roles (e.g. Recruiters) access management dashboards.

---

## Project Structure

```
WorkWave/
├── client/                 # React SPA Front-End
│   ├── src/
│   │   ├── assets/         # Images, global media files
│   │   ├── components/     # Reusable layout cards (HeroCard, StatCard, etc.)
│   │   ├── layouts/        # Application grid wrappers
│   │   ├── pages/          # Candidate and Recruiter pages (Jobs, Analytics, Settings)
│   │   ├── services/       # Axios API client handlers
│   │   ├── types/          # TypeScript structural interfaces
│   │   └── utils/          # PDF and text processors
│   └── package.json
└── server/                 # Node.js/Express Backend API
    ├── config/             # DB configurations
    ├── controllers/        # Route controllers containing business logic
    ├── middleware/         # JWT Auth and file-upload filters
    ├── models/             # Mongoose Database schemas
    ├── routes/             # API route endpoints mapping
    ├── uploads/            # Temporary/profile upload repositories
    └── server.js           # Server initializer and listener script
```

---

## Installation & Setup

### Prerequisites
- Node.js installed locally.
- A MongoDB cluster or local instance running.
- Gmail SMTP app credentials (if testing notifications).

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/WorkWave.git
cd WorkWave
```

### Step 2: Configure Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory (reference [Environment Variables](#environment-variables)).
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Step 3: Configure Front-End Client
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app locally at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `/server` directory and declare:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_signing_key

# Nodemailer SMTP settings (e.g., Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Client Location URL
CLIENT_URL=http://localhost:5173
```

---

## Usage Guide

### Candidate Workflow
1. Register/Login as a **Candidate**.
2. Complete your profile details (experience, college, skills) and upload your developer resume.
3. Browse the **Jobs** feed, apply real-time filtering, or bookmark jobs to your watchlist.
4. Click **Apply Now** on a job card, submit an optional cover letter.
5. Track application status and view interview requests in the **My Applications** tab.

### Employer Workflow
1. Register/Login as an **Employer**.
2. Complete your **Company Profile** (banner, benefits, tagline) to display a premium brand portal.
3. Navigate to **Post Job** and publish your requirements.
4. Review applicants in the **Applicants** dashboard, filter candidate cards by matching skill scores, and inspect profiles.
5. Move status updates to Shortlist/Hire or schedule calls, tracking conversions in the **Analytics** reports.

---

## Future Enhancements
- **Admin Management Portal**: Build the admin statistics page to monitor platform usage, reports, and ban malicious accounts.
- **AI Skill-Matching Score**: Auto-scan uploaded candidate resumes against job descriptions to calculate accurate fit-scores.
- **In-App Messaging**: Enable direct chat channels between recruiters and candidates.
- **Calendar API Sync**: Integrate Google Calendar and Outlook to automatically check slot availabilities for interview scheduling.

---

## Contributors
* **Nitharshana** - Project Architect & Lead developer.
* *Contributions are welcome! Please open an issue or submit a pull request.*

---

## License
This project is licensed under the MIT License - see the LICENSE details for details.

---

## Acknowledgements
- [Lucide Icons](https://lucide.dev) for interface icons.
- [Unsplash](https://unsplash.com) for layout mock graphics.
- The MERN & open-source developer communities for providing high-speed packages.
