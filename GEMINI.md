# GEMINI.md

## Project Overview

This project is a web application built with React, Vite, TypeScript, and styled with Tailwind CSS and shadcn-ui. It appears to be a social platform for developers, with features like a feed, search, user profiles, and content creation. The application uses a tab-based navigation system to switch between different sections.

## Building and Running

To build and run this project, you need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the development server and open the application in your default browser.

3.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with the production-ready files.

## Development Conventions

*   **Component-based architecture:** The application is built using React components, which are located in the `src/components` directory.
*   **Styling:** The project uses Tailwind CSS for styling, with some custom styles in `src/index.css` and `src/App.css`.
*   **Routing:** The application uses `react-router-dom` for routing. The routes are defined in `src/App.tsx`.
*   **State Management:** The project uses `useState` for component-level state and `@tanstack/react-query` for managing server state.
*   **Linting:** The project uses ESLint for code linting. You can run the linter with `npm run lint`.
