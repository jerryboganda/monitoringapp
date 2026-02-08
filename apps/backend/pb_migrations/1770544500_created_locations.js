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
        "id": "number_latitude",
        "name": "latitude",
        "type": "number",
        "required": false,
        "hidden": false,
        "min": null,
        "max": null,
        "onlyInt": false
      },
      {
        "id": "number_longitude",
        "name": "longitude",
        "type": "number",
        "required": false,
        "hidden": false,
        "min": null,
        "max": null,
        "onlyInt": false
      },
      {
        "id": "number_speed",
        "name": "speed",
        "type": "number",
        "required": false,
        "hidden": false,
        "min": null,
        "max": null,
        "onlyInt": false
      },
      {
        "id": "number_heading",
        "name": "heading",
        "type": "number",
        "required": false,
        "hidden": false,
        "min": null,
        "max": null,
        "onlyInt": false
      },
      {
        "id": "text_timestamp",
        "name": "timestamp",
        "type": "text",
        "required": false,
        "hidden": false,
        "min": 0,
        "max": 0,
        "pattern": ""
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
    "id": "pbc_1942858786",
    "indexes": [],
    "listRule": "",
    "name": "locations",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1942858786");

  return app.delete(collection);
})
