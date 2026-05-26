# DeskFlow - Support Ticket Triage Board

DeskFlow is a production-grade, highly interactive **MERN Stack Support Ticket Triage Board**. Designed with rich modern aesthetics (deep dark-mode, glassmorphic layout, glowing border indicators), it enables customer support agents to easily manage active tickets, track dynamic SLA compliance limits, and perform Kanban transitions in real-time.

---

## 🚀 Key Features

*   **Premium Interactive Kanban Board**: Swimlanes for `Open`, `In Progress`, `Resolved`, and `Closed` states with native **HTML5 Drag and Drop**.
*   **Strict State Transition Logic**: The API validates and enforces step-by-step state movements (`open ↔ in_progress ↔ resolved ↔ closed`). Any illegal step jumps are cleanly rejected (e.g. dragging directly from `Open` to `Resolved` will snap back and show a detailed toast alert).
*   **Dynamic Derived Fields (SLA & Age)**:
    *   `ageMinutes` and `slaBreached` are calculated dynamically on GET requests and **never** stored in MongoDB, ensuring a single source of truth.
    *   Active timers update real-time on the card layout (counts minutes/hours left until breach, or elapsed breach time).
    *   SLA status locks on resolution time (`resolvedAt`) so resolved tickets do not retrospectively breach.
*   **Visual Metric Indicators**: Dynamic SLA indicator cards (Total Tickets, SLA Breaches, SLA Compliance %, and Priority backlog counts).
*   **Slide-out Form Drawer**: Sleek slides-in-from-right ticket creation/editing form with responsive animations and live inputs validation.
*   **Full CRUD support**: Create, read, update status, update ticket details, and delete support tickets seamlessly.

---

## 🛠️ Technology Stack

*   **Backend**: Node.js, Express, MongoDB, Mongoose
*   **Frontend**: React (Vite), Tailwind CSS v4, Axios, Lucide React Icons
*   **Testing**: Custom validation script for transition rules & SLA derived calculations

---

## 📁 Directory Structure

```
deskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Mongoose MongoDB Connection
│   │   ├── controllers/
│   │   │   └── ticketController.js # CRUD, transition check, stats aggregator
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Express Centralized Error/Validation Handler
│   │   ├── models/
│   │   │   └── Ticket.js           # Ticket Schema with custom Virtuals
│   │   ├── routes/
│   │   │   └── ticketRoutes.js     # API Route bindings
│   │   └── server.js               # Express Server & Middlewares bootstrapper
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── test_transitions.js         # Automated tests suite
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Pre-configured Axios instance
    │   ├── components/
    │   │   ├── FilterBar.jsx       # Priority and SLA status filters
    │   │   ├── StatsStrip.jsx      # Gradient overview cards
    │   │   ├── TicketBoard.jsx     # Kanban Board grid
    │   │   ├── TicketCard.jsx      # Glow cards with active SLA countdowns
    │   │   ├── TicketColumn.jsx    # Swimlane with Drag-Drop handlers
    │   │   ├── TicketFormModal.jsx # Slides-in-from-right drawer form
    │   │   └── Toast.jsx           # Animated floating notifications
    │   ├── App.jsx                 # Core orchestrator and state controller
    │   ├── index.css               # Global styling, scrollbars, glows, theme v4
    │   └── main.jsx                # React bootstrapper
    ├── index.html                  # HTML entry point (SEO, Google Fonts, Favicon)
    ├── vite.config.js              # Vite configs with Tailwind v4 proxy
    ├── .env.example
    └── package.json
```

---

## ⏱️ SLA Duration Targets

SLA targets represent response deadlines depending on the ticket's priority level:
*   🔴 **Urgent**: 1 Hour (60 Minutes)
*   🟠 **High**: 4 Hours (240 Minutes)
*   🟡 **Medium**: 24 Hours (1440 Minutes)
*   🔵 **Low**: 72 Hours (4320 Minutes)

---

## 🔒 Status Transition Rules

Tickets are strictly limited to one-step adjacent movements to avoid process-skipping. 

| Status From | Status To | Valid? | Action Taken |
| :--- | :--- | :---: | :--- |
| `open` | `in_progress` | ✅ | Move ticket |
| `in_progress` | `resolved` | ✅ | Move ticket, assign `resolvedAt` time |
| `resolved` | `closed` | ✅ | Move ticket |
| `closed` | `resolved` | ✅ | Move backward, preserve `resolvedAt` |
| `resolved` | `in_progress` | ✅ | Move backward, clear `resolvedAt` time |
| `in_progress` | `open` | ✅ | Move backward |
| `open` | `resolved` | ❌ | Rejected with **400 Bad Request** error |
| `open` | `closed` | ❌ | Rejected with **400 Bad Request** error |
| `in_progress` | `closed` | ❌ | Rejected with **400 Bad Request** error |

---

## ⚙️ Local Setup and Launch

### Prerequisites
*   Node.js installed (v18+)
*   MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the automated logic tests to ensure validation rules are in order:
   ```bash
   node test_transitions.js
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5000`)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:3000`)*

---

## 🌐 MongoDB Atlas Cluster Configuration

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared project and deploy a **Free Cluster (Shared M0)** in your preferred cloud provider and region.
3. **Configure Access Security**:
   *   Under **Network Access**, click "Add IP Address" and select **Allow Access from Anywhere (0.0.0.0/0)** (required for hosting platforms like Render).
   *   Under **Database Access**, create a database user (e.g. `deskflow_admin`) with a secure password. Make sure their role is set to `Read and write to any database`.
4. **Get Connection String**:
   *   Navigate to your Cluster Overview dashboard and click **Connect**.
   *   Choose **Drivers** as your connection method.
   *   Copy the SRV connection string (e.g. `mongodb+srv://deskflow_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).
5. Replace `<password>` with the password you created for the database user, and replace the `MONGODB_URI` environment variable value in your host configuration.

---

## 🚀 Cloud Deployment Instructions

Here is how you can deploy the production-ready MERN application for free using **Render** (for Express Backend) and **Vercel** (for React Frontend).

### A. Deploying Backend to Render
1. Register and sign in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the project.
4. Set the following build options:
   *   **Name**: `deskflow-api`
   *   **Root Directory**: `backend`
   *   **Environment / Runtime**: `Node`
   *   **Build Command**: `npm install`
   *   **Start Command**: `npm start`
5. In the **Environment Variables** section, add:
   *   `MONGODB_URI`: *Your MongoDB Atlas SRV Connection string*
   *   `NODE_ENV`: `production`
   *   `PORT`: `10000` (Render binds this dynamically, but good to declare)
6. Click **Deploy Web Service**. Render will spin up the Node server and provide a public URL (e.g., `https://deskflow-api.onrender.com`).

---

### B. Deploying Frontend to Vercel
1. Register and sign in to [Vercel](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Set the following build options:
   *   **Project Name**: `deskflow-board`
   *   **Framework Preset**: `Vite`
   *   **Root Directory**: `frontend`
   *   **Build Command**: `npm run build`
   *   **Output Directory**: `dist`
5. Since we configure a proxy in development (`/api`), we must route API requests in production correctly. Vercel allows doing this cleanly by adding a `vercel.json` routing configuration in the `frontend` folder.
   Let's create the `frontend/vercel.json` file:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://deskflow-api.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
6. Click **Deploy**. Vercel will build the frontend assets and host it at a production URL (e.g. `https://deskflow-board.vercel.app`), proxying all `/api/*` endpoints directly to your Render API server seamlessly!
