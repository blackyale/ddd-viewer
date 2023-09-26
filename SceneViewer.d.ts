import "@babylonjs/loaders/glTF";
import { BoundingInfo, Camera, CascadedShadowGenerator, Color3, DirectionalLight, Engine, LensFlareSystem, Material, Mesh, NodeMaterial, PickingInfo, ReflectionProbe, Scene, SceneInstrumentation, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Coordinate } from "ol/coordinate";
import TileGrid from "ol/tilegrid/TileGrid";
import * as proj4 from "proj4";
import { LayerManager } from "./layers/LayerManager";
import { QueueLoader } from "./loading/QueueLoader";
import { ViewerProcessManager } from "./process/ViewerProcessManager";
import { ScenePosition } from "./core/ScenePosition";
import { ViewerSequencer } from "./process/sequencer/ViewerSequencer";
import { ViewerState } from "./ViewerState";
import { DDDViewerConfig } from "./DDDViewerConfig";
import { DDDObjectRef } from "./core/DDDObjectRef";
import { BaseCameraController } from "./camera/BaseCameraController";
/**
 * This is the main DDDViewer library entry point. Represents a DDDViewer instance.
 */
declare class SceneViewer {
    viewerState: ViewerState;
    engine: Engine;
    scene: Scene;
    camera: Camera;
    sceneInstru: SceneInstrumentation | null;
    canvas: HTMLCanvasElement;
    element: HTMLElement;
    cameraController: BaseCameraController | null;
    sequencer: ViewerSequencer;
    processes: ViewerProcessManager;
    highlightMeshes: Mesh[];
    materialHighlight: StandardMaterial | null;
    useSplatMap: boolean;
    layerManager: LayerManager;
    queueLoader: QueueLoader;
    originShiftWGS84: number[];
    projection: proj4.Converter;
    tileGrid: TileGrid;
    catalog: {
        [key: string]: Mesh;
    };
    catalog_materials: {
        [key: string]: Material;
    };
    instanceRoots: {
        [key: string]: Mesh;
    };
    depends: Mesh[];
    ambientColorNight: Color3;
    ambientColorDay: Color3;
    colorLightLamp: Color3;
    colorLightRed: Color3;
    colorLightGreen: Color3;
    colorLightOrange: Color3;
    lastDateUpdate: number;
    selectedMesh: Mesh | null;
    sceneSelectedMeshId: string | null;
    selectedObject: DDDObjectRef | null;
    materialWater: Material | null;
    materialOcean: NodeMaterial | null;
    materialText: Material | null;
    materialFlare: Material | null;
    baseEnvironmentIntensity: number;
    envReflectionProbe: ReflectionProbe | null;
    light: DirectionalLight | null;
    shadowGenerator: CascadedShadowGenerator | null;
    lensFlareSystem: LensFlareSystem | null;
    textureDetailSurfaceImp: Texture | null;
    skybox: Mesh | null;
    splatmapAtlasTexture: Texture | null;
    splatmapAtlasNormalsTexture: Texture | null;
    _previousLampPatOn: boolean | null;
    _geolocationWatchId: string | null;
    _decimator: number;
    /**
     * Constructs a new DDDViewer instance, and mounts it on the given HTMLCanvasElement.
     * @param canvas
     * @param viewerState
     */
    constructor(canvas: HTMLCanvasElement, dddConfig?: DDDViewerConfig | null);
    private initialize;
    private initializeMaterials;
    loadSkybox(baseUrl: string): void;
    showFullScreen(): void;
    loadCatalog(filename: string, loadMaterials: boolean): void;
    processDepends(): void;
    loadCatalogFromMesh(mesh: Mesh, loadMaterials: boolean): void;
    addMaterialToCatalog(key: string, material: Material, metadata: any, force?: boolean): void;
    addMeshToCatalog(key: string, mesh: Mesh): void;
    processMeshDummy(_root: Mesh, mesh: Mesh): Mesh | null;
    processMesh(root: Mesh, mesh: Mesh): Mesh | null;
    instanceAsThinInstance(key: string, root: Mesh, node: Mesh): void;
    instanceAsThinInstanceBuffers(key: string, root: Mesh, node: Mesh): void;
    instanceAsNode(key: string, _root: Mesh, mesh: Mesh): void;
    /**
     * Dispose this DDDViewer instance.
     * @todo Ensure all events, processes and objects are disconnected and disposed.
     */
    dispose(): void;
    /**
     * DDDViewer main update callback, this is called every frame by the engine.
     * Children object update method is called recursively from here (sequencer, processes, layers).
     * @param deltaTime
     */
    update(deltaTime: number): void;
    updateSceneDatetime(deltaTime: number): void;
    sceneToWGS84(coords: number[]): number[];
    wgs84ToScene(coords: number[]): number[];
    positionWGS84(): number[];
    parsePositionString(posString: string): ScenePosition;
    positionString(heightPrecision?: number): string | null;
    /**
     * Calculates ground elevation (in MSL) for a given point in the scene. Receives a Vector3,
     * and uses its X and Z coordinates.
     *
     * FIXME: This is hitting objects other than the ground, check if masks can be used or otherwise correctly resolve ground elevation.
     *        Also the 3000m limit is arbitrary. Also fails when no ground objects are available.
     *        Also fails sometimes hitting invisible objects below ground (seems some non visible objects are being hit)
     */
    elevationMSLFromSceneCoords(coords: Vector3): [number | null, PickingInfo | null];
    /**
     * This method is called internally to update altitude and position name.
     */
    private updateElevation;
    /**
     * Untested
     * (from: https://gist.github.com/spite/051604efd1d971ab4b6ef1bc1ae2636e)
     */
    registerProjectionForCoords(coords: Coordinate): void;
    deselectMesh(): void;
    deselectObject(): void;
    /**
     * Finds a mesh by id. Currently this also searches combined indexed meshes by path).
     * @param meshId
     * @param node
     */
    /**
     * Finds an object by id.
     * TODO: Move to DDDObjectRef and just leave here a convenience method search the whole scene.
     * @param meshId
     * @param node
     */
    findObjectById(objectId: string, objectRef?: DDDObjectRef | null): DDDObjectRef | null;
    selectObject(objectRef: DDDObjectRef, highlight?: boolean): void;
    showNormals(mesh: Mesh, size?: number, color?: Color3 | null): import("@babylonjs/core").LinesMesh | null;
    selectMesh(mesh: Mesh, highlight: boolean): void;
    getBoundsRecursively(node: Mesh, bounds?: BoundingInfo): BoundingInfo;
    findNode(node: Mesh, criteria: {
        [key: string]: any;
    }): Mesh | null;
    initCamera(): Camera;
    setCameraController(cc: BaseCameraController): void;
    setPosition(positionHeading: number, positionTilt: number, positionGroundHeight: number): void;
    updateRenderTargets(): void;
    groundTextureLayerSetUrl(url: string): void;
    setMoveSpeed(speed: number): void;
    lightSetupFromDatePos(): void;
    sceneShadowsSetEnabled(value: boolean): void;
    sceneTextsSetEnabled(value: boolean): void;
    /**
    */
    loadTextures(): void;
    /**
     * Changes the materials set used to draw the scene.
     * @todo this would ideally belong to layers that explicity support DDD export features (splatmaps / texture catalogs)
     * @param textureSet
     */
    sceneTextureSet(textureSet: string | null, splatmap: number): void;
}
export { SceneViewer };
