# Project Structure

## Frontend
- index.html
- js/*
- css/*
- lang/*
- link/*

This frontend is deployed via GitHub Pages.

## Google Apps Script Backend
- gas/*
- Apps Script source code managed via clasp

The `gas` directory contains the backend source code deployed to Google Apps Script.

## Architecture

This project consists of two tightly coupled parts:

1. Frontend (GitHub Pages)
2. Google Apps Script backend (`gas/*`)

Changes to one side may require corresponding changes to the other side.

Always review both frontend and backend impacts before completing a task.

## Development Rules

### When modifying files under `gas/`

1. Check whether request parameters have changed.
2. Check whether response formats have changed.
3. If API behavior changes, update frontend code accordingly.
4. If API behavior changes, update `docs/gas-api.md`.
5. Do not remove or modify `appsscript.json` unless explicitly requested.

### When modifying frontend code

1. Check whether any Google Apps Script endpoint is affected.
2. Check whether API request parameters are still correct.
3. Check whether API response parsing is still correct.
4. Keep frontend and backend implementations consistent.

## Deployment

### Frontend
- GitHub Pages

### Backend
- Google Apps Script
- Managed via clasp
- Source code located in `gas/*`

## Safety Rules

Before completing a task that affects API communication:

- Verify frontend requests match backend expectations.
- Verify backend responses match frontend expectations.
- Highlight any required changes on the opposite side if they are not implemented.

## Documentation

If API behavior, request parameters, response formats, or endpoint behavior changes:

- Update `docs/gas-api.md`
- Mention the API change in the task summary

## Important

This project is maintained with AI-assisted development (Codex).

When implementing features, prefer consistency and compatibility over large refactors.

Do not rewrite unrelated code.
Do not change API contracts unless necessary.