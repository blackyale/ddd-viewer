import { Base3DLayer } from "./Base3DLayer";
declare class OverlayLayer extends Base3DLayer {
    sourceLayerKey: string;
    items: HTMLElement[];
    div: HTMLElement | null;
    template: string | null;
    maxDistance: number;
    maxItems: number;
    occlude: boolean;
    constructor(key: string, sourceLayerKey: string);
    createOverlayDiv(): void;
    resizeOverlayDiv(): void;
    update(): void;
    setVisible(visible: boolean): void;
    /**
     * Update scene generating a DIV for each feature in the source layer.
     */
    updateSceneFromFeatures(): void;
    clearScene(): void;
}
export { OverlayLayer };
