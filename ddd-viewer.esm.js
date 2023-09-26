import '@babylonjs/loaders/glTF';
import { SceneLoader, Effect, ShaderMaterial, Texture, Vector2, QuadraticEase, EasingFunction, Vector3, Scalar, TargetCamera, UniversalCamera, SceneInstrumentation, ReflectionProbe, CubeTexture, Color3, DirectionalLight, CascadedShadowGenerator, Mesh, LensFlareSystem, LensFlare, StandardMaterial, MeshBuilder, PBRMaterial, PBRBaseMaterial, Space, DynamicTexture, AbstractMesh, Matrix, Quaternion, TransformNode, ArcRotateCamera, Ray, VertexBuffer, BoundingInfo, Engine, Scene, DefaultRenderingPipeline, LensRenderingPipeline, ColorCurves, ImageProcessingPostProcess } from '@babylonjs/core';
import { PBRCustomMaterial, WaterMaterial } from '@babylonjs/materials';
import { getCenter, getBottomLeft, getTopRight } from 'ol/extent';
import { createXYZ, extentFromProjection } from 'ol/tilegrid';
import { transform } from 'ol/proj';
import proj4__default from 'proj4';
import SunCalc from 'suncalc';

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D models
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * This object represents ddd-viewer configuration, and is used to pass
 * options to the main object (DDDViewer) constructor.
 */
var DDDViewerConfig = function DDDViewerConfig() {
  this.defaultCoords = [-8.726, 42.233]; // [0.0, 0.0];
  // TODO: Move this to layer configuration (?)
  this.tileUrlBase = "/cache/ddd_http/";
  this.tileUrlSuffix = "";
  this.assetsUrlbase = "/assets/";
  this.materialsTextureSet = "default256";
  this.materialsSplatmap = null; // 256
  //sceneGroundTextureOverrideUrl: string | null = null;
  this.timeScale = 0.0;
  this.moveSpeeds = [2.0, 5.0, 10.0];
  this.sceneTileDrawDistanceDefault = 1;
};

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * Manages the list of layers known to DDD Viewer.
 */
var LayerManager = /*#__PURE__*/function () {
  function LayerManager(sceneViewer) {
    this.sceneViewer = sceneViewer;
    this.layers = {};
  }
  var _proto = LayerManager.prototype;
  _proto.update = function update(deltaTime) {
    for (var key in this.layers) {
      // Load tiles dynamically as needed
      this.layers[key].update(deltaTime);
    }
  }
  /**
   * Adds a layer to DDD viewer.
   * @param key
   * @param layer
   */;
  _proto.addLayer = function addLayer(layer) {
    layer.setViewer(this.sceneViewer);
    this.layers[layer.key] = layer;
  };
  _proto.removeLayer = function removeLayer(layer) {
    layer.setViewer(null); // have the layer cleanup itself from the scene
    delete this.layers[layer.key];
  }
  /**
   * Retrieves a layer from DDD viewer managed layers.
   * Returns null if the layer does not exist.
   */;
  _proto.getLayer = function getLayer(key) {
    if (key in this.layers) {
      return this.layers[key];
    }
    return null;
  };
  return LayerManager;
}();

