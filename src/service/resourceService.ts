import { IAccountResponse, IGalleryItem, IProject } from "@/store/iTypes/iTypes";
import iService from "./service";
import axios from "axios";

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
        // if (img.format === 'comp') {
        //     const figmaAccountResult: any = await Https.httpGet(this.GetFigmaMessage, { compKey: img.fileUrl, userId: AppRef.current.loginUser?.user?.userID })
        //     console.log('figmaAccountResult', figmaAccountResult)
        //     if (figmaAccountResult.status != 200) {
        //         this.rollback(type, true, 100);
        //         ExDialogRef.current.showMessage("请求失败", `原因为:${figmaAccountResult.message}`, 'error')
        //         return;
        //     }
        //     const figmaAccountResp = figmaAccountResult.data as PosidonResponse;
        //     console.log('figmaAccount', figmaAccountResp)
        //     // if (figmaAccountResp.code != 0) {
        //     // this.rollback(type, true, 100);
        //     //     ExDialogRef.current.showMessage("请求失败", `原因为:${figmaAccountResult.message}`, 'error')
        //     //     return;
        //     // }
        //     const account = figmaAccountResp.data as AccountResponse;
        //     const downloadResp: any = await Https.httpGet(this.DownloadPsd4Plugin, { fileKey: account.username, userId: AppRef.current.loginUser?.user?.userID, seletedNode: account.password, projectId: projectInfo.id })
        //     if (downloadResp.status != 200) {
        //         this.rollback(type, true, 100);
        //         ExDialogRef.current.showMessage("请求失败", `原因为:${figmaAccountResult.message}`, 'error')
        //         return;
        //     }
        //     const downResult = downloadResp.data as PosidonResponse;
        //     if (downResult.code != 0) {
        //         this.rollback(type, true, 100);
        //         ExDialogRef.current.showMessage("请求失败", `原因为:${figmaAccountResult.message}`, 'error')
        //         return;
        //     }

        //     const taskId = downResult.data as number;
        //     let status: number = 1;
        //     let url: string = '';
        //     while (status != 5 && status != 6 && status != 7) {
        //         const getFigma2PsdResult: any = await Https.httpGet(this.GetFigma2PsdResult, { wId: taskId })
        //         if (getFigma2PsdResult.status != 200) {
        //             this.rollback(type, true, 100);
        //             ExDialogRef.current.showMessage("请求失败", `原因为:${getFigma2PsdResult.message}`, 'error')
        //             return;
        //         }
        //         const getFigma2PsdResp = getFigma2PsdResult.data as PosidonResponse;
        //         console.log('getFigma2PsdResp', getFigma2PsdResp)
        //         if (getFigma2PsdResp.code != 0) {
        //             this.rollback(type, true, 100);
        //             ExDialogRef.current.showMessage("请求失败", `原因为:${getFigma2PsdResp.message}`, 'error')
        //             return;
        //         }
        //         status = getFigma2PsdResp.data.status as number;
        //         if (status == 5) {
        //             url = getFigma2PsdResp.data.taskResult;
        //             this.rollback(type, false, 50);
        //         } else if (status == 6) {
        //             this.rollback(type, true, 100);
        //             ExDialogRef.current.showMessage("请求失败", `原因为:任务已取消`, 'error')
        //             return;
        //         } else if (status == 7) {
        //             ExDialogRef.current.showMessage("请求失败", `原因为:${getFigma2PsdResp.data.taskResult}`, 'error')
        //             this.rollback(type, true, 100);
        //             return;
        //         } else if (status == 8 || status == 2) {
        //             this.rollback(type, false, 20);
        //         } else if (status == 3) {
        //             this.rollback(type, false, 30);
        //         } else if (status == 4) {
        //             this.rollback(type, false, 40);
        //         }
        //         await new Promise(resolve => setTimeout(resolve, 5000));
        //     }
        //     const filename = img.name + '.psd';
        //     const fullUrl = new URL(url, this.baseUrl);
        //     const options = {
        //         method: 'GET',
        //     };
        //     await this.downloadSvnFile(filename, fullUrl, options, type, 'psd', projectInfo, true);
        //     return;
        // }
        console.log('img', img);
        const account = await iService.GetSVNAccountByProjectName(img.projectName);
        if (!account) {
            //todo 回滚
            return;
        }
        this.downloadfromSvn(account, img, projectInfo);
    }

    private async downloadfromSvn(account: IAccountResponse, img: IGalleryItem, projectInfo: IProject) {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${account.data}`
            }
        };
        const lengthRe = await axios.head(img.fileUrl, {
            headers: options.headers,
        });
        const length = parseInt(lengthRe.headers['content-length'], 10);
        let p = 0;
        const response = await axios.get(img.fileUrl, {
            headers: options.headers,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                let progress = (progressEvent.loaded / length) * 100;
                console.log('progress', progress);
            },
        });
        console.log('下载成');
        //下载成功和写入
        const binary = new Uint8Array(response.data);
        const binaryString = Array.from(binary).map(byte => String.fromCharCode(byte)).join('');
        const base64Data = window.btoa(binaryString);
        let filePath = "D:\\file\\Temp\\Resource\\素材\\" + img.name;
        window.cep.fs.writeFile(filePath, base64Data, "Base64");
        const cs = new CSInterface();
        filePath = "D:\\file\\Temp\\psd\\resource\\zpsd5558.psd"
        var req = {
            path : filePath,
            isImport: true
        }
        cs.evalScript(`openImage(${JSON.stringify(req)})`, function (data) {

            console.log('打开成', data)
        })
    }

}

const reService = resourceService.getInstance();
export default reService;