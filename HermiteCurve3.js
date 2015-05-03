
//	 Hermite interpolation from http://paulbourke.net/miscellaneous/interpolation/
//	 Tension: 1 is high, 0 normal, -1 is low
//	 Bias: 0 is even,
//		   positive is towards first segment,
//		   negative towards the other

THREE.Curve.Utils.hermiteInterpolate = function (
	y0, y1, y2, y3,
	mu,
	tension, bias)
{
	var m0,m1,mu2,mu3;
	var a0,a1,a2,a3;

	mu2 = mu * mu;
	mu3 = mu2 * mu;
	m0  = (y1-y0)*(1+bias)*(1-tension)/2;
	m0 += (y2-y1)*(1-bias)*(1-tension)/2;
	m1  = (y2-y1)*(1+bias)*(1-tension)/2;
	m1 += (y3-y2)*(1-bias)*(1-tension)/2;
	a0 =	 2*mu3 - 3*mu2 + 1;
	a1 =	   mu3 - 2*mu2 + mu;
	a2 =	   mu3 -   mu2;
	a3 = -2*mu3 + 3*mu2;

	return(a0*y1+a1*m0+a2*m1+a3*y2);
}

//based on SplineCurve3.js from Three.js
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