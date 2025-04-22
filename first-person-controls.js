/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 7;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lastMouseX = null;
	this.lastMouseY = null;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	//

	this.onWheel = function (event) {
		if (event.deltaY < 0)  {
			this.movementSpeed *= 1.1;
		}
		else {
			this.movementSpeed *= 0.9;
		}
	}

	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		// if ( this.activeLook ) {

		// 	switch ( event.button ) {

		// 		case 0: this.moveForward = true; break;
		// 		case 2: this.moveBackward = true; break;

		// 	}

		// }

		this.lastMouseX = null;
		this.lastMouseY = null;
		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		this.mouseX = 0;
		this.mouseY = 0;

		// if ( this.activeLook ) {

		// 	switch ( event.button ) {

		// 		case 0: this.moveForward = false; break;
		// 		case 2: this.moveBackward = false; break;

		// 	}

		// }

		this.lastMouseX = null;
		this.lastMouseY = null;
		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {
		if (!this.mouseDragOn) {
			this.mouseX = 0;
			this.mouseY = 0;
			return;
		}

		if (this.lastMouseX !== null && this.lastMouseY !== null) {
			this.mouseX = event.pageX - this.lastMouseX;
			this.mouseY = event.pageY - this.lastMouseY;
		}

		this.lastMouseX = event.pageX;
		this.lastMouseY = event.pageY;
	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.code ) {

			case 'KeyW': /*up*/
			case 'ArrowUp': /*W*/ this.moveForward = true; break;

			case 'KeyA': /*left*/
			case 'ArrowLeft': /*A*/ this.moveLeft = true; break;

			case 'KeyS': /*down*/
			case 'ArrowDown': /*S*/ this.moveBackward = true; break;

			case 'KeyD': /*right*/
			case 'ArrowRight': /*D*/ this.moveRight = true; break;

			case 'KeyR': /*R*/ this.moveUp = true; break;
			case 'KeyF': /*F*/ this.moveDown = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.code ) {

			case 'KeyW': /*up*/
			case 'ArrowUp': /*W*/ this.moveForward = false; break;

			case 'KeyA': /*left*/
			case 'ArrowLeft': /*A*/ this.moveLeft = false; break;

			case 'KeyS': /*down*/
			case 'ArrowDown': /*S*/ this.moveBackward = false; break;

			case 'KeyD': /*right*/
			case 'ArrowRight': /*D*/ this.moveRight = false; break;

			case 'KeyR': /*R*/ this.moveUp = false; break;
			case 'KeyF': /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {
		if ( this.enabled === false ) return;

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( !this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		// console.log('nan?', delta )
		// return;
		this.object.lookAt( targetPosition );

		this.mouseX = 0;
		this.mouseY = 0;

	};

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'wheel', bind( this, this.onWheel ), false );

	window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};
};
