
if (typeof ($) == 'undefined') {
    $ = {};
}
$.level = 0;
try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
    alert(e.toString());
}
const classProperty = charIDToTypeID("Prpr");
const propNull = charIDToTypeID("null");
const classNull = charIDToTypeID("null");
const typeOrdinal = charIDToTypeID("Ordn");
const enumTarget = charIDToTypeID("Trgt");
const classDocument = charIDToTypeID("Dcmn");
const classLayer = charIDToTypeID("Lyr ");
const propProperty = stringIDToTypeID("property");
const actionSet = charIDToTypeID("setd");
const keyTo = charIDToTypeID("T   ");
$._ext = {
    extensionDir: "",
    evalFile: function (path) {
        try {
            return $.evalFile(path);
        } catch (e) {
            return "[ERROR] line[" + (e.line - 1) + "] message[" + e.message + "] stack[" + $.stack + "]";
        }
    },
    evalFiles: function (extensionDir) {
        $._ext.extensionDir = extensionDir;
        var files = [];
        var jsxDir = new Folder(extensionDir + '/photoshop/external');
        if (jsxDir.exists) {
            files = files.concat(jsxDir.getFiles("*.jsx"));
        }
        var errno = 0;
        for (var i = 0; i < files.length; i++) {
            if (!/engine.jsx/.test(files[i])) {
                $._ext.evalFile(files[i]);
            }
        }
        return "{\"errno\": " + errno + "}";
    },
    /**
    * 根据图层的顺序，来获取图层信息
    * @param index
    * @return {*}
    */
    getLayerInfoByIndex: function (index) {
        var ref1 = new ActionReference();
        ref1.putIndex(stringIDToTypeID("itemIndex"), index);
        var layerDescriptor = executeActionGet(ref1);
        var descFlags = {
            reference: false,
            extended: false,
            maxRawLimit: 10000,
            maxXMPLimit: 100000,
            saveToFile: null
        };
        var descObject = descriptorInfo.getProperties(layerDescriptor, descFlags);
        return JSON.stringify(descObject, null, 4);
    },
    /**
    * 根据图层ID来获取图层信息
    * @param layerID
    * @return {*}
    */
    getLayerInfoByID: function (pa) {
        try {
            var ref = new ActionReference();
            if (pa.prpr) {
                ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID(pa.prpr));
            }
            if (pa.layerID === -1) {
                ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            } else {
                ref.putIdentifier(charIDToTypeID("Lyr "), pa.layerID);
            }
            var layerDescriptor = executeActionGet(ref);
            var descFlags = {
                reference: false,
                extended: false,
                maxRawLimit: 10000,
                maxXMPLimit: 100000,
                saveToFile: null
            };
            var descObject = descriptorInfo.getProperties(layerDescriptor, descFlags);
            return JSON.stringify(descObject, null, 4);
        } catch (e) {
            psconsole.log(e);
        }
    },
    getActiveLayer: function () {
        var activeLayer = app.activeDocument.activeLayer;
        const pa = {
            prpr: "layerKind",
            layerID: activeLayer.id,
        }
        const result = this.getLayerInfoByID(pa);
        const layer = {
            name: activeLayer.name,
            id: activeLayer.id,
            layerKind: JSON.parse(result).layerKind,
        }
        return JSON.stringify(layer);
    },
    getActiveDocument: function () {
        try {
            const activeDocument = app.activeDocument;
            const document = {
                name: activeDocument.name,
                id: activeDocument.id,
            }
            return JSON.stringify(document);
        } catch (error) {
            return undefined;
        }
    },
    setGeneratorSettings: function (params) {
        var generatorSettingsDesc = new ActionDescriptor();
        var settings = params.settings;
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                generatorSettingsDesc.putString(stringIDToTypeID(key), settings[key]);
            }
        }
        var theRef = new ActionReference();
        theRef.putProperty(classProperty, stringIDToTypeID("generatorSettings"));
        if (params.layerId) {
            theRef.putIdentifier(classLayer, params.layerId);
        } else {
            theRef.putEnumerated(classDocument, typeOrdinal, enumTarget);
        }
        var setDescriptor = new ActionDescriptor();
        setDescriptor.putReference(propNull, theRef);
        setDescriptor.putObject(keyTo, classNull, generatorSettingsDesc);
        if (params.key) {
            setDescriptor.putString(propProperty, params.key);
        }
        executeAction(actionSet, setDescriptor, DialogModes.NO);
    },
    getGeneratorSettings: function () {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("generatorSettings"));
        ref.putEnumerated(classDocument, typeOrdinal, enumTarget);
        var docDescriptor = executeActionGet(ref);
        var descFlags = {
            reference: false,
            extended: false,
            maxRawLimit: 10000,
            maxXMPLimit: 100000,
            saveToFile: null
        };
        var descObject = descriptorInfo.getProperties(docDescriptor, descFlags);
        return JSON.stringify(descObject, null, 4);
    },
    getLayerTree: function () {

    },
    getLayerList: function (layerKind) {
        var layers = [];
        Layer.loopLayers(function (layer) {
            psconsole.log("layerKind: " + layer.kind() + ", name: " + layer.name());
            if ((layerKind && layerKind == layer.kind()) || (!layerKind && layer.kind() != 13)) {
                const iLayer = {
                    name: layer.name(),
                    layerKind: layer.kind(),
                    id: layer.id,
                    index: layer.index(),
                    generatorSettings: layer.generatorSettings(),
                    bounds: layer.bounds(),
                }
                layers.push(iLayer);
            }
        })
        return JSON.stringify(layers);
    },
};

