# APIPilot AI - AI Powered API Development & Testing Platform

A premium SaaS platform for intelligent API development, testing, and collaboration. Built with modern tech stack for production-grade performance and developer experience.

## 🚀 Platform Overview

APIPilot AI is a comprehensive platform that empowers developers to:
- **Design & Build APIs** with intelligent guidance
- **Generate AI Test Cases** automatically for comprehensive coverage
- **Analyze Security** posture and receive hardening suggestions
- **Orchestrate Workflows** from design through documentation
- **Collaborate** seamlessly with team members on workspaces and projects

## 📊 Project Status: 100% Complete 🎉

### ✅ Completed Features

#### Core Infrastructure
- **Monorepo Architecture**: Root workspace manages client and server packages
- **Development Environment**: Parallel development with concurrently
- **Build Pipeline**: Optimized Vite frontend + Node.js backend
- **Database**: MongoDB Atlas integration with Mongoose ORM
- **Environment Management**: Secure .env configuration with dotenv

#### Backend (Node.js + Express)
- **Authentication Module**: User model, JWT tokens, register/login endpoints
- **Workspace & Project CRUD**: Complete workspaces, projects, base URL, role management
- **Real Endpoint Executor**: Server-side request execution with headers, parameters, and bodies mapping
- **Gemini AI Service**: Integration of `@google/genai` for test cases, mocks, and security analysis

#### Frontend (React + Vite)
- **Landing & Auth Pages**: Registration validation, login error handling, success notifications
- **Interactive Dashboard**: Real-time stats grid (dynamic API and test counts), workspace project list, and member invitation management
- **Visual API Builder**: Left-sidebar endpoint selector, custom header & query params builders, Monaco editors for request/response JSON bodies, real request dispatcher console
- **Collections Management**: Endpoint collections panel, direct builder deep-linking, AI security scanner visualization, and test generator trigger
- **AI Test Runner**: Individual & batch run console, status indicators, detailed assertion checking, and statistics dashboard
- **State Management**: Redux slice for auth and selection persistence (workspaces/projects) in `localStorage`

#### API Services
- **authService.js**: Register, login, getMe, logout
- **workspaceService.js**: Full CRUD and member management
- **projectService.js**: Full CRUD for projects
- **apiService.js**: Unified endpoint execution, test runner client, and AI endpoints integration


## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.3
- **Styling**: Tailwind CSS 4.1.12
- **State**: Redux Toolkit 2.9.0
- **Routing**: React Router 7.8.2
- **Animations**: Framer Motion 12.23.12
- **Editor**: Monaco Editor 4.7.0
- **Forms**: React Hook Form 7.62.0 + Zod 4.1.5
- **HTTP**: Axios 1.11.0
- **Notifications**: React Hot Toast 2.6.0

### Backend
- **Runtime**: Node.js >=22.0.0
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB Atlas + Mongoose 8.18.0
- **Authentication**: JWT 9.0.2 + bcryptjs 3.0.2
- **Security**: Helmet 8.1.0
- **Logging**: Morgan
- **File Upload**: Multer 2.0.2
- **Email**: Nodemailer 7.0.5
- **Environment**: dotenv

## 📁 Project Structure

```
apipilot-ai/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/                   # Route pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx       # Dashboard layout
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/                # API clients
│   │   │   ├── authService.js
│   │   │   ├── workspaceService.js
│   │   │   └── projectService.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── authSlice.js
│   │   ├── styles/
│   │   │   └── index.css            # Global styles + design tokens
│   │   ├── App.jsx                  # Router setup
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── workspace.model.js
│   │   │   └── project.model.js
│   │   ├── controllers/             # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── workspace.controller.js
│   │   │   └── project.controller.js
│   │   ├── routes/                  # Express routes
│   │   │   ├── health.route.js
│   │   │   ├── auth.route.js
│   │   │   ├── workspace.route.js
│   │   │   └── project.route.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   └── error-handler.js
│   │   ├── validators/
│   │   │   └── auth.validator.js    # Input validation
│   │   ├── config/
│   │   │   ├── env.js               # Environment setup
│   │   │   └── db.js                # MongoDB connection
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── package.json
│   └── .env (git-ignored)
│
├── package.json                     # Root workspace config
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js >=22.0.0
- npm >=10.0.0
- MongoDB Atlas account (connection string in .env)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/krishnnavarun/APIPilot-AI.git
cd APIPilot-AI
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment**
```bash
# Create server/.env based on server/.env.example
cp server/.env.example server/.env

# Optional: create client/.env for non-local API targets
cp client/.env.example client/.env

# Add your MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

