import { AppRef } from "@/router/App";
import { IDocument, IEventResult } from "@/store/iTypes/iTypes";

//用来与Photoshop交互
class handler {
    private static instance: handler;
    private csInterface: CSInterface;
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
        if (!handler.instance) {
            handler.instance = new handler();
        }
        return handler.instance;
    }

    private init() {
        this.registerEvent('select',);
        this.registerEvent('close');
        this.registerEvent('open');


        this.csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', () => {
            console.log('颜色更换')
        }, undefined);

        this.csInterface.addEventListener('my_custom_event_type', (result) => {
            console.log('my_custom_event_type', result);
        }, undefined);

        this.csInterface.addEventListener('com.adobe.PhotoshopJSONCallback' + this.extId, (result: IEventResult) => {
            console.log(result);
            let data = result.data.replace(/ver1,/, '');
            let obj = JSON.parse(data);
            if (parseInt(obj.eventID) === parseInt(this.selectEventId)) {
                //"ver1,{ "eventID": 1936483188, "eventData": {"documentID":230,"null":{"_offset":-1,"_ref":"document"}}}"
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


}

const psHandler = handler.getInstance();
export default psHandler;