function PROXY() {
	var __self = {};

	__self.continents = function(name, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/continents/" + name,
			dataType: "json",
		})
		.done(function(data) {
			callback(data.continents, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : continents list");
		});
	}

	__self.countries = function(continent, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/countries/" + continent,
			dataType: "json",
		})
		.done(function(data) {
			callback(data.countries, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : countries list");
		});
	}

	__self.states = function(country, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/states/" + country,
			dataType: "json",
		})
		.done(function(data) {
			callback(data.states, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : states list");
		});
	}

	__self.places = function(name, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/places/" + name,
			dataType: "json",
			success: function(data) {
				callback(data.places, argx);
			},
			error: function() {
				alert("Loading has failed : find result(s)");
			}
		});
	}

	return __self;
}

function MODEL() {
	var __self = {};

	var regions = [];
	var watches = {};

	var evntListeners = { continentsChanged:[], countriesChanged:[], statesChanged:[], watchesChanged:[] };

	// {{ Register Event Listners
	__self.continentsChanged = function(f) {
		evntListeners.continentsChanged.push(f);
	}

	__self.countriesChanged = function(f) {
		evntListeners.countriesChanged.push(f);
	}

	__self.statesChanged = function(f) {
		evntListeners.statesChanged.push(f);
	}

	__self.watchesChanged = function(f) {
		evntListeners.watchesChanged.push(f);
	}
	// }} Register Event Listners

	// {{ Update Data
	__self.set_continents = function(list) {
		for (var i = 0; i < list.length; i++)
			regions.push({ name: list[i], countries: null });

		for (var i = 0; i < evntListeners.continentsChanged.length; i++)
			evntListeners.continentsChanged[i]();
	}

	__self.set_countries = function(continent, list) {
		regions[continent].countries = [];

		for (var i = 0; i < list.length; i++)
			regions[continent].countries.push({ name: list[i], states: null });

		for (var i = 0; i < evntListeners.countriesChanged.length; i++)
			evntListeners.countriesChanged[i](continent);
	}

	__self.set_states = function(continent, country, list) {
		regions[continent].countries[country].states = list;

		for (var i = 0; i < evntListeners.statesChanged.length; i++)
			evntListeners.statesChanged[i](continent, country);
	}

	__self.get_continents = function() {
		return regions;
	}

	__self.get_countries = function(continent, list) {
		var result = regions[continent].countries;

		if (undefined !== result && null != result) return result;

		return [];
	}

	__self.get_states = function(continent, country, list) {
		return (regions[continent] && regions[continent].countries && regions[continent].countries[country]) ?
			regions[continent].countries[country].states : [];
	}

	__self.get_watches = function() {
		return watches;
	}

	__self.add_watch = function(woeid, name, country, province) {
		if (undefined === watches[woeid] ||
			null == watches[woeid]) {
			watches[woeid] = { name: name, country: country, province:province };

			for (var i = 0; i < evntListeners.watchesChanged.length; i++)
				evntListeners.watchesChanged[i]();
		}
	}

	__self.remove_watch = function(woeid) {
		if (undefined !== watches[woeid]) {
			watches[woeid] = null;

			for (var i = 0; i < evntListeners.watchesChanged.length; i++)
				evntListeners.watchesChanged[i]();
		}
	}

	// }} Update Data

	// {{ Has Data ?
	__self.has_continents = function() {
		return (null != regions && 0 < regions.length) ? true : false;
	}

	__self.has_countries = function(continent) {
		return (__self.has_continents() && null != regions[continent].countries) ? true : false;
	}

	__self.has_states = function(continent, country) {
		return (__self.has_countries(continent) && null != regions[continent].countries[country].states) ? true : false;
	}
	// }} Has Data ?

	return __self;
}

