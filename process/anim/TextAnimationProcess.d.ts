import { SceneViewer } from "../../SceneViewer";
import { AnimationProcess } from "./AnimationProcess";
/**
 *
 */
declare class TextAnimationProcess extends AnimationProcess {
    text: string;
    /**
     *
     * @param text Text to animate.
     * @param animTime Animation duration in seconds.
     */
    constructor(sceneViewer: SceneViewer, text: string, animTime: number);
    update(deltaTime: number): void;
}
export { TextAnimationProcess };
