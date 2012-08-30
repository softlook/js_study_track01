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
		})
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
		})
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
		})
	}

	return __self;
}

var proxy = new PROXY();

function UI() {
	var __self = {}; 

	__self.renderContinents = function(names, argx) {
		var t = $("#u-continents");

		t.html(""); // clear list

		for (var i = 0; i < names.length; i++) {
			var nm = names[i];

			t.append("<li><a href='javascript:action.findCountries(\"u-cont-" + i + "\", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-cont-" + i + "'></ul></li>");
		}
	}

	__self.renderCountries = function(names, argx) {
		var t = $("#" + argx.id);

		t.html(""); // clear list

		for (var i = 0; i < names.length; i++) {
			var nm = names[i];

			t.append("<li><a href='javascript:action.findStates(\"u-st-" + i + "\", \"" + nm + "\")'>" + nm + "</a>" +
				"<ul id='u-st-" + i + "'></ul></li>");
		}
	}

	__self.renderStates = function(states, argx) {
		var t = $("#" + argx.id);

		t.html(""); // clear list
		
		for (var i = 0; i < states.length; i++) {
			var s = states[i];

			t.append("<li><a href='javascript:action.showWeather(\"" + s.woeid + "\")'>" + s.name + "</a></li>");
		}
	}

	return __self;
}

var ui = new UI();

function ACTION() {
	var __self = {};

	__self.findContinents = function(name) {
		proxy.continents(name, {}, ui.renderContinents);
	}

	__self.findCountries = function(idx, continent) {
		proxy.countries(continent, { id: idx }, ui.renderCountries);
	}

	__self.findStates = function(idx, country) {
		proxy.states(country, { id: idx }, ui.renderStates);
	}

	__self.findPlace = function(place) {
		alert("[debug] try to find place '" + place + "'");
	}

	__self.showWeather = function(woeid) {
		alert("[debug] try to get weather forecast '" + woeid + "'");
	}

	return __self;
}

var action = new ACTION();

$(document).ready(function() {
	$("#u-btn-refresh").click(function() {
		action.findContinents("");
	});

	$("#u-btn-search").click(function() {
		action.findPlace($("#keyword").val());
	});
});