function UI() {
	var __self = {}; 

	var _model = {};

	__self.set_model = function(m) {
		_model = m;

		m.continentsChanged(function() {
			var continents = m.get_continents();

			if (undefined === continents || null == continents) return;

			var t = $("#u-continents");

			t.html(""); // clear list

			for (var i = 0; i < continents.length; i++) {
				var c = continents[i].name;

				t.append("<li><a href='javascript:action.findCountries(" + i + ", \"" + c + "\")'>" + c + "</a>" +
					"<ul id='u-cx-" + i + "' style='display:none'></ul></li>");
			}
		});

		m.countriesChanged(function(continent) {
			var countries = m.get_countries(continent);

			if (undefined === countries || null == countries) return;

			var t = $("#u-cx-" + continent);

			t.html(""); // clear list

			for (var i = 0; i < countries.length; i++) {
				var cx = countries[i].name;

				t.append("<li><a href='javascript:action.findStates(" + continent + ", " + i + ", \"" + cx + "\")'>" + cx + "</a>" +
					"<ul id='u-sx-" + continent + "-" + i + "' style='display:none'></ul></li>");
			}
		});

		m.statesChanged(function(continent, country) {
			var states = m.get_states(continent, country);

			if (undefined === states || null == states) return;

			var t = $("#u-sx-" + continent + "-" + country);

			t.html(""); // clear list
			
			for (var i = 0; i < states.length; i++) {
				var s = states[i];

				t.append("<li><a href='javascript:action.showWeather(\"" + s.woeid + "\")'>" + s.name + "</a></li>");
			}
		});

		m.watchesChanged(function() {
			__self.renderWatchPlace();
		});
	}

	__self.toggleCountries = function(continent) {
		var t = $("#u-cx-" + continent);

		if ("none" == t.css("display")) {
			t.css("display", "block");
			return true;
		} else {
			t.css("display", "none");
			return false;
		}
	}

	__self.toggleStates = function(continent, country) {
		var t = $("#u-sx-" + continent + "-" + country);

		if ("none" == t.css("display")) {
			t.css("display", "block");
			return true;
		} else {
			t.css("display", "none");
			return false;
		}
	}

	__self.renderFindPlacesResult = function(places, argx) {
		var t = $("#" + argx.id);

		t.html(""); // clear list
		
		for (var i = 0; i < places.length; i++) {
			var s = places[i];

			t.append("<tr>" +
							"<td><button id='u-fp-" + s.woeid + "' class='btn btn-mini add-watch-place'><i class='icon-plus'></i></button></td>" +
							"<td>" + s.country + "</td>" +
							"<td>" + s.province + "</td>" +
							"<td>" + s.name + "</td>" +
							"</tr>");

			$("#u-fp-" + s.woeid).click(function(e) {
				action.addWatchPlace({ woeid: s.woeid, name: s.name, country: s.country, province: s.province });
			});
		}
	}

	__self.renderWatchPlace = function() {
		var places = _model.get_watches();

		if (undefined === places || null == places) return;

		var t = $("#u-watch-place");

		t.html(""); // clear list
		
		for (var i = 0; i < places.length; i++) {
			var s = places[i];

			t.append("<tr>" +
							"<td>" + s.country + "/" + s.province + "</td>" +
							"<td>" + s.name + "</td>" +
							"<td>" + "날씨" + "</td>" +
							"<td><button woeid='" + s.woeid + "' class='btn btn-mini'><i class='icon-trash icon-white'></i></button></td>" +
							"</tr>");
		}
	}

	return __self;
}

var action = (function(model, ui, proxy) {
	var __self = {};

	var m = model, u = ui, p = proxy;

	u.set_model(m);

	__self.findContinents = function(name) {
		if (false == m.has_continents())
			p.continents(name, {}, function(data) {
				m.set_continents(data);
			});
	}

	__self.findCountries = function(cId, continent) {
		if (u.toggleCountries(cId)) {
			if (false == m.has_countries(cId))
				p.countries(continent, { c: cId }, function(data, argx) {
					m.set_countries(argx.c, data);
				});
		}
	}

	__self.findStates = function(cId, cxId, country) {
		if (u.toggleStates(cId, cxId)) {
			if (false == m.has_states(cId, cxId))
				p.states(country, { c:cId, cx:cxId }, function(data, argx) {
					m.set_states(argx.c, argx.cx, data);
				});
		}
	}

	__self.findPlace = function(idx, place) {
		p.places(place, { id: idx }, u.renderFindPlacesResult);
	}

	__self.addWatchPlace = function(place) {
		m.add_watch(place.woeid, place.name, place.country, place.province);
	}

	__self.updateWeather = function() {
		u.renderWatchPlace();
	}

	__self.showWeather = function(woeid) {
		alert("[debug] try to get weather forecast '" + woeid + "'");
	}

	return __self;
})(new MODEL(), new UI(), new PROXY());

$(document).ready(function() {
	$("#u-btn-refresh").click(function() {
		action.findContinents("");
	});

	$("#u-btn-addplace").click(function() {
		$("#modalAddPlace").modal();
	});

	$("#u-btn-search").click(function() {
		action.findPlace("u-findplace-result", $("#keyword").val());
	});

	$("#u-btn-updatewatch").click(function() {
		action.updateWeather();
	});
});