import useAppStore from "@/store/modules/appStore";
import { Button } from "@adobe/react-spectrum";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import './update.scss'
import { IDownloader } from "@/store/iTypes/iTypes";
import iService from "@/service/service";
import { Loading } from "@/hooks/loading/Loading";
import { psConfig } from "@/utlis/util-env";
import { unZipFromBuffer as unzipFromBuffer } from "@/utlis/util-zip";
import psHandler from "@/service/handler";
import path from "path";

interface UpdateRefType { };
interface UpdateProps {
    version: string
    desc: string
}
export const UpdateRef = React.createRef<UpdateRefType>();
export const Update = forwardRef<UpdateRefType, UpdateProps>((props, ref) => {
    const [download, setDownload] = useState<boolean>(false)
    const [downloader, setDownloader] = useState<IDownloader>({ id: 0, progress: 0, complete: true });
    useImperativeHandle(ref, () => {
        return {
            updateDownloader: updateDownloader
        }
    })
    const updateDownloader = (progress: number | undefined) => {
        if (downloader.complete) return;
        if (!progress) {
            setDownloader({
                ...downloader,
                complete: true,
                progress: 0
            })
        } else {
            setDownloader({
                ...downloader,
                complete: progress == 100 ? true : false,
                progress: progress
            })
            if (progress == 100) {
                alert("更新完成，重启插件后生效")
            }
        }
    }
    const startUpdate = async () => {
        const buffer = await iService.downLoadPosidonFile(psConfig.codeFile, "dist.zip")
        replaceLocalFile(buffer)
    }
    const replaceLocalFile = async (buffer: Buffer) => {
        const pluginDir = psConfig.pluginDir();
        const result = await unzipFromBuffer(buffer, pluginDir, () => { psHandler.restart() });
        if(result) {
            alert("解压失败")
            setDownload(false)
        }
    }
    return (
        <div className="update-content">
            <div className="update-icon">
                {
                    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9270" width="30%" height="30%">
                        <path d="M938.666667 622.933333c0-5.688889-2.844444-11.377778-5.688889-14.222222l-125.155556-164.977778c-17.066667-22.755556-42.666667-34.133333-71.111111-34.133333H287.288889c-28.444444 0-54.044444 14.222222-71.111111 34.133333l-125.155556 164.977778c-2.844444 2.844444-5.688889 8.533333-5.688889 11.377778v315.733333C85.333333 984.177778 125.155556 1024 173.511111 1024h676.977778c48.355556 0 88.177778-39.822222 88.177778-88.177778V625.777778v-2.844445zM913.066667 938.666667c0 34.133333-28.444444 62.577778-62.577778 62.577777H173.511111c-34.133333 0-62.577778-28.444444-62.577778-62.577777V625.777778h213.333334v79.644444c0 22.755556 19.911111 42.666667 42.666666 42.666667h290.133334c22.755556 0 42.666667-17.066667 42.666666-42.666667V625.777778h213.333334v312.888889z m-136.533334-497.777778l122.311111 162.133333h-201.955555c-5.688889 0-11.377778 2.844444-14.222222 5.688889s-5.688889 8.533333-5.688889 14.222222v82.488889c0 8.533333-8.533333 17.066667-17.066667 17.066667H366.933333c-5.688889 0-8.533333-2.844444-11.377777-5.688889-2.844444-2.844444-5.688889-8.533333-5.688889-11.377778v-82.488889c0-11.377778-8.533333-19.911111-22.755556-22.755555h-199.111111L236.088889 455.111111c11.377778-14.222222 31.288889-25.6 51.2-25.6H739.555556c11.377778 0 22.755556 2.844444 31.288888 8.533333l5.688889 2.844445z m-267.377777-79.644445c2.844444 0 8.533333 0 11.377777-2.844444s2.844444-5.688889 2.844445-8.533333V173.511111c0-8.533333-5.688889-14.222222-14.222222-14.222222s-14.222222 5.688889-14.222223 14.222222v173.511111c0 2.844444 2.844444 8.533333 2.844445 8.533334 5.688889 5.688889 8.533333 5.688889 11.377778 5.688888z m142.222222 0l125.155555-122.311111c2.844444-2.844444 2.844444-5.688889 2.844445-8.533333 0-2.844444-2.844444-8.533333-2.844445-8.533333-5.688889-5.688889-14.222222-5.688889-19.911111 0L628.622222 341.333333c-2.844444 2.844444-2.844444 5.688889-2.844444 8.533334s2.844444 8.533333 2.844444 8.533333c5.688889 8.533333 17.066667 8.533333 22.755556 2.844444z m-278.755556-2.844444c5.688889 5.688889 14.222222 5.688889 19.911111 0 2.844444-2.844444 2.844444-5.688889 2.844445-8.533333s-2.844444-8.533333-2.844445-8.533334L264.533333 213.333333c-5.688889-5.688889-14.222222-5.688889-19.911111 0-2.844444 2.844444-2.844444 5.688889-2.844444 8.533334 0 2.844444 2.844444 8.533333 2.844444 8.533333l128 128z m443.733334 603.022222h-130.844445c-5.688889 0-8.533333-5.688889-8.533333-11.377778s2.844444-11.377778 8.533333-11.377777h130.844445c8.533333 0 17.066667 0 22.755555-8.533334 5.688889-5.688889 8.533333-14.222222 8.533333-22.755555v-45.511111c0-2.844444 0-5.688889 2.844445-8.533334s5.688889-2.844444 8.533333-2.844444c5.688889 0 11.377778 5.688889 11.377778 11.377778v45.511111c0 14.222222-2.844444 28.444444-14.222222 39.822222-8.533333 11.377778-22.755556 17.066667-39.822222 14.222222z m39.822222-145.066666c-2.844444 0-5.688889 0-8.533334-2.844445-2.844444-2.844444-5.688889-8.533333-2.844444-14.222222s5.688889-8.533333 11.377778-8.533333 8.533333 2.844444 11.377778 8.533333c2.844444 5.688889 0 11.377778-2.844445 14.222222-2.844444 0-5.688889 2.844444-8.533333 2.844445zM492.088889 113.777778c0-5.688889-2.844444-14.222222-11.377778-14.222222l-45.511111-25.6c2.844444-11.377778 5.688889-42.666667 8.533333-54.044445 2.844444-5.688889 0-14.222222-5.688889-17.066667h-2.844444c-5.688889-2.844444-14.222222 0-17.066667 5.688889l-36.977777 34.133334-42.666667-22.755556c-5.688889-2.844444-14.222222-5.688889-19.911111 0-5.688889 5.688889-5.688889 14.222222 0 19.911111 2.844444 8.533333 14.222222 34.133333 19.911111 42.666667-8.533333 8.533333-31.288889 28.444444-39.822222 36.977778-5.688889 2.844444-8.533333 11.377778-5.688889 17.066666v2.844445c2.844444 5.688889 11.377778 8.533333 17.066666 8.533333l54.044445-5.688889 22.755555 48.355556c2.844444 2.844444 8.533333 8.533333 14.222223 8.533333h2.844444c5.688889 0 11.377778-5.688889 11.377778-11.377778l11.377778-54.044444 54.044444-5.688889c5.688889 0 11.377778-5.688889 11.377778-14.222222z m-85.333333 8.533333c0 2.844444-5.688889 22.755556-8.533334 39.822222l-17.066666-36.977777c-2.844444-5.688889-5.688889-8.533333-11.377778-8.533334h-2.844445l-42.666666 2.844445 31.288889-28.444445c2.844444-2.844444 5.688889-8.533333 2.844444-14.222222L341.333333 45.511111l34.133334 17.066667c5.688889 2.844444 8.533333 2.844444 14.222222-2.844445l31.288889-28.444444c-2.844444 19.911111-5.688889 42.666667-5.688889 42.666667 0 5.688889 2.844444 11.377778 5.688889 11.377777l34.133333 19.911111-39.822222 8.533334c-5.688889 0-8.533333 2.844444-8.533333 8.533333z m332.8 5.688889l-2.844445-2.844444c-2.844444-2.844444-8.533333-2.844444-14.222222-2.844445l-31.288889 5.688889-14.222222-25.6c-2.844444-5.688889-5.688889-8.533333-11.377778-8.533333h-2.844444c-5.688889 2.844444-8.533333 8.533333-8.533334 11.377777 0 5.688889-2.844444 22.755556-5.688889 31.288889l-34.133333 5.688889c-5.688889 0-8.533333 2.844444-11.377778 8.533334v2.844444c0 5.688889 2.844444 8.533333 8.533334 11.377778l31.288888 17.066666-2.844444 34.133334c0 5.688889 0 8.533333 5.688889 11.377778l2.844444 2.844444c5.688889 0 8.533333 0 11.377778-2.844444l22.755556-25.6 31.288889 14.222222c2.844444 2.844444 8.533333 2.844444 11.377777 0l2.844445-2.844445c2.844444-5.688889 2.844444-8.533333 0-14.222222l-14.222222-28.444444 22.755555-28.444445c2.844444-2.844444 5.688889-8.533333 2.844445-14.222222z m-85.333334 39.822222l-19.911111-11.377778 22.755556-2.844444c2.844444 0 8.533333-2.844444 8.533333-8.533333l2.844444-19.911111 11.377778 17.066666c2.844444 2.844444 5.688889 5.688889 11.377778 5.688889L711.111111 142.222222l-14.222222 17.066667c-2.844444 2.844444-2.844444 8.533333 0 11.377778l8.533333 17.066666-19.911111-8.533333c-2.844444-2.844444-8.533333 0-11.377778 2.844444l-14.222222 17.066667 2.844445-19.911111c0-5.688889-2.844444-8.533333-8.533334-11.377778z m-156.444444 432.355556c2.844444-5.688889 2.844444-8.533333 0-14.222222-2.844444-8.533333-8.533333-22.755556-11.377778-31.288889l22.755556-19.911111c2.844444-2.844444 5.688889-8.533333 5.688888-11.377778l-2.844444-2.844445c-2.844444-2.844444-8.533333-5.688889-14.222222-5.688889l-31.288889 2.844445c-2.844444-8.533333-11.377778-25.6-11.377778-31.288889s-5.688889-8.533333-8.533333-8.533333h-2.844445c-5.688889 2.844444-8.533333 5.688889-8.533333 11.377777l-8.533333 34.133334-34.133334 2.844444c-5.688889 0-8.533333 2.844444-11.377777 5.688889v5.688889c0 5.688889 2.844444 8.533333 5.688888 11.377778l28.444445 17.066666-8.533333 31.288889c0 5.688889 0 8.533333 2.844444 11.377778l2.844444 2.844445c5.688889 0 8.533333 0 11.377778-2.844445l25.6-22.755555 31.288889 17.066666c2.844444 2.844444 8.533333 2.844444 14.222222 0l2.844445-2.844444z m-28.444445-51.2c-2.844444 2.844444-2.844444 8.533333-2.844444 11.377778l8.533333 19.911111-19.911111-11.377778c-2.844444-2.844444-8.533333-2.844444-11.377778 0l-17.066666 14.222222 5.688889-19.911111c0-2.844444 0-8.533333-2.844445-11.377778l-19.911111-11.377778 19.911111-2.844444c5.688889 0 8.533333-2.844444 8.533333-8.533333l5.688889-22.755556 8.533334 19.911111c2.844444 2.844444 5.688889 5.688889 8.533333 5.688889h19.911111l-11.377778 17.066667z" fill="#666666" p-id="9271"></path>
                    </svg>
                }
            </div>
            <div className="update-text">
                <div className="update-text-title">
                    <span>
                        发现新版本
                    </span>
                    <span>
                        v{props.version}
                    </span>
                </div>
                <div className="update-text-desc">
                    <pre>
                        {props.desc}
                    </pre>
                </div>
            </div>
            <div className="update-btn">
                {
                    download ?
                        <Loading /> :
                        <Button variant={"accent"} onPress={() => {
                            setDownload(true)
                            startUpdate();
                        }}>
                            下载新版本
                        </Button>
                }
            </div>
        </div>
    );
});