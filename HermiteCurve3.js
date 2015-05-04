//based on http://paulbourke.net/miscellaneous/interpolation/
//tension: 1 high, 0 normal, -1 low
//bias: 0 is even, positive is towards first segment, negative towards the other

THREE.Curve.Utils.hermiteInterpolate = function (p0, p1, p2, p3, t, tension, bias) {
	var m0 = (p1 - p0) * (1 + bias) * (1 - tension) / 2 
	       + (p2 - p1) * (1 - bias) * (1 - tension) / 2;
	
	var m1 = (p2 - p1) * (1 + bias) * (1 - tension) / 2 
	       + (p3 - p2) * (1 - bias) * (1 - tension) / 2;

	var t2 = t * t;
	var t3 = t2 * t;

	var h0 = 2 * t3 - 3 * t2 + 1;
	var h1 = t3 - 2 * t2 + t;
	var h2 = t3 - t2;
	var h3 = -2 * t3 + 3 * t2;

	return h0 * p1 + h1 * m0 + h2 * m1 + h3 * p2;
};

//based on SplineCurve3.js
//

THREE.HermiteCurve3 = THREE.Curve.create(
	function ( points, tension, bias ) { //custom curve constructor
		this.points = ( points == undefined ) ? [] : points;
		this.tension = ( tension == undefined ) ? 0.0 : tension;
		this.bias = ( bias == undefined ) ? 0.0 : bias;
	},
	
	function ( t ) { //getPoint: t is between 0-1
	
		var points = this.points;
		var point = ( points.length - 1 ) * t;
		
		var intPoint = Math.floor( point );
		var weight = point - intPoint;
		
		var point0 = points[ intPoint == 0 ? intPoint : intPoint - 1 ];
		var point1 = points[ intPoint ];
		var point2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];
		var point3 = points[ intPoint > points.length - 3 ? points.length - 1 : intPoint + 2 ];
		
		var vector = new THREE.Vector3();
		
		vector.x = THREE.Curve.Utils.hermiteInterpolate( point0.x, point1.x, point2.x, point3.x, weight, this.tension, this.bias );
		vector.y = THREE.Curve.Utils.hermiteInterpolate( point0.y, point1.y, point2.y, point3.y, weight, this.tension, this.bias );
		vector.z = THREE.Curve.Utils.hermiteInterpolate( point0.z, point1.z, point2.z, point3.z, weight, this.tension, this.bias );
		
		return vector;
	}
);