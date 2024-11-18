
try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
    alert(e.toString());
}

// 获取当前选中图层的名称
function getActiveDoc() {
    var doc = app.activeDocument.id;
    return doc;
}

// 获取当前选中图层的名称
function getActiveLayerName() {
    var doc = app.activeDocument.activeLayer.id;
    return doc;

}

// 事件派发函数
function dispatch(message) {
    var eventObj = new CSXSEvent();
    eventObj.type = "my_custom_event_type";
    eventObj.data = '[CSXSEvent] ' + message + '';
    eventObj.dispatch()
}

var psconsole = {
    log: function (message) {
        var eventObj = new CSXSEvent();
        eventObj.type = "console_log_event";
        eventObj.data = '[JSXLog] ' + message + '';
        eventObj.dispatch();
    }
};