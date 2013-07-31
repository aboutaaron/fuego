'use strict';

var Fuego = Fuego || {}, data;

Fuego = {

	settings: {
		// d3 map vars
		svg: '',
		projection: '',
		path: '',

		// map projection settins
		width: 400,
		height: 800,
		centered: '',
		rotate: [119,0], // Longitude
		center: [0, 36], // Latitude
		scale: 4000, //4700
		translate: [380, 450],
		parallels: [29.5, 45.5],

		// debug mode
		debug: false
	},

	createSVG: function () {
		var s = Fuego.settings;

		// Fetch the SVG
		s.svg = d3.select('.map')
			.append('svg')
			.append('g')
			.attr('width', s.width)
			.attr('height', s.height);

		s.projection = d3.geo.albers()
				.scale(s.scale)
				.rotate(s.rotate)
				.center(s.center)
				.translate(s.translate);

		s.path = d3.geo.path()
				.projection(s.projection);
	},

	build: function () {
		var s = Fuego.settings;

		Fuego.createSVG();
		// https://s3-us-west-1.amazonaws.com/fuego-assets/usa_states_ca_counties.json
		d3.json('scripts/json/usa_states_ca_counties.json', function (error, json) {
			console.log(json.objects.counties_ca);
			var california = topojson.feature(json, json.objects.counties_ca);

			s.svg.selectAll('.county')
					.data(california.features)
				.enter().append('path')
					.attr('id', function(d) {
						return d.properties.name.toLowerCase().replace(/\s/g,'-');
					})
					.attr('class', 'county')
					.attr('d', s.path)
					.on("click", Fuego.clicked);
		});

		Fuego.ignite();
	},

	ignite: function () {
		// Fetch fire JSON from Heroku App
		d3.json('http://calfire-api.herokuapp.com/counties/', function (error, json) {
			if (error) { return console.warn(error); }
			data = json;
			// Color the SVG
			Fuego.paint(json);
			// Build templates
			Fuego.templatize(json);
		});
	},

	paint: function (objects) {
		d3.selectAll('.county')
			.attr('fill', function () {
				var abbr = this;
				var fires;

				objects.forEach(function (object) {
					if (object.county.slug === abbr.id) {
						fires = object.county.fires.length;
					}
				});
				return Fuego.getColor(fires);
		    }
      );
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
		d3.select('g').attr('transform', 'scale('+$('.map').width()/700+')');
		$('svg').height($('.map').width());
	},

	templatize: function (data) {
		var source = $('#counties-template').html();
		var template = Handlebars.compile(source);
		$('.info').html(template({objects:data}))
	},

	clicked: function () {
		//d3.select(this).style('stroke', '#0AA0CC');
		var abbr = this.id,
				county, noFire;
		data.forEach(function (object) {
			if (object.county.slug === abbr) {
				Fuego.templatize(object);
			}
		});
	},

	debug: function() {
		var s = Fuego.settings;
		if (s.debug === true) {
			// load map with usa and california
			d3.json('scripts/json/usa_states_ca_counties.json', function (json) {
				// Load usa map
				var california = topojson.feature(json, json.objects.counties_ca);
				s.svg.append('path')
					.datum(topojson.feature(json, json.objects.states_all))
						.attr('fill', '#222')
						.attr('d', s.path);
				s.svg.append('path')
					.datum(california)
						.attr('fill', '#eee')
						.attr('d', s.path);
			});
			// put a border around the map container to see the bounds
			document.querySelector('.map').style.border = '1px solid red';
			// log the current settings
			console.log('Current settings:')
			console.log(s)

		} else {
			console.warn('The debug property in settings is set to false. Set Fuego.settings.debug = true and return the function');
		}
	}
};

jQuery(document).ready(function () {
	Fuego.build();
});