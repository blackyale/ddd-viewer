import { SceneViewer } from "SceneViewer";
/**
 * Manages reading of files in DDD format. DDD files are glTF files
 * with custom metadata. This class processes nodes and metadata.
 */
declare class DDDFormat {
    protected dddViewer: SceneViewer;
    constructor(dddViewer: SceneViewer);
}
export { DDDFormat };
