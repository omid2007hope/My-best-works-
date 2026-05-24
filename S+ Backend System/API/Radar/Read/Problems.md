# Radar API Problems

## Router/Postman

1. Get Radar Target → Failed with status code 404
2. Post Process Pipeline → Failed with status code 404
3. Post Compute Speed Record → Failed with status code 422
4. Post Compute Identification → Failed with status code 422

---

## Technical Problems

1. The Radar API returns the same value for an object (distance → 1450 EXP) repeatedly, which does not make sense

**Why:**

- In reality, there are always multiple objects in the air
- Even if there is only one object: at 12:00 PM the distance reads 1450 → at 1:00 PM the distance should change, but it remains 1450; this is a constant value

**Prediction:**

- Problem in the service
- Radar's API core does not have the capability to provide what we need for the project
- We are decoding the data incorrectly
- We are misinterpreting the API entirely

## Test 

### Let test the service first by our own fake values 

SpeedOfLight = 299,792,458 meters per second
waveBounceBackDurationSeconds = for Exp(20)seconds