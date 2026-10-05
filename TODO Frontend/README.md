# Todo frontend

Authentication uses the backend's HTTP-only cookie. Login and registration call
`/auth/login` and `/auth/register`; startup checks `/auth/me`; logout calls
`/auth/logout`. JWTs and passwords are not stored in frontend local storage.

Start the backend on `http://localhost:9999`, with
`CORS_ORIGIN=http://localhost:5173` and `NODE_ENV=development`. Start this frontend
with `pnpm dev` (or `npm run dev`) and open `http://localhost:5173`. The dev server
requires port 5173 so its origin matches the backend's allowed frontend origin.

To use a different backend URL, copy `.env.example` to `.env.local`, update
`VITE_API_BASE_URL`, and restart Vite. Use the backend root URL without `/api`.
For deployment, set the public HTTPS API URL before building, set the backend's
`CORS_ORIGIN` to the frontend origin, and keep frontend/API on the same site for
the backend's `SameSite=Lax` cookie.

Todo operations use the real cookie-authenticated backend: `/todos`,
`/todos/stats`, `/todos/categories`, and `/todos/completed`. The Todo page sends
search and filters to the server and displays ten results per page. Sorting uses
the backend's `createdAt` order with `sortOrder=asc|desc`.

Status changes and subtask checkboxes use `PATCH /todos/:todoId`. Existing
subtasks retain their MongoDB IDs; new IDs are assigned by the backend. Clearing
the deadline sends `dueDate: null`. Dashboard and profile summaries load
unfiltered pages, while global counts come from the stats endpoint.

Old mock Todos are not migrated or sent to the backend. Old mock accounts must
be registered in the backend. Profile viewing uses the real user; editing is
unavailable because the backend has no profile-update endpoint.

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
