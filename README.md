# This is my everything playground. Random projects, code experiments, and whatever I feel like building when I’m bored. Pure vibes, zero pressure.

## Currently messing around with a radar project — tracking objects, calculating distance and speed from raw radar data, then guessing which plane it might be. Just for fun

This project processes raw radar data to detect and identify aircraft. It calculates:

Distance to the target using signal reflection time, frequency shifts, and other radar parameters
Speed and velocity by tracking distance changes over time
Object identification using a simple filter function that matches against known aircraft data

The system then returns the top 5 or top 10 most likely aircraft matching the detected signature.
