# EIU CDS Speech Language Hearing Clinic SOAP Note System (Local-Only MVP)

Front-end only React + Vite + TypeScript app for University SLP clinic SOAP notes.

## What This Version Does

- No Microsoft sign-in
- No Microsoft Graph
- No backend
- No external storage
- Local browser draft persistence using IndexedDB (with localStorage fallback)
- Dashboard + Editor workflow
- Import/export JSON draft files
- Print/PDF export view
- Optional clinic branding logo at `public/clinic-logo.png`

## Security Notes

- No analytics or external logging services
- No note content is written to URLs
- No note content is logged to console
- Banner warns users to avoid shared/public computers and limit identifiers

## Local Draft Persistence

- Drafts autosave in the current browser profile
- Dashboard lists saved drafts by date/clientKey/session
- Students can continue from autosave or import a previously downloaded draft

## Draft File Workflow

Editor -> Export tab:

1. `Download Draft`
- Downloads full note JSON as:
- `YYYY-MM-DD__ClientKey__SessionNN.soap.json`

2. `Import Draft`
- Loads a previously downloaded `.soap.json` file

3. `Clear Local Drafts`
- Deletes all saved drafts from this browser

Also available:
- `Clear Draft` to remove only the currently open draft

## PDF Export

- Export tab -> `Export to PDF`
- Opens `/print` route with formatted SOAP document
- Automatically triggers `window.print()`
- Print view includes headings and objective data table
- Input controls/buttons are hidden in print output

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

- Project remains static-hostable on GitHub Pages
- Use `VITE_BASE_PATH=/<repo-name>/` for project-site builds
- Workflow file: `.github/workflows/deploy-pages.yml`
