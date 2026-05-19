# Router Extraction & Postman Documentation Guide

## Overview
The router extraction system automatically discovers and documents all your Express routes for Postman integration.

## Features
✅ **Automatic Route Discovery** - Scans entire Express app for all routes
✅ **Postman Collection Export** - Generate Postman-compatible JSON
✅ **Markdown Documentation** - Auto-generate API docs
✅ **Console Logging** - View all routes in terminal

## Usage

### 1. Basic Setup (Already in Server.js)
Routes are automatically logged and exported when the server starts:

```bash
node Server.js
```

Output will include:
- Console route table showing all available endpoints
- `postman-collection.json` file with Postman-ready collection

### 2. Manual Route Extraction

In any file, you can manually extract routes:

```javascript
const { extractAllRoutes, formatRoutesForPostman } = require("./Router/PathGenerator");
const { logAllRoutes, exportRoutesToPostman } = require("./Tools/Handler/RouteExporter");

// Get raw routes array
const routes = extractAllRoutes(app);

// Log to console
logAllRoutes(app);

// Export to Postman JSON
exportRoutesToPostman(app, "./my-collection.json");

// Export to Markdown
exportRoutesMarkdown(app, "./API_DOCS.md");
```

### 3. Postman Collection Structure

The exported JSON includes:
```json
{
  "info": {
    "name": "Backend Routes",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "GET /health",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

### 4. Import to Postman

1. Open Postman
2. Click **Import** → **Upload Files**
3. Select the generated `postman-collection.json`
4. All routes will appear in a collection ready to test

## Route Format

Each extracted route includes:
- `method` - HTTP method (GET, POST, PUT, DELETE, etc.)
- `path` - Route path (e.g., `/health`, `/port`)
- `fullUrl` - Complete URL with localhost and port
- `description` - Human-readable description

## Example Output

```
============================================================
AVAILABLE API ROUTES
============================================================
GET      /health
GET      /port
============================================================
```

## Adding New Routes

After adding new routes to your Express routers, they will automatically appear in:
1. Console logs on next server start
2. Postman collection exports
3. Markdown documentation

## API Functions

### `extractAllRoutes(app)`
- **Input:** Express app instance
- **Output:** Array of route objects
- **Use:** Low-level route scanning

### `formatRoutesForPostman(routes)`
- **Input:** Routes array
- **Output:** Postman collection JSON object
- **Use:** Converting to Postman format

### `generateRouteMarkdown(routes)`
- **Input:** Routes array
- **Output:** Markdown string
- **Use:** Creating documentation

### `logAllRoutes(app)`
- **Input:** Express app instance
- **Output:** Routes printed to console
- **Use:** Quick route overview

### `exportRoutesToPostman(app, filePath)`
- **Input:** Express app, output file path
- **Output:** JSON file created
- **Use:** Auto-generate Postman collection

### `exportRoutesMarkdown(app, filePath)`
- **Input:** Express app, output file path
- **Output:** Markdown file created
- **Use:** Auto-generate API documentation

## Notes

- Routes are extracted from the current server state
- Nested routers are recursively scanned
- Dynamic routes are captured correctly
- Environment variable `PORT` is used in generated URLs
- Files are created in the current working directory by default
