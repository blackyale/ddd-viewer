import { DDDViewerConfig } from "./DDDViewerConfig";
/**
 * Holds DDDViewer global state like viewer position, date/time, configuration...
 * Some internal values are also stored here for convenience (FPS, drawcalls, mobile detection...).
 * This object must be JSON-serializable.
 */
declare class ViewerState {
    mapVisible: boolean;
    sceneVisible: boolean;
    dddConfig: DDDViewerConfig;
    isMobile: boolean;
    positionTileZoomLevel: number;
    positionWGS84: number[];
    positionScene: number[];
    positionGroundHeight: number;
    positionTerrainElevation: number;
    positionHeading: number;
    positionTilt: number;
    positionName: string | null;
    positionDate: Date;
    positionDateSeconds: number;
    geolocationEnabled: boolean;
    timeScale: number;
    sceneSelectedMesh: null;
    sceneSelectedMeshId: string | null;
    sceneFPS: number;
    sceneDrawCalls: number;
    sceneTriangles: number;
    sceneShadowsEnabled: boolean;
    sceneTextsEnabled: boolean;
    scenePostprocessingEnabled: boolean;
    scenePickingEnabled: boolean;
    sceneViewModeShow: boolean;
    sceneSelectedShowNormals: boolean;
    sceneTileDrawDistance: number;
    sceneMoveSpeed: number;
    sceneEnvironmentProbe: number;
    sceneSkybox: string;
    sceneGroundTextureOverrideUrl: string | null;
    sceneTitleText: string | null;
    /**
     * 3dsmaps DDD tile server supports on-demand generation. When a tile that's not available is enqueued, it responds
     * with information about the job status. This array contains enqueued tiles status.
     */
    remoteQueueJobsStatus: any[];
    constructor(dddConfig: DDDViewerConfig, initialCoords?: number[] | null);
}
export { ViewerState };