/* eslint-disable @typescript-eslint/no-explicit-any */
var QueueLoader = /*#__PURE__*/function () {
  function QueueLoader(sceneViewer) {
    this.concurrentTasks = 2; // 1 on mobile? 2 on PC?
    this.sceneViewer = sceneViewer;
    this.queue = [];
    this.current = [];
  }
  var _proto = QueueLoader.prototype;
  _proto.update = function update() {
    //loadNext();
  };
  _proto.processNext = function processNext() {
    if (this.queue.length < 1) {
      return;
    }
    var task = this.queue.pop();
    this.processTask(task);
  };
  _proto.enqueueLoadModel = function enqueueLoadModel(url, onSuccess, onFailure) {
    var task = {
      "url": url,
      "onSuccess": onSuccess,
      "onFailure": onFailure
    };
    this.queue.push(task);
    if (this.current.length < this.concurrentTasks) {
      this.processNext();
    }
  };
  _proto.processTask = function processTask(task) {
    var _this = this;
    var url = task["url"];
    SceneLoader.ImportMesh(null, "", url, this.sceneViewer.scene, function (newMeshes, particleSystems, skeletons) {
      _this.processNext();
      task.onSuccess(newMeshes, particleSystems, skeletons);
    }, function () {}, function (scene, msg, ex) {
      task.onFailure(scene, msg, ex);
      _this.processNext();
    }, ".glb" // this is to force format in case a blob URL is being used
    );
  };
  return QueueLoader;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D models
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
var ViewerProcessManager = /*#__PURE__*/function () {
  function ViewerProcessManager(sceneViewer) {
    this.playing = true;
    this.currentTasks = [];
    this.time = 0.0;
    this.sceneViewer = sceneViewer;
    this.currentProcesses = [];
  }
  var _proto = ViewerProcessManager.prototype;
  _proto.update = function update(deltaTime) {
    if (!this.playing) {
      return;
    }
    this.time += deltaTime;
    // Update all current tasks
    for (var _iterator = _createForOfIteratorHelperLoose(this.currentProcesses), _step; !(_step = _iterator()).done;) {
      var proc = _step.value;
      proc.update(deltaTime);
    }
    // Remove finished steps
    this.currentProcesses = this.currentProcesses.filter(function (item) {
      return !item.finished;
    });
  };
  _proto.add = function add(process) {
    //console.debug("Adding process: ", process);
    // Sanity check
    if (process.sceneViewer != this.sceneViewer) {
      throw new Error("Tried to add a ViewerProcess to a ViewerProcessManager which belongs ot a different SceneViewer.");
    }
    this.currentProcesses.push(process);
  };
  _proto.remove = function remove(process) {
    //console.debug("Removing process: ", process);
    this.currentProcesses = this.currentProcesses.filter(function (item) {
      return item !== process;
    });
  };
  return ViewerProcessManager;
}();

/* eslint-disable indent */
/* eslint-disable no-unused-vars, no-var, no-undef, no-debugger, no-console,  */
var SkyMaterialWrapper = /*#__PURE__*/function () {
  function SkyMaterialWrapper(scene) {
    this.material = this.initMaterial(scene);
    //this.testSplatMaterial(scene);
  }
  var _proto = SkyMaterialWrapper.prototype;
  _proto.initMaterial = function initMaterial(scene) {
    //, options: any) {
    Effect.ShadersStore["customVertexShader"] = "\n        precision highp float;\n\n        // Attributes\n        attribute vec3 position;\n        attribute vec3 normal;\n        attribute vec2 uv;\n\n        // Uniforms\n        uniform mat4 worldViewProjection;\n\n        // Varying\n        varying vec4 vPosition;\n        varying vec3 vNormal;\n        varying vec2 vUV;\n        void main() {\n\n            vec4 p = vec4( position, 1. );\n\n            vPosition = p;\n            vNormal = normal;\n\n             vUV = uv;\n             // vUV.y =1.-vUV.y;     // flip uv screen ;\n            gl_Position = worldViewProjection * p;\n\n        }";
    Effect.ShadersStore["customFragmentShader"] = "\n        precision highp float;\n\n        uniform mat4 worldView;\n\n        varying vec4 vPosition;\n\n         precision mediump float;\n\n        // Day and night sky cycle. By L\xE1szl\xF3 Matuska (@BitOfGold)\n        // Creates a sky texture for a skydome\n        // https://www.shadertoy.com/view/ltlSWB\n\n\n        // based on other shaders, Greetings goes to:\n\n        // Weather. By David Hoskins, May 2014.\n        // https://www.shadertoy.com/view/4dsXWn\n\n        // Edge of atmosphere\n        // created by dmytro rubalskyi (ruba)\n        // https://www.shadertoy.com/view/XlXGzB\n\n        // Starfield01 by xaot88\n        // https://www.shadertoy.com/view/Md2SR3\n        // ======================================================================\n\n        //#define shadertoy 1\n\n        //#define cloud2 1 //second layer of clouds, altocumulus or stratocumulus. (in 4K, too slow on my GTX970. HD is OK.)\n        //plan was to make cirrus too...\n\n        #ifdef GL_ES\n        precision highp float;\n        #endif\n\n        const float M_PI = 3.1415926535;\n        const float DEGRAD = M_PI / 180.0;\n\n        #ifdef shadertoy\n            float height = 500.0; //viewer height\n            float cloudy = 0.6; //0.6 //0.0 clear sky\n        #else\n            varying vec3 vNormal;\n            varying vec2 vUV;\n            uniform sampler2D iChannel0;\n            uniform float sunx;\n            uniform float suny;\n            //uniform float moonx;\n            //uniform float moony;\n            //uniform float cloudy;\n           // uniform float height;\n            uniform float time;\n        #endif\n        //float moonx = 1.0;\n        //float moony = 9.6;\n        //float sunx = 1.0;\n        //float suny = 1.6;\n        float cloudy = 0.1;\n        float height = 500.0;\n\n        //rendering quality\n        const int steps = 8; //16 is fast, 128 or 256 is extreme high\n        const int stepss = 8; //16 is fast, 16 or 32 is high\n\n        //float t = 12.0; //fix time. 12.0 91.0, 97.0, 188.0, 72.0, 74.0\n\n        float camroty = 0. * DEGRAD; //20.\n        float haze = 0.1; //0.2\n        float cloudyhigh = 0.05; //if cloud2 defined\n\n        float cloudnear = 1.0; //9e3 12e3  //do not render too close clouds on the zenith\n        float cloudfar = 1e3; //15e3 17e3\n\n        float startreshold = 0.99; //0.99 0.98 star density treshold.\n\n        const float I = 10.; //sun light power, 10.0 is normal\n        const float g = 0.45; //light concentration .76 //.45 //.6  .45 is normaL\n        const float g2 = g * g;\n\n        //Reyleigh scattering (sky color, atmospheric up to 8km)\n        vec3 bR = vec3(5.8e-6, 13.5e-6, 33.1e-6); //normal earth\n        //vec3 bR = vec3(5.8e-6, 33.1e-6, 13.5e-6); //purple\n        //vec3 bR = vec3( 63.5e-6, 13.1e-6, 50.8e-6 ); //green\n        //vec3 bR = vec3( 13.5e-6, 23.1e-6, 115.8e-6 ); //yellow\n        //vec3 bR = vec3( 5.5e-6, 15.1e-6, 355.8e-6 ); //yeellow\n        //vec3 bR = vec3(3.5e-6, 333.1e-6, 235.8e-6 ); //red-purple\n\n        //Mie scattering (water particles up to 1km)\n        vec3 bM = vec3(21e-6); //normal mie\n        //vec3 bM = vec3(50e-6); //high mie\n\n        //-----\n        //positions\n\n        const float Hr = 8000.0; //Reyleight scattering top\n        const float Hm = 1000.0; //Mie scattering top\n\n        const float R0 = 6360e3; //planet radius\n        const float Ra = 6380e3; //atmosphere radius\n        vec3 C = vec3(0., -R0, 0.); //planet center\n        vec3 Ds = normalize(vec3(0., .09, -1.)); //sun direction?\n\n        //--------------------------------------------------------------------------\n        //Starfield\n        // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\n\n        // Return random noise in the range [0.0, 1.0], as a function of x.\n        float Noise2d( in vec2 x )\n        {\n            float xhash = cos( x.x * 37.0 );\n            float yhash = cos( x.y * 57.0 );\n            return fract( 415.92653 * ( xhash + yhash ) );\n        }\n\n        // Convert Noise2d() into a \"star field\" by stomping everthing below fThreshhold to zero.\n        float NoisyStarField( in vec2 vSamplePos, float fThreshhold )\n        {\n            float StarVal = Noise2d( vSamplePos );\n            if ( StarVal >= fThreshhold )\n                StarVal = pow( (StarVal - fThreshhold)/(1.0 - fThreshhold), 6.0 );\n            else\n                StarVal = 0.0;\n            return StarVal;\n        }\n\n        // Stabilize NoisyStarField() by only sampling at integer values.\n        float StableStarField( in vec2 vSamplePos, float fThreshhold )\n        {\n            // Linear interpolation between four samples.\n            // Note: This approach has some visual artifacts.\n            // There must be a better way to \"anti alias\" the star field.\n            float fractX = fract( vSamplePos.x );\n            float fractY = fract( vSamplePos.y );\n            vec2 floorSample = floor( vSamplePos );\n            float v1 = NoisyStarField( floorSample, fThreshhold );\n            float v2 = NoisyStarField( floorSample + vec2( 0.0, 1.0 ), fThreshhold );\n            float v3 = NoisyStarField( floorSample + vec2( 1.0, 0.0 ), fThreshhold );\n            float v4 = NoisyStarField( floorSample + vec2( 1.0, 1.0 ), fThreshhold );\n\n            float StarVal =   v1 * ( 1.0 - fractX ) * ( 1.0 - fractY )\n                            + v2 * ( 1.0 - fractX ) * fractY\n                            + v3 * fractX * ( 1.0 - fractY )\n                            + v4 * fractX * fractY;\n            return StarVal;\n        }\n\n\n        //--------------------------------------------------------------------------\n        //Cloud noise\n\n        float Noise( in vec3 x )\n        {\n            vec3 p = floor(x);\n            vec3 f = fract(x);\n            f = f*f*(3.0-2.0*f);\n\n            vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;\n\n            vec2 rg = texture( iChannel0, (uv+ 0.5)/256.0, -100.0).yx;\n            return mix( rg.x, rg.y, f.z );\n        }\n\n        float fnoise( vec3 p, in float t )\n        {\n            p *= .25;\n            float f;\n\n            f = 0.5000 * Noise(p); p = p * 3.02; p.y -= t*.2;\n            f += 0.2500 * Noise(p); p = p * 3.03; p.y += t*.06;\n            f += 0.1250 * Noise(p); p = p * 3.01;\n            f += 0.0625   * Noise(p); p =  p * 3.03;\n            f += 0.03125  * Noise(p); p =  p * 3.02;\n            f += 0.015625 * Noise(p);\n            return f;\n        }\n\n        //--------------------------------------------------------------------------\n        //clouds, scattering\n\n        float cloud(vec3 p, in float t) {\n            float cld = fnoise(p*2e-4,t) + cloudy*0.1 ;\n            cld = smoothstep(.4+.04, .6+.04, cld);\n            cld *= 70.;\n            return cld+haze;\n        }\n\n\n        void densities(in vec3 pos, out float rayleigh, out float mie, in float t) {\n            float h = length(pos - C) - R0;\n            rayleigh =  exp(-h/Hr);\n            vec3 d = pos;\n            d.y = 0.0;\n            float dist = length(d);\n\n            float cld = 0.;\n            if (5e3 < h && h < 8e3) {\n                cld = cloud(pos+vec3(23175.7, 0.,-t*3e3), t);\n                cld *= sin(3.1415*(h-5e3)/5e3) * cloudy;\n            }\n            #ifdef cloud2\n                float cld2 = 0.;\n                if (12e3 < h && h < 15.5e3) {\n                    cld2 = fnoise(pos*3e-4,t)*cloud(pos*32.0+vec3(27612.3, 0.,-t*15e3), t);\n                    cld2 *= sin(3.1413*(h-12e3)/12e3) * cloudyhigh;\n                    cld2 = clamp(cld2,0.0,1.0);\n                }\n\n            #endif\n\n\n            if ( dist < cloudfar) {\n                float factor = clamp(1.0-((cloudfar - dist)/(cloudfar-cloudnear)),0.0,1.0);\n                cld *= factor;\n            }\n\n            mie = exp(-h/Hm) + cld + haze;\n            #ifdef cloud2\n                mie += cld2;\n            #endif\n\n        }\n\n        float escape(in vec3 p, in vec3 d, in float R) {\n\n            vec3 v = p - C;\n            float b = dot(v, d);\n            float c = dot(v, v) - R*R;\n            float det2 = b * b - c;\n            if (det2 < 0.) return -1.;\n            float det = sqrt(det2);\n            float t1 = -b - det, t2 = -b + det;\n            return (t1 >= 0.) ? t1 : t2;\n        }\n\n        // this can be explained: http://www.scratchapixel.com/lessons/3d-advanced-lessons/simulating-the-colors-of-the-sky/atmospheric-scattering/\n        void scatter(vec3 o, vec3 d, out vec3 col, out float scat, in float t) {\n            float L = escape(o, d, Ra);\n            float mu = dot(d, Ds);\n            float opmu2 = 1. + mu*mu;\n            float phaseR = .0596831 * opmu2;\n            float phaseM = .1193662 * (1. - g2) * opmu2 / ((2. + g2) * pow(1. + g2 - 2.*g*mu, 1.5));\n\n            float depthR = 0., depthM = 0.;\n            vec3 R = vec3(0.), M = vec3(0.);\n\n            float dl = L / float(steps);\n            for (int i = 0; i < steps; ++i) {\n                float l = float(i) * dl;\n                vec3 p = o + d * l;\n\n                float dR, dM;\n                densities(p, dR, dM, t);\n                dR *= dl; dM *= dl;\n                depthR += dR;\n                depthM += dM;\n\n                float Ls = escape(p, Ds, Ra);\n                if (Ls > 0.) {\n                    float dls = Ls / float(stepss);\n                    float depthRs = 0., depthMs = 0.;\n                    for (int j = 0; j < stepss; ++j) {\n                        float ls = float(j) * dls;\n                        vec3 ps = p + Ds * ls;\n                        float dRs, dMs;\n                        densities(ps, dRs, dMs, t);\n                        depthRs += dRs * dls;\n                        depthMs += dMs * dls;\n                    }\n\n                    vec3 A = exp(-(bR * (depthRs + depthR) + bM * (depthMs + depthM)));\n                    R += A * dR;\n                    M += A * dM;\n                }\n            }\n\n\n            col = I * (R * bR * phaseR + M * bM * phaseM);\n            scat = 1.0 - clamp(depthM*1e-5,0.,1.);\n        }\n\n        //--------------------------------------------------------------------------\n        // ray casting\n\n\n        vec3 rotate_y(vec3 v, float angle)\n        {\n            float ca = cos(angle); float sa = sin(angle);\n            return v*mat3(\n                +ca, +.0, -sa,\n                +.0,+1.0, +.0,\n                +sa, +.0, +ca);\n        }\n\n        vec3 rotate_x(vec3 v, float angle)\n        {\n            float ca = cos(angle); float sa = sin(angle);\n            return v*mat3(\n                +1.0, +.0, +.0,\n                +.0, +ca, -sa,\n                +.0, +sa, +ca);\n        }\n\n        float map(float value, float min1, float max1, float min2, float max2) {\n          return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n        }\n\n        vec4 generate(in vec2 uv, in vec2 fragCoord, in vec2 sunpos, in float t) {\n\n            //if (fragCoord.y < -0.25) discard;\n\n            float att = 1.0;\n            float staratt = 0.0;\n            if (sunpos.y < 0.10) {\n                staratt = map(sunpos.y, 0.20, -1.0, 0.0, 1.0);\n            }\n            if (sunpos.y < -0.10) {\n                att = map(sunpos.y, -0.10, -1.0, 1.0, 0.25);\n                //sunpos.y = -sunpos.y;\n            }\n\n            vec3 O = vec3(0., height, 0.);\n\n            vec3 D = normalize(rotate_y(rotate_x(vec3(0.0, 0.0, 1.0),-uv.y*M_PI/2.0),-uv.x*M_PI+camroty));\n\n            if (D.y <= -0.15) {\n                D.y = -0.3 -D.y;\n            }\n\n            Ds= normalize(rotate_y(rotate_x(vec3(0.0, 0.0, 1.0),-sunpos.y*M_PI/2.0),-sunpos.x*M_PI));\n            float scat = 0.;\n            vec3 color = vec3(0.);\n            scatter(O, D, color, scat, t);\n            color *= att;\n\n            float starcolor = StableStarField(fragCoord * 1024.0, startreshold);\n            color += vec3(scat * starcolor * staratt);\n\n            // Water mix to bottom half, black at night\n            if (fragCoord.y < 0.0) {\n                float waterFactor = smoothstep(-0.05, 0.0, sunpos.y);\n                vec3 waterColor = vec3(70.0 / 255.0, 135.0 / 255.0, 240.0 / 255.0) * waterFactor;\n                float waterMix = smoothstep(0.0, -0.1, fragCoord.y);\n                waterColor = (color + waterColor) / 2.0;\n                color = color + (waterColor - color) * waterMix;\n            }\n\n            float env = 1.0;\n            return(vec4(env * pow(color, vec3(.7)),1.0));\n        }\n\n        void main() {\n            vec2 uv = vec2(2.0 * vUV.x - 1.0,  -2.0 *  vUV.y + 1.0);\n            vec2 sunpos = vec2(sunx,suny);\n            float t = time;\n            gl_FragColor = generate(uv, uv, sunpos,t);\n        }\n\n        ";
    // Compile
    var shaderMaterial = new ShaderMaterial("skyShader", scene, {
      vertex: "custom",
      fragment: "custom"
    }, {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    });
    var mainTexture = new Texture("/textures/skynoise.png", scene, true, false, 12); // NEAREST
    //https://www.shadertoy.com/view/ltlSWB
    shaderMaterial.setTexture("iChannel0", mainTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setFloat("offset", 10);
    shaderMaterial.setFloat("sunx", 2.0);
    shaderMaterial.setFloat("suny", 0.9);
    shaderMaterial.backFaceCulling = false;
    /*
    var time = 0;
    scene.registerBeforeRender(function () {
        var shaderMaterial = scene.getMaterialByName("skyShader");
        shaderMaterial.setFloat("time", time);
          //Animate Move Sun
        shaderMaterial.setFloat("suny", Math.sin(time/3));
        shaderMaterial.setFloat("sunx", Math.sin(time/3));
        time += 0.008;
    });
    */
    this.material = shaderMaterial;
    return shaderMaterial;
  };
  return SkyMaterialWrapper;
}();

/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars, no-var, no-undef, no-debugger, no-console,  */
/**
 * From: https://forum.babylonjs.com/t/pbr-texture-splatting-up-to-64-textures/1994/28
 *  and: https://www.babylonjs-playground.com/#LIVRIY#58
 */
var TerrainMaterialWrapper = /*#__PURE__*/function () {
  function TerrainMaterialWrapper(sceneViewer, splatmapTexture, atlasTexture, atlasNormalTexture, options) {
    var _this = this;
    if (options === void 0) {
      options = null;
    }
    // TODO: Options should be merged with defaults!
    this.tileIndexes = [];
    this.shaderinjectpoint1 = "";
    this.shaderinjectpoint2 = "";
    this.shaderinjectpoint3 = "";
    this.shaderinjectpoint4 = "";
    this.numTilesHorizontal = 0;
    this.numTilesVertical = 0;
    this.totalTiles = 0;
    this.tileScale = new Vector2(1, 1);
    this.numSplatTilesHorizontal = 0;
    this.numSplatTilesVertical = 0;
    this.totalSplatTiles = 0;
    this.splatScale = new Vector2(1, 1);
    this.splatMap = null;
    this.atlasBumpTexture = null;
    this.initialized = false;
    this.sceneViewer = sceneViewer;
    this.dedupDouble = false;
    // Compile shader only first time
    {
      this.material = this.initSplatMaterial(this.sceneViewer.scene, splatmapTexture, atlasTexture, atlasNormalTexture, options);
      TerrainMaterialWrapper.terrainMaterialShared = this.material;
    }
    // TODO: Check how much this impacts performance, it has a subtle impact on terrain and roads but it's nice to have it.
    // TODO: At least make it optional / linked to quality settings.
    this.material.reflectionTexture = this.sceneViewer.scene.environmentTexture;
    // This one is needed to control saturation due to env, should be aligned with PBRMaterials, StandarMaterials and light intensity
    this.material.environmentIntensity = this.sceneViewer.baseEnvironmentIntensity;
    this.material.onBindObservable.add(function (mesh) {
      _this.bind(mesh);
      //this.material.getEffect().setTexture("splatmap", this.splatMap);
      var ubo = _this.material['_uniformBuffer'];
      ubo.update();
    });
  }
  var _proto = TerrainMaterialWrapper.prototype;
  _proto.initSplatMaterial = function initSplatMaterial(scene, splatMap, atlas, atlasnormals, options) {
    if (options === void 0) {
      options = null;
    }
    // TODO: Options should be merged with defaults!
    var defScale = 100.0;
    if (!options) {
      options = {
        numTilesHorizontal: 4,
        numTilesVertical: 4,
        numSplatTilesHorizontal: 2,
        numSplatTilesVertical: 2,
        //tileScale:[[20.0,20.0],[20.0,20.0],[20.0,20.0]],
        splatInfos: {
          layers: [{
            "name": "Ground",
            "position": [0, 3],
            "scale": [defScale, defScale],
            "displScales": 1.0
          }],
          positions: [[0.0, 3.0], [1.0, 3.0], [2.0, 3.0], [3.0, 3.0], [0.0, 2.0], [1.0, 2.0], [2.0, 2.0], [3.0, 2.0], [0.0, 1.0], [1.0, 1.0], [2.0, 1.0], [3.0, 1.0], [0.0, 0.0], [1.0, 0.0], [2.0, 0.0], [3.0, 0.0]],
          scales: [[defScale * 0.75, defScale * 0.75], [defScale, defScale], [defScale, defScale], [defScale * 0.5, defScale * 0.5], [defScale * 0.5, defScale * 0.5], [defScale * 0.5, defScale * 0.5], [defScale, defScale], [defScale, defScale], [defScale * 1.0, defScale * 1.0], [defScale * 1.6, defScale * 1.6], [defScale, defScale], [defScale, defScale], [defScale, defScale], [defScale * 0.5, defScale * 0.5], [defScale * 0.25, defScale * 0.25], [defScale, defScale]],
          displScales: [0.0, 0, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0.0, 0.0, 0.0],
          dedupScales: [1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 0.5, 1.1],
          roughness: [1.2, 1.3, 2.5, 0.8, 0.8, 0.9, 1.0, 1.0, 1.85, 1.85, 1.15, 1.25, 1.45, 0.8, 1.0, 1.0],
          metallic: [0.2, 0.1, 0.1, 0.3, 0.3, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.0]
        }
      };
    }
    this.options = options;
    this.tileIndexes = [];
    this.shaderinjectpoint1 = "";
    this.shaderinjectpoint2 = "";
    this.shaderinjectpoint3 = "";
    this.shaderinjectpoint4 = "";
    // 4x4 = 16
    this.numTilesHorizontal = options.numTilesHorizontal;
    this.numTilesVertical = options.numTilesVertical;
    this.totalTiles = this.numTilesVertical * this.numTilesHorizontal;
    this.tileScale = new Vector2(1.0 / this.numTilesHorizontal, 1.0 / this.numTilesVertical);
    // 2x2 = 4
    this.numSplatTilesHorizontal = options.numSplatTilesHorizontal;
    this.numSplatTilesVertical = options.numSplatTilesVertical;
    this.totalSplatTiles = this.numSplatTilesVertical * this.numSplatTilesHorizontal;
    this.splatScale = new Vector2(1.0 / this.numSplatTilesHorizontal, 1.0 / this.numSplatTilesVertical);
    this.shaderinjectpoint1 += "vec2 splatScale = vec2(" + this.splatScale.x + "," + this.splatScale.y + ");\r\n";
    this.shaderinjectpoint1 += "vec2 scale = vec2(" + this.tileScale.x + "," + this.tileScale.y + ");\r\n";
    //this.shaderinjectpoint3 += 'normalW = vec3(0.0, 1.0, 0.0);\r\n';
    this.shaderinjectpoint3 += "vec4 finalColor1 = baseColor1;\r\n";
    this.shaderinjectpoint3 += "vec3 finalNormal1 = baseNormal1;\r\n";
    //this.shaderinjectpoint3 += 'finalColor1.a = 0.05;\r\n';
    this.shaderinjectpoint4 += "vec4 finalColor1 = baseColor1;\r\n";
    this.shaderinjectpoint4 += "float finalRough1 = baseRough1;\r\n";
    this.shaderinjectpoint4 += "float finalMetallic1 = baseMetallic1;\r\n";
    //this.shaderinjectpoint4 += 'finalColor1.a = 0.05;\r\n';
    var v = 0.0,
      h = 0.0;
    for (var i = 0; i < this.totalTiles; i++) {
      var tpos = Math.floor(i / 4);
      h = tpos % this.numSplatTilesHorizontal;
      v = this.numSplatTilesHorizontal - 1 - Math.floor(tpos / this.numSplatTilesHorizontal);
      if (i < this.totalTiles - 1) {
        this.shaderinjectpoint3 += "\n                     " + "//vec4 finalColor" + (i + 2) + " = finalColor" + (i + 1) + ".a >= baseColor" + (i + 2) + ".a ? finalColor" + (i + 1) + " : baseColor" + (i + 2) + ";\n                     " + "//vec4 finalColor" + (i + 2) + " = finalColor" + (i + 1) + " * (1.0 - baseColor" + (i + 2) + ".a) + baseColor" + (i + 2) + " * baseColor" + (i + 2) + ".a;\n                     " + "vec4 finalColor" + (i + 2) + " = blend(finalColor" + (i + 1) + ", " + this.options.splatInfos.displScales[i].toFixed(5) + ", baseColor" + (i + 2) + ", " + this.options.splatInfos.displScales[i + 1].toFixed(5) + "); " + "\n                     //finalColor" + (i + 2) + ".a *= 0.95;\n\n                     //vec3 finalNormal" + (i + 2) + " = finalColor" + (i + 1) + ".a >= baseColor" + (i + 2) + ".a ? finalNormal" + (i + 1) + " : baseNormal" + (i + 2) + ";\n                     vec3 finalNormal" + (i + 2) + " = blendNormal(finalColor" + (i + 1) + ", " + this.options.splatInfos.displScales[i].toFixed(5) + ", baseColor" + (i + 2) + ", " + this.options.splatInfos.displScales[i + 1].toFixed(5) + ", finalNormal" + (i + 1) + ", baseNormal" + (i + 2) + "); " + "\n                 ";
        this.shaderinjectpoint4 += "\n                     " + "vec4 finalColor" + (i + 2) + " = blend(finalColor" + (i + 1) + ", " + this.options.splatInfos.displScales[i].toFixed(5) + ", baseColor" + (i + 2) + ", " + this.options.splatInfos.displScales[i + 1].toFixed(5) + "); " + "\n                     float finalRough" + (i + 2) + " = finalColor" + (i + 1) + ".a >= baseColor" + (i + 2) + ".a ? finalRough" + (i + 1) + " : baseRough" + (i + 2) + ";\n                     float finalMetallic" + (i + 2) + " = finalColor" + (i + 1) + ".a >= baseColor" + (i + 2) + ".a ? finalMetallic" + (i + 1) + " : baseMetallic" + (i + 2) + ";\n                 ";
      }
      // Get basecolors from tiles
      this.shaderinjectpoint2 += "vec2 uv" + (i + 1) + " = vec2((vAlbedoUV.x + " + h + ".0) * splatScale.x, (vAlbedoUV.y + " + v + ".0) * splatScale.y);\r\n";
      this.shaderinjectpoint2 += "mat4 chanInfo" + (i + 1) + " = colInfo(vAlbedoUV, uv" + (i + 1) + ", " + this.options.splatInfos.dedupScales[i].toFixed(5) + ", vec2(" + this.options.splatInfos.scales[i][0] + "," + this.options.splatInfos.scales[i][1] + "), vec2(" + this.options.splatInfos.positions[i][0] + "," + this.options.splatInfos.positions[i][1] + "), " + i % 4 + ", scale, splatmap, albedoSampler, atlasNormalsSampler);\r\n";
      //this.shaderinjectpoint2 += 'vec4 baseColor' + (i + 1) +' = col(vAlbedoUV, uv' + (i + 1) + ', vec2('+this.options.splatInfos.scales[i][0]+','+this.options.splatInfos.scales[i][1]+'), vec2('+this.options.splatInfos.positions[i][0] + ','+this.options.splatInfos.positions[i][1]+'), ' + (i % 4) + ', scale, splatmap, albedoSampler, bumpSampler);\r\n';
      this.shaderinjectpoint2 += "vec4 baseColor" + (i + 1) + " = chanInfo" + (i + 1) + "[0];\r\n";
      this.shaderinjectpoint2 += "vec3 baseNormal" + (i + 1) + " = vec3(chanInfo" + (i + 1) + "[1].x, chanInfo" + (i + 1) + "[1].y, chanInfo" + (i + 1) + "[1].z);\r\n";
      this.shaderinjectpoint2 += "float baseRough" + (i + 1) + " = chanInfo" + (i + 1) + "[1].a * " + this.options.splatInfos.roughness[i].toFixed(5) + ";\r\n";
      //this.shaderinjectpoint2 += "float baseRough" + (i + 1) +" = /*chanInfo" + (i + 1) + "[1].a * */ " + this.options.splatInfos.roughness[i].toFixed(5) + ";\r\n";
      //this.shaderinjectpoint2 += "float baseRough" + (i + 1) +" = chanInfo" + (i + 1) + "[1].a; /* " + this.options.splatInfos.roughness[i].toFixed(5) + "; */\r\n";
      this.shaderinjectpoint2 += "float baseMetallic" + (i + 1) + " = " + this.options.splatInfos.metallic[i].toFixed(5) + ";\r\n";
    }
    //this.shaderinjectpoint3 += 'finalColor16 = col(vAlbedoUV, uv16, vec2(20.0, 20.0), vec2(1.0, 2.0), 0, scale, splatmap, albedoSampler);';
    this.shaderinjectpoint3 += "\n            mat3 TBN = cotangent_frame(normalW, vPositionW, vAlbedoUV, vec2(-1.0, 1.0));\n        ";
    this.shaderinjectpoint3 += "normalW = TBN * finalNormal" + this.totalTiles + ";"; // TODO: adding these vectors is incorrect
    //this.shaderinjectpoint3 += "normalW = normalize(normalW * 0.75 + 0.25 * finalNormal" + (this.totalTiles) + ");";  // TODO: adding these vectors is incorrect
    //this.shaderinjectpoint3 += 'normalW = perturbNormal(cotangentFrame, finalNormal' + (this.totalTiles) + ', 1.0);';
    //this.shaderinjectpoint3 += 'normalW = normalW;';
    //this.shaderinjectpoint3 += 'normalW.y *= -1.0;';
    //this.shaderinjectpoint3 += 'result = finalNormal' + (this.totalTiles) + ';';
    this.shaderinjectpoint3 += "result = finalColor" + this.totalTiles + ".rgb;";
    //this.shaderinjectpoint4 += 'normalW = normalW + finalNormal' + (this.totalTiles) + ';';  // TODO: adding these vectors is incorrect
    // MetallicRoughness.r is the computed metallicness
    // MetallicRoughness.g is the computed roughness
    this.shaderinjectpoint4 += "metallicRoughness.g = finalRough" + this.totalTiles + ";";
    this.shaderinjectpoint4 += "metallicRoughness.r = finalMetallic" + this.totalTiles + ";";
    //this.shaderinjectpoint4 += "metallicRoughness.r = 0.;";
    //this.shaderinjectpoint4 += "metallicRoughness.r = 0.;";
    //this.shaderinjectpoint4 += "metallicRoughness.g = 0.43;";
    //this.shaderinjectpoint4 += "reflectivityOut.microSurface = 0.0;";
    this.splatMap = splatMap;
    //this.needsUpdating = true;
    this.material = new PBRCustomMaterial("splatMaterial", scene);
    this.material.metallic = 0.0; // 0.0;
    this.material.roughness = 0.0; // 0.43 (asphalt); // 0.95;
    //this.material.indexOfRefraction = 1.4;
    //this.material.twoSidedLighting = true;
    //this.material.disableLighting = false;
    //this.material.ambientColor = new Color3(1.0, 1.0, 1.0); // Color3.Black();
    //this.material.disableBumpMap = true;
    //this.material.metallicspecularColor = new Color3(0.15, 0.15, 0.15); // Color3.Black();
    //this.material.specularIntensity = 1.0;
    //this.material.emissiveColor = new Color3(0.0, 0.0, 0.0); // Color3.Black();
    //this.material.emissiveIntensity = 0.0;
    //this.material.usePhysicalLightFalloff= false;
    //this.material.environmentIntensity = 1.0;  // This one is needed to avoid saturation due to env
    this.material.albedoTexture = atlas;
    if (atlasnormals !== null) {
      //this.material.bumpTexture = atlasnormals;
      this.atlasBumpTexture = atlasnormals;
    }
    this.material.AddUniform("splatmap", "sampler2D", {});
    this.material.AddUniform("atlasNormalsSampler", "sampler2D", {});
    this.material.Vertex_Before_PositionUpdated("\n            uvUpdated = vec2(positionUpdated.x, -positionUpdated.z);\n        ");
    this.material.Vertex_MainEnd("\n            //uvUpdated = uvUpdated + 0.5;\n        ");
    this.material.Fragment_Definitions("\n        //#define REFLECTION\n        #define TANGENT\n        //#define METALLICWORKFLOW\n        ");
    this.material.Fragment_Begin("precision highp float;\r\n" + "precision highp int;\r\n" + this.shaderinjectpoint1 + "\n\n            // From: https://github.com/BabylonJS/Babylon.js/blob/master/src/Shaders/ShadersInclude/bumpFragmentMainFunctions.fx\n\n            vec3 perturbNormalBase(mat3 cotangentFrame, vec3 normal, float scale)\n            {\n                #ifdef NORMALXYSCALE\n                    normal = normalize(normal * vec3(scale, scale, 1.0));\n                #endif\n\n                return normalize(cotangentFrame * normal);\n            }\n\n            vec3 perturbNormal(mat3 cotangentFrame, vec3 textureSample, float scale)\n            {\n                return perturbNormalBase(cotangentFrame, textureSample * 2.0 - 1.0, scale);\n            }\n\n            mat3 cotangent_frame(vec3 normal, vec3 p, vec2 uv, vec2 tangentSpaceParams)\n            {\n                // get edge vectors of the pixel triangle\n                vec3 dp1 = dFdx(p);\n                vec3 dp2 = dFdy(p);\n                vec2 duv1 = dFdx(uv);\n                vec2 duv2 = dFdy(uv);\n\n                // solve the linear system\n                vec3 dp2perp = cross(dp2, normal);\n                vec3 dp1perp = cross(normal, dp1);\n                vec3 tangent = dp2perp * duv1.x + dp1perp * duv2.x;\n                vec3 bitangent = dp2perp * duv1.y + dp1perp * duv2.y;\n\n                // invert the tangent/bitangent if requested\n                tangent *= tangentSpaceParams.x;\n                bitangent *= tangentSpaceParams.y;\n\n                // construct a scale-invariant frame\n                float invmax = inversesqrt(max(dot(tangent, tangent), dot(bitangent, bitangent)));\n                return mat3(tangent * invmax, bitangent * invmax, normal);\n            }\n\n            // Functions\n\n            float heightval(vec4 col) {\n                //return ((col.r + col.g + col.b) / 3.0);\n                return col.a;\n            }\n\n            /*\n            vec4 blend(vec4 texture1, float displScale1, vec4 texture2, float displScale2) {\n                return ((texture1.a * displScale1) > (texture2.a * displScale2) ? texture1 : texture2);\n            }\n            */\n\n            vec4 blend(vec4 texture1, float displScale1, vec4 texture2, float displScale2) {\n                if (texture2.a == 0.) return texture1;\n                if (texture1.a == 0.) return texture2;\n                float a1 = texture1.a + displScale1;\n                float a2 = texture2.a + displScale2;\n                float depth = 0.2;\n                float ma = max(texture1.a + a1, texture2.a + a2) - depth;\n\n                float b1 = max(texture1.a + a1 - ma, 0.0);\n                float b2 = max(texture2.a + a2 - ma, 0.0);\n\n                vec4 result = (texture1 * b1 + texture2 * b2) / (b1 + b2);\n                result.a = (texture1.a > 0. && texture2.a > 0.) ? (a1 + a2) / (2.0 * (b1 + b2)) : result.a;\n                return result;\n            }\n\n            vec3 blendNormal(vec4 texture1, float displScale1, vec4 texture2, float displScale2, vec3 normal1,  vec3 normal2) {\n                float a1 = texture1.a + displScale1;\n                float a2 = texture2.a + displScale2;\n                float depth = 0.2;\n                float ma = max(texture1.a + a1, texture2.a + a2) - depth;\n\n                float b1 = max(texture1.a + a1 - ma, 0.0);\n                float b2 = max(texture2.a + a2 - ma, 0.0);\n\n                vec3 result = (normal1 * b1 + normal2 * b2) / (b1 + b2);\n                result = normalize(result);\n\n                return result;\n            }\n\n\n            vec2 hash22(vec2 p)\n            {\n                p = p * mat2(127.1, 311.7, 269.5, 183.3);\n                p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);\n                return sin(p * 6.283);  // + timeScale\n            }\n\n            float interpolationNoise(vec2 p)\n            {\n                vec2 pi = floor(p);\n                vec2 pf = p-pi;\n\n                vec2 w = pf * pf * (3.-2. * pf);\n\n                float f00 = dot(hash22(pi + vec2(.0,.0)), pf-vec2(.0,.0));\n                float f01 = dot(hash22(pi + vec2(.0,1.)), pf-vec2(.0,1.));\n                float f10 = dot(hash22(pi + vec2(1.0,0.)), pf-vec2(1.0,0.));\n                float f11 = dot(hash22(pi + vec2(1.0,1.)), pf-vec2(1.0,1.));\n\n                float xm1 = mix(f00,f10,w.x);\n                float xm2 = mix(f01,f11,w.x);\n\n                float ym = mix(xm1,xm2,w.y);\n                return ym;\n\n            }\n\n            float perlinNoise2D(float x,float y)\n            {\n                int OCTAVES = 3;\n                float persistence = 0.5;\n                float sum = 0.0;\n                float frequency = 0.0;\n                float amplitude = 0.0;\n                for(int i = 0; i < OCTAVES; i++)\n                {\n                    frequency = pow(2.0, float(i));\n                    amplitude = pow(persistence, float(i));\n                    sum = sum + interpolationNoise(vec2(x * frequency, y * frequency)) * amplitude;\n                }\n\n                return sum;\n            }\n            "
    //+"vec4 col(vec2 vAlbedoUV, vec2 uvT, vec2 tile1Scale, vec2 tile1Position, int chanIdx, vec2 scale, sampler2D splatmap, sampler2D atlas, sampler2D atlasNormals) {"
    + "mat4 colInfo(vec2 vAlbedoUV, vec2 uvT, float dedupScale, vec2 tile1Scale, vec2 tile1Position, int chanIdx, vec2 scale, sampler2D splatmap, sampler2D atlas, sampler2D atlasNormals) {" + "\n                float offsetInputScale = 2.0;\n                float offsetBaseScale = 0.25;\n                vec2 offset = vec2(perlinNoise2D(offsetInputScale * (uvT.x + 0.01 * tile1Position.x), offsetInputScale * (uvT.y + 0.1 * tile1Position.y)),\n                                   perlinNoise2D(offsetInputScale * (uvT.x + 0.07 * tile1Position.y), offsetInputScale * (-uvT.y + 0.13 * tile1Position.x)));\n                offset = offset * offsetBaseScale * dedupScale;\n                "
    // if this.dedupDouble...
    /*
    + `
    vec2 offset2 = vec2(perlinNoise2D(uvT.y - 0.08 * tile1Position.x, uvT.x + 0.04 * tile1Position.y),
                        perlinNoise2D(uvT.y + 0.05 * tile1Position.y, -uvT.x + 0.19 * tile1Position.x));
    offset2 = offset * offsetBaseScale * dedupScale;
    `
    */ + "vec2 scaledUv1 = fract((vAlbedoUV + offset) * tile1Scale);" // Curvy antitiling factor
    + "scaledUv1 = scaledUv1 * (254.0/256.0) + vec2(1.0 / 256.0, 1.0 / 256.0);" + "vec2 uv1 = vec2((scaledUv1.x + tile1Position.x) * scale.x, (scaledUv1.y + tile1Position.y) * scale.y);"
    /*
    +'vec2 scaledUv2 = fract((vAlbedoUV + offset2) * tile1Scale).yx;'  // Curvy antitiling factor
    +'scaledUv2 = scaledUv2 * (254.0/256.0) + vec2(1.0 / 256.0, 1.0 / 256.0);'
    +'vec2 uv2 = vec2((scaledUv2.x + tile1Position.x) * scale.x, (scaledUv2.y + tile1Position.y) * scale.y);'
    */ + "\n                vec4 splatColor1 = texture2D(splatmap, uvT);\n                " + "\n                float dedupMix = perlinNoise2D(100.0 * uvT.x, 100.0 * uvT.y);\n                dedupMix = dedupScale > 0.0 ? smoothstep(-0.02, 0.02, dedupMix) : 0.0;\n\n                //vec4 diffuse1Color = texture2DLodEXT(atlas, uv1, -1.0);\n                vec4 diffuseColorA = texture2D(atlas, uv1);\n\n                //vec4 diffuseColorB = texture2D(atlas, uv2);\n\n                //vec4 diffuse1Color = vec4(dedupMix, 0.0, 0.0, 1.0);  // Debug dedup mix factor\n                //vec4 diffuse1Color = diffuseColorA * dedupMix + diffuseColorB * (1.0 - dedupMix);\n                vec4 diffuse1Color = diffuseColorA;\n\n                vec4 diffuseNormalA = texture2D(atlasNormals, uv1);\n                diffuseNormalA.rgb = (diffuseNormalA.rgb * 2.0 - 1.0);\n                //vec4 diffuseNormalB = texture2D(atlasNormals, uv2);\n                //diffuseNormalB.rgb = (diffuseNormalB.rgb * 2.0 - 1.0);\n\n                /*\n                vec3 diffuse1NormalVec = normalize(diffuseNormalA.xyz * dedupMix + diffuseNormalB.xyz * (1.0 - dedupMix));\n                float diffuse1NormalAlpha = diffuseNormalA.a * dedupMix + diffuseNormalB.a * (1.0 - dedupMix);\n                vec4 diffuse1Normal = vec4(diffuse1NormalVec.x, diffuse1NormalVec.y, diffuse1NormalVec.z, diffuse1NormalAlpha);\n                */\n\n                vec4 diffuse1Normal = diffuseNormalA;\n                " + "\n                float blend = (chanIdx == 0 ? splatColor1.r : (chanIdx == 1 ? splatColor1.g : (chanIdx == 2 ? splatColor1.b : splatColor1.a)));\n                //blend = 1.0;\n\n                //diffuse1Color.rgb = splatColor1.rgb;\n                //diffuse1Color.a = blend;\n\n                 //diffuse1Color.a = ((blend > 0.0) ? (heightval(diffuse1Color) * blend) : 0.0);\n                 diffuse1Color.a = ((blend > 0.0) ? (diffuse1Color.a * blend) : 0.0);\n\n                 mat4 chanInfo = mat4(diffuse1Color, vec4(diffuse1Normal.x, diffuse1Normal.y, diffuse1Normal.z, diffuse1Normal.a), vec4(0.0), vec4(0.0));\n\n                "
    //+"return diffuse1Color;"
    + "return chanInfo;" + "} ");
    this.material.Fragment_MainBegin(this.shaderinjectpoint2);
    this.material.Fragment_Custom_Albedo(this.shaderinjectpoint3);
    this.material.Fragment_Custom_MetallicRoughness(this.shaderinjectpoint4);
    return this.material;
  };
  _proto.bind = function bind(mesh) {
    //console.debug("Binding mesh for TerrainMaterial.");
    if (!this.material.getEffect()) return;
    this.material.getEffect().setTexture("splatmap", this.splatMap);
    this.material.getEffect().setTexture("atlasNormalsSampler", this.atlasBumpTexture);
    /*
      //this.material.freeze();
      //this.material.reflectionTexture = this.envReflectionProbe.cubeTexture;
    //this.sceneViewer.scene.environmentTexture = this.sceneViewer.envReflectionProbe.cubeTexture;
    //this.sceneViewer.scene.environmentTexture = this.sceneViewer.envReflectionProbe!.cubeTexture;
      //this.material.detailMap.texture = this.sceneViewer.textureDetailSurfaceImp;
    this.material.useHorizonOcclusion = true;
    if (this.sceneViewer.envReflectionProbe) {
        const reflectionTexture = this.sceneViewer.envReflectionProbe.cubeTexture;
        //this.material.reflectionTexture = reflectionTexture;
        //this.material.getEffect().setTexture( "reflectionSampler", reflectionTexture);
        this.material.getEffect().setTexture("reflectionSampler", reflectionTexture._lodTextureMid || reflectionTexture);
        this.material.getEffect().setTexture("reflectionSamplerLow", reflectionTexture._lodTextureLow || reflectionTexture);
        this.material.getEffect().setTexture("reflectionSamplerHigh", reflectionTexture._lodTextureHigh || reflectionTexture);
        //this.material.getEffect().setTexture("environmentBrdfSampler", TerrainMaterialWrapper.terrainMaterialShared!._environmentBRDFTexture);
    }
    */
    /*
    const ubo = this.material['_uniformBuffer'];
    ubo.update();
    console.debug("Done");
    */
  };
  return TerrainMaterialWrapper;
}();
TerrainMaterialWrapper.terrainMaterialShared = null;
TerrainMaterialWrapper.terrainEffectShared = null;
TerrainMaterialWrapper.matIdx = 1;

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 */
var TextMaterialWrapper = /*#__PURE__*/function () {
  function TextMaterialWrapper(sceneViewer, atlasTexture, atlasNormalTexture, options) {
    if (options === void 0) {
      options = null;
    }
    this.sceneViewer = sceneViewer;
    this.options = options;
    this.material = this.initMaterial(this.sceneViewer.scene, atlasTexture, atlasNormalTexture);
  }
  var _proto = TextMaterialWrapper.prototype;
  _proto.initMaterial = function initMaterial(scene, atlas, atlasnormals) {
    this.material = new PBRCustomMaterial("TextMaterial", scene);
    this.material.metallic = 0.05; // 0.0;
    this.material.roughness = 0.975; // 0.43 (asphalt); // 0.95;
    //this.material.indexOfRefraction = 1.4;
    //this.material.twoSidedLighting = true;
    //this.material.disableLighting = false;
    //this.material.ambientColor = new Color3(1.0, 1.0, 1.0); // Color3.Black();
    //this.material.disableBumpMap = true;
    //this.material.metallicspecularColor = new Color3(0.15, 0.15, 0.15); // Color3.Black();
    //this.material.specularIntensity = 1.0;
    //this.material.emissiveColor = new Color3(0.0, 0.0, 0.0); // Color3.Black();
    //this.material.emissiveIntensity = 0.0;
    //this.material.usePhysicalLightFalloff= false;
    //this.material.environmentIntensity = sceneViewer.baseEnvironmentIntensity;  // This one is needed to avoid saturation due to env
    this.material.albedoTexture = atlas;
    if (atlasnormals !== null) {
      //this.material.bumpTexture = atlasnormals;
      this.material.bumpTexture = atlasnormals;
    }
    this.material.Fragment_Custom_Albedo("\n            vec3 txtColor = result;\n            if (txtColor.r < 0.02) {\n                discard;\n            }\n            //vec3 col = vec3(1.0, 0.8, 0.8);\n            //vec3 col = vec3(1.0, 1.0, 1.0) * tmp;\n            //col = vec3(col.r * result.r, col.g * result.g, col.b * result.b);\n            vec3 col = vec3(0.0, 0.0, 0.0);\n            surfaceAlbedo = col;\n        ");
    /*
    this.material.onBindObservable.add(() => {
        this.update();
    });
    */
    return this.material;
  };
  _proto.update = function update() {
    //this.material.getEffect().setTexture( "splatmap", this.splatMap );
    //this.material.getEffect().setTexture( "atlasNormalsSampler", this.atlasBumpTexture );
    //this.material.reflectionTexture = this.envReflectionProbe.cubeTexture;
    //this.material.reflectionTexture = this.scene.environmentTexture;
    //this.sceneViewer.scene.environmentTexture = this.sceneViewer.envReflectionProbe.cubeTexture;
    //this.scene.environmentTexture = this.envReflectionProbe.cubeTexture;
  };
  return TextMaterialWrapper;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D models
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * ScenePosition represents
 */
var ScenePosition = function ScenePosition() {
  // Position is Lat, Lon, Altitude (currently MSL)
  this.positionWGS84 = [0, 0, 0];
  this.positionTileZoomLevel = 0;
  // Ground altitude
  this.positionGroundHeight = 0;
  this.positionHeading = 0;
  this.positionTilt = 0;
};

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * A process that can be running in a DDDViewer instance.
 * Processes are updated every frame before drawing the scene.
 */
var ViewerProcess = /*#__PURE__*/function () {
  function ViewerProcess(sceneViewer) {
    this.finished = false;
    this.time = 0;
    this.sceneViewer = sceneViewer;
    this.finished = false;
  }
  var _proto = ViewerProcess.prototype;
  _proto.update = function update(deltaTime) {
    // TODO: Consider providing an (optional) initialize() lifecycle method for processes (to be run before the first frame)
    //if (this.time == 0) initialize();
    this.time += deltaTime;
  };
  return ViewerProcess;
}();

var AnimationProcess = /*#__PURE__*/function (_ViewerProcess) {
  _inheritsLoose(AnimationProcess, _ViewerProcess);
  /**
   *
   * @param sceneViewer
   * @param animTime if set to null, the Process must manually mark itself as finished
   */
  function AnimationProcess(sceneViewer, animTime) {
    var _this;
    if (animTime === void 0) {
      animTime = null;
    }
    _this = _ViewerProcess.call(this, sceneViewer) || this;
    _this.sceneViewer = sceneViewer;
    _this.time = 0.0;
    _this.interpFactor = 0.0; // Stored as a class property for convenience of derived classes
    _this.animTime = animTime || 0;
    _this.easing = new QuadraticEase();
    _this.easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    return _this;
  }
  var _proto = AnimationProcess.prototype;
  _proto.update = function update(deltaTime) {
    // Avoid calling parent just to update deltaTime, do it here for performance
    this.time += deltaTime;
    this.interpFactor = this.animTime > 0 ? this.time / this.animTime : 1.0;
    if (this.interpFactor > 1.0) this.interpFactor = 1.0;
    // Ease interpolation
    this.interpFactor = this.easing.ease(this.interpFactor);
    if (this.animTime != null && this.time >= this.animTime) {
      this.finished = true;
    }
  };
  return AnimationProcess;
}(ViewerProcess);

var CameraMovementAnimationProcess = /*#__PURE__*/function (_AnimationProcess) {
  _inheritsLoose(CameraMovementAnimationProcess, _AnimationProcess);
  function CameraMovementAnimationProcess(sceneViewer, moveStart, moveEnd, animTime) {
    var _this;
    _this = _AnimationProcess.call(this, sceneViewer, animTime) || this;
    // Move camera adding a vertical arc which height is a factor of movement distance
    _this.moveArcHeightFactor = 0.0; // 0.05;
    _this._mslHeightStart = null;
    _this._mslHeightEnd = null;
    _this.moveStart = moveStart;
    _this.moveEnd = moveEnd;
    return _this;
  }
  var _proto = CameraMovementAnimationProcess.prototype;
  _proto.calculateMslHeights = function calculateMslHeights() {
    if (!this._mslHeightStart) {
      var startPositionScene = this.sceneViewer.wgs84ToScene(this.moveStart.positionWGS84);
      var startPositionSceneVec = new Vector3(startPositionScene[0], startPositionScene[1], startPositionScene[2]);
      var _this$sceneViewer$ele = this.sceneViewer.elevationMSLFromSceneCoords(startPositionSceneVec),
        terrainElevation = _this$sceneViewer$ele[0];
      if (terrainElevation !== null) this._mslHeightStart = terrainElevation + this.moveStart.positionGroundHeight;
    }
    if (!this._mslHeightEnd) {
      var endPositionScene = this.sceneViewer.wgs84ToScene(this.moveEnd.positionWGS84);
      var endPositionSceneVec = new Vector3(endPositionScene[0], endPositionScene[1], endPositionScene[2]);
      var _this$sceneViewer$ele2 = this.sceneViewer.elevationMSLFromSceneCoords(endPositionSceneVec),
        _terrainElevation = _this$sceneViewer$ele2[0];
      if (_terrainElevation !== null) this._mslHeightEnd = _terrainElevation + this.moveEnd.positionGroundHeight;
    }
  };
  _proto.update = function update(deltaTime) {
    _AnimationProcess.prototype.update.call(this, deltaTime);
    // Update camera interpolating between start and end
    var move_start = this.moveStart;
    var move_end = this.moveEnd;
    var sceneViewer = this.sceneViewer;
    sceneViewer.viewerState.positionWGS84 = [Scalar.Lerp(move_start.positionWGS84[0], move_end.positionWGS84[0], this.interpFactor), Scalar.Lerp(move_start.positionWGS84[1], move_end.positionWGS84[1], this.interpFactor)];
    this.calculateMslHeights();
    var heightStart = this._mslHeightStart !== null ? this._mslHeightStart : move_start.positionGroundHeight;
    var heightEnd = this._mslHeightEnd !== null ? this._mslHeightEnd : move_end.positionGroundHeight + (this._mslHeightStart !== null ? this._mslHeightStart - move_start.positionGroundHeight : 0);
    // Add arc height offset if set
    var moveDistance = [(move_end.positionWGS84[0] - move_start.positionWGS84[0]) * 111000, (move_end.positionWGS84[1] - move_start.positionWGS84[1]) * 111000];
    var moveDistanceMag = Math.sqrt(Math.pow(moveDistance[0], 2) + Math.pow(moveDistance[1], 2));
    var moveArcHeight = moveDistanceMag * this.moveArcHeightFactor;
    var moveArcOffset = Math.sin(this.interpFactor * Math.PI) * moveArcHeight;
    var mslHeight = Scalar.Lerp(heightStart, heightEnd, this.interpFactor) + moveArcOffset;
    sceneViewer.viewerState.positionGroundHeight = mslHeight - sceneViewer.viewerState.positionTerrainElevation;
    sceneViewer.viewerState.positionTilt = Scalar.Lerp(move_start.positionTilt, move_end.positionTilt, this.interpFactor);
    var startHeading = move_start.positionHeading;
    var targetHeading = move_end.positionHeading;
    if (Math.abs(move_end.positionHeading - move_start.positionHeading) > 180.0) {
      if (move_end.positionHeading - move_start.positionHeading > 0) {
        startHeading += 360;
      } else {
        startHeading -= 360;
      }
    }
    var newPositionHeading = Scalar.LerpAngle(startHeading, targetHeading, this.interpFactor);
    sceneViewer.viewerState.positionHeading = (newPositionHeading % 360 + 360) % 360;
    //sceneViewer.viewerState.positionHeading = 180 / Math.PI * Scalar.LerpAngle(move_start.positionHeading * Math.PI / 180.0, move_end.positionHeading * Math.PI / 180.0, interp_factor);
    var positionScene = sceneViewer.wgs84ToScene(sceneViewer.viewerState.positionWGS84);
    var position = new Vector3(positionScene[0], mslHeight, positionScene[2]);
    var rotation = new Vector3((90.0 - sceneViewer.viewerState.positionTilt) * (Math.PI / 180.0), sceneViewer.viewerState.positionHeading * (Math.PI / 180.0), 0.0);
    sceneViewer.camera.position = position;
    if (sceneViewer.camera instanceof TargetCamera) {
      sceneViewer.camera.rotation = rotation;
    }
  };
  return CameraMovementAnimationProcess;
}(AnimationProcess);

var DateTimeAnimationProcess = /*#__PURE__*/function (_AnimationProcess) {
  _inheritsLoose(DateTimeAnimationProcess, _AnimationProcess);
  function DateTimeAnimationProcess(sceneViewer, dtStart, dtEnd, animTime) {
    var _this;
    _this = _AnimationProcess.call(this, sceneViewer, animTime) || this;
    _this.dtStart = dtStart;
    _this.dtEnd = dtEnd;
    //console.debug("Datetime anim from " + dtStart + " to " + dtEnd);
    console.debug("TODO: Restore missing call sceneViewer.lightSetupFromDatePos();");
    return _this;
  }
  var _proto = DateTimeAnimationProcess.prototype;
  _proto.update = function update(deltaTime) {
    _AnimationProcess.prototype.update.call(this, deltaTime);
    var interpTime = (this.dtEnd.getTime() / 1000 - this.dtStart.getTime() / 1000) * this.interpFactor;
    this.sceneViewer.viewerState.positionDate = new Date(this.dtStart.getTime() + interpTime * 1000);
    //console.debug("Datetime set by animation to: " + this.sceneViewer.viewerState.positionDate);
    this.sceneViewer.lightSetupFromDatePos();
  };
  return DateTimeAnimationProcess;
}(AnimationProcess);

/**
 *
 */
var TextAnimationProcess = /*#__PURE__*/function (_AnimationProcess) {
  _inheritsLoose(TextAnimationProcess, _AnimationProcess);
  /**
   *
   * @param text Text to animate.
   * @param animTime Animation duration in seconds.
   */
  function TextAnimationProcess(sceneViewer, text, animTime) {
    var _this;
    _this = _AnimationProcess.call(this, sceneViewer, animTime) || this;
    _this.text = text;
    return _this;
  }
  var _proto = TextAnimationProcess.prototype;
  _proto.update = function update(deltaTime) {
    _AnimationProcess.prototype.update.call(this, deltaTime);
    var interpChars = Math.ceil(this.text.length * this.interpFactor);
    var interpText = this.text.substr(0, interpChars);
    this.sceneViewer.viewerState.sceneTitleText = interpText;
    if (this.finished) {
      this.sceneViewer.viewerState.sceneTitleText = null;
    }
  };
  return TextAnimationProcess;
}(AnimationProcess);

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
// TODO: this should be a ViewerProcess
var ViewerSequencer = /*#__PURE__*/function () {
  function ViewerSequencer(sceneViewer) {
    this.sceneViewer = sceneViewer;
    this.seq = null;
    this.playing = false;
    this.time = 0.0;
    this.index = 0;
    this.waitTime = 0.0;
  }
  var _proto = ViewerSequencer.prototype;
  _proto.update = function update(deltaTime) {
    if (!this.playing) {
      return;
    }
    this.time += deltaTime;
    if (this.waitTime > 0.0) {
      this.waitTime -= deltaTime;
      return;
    }
    // Run all possible steps
    while (this.index < this.seq.length && this.waitTime <= 0.0) {
      var step = this.seq[this.index];
      this.index++;
      this.runStep(step);
    }
  };
  _proto.runStep = function runStep(step) {
    console.debug("Running step: ", step);
    var command = step[0];
    //if ( ! ((command instanceof String )) throw new Error( "No command specified." );
    if (command === "m") {
      var posString = this.sceneViewer.positionString(8);
      if (posString) {
        var move_start = this.sceneViewer.parsePositionString(posString);
        var move_end = this.sceneViewer.parsePositionString(step[1]);
        var animTime = step[2];
        var moveAnimationProcess = new CameraMovementAnimationProcess(this.sceneViewer, move_start, move_end, animTime);
        console.debug(move_start, move_end, animTime);
        this.sceneViewer.processes.add(moveAnimationProcess);
      }
    } else if (command === "dt") {
      var dtStart = this.sceneViewer.viewerState.positionDate;
      console.debug(dtStart);
      var dtEnd = new Date(dtStart);
      console.debug(dtEnd);
      dtEnd.setHours(parseInt(step[1].split(":")[0]));
      dtEnd.setMinutes(parseInt(step[1].split(":")[1]));
      console.debug(dtEnd);
      var _animTime = step[2];
      var process = new DateTimeAnimationProcess(this.sceneViewer, dtStart, dtEnd, _animTime);
      this.sceneViewer.processes.add(process);
    } else if (command === "t") {
      var text = step[1];
      var _animTime2 = step[2];
      var _process = new TextAnimationProcess(this.sceneViewer, text, _animTime2);
      this.sceneViewer.processes.add(_process);
    } else if (command === "s") {
      this.waitTime = step[1];
      /*} else if ( command === "u" ) {
      const url = step[1];
      // Do not change URL if in settings
      if ( this.sceneViewer.app.$route.name !== "sceneTools" ) {
          this.sceneViewer.app.$router.push( url );
      }*/
    } else if (command === "goto") {
      this.index = step[1];
    } else if (command.startsWith("#")) ; else {
      // Unknown step type
      console.debug("Invalid sequence step: ", step);
    }
  };
  _proto.play = function play(seq) {
    console.debug("Playing sequence: ", seq);
    this.sceneViewer.camera.detachControl();
    this.sceneViewer.viewerState.sceneViewModeShow = false;
    this.seq = seq;
    this.playing = true;
    this.time = 0.0;
    this.index = 0;
  };
  return ViewerSequencer;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * Holds DDDViewer global state like viewer position, date/time, configuration...
 * Some internal values are also stored here for convenience (FPS, drawcalls, mobile detection...).
 * This object must be JSON-serializable.
 */
var ViewerState = function ViewerState(dddConfig, initialCoords) {
  if (initialCoords === void 0) {
    initialCoords = null;
  }
  this.mapVisible = true;
  this.sceneVisible = false;
  this.isMobile = false;
  this.positionTileZoomLevel = 11;
  this.positionWGS84 = [-8.726, 42.233]; // [0.0, 0.0];
  // Position in scene, in engine coordinates (elevation is Y)
  this.positionScene = [0, 0, 0];
  this.positionGroundHeight = 150.0;
  this.positionTerrainElevation = 0;
  this.positionHeading = 0.0;
  this.positionTilt = 0.0;
  this.positionName = null;
  this.positionDate = new Date();
  this.positionDateSeconds = this.positionDate.getTime() / 1000;
  this.geolocationEnabled = false;
  this.timeScale = 24 * 2; // 24 * 2 = 48x faster (1 day = 30 min)
  // TODO: These nodes are instrumented: remove selectedMesh from here and use ids.
  // TODO: Try removing this and this.sceneViewer id still used
  this.sceneSelectedMesh = null;
  this.sceneSelectedMeshId = null;
  this.sceneFPS = 0;
  this.sceneDrawCalls = 0;
  this.sceneTriangles = 0;
  this.sceneShadowsEnabled = false;
  this.sceneTextsEnabled = false;
  this.scenePostprocessingEnabled = false;
  this.scenePickingEnabled = true;
  this.sceneViewModeShow = true;
  this.sceneSelectedShowNormals = true;
  this.sceneTileDrawDistance = 1;
  this.sceneMoveSpeed = 5;
  this.sceneEnvironmentProbe = 16; // 16; // null to use a static environment (should be associated to the skybox, but it's currently fixed)
  this.sceneSkybox = "/textures/TropicalSunnyDay"; // /textures/skybox/clouds1/clouds1 // "@dynamic"; // ""/textures/TropicalSunnyDay";
  // TODO: This shall be a per-layer setting
  this.sceneGroundTextureOverrideUrl = null;
  this.sceneTitleText = null;
  /**
   * 3dsmaps DDD tile server supports on-demand generation. When a tile that's not available is enqueued, it responds
   * with information about the job status. This array contains enqueued tiles status.
   */
  this.remoteQueueJobsStatus = [];
  this.dddConfig = dddConfig;
  if (dddConfig.defaultCoords) {
    this.positionWGS84 = dddConfig.defaultCoords;
  }
  if (initialCoords) {
    this.positionWGS84 = initialCoords;
  }
  var shadowsEnabled = localStorage.getItem("dddSceneShadowsEnabled");
  this.sceneShadowsEnabled = shadowsEnabled ? JSON.parse(shadowsEnabled) : this.sceneShadowsEnabled;
  var textsEnabled = localStorage.getItem("dddSceneTextsEnabled");
  this.sceneTextsEnabled = textsEnabled ? JSON.parse(textsEnabled) : this.sceneTextsEnabled;
  this.sceneTileDrawDistance = dddConfig.sceneTileDrawDistanceDefault;
  // Start time
  this.positionDate.setHours(11);
  this.positionDate.setMinutes(0);
};

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D models
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * A reference to a "logical" object in the scene.
 *
 * Like real scene mesh objects, DDDObjectRefs have metadata, a path, parent and children.
 *
 * This allows to reference sets of triangles in larger objects (eg. if several logical objects were
 * batched into a larger mesh at design time or elsewhere).
 *
 * TODO: Reference the containing layer so each layer can resolve its objects.
 */
var DDDObjectRef = /*#__PURE__*/function () {
  function DDDObjectRef(mesh, submeshIdx) {
    if (submeshIdx === void 0) {
      submeshIdx = -1;
    }
    this.submeshIdx = -1;
    this.faceIndexStart = -1;
    this.faceIndexEnd = -1;
    this.mesh = mesh;
    this.submeshIdx = submeshIdx;
    if (this.submeshIdx > -1) {
      var metadata = DDDObjectRef.nodeMetadata(mesh);
      var indexes = 'ddd:combined:indexes' in metadata ? metadata['ddd:combined:indexes'] : metadata['ddd:batch:indexes'];
      if (indexes && submeshIdx in indexes) {
        this.faceIndexStart = submeshIdx > 0 ? indexes[submeshIdx - 1][0] : 0;
        this.faceIndexEnd = indexes[submeshIdx][0];
      }
    }
    /*
    metadata = indexes[i][1];
      // WARN: TODO: this transformation is done in other places
    let meshName = null;
    if (!combined) {
        meshName = pickResult.pickedMesh.id.split("/").pop().replaceAll('#', '_'); // .replaceAll("_", " ");
    } else {
        meshName = metadata['ddd:path'].split("/").pop().replaceAll('#', '_'); // .replaceAll("_", " ");
    }
    */
  }
  DDDObjectRef.nodeMetadata = function nodeMetadata(node) {
    if (node && node.metadata && node.metadata.gltf && node.metadata.gltf.extras) {
      return node.metadata.gltf.extras;
    } else if (node.metadata !== null) {
      return node.metadata;
    } else {
      return null;
    }
  };
  DDDObjectRef.fromMeshFace = function fromMeshFace(mesh, faceIndex) {
    //console.debug("Selecting from mesh and face (mesh=" + mesh.id + ", faceIndex=" + faceIndex + ")");
    var metadata = DDDObjectRef.nodeMetadata(mesh);
    var subIndex = -1;
    if (metadata) {
      if ('ddd:combined:indexes' in metadata || 'ddd:batch:indexes' in metadata) {
        var indexes = 'ddd:combined:indexes' in metadata ? metadata['ddd:combined:indexes'] : metadata['ddd:batch:indexes'];
        // Find triangle in indexes
        var prevIndex = -1;
        //if (indexes.length > 0) { subIndex = 0; }
        for (var i = 0; i < indexes.length; i++) {
          if (faceIndex > prevIndex && faceIndex < indexes[i][0]) {
            subIndex = i;
            break;
          }
          prevIndex = indexes[i][0];
        }
      }
    }
    var objectRef = new DDDObjectRef(mesh, subIndex);
    return objectRef;
  }
  /*
  findChildByName(name: string): DDDObjectRef | null {
      return null;
  }
  */;
  var _proto = DDDObjectRef.prototype;
  _proto.getMetadata = function getMetadata() {
    var metadata = DDDObjectRef.nodeMetadata(this.mesh);
    if (metadata && this.submeshIdx >= 0) {
      var indexes = 'ddd:combined:indexes' in metadata ? metadata['ddd:combined:indexes'] : metadata['ddd:batch:indexes'];
      metadata = indexes[this.submeshIdx][1];
    }
    return metadata;
  };
  DDDObjectRef.urlId = function urlId(value) {
    var result = value;
    if (result) {
      result = result.replaceAll("/", "-");
      result = result.replaceAll("#", "_");
      result = result.replaceAll(" ", "_");
      result = encodeURIComponent(result);
      result = result.replaceAll("%3A", ":");
      //result = result.replace("/", "_");
      //result = result.replace("#", "_");
    }

    return result;
  };
  _proto.getId = function getId() {
    var metadata = this.getMetadata();
    var result = this.mesh.id;
    if (metadata && 'ddd:rpath' in metadata) {
      result = metadata['ddd:rpath'];
    } else if (metadata && 'ddd:path' in metadata) {
      result = metadata['ddd:path'];
    }
    return result;
  };
  _proto.getUrlId = function getUrlId() {
    var result = this.getId();
    result = DDDObjectRef.urlId(result);
    return result;
  };
  _proto.getLabel = function getLabel() {
    var result = this.getId();
    return result;
  };
  _proto.getChildren = function getChildren() {
    var result = [];
    //if (this.submeshIdx < 0) {
    for (var _iterator = _createForOfIteratorHelperLoose(this.mesh.getChildren()), _step; !(_step = _iterator()).done;) {
      var child = _step.value;
      result.push(new DDDObjectRef(child));
    }
    //}
    var metadata = this.getMetadata();
    if (metadata && ('ddd:combined:indexes' in metadata || 'ddd:batch:indexes' in metadata)) {
      var indexes = 'ddd:combined:indexes' in metadata ? metadata['ddd:combined:indexes'] : metadata['ddd:batch:indexes'];
      for (var i = 0; i < indexes.length; i++) {
        result.push(new DDDObjectRef(this.mesh, i));
      }
    }
    return result;
  };
  _proto.getParent = function getParent() {
    var result = null;
    var parent = this.mesh.parent;
    if (parent) {
      result = new DDDObjectRef(parent);
    }
    return result;
  };
  return DDDObjectRef;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 * A Camera and Input controller.
 *
 * This allows controlling the main camera, which is the main interface for viewing.
 * Controllers process input devices if they wish to respond to user input.
 *
 * Client code may use custom controllers or disable these controllers
 * and position the camera manually.
 */
var BaseCameraController = /*#__PURE__*/function () {
  function BaseCameraController(dddViewer) {
    // Reference to DDDViewer
    this.dddViewer = dddViewer;
    // Babylon camera which we are controlling
    //this.camera = dddViewer.camera;
  }
  var _proto = BaseCameraController.prototype;
  _proto.getCamera = function getCamera() {
    return this.dddViewer.camera;
  };
  return BaseCameraController;
}();

/**
 * DDD Viewer base layer class.
 */
var FreeCameraController = /*#__PURE__*/function (_BaseCameraController) {
  _inheritsLoose(FreeCameraController, _BaseCameraController);
  function FreeCameraController() {
    var _this;
    _this = _BaseCameraController.apply(this, arguments) || this;
    _this.fixMinHeight = false;
    return _this;
  }
  var _proto = FreeCameraController.prototype;
  _proto.update = function update(deltaTime) {
    // Fix viewer to floor
    if (this.fixMinHeight) {
      var terrainElevation = this.dddViewer.viewerState.positionTerrainElevation;
      if (terrainElevation && this.dddViewer.camera.position.y < terrainElevation + 1.0) {
        this.getCamera().position.y = terrainElevation + 1.0;
      }
    }
  };
  _proto.activate = function activate() {
    if (this.dddViewer.camera) {
      this.dddViewer.camera.customRenderTargets.length = 0; //4 = [];
      this.dddViewer.camera.detachControl();
      this.dddViewer.camera.dispose();
    }
    //console.debug("Creating free camera.");
    var camera = new UniversalCamera("Camera", Vector3.Zero(), this.dddViewer.scene);
    camera.minZ = 1.0; // 0.1;
    camera.maxZ = 4500;
    camera.angularSensibility = 500.0;
    camera.touchAngularSensibility = 1000.0;
    //camera.touchMoveSensibility = 1.0;
    camera.inertia = 0.0;
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera.keysUpward.push(69);
    camera.keysDownward.push(81);
    camera.attachControl(this.dddViewer.engine.getRenderingCanvas(), true);
    camera.fov = 40.0 * (Math.PI / 180.0); // 35.0 might be GM, 45.8... is default  // 35
    var positionScene = this.dddViewer.wgs84ToScene(this.dddViewer.viewerState.positionWGS84);
    camera.position = new Vector3(positionScene[0], this.dddViewer.viewerState.positionGroundHeight + this.dddViewer.viewerState.positionTerrainElevation + 1, positionScene[2]);
    camera.rotation = new Vector3((90.0 - this.dddViewer.viewerState.positionTilt) * (Math.PI / 180.0), this.dddViewer.viewerState.positionHeading * (Math.PI / 180.0), 0.0);
    //camera.cameraRotation = new Vector2(/* (90.0 - this.viewerState.positionTilt) * (Math.PI / 180.0) */ 0, this.viewerState.positionHeading * (Math.PI / 180.0));
    this.dddViewer.camera = camera;
    this.dddViewer.setMoveSpeed(this.dddViewer.viewerState.sceneMoveSpeed);
    this.dddViewer.updateRenderTargets();
    if (this.dddViewer.shadowGenerator) {
      this.dddViewer.shadowGenerator.splitFrustum();
    }
  };
  return FreeCameraController;
}(BaseCameraController);

/**
 * This is the main DDDViewer library entry point. Represents a DDDViewer instance.
 */
var SceneViewer = /*#__PURE__*/function () {
  /**
   * Constructs a new DDDViewer instance, and mounts it on the given HTMLCanvasElement.
   * @param canvas
   * @param viewerState
   */
  function SceneViewer(canvas, dddConfig) {
    if (dddConfig === void 0) {
      dddConfig = null;
    }
    /*
    // Accept selector for canvas
    if (canvas instanceof String) {
        canvas = document.getElementById('ddd-scene');
    }
    */
    this.sceneInstru = null;
    this.cameraController = null;
    this.highlightMeshes = [];
    //materialHighlight: Material | null = null;
    this.materialHighlight = null;
    //walkMode: boolean = false;
    this.useSplatMap = false;
    this.ambientColorNight = new Color3(0, 0, 0.1);
    this.ambientColorDay = new Color3(0.70, 0.70, 0.7);
    this.colorLightLamp = new Color3(250 / 255, 244 / 255, 192 / 255);
    this.colorLightRed = new Color3(512 / 255, 0 / 255, 0 / 255);
    this.colorLightGreen = new Color3(50 / 255, 512 / 255, 50 / 255);
    this.colorLightOrange = new Color3(255 / 255, 157 / 255, 0 / 255);
    this.lastDateUpdate = new Date().getTime();
    this.selectedMesh = null;
    this.sceneSelectedMeshId = null;
    this.selectedObject = null;
    this.materialWater = null; // WaterMaterial | null = null;
    this.materialOcean = null;
    this.materialText = null;
    this.materialFlare = null;
    this.baseEnvironmentIntensity = 1.0;
    this.envReflectionProbe = null;
    this.light = null;
    this.shadowGenerator = null;
    this.lensFlareSystem = null;
    this.textureDetailSurfaceImp = null;
    this.skybox = null;
    this.splatmapAtlasTexture = null;
    this.splatmapAtlasNormalsTexture = null;
    this._previousLampPatOn = null;
    this._geolocationWatchId = null;
    this._decimator = 0;
    // Resolve default properties
    if (dddConfig == null) {
      dddConfig = new DDDViewerConfig();
    } else {
      dddConfig = Object.assign(new DDDViewerConfig(), dddConfig);
    }
    this.viewerState = new ViewerState(dddConfig);
    this.canvas = canvas;
    this.element = canvas.parentElement;
    this.layerManager = new LayerManager(this);
    this.queueLoader = new QueueLoader(this);
    this.originShiftWGS84 = [0, 0];
    this.projection = proj4__default("EPSG:4326");
    this.tileGrid = createXYZ({
      extent: extentFromProjection("EPSG:3857")
    });
    this.catalog = {};
    this.catalog_materials = {};
    this.instanceRoots = {};
    // Dependencies to not yet loaded objects, in order to process them
    this.depends = [];
    this.lastDateUpdate = new Date().getTime();
    this.processes = new ViewerProcessManager(this);
    this.sequencer = new ViewerSequencer(this);
    // Associate a Babylon Engine to it (engine:  canvas, antialiasing, options, adaptToDeviceRatio)
    this.engine = new Engine(canvas, true); // , null, true); // , { stencil: true });
    // Note: useGeometryIdsMap=true seems to help only when there are already too many objects, but performance is (slightly) better without it if object count is low
    this.scene = new Scene(this.engine, {
      useGeometryIdsMap: true
    });
    this.camera = this.initCamera();
    //that.scene = createScene(engine, canvas);
    //this.scene.freezeActiveMeshes(true);  // affects too many things, causes wrong behavior (skybox, etc)
    //this.octree = null;
    this.initialize();
  }
  var _proto = SceneViewer.prototype;
  _proto.initialize = function initialize() {
    var _this = this;
    // Initialize scene projection for WGS84 coordinates
    var coords = this.viewerState.positionWGS84;
    this.registerProjectionForCoords(coords);
    this.scene.pointerMovePredicate = function () {
      return false;
    };
    this.scene.pointerDownPredicate = function () {
      return false;
    };
    //this.sceneInstru = null;
    this.sceneInstru = new SceneInstrumentation(this.scene);
    //that.highlightLayer = new HighlightLayer("hl1", that.scene);
    // Initialize camera controller
    this.cameraController = new FreeCameraController(this);
    // Materials
    this.initializeMaterials();
    // Environment
    this.envReflectionProbe = null;
    if (this.viewerState.sceneEnvironmentProbe !== null) {
      //console.debug("Creating reflection probe.");
      this.envReflectionProbe = new ReflectionProbe("envReflectionProbe", this.viewerState.sceneEnvironmentProbe, this.scene, true, true);
      this.envReflectionProbe.refreshRate = 6;
      this.envReflectionProbe.position = new Vector3(0, 0, 0);
      // Assign to a material to see it
      //var pbr = new PBRMaterial('envReflectionTestMaterial', this.scene);
      //pbr.reflectionTexture = this.envReflectionProbe.cubeTexture;
      // Note that material needs to be added to the camera custom render targets to be updated
      this.scene.environmentTexture = this.envReflectionProbe.cubeTexture;
    } else {
      //this.scene.createDefaultEnvironment();
      //var hdrTexture = new CubeTexture.CreateFromPrefilteredData("/textures/environment.env", this.scene);
      var hdrTexture = CubeTexture.CreateFromPrefilteredData("/textures/country.env", this.scene);
      this.scene.environmentTexture = hdrTexture;
    }
    // Skybox
    this.loadSkybox(this.viewerState.sceneSkybox);
    // Load fonts (after environment, or the call to add to catalog will miss PBR environment texture)
    //const fontAtlasTexture = (<PBRMaterial>mesh.material).albedoTexture;
    var atlasTextureUrl = this.viewerState.dddConfig.assetsUrlbase + "/dddfonts_01_64.greyscale.png";
    var fontAtlasTexture = new Texture(atlasTextureUrl, this.scene, false, false);
    var tmw = new TextMaterialWrapper(this, fontAtlasTexture, null);
    tmw.material.zOffset = -10;
    this.materialText = tmw.material;
    this.addMaterialToCatalog("DDDFonts-01-64", this.materialText, {
      "zoffset": -10
    }, false);
    // Render Pipeline config and Postprocessing
    /*
    this.initRenderPipeline();
    this.updateRenderPipeline();
    */
    // Lighting
    //this.scene.ambientColor = this.ambientColorDay.clone();
    //this.scene.ambientColor = new Color3(0, 0, 0);
    this.scene.ambientColor = new Color3(0.3, 0.3, 0.3);
    /*
    that.lightHemi = new HemisphericLight("lightHemi", new Vector3(-0.5, 1, -1), that.scene);
    that.lightHemi.intensity = 1.15;
    that.lightHemi.diffuse = new Color3(0.95, 0.95, 1);
    that.lightHemi.specular = new Color3(1, 1, 0.95);
    that.lightHemi.groundColor = new Color3(0.95, 1, 0.95);
    */
    this.light = new DirectionalLight("light", new Vector3(0.3, -0.5, 0.5).normalizeToNew(), this.scene);
    this.light.diffuse = new Color3(0.95, 0.95, 1.00);
    this.light.specular = new Color3(1, 1, 0.95);
    this.light.intensity = 2.8;
    /*
    that.light2 = new DirectionalLight("light2", new Vector3(-0.3, -0.5, -0.5).normalizeToNew(), that.scene);
    that.light.diffuse = new Color3(223 / 255, 242 / 255, 196 / 255);
    that.light.specular = new Color3(1, 1, 0.95);
    that.light2.intensity = 1.5;
    */
    this.shadowGenerator = null;
    if (this.viewerState.sceneShadowsEnabled) {
      this.shadowGenerator = new CascadedShadowGenerator(1024, this.light);
      this.shadowGenerator.bias = 0.002; // 0.002 Makes grass appear slightly floating but prevents the full scene ground to be self-shadowed  0.001 avoid the gap but already produces self-shadowing
      //that.shadowGenerator.debug = true;
      this.shadowGenerator.shadowMaxZ = 500;
      //this.shadowGenerator.autoCalcDepthBounds = true;  // Enabling it causes shadow artifacts after switching cameras (?)
      this.shadowGenerator.penumbraDarkness = 0.8;
      this.shadowGenerator.lambda = 1.0;
      //that.shadowGenerator.depthClamp = false;
      //that.shadowGenerator.freezeShadowCastersBoundingInfo = true;
      // Rendering backfaces for shadows for under-terrain shadows, and reduces the need for bias
      // TODO: Shall be needed only for terrain if possible 
      // TODO: Make a setting
      this.shadowGenerator.forceBackFacesOnly = true;
      this.shadowGenerator.splitFrustum();
    }
    var lensFlareEmitter = new Mesh("lensFlareEmitter", this.scene);
    this.lensFlareSystem = new LensFlareSystem("lensFlareSystem", lensFlareEmitter, this.scene);
    var flareScale = 0.5;
    new LensFlare(flareScale * 0.2, 0, new Color3(1, 1, 1), "/textures/Flare2.png", this.lensFlareSystem);
    new LensFlare(flareScale * 0.5, 0.2, new Color3(0.5, 0.5, 1), "/textures/flare3.png", this.lensFlareSystem);
    new LensFlare(flareScale * 0.2, 1.0, new Color3(1, 1, 1), "/textures/flare3.png", this.lensFlareSystem);
    new LensFlare(flareScale * 0.4, 0.4, new Color3(1, 0.5, 1), "/textures/flare.png", this.lensFlareSystem);
    new LensFlare(flareScale * 0.1, 0.6, new Color3(1, 1, 1), "/textures/flare3.png", this.lensFlareSystem);
    new LensFlare(flareScale * 0.3, 0.8, new Color3(1, 1, 1), "/textures/Flare2.png", this.lensFlareSystem);
    // Setup lighting, flares, etc.
    this.lightSetupFromDatePos();
    //var ssao = new SSAORenderingPipeline('ssaopipeline', that.scene, 0.75);
    this.loadCatalog(this.viewerState.dddConfig.assetsUrlbase + "/catalog.glb", false);
    this.loadTextures();
    // Render every frame
    this.engine.runRenderLoop(function () {
      if (!_this.scene) {
        return;
      }
      var deltaTime = _this.engine.getDeltaTime() / 1000.0;
      _this.update(deltaTime);
      _this.scene.render();
    });
    // Performance
    // Avoid clear calls, as there's always a skybox
    this.scene.autoClear = false; // Color buffer
    this.scene.autoClearDepthAndStencil = false; // Depth and stencil
    this.scene.blockMaterialDirtyMechanism = true;
    this.scene.setRenderingAutoClearDepthStencil(1, false, false, false); // For objects in front of layer 0 (buildings and instances)
  };
  _proto.initializeMaterials = function initializeMaterials() {
    // Some hard-coded materials used by DDD
    /*
    const water = new StandardMaterial("water", this.scene);
    water.specularTexture = new Texture("/textures/reflectivity.png", this.scene);
    //water.ambientColor = new Color3(0.0, 0.0, 1.0);
    water.diffuseColor = new Color3(0.0, 0.0, 1.0);
    water.specularColor = new Color3(0.0, 0.0, 1.0);
    //water.alphaMode = Material.MATERIAL_ALPHABLEND;
    //water.transparencyMode = Material.MATERIAL_ALPHABLEND;
    //water.alpha = 0.6;
    */
    var water = new WaterMaterial("water", this.scene, new Vector2(512, 512));
    water.bumpTexture = new Texture("/textures/waterbump.png", this.scene);
    water.waveLength = 15.0; // def: 0.1
    water.waveHeight = 0.04; // def: 0.4
    water.waveSpeed = 50.0; // def: 1
    water.windForce = 1.0; // def: 6
    //water.waveCount = 1.0;        // def: 20
    water.windDirection = new Vector2(0.75, 1.3);
    water.bumpHeight = 0.4; // def: 0.4
    water.alpha = 0.5;
    water.transparencyMode = 2; // 2  ALPHA_BLEND  3;  // ALPHA_TEST_AND_BLEND
    water.bumpAffectsReflection = true; // true;
    //water.bumpSuperimpose = true;
    //water.fresnelSeparate = true;
    //water.waterColor = new Color3( 0.0, 0.0, 0.0 );   // def: 0.1 0.1 0.6
    //water.waterColor2 = new Color3( 0.0, 0.0, 0.0 );  // def: 0.1 0.1 0.6
    water.colorBlendFactor = 0.7; // def: 0.2
    water.colorBlendFactor2 = 0.7; // def: 0.2
    water.backFaceCulling = false;
    //water.specularPower = 0.05;      // def: 64
    water.specularColor = new Color3(0.1, 0.1, 0.05); // def: 0,0,0
    water.diffuseColor = new Color3(0.2, 0.2, 0.2); // def: 1,1,1
    this.scene.setRenderingAutoClearDepthStencil(1, false, false, false);
    this.scene.setRenderingAutoClearDepthStencil(2, false, false, false);
    //this.scene.setRenderingAutoClearDepthStencil(3, false, false, false);
    //water.addToRenderList(ground);
    //let waterOcean = createOceanMaterial(this.scene);
    this.materialWater = water;
    // Load flare texture and apply it
    /*
    const flareMaterial = new StandardMaterial("lightFlare", this.scene);
    //flareMaterial.specularTexture = new Texture("/textures/flare3.png", this.scene);
    flareMaterial.diffuseTexture = new Texture("/textures/flare.png", this.scene);
    flareMaterial.diffuseTexture.hasAlpha = true;
    flareMaterial.useAlphaFromDiffuseTexture = true;
    //water.ambientColor = new Color3(0.0, 0.0, 1.0);
    flareMaterial.diffuseColor = new Color3(1.0, 1.0, 1.0);
    //flareMaterial.specularColor = new Color3(1.0, 1.0, 1.0);
    flareMaterial.alphaMode = 1;  // ALPHA_ADD
    flareMaterial.alpha = 0.30;
    flareMaterial.emissiveColor = new Color3(1.0, 1.0, 1.0);
    flareMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;  // ALPHA_TEST
    //flareMaterial.backFaceCulling = false;
    flareMaterial.disableLighting = true;
    //flareMaterial.disableDepthWrite = true;
    
    this.materialFlare = flareMaterial;
    */
    /*
    NodeMaterial.ParseFromSnippetAsync("#3FU5FG#1", this.scene).then((mat) => {
        //ground.material = mat;
        //window.mat = mat;
        this.materialOcean = mat;
    });
    */
    /*
    that.materialGrass = new StandardMaterial("bawl", that.scene);
    that.textureGrass = new GrassProceduralTexture("textbawl", 256, that.scene);
    that.materialGrass.ambientTexture = that.textureGrass;
    */
    this.materialHighlight = new StandardMaterial("materialHighlight", this.scene);
    this.materialHighlight.diffuseColor = new Color3(1, 0, 1);
    //that.materialHighlight.specularColor = new Color3(1, 1, 1);
    this.materialHighlight.emissiveColor = new Color3(1.0, 1.0, 1.);
    this.materialHighlight.wireframe = true;
    this.materialHighlight.disableLighting = true;
    this.materialHighlight.backFaceCulling = true;
    this.textureDetailSurfaceImp = new Texture("/textures/SurfaceImperfections12_ddd.png", this.scene);
    // Shader
    /*
    Effect.ShadersStore["customVertexShader"]= `
        precision highp float;
          // Attributes
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
          // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;
          // Varying
        //varying vec2 vUV;
          void main(void) {
            vec3 p = position;
            p.x = p.x + sin(2.0 * position.y + time);
            p.y = p.y + sin(time + 4.0);
            gl_Position = worldViewProjection * vec4(p, 1.0);
              //vUV = uv;
    }`;
    */
  };
  _proto.loadSkybox = function loadSkybox(baseUrl) {
    // Remove skybox
    if (this.skybox) {
      if ("getRenderList" in this.materialWater) {
        this.materialWater.getRenderList().length = 0;
      }
      if (this.viewerState.sceneEnvironmentProbe) {
        this.envReflectionProbe.renderList.length = 0;
      }
      this.skybox.dispose();
      this.skybox = null;
    }
    // Set skybox
    if (baseUrl === "@dynamic") {
      var skybox = Mesh.CreateSphere("skyBox", 30, 3000, this.scene);
      var skyboxMaterial = new SkyMaterialWrapper(this.scene).material;
      skyboxMaterial.disableDepthWrite = true;
      skybox.material = skyboxMaterial;
      skybox.infiniteDistance = true;
      skybox.applyFog = false;
      this.skybox = skybox;
    } else if (baseUrl !== null) {
      var _skybox = MeshBuilder.CreateBox("skyBox", {
        size: 3000.0
      }, this.scene);
      var _skyboxMaterial = new StandardMaterial("skyBox", this.scene);
      _skyboxMaterial.backFaceCulling = false;
      _skyboxMaterial.reflectionTexture = new CubeTexture(baseUrl, this.scene);
      _skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
      _skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
      _skyboxMaterial.specularColor = new Color3(0, 0, 0);
      _skyboxMaterial.disableDepthWrite = true;
      _skybox.material = _skyboxMaterial;
      _skybox.infiniteDistance = true;
      _skybox.applyFog = false;
      this.skybox = _skybox;
    }
    console.debug("Adding skybox env");
    if (this.skybox) {
      this.skybox.renderingGroupId = 1; //Ideally in group 1, after meshes (to avoid overdraw), but... Seems is rendered in group 0 for it to be applied to the reflections on water and objects, but it hsould be the enviornment :??
      //this.skybox.renderingGroupId = 3;  // 
      //this.scene.setRenderingAutoClearDepthStencil(3, false, false, false);
      //let skyboxReflection = this.skybox; // .clone();
      //skyboxReflection.renderingGroupId = 0;
      this.envReflectionProbe.renderList.push(this.skybox);
      if ("getRenderList" in this.materialWater) {
        //let skyboxWater = this.skybox.clone();
        /*
        const skyboxWater = MeshBuilder.CreateBox( "skyBox", { size: 3000.0 }, this.scene );
        const skyboxProbeMaterial = new StandardMaterial( "skyBox", <Scene> this.scene );
        skyboxProbeMaterial.backFaceCulling = false;
        if (this.envReflectionProbe != null) {
            skyboxProbeMaterial.reflectionTexture = this.envReflectionProbe?.cubeTexture; //
            skyboxProbeMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        }
        skyboxProbeMaterial.diffuseColor = new Color3( 0, 0, 0 );
        skyboxProbeMaterial.specularColor = new Color3( 0, 0, 0 );
        skyboxProbeMaterial.disableDepthWrite = true;
        skyboxWater.material = skyboxProbeMaterial;
        
        skyboxWater.renderingGroupId = 2;
          (<WaterMaterial> this.materialWater!).addToRenderList(skyboxWater);
        */
        //(<WaterMaterial> this.materialWater!).addToRenderList(this.skybox); 
        this.materialWater.markDirty();
      }
    }
  };
  _proto.showFullScreen = function showFullScreen() {
    if (this.engine) {
      this.engine.switchFullscreen(true);
    }
  }
  /*
  showDebugView(): void {
      // Show BabylonJS Inspector
      this.scene!.debugLayer.show({ overlay: true });
  }
  */;
  _proto.loadCatalog = function loadCatalog(filename, loadMaterials) {
    var _this2 = this;
    console.debug("Loading catalog: " + filename);
    SceneLoader.ImportMesh(null, filename, "", this.scene,
    //this.scene,
    // onSuccess
    function (newMeshes, _particleSystems, _skeletons) {
      //console.log("GLB loaded", newMeshes);
      _this2.loadCatalogFromMesh(newMeshes[0], loadMaterials);
      newMeshes[0].setParent(null);
      newMeshes[0].setEnabled(false);
      //newMeshes[0].isVisible = false;
      //newMeshes[0].dispose();
      _this2.processDepends();
    }, function (_event) {}, function (_scene, _msg, ex) {
      console.debug("Could not load scene catalog: " + filename, ex);
    });
  };
  _proto.processDepends = function processDepends() {
    var _this3 = this;
    //console.debug( "Processing dependencies: ", this.depends);
    var dependsCopy = [].concat(this.depends);
    var _loop = function _loop() {
      var dep = _step.value;
      _this3.depends = _this3.depends.filter(function (item) {
        return item !== dep;
      });
      _this3.processMesh(dep, dep);
    };
    for (var _iterator = _createForOfIteratorHelperLoose(dependsCopy), _step; !(_step = _iterator()).done;) {
      _loop();
    }
  };
  _proto.loadCatalogFromMesh = function loadCatalogFromMesh(mesh, loadMaterials) {
    if (mesh && mesh.metadata && mesh.metadata.gltf && mesh.metadata.gltf.extras) {
      var metadata = mesh.metadata.gltf.extras;
      // Add color material
      /*
      let key = metadata['ddd:material'];
      let mat = this.catalog_materials[key];
      if (key && key.startsWith("Color") && mesh.material && !mat) {
          console.debug("Adding color material " + mesh.material + " to catalog: " + key);
          mat = mesh.material;
          mat.name = key;
          this.catalog_materials[key] = mat;
          //mesh.material = mat;
      } else if (key && mat) {
          //mesh.material.dispose();
          //mesh.material = mat;
      }
      */
      if (metadata["ddd:instance:key"]) {
        //this.processMesh(mesh, mesh);
        this.addMeshToCatalog(metadata["ddd:instance:key"], mesh);
      }
      if (metadata["ddd:material"] && (loadMaterials || !(metadata["ddd:material"] in this.catalog_materials))) {
        try {
          this.addMaterialToCatalog(metadata["ddd:material"], mesh.material, mesh.metadata.gltf.extras, true);
        } catch (e) {
          console.debug("Error adding material to catalog: ", mesh, e);
        }
      }
    }
    for (var _iterator2 = _createForOfIteratorHelperLoose(mesh.getChildren()), _step2; !(_step2 = _iterator2()).done;) {
      var child = _step2.value;
      this.loadCatalogFromMesh(child, loadMaterials);
    }
  };
  _proto.addMaterialToCatalog = function addMaterialToCatalog(key, material, metadata, force) {
    if (force === void 0) {
      force = false;
    }
    if (material) {
      //console.debug(mesh.material);
      //mesh.material.id = key;
      material.name = key;
      if (this.catalog_materials[key] && !force) {
        console.debug("Material already in catalog: " + key);
      } else {
        //console.debug("Adding material to catalog: " + key);
        this.catalog_materials[key] = material;
        var dontFreeze = false;
        if (metadata["ddd:material"] === "WaterBasicDaytime") {
          /*
          mesh.material.alpha = 0.7;
          mesh.material.transparencyMode = 2;  // ALPHA_BLEND
          mesh.material.useSpecularOverAlpha = true;
          mesh.material.useReflectionOverAlpha = true;
          mesh.material.bumpTexture = new Texture("/textures/waterbump.png", this.scene);
          */
          // This "WaterInstanced" is additionally created to avoid WaterMaterial from being used in instances (seems to fail, causing the material to disappear).
          this.catalog_materials["WaterInstanced"] = material;
          this.catalog_materials["WaterInstanced"].alpha = 0.7;
          this.catalog_materials["WaterInstanced"].transparencyMode = 2;
          this.catalog_materials["WaterInstanced"].freeze();
          //console.debug("NOT ADDING WATERMATERIAL TO CATALOG");
          this.catalog_materials[key] = this.materialWater;
          dontFreeze = true;
        } else if (metadata["ddd:material"] === "Water4Advanced") {
          /*
          mesh.material.alpha = 0.8;
          mesh.material.transparencyMode = 2;  // ALPHA_BLEND
          mesh.material.useSpecularOverAlpha = true;
          mesh.material.useReflectionOverAlpha = true;
          mesh.material.bumpTexture = new Texture("/textures/waterbump.png", this.scene);
          */
          //console.debug("NOT ADDING WATERMATERIAL TO CATALOG");
          this.catalog_materials[key] = this.materialWater;
          dontFreeze = true;
        } else if (material instanceof PBRMaterial) {
          //dontFreeze = true;
          //mesh.material.specularColor = Color3.Lerp(mesh.material.albedoColor, Color3.White(), 0.2);
          //mesh.material.albedoColor = Color3.Lerp(mesh.material.albedoColor, Color3.White(), 0.5);
          //mesh.material.albedoColor = Color3.FromHexString(mesh.metadata.gltf.extras['ddd:material:color']).toLinearSpace();
          //mesh.material.albedoColor = Color3.FromHexString(mesh.material.albedoColor).toLinearSpace();
          //let uvScale = 0.25;
          var uvScale = 1.0;
          if (metadata["ddd:material"] === "Lava") {
            uvScale = 0.125;
          }
          if (metadata["ddd:material"] === "Roadline" || metadata["ddd:material"] === "Roadmarks" || metadata["ddd:material"] === "Fence" || metadata["ddd:material"] === "TrafficSigns" || metadata["ddd:material"] === "RoadRailway" || metadata["ddd:material"] === "Flowers Blue" || metadata["ddd:material"] === "Flowers Roses" || metadata["ddd:material"] === "Grass Blade" || metadata["ddd:material"] === "Grass Blade Dry") {
            uvScale = 1.0;
            // TODO: add this as metadata (should not apply to all of these)
            material.twoSidedLighting = true;
          }
          if (metadata["ddd:material"] === "Flowers Blue" || metadata["ddd:material"] === "Flowers Roses" || metadata["ddd:material"] === "Grass Blade" || metadata["ddd:material"] === "Grass Blade Dry") {
            uvScale = 1.0;
            // TODO: add this as metadata (should not apply to all of these)
            material.twoSidedLighting = true;
            material.backFaceCulling = false;
          }
          if (metadata["ddd:material"] === "Fence") {
            uvScale = 0.5;
            material.backFaceCulling = false;
            if (material.albedoTexture && material instanceof PBRBaseMaterial) {
              material.albedoTexture.vOffset = 0.0725;
            }
            if (material.bumpTexture) {
              material.bumpTexture.vOffset = 0.0725;
            }
          }
          if (uvScale !== 1.0) {
            if (material.albedoTexture && material instanceof PBRBaseMaterial) {
              material.albedoTexture.uScale = uvScale;
              material.albedoTexture.vScale = uvScale;
              if (material.bumpTexture) {
                material.bumpTexture.uScale = uvScale;
                material.bumpTexture.vScale = uvScale;
              }
              if (material.emissiveTexture) {
                material.emissiveTexture.uScale = uvScale;
                material.emissiveTexture.vScale = uvScale;
              }
            }
          }
          // Babylon does not enable emissive by default if an emissive texture exists. This makes eg. lava emissive.
          if (material.emissiveTexture) {
            material.emissiveColor = Color3.White();
          }
          /*
          if ((metadata['ddd:material'] !== 'Flo') &&
              (metadata['ddd:material'] !== 'TrafficSigns') &&
              (metadata['ddd:material'] !== 'RoadRailway') &&
              (metadata['ddd:material'] !== 'Flowers Blue') &&
              (metadata['ddd:material'] !== 'Flowers Roses') &&
              (metadata['ddd:material'] !== 'Grass Blade')) {
              mesh.material.albedoTexture.uScale = 0.25;
              mesh.material.albedoTexture.vScale = 0.25;
              if (mesh.material.bumpTexture) {
                  mesh.material.bumpTexture.uScale = 0.25;
                  mesh.material.bumpTexture.vScale = 0.25;
              }
          }
          */
          // Detail map
          // TODO: Disabled as didn't seem to be working (10-2023)
          /*
          material.detailMap.texture = this.textureDetailSurfaceImp;
          if (material.detailMap.texture) {
              ( <Texture> material.detailMap.texture ).uScale = 1 / 256;
              ( <Texture> material.detailMap.texture ).vScale = 1 / 256;
              material.detailMap.isEnabled = true;
              material.detailMap.diffuseBlendLevel = 0.15; // 0.2
              //mesh.material.detailMap.bumpLevel = 1; // between 0 and 1
              //mesh.material.detailMap.roughnessBlendLevel = 0.05; // between 0 and 1
              //mesh.material.freeze();  // Careful: may prevent environment texture change (?)
          }
          */
          material.environmentIntensity = this.baseEnvironmentIntensity * 0.75; // * 0.25;
          //(<PBRMaterial>material).ambientColor = new Color3(0, 0, 0);
          material.useHorizonOcclusion = true;
          if (this.envReflectionProbe) {
            // Seems this is applied even if not done explicitly here?
            material.reflectionTexture = this.envReflectionProbe.cubeTexture;
          }
          // Freezing PBR materials causes them to not respond to environment intensity or reflection texture changes
          dontFreeze = true;
        }
        if ('zoffset' in metadata && metadata["zoffset"]) {
          this.catalog_materials[key].zOffset = metadata["zoffset"];
        }
        //mesh.material.ambientColor = mesh.material.albedoColor; // new Color3(1, 1, 1);
        if (!dontFreeze) {
          this.catalog_materials[key].freeze();
        }
      }
    } else {
      console.debug("No material (null) (key=" + key + ")");
    }
  };
  _proto.addMeshToCatalog = function addMeshToCatalog(key, mesh) {
    if (this.catalog[key]) {
      console.debug("Mesh already in catalog: " + key);
    } else {
      //console.debug("Adding mesh to catalog: " + key);
      this.catalog[key] = mesh;
      mesh.setEnabled(false);
      mesh.parent = null;
    }
  };
  _proto.processMeshDummy = function processMeshDummy(_root, mesh) {
    return mesh;
  };
  _proto.processMesh = function processMesh(root, mesh) {
    //console.debug("Processing mesh: " + mesh.id, mesh);
    var rootmd = root.metadata ? root.metadata.tileInfo : null;
    if ('getTotalVertices' in mesh) {
      if (mesh.getChildMeshes().length == 0) {
        if (mesh.getTotalVertices() == 0 || mesh.getTotalIndices() == 0) {
          //console.log("Empty mesh with no vertices or indices: " + mesh.id, mesh);
          return null;
        }
      }
    }
    //mesh.isPickable = false;
    mesh.receiveShadows = true; // Fixes instances with no shadows
    // TODO: Ground/texture override shall be done per layer settings (and passed here into processMesh as needed)
    if (!("_splatmapMaterial" in root) && this.useSplatMap && !this.viewerState.sceneGroundTextureOverrideUrl && this.viewerState.dddConfig.materialsSplatmap) {
      // && this.viewerState.dddConfig.materialsTextureSet.indexOf("default") >= 0
      if (rootmd && "metadata" in root && "tileCoords" in root.metadata) {
        var coords = root.metadata["tileCoords"];
        //console.debug("Creating splat material for: ", coords);
        var tileUrlBase = this.viewerState.dddConfig.tileUrlBase;
        var splatmapUrl = tileUrlBase + "17" + "/" + coords[1] + "/" + coords[2] + ".splatmap-16chan-0_15-256.png";
        //console.info("Splatmap texture: " + splatmapUrl);
        //const temporaryTexture = this.textureDetailSurfaceImp;
        var splatmapTexture = new Texture(splatmapUrl, this.scene);
        var matwrapper = new TerrainMaterialWrapper(this, splatmapTexture, this.splatmapAtlasTexture, this.splatmapAtlasNormalsTexture);
        root._splatmapMaterial = matwrapper.material;
        var createSplatmapMaterial = function createSplatmapMaterial() {
          matwrapper.splatMap = splatmapTexture;
          var uvScale = [225, 225]; //[225, 225]; // [113.36293971960356 * 2, 112.94475604662343 * 2];
          var bounds = rootmd ? rootmd["tile:bounds_m"] : null;
          if (bounds) {
            //console.debug("Bounds: ", bounds);
            uvScale = [bounds[2] - bounds[0], bounds[3] - bounds[1]];
          }
          matwrapper.material.albedoTexture.uScale = 1.0 / uvScale[0] * (127 / 128); // + 1
          matwrapper.material.albedoTexture.vScale = 1.0 / uvScale[1] * (127 / 128); // + 1
          matwrapper.material.albedoTexture.uOffset = 0.5; //  + (1 / uvScale[0]);
          matwrapper.material.albedoTexture.vOffset = 0.5; // - ( 0.5/128 ); // 1 / root._splatmapMaterial.albedoTexture.getSize().height);
          /*if (mesh.material.bumpTexture) {
              mesh.material.bumpTexture.uScale = 1.0 / uvScale[0];
              mesh.material.bumpTexture.vScale = 1.0 / uvScale[1];
              mesh.material.bumpTexture.uOffset = 0.5;
              mesh.material.bumpTexture.vOffset = 0.5;
          }*/
          //(<any> root)._splatmapMaterial._splatmapMaterial.freeze();
        };
        // Wait for texture observable to create material (trying to avoid freeze time)
        //if (splatmapTexture.isReady()) {
        //    createSplatmapMaterial();
        //} else {
        //    let onLoadObservable = splatmapTexture.onLoadObservable;
        //    onLoadObservable.addOnce(() => {
        //        createSplatmapMaterial();
        //    });
        //}
        createSplatmapMaterial();
      }
    }
    if (mesh && mesh.metadata && mesh.metadata.gltf && mesh.metadata.gltf.extras) {
      var metadata = mesh.metadata.gltf.extras;
      mesh.isBlocker = true;
      if (metadata["ddd:material"] && !("ddd:text" in metadata)) {
        var key = metadata["ddd:material"];
        //mesh.renderingGroupId = 1;
        if (key === "WaterBasicDaytime") {
          //console.debug(metadata["ddd:path"]);
          // FIXME: Weak condition to identify the water mesh inside an instance
          //if ( metadata["ddd:path"].startsWith( "Catalog Group" )) {
          if (metadata["ddd:path"].indexOf("/DDDInstance") >= 0) {
            key = "WaterInstanced";
          }
        }
        if (key == 'WaterBasicDaytime' || key == 'Water4Advanced' || key == 'WaterInstanced') {
          mesh.renderingGroupId = 2;
        }
        // Fonts
        if (key === "DDDFonts-01-64") ; else {
          // Create font materials ad-hoc using pre-existing material albedo texture
          // (this allows font materials to be included in the format)
          if ("ddd:material:type" in metadata && metadata['ddd:material:type'] == 'font' && !(key in this.catalog_materials)) {
            var fontAtlasTexture = mesh.material.albedoTexture;
            var tmw = new TextMaterialWrapper(this, fontAtlasTexture, null);
            var materialTextCustom = tmw.material;
            this.catalog_materials[key] = materialTextCustom;
          }
        }
        var mat = this.catalog_materials[key];
        if (!(key in this.catalog_materials) && mesh.material) {
          mesh.material.id = key + "(Auto)";
          mesh.material.name = key;
          this.addMaterialToCatalog(metadata["ddd:material"], mesh.material, mesh.metadata.gltf.extras);
          mat = this.catalog_materials[key];
          if (!(root in this.depends)) {
            this.depends.push(root);
          }
        }
        // Add color material
        /*
        if (key.startsWith("Color") && mesh.material && !mat) {
            console.debug("Adding color material " + mesh.material + " to catalog: " + key);
            mat = mesh.material;
            mat.name = key;
            this.catalog_materials[key] = mat;
            //mesh.material = null;
        }
        */
        // TODO: Indicate when to splat in metadata (partially done)
        if (this.useSplatMap && this.viewerState.dddConfig.materialsSplatmap && "ddd:material:splatmap" in metadata && metadata["ddd:material:splatmap"] === true && (!("ddd:layer" in metadata) || metadata["ddd:layer"] === "0") && (metadata["ddd:material"] === "Park" || metadata["ddd:material"] === "Grass" || metadata["ddd:material"] === "Terrain" || metadata["ddd:material"] === "Ground" || metadata["ddd:material"] === "Ground Clear" || metadata["ddd:material"] === "Dirt" || metadata["ddd:material"] === "Garden" || metadata["ddd:material"] === "Forest" || metadata["ddd:material"] === "Sand" || metadata["ddd:material"] === "Rock" || metadata["ddd:material"] === "Rock Orange" || metadata["ddd:material"] === "WayPedestrian" && (!("ddd:area:type" in metadata) || metadata["ddd:area:type"] !== "stairs") || metadata["ddd:material"] === "Wetland" || metadata["ddd:material"] === "Asphalt")) {
          if (root._splatmapMaterial) {
            if (mesh.material && mesh.material !== root._splatmapMaterial) {
              try {
                mesh.material.dispose();
              } catch (e) {
                console.debug("Could not dispose material: " + mesh.id);
              }
            }
            mesh.material = root._splatmapMaterial;
            //( <any>root )._splatmapMaterial.renderingGroupId = 1;
            // Add meshes to the reflection probe (Expensive!)
            //this.envReflectionProbe.renderList.push(mesh);
          }
        } else if (key in this.catalog_materials) {
          // && mesh.material
          if (mesh.material && mesh.material !== mat && mat) {
            var mmat = mesh.material;
            mesh.material = null;
            mmat.dispose(); // Causes white materials? but cleans all outstanding materials
          }

          if (mat) {
            mesh.material = mat;
          }
        } else {
          //console.debug("Material not found in catalog: " + key);
          // TODO: Will never happen if not showing materials (dependencies should be to the particular instance or material)
          this.depends.push(root);
        }
      }
      if (metadata["ddd:light:color"]) {
        //lightFlare.billboardMode = 7;
        /*
        var light = new PointLight("light_" + mesh.id, mesh.position, this.scene);
        light.parent = mesh.parent;
        light.position = mesh.position;
        light.position.y = light.position.z + 1;
        light.intensity = 20;
        light.diffuse = new Color3(1, 0, 0);
        light.specular = new Color3(0, 1, 0);
        */
        mesh.parent = null;
        mesh.dispose();
      } else if (metadata["ddd:text"]) {
        var newMesh = null;
        var showText = this.viewerState.sceneTextsEnabled;
        if (showText) {
          // Text should be (possibly) exported as meshes by the generator.
          var textWidth = metadata["ddd:text:width"];
          var textHeight = metadata["ddd:text:width"];
          newMesh = MeshBuilder.CreatePlane("text_" + mesh.id, {
            width: textWidth,
            height: textHeight,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
          }, this.scene);
          newMesh.parent = null;
          newMesh.parent = mesh.parent; // .parent;
          newMesh.scaling = mesh.scaling.clone();
          newMesh.rotationQuaternion = mesh.rotationQuaternion.clone();
          newMesh.position = mesh.position.clone();
          newMesh.rotate(Vector3.Right(), Math.PI / 2.0, Space.LOCAL);
          newMesh.scaling.y *= 0.35;
          //Create dynamic texture
          var texture = new DynamicTexture("dynamicTexture_text_" + mesh.id, {
            width: 256,
            height: 128
          }, this.scene, true);
          //var textureContext = texture.getContext();
          var font = "bold 36px serif";
          var text = metadata["ddd:text"];
          texture.drawText(text, 128.0 - text.length * 8, 60, font, "blue", "transparent", true, true);
          var material = new StandardMaterial("Mat" + mesh.id, this.scene);
          material.diffuseTexture = texture;
          material.diffuseTexture.hasAlpha = true;
          material.useAlphaFromDiffuseTexture = true;
          material.transparencyMode = 1; // ALPHA_TEST
          newMesh.material = material;
          newMesh.isPickable = false;
          //newMesh.metadata = {gltf: {extras: metadata}};  // Doesn't seem to work and/or freezes the app
          //delete newMesh.metadata['ddd:text'];
        }

        mesh.parent = null;
        mesh.dispose();
        mesh = newMesh;
      } else if (metadata["ddd:instance:key"]) {
        var _key = metadata["ddd:instance:key"];
        // Ignored objects (devel purpose)
        var ignored_keys = []; // ["building-window"]
        if (ignored_keys.indexOf(_key) >= 0) {
          mesh.parent = null;
          mesh.dispose();
          return null;
        }
        if (this.catalog[_key]) {
          if ("ddd:instance:buffer:matrices" in metadata) {
            this.instanceAsThinInstanceBuffers(_key, root, mesh);
          } else {
            //this.instanceAsNode(root, key, mesh);
            this.instanceAsThinInstance(_key, root, mesh); // note this removes the mesh
          }
        } else {
          // Instance not found. Mark this root for re processing and exit.
          //console.debug("Instance key not found in catalog: : " + key);
          this.depends.push(root);
          return null;
        }
      }
      this.depends.push(root);
    }
    if (mesh) {
      // && !replaced
      // Babylon Occlusion doens't seem to work well for ddd use case
      //mesh.occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
      /*
      if (mesh.simplify && mesh.getTotalVertices() > 0 && !replaced) {
          mesh.simplify([{ quality: 0.1, distance: 100 }, ], false, SimplificationType.QUADRATIC);
      }
      */
      mesh.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
      //mesh.freezeWorldMatrix();
      //if (mesh.material) { mesh.material.needDepthPrePass = true; }  // causes some objects with textures to show black
      for (var _i = 0, _arr = [].concat(mesh.getChildren()); _i < _arr.length; _i++) {
        var child = _arr[_i];
        var processed = this.processMesh(root, child);
        /*
        if (processed == null) {
            //console.debug("Removing child: " + children.id);
            children.parent = null;
            children.dispose();
        }
        */
      }
      /*
      // Adding shadows for ground here was done as a test, but we may incur adding them
      // multiple times, and they should be managed. Performance impact needs testing.
      if ( this.shadowGenerator && mesh.getBoundingInfo) {
          this.shadowGenerator.getShadowMap()!.renderList!.push( mesh );
      }
      */
    }
    /*
    if (mesh === root) {
        //this.octree = this.scene.createOrUpdateSelectionOctree(); // capacity, maxDepth);
    }
    */
    return mesh;
  };
  _proto.instanceAsThinInstance = function instanceAsThinInstance(key, root, node) {
    var instance = this.catalog[key];
    var meshes = instance.getChildMeshes();
    for (var _iterator3 = _createForOfIteratorHelperLoose(meshes), _step3; !(_step3 = _iterator3()).done;) {
      var mesh = _step3.value;
      if (mesh && mesh.metadata && mesh.metadata.gltf && mesh.metadata.gltf.extras) {
        var metadata = mesh.metadata.gltf.extras;
        if (metadata["ddd:light:color"]) {
          // TODO: include the child instance
          continue;
        }
      }
      if (mesh.getTotalVertices() == 0 || mesh.getTotalIndices() == 0) {
        //console.log("Mesh with no vertices or indices: ", mesh);
        if (mesh.getChildMeshes().length == 0) {
          //console.log("Empty mesh with no vertices or indices: ", mesh);
          continue;
        }
      }
      // Get root
      var instanceRootKey = root.id + "_" + key + "_" + mesh.id; // root.id + "_" +  // TODO! do not clone but keep groups!
      var meshInstanceRoot = this.instanceRoots[instanceRootKey];
      if (!meshInstanceRoot) {
        //console.debug("Creating instanceroot for: " + instanceRootKey);
        instance.setEnabled(true);
        meshInstanceRoot = mesh.clone(instanceRootKey, null, true); // (do not clone children = true)
        meshInstanceRoot = meshInstanceRoot.makeGeometryUnique(); // Can we do this without cloning geometry? do thin instances work that way?
        var cloneMat = meshInstanceRoot.material;
        if (cloneMat) {
          meshInstanceRoot.material = null;
          cloneMat.dispose();
        }
        //meshInstanceRoot.metadata.gltf.extras['ddd:instance:key'] = "_MESH_INSTANCE_ROOT";  // WARN:seems this extras are being shared among instances
        meshInstanceRoot.toLeftHanded();
        //meshInstanceRoot.rotate(Vector3.Up(), Math.PI / 2);
        //meshInstanceRoot.scaling = new Vector3(1, 1, -1);
        this.instanceRoots[instanceRootKey] = meshInstanceRoot;
        meshInstanceRoot.parent = root;
        //meshInstanceRoot.setPivotMatrix(meshInstanceRoot.computeWorldMatrix(true));  // Seems to cause problems, but should not :? (freezing may be involved)
        this.processMesh(root, meshInstanceRoot);
        // After postprocessing, do not add this mesh as instance if it's empty
        if (mesh.getTotalVertices() == 0 || mesh.getTotalIndices() == 0) continue;
        // Enable shadows for the instances if shadows are set
        if (this.shadowGenerator) {
          this.shadowGenerator.getShadowMap().renderList.push(meshInstanceRoot);
        }
        //meshInstanceRoot.setEnabled(false);
        //meshInstanceRoot.addLODLevel(200, null);
        instance.setEnabled(false);
        //instance.dispose();
      }
      // Transform
      /*
      let localPos = mesh.position;
      let localRot = mesh.rotationQuaternion;
      let localScaling = mesh.scaling;
      localScaling.x = -1 * localScaling.x;
      var meshMatrix = Matrix.Compose(localScaling, localRot, localPos);
      */
      var scaleMatrix = Matrix.Compose(new Vector3(1, 1, -1), new Quaternion(0, 0, 0, 0), new Vector3(0, 0, 0)); //Matrix.Scaling(-1, 1, 1);
      //const meshInstanceMatrix = meshMatrix.multiply( Matrix.Invert(meshInstanceRootMatrix));
      //const meshMatrix = mesh.matrix
      var nodeMatrix = node.computeWorldMatrix(true);
      var matrix = nodeMatrix;
      matrix = scaleMatrix.multiply(matrix);
      var meshInstanceRootMatrix = meshInstanceRoot.computeWorldMatrix(true);
      var meshMatrix = mesh.computeWorldMatrix(true);
      var meshMatrixRelInstanceRoot = meshMatrix.multiply(Matrix.Invert(instance.computeWorldMatrix(true)));
      meshMatrixRelInstanceRoot = meshMatrixRelInstanceRoot;
      matrix = meshMatrixRelInstanceRoot.multiply(matrix);
      //let meshInstanceMatrix = scaleMatrix.multiply(meshInstanceRootMatrix);  // meshInstanceMatrix.multiply(meshMatrix);
      matrix = matrix.multiply(Matrix.Invert(meshInstanceRootMatrix));
      //console.debug("Creating instance: " + meshInstanceRoot.id);
      // TODO: Improve performance by not updating GPU buffers here (thinInstanceAdd), only in last call for this instanceRoot.
      meshInstanceRoot.thinInstanceAdd(matrix);
      meshInstanceRoot.freezeWorldMatrix();
    }
    node.parent = null;
    node.dispose();
  };
  _proto.instanceAsThinInstanceBuffers = function instanceAsThinInstanceBuffers(key, root, node) {
    //console.debug( "Creating thin instance buffers for: " + key );
    var instance = this.catalog[key];
    var meshes = instance.getChildMeshes();
    var metadataNode = node.metadata.gltf.extras;
    for (var _iterator4 = _createForOfIteratorHelperLoose(meshes), _step4; !(_step4 = _iterator4()).done;) {
      var mesh = _step4.value;
      var metadata = mesh.metadata.gltf.extras;
      if (metadata["ddd:light:color"]) {
        // TODO: include the child instance
        continue;
      }
      // Get root
      var instanceRootKey = root.id + "_" + key + "_" + mesh.id; // root.id + "_" +  // TODO! do not clone but keep groups!
      var meshInstanceRoot = this.instanceRoots[instanceRootKey];
      if (!meshInstanceRoot) {
        //console.debug("Creating instanceroot for: " + instanceRootKey);
        instance.setEnabled(true);
        meshInstanceRoot = mesh.clone(instanceRootKey, null, true);
        meshInstanceRoot = meshInstanceRoot.makeGeometryUnique(); // Can we do this without cloning geometry? do thin instances work that way?
        var cloneMat = meshInstanceRoot.material;
        if (cloneMat) {
          meshInstanceRoot.material = null;
          cloneMat.dispose();
        }
        //meshInstanceRoot.metadata.gltf.extras['ddd:instance:key'] = "_MESH_INSTANCE_ROOT";  // WARN:seems this extras are being shared among instances
        // This section is critical. The bakeCurrentTransformIntoVertices in the middle may be too.
        // This transform works together with the meshinstance transform below.
        //meshInstanceRoot.toLeftHanded();
        //meshInstanceRoot.bakeCurrentTransformIntoVertices();
        //meshInstanceRoot.rotate(Vector3.Right(), Math.PI / 2);
        //meshInstanceRoot.rotate( Vector3.Up(), -Math.PI / 2 );
        //meshInstanceRoot.scaling = new Vector3( 1, -1, 1 );
        meshInstanceRoot.rotate(Vector3.Right(), -Math.PI / 2);
        meshInstanceRoot.rotate(Vector3.Up(), Math.PI);
        meshInstanceRoot.rotate(Vector3.Forward(), Math.PI);
        meshInstanceRoot.bakeCurrentTransformIntoVertices();
        //meshInstanceRoot.flipFaces(true);
        // Apply tht transformation (without baking) to the meshInstanceRoot, this 
        // (somewhat surprisingly) combined with the instance matrix.
        meshInstanceRoot.rotate(Vector3.Up(), Math.PI);
        meshInstanceRoot.rotate(Vector3.Right(), -Math.PI / 2);
        meshInstanceRoot.scaling = new Vector3(1, -1, 1);
        this.instanceRoots[instanceRootKey] = meshInstanceRoot;
        meshInstanceRoot.parent = root;
        //meshInstanceRoot.position = root.computeWorldMatrix(true);  // Seems to cause problems, but should not :? (freezing may be involved)
        this.processMesh(meshInstanceRoot, meshInstanceRoot);
        // Enable shadows for the instances if shadows are set
        if (this.shadowGenerator) {
          this.shadowGenerator.getShadowMap().renderList.push(meshInstanceRoot);
        }
        //meshInstanceRoot.setEnabled(false);
        // TODO: LOD should be controlled by DDD metadata, also, some LODding may be (better?) left to DDD format/renderer
        meshInstanceRoot.addLODLevel(300, null);
        instance.setEnabled(false);
        //instance.dispose();
      }

      var bufferMatrices = metadataNode["ddd:instance:buffer:matrices"];
      //console.debug("Thin instance buffers for: " + key + " / " + mesh.id + "  (" + (bufferMatrices.length / 16) + " matrices)" );
      // Transform each node (test only)
      // DEPRECATED: This is very slow, whereas directly loading the matrices is very fast.
      /*
      const adaptRotation = Quaternion.FromEulerAngles(-Math.PI / 2, Math.PI, 0);
      const adaptMatrix = Matrix.Compose( new Vector3( 1, -1, 1 ), adaptRotation, new Vector3( 0, 0, 0 )); //Matrix.Scaling(-1, 1, 1);
      for ( let i = 0; i < bufferMatrices.length; i += 16 ) {
          const nodeMatrix = Matrix.FromArray( bufferMatrices, i );
          //let matrix = adaptMatrix.multiply( nodeMatrix );
          let matrix = nodeMatrix.multiply(adaptMatrix);
          meshInstanceRoot.thinInstanceAdd( matrix );
      }
      */
      // Load all matrices directly into buffer
      var bufferMatricesArray = new Float32Array(bufferMatrices.length);
      bufferMatricesArray.set(bufferMatrices);
      meshInstanceRoot.thinInstanceSetBuffer("matrix", bufferMatricesArray, 16, true);
      meshInstanceRoot.freezeWorldMatrix();
    }
    node.parent = null;
    node.dispose();
  };
  _proto.instanceAsNode = function instanceAsNode(key, _root, mesh) {
    //console.debug("Replacing mesh: " + key);
    var newMesh = new TransformNode(mesh.id + "_instance", this.scene); // new Mesh("chunk_" + tileKey, this.scene);
    //let newMesh = mesh;
    //newMesh.geometry = null;
    newMesh.parent = mesh.parent;
    newMesh.position = mesh.position;
    newMesh.rotationQuaternion = mesh.rotationQuaternion;
    newMesh.scaling = mesh.scaling;
    //newMesh.absoluteScaling = mesh.absoluteScaling;
    /*for (let cc of mesh.getChildren()) {
        cc.parent = null;
        cc.dispose();
    }*/
    if (!newMesh.metadata) {
      newMesh.metadata = {};
    }
    if (mesh.metadata && mesh.metadata.gltf) {
      newMesh.metadata.gltf = mesh.metadata.gltf;
      //newMesh.metadata.gltf.extras['ddd:instance:key'] = null;
    }

    mesh.dispose();
    this.catalog[key].setEnabled(true);
    var instance = this.catalog[key].clone(); // createInstance(mesh.id + "_instanced");
    this.catalog[key].setEnabled(false);
    instance.metadata.gltf.extras["ddd:instance:key"] = null;
    instance.id = mesh.id + "_clone";
    //instance.isVisible = true;
    instance.parent = newMesh;
    newMesh.rotate(new Vector3(1, 0, 0), Math.PI / 2, Space.LOCAL);
    instance.setEnabled(true);
    //mesh = newMesh;
  }
  /**
   * Dispose this DDDViewer instance.
   * @todo Ensure all events, processes and objects are disconnected and disposed.
   */;
  _proto.dispose = function dispose() {
    if (this.scene) {
      console.debug("Disposing SceneViewer scene.");
      this.scene.dispose();
      //this.scene = null;
    }

    if (this.engine) {
      console.debug("Disposing SceneViewer 3D engine (BabylonJS).");
      this.engine.dispose();
      //this.engine = null;
    }
  }
  /**
   * DDDViewer main update callback, this is called every frame by the engine.
   * Children object update method is called recursively from here (sequencer, processes, layers).
   * @param deltaTime
   */;
  _proto.update = function update(deltaTime) {
    var positionWGS84 = this.positionWGS84();
    if (positionWGS84) {
      this.viewerState.positionWGS84 = positionWGS84;
      this.viewerState.positionTileZoomLevel = 17;
      if (this.viewerState.positionGroundHeight !== null && this.viewerState.positionGroundHeight < 50) {
        this.viewerState.positionTileZoomLevel = 18;
      }
      this.updateElevation();
      if (this.camera) {
        if (this.camera instanceof ArcRotateCamera) {
          var heading = -90 + -this.camera.alpha * (180.0 / Math.PI);
          heading = (heading % 360 + 360) % 360;
          this.viewerState.positionHeading = heading;
          var tilt = this.camera.beta * (180.0 / 3.14159265359);
          this.viewerState.positionTilt = tilt;
        } else if (this.camera instanceof TargetCamera) {
          var _heading = this.camera.rotation.y * (180.0 / Math.PI);
          _heading = (_heading % 360 + 360) % 360;
          this.viewerState.positionHeading = _heading;
          var yaw = this.camera.rotation.x * (180.0 / 3.14159265359);
          this.viewerState.positionTilt = 90.0 - yaw;
        }
      }
    }
    if (this.cameraController) {
      this.cameraController.update(deltaTime);
    }
    if (this.camera) {
      var positionScene = this.camera.position.asArray();
      positionScene = [positionScene[0], positionScene[1], positionScene[2]]; // Copy array
      this.viewerState.positionScene = positionScene;
      if (this.envReflectionProbe) {
        this.envReflectionProbe.position = this.camera.position.clone();
      }
    }
    this.updateSceneDatetime(deltaTime);
    this.sequencer.update(deltaTime);
    this.processes.update(deltaTime);
    this.layerManager.update(deltaTime);
    // Update render metrics
    this.viewerState.sceneFPS = this.engine.getFps(); // this.engine.getFps().toFixed( 1 );
    this.viewerState.sceneDrawCalls = this.sceneInstru ? this.sceneInstru.drawCallsCounter.current : 0;
    this.viewerState.sceneTriangles = this.sceneInstru ? this.scene.getActiveIndices() / 3 : 0;
  };
  _proto.updateSceneDatetime = function updateSceneDatetime(deltaTime) {
    // Run time
    // TODO: this currently requires a minimum elapsed time so Date.setSeconds work. This approach accumulates error.
    var updateInterval = 100; // 5000;
    var maxUpdateElapsed = 2000; // 2 sec
    {
      var currentDateUpdate = new Date().getTime();
      if (currentDateUpdate - this.lastDateUpdate > updateInterval) {
        var updateElapsed = currentDateUpdate - this.lastDateUpdate;
        this.lastDateUpdate = currentDateUpdate;
        if (updateElapsed > maxUpdateElapsed) {
          updateElapsed = maxUpdateElapsed;
        }
        var scaledElapsed = updateElapsed / 1000 * this.viewerState.timeScale;
        // FIXME: Should use sun position, not hours (also, check with other time zones)
        if (this.viewerState.positionDate.getHours() < 5) {
          scaledElapsed *= 3;
        } // Faster pace at night
        this.viewerState.positionDate.setSeconds(this.viewerState.positionDate.getSeconds() + scaledElapsed);
        this.viewerState.positionDateSeconds = this.viewerState.positionDate.getTime() / 1000;
        this.lightSetupFromDatePos();
      }
    }
    //this.skybox.computeWorldMatrix();  // only needed if scene.freezeActiveMeshes is true
  };
  _proto.sceneToWGS84 = function sceneToWGS84(coords) {
    //let wgs84Pos = this.originShiftWGS84;
    //const point = olProj.transform([coords[0], coords[2]], this.projection, 'EPSG:4326');
    var point = this.projection.inverse([coords[0], coords[2]]);
    return [point[0], point[1], coords[1]];
  };
  _proto.wgs84ToScene = function wgs84ToScene(coords) {
    //const point = olProj.transform(coords, 'EPSG:4326', this.projection);
    var point = this.projection.forward(coords);
    return [point[0], coords[2], point[1]];
  };
  _proto.positionWGS84 = function positionWGS84() {
    var scenePos = this.camera.position.asArray();
    var wgs84Pos = this.sceneToWGS84([scenePos[0], scenePos[1], scenePos[2]]);
    return wgs84Pos;
    /*
    const extent = this.map.getView().calculateExtent(this.map.getSize());
    let point = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
    */
  };
  _proto.parsePositionString = function parsePositionString(posString) {
    //console.debug("Parsing: " + posString);
    var result = new ScenePosition();
    try {
      // Parse at location
      //http://localhost:8080/maps/@42.1354407,-0.4126472,17.0z
      var href = posString;
      var regexp = /.*@([0-9.\\-]+),([0-9.\\-]+)((,(([0-9.\\-]+)[ayhtz]))*).*/;
      var matches = href.match(regexp);
      //console.debug(matches);
      if (matches && matches.length >= 3) {
        result.positionWGS84 = [parseFloat(matches[2]), parseFloat(matches[1])];
      }
      if (matches && matches.length >= 4) {
        for (var _iterator5 = _createForOfIteratorHelperLoose(matches[3].split(",")), _step5; !(_step5 = _iterator5()).done;) {
          var match = _step5.value;
          if (match === "") {
            continue;
          }
          var value = parseFloat(match.slice(0, -1));
          var code = match.slice(-1);
          if (code === "z") {
            result.positionTileZoomLevel = value;
          } else if (code === "a") {
            result.positionGroundHeight = value;
          } else if (code === "h") {
            result.positionHeading = value;
          } else if (code === "t") {
            result.positionTilt = value;
          }
          //console.debug(value, code);
        }
      }
    } catch (e) {
      console.debug("Error parsing location from href: " + e);
    }
    //let positionWgs84 = this.getViewerState().positionWGS84;
    return result;
  };
  _proto.positionString = function positionString(heightPrecision) {
    if (heightPrecision === void 0) {
      heightPrecision = 0;
    }
    // TODO: This would not be a SceneViewer method, a utility module at most
    // /@43.2505933,5.3736631,126a,35y,20.08h,56.42t/
    var point = this.positionWGS84();
    //const zoom = this.map.getView().getZoom();
    //let heading = (this.camera.rotation.y * (180.0 / 3.14159265359));
    //heading = (heading % 360 + 360) % 360;
    var heading = this.viewerState.positionHeading;
    //let yaw = this.camera.rotation.x * (180.0 / 3.14159265359);
    var tilt = this.viewerState.positionTilt;
    //let height = this.camera.position.y;
    var groundHeight = this.viewerState.positionGroundHeight;
    if (groundHeight === null) {
      //return this.camera.position.y;
      return null;
    }
    var posString = "@" + point[1].toFixed(7) + "," + point[0].toFixed(7);
    {
      posString = posString + "," + groundHeight.toFixed(heightPrecision) + "a"; // seems Ground M  ... (not WGS84 height (with EGM))
      posString = posString + "," + "35" + "y"; // ?
      posString = posString + "," + heading.toFixed(1) + "h"; // Heading
      posString = posString + "," + tilt.toFixed(2) + "t"; // Yaw (0 is vertical, 90 horizontal)
    }

    return posString;
  }
  /**
   * Calculates ground elevation (in MSL) for a given point in the scene. Receives a Vector3,
   * and uses its X and Z coordinates.
   *
   * FIXME: This is hitting objects other than the ground, check if masks can be used or otherwise correctly resolve ground elevation.
   *        Also the 3000m limit is arbitrary. Also fails when no ground objects are available.
   *        Also fails sometimes hitting invisible objects below ground (seems some non visible objects are being hit)
   */;
  _proto.elevationMSLFromSceneCoords = function elevationMSLFromSceneCoords(coords) {
    var ray = new Ray(new Vector3(coords.x, -100.0, coords.z), new Vector3(0, 1, 0), 3000.0);
    // This "pickWithRay" call sometimes fails with "Uncaught TypeError: Cannot read properties of undefined (reading 'subtractToRef') at Ray.intersectsTriangle()"
    var pickResult = null;
    try {
      pickResult = this.scene.pickWithRay(ray);
    } catch (e) {
      console.debug("Error picking scene with ray (in elevationMSLFromSceneCoords): " + e);
      return [null, null];
    }
    var terrainElevation = null;
    //let terrainMesh: Mesh | null = null;
    if (pickResult && pickResult.pickedMesh && pickResult.pickedMesh.id !== "skyBox") {
      terrainElevation = pickResult.distance - 100.0;
      //terrainMesh = <Mesh> pickResult.pickedMesh;
    }

    return [terrainElevation, pickResult];
  }
  /**
   * This method is called internally to update altitude and position name.
   */;
  _proto.updateElevation = function updateElevation() {
    if (!this.camera) return;
    var _this$elevationMSLFro = this.elevationMSLFromSceneCoords(this.camera.position),
      terrainElevation = _this$elevationMSLFro[0],
      terrainPickResult = _this$elevationMSLFro[1];
    if (terrainElevation && terrainPickResult) {
      // Update also position name if possible, from position metadata
      var terrainObjectRef = DDDObjectRef.fromMeshFace(terrainPickResult.pickedMesh, terrainPickResult.faceId);
      var metadata = terrainObjectRef.getMetadata();
      if (metadata && metadata["osm:name"]) {
        this.viewerState.positionName = metadata["osm:name"];
      } else {
        this.viewerState.positionName = null;
      }
      this.viewerState.positionTerrainElevation = terrainElevation;
      this.viewerState.positionGroundHeight = this.camera.position.y - terrainElevation;
    }
  }
  /*
  positionGroundHeight() {
      //const ray = new Ray(this.camera.position, new Vector3(0, -1, 0));
      const ray = new Ray(new Vector3(this.camera.position.x, -100.0, this.camera.position.z), new Vector3(0, 1, 0), 3000.0);
      const pickResult = this.scene.pickWithRay(ray);
      if (pickResult && pickResult.pickedMesh && pickResult.pickedMesh.id !== 'skyBox') {
          //console.debug(pickResult.pickedMesh.id);
          return this.camera.position.y - (pickResult.distance - 100.0);
      } else {
          return null;
      }
  }
    positionTerrainElevation() {
      //const ray = new Ray(this.camera.position, new Vector3(0, -1, 0));
      const ray = new Ray(new Vector3(this.camera.position.x, -100.0, this.camera.position.z), new Vector3(0, 1, 0), 3000.0);
      const pickResult = this.scene.pickWithRay(ray);
      if (pickResult && pickResult.pickedMesh && pickResult.pickedMesh.id !== 'skyBox') {
            if (pickResult.pickedMesh.metadata && pickResult.pickedMesh.metadata.gltf && pickResult.pickedMesh.metadata.gltf.extras && pickResult.pickedMesh.metadata.gltf.extras['osm:name']) {
              this.viewerState.positionName = pickResult.pickedMesh.metadata.gltf.extras['osm:name'];
          } else {
              this.viewerState.positionName = null;
          }
            return (pickResult.distance - 100.0);
      } else {
          return null;
      }
  }
  */
  /**
   * Untested
   * (from: https://gist.github.com/spite/051604efd1d971ab4b6ef1bc1ae2636e)
   */
  /*
  _getTileFromLatLon(zoom, lat, lon) {
      const width = Math.pow(2, zoom);
      const height = Math.pow(2, zoom);
      const latRad = (lat * Math.PI) / 180;
      const x = ~~((width * (lon + 180)) / 360);
      const y = ~~(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0) * height);
      return {zoom, x, y};
  }
  */;
  _proto.registerProjectionForCoords = function registerProjectionForCoords(coords) {
    console.debug("Setting Scene Geo transform for coords: " + coords);
    // Get tile grid coordinates
    var coordsUtm = transform(coords, "EPSG:4326", "EPSG:3857");
    var tileCoords = this.tileGrid.getTileCoordForCoordAndZ(coordsUtm, 17);
    var tileExtent = this.tileGrid.getTileCoordExtent(tileCoords);
    var tileCenter = getCenter(tileExtent);
    var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
    // Using coords of tile center for custom projection as DDD does
    this.projection = proj4__default("+proj=tmerc +lat_0=" + tileCenterWGS84[1] + " +lon_0=" + tileCenterWGS84[0] + " +k_0=1 " + "+x_0=0. +y_0=0. +datum=WGS84 +ellps=WGS84 " + "+towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  };
  _proto.deselectMesh = function deselectMesh() {
    if (this.sceneSelectedMeshId) {
      //this.viewerState.selectedMesh.showBoundingBox = false;
      for (var _iterator6 = _createForOfIteratorHelperLoose(this.highlightMeshes), _step6; !(_step6 = _iterator6()).done;) {
        var mesh = _step6.value;
        mesh.dispose();
      }
      this.highlightMeshes = [];
      this.selectedMesh = null;
      this.viewerState.sceneSelectedMeshId = null;
    }
  };
  _proto.deselectObject = function deselectObject() {
    if (this.selectedObject) {
      //this.viewerState.selectedMesh.showBoundingBox = false;
      for (var _iterator7 = _createForOfIteratorHelperLoose(this.highlightMeshes), _step7; !(_step7 = _iterator7()).done;) {
        var mesh = _step7.value;
        mesh.dispose();
      }
      this.highlightMeshes = [];
      this.selectedMesh = null;
      this.selectedObject = null;
      this.viewerState.sceneSelectedMeshId = null;
    }
  }
  /**
   * Finds a mesh by id. Currently this also searches combined indexed meshes by path).
   * @param meshId
   * @param node
   */
  /*
  findMeshById( meshId: string, node: Mesh | null = null ): Mesh | null {
      let children = null;
      if ( node ) {
          const nodeUrlId = node.id.split( "/" ).pop()!.replaceAll( "#", "_" );
          if ( nodeUrlId === meshId ) {
              return node;
          }
            // Search in combined indexed nodes
          let metadata = DDDObjectRef.nodeMetadata(node);
          let combined = false;
          if (metadata) {
              if ('ddd:batch:indexes' in metadata)  {
                  combined = true;
                  const indexes = metadata['ddd:batch:indexes'];
                  // Find triangle in indexes
                  for (let i = 0; i < indexes.length; i++) {
                      if ('ddd:path' in metadata && metadata['ddd:path'] == meshId) {
                          return node;
                      }
                  }
              }
          }
            children = node.getChildren();
      } else {
          children = this.scene.rootNodes;
      }
        for ( const child of children ) {
          const result = this.findMeshById( meshId, <Mesh> child );
          if ( result !== null ) { return result; }
      }
        return null;
  }
  */
  /**
   * Finds an object by id.
   * TODO: Move to DDDObjectRef and just leave here a convenience method search the whole scene.
   * @param meshId
   * @param node
   */;
  _proto.findObjectById = function findObjectById(objectId, objectRef) {
    if (objectRef === void 0) {
      objectRef = null;
    }
    var children = null;
    if (objectRef) {
      //console.debug(DDDObjectRef.urlId(objectId), objectRef.getUrlId());
      if (objectRef.getUrlId() === DDDObjectRef.urlId(objectId)) {
        return objectRef;
      }
      children = objectRef.getChildren();
    } else {
      children = this.scene.rootNodes.map(function (o) {
        return new DDDObjectRef(o);
      });
    }
    for (var _iterator8 = _createForOfIteratorHelperLoose(children), _step8; !(_step8 = _iterator8()).done;) {
      var child = _step8.value;
      var result = this.findObjectById(objectId, child);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
  _proto.selectObject = function selectObject(objectRef, highlight) {
    if (highlight === void 0) {
      highlight = true;
    }
    this.deselectObject();
    if (!objectRef) return;
    this.selectedObject = objectRef;
    this.viewerState.sceneSelectedMeshId = objectRef.mesh.id;
    //this.viewerState.selectedMesh.showBoundingBox = true;
    //console.debug(this.viewerState.selectedMesh.metadata.gltf.extras);
    if (highlight) {
      // Highlight
      //that.highlightLayer.addMesh(pickResult.pickedMesh, Color3.White()); // , true);
      //pickResult.pickedMesh.material = that.materialHighlight;
      // Prepare the wireframe mesh
      // To disable depth test check rendering groups:  https://forum.babylonjs.com/t/how-do-i-disable-depth-testing-on-a-mesh/1159
      var highlightClone = null;
      if (this.selectedObject.faceIndexStart > -1) {
        highlightClone = objectRef.mesh.clone(); // "highlightMesh: " + objectRef.mesh.id, objectRef.mesh.parent, true, false);
        highlightClone.makeGeometryUnique();
        var indices = highlightClone.getIndices(); // true, true);
        //highlightClone.unfreezeWorldMatrix();
        //highlightClone.unfreezeNormals();
        var newIndices = indices.slice(this.selectedObject.faceIndexStart * 3, this.selectedObject.faceIndexEnd * 3);
        /*
        let newIndices: number[] = [];
        for (let i = this.selectedObject.faceIndexStart * 3; i < this.selectedObject.faceIndexEnd * 3; i++) {
            newIndices.push(indices[i]);
        }
        */
        highlightClone.setIndices(newIndices);
      } else {
        //console.debug(objectRef.mesh);
        highlightClone = objectRef.mesh.clone(objectRef.mesh.id + " Selection", objectRef.mesh.parent, true, false); // "highlightMesh: " + objectRef.mesh.id, objectRef.mesh.parent, true, true);
        /*
        const newMesh = new TransformNode( highlightClone.id + "_pivot", this.scene );  // new Mesh("chunk_" + tileKey, this.scene);
        //let newMesh = mesh;
        //newMesh.geometry = null;
        newMesh.parent = objectRef.mesh.parent;
        newMesh.position = (<Mesh>objectRef.mesh).position.clone();
        newMesh.rotationQuaternion = (<Mesh>objectRef.mesh).rotationQuaternion!.clone();
        newMesh.scaling = (<Mesh>objectRef.mesh).scaling;
        highlightClone.parent = newMesh;
        highlightClone = newMesh;
        */
      }

      highlightClone.material = this.materialHighlight;
      highlightClone.isPickable = false;
      //highlightClone.parent = objectRef.mesh.parent;
      this.highlightMeshes.push(highlightClone);
      if (this.viewerState.sceneSelectedShowNormals) {
        var normals = this.showNormals(highlightClone, 0.5);
        if (normals) {
          normals.parent = highlightClone;
          this.highlightMeshes.push(normals);
        }
      }
      // This is currently NOT selecting children.
      // Note, however, that combined items may be selected together if the "combined" node is selected.
      /*
      // Iterate clone recursively to set highlight material to all submeshes
      const setHighlightRecursively = ( submesh: Mesh ) => {
          submesh.material = this.materialHighlight;
          let highlightNode = submesh.clone("highlight", submesh.parent, true, false);
            for ( const mc of submesh.getChildren()) {
              setHighlightRecursively( <Mesh> mc );
          }
          return highlightNode;
      };
      highlightClone = setHighlightRecursively( (<Mesh> objectRef.mesh) );
      */
    }
  }
  // Vertex normals
  ;
  _proto.showNormals = function showNormals(mesh, size, color) {
    if (size === void 0) {
      size = 1;
    }
    if (color === void 0) {
      color = null;
    }
    if (!mesh.getVerticesData) return null;
    var normals = mesh.getVerticesData(VertexBuffer.NormalKind);
    if (!normals) return null;
    var positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    color = color || Color3.Red();
    size = size || 1;
    var lines = [];
    for (var i = 0; i < normals.length; i += 3) {
      var v1 = Vector3.FromArray(positions, i);
      var v2 = v1.add(Vector3.FromArray(normals, i).scaleInPlace(size));
      lines.push([v1.add(mesh.position), v2.add(mesh.position)]);
    }
    var normalLines = MeshBuilder.CreateLineSystem("normalLines", {
      lines: lines
    }, this.scene);
    normalLines.color = color;
    return normalLines;
  };
  _proto.selectMesh = function selectMesh(mesh, highlight) {
    var _this4 = this;
    this.deselectMesh();
    if (mesh) {
      this.selectedMesh = mesh;
      this.viewerState.sceneSelectedMeshId = mesh.id;
      //this.viewerState.selectedMesh.showBoundingBox = true;
      //console.debug(this.viewerState.selectedMesh.metadata.gltf.extras);
      if (highlight) {
        // Highlight
        //that.highlightLayer.addMesh(pickResult.pickedMesh, Color3.White()); // , true);
        //pickResult.pickedMesh.material = that.materialHighlight;
        //pickResult.pickedMesh.material = that.materialGrass;
        // Prepare the wireframe mesh
        // To disable depth test check rendering groups:  https://forum.babylonjs.com/t/how-do-i-disable-depth-testing-on-a-mesh/1159
        var highlightClone = mesh.clone();
        // Iterate clone recursively to set highlight material to all submeshes
        var setHighlightRecursively = function setHighlightRecursively(submesh) {
          submesh.material = _this4.materialHighlight;
          for (var _iterator9 = _createForOfIteratorHelperLoose(submesh.getChildren()), _step9; !(_step9 = _iterator9()).done;) {
            var mc = _step9.value;
            setHighlightRecursively(mc);
          }
        };
        setHighlightRecursively(highlightClone);
        //highlightClone.material = this.materialHighlight;
        highlightClone.parent = mesh.parent;
        this.highlightMeshes.push(highlightClone);
      }
    }
  };
  _proto.getBoundsRecursively = function getBoundsRecursively(node, bounds) {
    if (!bounds) {
      //bounds = { minimumWorld: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY, z: Number.POSITIVE_INFINITY },
      //    maximumWorld: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z: Number.NEGATIVE_INFINITY } };
      bounds = new BoundingInfo(new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY), new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY));
    }
    if (node.getBoundingInfo) {
      var minWorld = node.getBoundingInfo().boundingBox.minimumWorld;
      var maxWorld = node.getBoundingInfo().boundingBox.maximumWorld;
      if (bounds.minimum.x > minWorld.x) {
        bounds.minimum.x = minWorld.x;
      }
      if (bounds.minimum.y > minWorld.y) {
        bounds.minimum.y = minWorld.y;
      }
      if (bounds.minimum.z > minWorld.z) {
        bounds.minimum.z = minWorld.z;
      }
      if (bounds.maximum.x < maxWorld.x) {
        bounds.maximum.x = maxWorld.x;
      }
      if (bounds.maximum.y < maxWorld.y) {
        bounds.maximum.y = maxWorld.y;
      }
      if (bounds.maximum.z < maxWorld.z) {
        bounds.maximum.z = maxWorld.z;
      }
    }
    for (var _iterator10 = _createForOfIteratorHelperLoose(node.getChildren()), _step10; !(_step10 = _iterator10()).done;) {
      var nc = _step10.value;
      bounds = this.getBoundsRecursively(nc, bounds);
    }
    return bounds;
  }
  /*
  * Find a node within a scene or node recursively.
  * Criteria is a dictionary of key=value pairs. An object will match if any of the pairs matches object's metadata.
  */;
  _proto.findNode = function findNode(node, criteria) {
    //console.debug(node);
    if (criteria["_node_name"] && node.id) {
      var name = node.id.split("/").pop().replaceAll("#", "_");
      if (name === criteria["_node_name"]) {
        return node;
      }
    }
    if (node.metadata && node.metadata.gltf && node.metadata.gltf.extras) {
      var metadata = node.metadata.gltf.extras;
      for (var key in criteria) {
        if (metadata[key] === criteria[key]) {
          return node;
        }
      }
    }
    for (var _iterator11 = _createForOfIteratorHelperLoose(node.getChildren()), _step11; !(_step11 = _iterator11()).done;) {
      var sn = _step11.value;
      var result = this.findNode(sn, criteria);
      if (result) {
        return result;
      }
    }
    return null;
  };
  _proto.initCamera = function initCamera() {
    if (this.camera) {
      this.camera.customRenderTargets.length = 0; //4 = [];
      this.camera.detachControl();
      this.camera.dispose();
    }
    console.debug("Creating free camera.");
    var camera = new UniversalCamera("Camera", Vector3.Zero(), this.scene);
    camera.detachControl(); // Controls managed by DDD CameraController
    camera.minZ = 0.5; // 1.0; // 0.1;
    camera.maxZ = 4500;
    camera.angularSensibility = 500.0;
    camera.touchAngularSensibility = 1000.0;
    //camera.touchMoveSensibility = 1.0;
    camera.inertia = 0.25;
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera.keysUpward.push(69);
    camera.keysDownward.push(81);
    camera.attachControl(this.engine.getRenderingCanvas(), true);
    camera.fov = 45.8 * (Math.PI / 180.0); // 35.0 might be GM, 45.8... is default  // 35 // 40 used for a long time
    var positionScene = this.wgs84ToScene(this.viewerState.positionWGS84);
    camera.position = new Vector3(positionScene[0], this.viewerState.positionGroundHeight + this.viewerState.positionTerrainElevation + 1, positionScene[2]);
    camera.rotation = new Vector3((90.0 - this.viewerState.positionTilt) * (Math.PI / 180.0), this.viewerState.positionHeading * (Math.PI / 180.0), 0.0);
    //camera.cameraRotation = new Vector2(/* (90.0 - this.viewerState.positionTilt) * (Math.PI / 180.0) */ 0, this.viewerState.positionHeading * (Math.PI / 180.0));
    this.camera = camera;
    this.setMoveSpeed(this.viewerState.sceneMoveSpeed);
    this.updateRenderTargets();
    if (this.shadowGenerator) {
      this.shadowGenerator.splitFrustum();
    }
    return camera;
  };
  _proto.setCameraController = function setCameraController(cc) {
    this.cameraController = cc;
    this.cameraController.activate();
  };
  _proto.setPosition = function setPosition(positionHeading, positionTilt, positionGroundHeight) {
    console.warn("setPosition implementation is invalid, for testing purposes.");
    var positionScene = this.wgs84ToScene(this.viewerState.positionWGS84);
    this.camera.position = new Vector3(positionScene[0], this.viewerState.positionGroundHeight + this.viewerState.positionTerrainElevation + 1, positionScene[2]);
    this.camera.rotation = new Vector3((90.0 - this.viewerState.positionTilt) * (Math.PI / 180.0), this.viewerState.positionHeading * (Math.PI / 180.0), 0.0);
  };
  _proto.updateRenderTargets = function updateRenderTargets() {
    if (this.camera && this.envReflectionProbe) {
      this.camera.customRenderTargets.push(this.envReflectionProbe.cubeTexture);
    }
    //this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("standardPipeline", this.camera);
  };
  _proto.groundTextureLayerSetUrl = function groundTextureLayerSetUrl(url) {
    // TODO: This shall not be a global viewer setting, but a layer setting
    // This method is keep here for compatibility during TS migration / refactoring
    this.viewerState.sceneGroundTextureOverrideUrl = url;
    this.layerManager.layers["ddd-osm-3d"].groundTextureLayerSetUrl(url);
  };
  _proto.setMoveSpeed = function setMoveSpeed(speed) {
    this.viewerState.sceneMoveSpeed = speed;
    if (this.camera && this.camera instanceof TargetCamera) {
      this.camera.speed = speed;
    }
  };
  _proto.lightSetupFromDatePos = function lightSetupFromDatePos() {
    //this.envReflectionProbe.update(); // = new ReflectionProbe("envReflectionProbe", 128, this.scene, true, true, true)
    //this.envReflectionProbe.renderList.push(this.skyBox);
    //this.scene.environmentTexture = this.envReflectionProbe.cubeTexture;
    //console.debug(this.envReflectionProbe.cubeTexture.readPixels(0, 0));
    var lightDate = new Date(this.viewerState.positionDate.getTime());
    var lightSecondsOffsetTimezone = this.viewerState.positionWGS84[0] / 180.0 * (12 * 3600);
    lightDate.setSeconds(lightDate.getSeconds() - lightSecondsOffsetTimezone);
    var times = SunCalc.getTimes(lightDate, this.viewerState.positionWGS84[1], this.viewerState.positionWGS84[0]);
    var sunriseStr = times.sunrise.getHours() + ":" + times.sunrise.getMinutes();
    var sunsetStr = times.sunset.getHours() + ":" + times.sunset.getMinutes();
    // get position of the sun (azimuth and altitude) at today's sunrise
    ///*var sunrisePos = SunCalc.getPosition(times.sunrise, this.viewerState.positionWGS84[1], this.viewerState.positionWGS84[0]);
    //var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;
    //var sunsetSunPos = SunCalc.getPosition(times.sunset, this.viewerState.positionWGS84[1], this.viewerState.positionWGS84[0]);
    //var sunsetAzimuth = sunsetPos.azimuth * 180 / Math.PI; **
    var currentSunPos = SunCalc.getPosition(lightDate, this.viewerState.positionWGS84[1], this.viewerState.positionWGS84[0]); // , this.viewerState.positionScene[1]
    var currentMoonPos = SunCalc.getMoonPosition(lightDate, this.viewerState.positionWGS84[1], this.viewerState.positionWGS84[0]);
    //var crrentMoonIlum = SunCalc.getMoonIllumination(this.viewerState.positionDate);
    //var currentPos = currentSunPos.altitude > 0 ? currentSunPos : currentMoonPos;
    //var currentElevation = currentPos.altitude * 180 / Math.PI;
    //var currentAzimuth = currentPos.azimuth * 180 / Math.PI;
    //console.debug("Sun azimuth: " + currentAzimuth + " ele: " + currentElevation + " Date: " + this.viewerState.positionDate + " Sunrise: " + sunriseStr + " azimuth: " + sunriseAzimuth + " Sunset: " + sunsetStr + " azimuth: " + sunsetAzimuth);
    var altitudeLessHorizonAtmAprox = (currentSunPos.altitude + 0.25) / (Math.PI + 0.25) * Math.PI; // 0.25~15rad
    var sunlightAmountNorm = Math.sin(altitudeLessHorizonAtmAprox);
    if (sunlightAmountNorm < 0) {
      sunlightAmountNorm = 0;
    }
    sunlightAmountNorm = 1 - Math.pow(1 - sunlightAmountNorm, 4);
    //let lightAltitude = altitudeLessHorizonAtmAprox >= 0 && altitudeLessHorizonAtmAprox < Math.PI ? altitudeLessHorizonAtmAprox : Math.PI - altitudeLessHorizonAtmAprox;
    var sunAltitude = currentSunPos.altitude >= 0 ? currentSunPos.altitude : 0.01;
    var lightRot = Quaternion.FromEulerAngles(sunAltitude, currentSunPos.azimuth, 0); // Use moon
    var lightSunAndFlareRot = Quaternion.FromEulerAngles(sunAltitude, currentSunPos.azimuth, 0);
    //this.light = new DirectionalLight("light", new Vector3(0.3, -0.5, 0.5).normalizeToNew(), this.scene);
    //this.light.diffuse = new Color3(0.95, 0.95, 1.00);
    //this.light.specular = new Color3(1, 1, 0.95);
    var minLightDay = 0.0;
    var maxLightDay = 1.1; // 3.0;
    // Set light dir and intensity
    Vector3.Forward().rotateByQuaternionToRef(lightRot, this.light.direction);
    var lightIntensity = minLightDay + (maxLightDay - minLightDay) * sunlightAmountNorm;
    //console.debug("Sunlight amount norm: " + sunlightAmountNorm + " lightIntensity: " + lightIntensity);
    this.light.intensity = lightIntensity;
    /*
    if (this.scene.environmentTexture) {
        this.scene.environmentTexture.level = 0.1 + sunlightAmountNorm; // = hdrTexture;
    }
    Color3.LerpToRef(this.ambientColorNight, this.ambientColorDay, sunlightAmountNorm, this.scene.ambientColor);
    */
    if (this.skybox) {
      this.skybox.rotation.y = currentSunPos.azimuth - 19 * (Math.PI / 180.0);
    }
    var skyboxMinReflectionLevel = 0.05;
    var environmentIntensityMax = 1.2;
    if (this.skybox && this.skybox.material && this.skybox.material instanceof StandardMaterial) {
      this.skybox.material.reflectionTexture.level = skyboxMinReflectionLevel + sunlightAmountNorm;
    }
    this.scene.environmentIntensity = skyboxMinReflectionLevel + sunlightAmountNorm * environmentIntensityMax;
    if (this.skybox) {
      var shaderMaterial = this.scene.getMaterialByName("skyShader");
      if (shaderMaterial) {
        shaderMaterial.setFloat("time", this.viewerState.positionDate.getTime() % 100000000.0 / 500000.0);
        if (currentSunPos.altitude > 0) {
          shaderMaterial.setFloat("suny", Math.sin(currentSunPos.altitude));
        } else if (currentMoonPos.altitude > 0) {
          //shaderMaterial.setFloat("suny", -Math.sin(currentMoonPos.altitude));
          shaderMaterial.setFloat("suny", Math.sin(currentSunPos.altitude));
        } else {
          //shaderMaterial.setFloat("suny", 0);
          shaderMaterial.setFloat("suny", Math.sin(currentSunPos.altitude));
        }
        //shaderMaterial.setFloat( "sunx", ( currentSunPos.azimuth - ( Math.PI / 2.0 )) / Math.PI );
        shaderMaterial.setFloat("sunx", (19 * (Math.PI / 180.0) - Math.PI / 2.0) / Math.PI);
      }
    }
    if (this.lensFlareSystem) {
      Vector3.Forward().rotateByQuaternionToRef(lightSunAndFlareRot, this.lensFlareSystem.getEmitter().position);
      this.lensFlareSystem.getEmitter().position.scaleInPlace(-1400.0);
      this.lensFlareSystem.getEmitter().position.addInPlace(this.camera.position);
      this.lensFlareSystem.setEmitter(this.lensFlareSystem.getEmitter());
      var flareEnabled = currentSunPos.altitude > 0;
      if (this.lensFlareSystem.isEnabled !== flareEnabled) {
        this.lensFlareSystem.isEnabled = flareEnabled;
      }
    }
    // Update light position for correct shadows calculation
    // TODO: This shall not be done as part of datetime/sun update, as it is needed even if time is not moving
    Vector3.Forward().rotateByQuaternionToRef(lightSunAndFlareRot, this.light.position);
    this.light.position.scaleInPlace(-1400.0);
    this.light.position.addInPlace(this.camera.position);
    this.light.position = this.light.position;
    //console.debug(this.scene.ambientColor);
    // Lamps
    var lampMatOn = sunlightAmountNorm < 0.35; // 0.3 fits, but turn off too quick
    if (lampMatOn !== this._previousLampPatOn) {
      this._previousLampPatOn = lampMatOn;
      if ("LightLampOff" in this.catalog_materials) {
        var lampMat = this.catalog_materials["LightLampOff"];
        lampMat.unfreeze();
        if (lampMatOn) {
          lampMat.emissiveColor = this.colorLightLamp;
        } else {
          lampMat.emissiveColor = Color3.Black();
        }
        //lampMat.freeze();
      }
    }

    var semCycleSeconds = 20;
    var semColor = this.viewerState.positionDate.getMinutes() % semCycleSeconds / semCycleSeconds;
    semColor = semColor < 0.5 ? 0 : semColor < 0.9 ? 1 : 2;
    if ("LightRed" in this.catalog_materials) {
      var _lampMat = this.catalog_materials["LightRed"];
      _lampMat.unfreeze();
      _lampMat.emissiveColor = semColor === 0 ? this.colorLightRed : Color3.Black();
      //lampMat.freeze();
    }

    if ("LightGreen" in this.catalog_materials) {
      var _lampMat2 = this.catalog_materials["LightGreen"];
      _lampMat2.unfreeze();
      _lampMat2.emissiveColor = semColor === 1 ? this.colorLightGreen : Color3.Black();
    }
    if ("LightOrange" in this.catalog_materials) {
      var _lampMat3 = this.catalog_materials["LightOrange"];
      _lampMat3.unfreeze();
      _lampMat3.emissiveColor = semColor === 2 ? this.colorLightOrange : Color3.Black();
      //lampMat.freeze();
    }
  };
  _proto.sceneShadowsSetEnabled = function sceneShadowsSetEnabled(value) {
    this.viewerState.sceneShadowsEnabled = value;
    localStorage.setItem("dddSceneShadowsEnabled", JSON.stringify(value));
    // TODO: If shadows were off, we'd still need to create the shadowgenerator and add shadow casters
    this.scene.shadowsEnabled = value;
    // TODO: this persistent setting belongs to the app
    alert("Reload the viewer for changes to take effect.");
  };
  _proto.sceneTextsSetEnabled = function sceneTextsSetEnabled(value) {
    this.viewerState.sceneTextsEnabled = value;
    localStorage.setItem("dddSceneTextsEnabled", JSON.stringify(value));
    // TODO: this persistent setting belongs to the app
    alert("Reload the viewer for changes to take effect.");
  }
  /**
  */;
  _proto.loadTextures = function loadTextures() {
    var textures = this.viewerState.dddConfig.materialsTextureSet;
    var splatmap = this.viewerState.dddConfig.materialsSplatmap;
    console.debug("Loading textures: " + textures + " (splatmap: " + splatmap + ")");
    if (textures !== null) {
      this.loadCatalog(this.viewerState.dddConfig.assetsUrlbase + "/catalog_materials-" + textures + ".glb", true);
    }
    if (splatmap) {
      console.info("Loading splatmap textures.");
      this.useSplatMap = true;
      var atlasTextureUrl = this.viewerState.dddConfig.assetsUrlbase + "/splatmap-textures-atlas-" + splatmap + ".png";
      var atlasNormalsTextureUrl = this.viewerState.dddConfig.assetsUrlbase + "/splatmap-textures-atlas-normals-" + splatmap + ".png";
      this.splatmapAtlasTexture = new Texture(atlasTextureUrl, this.scene, false, true, Texture.NEAREST_NEAREST_MIPLINEAR); // , Texture.NEAREST_SAMPLINGMODE);
      this.splatmapAtlasNormalsTexture = new Texture(atlasNormalsTextureUrl, this.scene, false, true, Texture.NEAREST_NEAREST_MIPLINEAR);
    } else {
      this.useSplatMap = false;
    }
  }
  /**
   * Changes the materials set used to draw the scene.
   * @todo this would ideally belong to layers that explicity support DDD export features (splatmaps / texture catalogs)
   * @param textureSet
   */;
  _proto.sceneTextureSet = function sceneTextureSet(textureSet, splatmap) {
    this.viewerState.dddConfig.materialsTextureSet = textureSet;
    this.viewerState.dddConfig.materialsSplatmap = splatmap;
    //if (textureSet) {
    this.loadTextures();
    //}
    alert("Reload the app to apply changes.");
  };
  return SceneViewer;
}();

/**
 * DDD Viewer base layer class.
 */
var GeolocationCameraController = /*#__PURE__*/function (_BaseCameraController) {
  _inheritsLoose(GeolocationCameraController, _BaseCameraController);
  function GeolocationCameraController() {
    return _BaseCameraController.apply(this, arguments) || this;
  }
  var _proto = GeolocationCameraController.prototype;
  _proto.update = function update(deltaTime) {};
  _proto.activate = function activate() {};
  return GeolocationCameraController;
}(BaseCameraController);

/**
 * DDD Viewer base layer class.
 */
var OrbitCameraController = /*#__PURE__*/function (_BaseCameraController) {
  _inheritsLoose(OrbitCameraController, _BaseCameraController);
  function OrbitCameraController() {
    return _BaseCameraController.apply(this, arguments) || this;
  }
  var _proto = OrbitCameraController.prototype;
  _proto.update = function update(deltaTime) {
    // Fix viewer to floor
    var terrainElevation = this.dddViewer.viewerState.positionTerrainElevation;
    if (terrainElevation && this.dddViewer.camera.position.y < terrainElevation + 1.0) {
      this.getCamera().position.y = terrainElevation + 1.0;
    }
  };
  _proto.activate = function activate() {
    var targetCoords = Vector3.Zero();
    if (this.dddViewer.selectedObject) {
      var boundingBox = this.dddViewer.getBoundsRecursively(this.dddViewer.selectedObject.mesh);
      //targetCoords = this.selectedMesh.absolutePosition;
      var minWorld = boundingBox.minimum;
      var maxWorld = boundingBox.maximum;
      targetCoords = new Vector3((minWorld.x + maxWorld.x) / 2, (minWorld.y + maxWorld.y) / 2, (minWorld.z + maxWorld.z) / 2);
    }
    var distance = 75.0;
    if (this.dddViewer.camera) {
      distance = Vector3.Distance(this.dddViewer.camera.position, targetCoords);
      this.dddViewer.camera.customRenderTargets.length = 0; //  = [];
      this.dddViewer.camera.detachControl();
      this.dddViewer.camera.dispose();
    }
    console.debug("Creating orbit camera pointing to: " + targetCoords);
    var camera = new ArcRotateCamera("Camera", -(90 + this.dddViewer.viewerState.positionHeading) * Math.PI / 180.0, this.dddViewer.viewerState.positionTilt * Math.PI / 180.0, distance, targetCoords, this.dddViewer.scene);
    camera.attachControl(this.dddViewer.engine.getRenderingCanvas(), true);
    camera.minZ = 0.5; // 1.0; // 0.1;
    //camera.maxZ = 2500;  // Automatic? see focusOn()
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 1000;
    camera.upperBetaLimit = Math.PI; // /2; // Math.PI / 2 = limit to flat view
    camera.panningSensibility = 50.0; // 0.5;
    //camera.angularSensibility = 50.0;
    //camera.inertia = 0.10;
    //camera.multiTouchPanning = false;
    //camera.multiTouchPanAndZoom = false;
    //camera.pinchZoom = true;
    camera.useNaturalPinchZoom = true;
    camera.fov = 35.0 * (Math.PI / 180.0);
    this.dddViewer.camera = camera;
    this.dddViewer.updateRenderTargets();
    if (this.dddViewer.shadowGenerator) {
      this.dddViewer.shadowGenerator.splitFrustum();
    }
  };
  return OrbitCameraController;
}(BaseCameraController);

/**
 * DDD Viewer base layer class.
 */
var PanningCameraController = /*#__PURE__*/function (_BaseCameraController) {
  _inheritsLoose(PanningCameraController, _BaseCameraController);
  function PanningCameraController() {
    return _BaseCameraController.apply(this, arguments) || this;
  }
  var _proto = PanningCameraController.prototype;
  _proto.update = function update(deltaTime) {};
  _proto.activate = function activate() {};
  return PanningCameraController;
}(BaseCameraController);

/**
 * DDD Viewer base layer class.
 */
var WalkCameraController = /*#__PURE__*/function (_FreeCameraController) {
  _inheritsLoose(WalkCameraController, _FreeCameraController);
  function WalkCameraController() {
    var _this;
    _this = _FreeCameraController.apply(this, arguments) || this;
    _this.sceneCameraWalkHeight = 1.75; // 2.0;
    return _this;
  }
  //falling = false;
  var _proto = WalkCameraController.prototype;
  _proto.update = function update(deltaTime) {
    // Fix viewer to floor
    var terrainElevation = this.dddViewer.viewerState.positionTerrainElevation;
    if (terrainElevation !== null && this.dddViewer.camera) {
      this.getCamera().position.y = terrainElevation + this.sceneCameraWalkHeight; // 3.0;
    }
  };
  _proto.activate = function activate() {
    _FreeCameraController.prototype.activate.call(this);
    //this.walkMode = true;
    this.dddViewer.camera.inertia = 0.2; // 0.0;
    this.dddViewer.setMoveSpeed(this.dddViewer.viewerState.sceneMoveSpeed);
  };
  return WalkCameraController;
}(FreeCameraController);

/**
 * DDD Viewer base layer class.
 */
var WalkCollideCameraController = /*#__PURE__*/function (_WalkCameraController) {
  _inheritsLoose(WalkCollideCameraController, _WalkCameraController);
  function WalkCollideCameraController() {
    var _this;
    _this = _WalkCameraController.apply(this, arguments) || this;
    _this.velocity = new Vector3();
    _this.gravity = -9.8;
    _this.falling = false;
    _this.fallStartDistance = 0.5;
    return _this;
  }
  var _proto = WalkCollideCameraController.prototype;
  _proto.update = function update(deltaTime) {
    // Fix viewer to floor
    var terrainElevation = this.dddViewer.viewerState.positionTerrainElevation;
    if (terrainElevation !== null && this.dddViewer.camera) {
      var currentHeight = this.getCamera().position.y;
      var baseHeight = terrainElevation + this.sceneCameraWalkHeight;
      if (currentHeight > baseHeight + this.fallStartDistance) {
        this.falling = true;
      }
      if (this.falling) {
        this.velocity.y += this.gravity * deltaTime;
        this.getCamera().position.addInPlace(this.velocity.scale(deltaTime));
      }
      if (!this.falling || this.getCamera().position.y < baseHeight) {
        this.falling = false;
        this.velocity.set(0, 0, 0);
        this.getCamera().position.y = terrainElevation + this.sceneCameraWalkHeight;
      }
    }
  };
  return WalkCollideCameraController;
}(WalkCameraController);

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 * Manages reading of files in DDD format. DDD files are glTF files
 * with custom metadata. This class processes nodes and metadata.
 */
var DDDFormat = function DDDFormat(dddViewer) {
  // Reference to DDDViewer
  this.dddViewer = dddViewer;
};

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 */
var GeoJSONFormat = function GeoJSONFormat(dddViewer) {
  // Reference to DDDViewer
  this.dddViewer = dddViewer;
};

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and contributors
* MIT License (see LICENSE file)
*/
/**
 * DDD Viewer base layer class.
 */
var Base3DLayer = /*#__PURE__*/function () {
  function Base3DLayer(key) {
    this.visible = true;
    this.key = key;
    this.visible = true;
    this.dddViewer = null;
    this.layerManager = null;
  }
  var _proto = Base3DLayer.prototype;
  _proto.setVisible = function setVisible(visible) {
    this.visible = visible;
  };
  _proto.setViewer = function setViewer(dddViewer) {
    this.dddViewer = dddViewer;
    this.layerManager = dddViewer ? dddViewer.layerManager : null;
    if (!dddViewer) {
      this.clearScene();
    }
  };
  return Base3DLayer;
}();

var DDD3DLayer = /*#__PURE__*/function (_Base3DLayer) {
  _inheritsLoose(DDD3DLayer, _Base3DLayer);
  function DDD3DLayer(key) {
    var _this;
    _this = _Base3DLayer.call(this, key) || this;
    _this.node = null;
    console.log("Constructing new DDD3DLayer.");
    // TODO: This makes sense here, but is also duplicated on SceneViewer
    return _this;
  }
  var _proto = DDD3DLayer.prototype;
  _proto.update = function update() {}
  // TODO: Tile coordinates should be made a type or reuse OpenLayers grid coordinates type
  ;
  _proto.loadData = function loadData(data) {
    var _this2 = this;
    var objectBlob = new Blob([data], {
      type: 'model/gltf-binary'
    });
    var objectUrl = URL.createObjectURL(objectBlob);
    var layerKey = "model";
    var pivot = new Mesh("dddobject_" + layerKey, this.layerManager.sceneViewer.scene);
    this.layerManager.sceneViewer.queueLoader.enqueueLoadModel(objectUrl,
    // onSuccess
    function (newMeshes, _particleSystems, _skeletons) {
      //console.log("DDD3DLayer GLB loaded", newMeshes);
      newMeshes.forEach(function (mesh, _i) {
        if (_this2.layerManager.sceneViewer.shadowGenerator) {
          mesh.receiveShadows = true;
          if (mesh.metadata && mesh.metadata.gltf.extras && (mesh.metadata.gltf.extras["ddd:shadows"] === false || mesh.metadata.gltf.extras["ddd:shadows"] === "false" || mesh.metadata.gltf.extras["ddd:path"].indexOf("/Areas_") > 0 || mesh.metadata.gltf.extras["ddd:path"].indexOf("/Ways_") > 0)) {
            //console.debug("No shadow");
            return;
          }
          // TODO: Do this at SceneViewer processMesh level
          _this2.layerManager.sceneViewer.shadowGenerator.getShadowMap().renderList.push(mesh);
        }
      });
      // Reparent root
      newMeshes[0].parent = pivot;
      _this2.node = pivot;
      pivot.freezeWorldMatrix();
      _this2.layerManager.sceneViewer.scene.blockfreeActiveMeshesAndRenderingGroups = true;
      _this2.layerManager.sceneViewer.processMesh(pivot, pivot); // TODO: Wrong conversion, use Node for "processMesh"
      _this2.layerManager.sceneViewer.scene.blockfreeActiveMeshesAndRenderingGroups = false;
      //pivot.occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
      pivot.freezeWorldMatrix();
    },
    // onError
    function (_scene, _msg, ex) {
      // eslint-disable-next-line no-console
      console.log("Tile model (.glb) loading error: ", ex);
    });
    //model.parent = pivot;
  };
  _proto.clearScene = function clearScene() {
    console.log("Deleting DDD3DLayer: " + this.key);
    if (this.node) {
      //tile.node.setEnabled(false);
      this.node.parent = null;
      this.node.dispose();
      this.node = null;
    }
  };
  _proto.setVisible = function setVisible(visible) {
    _Base3DLayer.prototype.setVisible.call(this, visible);
    if (this.node) this.node.setEnabled(this.visible);
  };
  return DDD3DLayer;
}(Base3DLayer);

var GeoJsonItem = function GeoJsonItem() {};
var GeoJsonPoint = /*#__PURE__*/function (_GeoJsonItem) {
  _inheritsLoose(GeoJsonPoint, _GeoJsonItem);
  function GeoJsonPoint(coordsWgs84) {
    var _this;
    _this = _GeoJsonItem.call(this) || this;
    _this.coordsWgs84 = Vector3.Zero();
    _this.coordsScene = Vector3.Zero();
    _this.coordsWgs84 = coordsWgs84;
    return _this;
  }
  /**
   * Currently receives a viewer for coordinate transformations
   */
  var _proto = GeoJsonPoint.prototype;
  _proto.transformCoords = function transformCoords(viewer) {
    var csa = viewer.wgs84ToScene(this.coordsWgs84.asArray());
    this.coordsScene = Vector3.FromArray(csa);
  };
  return GeoJsonPoint;
}(GeoJsonItem);
var GeoJsonLine = /*#__PURE__*/function (_GeoJsonItem2) {
  _inheritsLoose(GeoJsonLine, _GeoJsonItem2);
  function GeoJsonLine(coordsWgs84) {
    var _this2;
    _this2 = _GeoJsonItem2.call(this) || this;
    // TODO: These should be buffers
    _this2.coordsWgs84 = [];
    _this2.coordsScene = [];
    _this2.coordsWgs84 = coordsWgs84;
    return _this2;
  }
  /**
   * Currently receives a viewer for coordinate transformations
   */
  var _proto2 = GeoJsonLine.prototype;
  _proto2.transformCoords = function transformCoords(viewer) {
    this.coordsScene = [];
    for (var _iterator = _createForOfIteratorHelperLoose(this.coordsWgs84), _step; !(_step = _iterator()).done;) {
      var v = _step.value;
      var csa = viewer.wgs84ToScene(v.asArray());
      this.coordsScene.push(Vector3.FromArray(csa));
    }
  };
  return GeoJsonLine;
}(GeoJsonItem);
var GeoJson3DLayer = /*#__PURE__*/function (_Base3DLayer) {
  _inheritsLoose(GeoJson3DLayer, _Base3DLayer);
  function GeoJson3DLayer(key, geojsonData) {
    var _this3;
    _this3 = _Base3DLayer.call(this, key) || this;
    _this3.featuresPoints = [];
    _this3.featuresLines = [];
    _this3.altitudeOffset = 50;
    _this3.colorHex = "#ff00ff";
    //private sceneNodes: Mesh[] = [];
    _this3.rootNode = null;
    _this3.featureMaterial = null;
    setTimeout(function () {
      _this3.loadFromGeoJson(geojsonData);
      _this3.projectFeatures();
      _this3.updateSceneFromFeatures();
    }, 0);
    return _this3;
  }
  var _proto3 = GeoJson3DLayer.prototype;
  _proto3.update = function update() {};
  _proto3.setColor = function setColor(colorHex) {
    this.colorHex = colorHex;
    if (this.featureMaterial) {
      var color = Color3.FromHexString(colorHex);
      //this.featureMaterial.unfreeze();
      this.featureMaterial.diffuseColor = color;
      this.featureMaterial.emissiveColor = color;
      this.featureMaterial.disableLighting = true;
      //this.featureMaterial.freeze();
    }
  };
  _proto3.setVisible = function setVisible(visible) {
    _Base3DLayer.prototype.setVisible.call(this, visible);
    if (this.rootNode) this.rootNode.setEnabled(this.visible);
    /*
    for (let node of this.sceneNodes) {
        node.setEnabled(this.visible);
    }
    */
  };
  _proto3.setAltitudeOffset = function setAltitudeOffset(altitudeOffset) {
    this.altitudeOffset = altitudeOffset;
    if (this.rootNode) {
      this.rootNode.position.y = this.altitudeOffset; // Apply offset
    }
  }
  /**
   * Processes GeoJSON data (already loaded as Javascript objects) and loads the different features.
   */;
  _proto3.loadFromGeoJson = function loadFromGeoJson(data) {
    for (var _iterator2 = _createForOfIteratorHelperLoose(data['features']), _step2; !(_step2 = _iterator2()).done;) {
      var feature = _step2.value;
      this.loadFeature(feature);
    }
  };
  _proto3.loadFeature = function loadFeature(feature) {
    var properties = feature['properties'];
    var geometry = feature['geometry'];
    if (geometry['type'] == 'Point') {
      var lat = geometry['coordinates'][0];
      var lon = geometry['coordinates'][1];
      var alt = geometry['coordinates'].length > 2 ? geometry['coordinates'][2] : 0;
      var geojsonItem = new GeoJsonPoint(new Vector3(lat, lon, alt));
      geojsonItem.properties = properties;
      this.featuresPoints.push(geojsonItem);
    } else if (geometry['type'] == 'LineString') {
      var coords = [];
      for (var _iterator3 = _createForOfIteratorHelperLoose(geometry['coordinates']), _step3; !(_step3 = _iterator3()).done;) {
        var coord = _step3.value;
        var _lat = coord[0];
        var _lon = coord[1];
        var _alt = coord.length > 2 ? coord[2] : 0;
        var v = new Vector3(_lat, _lon, _alt);
        coords.push(v);
      }
      var _geojsonItem = new GeoJsonLine(coords);
      _geojsonItem.properties = properties;
      this.featuresLines.push(_geojsonItem);
    } else {
      console.info("Unknown GeoJSON geometry type: " + geometry['type']);
    }
  };
  _proto3.projectFeatures = function projectFeatures() {
    for (var _iterator4 = _createForOfIteratorHelperLoose(this.featuresPoints), _step4; !(_step4 = _iterator4()).done;) {
      var feature = _step4.value;
      feature.transformCoords(this.layerManager.sceneViewer);
    }
    for (var _iterator5 = _createForOfIteratorHelperLoose(this.featuresLines), _step5; !(_step5 = _iterator5()).done;) {
      var _feature = _step5.value;
      _feature.transformCoords(this.layerManager.sceneViewer);
    }
  }
  /**
   * TODO: This should be a more generic "markers" and "lines" vector visualization facility.
   */;
  _proto3.updateSceneFromFeatures = function updateSceneFromFeatures() {
    var sceneViewer = this.layerManager.sceneViewer;
    // Create material only if it hasn't already been created
    if (!this.featureMaterial) {
      var featureMaterial = new StandardMaterial("featureMaterial", sceneViewer.scene);
      this.featureMaterial = featureMaterial;
    }
    if (!this.rootNode) {
      this.rootNode = new TransformNode("geoJson3DLayer-root", sceneViewer.scene);
    }
    this.setColor(this.colorHex);
    for (var _iterator6 = _createForOfIteratorHelperLoose(this.featuresPoints), _step6; !(_step6 = _iterator6()).done;) {
      var feature = _step6.value;
      var marker = MeshBuilder.CreateSphere("pointMarker", {
        diameter: 1.5,
        segments: 3
      }, sceneViewer.scene);
      marker.material = this.featureMaterial;
      marker.position = feature.coordsScene;
      marker.parent = this.rootNode;
      //sceneNodes.push(marker);
    }

    for (var _iterator7 = _createForOfIteratorHelperLoose(this.featuresLines), _step7; !(_step7 = _iterator7()).done;) {
      var _feature2 = _step7.value;
      var _marker = MeshBuilder.CreateLines("lineMarker", {
        points: _feature2.coordsScene
      }, sceneViewer.scene);
      _marker.material = this.featureMaterial;
      _marker.parent = this.rootNode;
      //this.sceneNodes.push(marker);
    }

    this.setAltitudeOffset(this.altitudeOffset);
  };
  _proto3.clearScene = function clearScene() {
    if (this.rootNode) {
      this.rootNode.parent = null;
      this.rootNode.dispose();
      this.rootNode = null;
    }
  };
  return GeoJson3DLayer;
}(Base3DLayer);

var Tile3D = function Tile3D(key) {
  this.key = key;
  this.status = null;
  this.node = null;
};
var GeoTile3D = /*#__PURE__*/function (_Tile3D) {
  _inheritsLoose(GeoTile3D, _Tile3D);
  function GeoTile3D(key) {
    var _this;
    _this = _Tile3D.call(this, key) || this;
    _this.coordsTileGrid = null;
    return _this;
  }
  return GeoTile3D;
}(Tile3D);
var GeoTile3DLayer = /*#__PURE__*/function (_Base3DLayer) {
  _inheritsLoose(GeoTile3DLayer, _Base3DLayer);
  function GeoTile3DLayer() {
    var _this2;
    _this2 = _Base3DLayer.call(this, "ddd-osm-3d") || this; // FIXME: key is hardcoded
    _this2.groundTextureLayerUrl = null;
    //groundTextureLayerUrl = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";  // "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
    //groundTextureLayerUrl = "http://localhost:8090/wmts/ign_ortho/GLOBAL_WEBMERCATOR/{z}/{x}/{y}.jpeg";  // "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
    _this2._lastHeight = 0; // Used to hack positioning of tiles before height is known
    _this2._lastLoadDynamic = 0;
    _this2._initialHeightSet = false;
    _this2.tilesLoadedCount = 0;
    _this2.tiles = {};
    // TODO: This makes sense here, but is also duplicated on SceneViewer
    _this2.tileGrid = createXYZ({
      extent: extentFromProjection("EPSG:3857")
    });
    return _this2;
  }
  var _proto = GeoTile3DLayer.prototype;
  _proto.update = function update() {
    this.updateTilesDynamic();
  }
  /*
  * From: https://bartwronski.com/2017/04/13/cull-that-cone/
  */;
  _proto.testConeSphere = function testConeSphere(origin, forward, size, angle, sphereCenter, sphereRadius) {
    //console.debug(origin, forward, size, angle, sphereCenter, sphereRadius);
    var V = sphereCenter.subtract(origin);
    var VlenSq = Vector3.Dot(V, V);
    var V1len = Vector3.Dot(V, forward);
    var distanceClosestPoint = Math.cos(angle) * Math.sqrt(VlenSq - V1len * V1len) - V1len * Math.sin(angle);
    var angleCull = distanceClosestPoint > sphereRadius;
    var frontCull = V1len > sphereRadius + size;
    var backCull = V1len < -sphereRadius;
    return !(angleCull || frontCull || backCull);
  };
  _proto.updateTilesDynamic = function updateTilesDynamic() {
    var _this$layerManager;
    // loading chunks each 100 frames. Bad performance
    this._lastLoadDynamic -= 1;
    if (this._lastLoadDynamic > 0) {
      return;
    }
    this._lastLoadDynamic = 1;
    var sceneViewer = this.layerManager.sceneViewer;
    var positionWGS84 = (_this$layerManager = this.layerManager) == null ? void 0 : _this$layerManager.sceneViewer.positionWGS84();
    var coordsWGS84 = [positionWGS84[0], positionWGS84[1]];
    var coordsUtm = transform(coordsWGS84, "EPSG:4326", "EPSG:3857");
    var tileCoords = this.tileGrid.getTileCoordForCoordAndZ(coordsUtm, 17);
    //const tileKey = tileCoords[0] + "/" + tileCoords[1] + "/" + tileCoords[2];
    // Calculate frustrum (2D)
    var frustrumOrigin = sceneViewer.camera.position.clone();
    //if (this._lastHeight) { frustrumOrigin.y -= this._lastHeight; }  // Considers all tiles in a plane centered on last
    frustrumOrigin.y = 0;
    var frustrumForward = sceneViewer.camera.getDirection(Vector3.Forward());
    frustrumForward.y = 0;
    frustrumForward.normalize();
    var frustrumSize = sceneViewer.viewerState.sceneTileDrawDistance * 300.0; // 1500.0;
    var frustrumAngle = sceneViewer.camera.fov * 2.0; // * (Math.PI / 180.0); // 30.0;
    this.loadTile(tileCoords); // ensure elevation for current tile
    // Project frustrum corners to tiles
    // Calculate tiles inside frustrum
    var tiledistWalk = sceneViewer.viewerState.sceneTileDrawDistance + 3;
    var tiledistDraw = sceneViewer.viewerState.sceneTileDrawDistance + 0.7;
    for (var i = -tiledistWalk; i <= tiledistWalk; i++) {
      for (var j = -tiledistWalk; j <= tiledistWalk; j++) {
        // Current tile is already enqueued
        if (i === 0 && j === 0) {
          continue;
        }
        if (i * i + j * j > tiledistDraw * tiledistDraw) {
          this.disableTile([tileCoords[0], tileCoords[1] + i, tileCoords[2] + j]);
        } else {
          var tileCenter = this.tileGrid.getTileCoordCenter([tileCoords[0], tileCoords[1] + i, tileCoords[2] + j]);
          var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
          var tileCenterScene = sceneViewer.projection.forward(tileCenterWGS84);
          var sphereCenter = new Vector3(tileCenterScene[0], 0, tileCenterScene[1]); // TODO: Get median height from tile
          var sphereRadius = 230.0 / 2.0;
          if (this.testConeSphere(frustrumOrigin, frustrumForward, frustrumSize, frustrumAngle, sphereCenter, sphereRadius)) {
            //console.debug("Loading: ", [tileCoords[0], tileCoords[1] + i, tileCoords[2] + j])
            this.loadTile([tileCoords[0], tileCoords[1] + i, tileCoords[2] + j]);
          } else {
            //console.debug("Ignoring: ", [tileCoords[0], tileCoords[1] + i, tileCoords[2] + j])
            this.disableTile([tileCoords[0], tileCoords[1] + i, tileCoords[2] + j]);
          }
        }
      }
    }
    // Sort tiles by distance
    // Enqueue (1 on mobile? 2 on PC?)
    // setEnabled(false) on culled chunks
    // update LOD levels (call lodLevel - remove items, etc) per distance
    /*
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            this.loadTile([tileCoords[0], tileCoords[1] + i, tileCoords[2] + j]);
        }
    }
    */
  };
  _proto.disableTile = function disableTile(tileCoords) {
    var z = tileCoords[0];
    var x = tileCoords[1];
    var y = tileCoords[2];
    var tileKey = z + "/" + x + "/" + y;
    if (!(tileKey in this.tiles)) {
      return;
    }
    var tile = this.tiles[tileKey];
    if (tile.status !== "loading" && tile.node.isEnabled(false)) {
      tile.node.setEnabled(false);
      tile.node.parent = null; // TODO: this was not working before (tile.parent did not apply)
    }
  }
  /**
  * Gets tile metadata.
  * It does this recursively searching for a "Metadata" named node, as the path exporting root metadata to the root node or scene itself hasn't been found to work.
  */;
  _proto.getTileMetadata = function getTileMetadata(node) {
    /*if (node.id.startsWith("Metadata")) {
        return node.metadata.gltf.extras;
    }*/
    for (var _iterator = _createForOfIteratorHelperLoose(node.getChildren()), _step; !(_step = _iterator()).done;) {
      var child = _step.value;
      // Must start with Metadata
      if (child.id.indexOf("Metadata") == 0) {
        return child.metadata.gltf.extras;
      }
    }
    for (var _iterator2 = _createForOfIteratorHelperLoose(node.getChildren()), _step2; !(_step2 = _iterator2()).done;) {
      var _child = _step2.value;
      var md = this.getTileMetadata(_child);
      if (md !== null) {
        return md;
      }
    }
    return null;
  }
  // TODO: Tile coordinates should be made a type or reuse OpenLayers grid coordinates type
  ;
  _proto.loadTile = function loadTile(tileCoords) {
    var _this3 = this;
    //console.debug(tileCoords);
    var z = tileCoords[0];
    var x = tileCoords[1];
    var y = tileCoords[2];
    var tileKey = z + "/" + x + "/" + y;
    var tileExtent = this.tileGrid.getTileCoordExtent(tileCoords);
    var tileCenter = getCenter(tileExtent);
    var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
    //const tileCenterScene = this.layerManager!.sceneViewer.projection.forward( tileCenterWGS84 );
    var tileExtentMinScene = this.layerManager.sceneViewer.projection.forward(transform(getBottomLeft(tileExtent), "EPSG:3857", "EPSG:4326"));
    var tileExtentMaxScene = this.layerManager.sceneViewer.projection.forward(transform(getTopRight(tileExtent), "EPSG:3857", "EPSG:4326"));
    var sizeWidth = Math.abs(tileExtentMaxScene[0] - tileExtentMinScene[0]);
    var sizeHeight = Math.abs(tileExtentMaxScene[1] - tileExtentMinScene[1]);
    if (tileKey in this.tiles) {
      var tile = this.tiles[tileKey];
      if (tile.status !== "loading" && !tile.node.isEnabled(false)) {
        tile.node.parent = null; // this.layerManager!.sceneViewer.scene;
        tile.node.setEnabled(true);
        //tile.node.freezeWorldMatrix();
      }

      return;
    } else {
      this.tiles[tileKey] = new GeoTile3D(tileKey);
      this.tiles[tileKey].status = "loading";
      this.tiles[tileKey].coordsTileGrid = tileCoords;
    }
    //const tileUrlBase = './scenes/ddd_http_';
    //const tileUrlBase = 'http://localhost:8000/cache/ddd_http/';
    //const tileUrlBase = 'http://' + app.dddConfig.tileUrlBase + ':8000/cache/ddd_http/';
    //const tileUrlBase = 'http://' + location.hostname + '/cache/ddd_http/';
    var tileUrlBase = this.layerManager.sceneViewer.viewerState.dddConfig.tileUrlBase;
    var tileUrlSuffix = this.layerManager.sceneViewer.viewerState.dddConfig.tileUrlSuffix; // e.g. ".uncompressed"
    //const tileUrl = tileUrlBase + z + "/" + x + "/" + y + ".glb";
    var tileUrl = tileUrlBase + z + "/" + x + "/" + y + tileUrlSuffix + ".glb";
    //console.debug("Loading: " + tileUrl);
    //const pivot = new TransformNode( "chunk_" + tileKey.replaceAll( "/", "_" ), this.layerManager!.sceneViewer.scene );  // new Mesh("chunk_" + tileKey, this.layerManager.sceneViewer.scene);
    var pivot = new Mesh("chunk_" + tileKey.replaceAll("/", "_"), this.layerManager.sceneViewer.scene); // new Mesh("chunk_" + tileKey, this.layerManager.sceneViewer.scene);
    //let reversePivot = new TransformNode("chunk_reverse_" + tileKey, this.scene);  // new Mesh("chunk_" + tileKey, this.scene);
    //let rawPivot = new TransformNode("chunk_raw_" + tileKey, this.scene);  // new Mesh("chunk_" + tileKey, this.scene);
    //reversePivot.scaling = new Vector3(1, 1, -1);  // Babylon uses a parent node with this scale to flip glTF models, redone here
    //rawPivot.parent = reversePivot;
    //reversePivot.parent = pivot;
    //pivot.parent = this.scene;
    var marker = this.loadQuadMarker(tileCoords, Color3.Gray());
    this.tiles[tileKey].node = marker;
    this.layerManager.sceneViewer.queueLoader.enqueueLoadModel(tileUrl,
    // onSuccess
    function (newMeshes, _particleSystems, _skeletons) {
      // Ensure tile still exists:
      if (!(tileKey in _this3.tiles)) {
        newMeshes[0].parent = null;
        newMeshes[0].dispose();
        return;
      }
      //console.log("GLB loaded", newMeshes);
      marker.dispose(false, true);
      //marker.parent = null;
      var minHeight = Number.POSITIVE_INFINITY;
      newMeshes.forEach(function (mesh, _i) {
        if (_this3.layerManager.sceneViewer.shadowGenerator) {
          mesh.receiveShadows = true;
          if (mesh.metadata && mesh.metadata.gltf.extras && (mesh.metadata.gltf.extras["ddd:shadows"] === false || mesh.metadata.gltf.extras["ddd:shadows"] === "false" || mesh.metadata.gltf.extras["ddd:path"].indexOf("/Areas_") > 0 || mesh.metadata.gltf.extras["ddd:path"].indexOf("/Ways_") > 0)) {
            //console.debug("No shadow");
            return;
          }
          // TODO: Do this at SceneViewer processMesh level
          _this3.layerManager.sceneViewer.shadowGenerator.getShadowMap().renderList.push(mesh);
        }
        //console.debug(mesh.getBoundingInfo());
        var heightMin = mesh.getBoundingInfo().boundingBox.minimumWorld.y;
        if (heightMin < minHeight && heightMin !== 0) {
          minHeight = heightMin;
        }
        var heightMax = mesh.getBoundingInfo().boundingBox.maximumWorld.y;
        /*
          if(mesh.material) {
              if (mesh.id.indexOf("Item") < 0 && mesh.id.indexOf("Building") < 0) {
                  mesh.material = materialPlane;
              }
              //mesh.overrideMaterialSideOrientation = Mesh.DOUBLESIDE;
              //mesh.updateMeshPositions();
          }
          */
        //console.debug(mesh.absolutePosition);
        //mesh.position = new Vector3(mesh.position.x, mesh.position.y, -mesh.position.z);
        //mesh.updateMeshPositions();
        //mesh.parent = rawPivot;
      });
      // Reparent root
      newMeshes[0].parent = pivot;
      newMeshes[0].id = tileKey.replaceAll("/", "_");
      _this3.tiles[tileKey].node = pivot;
      _this3.tiles[tileKey].status = "loaded";
      var tileExtent = _this3.tileGrid.getTileCoordExtent(tileCoords);
      var tileCenter = getCenter(tileExtent);
      var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
      var tileCenterScene = _this3.layerManager.sceneViewer.projection.forward(tileCenterWGS84);
      //let distance = 225.0;
      //pivot.position = new Vector3((x - 62360) * distance, 0, -(y - 48539) * distance);
      //pivot.scaling = new Vector3(1, 1, -1);
      pivot.position = new Vector3(tileCenterScene[0], 0, tileCenterScene[1]);
      pivot.rotation = new Vector3(0, Math.PI, 0);
      pivot.freezeWorldMatrix();
      _this3.tiles[tileKey].node = pivot;
      _this3._lastHeight = minHeight;
      _this3.tilesLoadedCount++;
      if (!_this3._initialHeightSet) {
        //console.debug("Repositioning camera height based on terrain height: " + maxHeight);
        //that.layerManager.sceneViewer.camera.position.y += maxHeight;
        var ray = new Ray(new Vector3(_this3.layerManager.sceneViewer.camera.position.x, -100.0, _this3.layerManager.sceneViewer.camera.position.z), new Vector3(0, 1, 0), 3000.0);
        var pickResult = _this3.layerManager.sceneViewer.scene.pickWithRay(ray);
        if (pickResult && pickResult.pickedMesh && pickResult.pickedMesh.id && pickResult.pickedMesh.id.indexOf("placeholder_") !== 0 && pickResult.pickedMesh.id.indexOf("skyBox") !== 0) {
          //console.debug("Setting height from: " + pickResult.pickedMesh.id);
          _this3._initialHeightSet = true;
          _this3.layerManager.sceneViewer.camera.position.y = pickResult.distance - 100.0;
          if (_this3.layerManager.sceneViewer.viewerState.positionGroundHeight) {
            _this3.layerManager.sceneViewer.camera.position.y += _this3.layerManager.sceneViewer.viewerState.positionGroundHeight;
          } else {
            _this3.layerManager.sceneViewer.camera.position.y += 40.0;
          }
        }
      }
      var tileMetadata = _this3.getTileMetadata(pivot);
      //console.debug("Tile metadata: ", tileMetadata);
      // Replace materials, instancing...
      pivot.metadata = {
        "tileCoords": tileCoords,
        "tileSize": [sizeWidth, sizeHeight],
        "tileInfo": tileMetadata
      };
      _this3.layerManager.sceneViewer.scene.blockfreeActiveMeshesAndRenderingGroups = true;
      _this3.layerManager.sceneViewer.processMesh(pivot, pivot); // TODO: Wrong conversion, use Node for "processMesh"
      _this3.layerManager.sceneViewer.scene.blockfreeActiveMeshesAndRenderingGroups = false;
      //pivot.occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
      pivot.freezeWorldMatrix();
      // TODO: Removed during TS migration, but this is needed to support ground texture replacement
      //this.groundTextureLayerProcessNode( tileCoords, pivot );
      // Check if the selected node is in the recently loaded node
      // TODO: Should use a generic notification + object id/naming system
      if (_this3.layerManager.sceneViewer.viewerState.sceneSelectedMeshId) {
        var criteria = {
          "_node_name": _this3.layerManager.sceneViewer.viewerState.sceneSelectedMeshId
        };
        //console.debug(criteria);
        var foundMesh = _this3.layerManager.sceneViewer.findNode(pivot, criteria);
        //console.debug(foundMesh);
        if (foundMesh) {
          _this3.layerManager.sceneViewer.selectMesh(foundMesh, true);
          _this3.layerManager.sceneViewer.viewerState.sceneSelectedMeshId = null; // Triggers watchers update
        }
      }
      /*
        this.sceneViewer.selectMesh(pickResult.pickedMesh);
        let meshName = pickResult.pickedMesh.id.split("/").pop().replaceAll('#', '_'); // .replaceAll("_", " ");
        this.$router.push('/3d/item/' + meshName + '/' + this.sceneViewer.positionString()).catch(()=>{});
        */
    },
    // onError
    function (_scene, _msg, ex) {
      // eslint-disable-next-line no-console
      //console.debug( "Tile model (.glb) loading error: ", ex );
      var request = ex.innerError.request;
      if (request != null && request.status === 404) {
        // 404 - tile is being generated, show OSM tile as replacement
        //console.debug(ex.request);
        marker.dispose(false, true);
        marker = _this3.loadQuadTile(tileCoords); // , Color3.Red()
        _this3.tiles[tileKey].node = marker; // "notfound";
        _this3.tiles[tileKey].status = "notfound";
        // Process response, DDD server includes JSON info about tile generation status
        try {
          var dataView = new DataView(request.response);
          // TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
          var decoder = new TextDecoder("utf-8");
          var decodedString = decoder.decode(dataView);
          var responseData = JSON.parse(decodedString);
          console.debug(responseData);
          _this3.layerManager.sceneViewer.viewerState.remoteQueueJobsStatus.push(responseData);
        } catch (e) {
          console.error("Could not add queued job to viewer state: " + e);
        }
      } else {
        // Error: colour marker red
        console.debug("Tile model (.glb) loading error (not 404): ", ex);
        marker.dispose(false, true);
        marker = _this3.loadQuadTile(tileCoords); // , Color3.Red()
        _this3.tiles[tileKey].node = marker; // "notfound";
        _this3.tiles[tileKey].status = "error";
        var color = Color3.Red();
        marker.material.emissiveColor = color;
      }
    });
    //model.parent = pivot;
  };
  _proto.loadQuadMarker = function loadQuadMarker(tileCoords, color) {
    if (color === void 0) {
      color = Color3.Gray();
    }
    var z = tileCoords[0];
    var x = tileCoords[1];
    var y = tileCoords[2];
    var tileKey = z + "/" + x + "/" + y;
    var tileExtent = this.tileGrid.getTileCoordExtent(tileCoords);
    var tileCenter = getCenter(tileExtent);
    var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
    var tileCenterScene = this.layerManager.sceneViewer.projection.forward(tileCenterWGS84);
    var tileExtentMinScene = this.layerManager.sceneViewer.projection.forward(transform(getBottomLeft(tileExtent), "EPSG:3857", "EPSG:4326"));
    var tileExtentMaxScene = this.layerManager.sceneViewer.projection.forward(transform(getTopRight(tileExtent), "EPSG:3857", "EPSG:4326"));
    var sizeWidth = Math.abs(tileExtentMaxScene[0] - tileExtentMinScene[0]);
    var sizeHeight = Math.abs(tileExtentMaxScene[1] - tileExtentMinScene[1]);
    var markerName = "Tile " + tileKey; // "placeholder_" + tileKey 
    var marker = MeshBuilder.CreatePlane("placeholder_" + tileKey, {
      width: sizeWidth,
      height: sizeHeight,
      sideOrientation: Mesh.DOUBLESIDE
    }, this.layerManager.sceneViewer.scene);
    marker.metadata = {
      "ddd:title": markerName
    };
    marker.position = new Vector3(tileCenterScene[0], this._lastHeight, tileCenterScene[1]);
    marker.rotation = new Vector3(Math.PI * 0.5, 0, 0);
    //Creation of a repeated textured material
    var materialPlane = new StandardMaterial("textureTile_" + tileKey, this.layerManager.sceneViewer.scene);
    //materialPlane.diffuseTexture = new Texture("https://a.tile.openstreetmap.org/" + z + "/" + x + "/" + y + ".png", this.scene);
    materialPlane.diffuseColor = color;
    materialPlane.specularColor = Color3.Black();
    /*
    materialPlane.diffuseTexture.uScale = 1.0 / 225.0;
    materialPlane.diffuseTexture.vScale = -1.0 / 225.0;
    materialPlane.diffuseTexture.uOffset = -0.5;
    materialPlane.diffuseTexture.vOffset = -0.5;
    */
    materialPlane.emissiveColor = color; // new Color3(1.0, 1.0, 1.);
    materialPlane.disableLighting = true;
    materialPlane.backFaceCulling = false;
    marker.material = materialPlane;
    return marker;
  };
  _proto.loadQuadTile = function loadQuadTile(tileCoords, color) {
    if (color === void 0) {
      color = Color3.White();
    }
    var z = tileCoords[0];
    var x = tileCoords[1];
    var y = tileCoords[2];
    var tileKey = z + "/" + x + "/" + y;
    var tileExtent = this.tileGrid.getTileCoordExtent(tileCoords);
    var tileCenter = getCenter(tileExtent);
    var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
    var tileCenterScene = this.layerManager.sceneViewer.projection.forward(tileCenterWGS84);
    var tileExtentMinScene = this.layerManager.sceneViewer.projection.forward(transform(getBottomLeft(tileExtent), "EPSG:3857", "EPSG:4326"));
    var tileExtentMaxScene = this.layerManager.sceneViewer.projection.forward(transform(getTopRight(tileExtent), "EPSG:3857", "EPSG:4326"));
    var sizeWidth = Math.abs(tileExtentMaxScene[0] - tileExtentMinScene[0]);
    var sizeHeight = Math.abs(tileExtentMaxScene[1] - tileExtentMinScene[1]);
    //console.debug(sizeWidth, sizeHeight);
    var markerName = "Tile " + tileKey; // "placeholder_" + tileKey 
    var marker = MeshBuilder.CreatePlane("placeholder_" + tileKey, {
      width: sizeWidth,
      height: sizeHeight,
      sideOrientation: Mesh.DOUBLESIDE
    }, this.layerManager.sceneViewer.scene);
    marker.metadata = {
      "ddd:title": markerName
    };
    marker.position = new Vector3(tileCenterScene[0], this._lastHeight, tileCenterScene[1]);
    marker.rotation = new Vector3(Math.PI * 0.5, 0, 0);
    //Creation of a repeated textured material
    var materialPlane = new StandardMaterial("textureTile_" + tileKey, this.layerManager.sceneViewer.scene);
    materialPlane.diffuseTexture = new Texture("https://a.tile.openstreetmap.org/" + z + "/" + x + "/" + y + ".png", this.layerManager.sceneViewer.scene);
    //if (!color) color = Color3.Black; //new Color3(0, 0, 0);
    materialPlane.specularColor = Color3.Black();
    /*
    materialPlane.diffuseTexture.uScale = 1.0 / 225.0;
    materialPlane.diffuseTexture.vScale = -1.0 / 225.0;
    materialPlane.diffuseTexture.uOffset = -0.5;
    materialPlane.diffuseTexture.vOffset = -0.5;
    */
    materialPlane.emissiveColor = color; // new Color3(1.0, 1.0, 1.);
    materialPlane.disableLighting = true;
    materialPlane.backFaceCulling = false;
    marker.material = materialPlane;
    return marker;
  };
  _proto.groundTextureLayerProcessNode = function groundTextureLayerProcessNode(tile, node) {
    var tileCoords = tile.coordsTileGrid;
    var materialGround = null;
    if (this.groundTextureLayerUrl) {
      var tileExtent = this.tileGrid.getTileCoordExtent(tileCoords);
      var tileCenter = getCenter(tileExtent);
      var tileCenterWGS84 = transform(tileCenter, "EPSG:3857", "EPSG:4326");
      var tileCenterScene = this.layerManager.sceneViewer.projection.forward(tileCenterWGS84);
      var tileExtentMinScene = this.layerManager.sceneViewer.projection.forward(transform(getBottomLeft(tileExtent), "EPSG:3857", "EPSG:4326"));
      var tileExtentMaxScene = this.layerManager.sceneViewer.projection.forward(transform(getTopRight(tileExtent), "EPSG:3857", "EPSG:4326"));
      var sizeWidth = Math.abs(tileExtentMaxScene[0] - tileExtentMinScene[0]);
      var sizeHeight = Math.abs(tileExtentMaxScene[1] - tileExtentMinScene[1]);
      // Create material
      //console.debug("Creating material for ground texture: " + url);
      var tileKey = tileCoords[0] + "/" + tileCoords[1] + "/" + tileCoords[2];
      var url = this.replaceTileCoordsUrl(tileCoords, this.groundTextureLayerUrl);
      materialGround = new StandardMaterial("materialGround_" + tileKey, this.layerManager.sceneViewer.scene);
      materialGround.roughness = 1.0;
      //materialGround.reflectionFresnelParameters = new FresnelParameters();
      materialGround.specularPower = 0.0;
      materialGround.diffuseColor = new Color3(0.2, 0.2, 0.2); // Color3.Black();   
      materialGround.ambientColor = new Color3(0.07, 0.07, 0.07); // Color3.Black();   
      materialGround.specularColor = new Color3(0.05, 0.05, 0.05); // Color3.Black();
      materialGround.emissiveColor = new Color3(0.05, 0.05, 0.05); // Color3.White();  // new Color3(1.0, 1.0, 1.);
      //materialGround.disableLighting = true;
      //materialGround.backFaceCulling = false;
      var materialGroundTexture = new Texture(url, this.layerManager.sceneViewer.scene);
      materialGround.diffuseTexture = materialGroundTexture;
      materialGround.ambientTexture = materialGroundTexture;
      //materialGround.specularTexture = materialGroundTexture;
      materialGround.emissiveTexture = materialGroundTexture;
      materialGround.linkEmissiveWithDiffuse = true;
      //materialGroundTexture.uScale = 4 * 1.0 / ( sizeWidth + 0 );  // Force small texture overlap to avoid texture repeating
      //materialGroundTexture.vScale = 4 * -1.0 / ( sizeHeight + 1 );  // Force small texture overlap to avoid texture repeating
      materialGroundTexture.uScale = 4 * 1.0 / sizeWidth * (127 / 128); // Force small texture overlap to avoid texture repeating
      materialGroundTexture.vScale = 4 * -1.0 / sizeHeight * (127 / 128); // Force small texture overlap to avoid texture repeating
      materialGroundTexture.uOffset = -0.5;
      materialGroundTexture.vOffset = -0.5;
      materialGroundTexture.wrapU = Texture.WRAP_ADDRESSMODE;
      materialGroundTexture.wrapV = Texture.WRAP_ADDRESSMODE;
      //materialGround.bumpTexture = materialGround.diffuseTexture;
      //materialGround.bumpTexture.uScale = 1.0 / sizeWidth;
      //materialGround.bumpTexture.vScale = 1.0 / sizeHeight;
      //materialGround.bumpTexture.uOffset = -0.5;
      //materialGround.bumpTexture.vOffset = -0.5;
    }
    // Assign
    var meshes = node.getChildMeshes();
    for (var _iterator3 = _createForOfIteratorHelperLoose(meshes), _step3; !(_step3 = _iterator3()).done;) {
      var mesh = _step3.value;
      if (mesh && mesh.metadata && mesh.metadata.gltf && mesh.metadata.gltf.extras) {
        var metadata = mesh.metadata.gltf.extras;
        if (metadata["ddd:path"].indexOf("/Areas") > 0 || metadata["ddd:path"].indexOf("/Ways") > 0) {
          if (materialGround !== null) {
            if (!("_ground_material_original" in mesh.metadata)) {
              mesh.metadata["_ground_material_original"] = mesh.material;
            }
            mesh.material = materialGround;
          } else {
            if (mesh.metadata["_ground_material_original"]) {
              mesh.material = mesh.metadata["_ground_material_original"];
            }
          }
        }
      }
    }
  };
  _proto.groundTextureLayerSetUrl = function groundTextureLayerSetUrl(url) {
    // "https://a.tile.openstreetmap.org/" + z + "/" + x + "/" + y + ".png"
    //console.debug("Layer setting ground texture layer: " + url);
    this.groundTextureLayerUrl = url;
    // Update existing tiles
    for (var key in this.tiles) {
      var tile = this.tiles[key];
      this.groundTextureLayerProcessNode(tile, tile.node);
    }
  };
  _proto.replaceTileCoordsUrl = function replaceTileCoordsUrl(tileCoords, url) {
    var result = url;
    result = result.replace("{z}", tileCoords[0].toString());
    result = result.replace("{x}", tileCoords[1].toString());
    result = result.replace("{y}", tileCoords[2].toString());
    return result;
  }
  /*
  createTextMaterial( text: string ): StandardMaterial {
        //Create dynamic texture
      const texture = new DynamicTexture( "dynamicTexture_text_" + text , { width:512, height:256 }, this.layerManager!.sceneViewer.scene );
      //var textureContext = texture.getContext();
      const font = "bold 44px monospace";
      texture.drawText( "Generating...\nPlease try again later (5+ min).", 75, 135, font, "green", "white", true, true );
        const material = new StandardMaterial( "Mat" + text, this.layerManager!.sceneViewer.scene );
      material.diffuseTexture = texture;
        return material;
  }
  */;
  _proto.disposeTile = function disposeTile(tile) {
    console.debug("Disposing tile: " + tile.key);
    if (tile.node) {
      //tile.node.setEnabled(false);
      tile.node.parent = null;
      tile.node.dispose();
      tile.node = null;
    }
    delete this.tiles[tile.key];
  };
  _proto.clearScene = function clearScene() {
    for (var tileKey in this.tiles) {
      var tile = this.tiles[tileKey];
      this.disposeTile(tile);
    }
  };
  return GeoTile3DLayer;
}(Base3DLayer);

var OverlayLayer = /*#__PURE__*/function (_Base3DLayer) {
  _inheritsLoose(OverlayLayer, _Base3DLayer);
  function OverlayLayer(key, sourceLayerKey) {
    var _this;
    _this = _Base3DLayer.call(this, key) || this;
    _this.items = [];
    _this.div = null;
    _this.template = null;
    _this.maxDistance = 0;
    _this.maxItems = 10;
    _this.occlude = false;
    _this.sourceLayerKey = sourceLayerKey;
    setTimeout(function () {
      _this.createOverlayDiv();
      _this.updateSceneFromFeatures();
    }, 0);
    return _this;
  }
  var _proto = OverlayLayer.prototype;
  _proto.createOverlayDiv = function createOverlayDiv() {
    // Add an overlay DIV over the 3D canvas
    // FIXME: This should be created by the scene viewer, and other divs
    var sceneViewer = this.layerManager.sceneViewer;
    this.div = document.createElement("div");
    sceneViewer.element.appendChild(this.div);
    this.div.className = "ddd-layer-overlay";
    this.div.style.zIndex = "5";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.position = "absolute";
    this.div.style.top = "0";
    this.div.style.left = "0";
    this.div.style.right = "0";
    this.div.style.bottom = "0";
    this.div.style.pointerEvents = "none";
  };
  _proto.resizeOverlayDiv = function resizeOverlayDiv() {
    var sceneViewer = this.layerManager.sceneViewer;
    this.div.style.width = sceneViewer.canvas.style.width;
    this.div.style.height = sceneViewer.canvas.style.height;
  };
  _proto.update = function update() {};
  _proto.setVisible = function setVisible(visible) {
    _Base3DLayer.prototype.setVisible.call(this, visible);
    if (this.div) this.div.style.display =  "block" ;
    /*
    for (let node of this.sceneNodes) {
        node.setEnabled(this.visible);
    }
    */
  }
  /**
   * Update scene generating a DIV for each feature in the source layer.
   */;
  _proto.updateSceneFromFeatures = function updateSceneFromFeatures() {
    var sourceLayer = this.layerManager.getLayer(this.sourceLayerKey);
    for (var _iterator = _createForOfIteratorHelperLoose(sourceLayer.featuresPoints), _step; !(_step = _iterator()).done;) {
      var feature = _step.value;
      var html = '<div style="background: white; display: inline-block;">Feature: ' + feature + '</div>';
      var featureDiv = document.createElement("div");
      this.div.appendChild(featureDiv);
      featureDiv.outerHTML = html;
    }
    /*
    for (let feature of this.featuresLines) {
        let marker = MeshBuilder.CreateLines("lineMarker", { points: feature.coordsScene }, sceneViewer.scene);
        marker.material = this.featureMaterial;
        marker.parent = this.rootNode;
        //this.sceneNodes.push(marker);
    }
    */
  };
  _proto.clearScene = function clearScene() {
    /*
    if (this.rootNode) {
        this.rootNode.parent = null;
        this.rootNode.dispose();
        this.rootNode = null;
    }
    */
  };
  return OverlayLayer;
}(Base3DLayer);

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 * Manages environment rendering, using time, date or other information
 * to set up the skybox and lighting.
 */
var DefaultEnvironment = /*#__PURE__*/function () {
  function DefaultEnvironment(dddViewer) {
    // Reference to DDDViewer
    this.dddViewer = dddViewer;
    // Babylon camera which we are controlling
    //this.camera = dddViewer.camera;
  }
  var _proto = DefaultEnvironment.prototype;
  _proto.update = function update(deltaTime) {};
  _proto.initialize = function initialize() {};
  _proto.dispose = function dispose() {};
  return DefaultEnvironment;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 * Rendering and pipeline configuration
 * (effects, shadows...)
 */
var DefaultRenderPipeline = /*#__PURE__*/function () {
  function DefaultRenderPipeline(dddViewer) {
    // Reference to DDDViewer
    this.dddViewer = dddViewer;
    this.viewerState = dddViewer.viewerState;
    this.scene = dddViewer.scene;
    // Babylon camera which we are controlling
    //this.camera = dddViewer.camera;
  }
  var _proto = DefaultRenderPipeline.prototype;
  _proto.update = function update(deltaTime) {};
  _proto.initialize = function initialize() {};
  _proto.dispose = function dispose() {};
  _proto.scenePostprocessingSetEnabled = function scenePostprocessingSetEnabled(value) {
    this.viewerState.scenePostprocessingEnabled = value;
    //localStorage.setItem('dddScenePostprocessingSetEnabled', value);
    //alert('Reload the viewer for changes to take effect.');
    this.updateRenderPipeline();
  };
  _proto.updateRenderPipeline = function updateRenderPipeline() {
    this.scene.postProcessesEnabled = this.viewerState.scenePostprocessingEnabled;
    if (!this.viewerState.scenePostprocessingEnabled) {
      return;
    }
  };
  _proto.initRenderPipeline = function initRenderPipeline() {
    // Postprocess
    // The default pipeline applies other settings, we'd better off using Bloom independently if possible
    // Also note this is tied to the camera, and thus if used, this should be updated when the camera changes
    var defaultPipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.dddViewer.camera]);
    defaultPipeline.fxaaEnabled = true;
    defaultPipeline.bloomEnabled = true;
    defaultPipeline.bloomWeight = 1.0; // 1.5 is exagerated but maybe usable for pics
    //defaultPipeline.cameraFov = this.camera.fov;
    defaultPipeline.imageProcessing.toneMappingEnabled = true;
    //var postProcessHighlights = new HighlightsPostProcess("highlights", 0.1, camera);
    //var postProcessTonemap = new TonemapPostProcess("tonemap", TonemappingOperator.Hable, 1.2, camera);
    // See: https://doc.babylonjs.com/divingDeeper/postProcesses/postProcessRenderPipeline
    /*
    var standardPipeline = new PostProcessRenderPipeline(this.engine, "standardPipeline");
    var effectBloom = new BloomEffect(this.scene, 4, 5.0, 2.0);
    //var effectDepthOfField = new DepthOfFieldEffect(this.scene);
    var postProcessChain = new PostProcessRenderEffect(this.engine, "postProcessChain", function() { return [effectBloom, effectDepthOfField] });
    standardPipeline.addEffect(effectBloom);
    this.scene.postProcessRenderPipelineManager.addPipeline(standardPipeline);
    */
    // Screen space reflections
    /*
    const ssr = new ScreenSpaceReflectionPostProcess(
        "ssr", // The name of the post-process
        this.scene, // The scene where to add the post-process
        1.0, // The ratio of the post-process
        this.camera // To camera to attach the post-process
    );
    ssr.reflectionSamples = 32; // Low quality.
    ssr.strength = 2; // Set default strength of reflections.
    ssr.reflectionSpecularFalloffExponent = 3; // Attenuate the reflections a little bit. (typically in interval [1, 3])
    */
    var lensRenderingPipeline = new LensRenderingPipeline("lens", {
      edge_blur: 0.25,
      chromatic_aberration: 1.0,
      distortion: 0.7,
      dof_focus_distance: 60,
      dof_aperture: 1.0,
      grain_amount: 0.0,
      dof_pentagon: false,
      dof_gain: 1.0,
      dof_threshold: 1.0,
      dof_darken: 0.25
    }, this.scene, 1.0, [this.dddViewer.camera]);
    //this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('lensEffects', camera);
    /*
    const ssao = new SSAO2RenderingPipeline('ssao', this.scene, {
      ssaoRatio: .5,
      blurRatio: 1
    }, [ this.camera ], true)
    */
    var curve = new ColorCurves();
    curve.globalHue = 0;
    curve.globalDensity = 80;
    curve.globalSaturation = 5;
    curve.highlightsHue = 0;
    curve.highlightsDensity = 80;
    curve.highlightsSaturation = 40;
    curve.shadowsHue = 0;
    curve.shadowsDensity = 80;
    curve.shadowsSaturation = 40;
    this.scene.imageProcessingConfiguration.colorCurvesEnabled = true;
    this.scene.imageProcessingConfiguration.colorCurves = curve;
    var postProcess = new ImageProcessingPostProcess("processing", 1.0, this.dddViewer.camera);
    // Fog
    //this.scene.fogMode = Scene.FOGMODE_EXP;
    //this.scene.fogDensity = 0.005;  // default is 0.1
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 350.0;
    this.scene.fogEnd = 700.0;
    this.scene.fogColor = new Color3(0.75, 0.75, 0.85);
    /*
    pixels = rp.cubeTexture.readPixels(0,0)
    // i take the first pixel of the reflection probe texture for fog color.
    // since pixels are stored as buffer array, first pixel are first 4 values of array [r,g,b,a....]
    scene.fogColor = new Color3(pixels[0]/255, pixels[1]/255, pixels[2]/255)
    */
  };
  return DefaultRenderPipeline;
}();

/*
* DDDViewer - DDD(3Ds) Viewer library for DDD-generated GIS 3D scenes
* Copyright 2021 Jose Juan Montes and Contributors
* MIT License (see LICENSE file)
*/
/**
 * DDD Viewer base skybox class.
 */
var Skybox = function Skybox(dddViewer) {
  // Reference to DDDViewer
  this.dddViewer = dddViewer;
  // Babylon camera which we are controlling
  //this.camera = dddViewer.camera;
};

/**
 * A skybox based on a cubemap.
 */
var CubemapSkybox = /*#__PURE__*/function (_Skybox) {
  _inheritsLoose(CubemapSkybox, _Skybox);
  function CubemapSkybox() {
    return _Skybox.apply(this, arguments) || this;
  }
  var _proto = CubemapSkybox.prototype;
  _proto.update = function update(deltaTime) {
    throw new Error("Method not implemented.");
  };
  return CubemapSkybox;
}(Skybox);

/**
 * A skybox based on a shader.
 */
var DynamicSkybox = /*#__PURE__*/function (_Skybox) {
  _inheritsLoose(DynamicSkybox, _Skybox);
  function DynamicSkybox() {
    return _Skybox.apply(this, arguments) || this;
  }
  var _proto = DynamicSkybox.prototype;
  _proto.update = function update(deltaTime) {
    throw new Error("Method not implemented.");
  };
  return DynamicSkybox;
}(Skybox);

export { AnimationProcess, Base3DLayer, BaseCameraController, CameraMovementAnimationProcess, CubemapSkybox, DDD3DLayer, DDDFormat, DDDObjectRef, DDDViewerConfig, DateTimeAnimationProcess, DefaultEnvironment, DefaultRenderPipeline, DynamicSkybox, FreeCameraController, GeoJSONFormat, GeoJson3DLayer, GeoTile3DLayer, GeolocationCameraController, LayerManager, OrbitCameraController, OverlayLayer, PanningCameraController, QueueLoader, ScenePosition, SceneViewer, SkyMaterialWrapper, Skybox, TerrainMaterialWrapper, TextAnimationProcess, TextMaterialWrapper, ViewerProcess, ViewerProcessManager, ViewerSequencer, ViewerState, WalkCameraController, WalkCollideCameraController };
//# sourceMappingURL=ddd-viewer.esm.js.map
