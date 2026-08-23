# 🏗️ Technical Architecture & Build Specification: User Authentication

**Spec ID**: `SPEC-AUTH-001`  
**Feature**: User Authentication & Session Management  
**Scope Reference**: [`scope.md`](file:///home/borngreat/Desktop/school/kraken-monorepo/scope.md)  
**Status**: Approved for Build  

---

## 1. Technical Decisions & Rationale

| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Password Hashing** | `werkzeug.security` (`generate_password_hash`, `check_password_hash`) | Built into Flask, utilizes secure salted PBKDF2/SHA256 without needing external C-library bindings. |
| **Session / Token Format** | Cryptographic bearer token (signed token / UUID v4 persisted token) | Clean REST compliance, easy client storage in `localStorage` / HTTP headers, works across mobile or web clients. |
| **Database Schema** | SQLAlchemy `User` entity on existing `Base` | Seamless fallback between MySQL and SQLite with automatic migration during `init_db()`. |
| **Frontend State Management** | React 19 Context (`AuthContext`) with custom hook `useAuth()` | Provides global access to `user`, `token`, `isAuthenticated`, `login`, `register`, and `logout` without extra dependencies. |
| **Route Protection** | TanStack Router `beforeLoad` route guard on `/dashboard` | Redirects unauthenticated visits directly to `/login` before loading heavy dashboard assets. |

---

## 2. Architecture & Data Flow

```
[ Frontend: /login or /register ]
            │ (1) POST /api/auth/login or /api/auth/register
            ▼
[ Flask API Auth Handler (apps/backend/app.py) ]
            │ (2) Query User / Hash password (werkzeug.security)
            ▼
[ Database Layer: MySQL / SQLite ]
            │ (3) Persist / Fetch user record
            ▼
[ Backend Response ] ──▶ Returns { status: "success", token: "...", user: { id, name, email, org, role } }
            │
            ▼
[ Frontend AuthContext ] ──▶ Stores token in localStorage & updates current user state
            │
            ▼
[ Route Navigation ] ──▶ Navigate to /dashboard/feed with personalized analyst session
```

---

## 3. Database Schema Specification (`apps/backend/db/models.py`)

### `User` Table Definition
```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    organization = Column(String(150), nullable=True)
    role = Column(String(50), default="ANALYST") # ADMIN, ANALYST, VIEWER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "organization": self.organization,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
```

---

## 4. API Endpoints Specification

### 4.1 Register (`POST /api/auth/register`)
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@school.edu",
    "password": "SecurePassword123!",
    "organization": "Security Lab"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "token": "tok_9f81a2...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "organization": "Security Lab",
      "role": "ANALYST"
    }
  }
  ```
* **Error Response (400 Bad Request / 409 Conflict)**:
  ```json
  { "status": "error", "message": "Email is already registered" }
  ```

### 4.2 Login (`POST /api/auth/login`)
* **Request Body**:
  ```json
  {
    "email": "jane@school.edu",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "token": "tok_9f81a2...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "organization": "Security Lab",
      "role": "ANALYST"
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  { "status": "error", "message": "Invalid email or password" }
  ```

### 4.3 Current User (`GET /api/auth/me`)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "organization": "Security Lab",
      "role": "ANALYST"
    }
  }
  ```

---

## 5. Frontend Module Breakdown (`apps/web/src/features/auth/`)

```
apps/web/src/features/auth/
├── types/
│   └── auth.types.ts           # User, AuthState, LoginPayload, RegisterPayload interfaces
├── api/
│   └── authService.ts          # loginApi, registerApi, getMeApi
├── context/
│   └── AuthContext.tsx         # AuthProvider, useAuth hook, token storage in localStorage
└── components/
    ├── LoginForm.tsx           # Form with validation, submit handling, error display
    └── RegisterForm.tsx        # Registration form with organization & name fields
```

---

## 6. Verification & Testing Criteria

1. **Database Migration**: Ensure `init_db()` automatically provisions the `users` table on startup without dropping existing tables.
2. **Password Security**: Confirm passwords in the database start with `pbkdf2:sha256:` and are never returned in JSON payloads.
3. **Route Protection**: Accessing `/dashboard/feed` without a token redirects immediately to `/login`.
4. **Code Quality**:
   - `bun run typecheck` passes with zero type errors.
   - `bun run lint` passes with zero lint warnings/errors.
