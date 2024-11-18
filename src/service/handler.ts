import { IEventResult } from "@/store/iTypes/iTypes";
import useDocumentStore from "@/store/modules/documentStore";

class handler {
    private static instance: handler;
    private csInterface: CSInterface;
    private extId: string;
    private appId: string;

    private selectEventId: string;
    private closeEventId: string;
    private setDoc = useDocumentStore(state => state.setActiveDocument)
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
                
                this.csInterface.evalScript(`app.activeDocument.id`, (result) => {
                    console.log(result);
                    
                });
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

    public getActiveLayerName() {
        this.csInterface.evalScript(`getActiveLayerName()`, (result) => {
            console.log(result);
        });
    }


}

const psHandler = handler.getInstance();
export default psHandler;