'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
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
///parks route
server.get('/parks', parksHandle);
///movies route
server.get('/movies', moviesHandle);
///yelp route
server.get('/yelp', yelpHandle);
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

//movie constructor
function Movie(movieData) {
  this.title = movieData.title;
  this.overview = movieData.overview;
  this.avgVotes = movieData.vote_average;
  this.totalVotes = movieData.vote_count;
  //https://image.tmdb.org/t/p/w500poster_path
  this.imagURL = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
  this.popularity = movieData.popularity;
  this.released = movieData.release_date;
}

//movie constructor
function Yelp(yelpData) {
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

///yelp route handler
function yelpHandle(req, res) {
  let search_query = req.query.search_query;
  let key = process.env.YELP_API_KEY;

  let page = req.query.page;
  let yelpArray = [];
  let limit = 5;
  let offset = (page - 1) * limit + 1;//detemine the starting result index

  //https://api.yelp.com/v3/businesses/search?location=search_query&limit=limit&offset=offset
  let yelpURL = `https://api.yelp.com/v3/businesses/search?location=${search_query}&limit=${limit}&offset=${offset}`;
  superagent
    .get(yelpURL)
    .set('Authorization', `Bearer ${key}`)
    .then(data => {
      data.body.businesses.forEach(element => {
        let newYelp = new Yelp(element);
        yelpArray.push(newYelp);
      })
      res.send(yelpArray);
    })
}

///movie route handler
function moviesHandle(req, res) {
  let moviesArray = [];
  let search_query = req.query.search_query;
  let key = process.env.MOVIE_API_KEY;
  // https://api.themoviedb.org/3/search/movie?api_key=YOUR_ACCESS_TOKEN&query=SEARCH_STRING&include_adult=false
  let movieURL = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${search_query}&include_adult=false`;
  superagent.get(movieURL)
    .then(data => {
      data.body.results.forEach(element => {
        let newMovie = new Movie(element);
        moviesArray.push(newMovie)
      })
      res.send(moviesArray);
    })
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
