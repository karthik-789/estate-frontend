# Estate Frontend

React/Vite frontend for the Real Estate Management System.

## Render deployment

This repository contains `render.yaml` for a Render Static Site.

1. In Render, choose **New → Blueprint** and connect this repository.
2. Enter the public backend API URL for `VITE_API_URL`, for example `https://your-api.onrender.com/api`.
3. Deploy. The SPA rewrite sends dashboard and property routes to `index.html`.

For local development, copy `.env.example` to `.env`, run `npm ci`, then `npm run dev`.
