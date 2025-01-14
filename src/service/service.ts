import { ImageSearchImageRef } from '@/pages/search/component/ImageSearchImage';
import { TextSearchImageRef } from '@/pages/search/component/TextSearchImage';
import { AppRef } from '@/router/App';
import { IAccountResponse, IPosidonPageResponse, IPosidonResponse, ISearchItem, ISearchResult, ISvnPsdDirTreeNode, ISvnPsdGroup } from '@/store/iTypes/iTypes';
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
                'Content-Type': 'multipart/form-data',
                'x-api-key': psConfig.rsa(),
                'x-api-timestamp': psConfig.timeStamp(),
                'x-api-clientid': psConfig.clientId,
                'X-User-Email': AppRef?.current?.user?.email
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                return data.data.replace('..', '') as string;
            }
        }
        return undefined;
    }
    public async generateFormDataUrl(formData: FormData): Promise<string | undefined> {
        const result = await axios.post(psConfig.host + psConfig.generateURL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-api-key': psConfig.rsa(),
                'x-api-timestamp': psConfig.timeStamp(),
                'x-api-clientid': psConfig.clientId,
                'X-User-Email': AppRef?.current?.user?.email
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                return data.data.replace('..', '') as string;
            }
        }
        return undefined;
    }
    public async generateImageElement(path: string): Promise<string[] | undefined> {
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
        const result = await axios.post(psConfig.host + psConfig.generateElement, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-api-key': psConfig.rsa(),
                'x-api-timestamp': psConfig.timeStamp(),
                'x-api-clientid': psConfig.clientId,
                'X-User-Email': AppRef?.current?.user?.email
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                const imgEles = data.data as string[];
                return imgEles;
            }
        }
        return undefined;
    }
    public async generateFormDataImageElement(formData: FormData): Promise<string[] | undefined> {
        const result = await axios.post(psConfig.host + psConfig.generateElement, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-api-key': psConfig.rsa(),
                'x-api-timestamp': psConfig.timeStamp(),
                'x-api-clientid': psConfig.clientId,
                'X-User-Email': AppRef?.current?.user?.email
            }
        })
        if (result.status === 200) {
            const data = result.data as IPosidonResponse;
            if (data.code === 0) {
                const imgEles = data.data as string[];
                return imgEles;
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
        console.log('搜索参数', data);
        let result = await utilHttps.httpPost(psConfig.searchImage, data);
        if (result.status == 200) {
            if (result.data?.code === 0) {
                const imgData = result.data?.data as ISearchResult[];
                console.log("搜索结果", imgData);
                console.log('before notifySearchResult');
                this.notifySearchResult(type, imgData);
                console.log('after notifySearchResult');
                return;
            }
        }

        //回滚状态
        this.notifySearchResult(type, undefined);
        return;
    }
    public async getSVNAccountByProjectName(projectName: string): Promise<IAccountResponse> {
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
    public async getFigmaMsg(compKey: string, userId: number, projectId: number): Promise<number | undefined> {
        const figmaAccountResult: any = await utilHttps.httpGet(psConfig.getFigmaMsg, { compKey: compKey, userId: userId })
        if (figmaAccountResult.status != 200) {
            return undefined;
        }
        const figmaAccountResp = figmaAccountResult.data as IPosidonResponse;
        console.log('figmaAccount', figmaAccountResp)
        if (figmaAccountResp.code != 0) {
            return undefined;
        }
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
    public async getFigma2PsdResult(taskId: number): Promise<{ status: number, url?: string } | undefined> {
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
    public async querySvnPsdDir(projectId: number): Promise<ISvnPsdGroup[] | undefined> {
        const response: any = await utilHttps.httpGet(psConfig.querySvnPsdDir, { projectId: projectId })
        var queryResponse = response.data;
        if (queryResponse.code != 0) {
            return undefined;
        }
        return queryResponse.data as ISvnPsdGroup[];
    }
    public async getDirTree(did: number, page: number, size: number): Promise<ISvnPsdDirTreeNode | undefined> {
        const response: any = await utilHttps.httpGet(psConfig.getDirTree, { dirId: did, page: page, size: size })
        const posidonResponse: IPosidonPageResponse = response.data;
        if (posidonResponse.code != 0) {
            return undefined;
        }
        return posidonResponse.data;
    }
    public async getSVNAccountById(id: number): Promise<IAccountResponse | undefined> {
        const accountResponse: any = await utilHttps.httpGet(psConfig.getSVNAccountById, { dirId: id })
        if (accountResponse.status != 200) {
            return undefined;
        }
        let accountDataResp = accountResponse.data as IPosidonResponse;
        if (accountDataResp.code != 0) {
            return undefined;
        }
        const account = accountDataResp.data as IAccountResponse;
        return account;
    }
    public async downLoadPosidonFile(path: string, filename: string, callback?: Function) {
        const url = psConfig.host + psConfig.downloadfromserver + `?fileName=${filename}&path=${path}`;
        try {
            const savePath = psConfig.downloadDir() + "\\" + filename;
            const result = await axios.get(url, { responseType: 'arraybuffer' });
            console.log('result.status', result.status)
            console.log('savePath', savePath)
            if (result.status === 200) {
                // const binary = Buffer.from(result.data, 'binary').toString('base64');
                // window.cep.fs.writeFile(savePath, binary, "Base64");
                const buffer = Buffer.from(result.data, 'binary');
                return buffer;
            }
            return undefined;
        } catch (error) {
            console.error('Error downloading file:', error);
            return undefined;
        }
    }
    public async increaseDownloadCount(url: string, projectId: number, projectName: string, type: string) {
        const response: any = await utilHttps.httpPost(psConfig.increaseDownloadCount, { projectId: projectId, projectName: projectName, downloadUrl: url, type: type })
    }
}

const iService = psSerive.getInstance();
export default iService;