# AssetFlow — Enterprise Asset & Resource Management

**FastAPI + Direct MySQL + Vanilla HTML/CSS/JS Single Page Application (SPA)**

> Built for the Odoo Hackathon 2026. This project represents a modern, lightweight, high-performance Asset Lifecycle Management platform. It features secure user signup, department-based approvals, role mapping, and session management.

---

## Current Architecture & Progress

We have implemented a clean, lightweight stack:
1. **Backend**: FastAPI (Python 3) implementing modular routes, Pydantic schemas, and structured database operations.
2. **Database**: Direct MySQL queries via `mysql.connector` with connection pooling.
3. **Frontend**: Pure semantic HTML5, modern vanilla CSS3, and native JavaScript (`fetch()` API).

### Completed Features (User Authentication & Approvals)
* **User Authentication & Session Management**:
  * Secure Signup (`/api/signup`) and Login (`/api/login`) endpoints.
  * SHA-256 password hashing.
  * Role mapping layer (maps frontend roles `admin`, `asset_manager`, `dept_head`, `employee` to database ENUM representations).
  * Session caching via `localStorage`.
* **Account Approvals Workflow**:
  * New signups default to an `Inactive` state.
  * Inactive users are restricted from logging in.
  * **Approvals Screen**: Dedicated interface visible only to **Admins** and **Department Heads** (filtered by department) to approve and activate pending accounts.

---

## Setup Instructions for a New PC

Follow these steps to set up the project on a clean computer:

### 1. Prerequisite: Install MySQL Server
Ensure MySQL server is installed and running locally on port `3306`:
* **Host**: `localhost`
* **User**: `root`
* **Password**: `1234`
*(If your local MySQL password differs, you can update it in the `db_config` block inside `backend/db.py`, `init_db.py`, and `create_test_user.py`)*

### 2. Prerequisite: Install Python
Ensure Python 3.10+ is installed on your system. You can verify it in your command prompt:
```bash
python --version
```

### 3. Install Python Dependencies
Open your terminal inside the project root folder and install the required libraries:
```bash
pip install fastapi uvicorn mysql-connector-python pydantic
```

### 4. Initialize the Database
Run the database creator and schema seeder. This will create/reset the database `assetflow` and generate the required tables:
```bash
python init_db.py
```

### 5. Seed Test Accounts
Create an active Admin and Department Head account to test the login and approval system:
```bash
python create_test_user.py
```

### 6. Start the Backend Server
Run the FastAPI application locally on port `8000`:
```bash
python -m uvicorn backend.main:app --reload
```
You can verify the backend is running by opening `http://127.0.0.1:8000/` in your browser.

### 7. Access the Frontend
Directly open the frontend HTML files in any web browser using the `file://` scheme (e.g. double-click `frontend/login.html` or open it from the filesystem).

---

## Testing Account Approvals & Login

To verify the login and approval flow step-by-step:
1. **Create Pending Account**: Open `frontend/signup.html`, select a role (e.g., `Employee`) and a department, then create an account. You will see a success message stating the account is pending activation.
2. **Confirm Blocked State**: Go to `frontend/login.html` and try logging in with the new account. The form will display: *"Account is pending approval. Please contact your Department Head or Admin."*
3. **Log in as Approver**: Sign in with an active approver account:
   * **Username**: `dept_head_test`
   * **Password**: `password123`
4. **Approve Account**: Locate the **Approvals** screen, find your pending user account in the list, and click **Approve & Activate**.
5. **Log In**: Log out, then successfully sign in using your newly approved account!

---

## Directory Structure

```
d:/Odoo Hackathon 2026/
├── backend/
│   ├── main.py              # FastAPI application entrypoint (CORS, routers)
│   ├── db.py                # MySQL pooling connection manager
│   ├── schemas/
│   │   ├── auth.py          # Pydantic schemas (Signup/Login/Session)
│   │   └── employee.py      # Pydantic schemas (Employee console operations)
│   └── routes/
│       ├── auth.py          # Auth endpoints (Signup, Login, User Activations)
│       └── employee.py      # Employee endpoints (Profile, Assets, Bookings, Tickets)
├── database/
│   └── schema.sql           # MySQL DDL Schema script (users, assets, bookings, repairs...)
├── frontend/
│   ├── css/
│   │   ├── signup.css       # Signup form styling
│   │   ├── login.css        # Login form styling
│   │   ├── forgot.css       # Password recovery styling
│   │   └── employee.css     # Premium dashboard layout stylesheet
│   ├── js/
│   │   └── script.js        # Auth client AJAX controller
│   ├── signup.html          # Register account page
│   ├── login.html           # Authentication portal
│   ├── forgot.html          # Password reset portal
│   └── employee.html        # Employee Console dashboard
├── init_db.py               # Database creator & schema seeder
├── create_test_user.py      # Test account populator (seeds Admin & Department Head accounts)
└── test_employee_backend.py # Automated integration tests
```
