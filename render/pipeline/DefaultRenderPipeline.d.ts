import { Scene } from "@babylonjs/core";
import { SceneViewer } from "SceneViewer";
import { ViewerState } from "ViewerState";
/**
 * Rendering and pipeline configuration
 * (effects, shadows...)
 */
declare class DefaultRenderPipeline {
    protected dddViewer: SceneViewer;
    protected scene: Scene;
    protected viewerState: ViewerState;
    constructor(dddViewer: SceneViewer);
    update(deltaTime: number): void;
    initialize(): void;
    dispose(): void;
    scenePostprocessingSetEnabled(value: boolean): void;
    updateRenderPipeline(): void;
    initRenderPipeline(): void;
}
export { DefaultRenderPipeline };
