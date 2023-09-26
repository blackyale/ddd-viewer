import { Node } from "@babylonjs/core";
import { Base3DLayer } from "./Base3DLayer";
declare class DDD3DLayer extends Base3DLayer {
    node: Node | null;
    constructor(key: string);
    update(): void;
    loadData(data: string): void;
    clearScene(): void;
    setVisible(visible: boolean): void;
}
export { DDD3DLayer };
