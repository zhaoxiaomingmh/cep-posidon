import { PsdLevel, PsdLevelRef } from "@/pages/level/PsdLevel";
import iService from "./service";
import { IGalleryItem, IProject } from "@/store/iTypes/iTypes";
import reService from "./resourceService";

class levelService {
    constructor() { }
    private static instance: levelService;
    public static getInstance(): levelService {
        if (!levelService.instance) {
            levelService.instance = new levelService();
        }
        return levelService.instance;
    }

    public async getCategoryDirectory(projectId: number) {
        const data = await iService.querySvnPsdDir(projectId);
        PsdLevelRef.current.setLevelGroup(data);
    }
    public async downFile(img: IGalleryItem, projectInfo: IProject) {
        const account = await iService.getSVNAccountById(img.id as number);
        if (!account) {
            PsdLevelRef.current.setProgress(undefined);
        }

        reService.downloadfromUrl(account, img, "levlRef");
    }
}

const levService = levelService.getInstance();
export default levService;