import { IAccountResponse, IGalleryItem, IProject } from "@/store/iTypes/iTypes";
import iService from "./service";
import axios, { AxiosError } from "axios";
import { psConfig } from "@/utlis/util-env";
import path from "path";
import { ImageSearchImageRef } from "@/pages/search/component/ImageSearchImage";
import { TextSearchImageRef } from "@/pages/search/component/TextSearchImage";
import { AppRef } from "@/router/App";
import { PsdLevel, PsdLevelRef } from "@/pages/level/PsdLevel";

class resourceService {
    private static instance: resourceService;
    constructor() {

    }
    public static getInstance(): resourceService {
        if (!resourceService.instance) {
            resourceService.instance = new resourceService();
        }
        return resourceService.instance;
    }
    public async downloadFile(img: IGalleryItem, type: string, projectInfo: IProject) {
        console.log('开始下载', img);
        if (img.format == 'comp') {
            this.downloadFromFigma(img, projectInfo, type);
            return;
        }
        const account = await iService.getSVNAccountByProjectName(img.projectName);
        if (!account) {
            //todo 回滚
            alert('账号信息不存在')
            this.notifyProgerss(type, -1);
            return;
        }
        try {
            if (account.accountType === 1) {
                const downloadDir = psConfig.downloadDir();
                const filePath = path.join(downloadDir, img.name.replace(/#/g, ""));
                //@ts-ignore
                const downResult = await downloadFromSmb(account, img.fileUrl, filePath, img.name, type, this.notifyProgerss, this.openFile);
            } else {
                this.downloadfromUrl(account, img, type, projectInfo);
            }
        } catch (e) {
            console.log('e', e);
            alert('下载失败');
            this.notifyProgerss(type, 0);
        }
    }
    public async downloadfromUrl(account: IAccountResponse, img: IGalleryItem, type: string, projectInfo: IProject) {
        console.log('开始下载', img);
        try {
            const headers = account.data ? { 'Authorization': `Basic ${account.data}` } : undefined;
            const lengthResponse = await axios.head(img.fileUrl, { headers });
            const length = parseInt(lengthResponse.headers['content-length'], 10);

            console.log('开始下载，下载内容大小为：', length);
            if (Number.isNaN(length) || length == 0) {
                alert("文件已失效");
                this.notifyProgerss(type, -1);
                return;
            }
            const response = await axios.get(img.fileUrl, {
                headers,
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / length) * 100;
                    let p = parseFloat(progress.toFixed(2));
                    this.notifyProgerss(type, p);
                },
            });
            iService.increaseDownloadCount(img.fileUrl, projectInfo.id, projectInfo.name, img.format == 'psd' ? '设计稿(psd)' : '资源图片(png,jpg)');
            const buffer = Buffer.from(response.data);
            const userDir = psConfig.userDir();
            const filePath = path.join(userDir, img.name.replace(/#/g, ""));
            //@ts-ignore
            writeFileFromBuff(filePath, buffer);
            this.openFile(filePath, img.format !== 'psd', type);
        } catch (err) {
            console.log('err', err);
            alert('下载失败,资源已失效');
            this.notifyProgerss(type, -1);
        }
    }
    private async downloadFromFigma(img: IGalleryItem, projectInfo: IProject, type: string) {
        const taskId = await iService.getFigmaMsg(img.fileUrl, AppRef.current.user.id, projectInfo.id);
        if (!taskId) {
            alert('figma组件下载任务创建失败');
            this.notifyProgerss(type, -1);
            return;
        }
        let status: number = 1;
        let url: string = '';
        while (status != 5 && status != 6 && status != 7) {
            const data = await iService.getFigma2PsdResult(taskId);
            status = data.status
            if (status == 5) {
                url = data.url;
                this.notifyProgerss(type, 100);
            } else if (status == 6) {
                this.notifyProgerss(type);
                return;
            } else if (status == 7) {
                this.notifyProgerss(type);
                return;
            } else if (status == 8 || status == 2) {
                this.notifyProgerss(type, 40);
            } else if (status == 3) {
                this.notifyProgerss(type, 60);
            } else if (status == 4) {
                this.notifyProgerss(type, 80);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        //开始下载
        const filename = img.name.replace(/#/g, "") + '.psd';
        const fullUrl = new URL(url, psConfig.host).toString();
        const account: IAccountResponse = {
            id: 0,
            baseUrl: fullUrl,
            accountType: 0,
            username: "",
            password: "",
            data: ""
        }
        const newImg: IGalleryItem = {
            id: 1,
            isFile: true,
            name: filename,
            fileUrl: fullUrl,
            format: 'psd',
        }
        this.downloadfromUrl(account, newImg, type, projectInfo);
    }
    public notifyProgerss(type: string, progress?: number) {
        if (type == 'imgRef') {
            ImageSearchImageRef.current?.setProgress(progress);
        } else if (type === 'textRef') {
            TextSearchImageRef.current?.setProgress(progress);
        } else {
            PsdLevelRef.current.setProgress(progress);
        }
    }
    public openFile(filePath: string, isImport: boolean, type: string) {
        const cs = new CSInterface();
        const req = {
            path: filePath,
            isImport: isImport,
        };
        // this.notifyProgerss(type, 100);
        cs.evalScript(`openImage(${JSON.stringify(req)})`, () => {
            window.cep.fs.deleteFile(filePath);
        });
    }
}

const reService = resourceService.getInstance();
export default reService;