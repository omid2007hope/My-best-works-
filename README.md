Radar End-to-End Plan
This document is the implementation plan for building a full radar pipeline that can:

decode burst data
estimate distance/range
estimate speed and velocity
estimate altitude (with assumptions or multi-sensor geometry)
identify likely aircraft candidates (for example SR-71, Concorde, and other top matches)
1. Goal
Build a production-ready flow:

Radar Burst -> Signal Features
Signal Features -> Distance and Velocity
Distance and Velocity -> Tracking State
Tracking State -> Aircraft Identification Ranking
Output should be a ranked list such as: top 10 most likely aircraft with confidence.

2. Current State (from codebase)
Burst decode exists in Radar service and correctly parses base64 raw ADC values.
Distance service can already compute distance if one of these is present:
waveBounceBackDurationSeconds
distanceMeters/rangeMeters
rangeResolutionMeters + peakSampleIndex
Native addon is scaffold-only and currently returns NOT_IMPLEMENTED.
Runtime is mock mode unless native SDK integration is completed.
3. Core Technical Constraints
3.1 Why current mock burst is not enough for real physics
The large samples array is raw ADC data. Without additional physical metadata, absolute range is ambiguous.

You need at least one of these:

Time of flight directly: waveBounceBackDurationSeconds
FMCW calibration and timing data:
lower_freq_mhz
upper_freq_mhz
chirp_period_us
adc_sampling_hz
detected beat/peak bin
3.2 Distance formulas
Time-of-flight model:

R
=
c
⋅
t
2

FMCW model:

S
=
B
T
c
h
i
r
p
,
R
=
c
⋅
f
b
2
S

Where:

c
 is speed of light
B
=
f
h
i
g
h
−
f
l
o
w
f
b
 is beat frequency from FFT peak
4. Full Implementation Plan
Phase A: Data Contract Stabilization
Target: every burst record includes enough fields for reproducible distance estimation.

Required fields to store with each burst:

Radar burst packet:
format
read_bytes
data_base64
Radar acquisition config:
chirp_period_us
lower_freq_mhz
upper_freq_mhz
adc_sampling_hz
tx/rx masks if available
Derived signal fields:
peakSampleIndex
peakAmplitude
noiseFloor
snrDb
optional rangeResolutionMeters
Deliverables:

strict burst DTO schema
persistence migration in Radar model
validation errors for missing required physics fields
Phase B: Distance Estimation Engine
Target: compute reliable per-burst distance and confidence.

Steps:

Decode base64 -> integer samples
Reshape samples into chirp/channel matrix
Preprocess (windowing, optional DC removal)
Range FFT per chirp
Peak detection and SNR gate
Convert peak bin -> beat frequency -> distance
Save distanceMeters + confidence
Deliverables:

calculateDistanceFromFmcwBurst method
distance quality metrics (snrDb, confidence, gateStatus)
fallback path for direct waveBounceBackDurationSeconds
Phase C: Speed and Velocity Estimation
Target: estimate radial speed and trajectory-level velocity state.

Steps:

Build track history with timestamped distances
Compute radial speed from distance derivative
Optional Doppler-based speed from chirp-to-chirp phase
Smooth with filter (Kalman or alpha-beta)
Output speedKmh, velocityVector estimate, uncertainty
Deliverables:

track model
speed estimator
uncertainty and outlier rejection
Phase D: Altitude Estimation
Target: obtain usable altitude estimate.

Options:

Single radar plus beam geometry assumptions (low confidence)
Multi-radar triangulation (recommended)
External sensor fusion (ADS-B, barometric feed, EO/IR)
Deliverables:

altitudeMeters with source label and confidence
geometry assumptions documented per estimate
Phase E: Aircraft Identification and Ranking
Target: rank likely aircraft classes/types from kinematics and profile.

Feature inputs:

cruise speed and max speed compatibility
acceleration profile
altitude envelope
climb/descent behavior
trajectory pattern and turn constraints
radar cross-section heuristic if available
Output:

top N candidates (for example top 10)
confidence score per candidate
explanation fields: why candidate matched
Deliverables:

aircraft catalog with constraints
ranking model and explainability output
API endpoint for candidate list
Phase F: API and Storage Integration
Target: one coherent pipeline from burst read to identification response.

