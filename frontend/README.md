# ShiftSync

ShiftSync is a workforce management dashboard built with React, Vite, and Tailwind CSS. It provides a polished front-end experience for monitoring staffing coverage, managing schedules, reviewing shift adjustments, tracking notifications, and viewing compliance and reporting insights in one place.

## Overview

The application is designed as a multi-page dashboard for shift-based teams and operations managers. It includes a branded login experience and several role-oriented dashboard views that present operational data in a clear, modern interface.

## Core Features

- Dashboard overview with staffing metrics, attendance visualization, shift status, and recent adjustments
- Employee profile view for roster management and availability tracking
- Shift scheduling workspace for weekly planning and coverage balancing
- Shift adjustment review flow for swap requests and replacement handling
- Notifications center for operational updates and priority communication
- Compliance and policy monitoring view
- Reports and analytics dashboard for workforce insights
- Embedded chatbot launcher for assistant-style support

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- React Router DOM 7
- React Icons
- ESLint 9

## Getting Started

### Prerequisites

- Node.js 20 or later recommended
- npm

### Installation

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Then open the local URL shown in the terminal, typically `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

### Lint the Codebase

```bash
npm run lint
```

## Application Routes

- `/login` - authentication screen
- `/overview` - dashboard summary
- `/profiles` - employee roster and profile insights
- `/scheduling` - shift planning and schedule view
- `/adjustments` - shift swap and staffing adjustments
- `/notifications` - alerts and message center
- `/compliances` - compliance and policy dashboard
- `/reports` - reporting and analytics

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    login.jsx
    Dashboard/
      overview.jsx
      profiles.jsx
      scheduling.jsx
      adjustments.jsx
      notifications.jsx
      compliances.jsx
      reports.jsx
```

## Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production bundle locally
- `npm run lint` - run ESLint checks

## Notes

- The app currently focuses on front-end workflows and presentation.
- Sample operational data is defined directly in the dashboard components.
- Routing is handled client-side with React Router.

## Troubleshooting

If PowerShell blocks `npm` scripts on Windows, try running:

```powershell
npm.cmd run dev
```

The same pattern works for other scripts such as `npm.cmd run build`.

## License

This project is intended for academic and portfolio use unless a separate license is added.
