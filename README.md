# LeadSync

LeadSync is a React + Vite lead management dashboard built with Supabase.

## Setup

1. Copy the example env file:
   - `cp .env.example .env`
2. Fill in your Supabase values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Install dependencies:
   - `npm install`
4. Run locally:
   - `npm run dev`

## Production readiness

- Uses environment variables for Supabase credentials
- Includes auth-protected routes
- Supports build output with `npm run build`
- Keeps `.env` files out of git via `.gitignore`

## Available scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint checks

## Deploying to Vercel

1. Push your repo to GitHub, GitLab, or Bitbucket.
2. In Vercel, import the repository and select the `leadsync` project.
3. Use the Vite framework preset if prompted.
4. Set the build command to `npm run build` and the output directory to `dist`.
5. Add these environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

The `vercel.json` file included in this repo ensures SPA routing works for React Router.

## Notes

- Do not commit your actual `.env` file.
- If you deploy, set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting environment.
