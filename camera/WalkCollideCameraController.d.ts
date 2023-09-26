import { Vector3 } from "@babylonjs/core";
import { WalkCameraController } from "./WalkCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class WalkCollideCameraController extends WalkCameraController {
    velocity: Vector3;
    gravity: number;
    falling: boolean;
    fallStartDistance: number;
    update(deltaTime: number): void;
}
export { WalkCollideCameraController };
