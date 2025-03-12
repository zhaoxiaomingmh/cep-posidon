import { CuttingToolPageRef } from "@/pages/cutting/component/cuttingTool/CuttingTool";
import { ResourceSynchronizationRef } from "@/pages/cutting/component/ResourceSynchronization";
import { GridRef } from "@/pages/grid/component/grid/Grid";
import { AppRef } from "@/router/App";
import { IDocument, IEventData, IEventResult, IGeneratorAction, IGeneratorParams, ILayer, IMessage, ISetGerParams, IStatus } from "@/store/iTypes/iTypes";
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
    public isWindowVisible: string;
    public cumulativeTime: number = 0;

    private selectEventId: string;
    private closeEventId: string;
    private openEventId: string;
    private deleteEventId: string;
    private pasteEventId: string;
    private addEventId: string;
    private cutEventId: string;
    private makeEventId: string;
    private transformEventId: string;
    private placeEventId: string;
    private closeDocumentEventId: string;


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
        this.transformEventId = "1416785510";
        this.placeEventId = "1349280544";
        this.closeDocumentEventId = "1131180832";
        this.init();
        this.pluginPersistence();
        this.timingTasks();
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
        this.registerEvent('transform');
        this.registerEventByTypeID("1349280544");
        this.registerEventByTypeID("1131180832");
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
                if (GridRef?.current) {
                    if (GridRef?.current.refreshStatus != IStatus.loading && GridRef?.current.gridStatus != IStatus.loading) {
                        this.refreshActiveLayer();
                    }
                } else {
                    this.refreshActiveLayer();
                }
                if (eventData.documentID) {
                    this.refreshGroup()
                } else if (eventData.layerID?.length > 0) {
                }
            }
            if (parseInt(obj.eventID) === parseInt(this.closeEventId)) {
                this.refreshActiveLayer();
                this.refreshGroup()
            }
            if (parseInt(obj.eventID) === parseInt(this.closeDocumentEventId)) {
                console.log('CloseDocument事件', obj);
            }
            if (parseInt(obj.eventID) === parseInt(this.openEventId)) {
                this.refreshActiveLayer();
                this.refreshGroup()
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
                this.refreshGroup()
            }
            if (parseInt(obj.eventID) === parseInt(this.transformEventId)) {
                console.log('Transform事件', obj);
                GridRef?.current?.setRefreshStatus(IStatus.loading);
            }
            if (parseInt(obj.eventID) === parseInt(this.placeEventId)) {
                console.log('Place事件', obj);
                if (GridRef?.current) {
                    if (GridRef?.current.refreshStatus != IStatus.loading && GridRef?.current.gridStatus != IStatus.loading) {
                        this.refreshActiveLayer();
                    }
                } else {
                    this.refreshActiveLayer();
                }
            }
        }, undefined);

        this.csInterface.addEventListener(`console_log_event`, (result) => {
            console.log('console_log_event', result);
        }, undefined)

    }
    //插件持久化
    private pluginPersistence() {
        const event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION", this.appId, this.extId);
        this.csInterface.dispatchEvent(event);
    }
    //计时任务 
    private timingTasks() {
        //执行代码
        const isWindowVisible = this.csInterface.isWindowVisible();
        if (isWindowVisible !== this.isWindowVisible) {
            if (isWindowVisible === 'false') {
                AppRef?.current?.scheduledTaskForUpdateTimestamp(true);
                this.cumulativeTime = 0;
            } 
            this.isWindowVisible = isWindowVisible;
        } else {
            if (isWindowVisible && this.cumulativeTime + 10 < 300) {
                this.cumulativeTime += 10;
            } else {
                AppRef?.current?.scheduledTaskForUpdateTimestamp(false);
                this.cumulativeTime = 0;
            }
        }
        setTimeout(() => { this.timingTasks(); }, 10000)
    }
    //刷新编组
    private refreshGroup() {
        ResourceSynchronizationRef?.current?.init();
    }
    private handleEventFromGenerator(data: IMessage) {
        console.log('action', data.action, data.type);
        switch (data.action) {
            case IGeneratorAction.fastExport: {
                if (data.type === 'success' || data.type === 'error') {
                    ResourceSynchronizationRef?.current?.updateWaitQueue("generate", data.type, data.data.layerId, data.type === 'success' ? data.data.path : data.data.error);
                    GridRef?.current?.refresh(IStatus.success);
                } else {
                    GridRef?.current?.refresh(IStatus.error);
                }
                break;
            }
            case IGeneratorAction.grid: {
                if (data.type === 'success') {
                    GridRef?.current?.handleGridTask(IStatus.success);
                } else {
                    GridRef?.current?.handleGridTask(IStatus.error);
                }
                break;
            }
            case IGeneratorAction.cuttingToolExport: {
                CuttingToolPageRef?.current?.refreshExportTaskStatus(data.type === 'success' ? IStatus.success : IStatus.error, data.data.layerId);
                break;
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
            console.log('stringId', stringId, data);
            if (stringId === 'select') this.selectEventId = data;
            if (stringId === 'close') this.closeEventId = data;
            if (stringId === 'open') this.openEventId = data;
            if (stringId === 'delete') this.deleteEventId = data;
            if (stringId === 'paste') this.pasteEventId = data;
            if (stringId === 'add') this.addEventId = data;
            if (stringId === 'cut') this.cutEventId = data;
            if (stringId === 'make') this.makeEventId = data;
            if (stringId === 'transform') this.transformEventId = data;
            if (stringId === 'place') this.placeEventId = data;
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
    public registerEventByTypeID(data: string) {
        const csEvent: CSEvent = {
            type: 'com.adobe.PhotoshopRegisterEvent',
            scope: 'APPLICATION',
            appId: this.appId,
            extensionId: this.extId,
            data: data
        }
        this.csInterface.dispatchEvent(csEvent);

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
    //根据ID获取Layer
    public getLayersByIDs(layerIDs: number[]): Promise<ILayer[]> {
        return new Promise((resolve, reject) => {
            const req = JSON.stringify(layerIDs)
            this.csInterface.evalScript(`$._ext.getLayersByIDs(${req})`, (result) => {
                try {
                    if (result && result !== "undefined") {
                        const layers = JSON.parse(result);
                        console.log('getLayerInfoByID返回成功', layers)
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
    public getDocGeneratorSettings(): Promise<any> {
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
        console.log('refreshActiveLayer', layer)
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
    public async setLayerGeneratorSettings(layerId: number, data: any, callback?: Function) {
        const param: ISetGerParams = {
            key: "comPosidonPSCep",
            settings: data,
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
    public async sendToGenerator(params: IGeneratorParams) {
        console.log("sendToGenerator", params)
        this.csInterface.evalScript(`$._ext.sendToGenerator(${JSON.stringify(params)})`, (result) => {
        });
    }
    public async selectLayer(id: number) {
        this.csInterface.evalScript(`$._ext.selectLayer(${id})`, (result) => {
        })
    }
    //创建一个编组
    public async mkGroup() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.mkGroup()`, (result: string) => {
                if (result) {
                    const makeGroup = JSON.parse(result)
                    console.log("makeGroup", makeGroup);
                    resolve(makeGroup.layerSectionStart);
                } else {
                    reject(new Error('Failed to create group'));
                }
            });
        });
    }
    //修改图层名称
    public async renameLayer(layerID: number, name: string) {
        let param = {
            layerID: layerID,
            name: name
        }
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.renameLayer(${JSON.stringify(param)})`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        });
    }
    //修改图层可见性
    public async setLayerVisible(layerID: number, visible: boolean) {
        let param = {
            layerID: layerID,
            visible: visible
        }
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.setLayerVisible(${JSON.stringify(param)})`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //将图片导入文档
    public async importImage(filePath: string, offsetX: number, offsetY: number) {
        let params = {
            offsetX: offsetX,
            offsetY: offsetY,
            filePath: filePath
        }
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.importImage(${JSON.stringify(params)})`, (result) => {
                if (result && result.length > 0) {
                    console.log("result", result);
                    resolve(true);
                } else {
                    reject(result);
                }
            })
        })
    }
    //将图层移动入编组
    public async moveLayersToGroup(layerIDs: number[], groupID: number) {
        let param = {
            layerIDs: layerIDs,
            groupID: groupID
        }
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.moveLayerToGroup(${JSON.stringify(param)})`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //获取一个组内所有图层
    public async getLayersInGroup(groupID: number): Promise<ILayer[]> {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getLayersInGroup(${groupID})`, (result) => {
                if (result) {
                    const layers = JSON.parse(result) as ILayer[];
                    resolve(layers);
                } else {
                    reject(undefined);
                }
            })
        })
    }
    //移动当前图层
    public async transformLayer(offsetX: number, offsetY: number, scaleX: number, scaleY: number) {
        let param = {
            offsetX: offsetX,
            offsetY: offsetY,
            scaleX: scaleX,
            scaleY: scaleY
        }
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.transformLayer(${JSON.stringify(param)})`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //获取当前用户的配置
    public async getPhotoshopPreferencesInterpolation() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getPhotoshopPreferencesInterpolation()`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //修改当前用户配置
    public async setPhotoshopPreferencesInterpolation(resampleMethod: string) {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.setPhotoshopPreferencesInterpolation(${resampleMethod})`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //整合历史记录
    public async suspendHistory(historyName: string, functionName: string, functionParam: any) {
        return new Promise((resolve, reject) => {
            var params = {
                historyName: historyName,
                functionName: functionName,
                functionParam: functionParam
            }
            this.csInterface.evalScript(`$._ext.suspendHistory(${JSON.stringify(params)})`, (result) => {
                console.log("result", result);
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //文档瘦身
    public async documentSlimming() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.documentSlimming()`, (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(result);
                }
            })
        })
    }
    //获取文档分辨率
    public async getDocumentResolution(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(`$._ext.getDocumentResolution()`, (result) => {
                console.log("result", result);
                if (result) {
                    resolve(result);
                } else {
                    reject(-1);
                }
            })
        })
    }
}

const psHandler = handler.getInstance();
export default psHandler;