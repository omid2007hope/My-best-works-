# Radar API for JavaScript Developers

This project now includes a JavaScript-facing Radar module with a native addon scaffold.

## Routes

- `GET /server/radar/status`
- `POST /server/radar/init`
- `POST /server/radar/start`
- `POST /server/radar/stop`
- `GET /server/radar/burst`
- `POST /server/radar/shutdown`

## Quick Start

1. Install dependencies:
   - `npm install`
2. Build native scaffold:
   - `npm run radar:build`
3. Start server:
   - `npm start`

## Example Flow

1. Initialize radar:

```http
POST /server/radar/init
Content-Type: application/json

{
  "sensorId": 0,
  "countryCode": "US",
  "config": {
    "chirpsPerBurst": 16,
    "samplesPerChirp": 64,
    "channelsCount": 2,
    "bitsPerSample": 16
  }
}
```

2. Start stream:

```http
POST /server/radar/start
```

3. Read burst:

```http
GET /server/radar/burst
```

4. Stop and shutdown:

```http
POST /server/radar/stop
POST /server/radar/shutdown
```

## Native Integration Notes

- The addon file `native/radar_addon.cpp` is a scaffold and currently returns `NOT_IMPLEMENTED` for Radar SDK calls.
- Until you link a vendor SDK implementation, the JavaScript service automatically runs in `mock` mode.
- Mock mode generates synthetic burst data compatible with expected API shape.
