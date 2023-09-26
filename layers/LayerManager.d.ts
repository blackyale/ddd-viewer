import { SceneViewer } from "../SceneViewer";
import { Base3DLayer } from "./Base3DLayer";
/**
 * Manages the list of layers known to DDD Viewer.
 */
declare class LayerManager {
    sceneViewer: SceneViewer;
    layers: {
        [key: string]: Base3DLayer;
    };
    constructor(sceneViewer: SceneViewer);
    update(deltaTime: number): void;
    /**
     * Adds a layer to DDD viewer.
     * @param key
     * @param layer
     */
    addLayer(layer: Base3DLayer): void;
    removeLayer(layer: Base3DLayer): void;
    /**
     * Retrieves a layer from DDD viewer managed layers.
     * Returns null if the layer does not exist.
     */
    getLayer(key: string): Base3DLayer | null;
}
export { LayerManager };
