'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const { connected } = require('node:process');
require('dotenv').config();


const server = express();
const PORT = process.env.PORT || 4000;
server.use(cors());

//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<

///home route
server.get('/', (req, res) => { res.send('Home Page...'); });
///location route
server.get('/location', locationHandel);
///weather route
server.get('/weather', weatherHandle);
///weather route
server.get('/parks', parksHandle);
//ERROR page...
server.get('*', errorHandle);

//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<

// parks route handler
function parksHandle(req, res) {
  let parkName = req.query.search_query;
  const key = process.env.PARKS_API_KEY;
  //https://developer.nps.gov/api/v1/alerts?parkCode=acad,dena
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${parkName}&api_key=${key}&limit=10`;

  superagent.get(parkURL)
    .then(parksData => {
      let park = parksData.body.data;
      let results = park.map(item => {
        let address = item.addresses[0];
        let oneParkData = new Park(item, address);
        return oneParkData;
      });
      res.send(results);
    });
}

///location route handler
function weatherHandle(req, res) {
  let results = [];
  let cityName = req.query.search_query;
  const key = process.env.WEATHER_API_KEY;
  //https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&key=API_KEY
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}&days=8`;
  superagent.get(weatherURL)
    .then(WeatherData => {
      results = WeatherData.body.data.map(item => {
        let weather = new Weather(item);
        return (weather);
      });
      res.send(results);
    });
}

//park constructor
function Park(parkData, address) {
  this.name = parkData.fullName;
  this.address = `${address.line1}, ${address.city}, ${address.stateCode} ${address.postalCode}`;
  this.fee = parkData.entranceFees[0].cost;
  this.description = parkData.description;
  this.url = parkData.url;
}

//weather constructor
function Weather(weatherData) {
  this.forecast = weatherData.weather.description; //>>>>> data.weather.description <<<<<<<
  this.time = new Date(weatherData.datetime).toString().slice(0, 15);// >>>>> data.datetime <<<<<<<
}

///location route handler
function locationHandel(req, res) {
  let cityName = req.query.search_query;
  const key = process.env.GEOCODE_API_KEY;
  //https://eu1.locationiq.com/v1/search.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING&format=json
  let LocationURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

  superagent.get(LocationURL)
    .then(geoData => {
      let gData = geoData.body;
      const locationData = new Location(cityName, gData);
      res.send(locationData);
    });
}

//location constructor
function Location(cityName, geoData) {
  this.search_query = cityName;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function errorHandle(req, res) {
  res.send({
    status: 500,
    responseText: 'Sorry, something went wrong'
  });
}

// add listener
server.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
  console.log(`coding...`);
});
