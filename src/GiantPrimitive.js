import * as Cesium from "cesium";
var global = {
  t: 0.1,
};

setInterval(() => {
  global.t += 0.1;
}, 3000);

export default class GiantPrimitive {
  constructor(modelMatrix) {
    // 1.0 立方体顶点位置标号，以及坐标系示意图
    // 立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // 坐标系
    //  z
    //  | /y
    //  |/
    //  o------x

    // 1.1 定义位置数组
    var v0 = [0.5, -0.5, 0.5];
    var v1 = [-0.5, -0.5, 0.5];
    var v2 = [-0.5, -0.5, -0.5];
    var v3 = [0.5, -0.5, -0.5];
    var v4 = [0.5, 0.5, -0.5];
    var v5 = [0.5, 0.5, 0.5];
    var v6 = [-0.5, 0.5, 0.5];
    var v7 = [-0.5, 0.5, -0.5];
    var rawVertex = [
      // 下 -z
      ...v2,
      ...v3,
      ...v4,
      ...v7,
      // 前 -y
      ...v2,
      ...v3,
      ...v0,
      ...v1,
      // 后 +y
      ...v4,
      ...v7,
      ...v6,
      ...v5,
      // 左 -x
      ...v7,
      ...v2,
      ...v1,
      ...v6,
      // 右 +x
      ...v3,
      ...v4,
      ...v5,
      ...v0,
      // 上 +z
      ...v1,
      ...v0,
      ...v5,
      ...v6,
    ];
    var positions = new Float64Array(rawVertex);

    // 1.2 定义法向数组
    var npx = [1, 0, 0];
    var nnx = [-1, 0, 0];
    var npy = [0, 1, 0];
    var nny = [0, -1, 0];
    var npz = [0, 0, 1];
    var nnz = [0, 0, -1];
    var normals = new Float32Array([
      // 下 -z
      ...nnz,
      ...nnz,
      ...nnz,
      ...nnz,
      // 前 -y
      ...nny,
      ...nny,
      ...nny,
      ...nny,
      // 后 +y
      ...npy,
      ...npy,
      ...npy,
      ...npy,
      // 左 -x
      ...nnx,
      ...nnx,
      ...nnx,
      ...nnx,
      // 右 +x
      ...npx,
      ...npx,
      ...npx,
      ...npx,
      // 上 +z
      ...npz,
      ...npz,
      ...npz,
      ...npz,
    ]);

    // 1.3 定义纹理数组
    var sts = new Float32Array([
      0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0,
      0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
    ]);

    // 1.4 定义索引
    var indices = new Uint16Array([
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]);

    // 1.5 定义纹理
    var texture = undefined;
    var imageUri =
      "../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png";
    Cesium.Resource.createIfNeeded(imageUri)
      .fetchImage()
      .then(function (image) {
        console.log("image loaded!");
        var vtxfTexture;
        var context = viewer.scene.context;
        if (Cesium.defined(image.internalFormat)) {
          vtxfTexture = new Cesium.Texture({
            context: context,
            pixelFormat: image.internalFormat,
            width: image.width,
            height: image.height,
            source: {
              arrayBufferView: image.bufferView,
            },
          });
        } else {
          vtxfTexture = new Cesium.Texture({
            context: context,
            source: image,
          });
        }

        texture = vtxfTexture;
      });

    // vtxf 使用double类型的position进行计算
    // var attributeLocations = {
    //     position3DHigh : 0,
    //     position3DLow : 1,
    //     normal : 2,
    //     textureCoordinates : 3,
    // };

    // 1.6 定义attributeLocations
    var attributeLocations = {
      position: 0,
      normal: 1,
      textureCoordinates: 2,
    };

    // 1.7 定义shader
    var vtxfVertexShader = `
            // vtxf 使用double类型的position进行计算
            // attribute vec3 position3DHigh;
            // attribute vec3 position3DLow;
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 st;
            attribute float batchId;
            uniform float t;

            varying vec3 v_positionEC;
            varying vec3 v_normalEC;
            varying vec2 v_st;

            void main()
            {
                // vtxf 使用double类型的position进行计算
                // vec4 p = czm_translateRelativeToEye(position3DHigh, position3DLow);
                // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                // v_st = st;
                // gl_Position = czm_modelViewProjectionRelativeToEye * p;

                v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       // position in eye coordinates
                v_normalEC = czm_normal * normal;                               // normal in eye coordinates
                v_st = st;
                gl_Position = czm_modelViewProjection * vec4(position, 1.0);
            }
            `;

    var vtxfFragmentShader = `
            varying vec3 v_positionEC;
            varying vec3 v_normalEC;
            varying vec2 v_st;

            uniform float t;

            uniform sampler2D myImage;

            void main()
            {
                vec3 positionToEyeEC = -v_positionEC;

                vec3 normalEC = normalize(v_normalEC);
            #ifdef FACE_FORWARD
                normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
            #endif

                czm_materialInput materialInput;
                materialInput.normalEC = normalEC;
                materialInput.positionToEyeEC = positionToEyeEC;
                materialInput.st = v_st;

                //czm_material material = czm_getMaterial(materialInput);
                czm_material material = czm_getDefaultMaterial(materialInput);
                material.diffuse = texture2D(myImage, materialInput.st).rgb;

                gl_FragColor = vec4(t,0.0,0.0,0.7);
            }
            `;

    // 1.8 创建vertexArray
    function createVertexArray(context) {
      var geometry = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            // vtxf 使用double类型的position进行计算
            // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: positions,
          }),
          normal: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: normals,
          }),
          textureCoordinates: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: sts,
          }),
        },
        // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
      });

      var vertexArray = Cesium.VertexArray.fromGeometry({
        context: context,
        geometry: geometry,
        attributeLocations: attributeLocations,
        bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
        // interleave : true
      });

      return vertexArray;
    }

    // 1.9 创建command
    function createCommand(context) {
      var translucent = false;
      var closed = true;
      // 借用一下Appearance.getDefaultRenderState
      var rawRenderState = Cesium.Appearance.getDefaultRenderState(
        translucent,
        closed,
        undefined
      );
      var renderState = Cesium.RenderState.fromCache(rawRenderState);

      var vertexShaderSource = new Cesium.ShaderSource({
        sources: [vtxfVertexShader],
      });

      var fragmentShaderSource = new Cesium.ShaderSource({
        sources: [vtxfFragmentShader],
      });

      var uniformMap = {
        myImage: function () {
          if (Cesium.defined(texture)) {
            return texture;
          } else {
            return context.defaultTexture;
          }
        },
        t: function () {
          return global.t;
        },
      };

      var shaderProgram = Cesium.ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: vertexShaderSource,
        fragmentShaderSource: fragmentShaderSource,
        attributeLocations: attributeLocations,
      });

      return new Cesium.DrawCommand({
        vertexArray: createVertexArray(context),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        renderState: renderState,
        shaderProgram: shaderProgram,
        uniformMap: uniformMap,
        owner: this,
        // framebuffer : framebuffer,
        pass: Cesium.Pass.OPAQUE,
        modelMatrix: modelMatrix,
      });
    }

    this.show = true;
    this._command = undefined;
    this._createCommand = createCommand;
  }

  update(frameState) {
    if (!this.show) {
      return;
    }

    if (!Cesium.defined(this._command)) {
      this._command = this._createCommand(frameState.context);
    }

    if (Cesium.defined(this._command)) {
      frameState.commandList.push(this._command);
    }
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    if (Cesium.defined(this._command)) {
      this._command.shaderProgram =
        this._command.shaderProgram && this._command.shaderProgram.destroy();
    }
    return destroyObject(this);
  }
}
