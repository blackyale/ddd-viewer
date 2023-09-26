import { Skybox } from "./Skybox";
/**
 * A skybox based on a cubemap.
 */
declare class CubemapSkybox extends Skybox {
    update(deltaTime: number): void;
}
export { CubemapSkybox };
