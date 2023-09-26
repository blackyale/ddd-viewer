import { BaseCameraController } from "./BaseCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class PanningCameraController extends BaseCameraController {
    update(deltaTime: number): void;
    activate(): void;
}
export { PanningCameraController };
