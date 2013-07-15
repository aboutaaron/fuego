'use strict';

var Fuego = Fuego || {}, data, topo;

Fuego = {
	init: function () {
		Fuego.fetch();
	},

	fetch: function () {
		d3.json('http://calfire-api.herokuapp.com/counties/', function (error, json) {
			if (error) return console.warn(error);
			data = json;
			Fuego.paint(json);
		});
		var width = 960,
				height = 1160;

		var svg = d3.select('#map').append('svg')
				.attr('width', width)
				.attr('height', height);

		d3.json('/json/counties.json', function (error, counties) {
			topo = counties;
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
	}
}

jQuery(document).ready(function($) {
	Fuego.init();
});