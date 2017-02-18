var THREE = require('three');

var calcVec1;
var calcVec2;


TerrainFunctions = function() {
    calcVec1 = new MATH.Vec3();
    calcVec2 = new MATH.Vec3();
};



TerrainFunctions.prototype.getPieceTerrainModule = function(piece) {
    return piece.getModuleById('plane_ground_module');
};

TerrainFunctions.prototype.getTerrainSegmentse = function(module) {
    return module.data.applies.terrain_segments;
};

TerrainFunctions.prototype.getTerrainModuleSize = function(module) {
    return module.data.applies.terrain_size;
};

TerrainFunctions.prototype.getTerrainModuleOpts = function(module) {

    var applies = module.data.applies;

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




// get a height at point from matrix
TerrainFunctions.prototype.setupTerrainPiece = function(piece) {


    var module = this.getPieceTerrainModule(piece);
    var opts = this.getTerrainModuleOpts(module);

    var terrain = new THREE.Terrain(opts);

    THREE.Terrain.RadialEdges(terrain.children[0].geometry.vertices, opts, false, 5, THREE.Terrain.EaseInOut);

    var vertices = THREE.Terrain.toArray1D(terrain.children[0].geometry.vertices);

    module.terrain = terrain.children[0];
    module.setModuleState(vertices);

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
    console.log(y, yFactor, xFactor, idx);
    return array1d[idx];
};

var p1  = {x:0, y:0, z:0};
var p2  = {x:0, y:0, z:0};
var p3  = {x:0, y:0, z:0};


var points = []

var setTri = function(tri, x, y, z) {
    tri.x = x;
    tri.y = y;
    tri.z = z;
};


TerrainFunctions.prototype.getTriangleAt = function(array1d, segments, x, y) {

    var xf = Math.ceil(x);
    var xc = Math.floor(x);
    var yc = Math.ceil(y);
    var yf = Math.floor(y);

    var fracX = x - xf;
    var fracY = y - yf;



    p1.x = xf;
    p1.y = yc;

    console.log(xf, yc);
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

TerrainFunctions.prototype.getHeightForPlayer = function(serverPlayer) {
    
    var gridSector = serverPlayer.currentGridSector;
    if (!gridSector) return Math.random()*10;;

    var groundPiece = gridSector.groundPiece;


    return this.getTerrainHeightAt(groundPiece, serverPlayer.piece.spatial.pos);
};

TerrainFunctions.prototype.getPreciseHeight = function(array1d, segments, x, y) {
    var tri = this.getTriangleAt(array1d, segments, x, y);
    console.log(tri);
    setTri(p0, x, 0, y);

    var find = MATH.barycentricInterpolation(tri[0], tri[1], tri[2], p0);

    return find.z;
};

TerrainFunctions.prototype.getTerrainHeightAt = function(groundPiece, pos) {

    var module = this.getPieceTerrainModule(groundPiece);
//    return Math.random()* 2;

  //  calcVec1.setXYZ(terrainSize*0.5, 0, terrainSize*0.5);

    calcVec1.setVec(groundPiece.spatial.pos);

    calcVec2.setVec(pos);
    calcVec2.subVec(calcVec1);
    console.log('x',pos.data[0], 'z',pos.data[2]);


    var terrainSize = this.getTerrainModuleSize(module);
    var segments = this.getTerrainSegmentse(module);

//

    return this.getHeightAt(module, calcVec2, module.state.value, terrainSize, segments)

};



TerrainFunctions.prototype.getHeightAt = function(module, posVec, array1d, terrainSize, segments) {
    pos = posVec.data;

    var htP = terrainSize //  * 0.5;
    var htN = -htP;

    if (pos[0] < htN || pos[0] > htP || pos[2] < htN || pos[2] > htP) {

        console.log("Terrain!", pos[0], pos[2], "Is Outside")
        return -1000;
    }


//    var quadSize = terrainSize / segments;
    
    // axPos, axMin, axMax, quadCount

    var axMin = 0 // -terrainSize*0.5;htP
    var axMax = terrainSize // *0.5;terrainSize

    var tx = this.displaceAxisDimensions(2*pos[0]-terrainSize, htN, htP, segments);
    var tz = this.displaceAxisDimensions(2*pos[2]-terrainSize, htN, htP, segments);

    console.log("tz tn:",tz, tx)

 //  var tx = (terrainSize / segments) - ((pos[0]) / (terrainSize / segments)); // (terrainSize
 //  var tz = (pos[2]) / (terrainSize / segments);
 //



    return this.getPreciseHeight(array1d, segments, tx, tz);
};



TerrainFunctions.prototype.getNormalAt = function(pos, array1d, terrainSize, storeVec) {
    var scale = 1;

    var tx = this.displaceAxisDimensions(pos[0], 0, terrainSize, 31);
    var tz = this.displaceAxisDimensions(pos[2], 0, terrainSize, 31);

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

    var x = pos[0];
    var z = terrainSize - pos[2];

    var col = Math.floor(x);
    var row = Math.floor(z-1);

    var col1 = col + 1;
    var row1 = row + 1;

    col = MATH.moduloPositive(col, terrainSize);
    row = MATH.moduloPositive(row, terrainSize);
    col1 = MATH.moduloPositive(col1, terrainSize);
    row1 = MATH.moduloPositive(row1, terrainSize);

    var topLeft =    array1d[row * terrainSize + col];
    var topRight =   array1darray1d[row * terrainSize + col1];
    var bottomLeft = array1d[row1 * terrainSize + col];

    return storeVec.setXYZ((topLeft - topRight), scale, (bottomLeft - topLeft)).normalize();

};

