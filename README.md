# Student Performance Monitoring System (SPMS)

A comprehensive, role-based web application designed to monitor and analyze student academic performance in real-time. This system facilitates interaction between Administrators, Teachers, and Students, providing tools for grade management, attendance tracking, and performance analytics.

## 🚀 Tech Stack

*   **Frontend**: React (via HTML/JS imports), Tailwind CSS for styling.
*   **Backend Logic**: TypeScript (Simulated Backend Services for Demo/Prototype).
*   **Database**: Mock In-Memory Storage (Simulates MySQL/JSON structure).
*   **Build Tool**: Webpack/Babel (via Create React App or similar setup).

## 📂 Project Structure

### Core Files
*   **`index.html`**: The entry point. Imports Tailwind CSS and defines the root div.
*   **`index.tsx`**: React entry point that mounts `App.tsx` to the DOM.
*   **`App.tsx`**: The main application component. Handles global state (User Session), Routing (Switching between Dashboards), and the main Layout (Sidebar/Navbar structure).
*   **`types.ts`**: TypeScript interfaces defining the data models (User, Grade, Subject, Attendance, etc.).
*   **`constants.ts`**: Static mock data used to populate the application initially.

### Services
*   **`services/mockBackend.ts`**: A robust simulation of a backend API. It handles:
    *   **Authentication**: Login/Register logic with delay simulation.
    *   **CRUD Operations**: Users, Subjects, Grades, Attendance.
    *   **System Logic**: Maintenance mode checks, Audit logging, Notification triggering.

### Components
*   **`components/Navbar.tsx`**: Top navigation bar containing the Logo, Notification Bell (with polling logic), User Profile summary, and Logout button.
*   **`components/Sidebar.tsx`**: Responsive side navigation menu. Adapts to User Role (Admin/Teacher/Student) to show relevant links.

### Pages (Modules)

#### 1. Public
*   **`pages/Login.tsx`**: Dual-purpose Login and Registration form. Features:
    *   Role selection.
    *   Password visibility toggle.
    *   System Setting enforcement (Maintenance Mode, Registration Allowed).

#### 2. Admin Module (`pages/admin/`)
*   **`AdminDashboard.tsx`**: High-level overview.
    *   **Stats Cards**: Clickable cards showing total students, teachers, subjects, and at-risk alerts.
    *   **Overlays**: Clicking a card opens a modal with a detailed list.
    *   **Export**: functionality to download CSV reports.
*   **`UserManagement.tsx`**: Full CRUD (Create, Read, Update, Delete) for system users. Includes search and filtering by role.
*   **`SystemSettings.tsx`**: Controls global system behavior (Theme color, Maintenance Mode, Grade editing windows).
*   **`AuditLogs.tsx`**: A security log tracking logins, updates, and system events.

#### 3. Teacher Module (`pages/teacher/`)
*   **`TeacherDashboard.tsx`**: View assigned subjects and Request new subjects.
*   **`GradeEncoding.tsx`**:
    *   **Assignment Creation**: Teachers can create specific assessments (e.g., "Quiz 1").
    *   **Grading**: Spreadsheet-like interface to input grades for students in a specific subject/term.
*   **`AttendanceTracking.tsx`**:
    *   **Daily Tracking**: Mark students as Present, Late, Absent, or Cutting.
    *   **Visuals**: Bar chart summary of the day's attendance.
*   **`MyStudents.tsx`**: View profile details of students in their classes and edit credentials if necessary.

#### 4. Student Module (`pages/student/`)
*   **`StudentDashboard.tsx`**: A tabbed interface for students.
    *   **Overview**: GPA summary, Attendance rate, and recent activity feed.
    *   **Grades**: detailed list of grades per subject/assessment.
    *   **Attendance**: Calendar view showing attendance status for the month.
    *   **Profile**: View and edit personal credentials.

## 🛠 Installation & Running

This project is designed to be run in a modern JavaScript environment.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd spms
    ```

2.  **Install Dependencies** (if using a local Node environment):
    ```bash
    npm install
    ```

3.  **Run the Application**:
    ```bash
    npm start
    ```
    *Open [http://localhost:3000](http://localhost:3000) to view it in the browser.*

## 📱 Responsive Layout Features
*   **Desktop**: Fixed Sidebar on the left, scrollable content on the right. High-density grids for data.
*   **Tablet**: Sidebar collapses to a hamburger menu or utilizes adaptive grids (2 columns).
*   **Mobile**: Sidebar becomes an overlay drawer. Grids stack vertically (1 column). Tables allow horizontal scrolling to prevent layout breakage.

## 🔒 Security & Data Integrity
*   **Role-Based Access Control (RBAC)**: Menus and API calls are guarded by user roles.
*   **Audit Logging**: Critical actions are recorded with timestamps.
*   **Maintenance Mode**: Admins can lock the system for non-admin users during updates.
