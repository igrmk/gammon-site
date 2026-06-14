# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Conventions

Keep every line in this repository — code, Markdown (including this file), and config — to a maximum of 120
characters. Ruff (configured in `backend/pyproject.toml`) enforces 120 for Python and Biome
(`frontend/biome.json`) lints the frontend; apply the same limit everywhere by hard-wrapping prose.

Write each commit message as a single Conventional Commits line — `type(scope): summary`, with no body —
where type is one of `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, or `chore` (scope
optional). This is a solo project: commit directly to `main`; do not create feature branches.

## What this is

`gammon-site` is the web app behind https://gammon.im: a thin wrapper around the `gammon-im` converter (the
`gammon` package, maintained in the sibling `gammon` repo). Users drop a Google My Maps KML/KMZ file and get
back an Organic Maps / MAPS.ME KML. A Flask backend does the conversion; a static JS frontend provides the
drag-and-drop UI. Deployed on DigitalOcean App Platform.

## Commands

Backend (Python, managed with uv):

    cd backend
    uv sync
    uv run python main.py        # serve locally on :8080
    uv run ruff check            # lint

Frontend (Node):

    cd frontend
    npm install
    npm run build                # webpack build into frontend/dist
    npx @biomejs/biome check     # lint

There is no test suite; verify by running the app and converting a sample KML/KMZ.

## Architecture

- `backend/main.py` — a small Flask + waitress app. `POST /` takes the uploaded file and calls
  `gammon.convert(file, result, False, False)` (imported as `M`), returning the converted KML as a download;
  `GET /` and `/<path>` serve the built frontend from `../frontend/dist`. The converter is the `gammon-im`
  PyPI package — note the install name is `gammon-im` but the import package is `gammon`.
- `frontend/` — a Dropzone-based single page (`src/index.html`, `src/index.js`, `src/style.css`), bundled by
  webpack into `frontend/dist`. `acceptedFiles` in `index.js` must include both `.kml` and `.kmz`.
- `Dockerfile` — multi-stage: a Node stage builds the frontend, then a `ghcr.io/astral-sh/uv` stage installs
  the backend with `uv sync --frozen --no-dev` and serves `main.py` on port 8080.

## Dependency on the converter

The conversion logic lives in the separate `gammon` repo, published to PyPI as `gammon-im`. To pick up a new
converter release, bump the lock and redeploy:

    cd backend
    uv lock --upgrade-package gammon-im   # add --refresh-package gammon-im if uv's index cache is stale

Commit the changed `backend/uv.lock`; the Docker build uses `uv sync --frozen`, so the deployed version is
whatever the lock pins.

## Deployment

DigitalOcean App Platform (app `gammon-site`, region ams), spec in `.do/app.yaml`, serving `gammon.im`.
`deploy_on_push: true` on `main` — pushing rebuilds and redeploys the service. Changes to the spec itself
(domains, app name) are applied with `doctl apps update <app-id> --spec .do/app.yaml`, not by a push alone.
