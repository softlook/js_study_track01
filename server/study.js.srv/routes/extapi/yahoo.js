var YWS = YWS || {};

(function() {
	YWS.xget = require("http-get");
	YWS.xget.setMaxSockets(50);

	YWS.options = {}

	if(process.env.http_proxy){
		var p = url.parse(process.env.http_proxy);

		YWS.options.proxy = {host: p.hostname, port: p.port};
	}

	YWS.execute = function(req) {
		YWS.options.url = "http://query.yahooapis.com/v1/public/yql?format=json&q=" + req.query;

		YWS.xget.get(YWS.options, function(err, data) {
			console.log("REQ => " + ((undefined !== data.url && null != data.url) ? data.url : "---"));

			if (err) req.fail(err)
			else req.success(JSON.parse(data.buffer));
		});
	}

	YWS.execute2 = function(req) {
		YWS.options.url = req.url;

		YWS.xget.get(YWS.options, function(err, data) {
			console.log("REQUEST => " + data.url);

			if (err) req.fail(err)
			else req.success(JSON.parse(data.buffer));
		});
	}
}());

exports.weather = {
	forecast: function(woeid, callback) {
		if (undefined === woeid) {
			callback(null);
			return;
		}

		var url = "http://weather.yahooapis.com/forecastjson?w=" + woeid + "&u=c";

		YWS.execute2({
			url: url,
			success: function(data) {
				callback(data);
			},
			fail: function(err) {
				console.error(err);
				callback(null);
			}
		});
	}
}

exports.geo = {
	continents: function(nm, lo, callback) {
		var query = "select%20name%20from%20geo.continents";

		var where = (undefined !== nm) ? "name%3D%22" + nm + "%22" : "";
		if (undefined != lo) {
			where += (0 < where.length) ? "%20and%20" : "";
			where += "lang%3D%22" + lo + "%22";
		}
	
		query += (0 < where.length) ? ("%20where%20" + where) : "";

		YWS.execute({
			query: query,
			success: function(data) {
				//console.log("Data => " + JSON.stringify(data));
				//console.log("Result Count => " + data.query.count);
				var names = [];

				for (var i = 0; i < data.query.count; i++) names.push(data.query.results.place[i].name);

				callback(names);
			},
			fail: function(err) {
				console.error(err);
				callback([]);
			}
		});
	},

	countries: function(nm, lo, callback) {
		var query = "select%20name%20from%20geo.countries";

		var where = (undefined !== nm) ? "place%3D%22" + nm + "%22" : "";
		if (undefined != lo) {
			where += (0 < where.length) ? "%20and%20" : "";
			where += "lang%3D%22" + lo + "%22";
		}
	
		query += (0 < where.length) ? ("%20where%20" + where) : "";

		YWS.execute({
			query: query,
			success: function(data) {
				//console.log("Data => " + JSON.stringify(data));
				//console.log("Result Count => " + data.query.count);
				var countries = [];

				for (var i = 0; i < data.query.count; i++) countries.push(data.query.results.place[i].name);

				callback(countries);
			},
			fail: function(err) {
				console.error(err);
				callback([]);
			}
		});
	},

	states: function(nm, lo, callback) {
		var query = "select%20name%20,woeid%20from%20geo.states";

		var where = (undefined !== nm) ? "place%3D%22" + nm + "%22" : "";
		if (undefined != lo) {
			where += (0 < where.length) ? "%20and%20" : "";
			where += "lang%3D%22" + lo + "%22";
		}
	
		query += (0 < where.length) ? ("%20where%20" + where) : "";

		YWS.execute({
			query: query,
			success: function(data) {
				//console.log("Data => " + JSON.stringify(data));
				//console.log("Result Count => " + data.query.count);
				var states = [];

				for (var i = 0; i < data.query.count; i++) {
					var p = data.query.results.place[i];

					states.push({
						name: p.name,
						woeid: p.woeid
					});
				}

				callback(states);
			},
			fail: function(err) {
				console.error(err);
				callback([]);
			}
		});
	},

	places: function(nm, lo, callback) {
		console.log("trying ... with[" + nm + "]");

		var query = "select%20*%20from%20geo.places%20where%20text%3D%22" + nm + "%22";

		if (undefined !== lo) query += "%20and%20lang%3D%22" + lo + "%22";
	
		YWS.execute({
			query: query,
			success: function(data) {
				var places = [];

				for (var i = 0; i < data.query.count; i++) {
					var p = (1 < data.query.count) ? data.query.results.place[i] : data.query.results.place;

					var addr = ((undefined !== p.admin1 && null != p.admin1) ? p.admin1.content : "");
					addr += ((undefined !== p.admin2 && null != p.admin2) ? (", " + p.admin2.content) : "");
					addr += ((undefined !== p.admin3 && null != p.admin3) ? (", " + p.admin3.content) : "");

					places.push({
						name: p.name,
						woeid: p.woeid,
						country: p.country.content,
						province: addr
					});
				};

				callback(places);
			},
			fail: function(err) {
				console.error(err);
				callback([]);
			}
		});
	}
}