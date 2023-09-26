/**
 * This object represents ddd-viewer configuration, and is used to pass
 * options to the main object (DDDViewer) constructor.
 */
declare class DDDViewerConfig {
    defaultCoords: number[] | null;
    tileUrlBase: string;
    tileUrlSuffix: string;
    assetsUrlbase: string;
    materialsTextureSet: string | null;
    materialsSplatmap: number | null;
    timeScale: number;
    moveSpeeds: number[];
    sceneTileDrawDistanceDefault: number;
}
export { DDDViewerConfig };
