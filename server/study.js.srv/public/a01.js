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

	// {{ Data Operation

	__self.set_continents = function(list) {
		// update continents
		__self.data = [];

		for (var i = 0; i < list.length; i++) {
			__self.data.push({ nm: list[i], countries: null });
		}
	};

	__self.set_countries = function(continent, list) {
		// update continents
		var c = __self.data[continent];

		if (null === c) return;

		c.countries = [];

		for (var i = 0; i < list.length; i++) {
			c.countries.push({ nm: list[i], states: null });
		}
	};

	__self.set_states = function(continent, country, list) {
		// update continents
		var c;

		if (!__self.has_countries(continent) || !(c = __self.data[continent].countries[country])) return;

		c.states = [];

		for (var i = 0; i < list.length; i++) {
			c.states.push(list[i]);
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

	return __self;
}

var model = new MODEL();

function UI() {
	var __self = {};

	// {{ Render Tree

	__self.renderContinents = function(names) {
		var t = $("#u-continents");

		t.html(""); // clear list

		for (var i = 0; i < names.length; i++) {
			var nm = names[i];

			t.append("<li><a href='javascript:action.findCountries(" + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-cont-" + i + "' style='display:none'></ul></li>");
		}
	};

	__self.renderCountries = function(continent, countries) {
		var t = $("#u-cont-" + continent);

		t.html(""); // clear list

		for (var i = 0; i < countries.length; i++) {
			var nm = countries[i];

			t.append("<li><a href='javascript:action.findStates(" + continent + ", " + i + ", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-st-" + continent + "-" + i + "' style='display:none'></ul></li>");
		}
	};

	__self.renderStates = function(continent, country, states) {
		var t = $("#u-st-" + continent + "-" + country);

		t.html(""); // clear list
		
		for (var i = 0; i < states.length; i++) {
			var s = states[i];

			t.append("<li><a href='javascript:action.showWeather(\"" + s.woeid + "\")'>" + s.name + "</a></li>");
		}
	};

	// }} Render Tree

	// {{ Draw

	__self.showTree = function(continent, country) {
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
			proxy.continents(name, {}, function(list, argx) {
				model.set_continents(list);
				ui.renderContinents(list);
			});
	};

	__self.findCountries = function(continent, name) {
		ui.showTree(continent);

		if (false === model.has_countries(continent))
			proxy.countries(name, { continent: continent }, function(list, argx) {
				model.set_countries(argx.continent, list);
				ui.renderCountries(argx.continent, list);
			});
	};

	__self.findStates = function(continent, country, name) {
		ui.showTree(continent, country);

		if (false === model.has_states(continent, country))
			proxy.states(name, { continent: continent, country: country }, function(list, argx) {
				model.set_states(argx.continent, argx.country, list);
				ui.renderStates(argx.continent, argx.country, list);
			});
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