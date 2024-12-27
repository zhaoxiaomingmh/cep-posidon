import { ResourceSynchronization, ResourceSynchronizationRef } from "@/pages/cutting/component/ResourceSynchronization";
import { INosFileUploadItem, INosUploadResult } from "@/store/iTypes/iTypes";
import { psConfig } from "@/utlis/util-env";
import axios from "axios";

class nasService {
    private static instance: nasService;
    private openAccessToken: string;
    private accessExpiredAt: number;
    private offSize: number = 4173195;
    private uploadUrl: string = "http://wanproxy-web.127.net";


    constructor() {
        this.accessExpiredAt = 0;
        this.openAccessToken = '';
    }

    public static getInstance(): nasService {
        nasService.instance = new nasService();
        if (!nasService.instance) {
        }
        return nasService.instance;
    }

    private async getToken() {
        const currentTimestamp = new Date().getTime();
        if (currentTimestamp >= this.accessExpiredAt) {
            //获取token
            const url = psConfig.nas.url + psConfig.nas.auth;
            console.log('nasAuth', url);
            const data = {
                "appId": psConfig.nas.appId,
                "appSecret": psConfig.nas.appSecret,
            }
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.status === 200) {
                const result = response.data;
                if (result.code === 200) {
                    this.openAccessToken = result.result;
                    this.accessExpiredAt = new Date().getTime() + 80000000;
                    return this.openAccessToken;
                }
            }
            return undefined;
        } else {
            return this.openAccessToken;
        }
    }
    private async getNosToken(filename: string) {
        const nasToken = await this.getToken();
        const url = psConfig.nas.url + psConfig.nas.nosAuth;
        const data = {
            fileName: filename,
            isPrivate: true
        }
        const response = await axios.post(url, data, {
            headers: {
                "X-Auth-Token": nasToken,
                "Content-Type": "application/json",
                "X-User-Email": psConfig.nas.email,
            }
        })
        console.log('getNosToken', response);
        if (response.status === 200) {
            const result = response.data;
            if (result.code === 200) {
                return result.result as INosFileUploadItem;
            }
        }
        return undefined;
    }
    public async uploadFile(filePath: string, filename: string, contentType: string, layerId?: number) {
        const fileInfo = window.cep.fs.stat(filePath);
        if (fileInfo?.err !== 0) {
            if (layerId) {
                ResourceSynchronizationRef.current?.updateWaitQueue('upload', "error", layerId, "文件不存在");
            } else {
                ResourceSynchronizationRef.current.updateFigmaDownline(undefined)
            }

            return;
        }
        const token = await this.getToken();
        console.log('token', token)
        if (!token) {
            if (layerId) ResourceSynchronizationRef.current?.updateWaitQueue('upload', "error", layerId, "获取token失败");
            else {
                ResourceSynchronizationRef.current.updateFigmaDownline(undefined)
            }
            return;
        }
        const nostoken = await this.getNosToken(filename);
        if (!nostoken) {
            if (layerId) ResourceSynchronizationRef.current?.updateWaitQueue('upload', "error", layerId, "文件上传失败");
            else {
                ResourceSynchronizationRef.current.updateFigmaDownline(undefined)
            }
        }
        console.log("nostoken", nostoken)
        try {
            await this.multiPartUpload(nostoken, filePath, contentType, filename)
            if (layerId) ResourceSynchronizationRef.current?.updateWaitQueue('upload', "success", layerId, nostoken.url);
            else {
                ResourceSynchronizationRef.current.updateFigmaDownline(nostoken.url)
            }
            return nostoken.url;
        } catch (e) {
            console.log("上传失败了")
            if (layerId) ResourceSynchronizationRef.current?.updateWaitQueue('upload', "error", layerId, "文件上传失败");
            else {
                ResourceSynchronizationRef.current.updateFigmaDownline(undefined)
            }
        }
    }

    public async multiPartUpload(nostoken: INosFileUploadItem, filePath: string, contentType: string, filename: string) {
        const fileData = window.cep.fs.readFile(filePath, "Base64")
        if (fileData.err !== 0) {
            throw Error("文件不存在");
        }
        const binary = window.cep.encoding.convertion.b64_to_binary(fileData.data)
        const binaryLength = binary.length;
        const byteArray = new Uint8Array(binaryLength);
        for (let i = 0; i < binaryLength; i++) {
            byteArray[i] = binary.charCodeAt(i);
        }
        const file = new File([byteArray], filename, { type: contentType });
        const chunkSize = 3 * 1024 * 1024; // 分片大小，这里设置为4MB
        const sliceFileArray = await this.createChunks(file, chunkSize);
        if (sliceFileArray.length == 1) {
            await this.sliceUpload(nostoken.token, nostoken.bucket, nostoken.key, true, file.size, file, 0);
        }
        else {
            let context = '';
            let sliceFileSize = chunkSize;
            for (let i = 0; i < sliceFileArray.length; i++) {
                const sliceFile = sliceFileArray[i];
                const isLastSlice = i === sliceFileArray.length - 1;
                // 算出当前文件分块的大小
                if (i === sliceFileArray.length - 1) {
                    sliceFileSize = file.size - i * chunkSize;
                }
                context = await this.sliceUpload(nostoken.token, nostoken.bucket, nostoken.key, isLastSlice ? true : false, sliceFileSize, sliceFile, i * chunkSize, context);
            }
        }
    }

    private createChunks(file: File, chunkSize: number) {
        // console.log(file.size);
        const result = [];
        for (let i = 0; i < file.size; i += chunkSize) {
            const chunk = file.slice(i, i + chunkSize);
            const chunkFile = this.convertBlobToFile(chunk, `${file.name}.part${i / chunkSize + 1}`, file.type);
            result.push(chunkFile);
        }
        return result;
    }

    private convertBlobToFile(blob: Blob, fileName: string, fileType: string): File {
        const options = {
            type: fileType || blob.type,
            lastModified: Date.now(),
        };
        return new File([blob], fileName, options);
    }

    private async sliceUpload(accessToken: string, bucketName: string, objectName: string, complete: boolean, contentLength: number, file: File, offset = 0, context = '') {
        const headers: {
            'X-Nos-Token': string,
        } = {
            'X-Nos-Token': accessToken,
        }
        const body = {
            'file': file
        }
        let query = `/${bucketName}/${objectName}?offset=${offset}&complete=${complete}&version=1.0`;

        if (offset != 0) {
            query = query + '&context=' + context;
        }
        const result = await axios.post('https://wanproxy-web.127.net' + query, file, { headers });

        if (result.status == 200) {
            return result.data.context
        } else {
            throw Error("上传还就那个失败")
        }
    }
}

const nas = nasService.getInstance();
export default nas;