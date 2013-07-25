'use strict';

var Fuego = Fuego || {}, data;

Fuego = {

	settings: {
		width: 1160,
		height: 800,
		center: [-0.6, 38.7],
		rotate: [104, -3, -15],
		scale: 2696
	},

	map: {
		svg: '',
		projection: '',
		path: '',
		force: ''
	},

	createSVG: function () {
		var s = Fuego.settings
		var m = Fuego.map;

		// Fetch the SVG
		m.svg = d3.select('.container')
			.append('svg')
			.append('g')
			.attr('width', s.width)
			.attr('height', s.height);

		m.projection = d3.geo.albers()
				//.center([37.37, -122.23])
				//.rotate(s.rotate)
				.parallels([29.5, 45.5])
				.scale(1200)
				.translate([480, 350]);

		m.path = d3.geo.path()
				.projection(m.projection);
		m.force = d3.layout.force().size([s.width, s.height]);
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

		Fuego._devIgnite();
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

	_devIgnite: function () {
		// Fetch fire JSON
		d3.json('http://0.0.0.0:3000/counties/', function (error, json) {
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
		d3.select(window)
				.on('resize', Fuego._responsive);
		d3.select('g').attr('transform', 'scale('+$('.container').width()/900+')');
		$('svg').height($('.container').width()*0.618);
	}
}

jQuery(document).ready(function($) {
	Fuego.build();
});