'use strict';

var Fuego = Fuego || {}, data;

Fuego = {
	build: function () {
		// Fetch the SVG
		d3.xml('images/Blank_California_Map.svg', 'image/svg+xml', function (svg) {
			// Append to container
			document.querySelector('#map').appendChild(svg.documentElement);
			// Attach EventListener
			Fuego.countyStats();

			// Pull from Json
			Fuego._ignite()

		});
	},

	ignite: function () {
		// Fetch fire JSON from Heroku App
		d3.json('http://calfire-api.herokuapp.com/counties/', function (error, json) {
			if (error) return console.warn(error);
			data = json;
			// Color the SVG
			Fuego.paint(json);
		});
	},

	_ignite: function () {
		// Fetch fire JSON from Heroku App
		d3.json('http://0.0.0.0:3000/counties/', function (error, json) {
			if (error) return console.warn(error);
			data = json;
			// Color the SVG
			Fuego.paint(json);
		});
	},

	paint: function (objects) {
	  d3.selectAll('path, polyline, polygon')
	    .attr('fill', function(d) {
	      var abbr = this.id.toLowerCase().replace(/_/g,'-');
	      var fires;

			  objects.forEach(function (object) {
			  	if (object.county.slug == abbr) {
			  		fires = object.county.fires.length;
			  	}
			  });
			  return Fuego.getColor(fires);
		});
	},

	getColor: function (d) {
    return d > 12 ? '#800026' :
           d > 10  ? '#BD0026' :
           d > 8  ? '#E31A1C' :
           d > 6  ? '#FC4E2A' :
           d > 4   ? '#FD8D3C' :
           d > 2   ? '#FEB24C' :
           d > 1   ? '#FED976' :
           d > 0   ? '#FFEDA0' :
                      '#E2E2E2';
	},

	_responsive: function () {
		var map = $('#Map_of_the_counties_of_California'),
				aspect = map.width() / map.height(),
				container = map.parent();

		$(window).on('resize', function () {
			var targetWidth = container.width();
			map.attr('width', targetWidth);
			map.attr('height', Math.round(targetWidth / aspect));
		}).trigger('resize');
	},

	countyStats: function () {
		[].forEach.call(document.querySelectorAll('path, polyline, polygon'), function (e) {
			e.addEventListener('click', function () {
				console.log(this.id);
			}, false);
		});
	}
}

jQuery(document).ready(function($) {
	Fuego.build();
});