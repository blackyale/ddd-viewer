import { SceneViewer } from "../SceneViewer";
import { ViewerProcess } from "./ViewerProcess";
declare class ViewerProcessManager {
    sceneViewer: SceneViewer;
    currentProcesses: ViewerProcess[];
    playing: boolean;
    currentTasks: never[];
    time: number;
    constructor(sceneViewer: SceneViewer);
    update(deltaTime: number): void;
    add(process: ViewerProcess): void;
    remove(process: ViewerProcess): void;
}
export { ViewerProcessManager };