//#region 
if (typeof JSON !== "object") {
    JSON = {};
}
(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return (n < 10)
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case "string":
                return quote(value);

            case "number":

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return (isFinite(value))
                    ? String(value)
                    : "null";

            case "boolean":
            case "null":

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce "null". The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is "object", we might be dealing with an object or an array or
            // null.

            case "object":

                // Due to a specification blunder in ECMAScript, typeof null is "object",
                // so watch out for that case.

                if (!value) {
                    return "null";
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === "[object Array]") {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? (
                                "[\n"
                                + gap
                                + partial.join(",\n" + gap)
                                + "\n"
                                + mind
                                + "]"
                            )
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap)
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap)
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

            // Make a fake root object containing our value under the key of "".
            // Return the result of stringifying the value.

            return str("", { "": value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with "()" and "new"
            // because they can cause invocation, and "=" because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
            // replace all simple value tokens with "]" characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or "]" or
            // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({ "": j }, "")
                    : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());
//#endregion
function openImage(params) {
    var path = params.path;
    try {
        var file = new File(path);
        if (file.exists) {
            if (params.isImport) {
                var idPlc = charIDToTypeID("Plc ");
                var desc2 = new ActionDescriptor();
                var idnull = charIDToTypeID("null");
                desc2.putPath(idnull, file);
                executeAction(idPlc, desc2, DialogModes.NO);
            } else {
                var doc = app.open(file);
            }
            return "File opened successfully";
        } else {
            return "File does not exist";
        }
    } catch (error) {
        psconsole.log('error', error);
        return error;
    }

}
//#region 
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
//#endregion
//#region
/**
 * 根据图层的名称，来获取图层信息
 * @param index
 * @return {*}
 */
function getLayerInfoByName(name) {
    var ref1 = new ActionReference();
    ref1.putName(stringIDToTypeID("layer"), name);
    var layerDescriptor = executeActionGet(ref1);
    var json = ADToJson(layerDescriptor);
    return json
}
function getCurrentDocumentInfo() {
    var ref1 = new ActionReference();
    ref1.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var docDescriptor = executeActionGet(ref1);
    var json = ADToJson(docDescriptor);
    return json
}
//#endregion

//#region

/**
 * @description 图层模块，基本功能封装
 * @author xiaoqiang
 * @date 2021/01/15
 */

function Layer(id) {
    this.id = id;
}

// --------- 实例方法 -----------------
/**
* 获取当前实例图层的名称
* @return {string}
*/
Layer.prototype.name = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Nm  "));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getString(charIDToTypeID("Nm  "));
}

/**
* 获取当前实例图层的层级
* @return {number}
*/
Layer.prototype.index = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getInteger(charIDToTypeID("ItmI"));
}

