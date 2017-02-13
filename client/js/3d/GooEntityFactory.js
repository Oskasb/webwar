"use strict";


define([

], function(

    ) {
    var Sphere = goo.Sphere;
    var Box = goo.Box;
    var Material = goo.Material;
    var MeshDataComponent = goo.MeshDataComponent;
    var MeshRendererComponent = goo.MeshRendererComponent;
    var ShaderLib = goo.ShaderLib;
    
    var world;
    var g00;
    
    var setGoo = function(goo0) {
        g00 = goo0;
        world = g00.world;
    };


    var applyMaterial = function(entity, material) {
        entity.meshRendererComponent.materials.push(material);
    };

    var addEntityMesh = function(entity, mesh) {
        var meshDataComponent = new MeshDataComponent(mesh);
        entity.setComponent(meshDataComponent);

        // Create meshrenderer component with material and shader
        var meshRendererComponent = new MeshRendererComponent();
        entity.setComponent(meshRendererComponent);
        return entity;
    };


    var handleBuildPrimitive = function(parentGooEntity) {
    //    var parentGooEntity = event.eventArgs(e).parentGooEntity;
    //    var pos = event.eventArgs(e).pos.clone();
    //    var rot = event.eventArgs(e).rot.toAngles();
    //    var size = event.eventArgs(e).size.clone();
    var     size = {data:[2, 2, 2]};
    //    var shape = event.eventArgs(e).shape;
     var    shape = 'Box';
    //    var color = event.eventArgs(e).color;

        var primitive = world.createEntity("primitive");

        switch (shape) {
            case "Box":
                var meshData = new Box(size.x, size.y, size.z);
            break;
            case "Sphere":
                var meshData = new Sphere(8, 8, size.x);
            break;
            case "Cylinder":
                var meshData = new Box(size.x, size.y, size.z);
            break;
        }

        var material = new Material(ShaderLib.simpleColored, 'PrimitiveMaterial');

    //    if (color != undefined) material.uniforms.color = color;

        addEntityMesh(primitive, meshData);
        applyMaterial(primitive, material);
        parentGooEntity.transformComponent.attachChild(primitive.transformComponent);
    //    primitive.meshRendererComponent.isReflectable = false;
        primitive.addToWorld();
    //    primitive.transformComponent.transform.translation.setArray(pos.data);
    //    primitive.transformComponent.transform.setRotationXYZ(rot.data[0], rot.data[1], rot.data[2]) // = rot // .toAngles());
    //    event.eventArgs(e).callback(primitive);
        return primitive;
    };

    var addChildEntity = function(parentGooEntity) {
        var child = world.createEntity("child");
        parentGooEntity.transformComponent.attachChild(child.transformComponent);
        child.addToWorld();
        return child;
    };
    
    var buildRootEntity = function() {
        var root = world.createEntity("piece_root");
        root.addToWorld();
        return root;
    };
        
    var translateEntity = function(entity, pos) {
        entity.transformComponent.transform.translation.setArray(pos);
        entity.transformComponent.setUpdated();
    };

    var rotateEntity = function(entity, rot) {
        entity.transformComponent.transform.setRotationXYZ(rot[0], rot[1], rot[2]);
        entity.transformComponent.setUpdated();
    };
    
    return {
        translateEntity:translateEntity,
        rotateEntity:rotateEntity,
        setGoo:setGoo,
        buildRootEntity:buildRootEntity,
        addChildEntity:addChildEntity,
        attachPrimitive:handleBuildPrimitive
    }

});