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
        if (img.format === 'comp') {
            this.downloadFromFigma(img, projectInfo, type);
            return;
        }
        const account = await iService.getSVNAccountByProjectName(img.projectName);
        if (!account) {
            //todo 回滚
            alert('账号信息不存在')
            this.notifyProgerss(type, 0);
            return;
        }
        try {
            if (account.accountType === 1) {
                this.downloadFromSmb(account, img, projectInfo, type);
            } else {
                this.downloadfromUrl(account, img, type);
            }
        } catch (e) {
            console.log('e', e);
            alert('下载失败');
            this.notifyProgerss(type, 0);
        }
    }

    public async downloadfromUrl(account: IAccountResponse, img: IGalleryItem, type: string) {
        const options = {
            method: 'GET',
            headers: account.data ? {
                'Authorization': `Basic ${account.data}`
            } : undefined,
        };
        const length = await axios.head(img.fileUrl, {
            headers: options.headers,
        }).then(resp => {
            return parseInt(resp.headers['content-length'], 10);;
        }).catch(err => {
            console.log('err', err);
            this.notifyProgerss(type, 0);
            throw err;
        });
        console.log('开始下载，下载内容大小为：', length);
        await axios.get(img.fileUrl, {
            headers: options.headers,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                let progress = (progressEvent.loaded / length) * 100;
                this.notifyProgerss(type, parseFloat(progress.toFixed(2)));
            },
        }).then((response) => {
            const binary = new Uint8Array(response.data);
            const binaryString = Array.from(binary).map(byte => String.fromCharCode(byte)).join('');
            const base64Data = window.btoa(binaryString);
            const userDir = psConfig.userDir();
            let filePath = path.join(userDir, img.name.replace(/#/g, ""));
            window.cep.fs.writeFile(filePath, base64Data, "Base64");
            const cs = new CSInterface();
            const req = {
                path: filePath,
                isImport: img.format === 'psd' ? true : false,
            }
            cs.evalScript(`openImage(${JSON.stringify(req)})`, (data) => {
                window.cep.fs.deleteFile(filePath);
                this.notifyProgerss(type, 0);
            })
        }).catch(err => {
            console.log('err', err);
            this.notifyProgerss(type, 0);
        });
    }
    private async downloadFromSmb(account: IAccountResponse, img: IGalleryItem, projectInfo: IProject, type: string) {
        const address = account.baseUrl;
        const username = account.username;
        const password = account.password;
        // downSmbFileCMD(address)

    }
    private async downloadFromFigma(img: IGalleryItem, projectInfo: IProject, type: string) {
        const taskId = await iService.getFigmaMsg(img.fileUrl, AppRef.current.user.id, projectInfo.id);
        if (!taskId) {
            alert('figma组件下载任务创建失败');
            this.notifyProgerss(type);
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
        this.downloadfromUrl(account, newImg, type);
    }

    private notifyProgerss(type: string, progress?: number) {
        if (type == 'imgRef') {
            ImageSearchImageRef.current?.setProgress(progress);
        } else if(type === 'textRef') {
            TextSearchImageRef.current?.setProgress(progress);
        } else {
            PsdLevelRef.current.setProgress(progress);
        }
    }
}

const reService = resourceService.getInstance();
export default reService;