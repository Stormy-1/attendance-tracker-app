# Attendance Tracker App

A modern React application built with Vite, Tailwind CSS, and React Router for tracking student attendance.
<img width="2527" height="1394" alt="Screenshot 2025-09-28 051631" src="https://github.com/user-attachments/assets/3def7584-6d76-42f5-87c9-102419cc3bf2" />

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 📱 **Responsive Design** - Mobile-friendly interface

## Prerequisites

Before running this application, make sure you have the following installed:


- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installing Node.js

If you don't have Node.js installed:

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer and follow the setup wizard
4. Restart your terminal/command prompt

## Getting Started

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all the required dependencies including:
- React and React DOM
- Vite (build tool)
- Tailwind CSS
- React Router DOM
- ESLint (code linting)

### 2. Start Development Server

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
attendance-tracker-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Home.jsx          # Home page component
│   │   ├── Dashboard.jsx     # Dashboard with statistics
│   │   └── Attendance.jsx    # Attendance management
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind CSS imports
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages

- **Home** (`/`) - Welcome page with feature overview
- **Dashboard** (`/dashboard`) - Statistics and analytics
- **Attendance** (`/attendance`) - Mark student attendance

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router DOM** - Routing
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## Development

The app uses modern React patterns including:
- Functional components with hooks
- React Router for navigation
- Tailwind CSS for styling
- Responsive design principles

## Troubleshooting

### Common Issues

1. **"npm is not recognized"**
   - Make sure Node.js is installed and added to PATH
   - Restart your terminal after installing Node.js

2. **Port already in use**
   - Vite will automatically use the next available port
   - Check the terminal output for the actual URL

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that all files are saved properly

## Next Steps

This is a basic setup. You can extend it by adding:
- Database integration
- User authentication
- Real-time updates
- Data persistence
- More advanced attendance features
