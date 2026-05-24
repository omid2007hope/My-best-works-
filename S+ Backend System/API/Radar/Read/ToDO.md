24-05-2026: 

What To Do Now

Fix the distance route loader in Post_Distance.js:1. It currently mixes CommonJS with import, so the subroute can fail to load.

Normalize the records controller in Records.js:1. Right now it only fully implements radar records; distance, speed, and identification should be exposed consistently through the same controller pattern.

Harden the burst data contract in RadarModel.js:1 and Radar.js:1. The goal is to persist explicit physics fields, not just raw payload blobs.

Complete deterministic distance logic in Distance.js:1. Keep the existing time-of-flight and direct-distance fallback, but add the metadata-driven FMCW path based on lower_freq_mhz, upper_freq_mhz, chirp_period_us, adc_sampling_hz, and peakSampleIndex.

Add validation so missing required burst physics fields fail early instead of producing ambiguous distances.
Add focused tests for route load, distance computation, and record persistence before moving to tracks.
Why This Order

The current burst record proves ingest works, but the sample data is synthetic and not enough for real range physics. The backend already supports basic distance and speed storage, so the fastest path is to make distance deterministic first. Once that is stable, the track model, geo conversion, and map UI become much safer to add.

For Later

After this slice is stable, the next layer is:

Track model and association
Speed smoothing
Geo conversion and latest-tracks endpoint
Minimal map UI