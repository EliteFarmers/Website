migrate((db) => {
  const snapshot = [
    {
      "id": "_pb_users_auth_",
      "created": "2023-05-05 01:03:35.792Z",
      "updated": "2023-05-05 01:03:36.252Z",
      "name": "users",
      "type": "auth",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "ztlmf4ng",
          "name": "ign",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": 1,
            "max": 26,
            "pattern": "^[a-zA-Z0-9_]+$"
          }
        },
        {
          "system": false,
          "id": "ym5onoko",
          "name": "subscribeDate",
          "type": "date",
          "required": false,
          "unique": false,
          "options": {
            "min": "",
            "max": ""
          }
        },
        {
          "system": false,
          "id": "tsbq6d22",
          "name": "premium",
          "type": "select",
          "required": false,
          "unique": false,
          "options": {
            "maxSelect": 1,
            "values": [
              "none",
              "donator",
              "bronze",
              "silver",
              "gold"
            ]
          }
        },
        {
          "system": false,
          "id": "u3wliljm",
          "name": "leaderboardTokens",
          "type": "number",
          "required": false,
          "unique": false,
          "options": {
            "min": 0,
            "max": null
          }
        },
        {
          "system": false,
          "id": "nvcqgq1s",
          "name": "eventTokens",
          "type": "number",
          "required": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null
          }
        },
        {
          "system": false,
          "id": "qcqyfqz2",
          "name": "uuid",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": 32,
            "max": 32,
            "pattern": "^[a-fA-F0-9]+$"
          }
        },
        {
          "system": false,
          "id": "2wmwpodk",
          "name": "avatar",
          "type": "url",
          "required": false,
          "unique": false,
          "options": {
            "exceptDomains": null,
            "onlyDomains": null
          }
        },
        {
          "system": false,
          "id": "xmbbyhmy",
          "name": "discriminator",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": 4,
            "max": 4,
            "pattern": "^[0-9]{4}$"
          }
        },
        {
          "system": false,
          "id": "4dmxlhss",
          "name": "discordId",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": 10,
            "max": null,
            "pattern": "^\\d+$"
          }
        }
      ],
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": {
        "allowEmailAuth": false,
        "allowOAuth2Auth": true,
        "allowUsernameAuth": false,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "requireEmail": false
      }
    },
    {
      "id": "nwe8oto5otrdfm4",
      "created": "2023-05-05 01:03:36.240Z",
      "updated": "2023-05-05 01:03:36.252Z",
      "name": "guilds",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "s1u5mxa7",
          "name": "discordId",
          "type": "text",
          "required": false,
          "unique": true,
          "options": {
            "min": null,
            "max": null,
            "pattern": "^\\d+$"
          }
        },
        {
          "system": false,
          "id": "1axbw9xn",
          "name": "name",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "7i7nsbaw",
          "name": "icon",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "nk0ckdki",
          "name": "permissions",
          "type": "text",
          "required": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "yicztmlw",
          "name": "hasBot",
          "type": "bool",
          "required": false,
          "unique": false,
          "options": {}
        }
      ],
      "listRule": null,
      "viewRule": null,
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {}
    }
  ];

  const collections = snapshot.map((item) => new Collection(item));

  return Dao(db).importCollections(collections, true, null);
}, (db) => {
  return null;
})
