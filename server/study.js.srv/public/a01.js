function PROXY() {
	var __self = {};

	__self.continents = function(name, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/continents/" + name,
			dataType: "json"
		})
		.done(function(data) {
			callback(data.continents, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : continents list");
		});
	};

	__self.countries = function(continent, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/countries/" + continent,
			dataType: "json"
		})
		.done(function(data) {
			callback(data.countries, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : countries list");
		});
	};

	__self.states = function(country, argx, callback) {
		$.ajax({
			type: "GET",
			url: "/extapi/geo/states/" + country,
			dataType: "json"
		})
		.done(function(data) {
			callback(data.states, argx);
		})
		.fail(function(err) {
			alert("Loading has failed : states list");
		});
	};

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
	};

	return __self;
}

var EVENT = {
	listeners : {},
	on : function(evt, delegate) {
		EVENT.listeners[evt] = EVENT.listeners[evt] || [];

		EVENT.listeners[evt].push(delegate);
	},
	emit : function(evt, data) {
		var e = EVENT.listeners[evt];

		if (undefined !== e && 0 < e.length) {
			for (var i = 0; i < e.length; i++)
				setTimeout(e[i](data), 0);
		}
	}
};

function MODEL() {
	var __self = {};

	__self.data = [];
	var places = {};

	// {{ Proxy Callbacks

	__self.callbackContinents = function(list, argx) {
		this.set_continents(list);
	};

	__self.callbackCountries = function(list, argx) {
		this.set_countries(argx.continent, list);
	};

	__self.callbackStates = function(list, argx) {
		this.set_states(argx.continent, argx.country, list);
	};

	// }} Proxy Callbacks

	// {{ Data Operation

	set_continents = function(list) {
		// update continents
		__self.data = [];

		for (var i = 0; i < list.length; i++) {
			__self.data.push({ nm: list[i], countries: null });
		}

		EVENT.emit("continentChanged", { continents: list });
	};

	set_countries = function(continent, list) {
		// update continents
		var c = __self.data[continent];

		if (null === c) return;

		c.countries = [];

		for (var i = 0; i < list.length; i++) {
			c.countries.push({ nm: list[i], states: null });
		}

		EVENT.emit("countryChanged", { continent: continent, countries: list });
	};

	set_states = function(continent, country, list) {
		// update continents
		var c;

		if (!__self.has_countries(continent) || !(c = __self.data[continent].countries[country])) return;

		c.states = [];

		for (var i = 0; i < list.length; i++) {
			c.states.push(list[i]);
		}

		EVENT.emit("stateChanged", { continent: continent, country: country, states: list });
	};

	__self.add_watchplace = function(list) {
		for (var i = 0; i < list.length; i++) {
			var place = list[i];

			places[place.woeid] = place;
		}
		
		EVENT.emit("watchChanged", { places: places });
	};

	__self.add_watchplace = function(list) {
		for (var i = 0; i < list.length; i++) {
			var place = list[i];

			places[place.woeid] = place;
		}
		
		EVENT.emit("watchChanged", { places: places });
	};

	__self.remove_watchplace = function(list) {
		for (var i = 0; i < list.length; i++) {
			var woeid = list[i];
			
			places[woeid] && (delete places[woeid]);
		}
		
		EVENT.emit("watchChanged", { places: places });
	};

	__self.has_continents = function() {
		return (0 < __self.data.length) ? true : false;
	};

	__self.has_countries = function(continent) {
		var c;

		return (__self.has_continents() && (c = __self.data[continent]) && c.countries) ? true : false;
	};

	__self.has_states = function(continent, country) {
		var c;

		return (__self.has_countries(continent) && (c = __self.data[continent].countries[country]) &&
			c.states) ? true : false;
	};

	// }} Data Operation

	return __self;
}

