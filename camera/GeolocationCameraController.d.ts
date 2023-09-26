import { BaseCameraController } from "./BaseCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class GeolocationCameraController extends BaseCameraController {
    update(deltaTime: number): void;
    activate(): void;
}
export { GeolocationCameraController };
