import { ImageSearchImageRef } from '@/pages/search/component/ImageSearchImage';
import { TextSearchImageRef } from '@/pages/search/component/TextSearchImage';
import { IAccountResponse, IPosidonResponse, ISearchItem, ISearchResult } from '@/store/iTypes/iTypes';
import { psConfig } from '@/utlis/util-env';
import utilHttps from '@/utlis/util-https';
import axios from 'axios';
class psSerive {
    private static instance: psSerive;
    constructor() {
        console.log("注册成功");
    }
    public static getInstance(): psSerive {
        if (!psSerive.instance) {
            psSerive.instance = new psSerive();
        }
        return psSerive.instance;
    }
    public async generateImageUrl(path: string): Promise<string | undefined> {
        const imageData = window.cep.fs.readFile(path, "Base64")
        const binary = window.cep.encoding.convertion.b64_to_binary(imageData.data)
        const binaryLength = binary.length;
        const binaryArray = new Uint8Array(binaryLength);
        for (let i = 0; i < binaryLength; i++) {
            binaryArray[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([binaryArray], { type: 'application/octet-stream' });
        const formData = new FormData();
        formData.append('file', blob, path.split('/').pop());
        const result = await axios.post(psConfig.host + psConfig.generateURL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                console.log("进来了");
                return data.data.replace('..', '') as string;
            }
        }
        return undefined;
    }
    public async searchImage(projectId: number, pa: string, searchs: ISearchItem[], formats: string[], type: number) {
        const projectNames = searchs.map(item => { return item.projectName });
        let data = {
            SeachParameter: pa,
            ProjectId: projectId,
            page: searchs[0].page,
            size: 10,
            projectNames: projectNames,
            SearchType: type,
            filterExt: formats
        }
        console.log(data);
        let result = await utilHttps.httpPost(psConfig.searchImage, data);
        if (result.status == 200) {
            if (result.data?.code === 0) {
                const imgData = result.data?.data as ISearchResult[];
                console.log(imgData, "搜索结果");
                this.notifySearchResult(type, imgData);
                return;
            }
        }

        //回滚状态
        this.notifySearchResult(type, undefined);
        return;
    }
    public async GetSVNAccountByProjectName(projectName: string): Promise<IAccountResponse> {
        const response: any = await utilHttps.httpGet(psConfig.getSvnAccountByProjectName, { projectName: projectName })
        if (response.status != 200) {
            // ExDialogRef.current.showMessage("请求失败", `原因为:${response1.message}`, 'error')
            return;
        }
        const result = response.data as IPosidonResponse;
        if (result.code != 0) {
            return
        }
        const data = result.data as IAccountResponse;
        return data;

    }
    public notifySearchResult(type: number, data: ISearchResult[]) {
        if (type === 0) {
            ImageSearchImageRef.current?.setSearchResult(data);
        } else {
            TextSearchImageRef.current?.setSearchResult(data);
        }
    }
    public async GetFigmaMsg(compKey: string, userId: number, projectId: number): Promise<number | undefined> {
        const figmaAccountResult: any = await utilHttps.httpGet(psConfig.getFigmaMsg, { compKey: compKey, userId: userId })
        if (figmaAccountResult.status != 200) {
            return undefined;
        }
        const figmaAccountResp = figmaAccountResult.data as IPosidonResponse;
        console.log('figmaAccount', figmaAccountResp)
        const account = figmaAccountResp.data as IAccountResponse;
        const downloadResp: any = await utilHttps.httpGet(psConfig.downloadPsd4Plugin, { fileKey: account.username, userId: userId, seletedNode: account.password, projectId: projectId })
        if (downloadResp.status != 200) {
            return undefined;
        }
        const downResult = downloadResp.data as IPosidonResponse;
        if (downResult.code != 0) {
            return undefined;
        }
        const taskId = downResult.data as number;
        return taskId;
    }
    public async GetFigma2PsdResult(taskId: number): Promise<{ status: number, url?: string } | undefined> {
        const getFigma2PsdResult: any = await utilHttps.httpGet(psConfig.getFigma2PsdResult, { wId: taskId })
        if (getFigma2PsdResult.status != 200) {
            return undefined;
        }
        const getFigma2PsdResp = getFigma2PsdResult.data as IPosidonResponse;
        if (getFigma2PsdResp.code != 0) {
            return undefined;
        }
        const status = getFigma2PsdResp.data.status as number;
        return {
            status: status,
            url: getFigma2PsdResp.data.taskResult
        };
    }
}

const iService = psSerive.getInstance();
export default iService;