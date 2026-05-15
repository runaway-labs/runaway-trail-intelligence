# Course Data Schema

What the course agent needs to know about any race course in order to reason about where the athlete is and what's coming next.

## Design principles

- **One schema for all course types** — backyard loops, point-to-point trail races, ultras with aid stations. Avoid race-format-specific tables.
- **PostGIS where geospatial reasoning helps** — segment containment, distance-along-route, proximity to features. Plain Postgres for everything else.
- **Compose from primitives** — a race is a course plus a format. The same Back Cove loop could host a backyard ultra, a 50K, or a 6-hour timed race.
- **Compatible with Run-a-Way's existing PostGIS schema** — same project, same database where possible. Defer to Run-a-Way conventions where they exist.

## Core entities

### `course`
The physical route. Independent of race format.

- `id` (uuid)
- `name` (e.g., "Back Cove Loop")
- `description`
- `geometry` (LINESTRING, PostGIS, the route itself)
- `total_distance_meters`
- `total_elevation_gain_meters`
- `total_elevation_loss_meters`
- `surface_type` (paved | gravel | trail | mixed)
- `created_at`, `updated_at`

### `course_segment`
Course broken into meaningful chunks for agent reasoning. Backyard loop might be one segment; a 50K might have 20.

- `id` (uuid)
- `course_id` (fk)
- `sequence` (int, order along the route)
- `name` (e.g., "Bayside Trail spur", "Bridge crossing")
- `geometry` (LINESTRING)
- `start_distance_meters` (cumulative from course start)
- `end_distance_meters`
- `elevation_gain_meters`
- `surface_type`
- `terrain_notes` (free text: "technical singletrack", "exposed road", "shaded")

### `course_feature`
Point-of-interest along the course. Aid stations, scenic markers, hazards, lap markers.

- `id` (uuid)
- `course_id` (fk)
- `segment_id` (fk, nullable)
- `kind` (aid_station | medical | hazard | scenic | lap_marker | turn | crew_access)
- `name`
- `location` (POINT, PostGIS)
- `distance_meters` (cumulative from course start)
- `notes`

### `race`
A specific event using a course. This is where format lives.

- `id` (uuid)
- `course_id` (fk)
- `name` (e.g., "Back Cove Backyard Ultra 2026")
- `date`
- `format` (backyard | timed | distance_target | last_person_standing)
- `format_config` (jsonb — loop length and cutoff for backyard, total distance for distance_target, etc.)
- `race_director_contact` (jsonb)
- `expected_field_size`

### `course_weather_zone` (Phase C+)
For longer point-to-point courses where weather varies by segment. Out of scope for Back Cove POC.

## Back Cove specifically

For the demo and Phase B, we need exactly:
- 1 course (Back Cove Loop, ~4.2 miles, mostly flat)
- ~3 segments (Back Cove main loop, Bayside Trail spur, start/finish area)
- ~5 features (start/finish, aid station 1 at Payson Park, aid station 2 at start, bridge crossing, the turnaround)
- 1 race (Back Cove Backyard Ultra 2026, format: backyard, loop length: 4.2mi, lap cutoff: 60min)

## Data sources

- **Public GPX** from Strava heatmap or AllTrails (with attribution)
- **OpenStreetMap** for canonical bridge and trail data
- **Manual annotation** for segments and features — Jack walks (or runs) the course with notes

## Migration approach

1. Define schema in Supabase migrations under `platform/supabase/migrations/`
2. Seed Back Cove course as the first row
3. Build a simple import script (`scripts/import-course-gpx.ts`) that takes a GPX file and creates a course with auto-segmented chunks at every 500m or major elevation change
4. Hand-annotate segments and features post-import via SQL or a quick admin tool

## What the course agent will query

Examples of queries the agent will run during a race:

- "Where is the athlete right now?" — given a GPS point, find the closest segment and distance-along-route
- "What's coming up in the next 0.5 miles?" — features and segment transitions ahead
- "How does this segment usually feel for a tired runner?" — terrain notes and elevation
- "What lap is the athlete on?" — for backyard formats, simple distance / loop length math

These should all be fast (<50ms) so the agent can poll frequently without blowing budget.
