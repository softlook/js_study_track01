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

	return __self;
}

var proxy = new PROXY();

function MODEL() {
	var __self = {};

	__self.data = [];

	__self.changeListners = { continents: [], countries: [], states: [] };

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

		// fire change event
		for (var x = 0; x < __self.changeListners.continents.length; x++) {
			__self.changeListners.continents[x](list);
		}
	};

	set_countries = function(continent, list) {
		// update continents
		var c = __self.data[continent];

		if (null === c) return;

		c.countries = [];

		for (var i = 0; i < list.length; i++) {
			c.countries.push({ nm: list[i], states: null });
		}

		// fire change event
		for (var x = 0; x < __self.changeListners.countries.length; x++) {
			__self.changeListners.countries[x](continent, list);
		}
	};

	set_states = function(continent, country, list) {
		// update continents
		var c;

		if (!__self.has_countries(continent) || !(c = __self.data[continent].countries[country])) return;

		c.states = [];

		for (var i = 0; i < list.length; i++) {
			c.states.push(list[i]);
		}

		// fire change event
		for (var x = 0; x < __self.changeListners.states.length; x++) {
			__self.changeListners.states[x](continent, country, list);
		}
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

	// {{ Event Handling

	__self.continentChanged = function(f) {
		__self.changeListners.continents.push(f);
	};

	__self.countryChanged = function(f) {
		__self.changeListners.countries.push(f);
	};

	__self.stateChanged = function(f) {
		__self.changeListners.states.push(f);
	};

	// }}

	return __self;
}

var model = new MODEL();

function UI() {
	var __self = {};

	// {{ Register Event Callback - data changed

	model.continentChanged(function(names) {
		var t = $("#u-continents");

		t.html(""); // clear list

		for (var i = 0; i < names.length; i++) {
			var nm = names[i];

			t.append("<li><a href='javascript:action.findCountries(" + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-cont-" + i + "' style='display:none'></ul></li>");
		}
	});

	model.countryChanged(function(continent, countries) {
		var t = $("#u-cont-" + continent);

		t.html(""); // clear list

		for (var i = 0; i < countries.length; i++) {
			var nm = countries[i];

			t.append("<li><a href='javascript:action.findStates(" + continent + ", " + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-st-" + continent + "-" + i + "' style='display:none'></ul></li>");
		}
	});

	model.stateChanged(function(continent, country, states) {
		var t = $("#u-st-" + continent + "-" + country);

		t.html(""); // clear list
		
		for (var i = 0; i < states.length; i++) {
			var s = states[i];

			t.append("<li><a href='javascript:action.showWeather(\"" + s.woeid + "\")'>" + s.name + "</a></li>");
		}
	});

	// }} Register Event Callback - data changed

	// {{ Draw

	__self.toggleTree = function(continent, country) {
		var t = ((undefined === country) ? $("#u-cont-" + continent) : $("#u-st-" + continent + "-" + country));
		t.css("display" , (("none" == t.css("display")) ? "block" : "none"));
	};

	// }} Draw

	return __self;
}

var ui = new UI();

function ACTION() {
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
		alert("[debug] try to find place '" + place + "'");
	};

	__self.showWeather = function(woeid) {
		alert("[debug] try to get weather forecast '" + woeid + "'");
	};

	return __self;
}

var action = new ACTION();

$(document).ready(function() {
	$("#u-btn-refresh").click(function() {
		action.findContinents();
	});

	$("#u-btn-search").click(function() {
		action.findPlace($("#keyword").val());
	});
});