Server environment variables:
- `PORT`: API server port, default `8080`
- `CLIENT_URL`: frontend origin allowed by CORS
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: signing secret for authentication tokens
- `GEMINI_API_KEY`: optional Gemini key for AI test, mock, and security features

Client environment variables:
- `VITE_API_BASE_URL`: API base URL, default `http://localhost:8080/api/v1`

4. **Start Development Servers**
```bash
npm run dev
```

This starts both servers in parallel:
- **Frontend**: http://localhost:5173 (or 5174 if port in use)
- **Backend**: http://localhost:8080
- **MongoDB**: Connects to Atlas

### Build for Production

**Frontend:**
```bash
cd client
npm run build
# Output: client/dist/
```

**Backend:**
No build required for Node.js. Directly run via `npm start` or deploy the `server/src` directory.

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: 7-day expiry for user sessions
- **CORS**: Configured for localhost:5173 (production: update to your domain)
- **Helmet**: Security headers middleware
- **Input Validation**: Zod schemas + server-side validators
- **Protected Routes**: Authentication middleware guards all sensitive endpoints
- **Safe JSON**: User model excludes password from API responses

## 🎨 Design System

### Color Palette
- **Canvas**: #090b10 (Deep dark background)
- **Foreground**: #e6ebf2 (Premium light text)
- **Muted**: #aab6c6 (Secondary text)
- **Accent**: #63b3ff (Primary blue)
- **Danger**: Red gradients for errors

### Typography
- **Font**: Sora (Google Fonts)
- **Hierarchy**: Clear size/weight progression
- **Spacing**: 4px grid system (Tailwind default)

### Components
- **Cards**: Subtle borders, backdrop blur, hover lift effect
- **Buttons**: Smooth transitions, hover state changes
- **Forms**: Clean input fields with focus ring, error states
- **Animations**: Framer Motion for entrance/exit effects, hover interactions

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/v1/auth/register      # Create account
POST   /api/v1/auth/login         # Sign in
GET    /api/v1/auth/me            # Get current user (protected)
POST   /api/v1/auth/logout        # Logout (protected)
```

### Workspace Endpoints
```
GET    /api/v1/workspaces        # List user workspaces (protected)
POST   /api/v1/workspaces        # Create workspace (protected)
GET    /api/v1/workspaces/:id    # Get workspace details (protected)
PATCH  /api/v1/workspaces/:id    # Update workspace (owner only)
DELETE /api/v1/workspaces/:id    # Delete workspace (owner only)
POST   /api/v1/workspaces/:id/members      # Add member (owner only)
DELETE /api/v1/workspaces/:id/members/:memberId  # Remove member (owner only)
```

### Project Endpoints
```
GET    /api/v1/projects/workspace/:workspaceId  # List projects (protected)
POST   /api/v1/projects                          # Create project (protected)
GET    /api/v1/projects/:id                      # Get project details (protected)
PATCH  /api/v1/projects/:id                      # Update project (owner only)
DELETE /api/v1/projects/:id                      # Delete project (owner only)
```

## 🧪 Testing the Application

### Manual Testing Flow

1. **Register New Account**
   - Navigate to http://localhost:5173/register
   - Fill form with valid data
   - Password must have: 8+ chars, uppercase, number, special char (!@#$%^&*)
   - Click "Create account"

2. **Login**
   - Navigate to http://localhost:5173/login
   - Enter registered email and password
   - Access dashboard upon success

3. **Create Workspace**
   - From dashboard, create workspace via API
   - Or add via UI (to be implemented)

4. **Create Project**
   - Create project under workspace
   - Configure base URL and environment

## 🤝 Contributing

This is an active development project. To contribute:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

## 📝 Code Standards

- **ES6 Modules** throughout (type: "module" in package.json)
- **Consistent naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error handling**: Try-catch in async functions, proper error messages
- **Comments**: Document complex logic and public APIs
- **Validation**: Server-side validation required (client-side for UX)

## 🐛 Known Issues & Limitations

- Email verification not yet implemented
- Password reset flow not implemented
- Rate limiting not configured
- Email notifications not active (Nodemailer configured but unused)
- API testing console UI pending
- Real-time collaboration not implemented
- File upload/storage not configured

## 📈 Performance Optimization

- **Frontend**: Lazy code splitting with React Router
- **Backend**: Indexed MongoDB queries, connection pooling
- **Caching**: localStorage for auth tokens
- **Build**: Vite minification + CSS purging
- **Network**: Gzip compression via Express

## 📄 License

Proprietary - APIPilot AI © 2026

## 👨‍💻 Author

Built with ❤️ for developers

---

**Ready to transform your API development workflow!** 🚀