/**
* 获取当前实例图层的类型
* @return {number}
*/
Layer.prototype.kind = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerKind"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getInteger(stringIDToTypeID("layerKind"));
}

/**
* 获取当前实例图层的尺寸
* @return {{x: number, width: number, y: number, height: number}}
*/
Layer.prototype.bounds = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("bounds"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var layerDescriptor = executeActionGet(layerReference);
    var rectangle = layerDescriptor.getObjectValue(stringIDToTypeID("bounds"));
    var left = rectangle.getUnitDoubleValue(charIDToTypeID("Left"));
    var top = rectangle.getUnitDoubleValue(charIDToTypeID("Top "));
    var right = rectangle.getUnitDoubleValue(charIDToTypeID("Rght"));
    var bottom = rectangle.getUnitDoubleValue(charIDToTypeID("Btom"));
    return { x: left, y: top, width: (right - left), height: (bottom - top) };
}

/**
* 判断当前图层的显示/隐藏
* @return {boolean}
*/
Layer.prototype.visible = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Vsbl"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    if (descriptor.hasKey(charIDToTypeID("Vsbl")) == false) return false;
    return descriptor.getBoolean(charIDToTypeID("Vsbl"));
}

Layer.prototype.generatorSettings = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("generatorSettings"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    var descFlags = {
        reference: false,
        extended: false,
        maxRawLimit: 10000,
        maxXMPLimit: 100000,
        saveToFile: null
    };
    var descObject = descriptorInfo.getProperties(descriptor, descFlags);
    return JSON.stringify(descObject, null, 4).generatorSettings;
}

/**
* 获取形状图层的填充颜色
* @return {null|*[]}
*/
Layer.prototype.solidFill = function () {
    var kind = this.kind();
    if (kind === 4) { // 只有形状图层才能获取到图层填充属性
        var layerReference = new ActionReference();
        // 形状图层的填充和其它属性在adjuestment下面
        layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("adjustment"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
        var descriptor = executeActionGet(layerReference);
        var adjustment = descriptor.getList(stringIDToTypeID("adjustment"));    // adjustment是一个ActionList
        var result = [];
        for (var i = 0; i < adjustment.count; i++) {
            var item = adjustment.getObjectValue(i);
            var color = item.getObjectValue(stringIDToTypeID("color"));
            var red = color.getInteger(stringIDToTypeID("red"));
            var green = color.getInteger(stringIDToTypeID("grain"));
            var blue = color.getInteger(stringIDToTypeID("blue"));
            result.push({ "red": red, "green": green, "blue": blue });
        }
        return result;
    }
    return null;
}

/**
* 获取图层描边效果
* @return {{size: *, color: {red: *, green: *, blue: *}, opacity: *}|null}
*/
Layer.prototype.strokeFx = function () {
    var layerReference = new ActionReference();
    // 所有的图层效果，都在layerEffects下面
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerEffects"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    var layerEffects = descriptor.getList(stringIDToTypeID("layerEffects"));
    var frameFX = layerEffects.getObjectValue(stringIDToTypeID("frameFX"));
    var enabled = frameFX.getBoolean(stringIDToTypeID("enabled"));
    if (enabled) {
        var size = frameFX.getInteger(stringIDToTypeID("size"));
        var opacity = frameFX.getInteger(stringIDToTypeID("opacity"));
        var color = frameFX.getObjectValue(stringIDToTypeID("color"));
        var red = color.getInteger(stringIDToTypeID("red"));
        var green = color.getInteger(stringIDToTypeID("grain"));
        var blue = color.getInteger(stringIDToTypeID("blue"));
        return {
            size: size,
            opacity: opacity,
            color: { red: red, green: green, blue: blue }
        }
    }
    return null;
}


/**
* 选中当前实例图层
*/
Layer.prototype.select = function () {
    var current = new ActionReference();
    current.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), current);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}

/**
* 显示当前实例对象图层
*/
Layer.prototype.show = function () {
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
    ref1.putIdentifier(charIDToTypeID("Lyr "), this.id);;
    list1.putReference(ref1);
    desc1.putList(charIDToTypeID("null"), list1);
    executeAction(charIDToTypeID("Shw "), desc1, DialogModes.NO);
}


