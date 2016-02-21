# food

 - npm install
 - node --harmony app.js

# API

GET /api/boxes - list of all data with optional per_page and page params
POST /api/boxes - post box data (required body fields: `external_id` - box external id, `type` - type of box, can get and save any other fields)
