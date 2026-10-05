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

Todo operations still use their existing mock API. A public user cache remains
in local storage to give those mocks the authenticated user's ID; it is never
used to decide whether a session is authenticated. Old mock accounts do not
exist in the backend and must be registered there. Profile viewing uses the real
user; editing is unavailable because the backend has no profile-update endpoint.

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
