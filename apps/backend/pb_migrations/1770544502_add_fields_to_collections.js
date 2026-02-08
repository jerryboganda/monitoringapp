/// <reference path="../pb_data/types.d.ts" />

/**
 * This migration adds all missing data fields to the locations, monitoring_logs,
 * and commands collections. These collections were initially created with only
 * the system 'id' field — this migration adds the actual data fields needed
 * for the monitoring system to work.
 */
migrate((app) => {
  // ── 1. Fix LOCATIONS collection ──────────────────────────────────────────
  const locations = app.findCollectionByNameOrId("locations");
  
  // Only add fields that don't already exist
  const locFieldNames = locations.fields.map(f => f.name);
  
  if (!locFieldNames.includes("latitude")) {
    locations.fields.push(new Field({
      "id": "number_latitude",
      "name": "latitude",
      "type": "number",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("longitude")) {
    locations.fields.push(new Field({
      "id": "number_longitude",
      "name": "longitude",
      "type": "number",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("speed")) {
    locations.fields.push(new Field({
      "id": "number_speed",
      "name": "speed",
      "type": "number",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("heading")) {
    locations.fields.push(new Field({
      "id": "number_heading",
      "name": "heading",
      "type": "number",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("timestamp")) {
    locations.fields.push(new Field({
      "id": "text_loc_timestamp",
      "name": "timestamp",
      "type": "text",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("type")) {
    locations.fields.push(new Field({
      "id": "text_loc_type",
      "name": "type",
      "type": "text",
      "required": false,
    }));
  }
  if (!locFieldNames.includes("user_id")) {
    locations.fields.push(new Field({
      "id": "text_loc_user_id",
      "name": "user_id",
      "type": "text",
      "required": false,
    }));
  }

  app.save(locations);

  // ── 2. Fix MONITORING_LOGS collection ────────────────────────────────────
  const monLogs = app.findCollectionByNameOrId("monitoring_logs");
  const monFieldNames = monLogs.fields.map(f => f.name);

  if (!monFieldNames.includes("type")) {
    monLogs.fields.push(new Field({
      "id": "text_ml_type",
      "name": "type",
      "type": "text",
      "required": false,
    }));
  }
  if (!monFieldNames.includes("user_id")) {
    monLogs.fields.push(new Field({
      "id": "text_ml_user_id",
      "name": "user_id",
      "type": "text",
      "required": false,
    }));
  }
  if (!monFieldNames.includes("file")) {
    monLogs.fields.push(new Field({
      "id": "file_ml_upload",
      "name": "file",
      "type": "file",
      "required": false,
      "maxSelect": 1,
      "maxSize": 52428800,
      "mimeTypes": [
        "image/jpeg", "image/png", "image/webp",
        "audio/mpeg", "audio/mp4", "audio/x-m4a",
        "audio/m4a", "audio/aac", "audio/ogg", "audio/wav"
      ],
      "thumbs": ["100x100"],
      "protected": false,
    }));
  }

  app.save(monLogs);

  // ── 3. Fix COMMANDS collection ───────────────────────────────────────────
  const commands = app.findCollectionByNameOrId("commands");
  const cmdFieldNames = commands.fields.map(f => f.name);

  if (!cmdFieldNames.includes("type")) {
    commands.fields.push(new Field({
      "id": "text_cmd_type",
      "name": "type",
      "type": "text",
      "required": false,
    }));
  }
  if (!cmdFieldNames.includes("target_user_id")) {
    commands.fields.push(new Field({
      "id": "text_cmd_target_user_id",
      "name": "target_user_id",
      "type": "text",
      "required": false,
    }));
  }
  if (!cmdFieldNames.includes("status")) {
    commands.fields.push(new Field({
      "id": "text_cmd_status",
      "name": "status",
      "type": "text",
      "required": false,
    }));
  }
  if (!cmdFieldNames.includes("duration")) {
    commands.fields.push(new Field({
      "id": "number_cmd_duration",
      "name": "duration",
      "type": "number",
      "required": false,
    }));
  }

  app.save(commands);

}, (app) => {
  // Rollback: Remove the added fields (revert to id-only collections)
  // This is best-effort; in practice you'd rarely rollback this.
  const locations = app.findCollectionByNameOrId("locations");
  locations.fields = locations.fields.filter(f => f.name === "id");
  app.save(locations);

  const monLogs = app.findCollectionByNameOrId("monitoring_logs");
  monLogs.fields = monLogs.fields.filter(f => f.name === "id");
  app.save(monLogs);

  const commands = app.findCollectionByNameOrId("commands");
  commands.fields = commands.fields.filter(f => f.name === "id");
  app.save(commands);
})
