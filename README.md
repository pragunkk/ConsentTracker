# ConsentTracker

This project is a mock document sharing and consent management platform, built with React (Vite) for the client and Node.js/TypeScript for the server. It demonstrates skills in frontend development and UI/UX .

## Features
- React frontend (Vite, TypeScript)
- Node.js/Express backend (TypeScript)
- Modern UI components (Tailwind CSS)

## Prerequisites
- Node.js (v18 or above recommended)
- npm (v9 or above)

## Setup Instructions

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Build the server**
   ```sh
   npm run build
   ```
   This compiles the TypeScript server code to the `dist/` directory.

3. **Start the server**
   ```sh
   npm start
   ```
   The server will run in production mode and serve API endpoints.

4. **Run in development mode**
   ```sh
   npm run dev
   ```
   This starts the backend in development mode with live reload.

5. **Start the React client**
   ```sh
   cd client
   npm install
   npm run dev
   ```
   The client will be available at `http://localhost:5173` (or as shown in the terminal).

## Project Structure
- `client/` — React frontend (Vite, TypeScript, Tailwind CSS)
- `server/` — Node.js/Express backend (TypeScript, in-memory storage)
- `shared/` — Shared TypeScript types and schema

## Notes
- All data is in-memory and resets on server restart.
- This project is a demonstration for a recruitment process.
