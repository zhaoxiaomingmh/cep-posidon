import { PsdLevel, PsdLevelRef } from "@/pages/level/PsdLevel";
import iService from "./service";
import { IGalleryItem, IProject } from "@/store/iTypes/iTypes";
import reService from "./resourceService";
import { psConfig } from "@/utlis/util-env";
import path from "path";

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
            alert('账号信息已失效')
            PsdLevelRef.current.setProgress(-1);
            return;
        }
        const type = "levlRef";
        if (account.accountType === 1) {
            const downloadDir = psConfig.downloadDir();
            const filePath = path.join(downloadDir, img.name.replace(/#/g, ""));
            const url = img.fileUrl.replace("file:", "").trim();
            //@ts-ignore
            const downResult = await downloadFromSmb(account, url, filePath, img.name, type, reService.notifyProgerss, reService.openFile, true);
            iService.increaseDownloadCount(img.fileUrl, projectInfo.id, projectInfo.name, img.format == 'psd' ? '设计稿(psd)' : '资源图片(png,jpg)')
        } else {
            reService.downloadfromUrl(account, img, type, projectInfo);
        }
    }
}

const levService = levelService.getInstance();
export default levService;