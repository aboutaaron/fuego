'use strict';

var Fuego = Fuego || {}, data;

Fuego = {

	settings: {
		width: 400,
		height: 800,
		centered: '',
		center: [-0.6, 38.7],
		rotate: [104, -3, -15],
		scale: 4700,
		translate: [1890, 530]
	},

	map: {
		svg: '',
		projection: '',
		path: ''
	},

	createSVG: function () {
		var s = Fuego.settings;
		var m = Fuego.map;

		// Fetch the SVG
		m.svg = d3.select('.map')
			.append('svg')
			.append('g')
			.attr('width', s.width)
			.attr('height', s.height);

		m.projection = d3.geo.albers()
				.parallels([29.5, 45.5])
				.scale(s.scale)
				.translate(s.translate);

		m.path = d3.geo.path()
				.projection(m.projection);
	},

	build: function () {
		var m = Fuego.map;

		Fuego.createSVG();
		// https://s3-us-west-1.amazonaws.com/fuego-assets/usa_states_ca_counties.json
		d3.json('scripts/json/usa_states_ca_counties.json', function (error, json) {
			console.log(json.objects.counties_ca);
			var california = topojson.feature(json, json.objects.counties_ca);
			var usa = topojson.feature(json, json.objects.states_all);

			m.svg.append('path')
				.datum(usa)
				.attr('fill', '#222')
				.attr('d', m.path);

			m.svg.selectAll('.county')
					.data(california.features)
				.enter().append('path')
					.attr('id', function(d) {
						return d.properties.name.toLowerCase().replace(/\s/g,'-');
					})
					.attr('class', 'county')
					.attr('d', m.path)
					.on("click", Fuego.clicked());
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
		d3.select('g').attr('transform', 'scale('+$('.map').width()/900+')');
		$('svg').height($('.map').width());
	},

	clicked: function (d) {
		var x, y, k;
		var s = Fuego.settings;

		if (d && s.centered !== d) {
			var centroid = s.path.centroid(d);
			x = centroid[0];
			y = centroid[1];
			k = 4;
			s.centered = d;
		} else {
			x =  s.width / 2;
			y = s.height / 2;
			k = 1;
			s.centered = null;
		}
		d3.selectAll('.county')
			.classed('active', s.centered && function(d) { return d === s.centered; });

		d3.select('g').transition()
			.duration(750)
			.attr('transform', "translate(" + s.width / 2 + "," + s.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
			.style('stroke-width', 1.5 / k + 'px');

	}
};

jQuery(document).ready(function () {
	Fuego.build();
});