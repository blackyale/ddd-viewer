import { SceneViewer } from "../SceneViewer";
declare class QueueLoader {
    sceneViewer: SceneViewer;
    queue: any[];
    current: any[];
    concurrentTasks: number;
    constructor(sceneViewer: SceneViewer);
    update(): void;
    processNext(): void;
    enqueueLoadModel(url: string, onSuccess: any, onFailure: any): void;
    processTask(task: {
        [key: string]: any;
    }): void;
}
export { QueueLoader };
