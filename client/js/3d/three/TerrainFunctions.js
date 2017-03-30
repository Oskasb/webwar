"use strict";

define([

    ],
    function(

    ) {


        var calcVec1;
        var calcVec2;


        var TerrainFunctions = function() {

            calcVec1 = new MATH.Vec3();
            calcVec2 = new MATH.Vec3();
        };



// get a height at point from matrix
        TerrainFunctions.prototype.getPointInMatrix = function(matrixData, y, x) {
            return matrixData[x][y];
        };

        TerrainFunctions.prototype.displaceAxisDimensions = function(axPos, axMin, axMax, quadCount) {
            var matrixPos = axPos-axMin;
            return quadCount*matrixPos/(axMax - axMin);
        };


        TerrainFunctions.prototype.returnToWorldDimensions = function(axPos, axMin, axMax, quadCount) {
            var quadSize = (axMax-axMin) / quadCount;
            var insidePos = axPos * quadSize;
            return axMin+insidePos;
        };


// get the value at the precise integer (x, y) coordinates
        TerrainFunctions.prototype.getAt = function(array1d, segments, x, y) {

            var yFactor = (y) * (segments+1);
            var xFactor = x;

            var idx = (yFactor + xFactor);
//    console.log(y, yFactor, xFactor, idx);
            return array1d[idx];
        };

        var p1  = {x:0, y:0, z:0};
        var p2  = {x:0, y:0, z:0};
        var p3  = {x:0, y:0, z:0};


        var points = [];

        var setTri = function(tri, x, y, z) {
            tri.x = x;
            tri.y = y;
            tri.z = z;
        };


        TerrainFunctions.prototype.getTriangleAt = function(array1d, segments, x, y) {

            var xc = Math.ceil(x);
            var xf = Math.floor(x);
            var yc = Math.ceil(y);
            var yf = Math.floor(y);

            var fracX = x - xf;
            var fracY = y - yf;

            p1.x = xf;
            p1.y = yc;

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

        var p0  = {x:0, y:0, z:0};

        var THREETri = new THREE.Triangle();

        TerrainFunctions.prototype.getPreciseHeight = function(array1d, segments, x, z, normalStore, htN, htP) {
            var tri = this.getTriangleAt(array1d, segments, x, z);

            setTri(p0, x, z, 0);

            var find = MATH.barycentricInterpolation(tri[0], tri[1], tri[2], p0);


            if (normalStore) {

                tri[0].x = this.returnToWorldDimensions(tri[0].x, htN, htP, segments);
                tri[0].y = this.returnToWorldDimensions(tri[0].y, htN, htP, segments);
                tri[1].x = this.returnToWorldDimensions(tri[1].x, htN, htP, segments);
                tri[1].y = this.returnToWorldDimensions(tri[1].y, htN, htP, segments);
                tri[2].x = this.returnToWorldDimensions(tri[2].x, htN, htP, segments);
                tri[2].y = this.returnToWorldDimensions(tri[2].y, htN, htP, segments);

                calcVec1.setXYZ((tri[1].x-tri[0].x), (tri[1].z-tri[0].z), (tri[1].y-tri[0].y));
                calcVec2.setXYZ((tri[2].x-tri[0].x), (tri[2].z-tri[0].z), (tri[2].y-tri[0].y));

            //    THREETri.a.set(tri[0].x, tri[0].y, tri[0].z);
            //    THREETri.c.set(tri[1].x, tri[1].y, tri[1].z);
            //    THREETri.b.set(tri[2].x, tri[2].y, tri[2].z);

            //    THREETri.normal(normalStore);
                calcVec1.crossVec(calcVec2);
                if (calcVec1.data[1] < 0) {
                    calcVec1.invert();
                }

                calcVec1.normalize();

                //    if (calcVec1.data[1] != 1) {
                //        console.log(calcVec1.data);
                //    }

                normalStore.x = calcVec1.getX();
                normalStore.y = calcVec1.getY();
                normalStore.z = calcVec1.getZ();
            }

            return find.z;
        };


        TerrainFunctions.prototype.getDisplacedHeight = function(array1d, segments, x, z, htP, htN, normalStore) {
            var tx = this.displaceAxisDimensions(x, htN, htP, segments);
            var tz = this.displaceAxisDimensions(z, htN, htP, segments);

            return this.getPreciseHeight(array1d, segments, tx, tz, normalStore, htN, htP);

        };


        TerrainFunctions.prototype.getHeightAt = function(pos, array1d, terrainSize, segments, normalStore) {

            var htP = terrainSize;
            var htN = 0;

            if (pos.x < htN || pos.x > htP || pos.z < htN || pos.z > htP) {

                console.log("Terrain!", pos.x, pos.z, "Is Outside")
                //    return -1000;
                pos.x = MATH.clamp(pos.x, htN, htP);
                pos.z = MATH.clamp(pos.z, htN, htP);
            }

            return this.getDisplacedHeight(array1d, segments, pos.x, pos.z, htP, htN, normalStore);
        };

        return TerrainFunctions;

    });