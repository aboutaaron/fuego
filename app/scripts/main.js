'use strict';

var Fuego = Fuego || {}, data;

Fuego = {

	settings: {
		width: 2160,
		height: 1160,
		center: [-0.6, 38.7],
		rotate: [104, -3, -15],
		scale: 5000
	},

	map: {
		svg: '',
		projection: '',
		path: ''
	},

	createSVG: function () {
		var s = Fuego.settings
		var m = Fuego.map;

		// Fetch the SVG
		m.svg = d3.select('body').append('svg')
			.attr('class', 'background')
			.attr('width', s.width)
			.attr('height', s.height);

		m.projection = d3.geo.albers()
				.center(s.center)
				.rotate(s.rotate)
				.scale(s.scale)
				.translate([s.width / 2, s.height / 2]);

		m.path = d3.geo.path()
				.projection(m.projection);
	},

	build: function () {
		var m = Fuego.map;
		Fuego.createSVG();

		d3.json('json/usa_states_ca_counties.json', function (error, json) {
			console.log(json.objects.counties_ca);
			var california = topojson.feature(json, json.objects.counties_ca);
			var usa = topojson.feature(json, json.objects.states_all);

			m.svg.append('path')
				.datum(usa)
				.attr('fill', '#626262')
				.attr('d', m.path);

			m.svg.selectAll('.county')
					.data(california.features)
				.enter().append('path')
					.attr('id', function(d) { 
						return d.properties.name.toLowerCase().replace(/\s/g,'-') 
					})
					.attr('class', 'county')
					.attr('d', m.path)
		});

		Fuego.ignite();
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

	paint: function (objects) {
	  d3.selectAll('.county')
	    .attr('fill', function(d) {
	    	var abbr = this;
	      var fires;

			  objects.forEach(function (object) {
			  	if (object.county.slug == abbr.id) {
			  		fires = object.county.fires.length;
			  		//console.log(abbr);
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
		d3.select('g').attr('transform', 'scale(' + $('#map').width()/900 + ')');
		$('svg').height($('#map').width()*0.618);
	}
}

jQuery(document).ready(function($) {
	Fuego.build();
});