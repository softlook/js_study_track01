var provider = require("./extapi/yahoo");

exports.geo = {
	continents: function(req, res) {
		provider.geo.continents(req.params.name, "en-US", function(continents) {
			res.json({ continents: continents });
		});
	},

	countries: function(req, res) {
		provider.geo.countries(req.params.continent, "en-US", function(countries) {
			res.json({ countries: countries });
		});
	},

	states: function(req, res) {
		provider.geo.states(req.params.country, "en-US", function(states) {
			res.json({ states: states });
		});
	},

	places: function(req, res) {
		provider.geo.places(req.params.name, "en-US", function(places) {
			res.json({ places: places });
		});
	}
}

exports.weather = {
	forecast: function(req, res) {
		provider.weather.forecast(req.params.woeid, function(data) {
			res.json((null != data) ? data : {});
		});
	}
}