import { Material, Scene } from "@babylonjs/core";
declare class SkyMaterialWrapper {
    material: Material;
    constructor(scene: Scene);
    initMaterial(scene: Scene): Material;
}
export { SkyMaterialWrapper };
