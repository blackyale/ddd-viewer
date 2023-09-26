import { Color3, Node, Vector3 } from "@babylonjs/core";
import TileGrid from "ol/tilegrid/TileGrid";
import { Base3DLayer } from "./Base3DLayer";
declare class Tile3D {
    key: string;
    status: string | null;
    node: Node | null;
    constructor(key: string);
}
declare class GeoTile3D extends Tile3D {
    coordsTileGrid: number[] | null;
    constructor(key: string);
}
declare class GeoTile3DLayer extends Base3DLayer {
    tiles: {
        [key: string]: GeoTile3D;
    };
    groundTextureLayerUrl: string | null;
    private _lastHeight;
    private _lastLoadDynamic;
    private _initialHeightSet;
    tilesLoadedCount: number;
    tileGrid: TileGrid;
    constructor();
    update(): void;
    testConeSphere(origin: Vector3, forward: Vector3, size: number, angle: number, sphereCenter: Vector3, sphereRadius: number): boolean;
    updateTilesDynamic(): void;
    disableTile(tileCoords: number[]): void;
    /**
    * Gets tile metadata.
    * It does this recursively searching for a "Metadata" named node, as the path exporting root metadata to the root node or scene itself hasn't been found to work.
    */
    getTileMetadata(node: Node): any;
    loadTile(tileCoords: number[]): void;
    loadQuadMarker(tileCoords: number[], color?: Color3): Node;
    loadQuadTile(tileCoords: number[], color?: Color3): Node;
    groundTextureLayerProcessNode(tile: GeoTile3D, node: Node): void;
    groundTextureLayerSetUrl(url: string): void;
    replaceTileCoordsUrl(tileCoords: number[], url: string): string;
    disposeTile(tile: Tile3D): void;
    clearScene(): void;
}
export { GeoTile3DLayer };
