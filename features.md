# LeadSync Features

## Overview
LeadSync is a React + Vite lead management dashboard built with Supabase authentication and database storage. The app is designed for small business sales teams and service providers to track lead details, score leads automatically, manage follow-up workflows, and keep lead drafts persistent during navigation.

## Core Features

### Authentication and App Routing
- Protected app routes using `AuthContext` and Supabase auth session state.
- Public login route when no authenticated user exists.
- Authenticated routes include:
  - `/` - Dashboard
  - `/leads` - All Leads list
  - `/add-lead` - Add Lead form
  - `/leads/:id` - Lead detail page
  - `/leads/:id/edit` - Lead edit form
  - `/revival` - Revival / follow-up queue
  - `*` - 404 Not Found fallback
- `Sidebar` navigation with user email display and logout support.

### Lead Management
- Full lead listing with search, status filter, and priority filter.
- Leads are loaded from Supabase `leads` table and sorted by lead score.
- Each lead row is clickable to view details or open the edit screen.
- Real-time filter/search interactions on the client.

### Lead Creation
- Add new leads with a flexible form capturing:
  - name, phone, service type, source, budget range, urgency, message, notes.
- Live score preview while editing the form.
- Score is automatically calculated using `calculateScore()`.
- Supports repeat-customer lookup from `customer_history`.
- Draft persistence via `localStorage` so form values are preserved if the user navigates away and returns.
- On successful save, data is inserted into Supabase and the draft is cleared.

### Lead Editing
- Edit existing lead details with a dedicated route.
- Edit form preserves in-progress changes via `localStorage` keyed per lead.
- Draft is restored if the user leaves and returns before saving.
- Saves updates back to Supabase.
- Draft state is cleared after a successful save or delete.

### Bulk Actions
- Select multiple leads from the leads list.
- Bulk update selected lead status to: `new`, `contacted`, `quoted`, `won`, or `lost`.
- Bulk update selected lead priority to: `hot`, `warm`, or `cold`.
- Bulk delete selected leads with confirmation.
- Selection management includes select all and clear selection.

### Import / Export
- Export leads to CSV from the leads list.
- Import leads from CSV or JSON files.
- Imported lead data is normalized before insertion into Supabase.
- Import error handling and success messages are displayed.

### Revival and Follow-up
- The app includes a `Revival` queue page for follow-up workflows.
- This page is intended to surface leads needing outreach again.
- Uses the app’s scoring and status fields to help prioritize lead revival activity.

## App Flow

1. User lands on the app.
2. If not authenticated, the user sees the login page.
3. After login, the app loads the `Layout` and renders the sidebar and main content.
4. The user can navigate to the Dashboard, Leads list, Add Lead form, Revival queue, or edit/view lead details.
5. Adding or editing a lead updates Supabase and returns the user to the lead list.
6. Lead drafts are kept in `localStorage` to preserve incomplete forms.
7. Bulk actions and import/export tools help manage many leads.

## Data & Scoring Logic

### Supabase Integration
- `supabaseClient.js` initializes the Supabase client with environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Uses Supabase auth for session management and signout.
- Reads and writes to `leads` table and optionally `customer_history` for repeat-customer checks.

### Lead Scoring
- Score is computed from lead metadata:
  - source
  - budget range
  - urgency
  - service type
- Priority is derived from score:
  - `hot` for high-value leads
  - `warm` for mid-value leads
  - `cold` for lower-value leads
- Conversion probability is a normalized percentage based on score.
- UI colors are applied for priority and lead status using helper functions.

## UI and Assets

### UI Stack
- React 19 + React Router 7
- Vite build system
- Tailwind CSS for styling
- Component-based layout with a responsive sidebar and content area

### Page Components
- `App.jsx` — root router and auth gate
- `Layout.jsx` — app shell with header/sidebar layout
- `Sidebar.jsx` — navigation and logout
- `Dashboard.jsx` — pipeline summary and reminders
- `Leads.jsx` — list, filters, bulk actions, import/export
- `AddLeads.jsx` — lead creation with live score preview and draft persistence
- `EditLead.jsx` — lead editing with per-lead draft persistence
- `LeadDetail.jsx` — individual lead details view
- `Revival.jsx` — follow-up queue
- `Login.jsx` — Supabase login page
- `NotFound.jsx` — catch-all 404 route

### Assets & Files
- `index.css` and `App.css` for global layout and styling overrides
- `tailwind.config.js` and `postcss.config.js` for Tailwind setup
- `vite.config.js` for Vite app configuration
- `vercel.json` for Vercel SPA routing and static build configuration
- `.env.example` for environment variable guidance

## Deployment Notes
- Production build is generated with `npm run build`.
- Vercel deployment uses `dist` as the build output directory.
- Environment variables must be configured in the hosting environment for Supabase.

## Additional Notes
- The app intentionally avoids committing sensitive `.env` values.
- Form data persistence improves usability when moving between pages.
- Bulk editing and import/export features make it easier to manage large lead sets.
- The project is ready for Vercel deployment with SPA routing support.
