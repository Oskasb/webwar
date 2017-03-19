if(typeof(MATH) == "undefined"){
	MATH = {};
}

(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

(function(MATH){

	var blend = 0;
	var i = 0;

	MATH.TWO_PI = 2.0 * Math.PI;

	MATH.curves = {
		"constantOne":  [[0, 1], [1, 1]],
		"zeroToOne":    [[0, 0], [1, 1]],
		"oneToZero":    [[0, 1], [1, 0]],
		"quickFadeOut": [[0, 1], [0.9,1], [1,   0]],
		"quickFadeIn":  [[0, 0], [0.2,1], [1,   1]],
		"attackIn":     [[0, 1], [0.1,0], [1,   0]],
		"centerStep":   [[0, 0], [0.25,0],[0.75,1], [1, 0]],
		"quickInOut":   [[0, 0], [0.1,1], [0.9, 1], [1, 0]],
		"posToNeg":     [[0, 1], [1,-1]],
		"negToPos":     [[0,-1], [1, 1]],
		"zeroOneZero":  [[0, 0], [0.5,1], [1,  0]],
		"oneZeroOne":   [[0, 1], [0.5,0], [1,  1]],
		"growShrink":   [[0, 1], [0.5,0], [1, -2]],
		"shrink":   	[[0, -0.3], [0.3, -1]]
	};

	MATH.CurveState = function(curve, amplitude) {
		this.curve = curve || MATH.curves.oneToZero;
		this.amplitude = amplitude || 1;
		this.fraction = 0;
		this.value = 0
	};

	MATH.CurveState.prototype.setAmplitude = function(value) {
		this.amplitude = value;
	};

	MATH.CurveState.prototype.setCurve = function(curve) {
		this.curve = curve;
	};

	MATH.CurveState.prototype.amplitudeFromFraction = function(fraction) {
		this.fraction = fraction;
		this.value = MATH.valueFromCurve(this.fraction * (this.curve.length-1), this.curve);
		return this.amplitude*this.value;
	};

	MATH.interpolateFromTo = function(start, end, fraction) {
		return start + (end-start)*fraction;
	};

	MATH.calcFraction = function(start, end, current) {
		return (current-start) / (end-start);
	};


	MATH.valueIsBetween = function(value, min, max) {
		if (value > min && value < max) {
			return true;
		} else {
			return false;
		}
	};


	MATH.remainder = function(float) {
		return float - (Math.floor(float)) 	
	};
	
	MATH.randomBetween = function(min, max) {
		return min + Math.random() * (max-min);
	};

	MATH.nearestHigherPowerOfTwo = function (value) {
		return Math.floor(Math.pow(2, Math.ceil(Math.log(value) / Math.log(2))));
	};
	
	MATH.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
		return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
	};


	MATH.triangleArea = function (t1, t2, t3) {
		return Math.abs(t1.x * t2.y + t2.x * t3.y + t3.x * t1.y
				- t2.y * t3.x - t3.y * t1.x - t1.y * t2.x) / 2;
	};


	MATH.barycentricInterpolation = function (t1, t2, t3, p) {
		var t1Area = this.triangleArea(t2, t3, p);
		var t2Area = this.triangleArea(t1, t3, p);
		var t3Area = this.triangleArea(t1, t2, p);

		// assuming the point is inside the triangle
		var totalArea = t1Area + t2Area + t3Area;
		if (!totalArea) {

			if (p[0] === t1[0] && p[2] === t1[2]) {
				return t1;
			} else if (p[0] === t2[0] && p[2] === t2[2]) {
				return t2;
			} else if (p[0] === t3[0] && p[2] === t3[2]) {
				return t3;
			}
		}

		p.z = (t1Area * t1.z + t2Area * t2.z + t3Area * t3.z) / totalArea;
		return p;
	};

	MATH.getAt = function(array1d, segments, x, y) {

		var yFactor = (y) * (segments+1);
		var xFactor = x;

		var idx = (yFactor + xFactor);
//    console.log(y, yFactor, xFactor, idx);
		return array1d[idx];
	};

	var p1  = {x:0, y:0, z:0};
	var p2  = {x:0, y:0, z:0};
	var p3  = {x:0, y:0, z:0};


	var setTri = function(tri, x, y, z) {
		tri.x = x;
		tri.y = y;
		tri.z = z;
	};
	
	
	
	var points = []

	MATH.getTriangleAt = function(array1d, segments, x, y) {

		var xc = Math.ceil(x);
		var xf = Math.floor(x);
		var yc = Math.ceil(y);
		var yf = Math.floor(y);

		var fracX = x - xf;
		var fracY = y - yf;



		p1.x = xf;
		p1.y = yc;

		//   console.log(xf, yc);
		p1.z = this.getAt(array1d, segments, xf, yc);


		setTri(p1, xf, yc, this.getAt(array1d, segments,xf, yc));
		setTri(p2, xc, yf, this.getAt(array1d, segments,xc, yf));


		if (fracX < 1-fracY) {
			setTri(p3,xf,yf,this.getAt(array1d, segments,xf, yf));
		} else {
			setTri(p3, xc, yc, this.getAt(array1d, segments,xc, yc));
		}

		points[0] = p1;
		points[1] = p2;
		points[2] = p3;
		return points;
	};

	MATH.valueFromCurve = function(value, curve) {
		for (i = 0; i < curve.length; i++) {
			if (!curve[i+1]) {
			//	console.log("Curve out end value", value, curve.length-1, curve[curve.length-1][1]);
				return curve[curve.length-1][1];

			}
			if (curve[i+1][0] > value) return MATH.getInterpolatedInCurveAboveIndex(value, curve, i)
		}
		console.log("Curve out of bounds", curve.length-1 , value);
		return curve[curve.length-1][1];
	};

	MATH.blendArray = function(from, to, frac, store) {
		for (i = 0; i < store.length; i++) {
			store[i] = (1-frac)*from[i] + frac*to[i];
		}
	};
	
	MATH.curveBlendArray = function(value, curve, from, to, store) {
		blend = MATH.valueFromCurve(value, curve);
		MATH.blendArray(from, to, blend, store);
	};
	
	MATH.moduloPositive = function (value, size) {
		var wrappedValue = value % size;
		wrappedValue += wrappedValue < 0 ? size : 0;
		return wrappedValue;
	};

    MATH.nearestAngle = function(angle) {
        if (angle > Math.PI) {
            angle -= MATH.TWO_PI;
        } else if (angle < 0) {
            angle += MATH.TWO_PI;
        }
        return angle;
    };

	MATH.lineDistance = function(fromX, fromY, toX, toY) {
		return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
	};

	MATH.sillyRandom = function(seed) {
		return MATH.remainder(Math.sin(seed) * 9999.991 + Math.cos(seed));
	};

	MATH.angleInsideCircle = function(angle) {
		if (angle < 0) angle+= MATH.TWO_PI;
		if (angle > MATH.TWO_PI) angle-= MATH.TWO_PI;
		return angle;
	};

	MATH.subAngles = function(a, b) {
		return Math.atan2(Math.sin(a-b), Math.cos(a-b));
	};
	
	MATH.radialLerp = function(a, b, w) {
		var cs = (1-w)*Math.cos(a) + w*Math.cos(b);
		var sn = (1-w)*Math.sin(a) + w*Math.sin(b);
		return Math.atan2(sn,cs);
	};

	MATH.addAngles = function(a, b) {
		return Math.atan2(Math.sin(MATH.nearestAngle(a+b)), Math.cos(MATH.nearestAngle(a+b)));
	};
	
	MATH.radialToVector = function(angle, distance, store) {
		store.data[0] = Math.cos(angle)*distance;
		store.data[2] = Math.sin(angle)*distance;
	};
	
	MATH.vectorXZToAngleAxisY = function(vec) {
		return Math.atan2(vec.getX(), vec.getZ()) + Math.PI;;
	};

	MATH.vectorXYToAngleAxisZ = function(vec) {
		return Math.atan2(vec.getX(), vec.getY()) + Math.PI*0.5;
	};

	MATH.vectorYZToAngleAxisX = function(vec) {
		return Math.atan2(vec.getY(), vec.getZ()) + Math.PI;
	};
	
	
	MATH.applyNormalVectorToPitch = function(normalVec, upVec) {
		upVec.setX(MATH.subAngles(upVec.getX() - normalVec.getX()));
	};

	MATH.applyNormalVectorToRoll = function(normalVec, tiltVec) {
		tiltVec.setZ(MATH.subAngles(tiltVec.getZ(), normalVec.getZ()));
	};

	
	MATH.radialClamp = function(value, min, max) {

		var zero = (min + max)/2 + ((max > min) ? Math.PI : 0);
		var _value = MATH.moduloPositive(value - zero, MATH.TWO_PI);
		var _min = MATH.moduloPositive(min - zero, MATH.TWO_PI);
		var _max = MATH.moduloPositive(max - zero, MATH.TWO_PI);

		if (value < 0 && min > 0) { min -= MATH.TWO_PI; }
		else if (value > 0 && min < 0) { min += MATH.TWO_PI; }
		if (value > MATH.TWO_PI && max < MATH.TWO_PI) { max += MATH.TWO_PI; }

		return _value < _min ? min : _value > _max ? max : value;
	};

    MATH.clamp = function(value, min, max) {
        return value < min ? min : value > max ? max : value;
    };

	MATH.Vec3 = function(x,y,z){
		this.data = new Float32Array([x,y,z]);
	};

	MATH.Vec3.prototype.setXYZ = function(x, y, z) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
		return this;
	};

	MATH.Vec3.prototype.lerp = function(towardsVec, fraction) {
		MATH.blendArray(this.data, towardsVec.data, fraction, this.data);
		return this;
	};


	MATH.Vec3.prototype.setX = function(x) {
		this.data[0] = x;
		return this;
	};

	MATH.Vec3.prototype.setY = function(y) {
		this.data[1] = y;
		return this;
	};

	MATH.Vec3.prototype.setZ = function(z) {
		this.data[2] = z;
		return this;
	};

	MATH.Vec3.prototype.getX = function() {
		return this.data[0];
	};

	MATH.Vec3.prototype.getY = function() {
		return this.data[1];
	};

	MATH.Vec3.prototype.getZ = function() {
		return this.data[2];
	};

	MATH.Vec3.prototype.getArray = function(array) {
		array[0] = this.data[0];
		array[1] = this.data[1];
		array[2] = this.data[2];
	};

	MATH.Vec3.prototype.setArray = function(data) {
		this.data[0] = data[0];
		this.data[1] = data[1];
		this.data[2] = data[2];
		return this;
	};

	MATH.Vec3.prototype.setVec = function(vec3) {
		this.data[0] = vec3.data[0];
		this.data[1] = vec3.data[1];
		this.data[2] = vec3.data[2];
		return this;
	};

	MATH.Vec3.prototype.addVec = function(vec3) {
		this.data[0] += vec3.data[0];
		this.data[1] += vec3.data[1];
		this.data[2] += vec3.data[2];
		return this;
	};

	MATH.Vec3.prototype.addXYZ = function(x, y, z) {
		this.data[0] += x;
		this.data[1] += y;
		this.data[2] += z;
		return this;
	};
	
	MATH.Vec3.prototype.subVec = function(vec3) {
		this.data[0] -= vec3.data[0];
		this.data[1] -= vec3.data[1];
		this.data[2] -= vec3.data[2];
		return this;
	};

	MATH.Vec3.prototype.interpolateFromTo = function(start, end, fraction) {
		calcVec3.setVec(end);
		calcVec3.subVec(start).scale(fraction);
		this.setVec(start).addVec(calcVec3);
		return this;
	};

	MATH.Vec3.prototype.rotateZ = function(angZ) {
		var cs = Math.cos(angZ);
		var sn = Math.sin(angZ);
		this.setXYZ(this.data[0] * cs - this.data[1] * sn, this.data[0] * sn + this.data[1] * cs, this.data[2]);
		return this;		
	};

	MATH.Vec3.prototype.rotateY = function(ang) {
		var cs = Math.cos(ang);
		var sn = Math.sin(ang);
		this.setXYZ(this.data[0] * cs - this.data[2] * sn, this.data[1], this.data[0] * sn + this.data[2] * cs);
		return this;
	};

	MATH.Vec3.prototype.rotateX = function(ang) {
		var cs = Math.cos(ang);
		var sn = Math.sin(ang);
		this.setXYZ(this.data[0], this.data[1] * cs - this.data[2] * sn, this.data[0] * sn + this.data[2] * cs);
		return this;
	};
	
	MATH.Vec3.prototype.radialLerp = function(start, end, frac) {
		this.data[0] = MATH.radialLerp(start.data[0], end.data[0], frac);
		this.data[1] = MATH.radialLerp(start.data[1], end.data[1], frac);
		this.data[2] = MATH.radialLerp(start.data[2], end.data[2], frac);
	};


	MATH.Vec3.prototype.scale = function(scale) {
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
		return this;
	};

	MATH.Vec3.prototype.invert = function() {
		this.data[0] *= -1;
		this.data[1] *= -1;
		this.data[2] *= -1;
		return this;
	};
	
    MATH.Vec3.prototype.dotVec = function(vec3) {
        return this.data[0] * vec3.data[0] + this.data[1] * vec3.data[1] + this.data[2] * vec3.data[2];

    };

	MATH.Vec3.prototype.crossVec = function(vec3) {
		this.setXYZ(
            vec3.data[2] * this.data[1] - vec3.data[1] * this.data[2],
		    vec3.data[0] * this.data[2] - vec3.data[2] * this.data[0],
		    vec3.data[1] * this.data[0] - vec3.data[0] * this.data[1]
        )
	};


	MATH.Vec3.prototype.normalize = function () {
		var l = this.getLength();

		if (l < 0.0000001) {
			this.data[0] = 0;
			this.data[1] = 0;
			this.data[2] = 0;
		} else {
			l = 1.0 / l;
			this.data[0] *= l;
			this.data[1] *= l;
			this.data[2] *= l;
		}

		return this;
	};
	
    MATH.Vec3.prototype.mulVec = function(vec3) {
        this.data[0] *= vec3.data[0];
        this.data[1] *= vec3.data[1];
        this.data[2] *= vec3.data[2];

        return this;
    };

	MATH.Vec3.prototype.getLength = function() {
		return Math.sqrt(this.dotVec(this));
	};

    MATH.Vec3.prototype.getLengthSquared = function() {
        return this.dotVec(this);
    };

	MATH.Vec3.prototype.getDistanceSquared = function(vec3) {
		var x = this.data[0] - vec3.data[0],
			y = this.data[1] - vec3.data[1],
			z = this.data[2] - vec3.data[2];
		return x * x + y * y + z * z;
	};

	MATH.Vec3.prototype.getDistance = function(vec3) {
		return Math.sqrt((this.getDistanceSquared(vec3)));
	};
	
	MATH.Vec3.prototype.getLength = function() {
		return Math.sqrt((this.data[0] * this.data[0]) + (this.data[1] * this.data[1]) + (this.data[2] * this.data[2]));
	};

	var calcVec3 = new MATH.Vec3(0, 0, 0);

	MATH.AXIS_Y = new MATH.Vec3(0, 1, 0);
	MATH.tempVec = new MATH.Vec3(0, 0, 0);
	MATH.tempNormal = new MATH.Vec3(0, 1, 0)

})(MATH);