function UI() {
	var __self = {};

	var _model = {};

	// {{ Register Event Callback - data changed
	EVENT.on("continentChanged", function(data) {
		var names = data.continents;
		var t = $("#u-continents");

		t.html(""); // clear list

		for (var i = 0; i < names.length; i++) {
			var nm = names[i];

			t.append("<li><a href='javascript:action.findCountries(" + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-cont-" + i + "' style='display:none'></ul></li>");
		}
	});

	EVENT.on("countryChanged", function(data) {
		var continent = data.continent;
		var countries = data.countries;
		var t = $("#u-cont-" + continent);

		t.html(""); // clear list

		for (var i = 0; i < countries.length; i++) {
			var nm = countries[i];

			t.append("<li><a href='javascript:action.findStates(" + continent + ", " + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-st-" + continent + "-" + i + "' style='display:none'></ul></li>");
		}
	});

	EVENT.on("stateChanged", function(data) {
		var continent = data.continent;
		var country = data.country;
		var states = data.states;
		var t = $("#u-st-" + continent + "-" + country);

		t.html(""); // clear list
		
		for (var i = 0; i < states.length; i++) {
			var s = states[i];

			t.append("<li><a href='javascript:action.showWeather(\"" + s.woeid + "\")'>" + s.name + "</a></li>");
		}
	});

	EVENT.on("watchChanged", function(data) {
		__self.renderWatchPlace(data.places);
	});

	// }} Register Event Callback - data changed

	// {{ Draw

	__self.toggleTree = function(continent, country) {
		var t = ((undefined === country) ? $("#u-cont-" + continent) : $("#u-st-" + continent + "-" + country));
		t.css("display" , (("none" == t.css("display")) ? "block" : "none"));
	};

	__self.renderFindPlacesResult = function(places) {
		var t = $("#u-findplace-result");

		t.html(""); // clear list

		for (var i = 0; i < places.length; i++) {
			var s = places[i];

			t.append("<tr>" +
							"<td><button id='u-fp-" + s.woeid + "' class='btn btn-mini add-watch-place'><i class='icon-plus'></i></button></td>" +
							"<td>" + s.country + "</td>" +
							"<td>" + s.province + "</td>" +
							"<td>" + s.name + "</td>" +
							"</tr>");

			$("#u-fp-" + s.woeid).click({ woeid: s.woeid, name: s.name, country: s.country, province: s.province }, function(e) {
				action.addWatchPlace(e.data);
			});
		}
	};

	__self.renderWatchPlace = function(places) {
		var t = $("#u-watch-place");

		t.html(""); // clear list

		for (var x in places) {
			var s = places[x];

			t.append("<tr woeid='" + s.woeid + "'>" +
							"<td>" + s.country + "/" + s.province + "</td>" +
							"<td>" + s.name + "</td>" +
							"<td>" + "날씨" + "</td>" +
							"<td><button id='u-wp-" + s.woeid + "' class='btn btn-danger btn-mini'><i class='icon-trash icon-white'></i></button></td>" +
							"</tr>");

			$("#u-wp-" + s.woeid).click({ woeid: s.woeid }, function(e) {
				action.removeWatchPlace(e.data.woeid);
			});
		}
	};

	// }} Draw

	return __self;
}

var action = (function(model, ui, proxy) {
	var __self = {};

	__self.findContinents = function() {
		if (false === model.has_continents())
			proxy.continents(name, {}, model.callbackContinents);
	};

	__self.findCountries = function(continent, name) {
		ui.toggleTree(continent);

		if (false === model.has_countries(continent))
			proxy.countries(name, { continent: continent }, model.callbackCountries);
	};

	__self.findStates = function(continent, country, name) {
		ui.toggleTree(continent, country);

		if (false === model.has_states(continent, country))
			proxy.states(name, { continent: continent, country: country }, model.callbackStates);
	};

	__self.findPlace = function(place) {
		proxy.places(place, { }, ui.renderFindPlacesResult);
	};

	__self.addWatchPlace = function(place) {
		model.add_watchplace([place]);
	};

	__self.removeWatchPlace = function(woeid) {
		model.remove_watchplace([woeid]);
	};

	__self.updateWeather = function() {
		ui.renderWatchPlace();
	};

	__self.showWeather = function(woeid) {
		alert("[debug] try to get weather forecast '" + woeid + "'");
	};

	return __self;
})(new MODEL(), new UI(), new PROXY());

$(document).ready(function() {
	$("#u-btn-refresh").click(function() {
		action.findContinents();
	});

	$("#u-btn-search").click(function() {
		action.findPlace($("#keyword").val());
	});

	$("#u-btn-addplace").click(function() {
		$("#modalAddPlace").modal();
	});

	$("#u-btn-updatewatch").click(function() {
		action.updateWeather();
	});
});