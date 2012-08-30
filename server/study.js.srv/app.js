
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 2012);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/ex01/:sid', routes.example01);

app.get("/extapi/geo/continents/:name?", routes.api.geo.continents);
app.get("/extapi/geo/countries/:continent", routes.api.geo.countries);
app.get("/extapi/geo/states/:country", routes.api.geo.states);
app.get("/extapi/geo/places/:name", routes.api.geo.places);

app.get("/extapi/weather/forecast/:woeid", routes.api.weather.forecast);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
