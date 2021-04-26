'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv');


const server = express();
server.use(cors());

const PORT = process.env.PORT || 3000;
//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<

///home route
server.get('/', (req, res) => {
  res.send('Home Page...');
});
///location route
server.get('/location', locationHandel);
///weather route
server.get('/weather', weatherHandle);
//ERROR page...
server.get('*', errorHandle);

//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<

///location route handler
function weatherHandle(req, res) {
  let results = [];

  const allWeatherData = require('./data/weather.json');

  for (let i = 0; i < allWeatherData.data.length; i++) {
    let weather = new Weather(allWeatherData.data[i]);
    results.push(weather);
  }

  // allWeatherData.data.forEach(item => {
  //   let weather = new Weather(item);
  //   results.push(weather);
  // });

  res.send(results);
}

//weather constructor
function Weather(weatherData) {
  this.forecast = weatherData.weather.description; //>>>>> data.weather.description <<<<<<<
  this.time = new Date(weatherData.datetime).toString().slice(0, 15);   // >>>>> data.datetime <<<<<<<
}

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

function errorHandle(req, res) {
  res.send({
    status: 500,
    responseText: 'Sorry, something went wrong'
  });
}

// add listener
server.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
});
