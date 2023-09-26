import { SceneViewer } from "SceneViewer";
/**
 * Manages environment rendering, using time, date or other information
 * to set up the skybox and lighting.
 */
declare class DefaultEnvironment {
    protected dddViewer: SceneViewer;
    constructor(dddViewer: SceneViewer);
    update(deltaTime: number): void;
    initialize(): void;
    dispose(): void;
}
export { DefaultEnvironment };
