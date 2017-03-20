var THREE = require('three');

var calcVec1;
var calcVec2;
var CannonAPI;
var iWeightCurve;
var jWeightCurve;

TerrainFunctions = function(CNNAPI) {
    this.CannonAPI = CNNAPI;
    CannonAPI = CNNAPI;
    calcVec1 = new MATH.Vec3();
    calcVec2 = new MATH.Vec3();

    iWeightCurve = new MATH.CurveState(MATH.curves['zeroOneZero'], 1);
    jWeightCurve = new MATH.CurveState(MATH.curves['zeroOneZero'], 1);

};



TerrainFunctions.prototype.getPieceTerrainModule = function(piece) {
    return piece.getModuleByIndex(0);
};

TerrainFunctions.prototype.getTerrainSegmentse = function(module) {
    return module.data.applies.terrain_segments;
};

TerrainFunctions.prototype.getTerrainModuleSize = function(module) {
    return module.data.applies.terrain_size;
};

TerrainFunctions.prototype.getTerrainModuleEdges = function(applies) {
    return {
        invert: applies.invert_hill,
        edgeSize: applies.terrain_edge_size,
        easingFunc:applies.edge_easing
    }
};

TerrainFunctions.prototype.getTerrainModuleOpts = function(applies) {
    return {
        after: null,
        easing: THREE.Terrain.EaseInOut,
        heightmap: THREE.Terrain.DiamondSquare,
        material: null,
        maxHeight: applies.max_height,
        minHeight: applies.min_height,
        optimization: THREE.Terrain.NONE,
        frequency: applies.frequency,
        steps: applies.steps,
        stretch: true,
        turbulent: false,
        useBufferGeometry: false,
        xSegments: applies.terrain_segments,
        xSize: applies.terrain_size,
        ySegments: applies.terrain_segments,
        ySize: applies.terrain_size
    }
};


TerrainFunctions.prototype.setEdgeVerticeHeight = function(array1d, height) {

    var sideVerts = Math.sqrt(array1d.length);
    var totalVerts = array1d.length;

    var bottomVert = 0;
    var topVert = 0;
    var leftVert = 0;
    var rightVert = 0;

        for (var i = 0; i < sideVerts; i++) {

            bottomVert = i;
            topVert = totalVerts - sideVerts + i;

            leftVert = sideVerts * i;
            rightVert = sideVerts * i + sideVerts - 1;

            array1d[bottomVert] = height;
            array1d[topVert] = height;
            array1d[leftVert] = height;
            array1d[rightVert] = height;
        }

};




TerrainFunctions.prototype.setupTerrainPiece = function(piece) {
    var module = this.getPieceTerrainModule(piece);

    var applies = module.data.applies;

    var edges = this.getTerrainModuleEdges(applies);
    var opts = this.getTerrainModuleOpts(applies);

    var terrain = new THREE.Terrain(opts);


    THREE.Terrain.RadialEdges(terrain.children[0].geometry.vertices, opts, edges.invert, edges.edgeSize, THREE.Terrain[edges.easingFunc]);

    var array1d = THREE.Terrain.toArray1D(terrain.children[0].geometry.vertices);

    this.setEdgeVerticeHeight(array1d, opts.minHeight);

    // THREE.Terrain.fromArray1D(terrain.children[0].geometry.vertices, array1d);

   //  module.terrain = terrain.children[0];
    module.setModuleState(array1d);

};

TerrainFunctions.prototype.enableTerrainPhysics = function(piece) {
    var module = this.getPieceTerrainModule(piece);
    this.CannonAPI.includeBody(module.body);
};

TerrainFunctions.prototype.disableTerrainPhysics = function(piece) {
    var module = this.getPieceTerrainModule(piece);
    this.CannonAPI.excludeBody(module.body);
};


var makeMatrix2D = function(array1d) {

    var tgt = new Array(Math.sqrt(array1d.length)),
        xl = Math.sqrt(array1d.length),
        yl = Math.sqrt(array1d.length),
        i, j;
    for (i = 0; i < xl; i++) {
        tgt[i] = new Float64Array(xl);
        for (j = 0; j < yl; j++) {
            tgt[i][j] = array1d[j * xl + i];
        }
    }

    return tgt;

};

