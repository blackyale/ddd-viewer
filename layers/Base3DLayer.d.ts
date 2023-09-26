import { SceneViewer } from "SceneViewer";
import { LayerManager } from "./LayerManager";
/**
 * DDD Viewer base layer class.
 */
declare abstract class Base3DLayer {
    key: string;
    visible: boolean;
    protected dddViewer: SceneViewer | null;
    protected layerManager: LayerManager | null;
    constructor(key: string);
    abstract update(deltaTime: number): void;
    abstract clearScene(): void;
    setVisible(visible: boolean): void;
    setViewer(dddViewer: SceneViewer | null): void;
}
export { Base3DLayer };
