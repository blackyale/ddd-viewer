import { Mesh, Node } from "@babylonjs/core";
/**
 * A reference to a "logical" object in the scene.
 *
 * Like real scene mesh objects, DDDObjectRefs have metadata, a path, parent and children.
 *
 * This allows to reference sets of triangles in larger objects (eg. if several logical objects were
 * batched into a larger mesh at design time or elsewhere).
 *
 * TODO: Reference the containing layer so each layer can resolve its objects.
 */
declare class DDDObjectRef {
    mesh: Node;
    submeshIdx: number;
    faceIndexStart: number;
    faceIndexEnd: number;
    constructor(mesh: Node, submeshIdx?: number);
    static nodeMetadata(node: Node): any;
    static fromMeshFace(mesh: Mesh, faceIndex: number): DDDObjectRef;
    getMetadata(): any;
    static urlId(value: string): string;
    getId(): string;
    getUrlId(): string;
    getLabel(): string;
    getChildren(): DDDObjectRef[];
    getParent(): DDDObjectRef | null;
}
export { DDDObjectRef };
