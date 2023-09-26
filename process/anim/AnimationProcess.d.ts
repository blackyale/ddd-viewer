import { EasingFunction } from "@babylonjs/core";
import { SceneViewer } from "../../SceneViewer";
import { ViewerProcess } from "../ViewerProcess";
declare abstract class AnimationProcess extends ViewerProcess {
    sceneViewer: SceneViewer;
    animTime: number;
    time: number;
    interpFactor: number;
    easing: EasingFunction;
    /**
     *
     * @param sceneViewer
     * @param animTime if set to null, the Process must manually mark itself as finished
     */
    constructor(sceneViewer: SceneViewer, animTime?: number | null);
    update(deltaTime: number): void;
}
export { AnimationProcess };
