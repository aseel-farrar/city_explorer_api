'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


const server = express();
const PORT = process.env.PORT || 4000;
server.use(cors());

// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<

///home route
server.get('/', (req, res) => { res.send('Home Page...'); });
///location route
server.get('/location', locationHandel);
///weather route
server.get('/weather', weatherHandle);
///weather route
server.get('/parks', parksHandle);
//get the data from DATABASE route (i use it for testing)
server.get('/get', getHandle);
//ERROR page...
server.get('*', errorHandle);

//>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<
//! get rout handler
function getHandle(req, res) {
  let SOL = `SELECT * FROM locations;`;
  client.query(SOL)
    .then(result => {
      res.send(result.rows);
    });
}

//!  parks route handler
function parksHandle(req, res) {
  let parkName = req.query.parkcode;
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

//!  weather route handler
function weatherHandle(req, res) {
  let results = [];
  let cityName = req.query.city;
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

//!  location route handler
function locationHandel(req, res) {
  let cityName = req.query.city;
  //GET DATA FROM DATABASE
  let SQL = `SELECT * FROM locations WHERE search_query = '${cityName}';`;
  client.query(SQL)
    .then(result => {
      if (result.rows.length === 0) {// RETURN FROM API SERVER
        const key = process.env.GEOCODE_API_KEY;
        //https://eu1.locationiq.com/v1/search.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING&format=json
        let LocationURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;

        superagent.get(LocationURL)
          .then(geoData => {
            let gData = geoData.body;
            const locationData = new Location(cityName, gData);
            // INSERT DATA TO DATABASE
            let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;`;
            let safeValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
            client.query(SQL, safeValues)
              .then(result => {
                res.send(result.rows[0]);
              });
          });
      }
      else if (cityName === null) {
        res.send('PLEASE ENTER VALID CITY NAME');
      }
      else { // RETURN FROM DATABASE
        res.send(result.rows[0]);
      }
    })
    .catch(error => {
      res.send(error);
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
client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening to PORT ${PORT}`);
      console.log(`coding...`);
    });
  });
