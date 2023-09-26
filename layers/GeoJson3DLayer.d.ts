import { Vector3 } from "@babylonjs/core";
import { SceneViewer } from "../SceneViewer";
import { Base3DLayer } from "./Base3DLayer";
declare class GeoJsonItem {
    properties: any;
}
declare class GeoJsonPoint extends GeoJsonItem {
    coordsWgs84: Vector3;
    coordsScene: Vector3;
    constructor(coordsWgs84: Vector3);
    /**
     * Currently receives a viewer for coordinate transformations
     */
    transformCoords(viewer: SceneViewer): void;
}
declare class GeoJsonLine extends GeoJsonItem {
    coordsWgs84: Vector3[];
    coordsScene: Vector3[];
    constructor(coordsWgs84: Vector3[]);
    /**
     * Currently receives a viewer for coordinate transformations
     */
    transformCoords(viewer: SceneViewer): void;
}
declare class GeoJson3DLayer extends Base3DLayer {
    featuresPoints: GeoJsonPoint[];
    featuresLines: GeoJsonLine[];
    altitudeOffset: number;
    colorHex: string;
    private rootNode;
    private featureMaterial;
    constructor(key: string, geojsonData: any);
    update(): void;
    setColor(colorHex: string): void;
    setVisible(visible: boolean): void;
    setAltitudeOffset(altitudeOffset: number): void;
    /**
     * Processes GeoJSON data (already loaded as Javascript objects) and loads the different features.
     */
    loadFromGeoJson(data: any): void;
    loadFeature(feature: any): void;
    projectFeatures(): void;
    /**
     * TODO: This should be a more generic "markers" and "lines" vector visualization facility.
     */
    updateSceneFromFeatures(): void;
    clearScene(): void;
}
export { GeoJson3DLayer };
