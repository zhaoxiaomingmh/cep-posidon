import { IEnv } from "@/store/iTypes/iTypes";
import config from './config.json'
import JSEncrypt from "jsencrypt";
const env = IEnv.test;
export const psConfig = {
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
        let data = (this.clientId + '-' + this.clientSecret + '-' + this.timeStamp);
        return jsencrypt.encrypt(data);
    },
    hubservice: config[env].posidon.path.hubservice,
    getProject: config[env].posidon.path["get-project"],
}

