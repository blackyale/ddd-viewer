import { ScenePosition } from "../../core/ScenePosition";
import { SceneViewer } from "../../SceneViewer";
import { AnimationProcess } from "./AnimationProcess";
declare class CameraMovementAnimationProcess extends AnimationProcess {
    moveStart: ScenePosition;
    moveEnd: ScenePosition;
    moveArcHeightFactor: number;
    _mslHeightStart: number | null;
    _mslHeightEnd: number | null;
    constructor(sceneViewer: SceneViewer, moveStart: ScenePosition, moveEnd: ScenePosition, animTime: number);
    calculateMslHeights(): void;
    update(deltaTime: number): void;
}
export { CameraMovementAnimationProcess };