// get a height at point from matrix
TerrainFunctions.prototype.addTerrainToPhysics = function(piece) {
    var module = this.getPieceTerrainModule(piece);

    var applies = module.data.applies;
    var opts = this.getTerrainModuleOpts(applies);

    //   THREE.Terrain.fromArray1D(module.terrain.geometry.vertices, module.state.value);

    var matrix = makeMatrix2D(module.state.value);

    var body = this.CannonAPI.buildPhysicalTerrain(matrix, module.data.applies.terrain_size, piece.spatial.posX(), piece.spatial.posZ(), module.data.applies.min_height,module.data.applies.max_height)
    module.body = body;
    return body;
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

// get the value at the precise integer (x, y) coordinates
TerrainFunctions.prototype.setAt = function(height, array1d, segments, x, y, weight) {

    var factor = weight || 1;
    
    if (x <= 0 || x >= segments || y <= 0 || y >= segments) {
        console.log("FLATTEN OUTSIDE TERRING WONT WORK!");
        return;
    }

    var yFactor = (y) * (segments+1);
    var xFactor = x;

    var idx = (yFactor + xFactor);
//    console.log(y, yFactor, xFactor, idx);
    array1d[idx] = height * factor + array1d[idx]* (1 - factor);
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

var p0  = {x:0, y:0, z:0};

TerrainFunctions.prototype.getHeightForPlayer = function(serverPlayer, normalStore) {
    
    var gridSector = serverPlayer.currentGridSector;
    if (!gridSector) return 0;

    var groundPiece = gridSector.groundPiece;

    return this.getTerrainHeightAt(groundPiece, serverPlayer.piece.spatial.pos, normalStore);
};



TerrainFunctions.prototype.getPreciseHeight = function(array1d, segments, x, y, normalStore) {
    var tri = this.getTriangleAt(array1d, segments, x, y);

    setTri(p0, x, 0, y);

    var find = MATH.barycentricInterpolation(tri[0], tri[1], tri[2], p0);


    if (normalStore) {
        calcVec1.setXYZ((tri[1].x-tri[0].x), (tri[1].z-tri[0].z), (tri[1].y-tri[0].y));
        calcVec2.setXYZ((tri[2].x-tri[0].x), (tri[2].z-tri[0].z), (tri[2].y-tri[0].y));
        calcVec1.crossVec(calcVec2);
        if (calcVec1.data[1] < 0) {
            calcVec1.invert();
        }
        calcVec1.normalize();
        normalStore.setVec(calcVec1);
    }

    return find.z;
};


TerrainFunctions.prototype.setTerrainHeightAt = function(groundPiece, pos, reach) {

    var module = this.getPieceTerrainModule(groundPiece);

    calcVec1.setVec(groundPiece.spatial.pos);

    calcVec2.setVec(pos);
    calcVec2.subVec(calcVec1);

    var terrainSize = this.getTerrainModuleSize(module);
    var segments = this.getTerrainSegmentse(module);

    var array1d = module.state.value;
    
    this.setHeightAt(module, calcVec2, array1d, terrainSize, segments, pos.getY(), reach);
};



TerrainFunctions.prototype.setHeightAt = function(module, posVec, array1d, terrainSize, segments, height, reach) {
    pos = posVec.data;

    var htP = terrainSize;
    var htN = -htP;

    if (pos[0] < htN || pos[0] > htP || pos[2] < htN || pos[2] > htP) {

        console.log("Terrain!", pos[0], pos[2], "Is Outside")
        //    return -1000;
        pos[0] = MATH.clamp(pos[0], htN, htP);
        pos[2] = MATH.clamp(pos[2], htN, htP);
    }


    var x = this.displaceAxisDimensions(2*pos[0]-terrainSize, htN, htP, segments);
    var y = this.displaceAxisDimensions(2*pos[2]-terrainSize, htN, htP, segments);


    var xc = Math.ceil(x);
    var xf = Math.floor(x);
    var yc = Math.ceil(y);
    var yf = Math.floor(y);


    var vertexReach = Math.ceil(reach / (terrainSize/segments))+1;

    // height = -1


    for (var i = -vertexReach; i < vertexReach+1; i++) {


        var iw =  Math.cos((i) / (vertexReach+1));

        for (var j = -vertexReach; j < vertexReach+1; j++) {

            var jw = Math.cos((j) / (vertexReach+1));

            var cw = MATH.clamp(iw*jw * 1.40, 0, 1);

            var ijW = cw * cw * ((cw)+MATH.sillyRandom(i*2.1231+j*31.5123)*(1-cw)) * ((cw)+MATH.sillyRandom((i+j)*4.31+j*31.513)*(1-cw)); // jWeight*iWeight;

            this.setAt(height, array1d, segments,xf+i, yf+j, ijW);
        //    this.setAt(height, array1d, segments,xc+i, yf+j, ijW);
        //    this.setAt(height, array1d, segments,xf+i, yf+j, ijW);
        //    this.setAt(height, array1d, segments,xc+i, yc+j, ijW);
        }
    }

};

TerrainFunctions.prototype.getTerrainHeightAt = function(groundPiece, pos, normalStore) {

    var module = this.getPieceTerrainModule(groundPiece);

    calcVec1.setVec(groundPiece.spatial.pos);
    calcVec2.setVec(pos);
    calcVec2.subVec(calcVec1);

    var terrainSize = this.getTerrainModuleSize(module);
    var segments = this.getTerrainSegmentse(module);

    return this.getHeightAt(module, calcVec2, module.state.value, terrainSize, segments, normalStore)
};




TerrainFunctions.prototype.getHeightAt = function(module, posVec, array1d, terrainSize, segments, normalStore) {
    pos = posVec.data;

    var htP = terrainSize;
    var htN = -htP;

    if (pos[0] < htN || pos[0] > htP || pos[2] < htN || pos[2] > htP) {

        console.log("Terrain!", pos[0], pos[2], "Is Outside")
    //    return -1000;

        pos[0] = MATH.clamp(pos[0], htN, htP);
        pos[2] = MATH.clamp(pos[2], htN, htP);
    }


    var tx = this.displaceAxisDimensions(2*pos[0]-terrainSize, htN, htP, segments);
    var tz = this.displaceAxisDimensions(2*pos[2]-terrainSize, htN, htP, segments);

    return this.getPreciseHeight(array1d, segments, tx, tz, normalStore);
};



TerrainFunctions.prototype.getNormalForPlayer = function(serverPlayer) {

    var gridSector = serverPlayer.currentGridSector;
    if (!gridSector) return MATH.AXIS_Y;

    var groundPiece = gridSector.groundPiece;


    return this.getTerrainNormalAt(groundPiece, serverPlayer.piece.spatial.pos);
};

TerrainFunctions.prototype.getTerrainNormalAt = function(groundPiece, pos) {

    var module = this.getPieceTerrainModule(groundPiece);

    calcVec1.setVec(groundPiece.spatial.pos);

    calcVec2.setVec(pos);
    calcVec2.subVec(calcVec1);


    var terrainSize = this.getTerrainModuleSize(module);
    var segments = this.getTerrainSegmentse(module);

    return this.getNormalAt(module, calcVec2, module.state.value, terrainSize, segments);

};


TerrainFunctions.prototype.getNormalAt = function(module, posVec, array1d, terrainSize, segments) {
    var pos = posVec;
    var scale = 1;

    var htP = terrainSize;
    var htN = -htP;

    if (pos[0] < htN || pos[0] > htP || pos[2] < htN || pos[2] > htP) {

        console.log("Normal Lookup", pos[0], pos[2], "Is Outside")

        calcVec1.setXYZ(0, 1, 0);
        return -1000;
    }



    var tx = this.displaceAxisDimensions(2*pos[0]-terrainSize, htN, htP, segments);
    var tz = this.displaceAxisDimensions(2*pos[2]-terrainSize, htN, htP, segments);

    var tri = this.getTriangleAt(array1d, terrainSize, tx, tz);

    for (var i = 0; i < tri.length; i++) {
        tri[i].x = this.returnToWorldDimensions(tri[i].x, 0, 1, terrainSize-1);
        //    tri[i].z = this.returnToWorldDimensions(tri[i].z, dims.minY, dims.maxY, 1);
        tri[i].y = this.returnToWorldDimensions(tri[i].y, 0, 1, terrainSize-1);
    }

    calcVec1.setXYZ((tri[1].x-tri[0].x), (tri[1].z-tri[0].z), (tri[1].y-tri[0].y));
    calcVec2.setXYZ((tri[2].x-tri[0].x), (tri[2].z-tri[0].z), (tri[2].y-tri[0].y));
    calcVec1.dotVec(calcVec2);
    if (calcVec1.data[1] < 0) {
        calcVec1.invert();
    }

    calcVec1.normalize();
    return calcVec1;

};

