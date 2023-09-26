import { Skybox } from "./Skybox";
/**
 * A skybox based on a shader.
 */
declare class DynamicSkybox extends Skybox {
    update(deltaTime: number): void;
}
export { DynamicSkybox };
