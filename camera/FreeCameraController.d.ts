import { BaseCameraController } from "./BaseCameraController";
/**
 * DDD Viewer base layer class.
 */
declare class FreeCameraController extends BaseCameraController {
    fixMinHeight: boolean;
    update(deltaTime: number): void;
    activate(): void;
}
export { FreeCameraController };
