'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv');


const server = express();
server.use(cors());

const PORT = process.env.PORT || 3000;
//>>>>>>>>>>>>>>>>>ROUTES<<<<<<<<<<<<<<<<<<<

///home route
server.get('/', (req, res) => {
  res.send('Home Page...');
});

///location route
server.get('/location', locationHandel);

//ERROR page...
server.get('*', (req, res) => {
  res.send('ERROR page...');
});
//>>>>>>>>>>>>>>>>>ROUTES<<<<<<<<<<<<<<<<<<<




///location route handler
function locationHandel(req, res) {
  const geoData = require('./data/location.json');
  let locationData = new Location(geoData);
  res.send(locationData);
}
//location constructor
function Location(geoData) {
  this.search_query = 'Lynwood';
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}









server.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
});
