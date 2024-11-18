
window.addEventListener('load', () => {
    const csInterface = new CSInterface();
    csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', () => {
        //颜色改变
        console.log('颜色变化')
    });

    csInterface.addEventListener("documentAfterActivate", PSCallback);
    function PSCallback(event) {
        console.log('event.data', event.data);
        const skinInfo = csInterface.getHostEnvironment().appSkinInfo;
        console.log('skinInfo', skinInfo);
        csInterface.evalScript("app.documents", function (result) {
            alert('nmb')
            if (result) {
                try {
                    console.log("所有文档:", result);
                } catch (e) {
                    console.error("解析文档信息时出错:", e);
                }
            } else {
                console.log("没有打开的文档");
            }
        });
    }
});

import './main.tsx'