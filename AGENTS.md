# AGENTS.md

## Purpose
This file helps AI coding agents understand the repository structure, technology stack, runtime commands, and project conventions for the `S+ Backend System` backend.

## Workspace scope
- The backend package is located at `S+ Backend System/`
- Main application entry: `S+ Backend System/Server.js`
- The workspace also contains a separate `S+ Frontend System/` directory, but this guidance is focused on the backend service.

## Key technologies
- Node.js with CommonJS modules (`require` / `module.exports`)
- Express 5 for HTTP routing
- MongoDB via a custom connection module at `S+ Backend System/API/Radar/DataBase/MongoDB`
- Native addon support via `node-addon-api` and `node-gyp`
- Built-in Node testing: `node --test`

## Important commands
Run from the backend package root `S+ Backend System`:
- `npm install`
- `npm test`
- `npm start`
- `npm run radar:build`
- `npm run radar:clean`

## Architecture overview
- `S+ Backend System/Server.js` starts the Express app and connects MongoDB
- `S+ Backend System/API/Radar/Router/Main/index.js` composes radar-related route groups
- `S+ Backend System/API/Radar/Controller/` contains request handlers
- `S+ Backend System/API/Radar/Service/` contains service logic and persistence helpers
- `S+ Backend System/API/Radar/Model/` contains data model definitions
- `S+ Backend System/API/Radar/Read/` contains design notes and pipeline plan docs

## Routing conventions
- Router files often use small gateway index modules, for example:
  - `API/Radar/Router/Distance/Gateaway/index.js`
  - `API/Radar/Router/Main/index.js`
- Controllers expose named handler functions that are wired into routers
- New feature routes should be registered in the appropriate router group and then included in `API/Radar/Router/Main/index.js`

## Service and persistence patterns
- `API/Radar/Service/BaseService/index.js` provides generic CRUD helpers
- Specific feature services extend or use these helpers and are placed under `API/Radar/Service/*`
- MongoDB connection is centralized in `API/Radar/DataBase/MongoDB`

## Testing guidance
- Tests are written using Node’s core `node:test` runner
- Existing tests are under `S+ Backend System/Test/`
- Default test command is `npm test` from `S+ Backend System`

## Notes for AI agents
- Prefer backend package commands in `S+ Backend System`
- Keep command usage aligned with the package's `package.json`
- Recognize that native build support is present but the `install` script intentionally skips it
- When modifying API routes, inspect both router gateway modules and controller exports
- Use `API/Radar/Read/README.md` for radar pipeline intent and planned feature scope

## Suggested next customization
- Add a dedicated skill for radar pipeline tasks, such as generating new radar route/controller scaffolding or validating radar burst processing logic.