Pipeline:

read burst
persist raw + decoded burst
compute and persist distance
compute and persist speed/velocity
compute and persist altitude (if available)
run identification and persist ranked candidates
Deliverables:

orchestration service
versioned API response contract
endpoint to fetch latest fused target state
Phase G: Validation and Testing
Target: trustable outputs.

Test categories:

unit tests for decode, FFT, peak detection, distance conversion
integration tests for end-to-end pipeline
synthetic scenario tests (known ground-truth targets)
regression tests for ranking stability
Acceptance metrics:

distance error target (defined per range band)
speed error target
identification top-1/top-3 accuracy
throughput and latency budget
5. Minimal Field Set to Start Real Distance Today
If native integration is not ready, inject these fields per burst now:

lower_freq_mhz
upper_freq_mhz
chirp_period_us
adc_sampling_hz
peakSampleIndex
With those five fields, FMCW distance can be computed even before full Doppler and tracking pipeline is complete.

6. Suggested Milestones
Milestone 1:

stabilize burst schema
implement FMCW distance path
save distance + confidence
Milestone 2:

tracking store and radial speed
filtered velocity output
Milestone 3:

altitude source integration
candidate ranking with top 10 output
Milestone 4:

model evaluation and tuning
API hardening and production tests
7. API + Project Research Snapshot (May 24, 2026)
7.1 Existing backend routes (current)
Mounted prefixes:

/server/radar
/radar
Main radar routes:

