# IP-SAKTI Sahayak
`npm i && npm run dev` → Landing: http://localhost:5173/  ·  App: http://localhost:5173/app/
- Landing (`index.html`) links to `/app/login`; the app is a React SPA under `/app`. To host them on different domains, change those hrefs to the app's full URL and set Vite `base` for the app build.
- API URL: `VITE_API_URL` (default http://127.0.0.1:8000). Backend must allow CORS from the dev origin.
- Production hosting needs an SPA fallback so `/app/*` serves `dist/app/index.html`.
- Admin: only the 5 provided endpoints are real. Admin functions in `src/services/api.js` throw "not connected" until you add the endpoints.

- Admin: set `VITE_ADMIN_EMAIL` (e.g. in `.env`) to the admin account email. This only controls redirects/UI; the backend must enforce admin access. `response_language:"auto"` and multipart field names (file,title,regime,language,doc_type,source_url) are assumptions: adjust in `api.js` if your backend differs.
