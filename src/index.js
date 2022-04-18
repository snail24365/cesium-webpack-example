import { Ion, Viewer } from "cesium";
import * as Cesium from "cesium";

import "cesium/Widgets/widgets.css";
import "../src/css/main.css";

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk";

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  timeline: false,
  animation: false,
  baseLayerPicker: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  geocoder: false,
});
viewer.scene.globe.show = true;
viewer.scene.skyAtmosphere.show = false;
viewer.scene.skyBox.show = false;
viewer.bottomContainer.style.display = "none";
viewer.fullscreenButton.container.style.display = "none";

const scale = 10.0;
const elevation = 20;
const position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, elevation);
const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
const scaleMatrix = Cesium.Matrix4.fromScale(
  new Cesium.Cartesian3(scale, scale, scale)
);
const modelMatrix = Cesium.Matrix4.multiply(
  enuMatrix,
  scaleMatrix,
  new Cesium.Matrix4()
);

// var myBox = viewer.scene.primitives.add(new GiantPrimitive(modelMatrix));
// var myCustomPrimitive = viewer.scene.primitives
//   .add
//   //new MyCustomPrimitive(modelMatrix)
//   ();

// viewer.scene.primitives.add(myCustomPrimitive);
// viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, scale));
