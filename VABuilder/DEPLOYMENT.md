# Render deployment

VA Builder runs as one Node web service. The backend serves the Vite production build and API on the same HTTPS origin.

- Root directory: `VABuilder`
- Build: `npm ci --prefix server && npm ci --prefix client --include=dev && npm test --prefix server && npm run lint --prefix client && npm run build --prefix client`
- Start: `npm start --prefix server`
- Health: `/health` (requires a working MongoDB connection)
- Node: 22.22.0; `NODE_ENV=production`

Configure the server variables from `server/.env.example` privately in Render, with a fresh random JWT secret. Render supplies PORT and RENDER_EXTERNAL_URL. Add the public VITE_FIREBASE_* configuration before building. No Razorpay secret belongs in a VITE_* variable. The checkout public key comes from the authenticated order endpoint. Production API and embed URLs use the website origin.

Add the final Render hostname to Firebase Authentication's authorized domains before Google sign-in. Atlas must allow connections from the service's outbound IP ranges. Keep Razorpay in test mode until real-payment setup is approved.

Environment files, build output, dependencies, logs, and the quarantined original Vite configuration are ignored by Git. Only placeholder environment examples are committed. The quarantine file must never be executed or deployed.
