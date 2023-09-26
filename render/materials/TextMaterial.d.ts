import { PBRCustomMaterial } from "@babylonjs/materials";
import { BaseTexture, Scene } from "@babylonjs/core";
import { SceneViewer } from "SceneViewer";
/**
 */
declare class TextMaterialWrapper {
    sceneViewer: SceneViewer;
    material: PBRCustomMaterial;
    options: any;
    constructor(sceneViewer: SceneViewer, atlasTexture: BaseTexture, atlasNormalTexture: BaseTexture | null, options?: any);
    initMaterial(scene: Scene, atlas: BaseTexture, atlasnormals: BaseTexture | null): PBRCustomMaterial;
    update(): void;
}
export { TextMaterialWrapper };
