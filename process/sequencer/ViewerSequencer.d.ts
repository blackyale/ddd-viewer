import { SceneViewer } from "../../SceneViewer";
declare type Step = (string | number)[];
declare type Sequence = Step[];
declare class ViewerSequencer {
    sceneViewer: SceneViewer;
    seq: Sequence | null;
    time: number;
    index: number;
    playing: boolean;
    waitTime: number;
    constructor(sceneViewer: SceneViewer);
    update(deltaTime: number): void;
    runStep(step: Step): void;
    play(seq: Sequence): void;
}
export { ViewerSequencer };
