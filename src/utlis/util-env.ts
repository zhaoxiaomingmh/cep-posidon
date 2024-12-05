import { IEnv } from "@/store/iTypes/iTypes";
import config from './config.json'
import JSEncrypt from "jsencrypt";
import path from "path";
import psHandler from "@/service/handler";
const env = IEnv.test;
export const psConfig = {
    version: "1.1.3",
    env: env,
    publicKey: config[env].posidon.publicKey,
    clientId: config[env].posidon.clientId,
    clientSecret: config[env].posidon.clientSecret,
    host: config[env].posidon.host,
    timeStamp: function (): number {
        return Math.floor(new Date().getTime() / 1000);
    },
    rsa: function () {
        const jsencrypt = new JSEncrypt();
        jsencrypt.setPublicKey(this.publicKey);
        let data = (this.clientId + '-' + this.clientSecret + '-' + this.timeStamp());
        return jsencrypt.encrypt(data);
    },
    pluginDir: function () {
        const cs = new CSInterface();
        const extensionPath = cs.getSystemPath(SystemPath.EXTENSION);
        return extensionPath;
    },
    userDir: function () {
        const cs = new CSInterface();
        const userHomeDir = cs.getSystemPath(SystemPath.USER_DATA)
        const parts = ['Adobe', 'CEP', 'Temp_Dir', psHandler.extId];
        let filePath = userHomeDir;
        for (const part of parts) {
            const subFiles = window.cep.fs.readdir(filePath);
            if (subFiles.err == 0) {
                filePath = path.join(filePath, part);
                if (!subFiles.data.includes(part)) {
                    window.cep.fs.makedir(filePath);
                } else {
                    const result = window.cep.fs.stat(filePath);
                    if (0 == result.err) {
                        if (result.data.isFile) {
                            window.cep.fs.makedir(filePath);
                        }
                    }
                }

            }
        }
        return filePath;
    },
    downloadDir: function () {
        const cs = new CSInterface();
        const userHomeDir = cs.getSystemPath(SystemPath.USER_DATA)
        const parts = ['Adobe', 'CEP', 'Temp_Dir', psHandler.extId, 'download'];
        let filePath = userHomeDir;
        for (const part of parts) {
            const subFiles = window.cep.fs.readdir(filePath);
            if (subFiles.err == 0) {
                filePath = path.join(filePath, part);
                if (!subFiles.data.includes(part)) {
                    window.cep.fs.makedir(filePath);
                } else {
                    const result = window.cep.fs.stat(filePath);
                    if (0 == result.err) {
                        if (result.data.isFile) {
                            window.cep.fs.makedir(filePath);
                        }
                    }
                }

            }
        }
        return filePath;
    },
    versinFile: config.path.desc,
    distFile: config.path.dist,
    hubservice: config.path.hubservice,
    getProject: config.path["get-project"],
    getStorehouse: config.path["get-storehouse"],
    generateURL: config.path["generate-url"],
    generateElement: config.path["generate-element"],
    searchImage: config.path["seach-image"],
    getSvnAccountByProjectName: config.path["get-svn-account-by-projectname"],
    getFigmaMsg: config.path["get-figma-msg"],
    downloadPsd4Plugin: config.path["download-psd4-plugin"],
    getFigma2PsdResult: config.path["get-figma-psd-result"],
    querySvnPsdDir: config.path["query-svn-psd-dir"],
    getDirTree: config.path["get-dir-tree"],
    getSVNAccountById: config.path["get-svn-account-by-id"],
    downloadfromserver: config.path["download-from-server"]
}

