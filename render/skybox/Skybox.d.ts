import { SceneViewer } from "SceneViewer";
/**
 * DDD Viewer base skybox class.
 */
declare abstract class Skybox {
    protected dddViewer: SceneViewer;
    constructor(dddViewer: SceneViewer);
    abstract update(deltaTime: number): void;
}
export { Skybox };
