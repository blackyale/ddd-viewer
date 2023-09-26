import { SceneViewer } from "../SceneViewer";
/**
 * A process that can be running in a DDDViewer instance.
 * Processes are updated every frame before drawing the scene.
 */
declare abstract class ViewerProcess {
    sceneViewer: SceneViewer;
    finished: boolean;
    time: number;
    constructor(sceneViewer: SceneViewer);
    update(deltaTime: number): void;
}
export { ViewerProcess };
