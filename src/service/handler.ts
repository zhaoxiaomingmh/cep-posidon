import { ResourceSynchronizationRef } from "@/pages/cutting/component/ResourceSynchronization";
import { AppRef } from "@/router/App";
import { IDocument, IEventData, IEventResult, IGeneratorAction, IGeneratorParams, ILayer, IMessage, ISetGerParams } from "@/store/iTypes/iTypes";
import { psConfig } from "@/utlis/util-env";
import { darkTheme, defaultTheme, lightTheme } from '@adobe/react-spectrum';
import { Theme } from "@react-types/provider";
import path from "path";
//用来与Photoshop交互
class handler {
    private static instance: handler;
    public csInterface: CSInterface;
    public extId: string;
    public appId: string;

    private selectEventId: string;
    private closeEventId: string;
    private openEventId: string;
    private deleteEventId: string;
    private pasteEventId: string;
    private addEventId: string;
    private cutEventId: string;
    private makeEventId: string;

    constructor() {
        console.log("中央处理器注册成功");
        this.csInterface = new CSInterface();
        this.evalFiles();
        this.appId = this.csInterface.getApplicationID();
        this.extId = this.csInterface.getExtensionID();
        this.pasteEventId = "1885434740";
        this.addEventId = "1097098272";
        this.cutEventId = "1668641824";
        this.makeEventId = "1298866208";
        this.init();
    }
    public static getInstance(): handler {
        handler.instance = new handler();
        if (!handler.instance) {
        }
        return handler.instance;
    }
    public getCurrentTheme(): { theme: Theme, currentInterface: string } {
        const bgColor = this.csInterface.getHostEnvironment().appSkinInfo.appBarBackgroundColor;
        const red = Math.round(bgColor.color.red)
        let theme: Theme = defaultTheme
        let colorScheme = 'dark'
        let currentInterface = 'dark'
        if (red < 60) {
            theme = darkTheme
            currentInterface = 'darkest'
            colorScheme = 'dark'
            console.log('darkest');
        } else if (60 <= red && red < 127) {
            theme = darkTheme
            currentInterface = 'dark'
            colorScheme = 'dark'
            console.log('dark');
        } else if (127 <= red && red < 200) {
            theme = defaultTheme
            currentInterface = 'default'
            colorScheme = 'light'
            console.log('default');
        } else {
            theme = lightTheme
            currentInterface = 'light'
            colorScheme = 'light'
            console.log('light');
        }

        return { theme, currentInterface }
    }
    private init() {
        this.registerEvent('select',);
        this.registerEvent('close');
        this.registerEvent('open');
        this.registerEvent('delete');
        this.registerEvent('paste');
        this.registerEvent('add');
        this.registerEvent('cut');
        this.registerEvent('make');
        this.getCurrentTheme();

        this.csInterface.addEventListener('com.posidon.generator.plugin', (data: IEventResult) => {
            this.handleEventFromGenerator(data.data)
        }, undefined);

        this.csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', () => {
            this.getCurrentTheme();
            // console.log('颜色更换')
        }, undefined);

        this.csInterface.addEventListener('my_custom_event_type', (result) => {
            console.log('my_custom_event_type', result);
        }, undefined);

        this.csInterface.addEventListener('com.adobe.PhotoshopJSONCallback' + this.extId, (result: IEventResult) => {
            console.log(result);
            let data = result.data.replace(/ver1,/, '');
            let obj = JSON.parse(data);
            if (parseInt(obj.eventID) === parseInt(this.selectEventId)) {
                console.log('Select事件', obj);
                const eventData = obj.eventData as IEventData;
                this.refreshActiveLayer();
                if (eventData.documentID) {
                } else if (eventData.layerID?.length > 0) {
                }
            }
            if (parseInt(obj.eventID) === parseInt(this.closeEventId)) {
                //{extensionId: "", data: "ver1,{ "eventID": 1131180832, "eventData": {"documentID":243,"forceNotify":true}}", appId: "PHXS", type: "com.adobe.PhotoshopJSONCallbackposidon-ps", scope: "APPLICATION"}
                this.refreshActiveLayer();
            }
            if (parseInt(obj.eventID) === parseInt(this.openEventId)) {
                this.refreshActiveLayer();
            }
            if (parseInt(obj.eventID) === parseInt(this.deleteEventId)) {
                console.log('Delete事件', obj);
                this.refreshActiveLayer();
            }
            if (parseInt(obj.eventID) === parseInt(this.pasteEventId)) {
                console.log('Paste事件', obj);
                this.refreshActiveLayer();
            }
            if (parseInt(obj.eventID) === parseInt(this.addEventId)) {
                console.log('Add事件', obj);
                this.refreshActiveLayer();
            }
            if (parseInt(obj.eventID) === parseInt(this.cutEventId)) {
                console.log('Cut事件', obj);
            }
            if (parseInt(obj.eventID) === parseInt(this.makeEventId)) {
                console.log('Make事件', obj);
                this.refreshActiveLayer();
            }
        }, undefined);

        this.csInterface.addEventListener(`console_log_event`, (result) => {
            console.log('console_log_event', result);
        }, undefined)

    }
    private handleEventFromGenerator(data: IMessage) {
        console.log('action', data.action);
        console.log('action', data.type);
        switch (data.action) {
            case IGeneratorAction.fastExport: {
                if (data.type === 'success' || data.type === 'error') {
                    ResourceSynchronizationRef.current.updateWaitQueue("generate", data.type, data.data.layerId, data.type === 'success' ? data.data.path : data.data.error);
                }
            }
        }
    }
    private evalFiles() {
        const extensionRoot = this.csInterface.getSystemPath(SystemPath.EXTENSION);
        console.log('开始加载文件', extensionRoot);
        this.csInterface.evalScript('$._ext.evalFiles(\"' + extensionRoot + '\")', (result) => {
            console.log('evalFiles', result);
        });
    }
    public registerEvent(stringId: string) {
        this.csInterface.evalScript(`app.stringIDToTypeID('${stringId}')`, (data) => {
            if (stringId === 'select') this.selectEventId = data;
            if (stringId === 'close') this.closeEventId = data;
            if (stringId === 'open') this.openEventId = data;
            if (stringId === 'delete') this.deleteEventId = data;
            if (stringId === 'paste') this.pasteEventId = data;
            if (stringId === 'add') this.addEventId = data;
            if (stringId === 'cut') this.cutEventId = data;
            if (stringId === 'make') this.makeEventId = data;
            const csEvent: CSEvent = {
                type: 'com.adobe.PhotoshopRegisterEvent',
                scope: 'APPLICATION',
                appId: this.appId,
                extensionId: this.extId,
                data: data
            }
            this.csInterface.dispatchEvent(csEvent);
        });

    }
    public getActiveDocument(): Promise<IDocument | undefined> {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getActiveDocument()`, (result: string) => {
                try {
                    console.log('result', result)
                    if (result && result !== "undefined") {
                        const activeDocument = JSON.parse(result) as IDocument;
                        resolve(activeDocument);
                    } else {
                        resolve(undefined);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    public getActiveLayer(): Promise<ILayer | undefined> {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getActiveLayer()`, (result: string) => {
                try {
                    console.log('getActiveLayer', result)
                    if (result && result !== "undefined") {
                        const activeLayer = JSON.parse(result) as ILayer;
                        resolve(activeLayer);
                    } else {
                        resolve(undefined);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    public getLayerInfoByID(layerID: number, prpr: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = JSON.stringify({
                "layerID": layerID,
                prpr: prpr
            })
            this.csInterface.evalScript(`$._ext.getLayerInfoByID(${req})`, (result) => {
                try {
                    console.log('result', result)
                    if (result && result !== "undefined") {
                        const layerInfo = JSON.parse(result);
                        console.log('getLayerInfoByID返回成功', layerInfo)
                    } else {
                        resolve(undefined);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    public getDocGeneratorSettings() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getGeneratorSettings()`, (result) => {
                console.log('getGeneratorSettings', result)
                if (result) {
                    const jStr = JSON.parse(result);
                    resolve(jStr);
                } else {
                    reject(undefined);
                }
            });
        });
    }
    public async refreshActiveLayer() {
        const layer = await this.getActiveLayer();
        if (layer.generatorSettings) {
            layer.generatorSettings = JSON.parse(layer.generatorSettings);
        }
        AppRef.current.selectLayer(layer);
    }
    public async getAllLayerList(layerKind?: number) {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getLayerList(${layerKind})`, (result) => {
                try {
                    if (result) {
                        const layers: ILayer[] = JSON.parse(result);
                        layers.forEach((layer) => {
                            if (layer.generatorSettings) {
                                layer.generatorSettings = JSON.parse(layer.generatorSettings);
                            }
                        })
                        resolve(layers);
                    } else {
                        resolve(undefined);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    public restart() {
        const event: CSEvent = {
            type: "my.restart.event",
            scope: "APPLICATION",
            appId: this.appId,
            extensionId: this.extId,
            data: JSON.stringify({ restart: 1000, extensionId: this.extId })
        };
        this.csInterface.dispatchEvent(event);
        // 发送完消息后，延迟会，关闭当前插件面板
        setTimeout(() => {
            this.csInterface.closeExtension();
        }, 100);
    }
    public async setLayerGeneratorSettings(layerId: number, figmaNodeId: string, callback?: Function) {
        const param: ISetGerParams = {
            key: "comPosidonPSCep",
            settings: {
                figmaNodeId: figmaNodeId
            },
            layerId: layerId
        }
        this.csInterface.evalScript(`$._ext.setGeneratorSettings(${JSON.stringify(param)})`, (result) => {
            callback && callback();
        });
    }
    public async setDocGeneratorSettings(settings: any, callback?: Function) {
        const param: ISetGerParams = {
            key: "comPosidonPSCep",
            settings: settings,
        }
        this.csInterface.evalScript(`$._ext.setGeneratorSettings(${JSON.stringify(param)})`, (result) => {
            callback && callback();
        });
    }
    public async fastExport(layer: ILayer) {
        console.log('fastExport', layer)
        const suffix = new Date().getTime();
        // const floderPath = psConfig.downloadDir();
        const floderPath = "C:\\Users\\wb.zhaominghui01\\Desktop\\新建文件夹";
        const param = {
            layer: true,
            path: floderPath,
            suffix: suffix
        }
        const fileName = suffix + '.png';
        this.csInterface.evalScript(`$._ext.quick_export_png(${JSON.stringify(param)})`, (result) => {
            setTimeout(() => {
                console.log('fileName', fileName, result)
                const oldPath = path.join(floderPath, "组 4" + ".png");
                console.log('oldPath', oldPath)
                const newPath = path.join(floderPath, fileName);
                console.log('newPath', newPath)
                console.log('newPath', window.cep.fs.stat(oldPath))
                if (window.cep.fs.stat(oldPath).err === 0) {
                    window.cep.fs.rename(oldPath, newPath);
                }
            }, 100)
        });
    }
    public async sendToGenerator(params: IGeneratorParams) {
        console.log("sendToGenerator", params)
        this.csInterface.evalScript(`$._ext.sendToGenerator(${JSON.stringify(params)})`, (result) => {

        });
    }
}

const psHandler = handler.getInstance();
export default psHandler;