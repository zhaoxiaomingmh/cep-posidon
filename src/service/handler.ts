import { AppRef } from "@/router/App";
import { IDocument, IEventData, IEventResult, ILayer } from "@/store/iTypes/iTypes";
import { darkTheme, defaultTheme, lightTheme } from '@adobe/react-spectrum';
import { Theme } from "@react-types/provider";
//用来与Photoshop交互
class handler {
    private static instance: handler;
    public csInterface: CSInterface;
    public extId: string;
    public appId: string;

    private selectEventId: string;
    private closeEventId: string;
    private openEventId: string;

    constructor() {
        console.log("中央处理器注册成功");
        this.csInterface = new CSInterface();
        this.appId = this.csInterface.getApplicationID();
        this.extId = this.csInterface.getExtensionID();
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
        this.getCurrentTheme();


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
                console.log('图层选中事件', obj);
                const eventData = obj.eventData as IEventData;
                AppRef.current.selectLayer(eventData.layerID[0], eventData.null._name);
            }
            if (parseInt(obj.eventID) === parseInt(this.closeEventId)) {
                //{extensionId: "", data: "ver1,{ "eventID": 1131180832, "eventData": {"documentID":243,"forceNotify":true}}", appId: "PHXS", type: "com.adobe.PhotoshopJSONCallbackposidon-ps", scope: "APPLICATION"}

                AppRef.current.refresh();
            }
            if (parseInt(obj.eventID) === parseInt(this.openEventId)) {
                AppRef.current.refresh();
            }
        }, undefined);

        this.csInterface.addEventListener(`console_log_event`, (result) => {
            console.log('console_log_event', result);
        }, undefined)

    }

    public registerEvent(stringId: string) {
        this.csInterface.evalScript(`app.stringIDToTypeID('${stringId}')`, (data) => {
            if (stringId === 'select') this.selectEventId = data;
            if (stringId === 'close') this.closeEventId = data;
            if (stringId === 'open') this.openEventId = data;
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
            this.csInterface.evalScript(`getActiveDocument()`, (result: string) => {
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
            this.csInterface.evalScript(`getActiveLayerName()`, (result: string) => {
                try {
                    console.log('result', result)
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
}

const psHandler = handler.getInstance();
export default psHandler;