/**
* 隐藏当前实例对象图层
*/
Layer.prototype.hide = function () {
    var current = new ActionReference();
    var desc242 = new ActionDescriptor();
    var list10 = new ActionList();
    current.putIdentifier(charIDToTypeID("Lyr "), this.id);;
    list10.putReference(current);
    desc242.putList(charIDToTypeID("null"), list10);
    executeAction(charIDToTypeID("Hd  "), desc242, DialogModes.NO);
}

/**
* 栅格化当前实例图层
*/
Layer.prototype.rasterize = function () {
    var desc7 = new ActionDescriptor();
    var ref4 = new ActionReference();
    ref4.putIdentifier(charIDToTypeID("Lyr "), this.id);
    desc7.putReference(charIDToTypeID("null"), ref4);
    executeAction(stringIDToTypeID("rasterizeLayer"), desc7, DialogModes.NO);
}

/**
* 修改图层名称
* @param newNameString
*/
Layer.prototype.setName = function (newNameString) {
    var desc26 = new ActionDescriptor();
    var ref13 = new ActionReference();
    // 只能对当前选中的图层操作
    ref13.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    desc26.putReference(charIDToTypeID("null"), ref13);
    var desc27 = new ActionDescriptor();
    desc27.putString(charIDToTypeID("Nm  "), newNameString);
    desc26.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc27);
    executeAction(charIDToTypeID("setd"), desc26, DialogModes.NO);
}


// --------- 类方法 -----------------
/**
* 获取选中的图层列表
* @return Layer[]
*/
Layer.getSelectedLayers = function () {
    var targetLayersTypeId = stringIDToTypeID("targetLayersIDs");
    var selectedLayersReference = new ActionReference();
    selectedLayersReference.putProperty(charIDToTypeID("Prpr"), targetLayersTypeId);
    selectedLayersReference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(selectedLayersReference);
    var layers = [];
    if (desc.hasKey(targetLayersTypeId)) {
        // have selected layers
        var list = desc.getList(targetLayersTypeId);
        for (var i = 0; i < list.count; i++) {
            var ar = list.getReference(i);
            var layerId = ar.getIdentifier();
            layers.push(new Layer(layerId));
        }
    }

    // WIN CC2019的情况下，默认一个背景图层，会获取到ID是0
    if (layers.length === 1 && layers[0].id === "0") {
        layers = [];
        selectedLayersReference = new ActionReference();
        selectedLayersReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("LyrI"));
        selectedLayersReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var descriptor = executeActionGet(selectedLayersReference);
        var id = descriptor.getInteger(charIDToTypeID("LyrI"));
        layers.push(new Layer(id));
    }

    return layers;
}

/**
* 根据名称获取图层
*/
Layer.getLayersByName = function () {
    try {
        var ref = new ActionReference();
        ref.putName(charIDToTypeID("Lyr "), stringIDToTypeID("name"));
        var layerDesc = executeActionGet(ref)
        var layerId = layerDesc.getInteger(charIDToTypeID('LyrI'));
        return new Layer(layerId);
    } catch (e) {
        $.writeln(e.toSting());
        return null;
    }
}


/**
* 高效的遍历图层方法
*/
Layer.loopLayers = function (callback) {
    var ref = new ActionReference();
    // 当前文档的图层数量属性key
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID('NmbL'));
    ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
    var desc = executeActionGet(ref);
    var layerCount = desc.getInteger(charIDToTypeID('NmbL'));
    $.writeln("count: " + layerCount);
    // 索引起始值，会受是否有背景图层影响，需要做一下处理
    var i = 0;
    try {
        activeDocument.backgroundLayer;
    } catch (e) {
        i = 1;
    }
    psconsole.log("索引起点i: " + i);
    // 开始逐级遍历图层index，根据index来获取到图层实例
    for (i; i <= layerCount; i++) {
        var ref = new ActionReference();
        ref.putIndex(charIDToTypeID('Lyr '), i);
        var desc = executeActionGet(ref);
        var id = desc.getInteger(stringIDToTypeID('layerID'));
        var layer = new Layer(id);
        // 根据需要进行操作
        callback && callback(layer)
    }
}
//#endregion