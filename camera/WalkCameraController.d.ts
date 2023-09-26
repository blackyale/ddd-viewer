import { FreeCameraController } from "./FreeCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class WalkCameraController extends FreeCameraController {
    sceneCameraWalkHeight: number;
    update(deltaTime: number): void;
    activate(): void;
}
export { WalkCameraController };
