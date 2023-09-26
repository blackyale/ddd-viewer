import { PBRCustomMaterial } from "@babylonjs/materials";
import { AbstractMesh, Effect, Scene, Texture, Vector2 } from "@babylonjs/core";
import { SceneViewer } from "SceneViewer";
/**
 * From: https://forum.babylonjs.com/t/pbr-texture-splatting-up-to-64-textures/1994/28
 *  and: https://www.babylonjs-playground.com/#LIVRIY#58
 */
declare class TerrainMaterialWrapper {
    sceneViewer: SceneViewer;
    material: PBRCustomMaterial;
    dedupDouble: boolean;
    options: any;
    tileIndexes: never[];
    shaderinjectpoint1: string;
    shaderinjectpoint2: string;
    shaderinjectpoint3: string;
    shaderinjectpoint4: string;
    numTilesHorizontal: number;
    numTilesVertical: number;
    totalTiles: number;
    tileScale: Vector2;
    numSplatTilesHorizontal: number;
    numSplatTilesVertical: number;
    totalSplatTiles: number;
    splatScale: Vector2;
    splatMap: Texture | null;
    atlasBumpTexture: Texture | null;
    static terrainMaterialShared: PBRCustomMaterial | null;
    static terrainEffectShared: Effect | null;
    static matIdx: number;
    initialized: boolean;
    constructor(sceneViewer: SceneViewer, splatmapTexture: Texture, atlasTexture: Texture, atlasNormalTexture: Texture, options?: any);
    initSplatMaterial(scene: Scene, splatMap: Texture, atlas: Texture, atlasnormals: Texture, options?: any): PBRCustomMaterial;
    bind(mesh: AbstractMesh): void;
}
export { TerrainMaterialWrapper };