GET /status
POST /init
POST /start
POST /stop
GET /burst
POST /shutdown
/records/*
Records routes currently available:

GET /records/radar
POST /records/radar
7.2 Existing data/model capability
Radar burst model stores event, source, mode, config, format, base64, decoded payload, timestamp.
Distance model stores distanceMeters + timestamp.
Speed model stores speedKmh + distanceDecreasePerMinuteMeters + timestamp.
Identification model stores observation + candidates + timestamp.
Plane catalog exists and supports ranked candidate output by speed/duration/profile.
7.3 Key project blockers found
Native addon is still scaffold mode (NOT_IMPLEMENTED), so no real hardware range/Doppler yet.
Distance sub-router file imports a non-existent controller and mixes module systems:
API/Radar/Router/Distance/Post_Distance.js
UI view folder is empty, so map rendering is not implemented yet.
8. Feasibility Decision (Is this possible?)
Short answer: Yes, possible, but in stages with different confidence levels.

8.1 Possible now (with current project)
Decode and persist bursts.
Compute distance when one of these exists:
waveBounceBackDurationSeconds
distanceMeters/rangeMeters
rangeResolutionMeters + peakSampleIndex
Compute speed from distance timeline.
Rank likely aircraft candidates (top-N list).
8.2 Not physically reliable yet (until missing data is added)
True FMCW distance from raw samples in production.
Reliable velocity vector (not only radial trend).
Reliable altitude from single sensor without geometry/fusion.
Geographic plane location (lat/lon) from one radar node without angle/triangulation or external geo source.
8.3 Required to make it fully real
Native SDK integration exposing radar main params and real bursts.
Range FFT + Doppler processing.
Tracking filter and coordinate transform layer.
Geolocation inputs:
radar site GPS location
bearing/elevation or multi-radar triangulation
optional ADS-B fusion for validation.
8.4 Practical delivery expectations
Expected by stage (single developer estimate):

Distance from available metadata: 1-2 weeks
Radial speed and smoothing: 1-3 weeks
Track lifecycle and confidence gates: 2-4 weeks
Map view with live tracks: 1-2 weeks after tracks API
Altitude and robust geolocation: 3-8 weeks depending on sensors/fusion
Strong identification confidence: ongoing model tuning with real data
These ranges assume continuous access to burst data and stable API contracts.

9. Plane Location + Map Plan
Target output:

detected targets with:
latitude
longitude
altitudeMeters
speedKmh
heading
candidate aircraft list + confidence
9.1 Backend additions
Add Track model:
trackId, timestamps, range, bearing, elevation, lat, lon, altitude, velocity, confidence
Add track service:
track association and smoothing (Kalman/alpha-beta)
Add geolocation conversion:
radar-local polar -> WGS84 lat/lon
Add map endpoint:
GET /server/radar/tracks/latest
9.2 Frontend additions
Create map app (Leaflet or Mapbox).
Render live markers from tracks endpoint.
Show popup details:
speed/altitude/heading
top aircraft candidates and confidence
Add history trail for each track.
9.3 Readiness levels
Level 1 (demo): mock + synthetic coordinates.
Level 2 (pilot): single-radar approximate map with assumptions.
Level 3 (operational): multi-sensor fused geo tracks and confidence gates.
10. Go / No-Go Gates
Proceed now (Go):

Burst decode and persistence are already operational.
Distance from explicit fields is operational.
Speed and ranking can be built incrementally from stored records.
Do not claim production-grade output yet (No-Go until complete):

Real FMCW distance from raw samples without native metadata wiring.
Reliable altitude from single-radar geometry alone.
Reliable lat/lon mapping without angle or fusion inputs.
11. Immediate Next Steps (Execution Order)
Fix broken distance route wiring in API/Radar/Router/Distance/Post_Distance.js.
Implement FMCW distance method using required metadata fields.
Restore full records controller endpoints (distance/speed/identification/radar) if needed for pipeline inspection.
Add Track model and latest tracks API.
Build minimal map UI and plot live tracks.
12. Legal and Deployment Safety
Software-only and passive pipeline work is generally low-risk:

burst parsing, tracking logic, ranking, APIs, and map rendering
passive sources such as ADS-B integration (where locally permitted)
Active transmission/radar operation can be regulated and jurisdiction-specific:

verify local radio rules before real transmitter operation
use certified hardware/modules and permitted frequency bands
avoid any deployment near restricted airspace without authorization
Recommended implementation sequence for safety:

Build and validate full stack in mock + passive data mode.
Integrate native SDK metadata and verify deterministic distance outputs.
Add active sensor operation only after regulatory confirmation.
13. Legal / IPR Notice
Any contribution made to the issues of this repository that results in a "shall" requirement pointing to an essential patent will require the company or individual holding the IPR to submit a Patent Holder Statement form. See https://standards.cta.tech/kwspub/rules/CTA-EP-23-T-IP-Proffer.pdf. Contributors are obliged to disclose to the working group any knowledge they may have of existing essential patents (or an intent to patent items whenever appropriate) affecting the work covered by this repository.

Note that CTA is not responsible for identifying any patents for which a license may be required by a CTA document, nor for conducting inquiries into the legal validity or scope of those patents that are brought to its attention. For further IPR information, see Section 15 of EP-23: https://standards.cta.tech/kwspub/rules/CTA-EP-23-T.pdf.

This is not an officially supported Google product.

Plan: Radar Pipeline Feasibility Execution
Your plan is now updated into an execution-ready version based on what is actually possible now vs later, and I saved it in session memory at /memories/session/plan.md.

TL;DR: proceed in stages. Fix current routing blockers first, make distance deterministic with metadata, then add tracking and map APIs, and keep active-radar deployment gated by legal/regulatory checks.

Steps

Fix route blocker in Post_Distance.js so distance endpoint loads correctly.
Harden burst metadata contract in RadarModel.js and Radar.js.
Complete deterministic FMCW + fallback logic in Distance.js.
Normalize records API behavior in Records.js and Records.js.
Add Track domain using existing patterns:
S+ Backend System/API/Radar/Model/Track/TrackModel.js
S+ Backend System/API/Radar/Service/Radar/Track.js
Extend records controller/router with track endpoints.
Add geolocation conversion service in S+ Backend System/API/Radar/Service/Radar/Geo.js and expose latest tracks via gateway Index.js.
Build minimal map UI on top of latest-tracks API.
Keep rollout gates: mock/passive first, native metadata second, active transmitter last with compliance checks.
Verification

Router/module load checks pass without import/runtime errors.
Distance endpoint returns deterministic values for TOF, direct range, and FMCW cases.
Records endpoints return consistent contracts across distance/speed/identification/radar/track.
Synthetic replay validates tracking smoothness and confidence behavior.
Geolocation outputs validate against known references.
Map markers and popup payloads reflect live API state correctly.
