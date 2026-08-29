# LDR Agrofarms Backend

## Run locally
1. Keep your real `.env` file in this folder (do not commit it).
2. Install dependencies:
   `npm install`
3. Start:
   `npm start`

Default API: `http://localhost:5000/api`

## Main FA endpoints
- POST `/auth/login`
- GET `/dashboard/fa`
- GET/POST `/farmers/my` and `/farmers`
- GET `/attendance/today`
- GET/POST `/fieldvisits/my` and `/fieldvisits`
- GET/POST `/meetings/my` and `/meetings`
- GET/POST `/leaves/my` and `/leaves`
- GET `/tasks/my`
- GET `/notifications/my`
- PATCH `/notifications/:id/read`
- GET `/profile/me`
- PATCH `/employees/change-password`
