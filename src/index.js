import GiantPrimitive from "./GiantPrimitive";

import {
  Ion,
  Viewer,
  createWorldTerrain,
  createOsmBuildings,
  Cartesian3,
  Math,
} from "cesium";
import * as Cesium from "cesium";

import "cesium/Widgets/widgets.css";
import "../src/css/main.css";
import CustomPrimitive from "./CustomPrimitive";

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk";

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrainProvider: createWorldTerrain(),
});

function createGiantRectangle() {
  let positionSource = new Float32Array([
    -1,
    -1,
    0, // v0
    1,
    -1,
    0, // v1
    1,
    1,
    0, // v2
    -1,
    1,
    0, // v3
  ]);

  var triangle = new Cesium.Geometry({
    attributes: new Cesium.GeometryAttributes({
      position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        //  v3----v2
        //  |     |
        //  |     |
        //  v0----v1
        values: new Float32Array([
          -1,
          -1,
          0, // v0
          1,
          -1,
          0, // v1
          1,
          1,
          0, // v2
          -1,
          1,
          0, // v3
        ]),
      }),
      st: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      }),
    }),
    indices: new Uint32Array([3, 2, 0, 0, 2, 1]),
  });
  return triangle;
}

var loadText = function (filePath) {
  var request = new XMLHttpRequest();
  request.open("GET", filePath, false);
  request.send();
  return request.responseText;
};

var createRawRenderState = function (options) {
  var translucent = true;
  var closed = false;
  var existing = {
    viewport: options.viewport,
    depthTest: options.depthTest,
    depthMask: options.depthMask,
    blending: options.blending,
  };

  var rawRenderState = Cesium.Appearance.getDefaultRenderState(
    translucent,
    closed,
    existing
  );
  return rawRenderState;
};

let primitive = new CustomPrimitive({
  commandType: "Draw",
  attributeLocations: {
    position: 0,
    st: 1, // st = uv mapping indice
  },
  geometry: createGiantRectangle(), // geometry 매우 큰 삼각형 넣자
  primitiveType: Cesium.PrimitiveType.TRIANGLES,
  uniformMap: {},
  // prevent Cesium from writing depth because the depth here should be written manually
  vertexShaderSource: new Cesium.ShaderSource({
    defines: ["DISABLE_GL_POSITION_LOG_DEPTH"],
    sources: [loadText("./shader.vert")],
  }),
  fragmentShaderSource: new Cesium.ShaderSource({
    defines: ["DISABLE_LOG_DEPTH_FRAGMENT_WRITE"],
    sources: [loadText("./shader.frag")],
  }),
  rawRenderState: createRawRenderState({
    viewport: undefined,
    depthTest: {
      enabled: true,
      func: Cesium.DepthFunction.ALWAYS, // always pass depth test for full control of depth information
    },
    depthMask: true,
  }),
  // framebuffer: this.framebuffers.nextTrails,
  autoClear: true,
  preExecute: function () {
    // swap framebuffers before binding
    // var temp;
    // temp = that.framebuffers.currentTrails;
    // that.framebuffers.currentTrails = that.framebuffers.nextTrails;
    // that.framebuffers.nextTrails = temp;
    // keep the framebuffers up to date
    // that.primitives.trails.commandToExecute.framebuffer =
    //   that.framebuffers.nextTrails;
    // that.primitives.trails.clearCommand.framebuffer =
    //   that.framebuffers.nextTrails;
  },
});

// 2 创建Primitive
var boxLength = 100000.0;
var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 2 * boxLength);
// var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
var enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
var scaleMatrix = Cesium.Matrix4.fromScale(
  new Cesium.Cartesian3(boxLength, boxLength, boxLength)
);
var modelMatrix = Cesium.Matrix4.multiply(
  enuMatrix,
  scaleMatrix,
  new Cesium.Matrix4()
);

var myBox = viewer.scene.primitives.add(new GiantPrimitive(modelMatrix));

viewer.scene.primitives.add(myBox);
viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000));
