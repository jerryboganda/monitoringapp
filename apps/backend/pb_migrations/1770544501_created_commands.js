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
        "id": "text_target_user_id",
        "name": "target_user_id",
        "type": "text",
        "required": false,
        "hidden": false,
        "min": 0,
        "max": 0,
        "pattern": ""
      },
      {
        "id": "text_status",
        "name": "status",
        "type": "text",
        "required": false,
        "hidden": false,
        "min": 0,
        "max": 0,
        "pattern": ""
      },
      {
        "id": "number_duration",
        "name": "duration",
        "type": "number",
        "required": false,
        "hidden": false,
        "min": null,
        "max": null,
        "onlyInt": false
      }
    ],
    "id": "pbc_3664792373",
    "indexes": [],
    "listRule": "",
    "name": "commands",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3664792373");

  return app.delete(collection);
})
