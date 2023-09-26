import { BaseCameraController } from "./BaseCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class OrbitCameraController extends BaseCameraController {
    update(deltaTime: number): void;
    activate(): void;
}
export { OrbitCameraController };
