import { Camera } from "@babylonjs/core";
import { SceneViewer } from "SceneViewer";
/**
 * A Camera and Input controller.
 *
 * This allows controlling the main camera, which is the main interface for viewing.
 * Controllers process input devices if they wish to respond to user input.
 *
 * Client code may use custom controllers or disable these controllers
 * and position the camera manually.
 */
declare abstract class BaseCameraController {
    protected dddViewer: SceneViewer;
    constructor(dddViewer: SceneViewer);
    protected getCamera(): Camera;
    abstract update(deltaTime: number): void;
    abstract activate(): void;
}
export { BaseCameraController };
