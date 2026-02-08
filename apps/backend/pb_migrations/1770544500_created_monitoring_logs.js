/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "id": "text_type",
        "name": "type",
        "type": "text",
        "required": false,
        "hidden": false,
        "min": 0,
        "max": 0,
        "pattern": ""
      },
      {
        "id": "text_user_id",
        "name": "user_id",
        "type": "text",
        "required": false,
        "hidden": false,
        "min": 0,
        "max": 0,
        "pattern": ""
      },
      {
        "id": "file_upload",
        "name": "file",
        "type": "file",
        "required": false,
        "hidden": false,
        "maxSelect": 1,
        "maxSize": 52428800,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/webp",
          "audio/mpeg",
          "audio/mp4",
          "audio/x-m4a",
          "audio/m4a",
          "audio/aac",
          "audio/ogg",
          "audio/wav"
        ],
        "thumbs": ["100x100"],
        "protected": false
      },
      {
        "id": "autodate_created",
        "name": "created",
        "type": "autodate",
        "system": false,
        "hidden": false,
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "required": false
      },
      {
        "id": "autodate_updated",
        "name": "updated",
        "type": "autodate",
        "system": false,
        "hidden": false,
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "required": false
      }
    ],
    "id": "pbc_1176372605",
    "indexes": [],
    "listRule": "",
    "name": "monitoring_logs",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1176372605");

  return app.delete(collection);
})
