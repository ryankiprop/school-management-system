# School Management System

A full-stack web application for managing students, teachers, courses, and enrollments in educational institutions.

##  Features

- **Student Management** - Add, view, edit, and delete student records
- **Teacher Management** - Manage teacher profiles and course assignments  
- **Course Catalog** - Create and manage course offerings
- **Enrollment System** - Handle student course registrations
- **Dashboard Analytics** - Overview of institution statistics

##  Live Demo

- **Frontend**: https://school-management-system-tau-five.vercel.app
- **Backend API**: https://school-management-backend.onrender.com

##  Technology Stack

### Frontend
- **React.js** - UI framework
- **React Scripts** - Build tooling
- **CSS3** - Styling and responsive design
- **Vercel** - Deployment platform

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Render** - Cloud deployment platform

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **RESTful API** - Backend communication

##  Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd school-management-system
```
## Backend Setup
```bash
pipenv install
pipenv shell
cd server
pthon app.py
```

Server runs on http://localhost:5000

## Frontend Setup
```bash
cd client
npm install
npm start
```
App runs on http://localhost:3000

 ## Project Structure
 ```bash
school-management-system/
├── CONTRIBUTING.md
├── LICENSE.md
├── Pipfile
├── Pipfile.lock
├── README.md
├── client
│   ├── README.md
│   ├── build
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── src
│   └── vercel.json
├── package-lock.json
└── server
    ├── app.py
    ├── build.sh
    ├── config.py
    ├── instance
    ├── migrations
    ├── models.py
    ├── requirements.txt
    ├── seed.py
    └── wsgi.py

9 directories, 17 files        
```

## Deployment

### Frontend (Vercel)
Push code to GitHub
Connect repo to Vercel
Set environment variables
Auto-deploys on git push

### Backend (Render)
Connect GitHub repo to Render
Create Web Service
Configure build and start commands
Set environment variables

## Contributing
Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Open a Pull Request

## Troubleshooting
Common Issues
CORS errors → Check backend CORS configuration
Build failures → Verify all dependencies are installed
API connection → Confirm environment variables are set