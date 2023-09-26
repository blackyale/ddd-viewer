import { SceneViewer } from "../../SceneViewer";
import { AnimationProcess } from "./AnimationProcess";
declare class DateTimeAnimationProcess extends AnimationProcess {
    dtStart: Date;
    dtEnd: Date;
    constructor(sceneViewer: SceneViewer, dtStart: Date, dtEnd: Date, animTime: number);
    update(deltaTime: number): void;
}
export { DateTimeAnimationProcess };
