﻿
if (typeof ($) == 'undefined') {
    $ = {};
}
$.level = 0;
try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
    alert("PhotoShop外部库PlugPlugExternalObject加载中，请点击重试（可能需要重复多次哦）");
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
    //加载脚本引擎
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
    //图层类
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
        return JSON.stringify(descObject.generatorSettings, null, 4);
    },
    getLayerTree: function () {
    },
    getLayerList: function (layerKind) {
        var layers = [];
        Layer.loopLayers(function (layer) {
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
    sendToGenerator: function (params) {
        try {
            var generatorDesc = new ActionDescriptor();
            generatorDesc.putString(stringIDToTypeID("name"), "posidon-generator");
            generatorDesc.putString(stringIDToTypeID("sampleAttribute"), JSON.stringify(params));
            executeAction(stringIDToTypeID("generateAssets"), generatorDesc, DialogModes.NO);
        } catch (e) {
            psconsole.log(e);
        }
    },
    selectLayer: function (layerID) {
        var layer = new Layer(layerID);
        layer.select();
    },
    //增加
    //创建一个新编组
    mkGroup: function () {
        try {
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putClass(stringIDToTypeID("layerSection"));
            desc1.putReference(charIDToTypeID("null"), ref1);
            var layerDescriptor = executeAction(charIDToTypeID("Mk  "), desc1, DialogModes.NO);
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
    //改
    //修改图层名称
    renameLayer: function (params) {
        try {
            var layer = new Layer(params.layerID);
            layer.setName(params.name);
            return true;
        } catch (e) {
            psconsole.log(e);
            return false;
        }
    },
    //修改图层可见性
    setLayerVisible: function (params) {
        var layer = new Layer(params.layerID);
        if (params.visible) {
            layer.show();
        } else {
            layer.hide();
        }
        return true;
    },
    //把图层移动入编组
    moveLayerToGroup: function (params) {
        try {
            var layer = new Layer(params.groupID);
            var index = layer.index();
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            desc1.putReference(charIDToTypeID("null"), ref1);
            var ref2 = new ActionReference();
            ref2.putIndex(charIDToTypeID("Lyr "), index - 1);
            desc1.putReference(charIDToTypeID("T   "), ref2);
            desc1.putBoolean(charIDToTypeID("Adjs"), false);
            desc1.putInteger(charIDToTypeID("Vrsn"), 5);
            var list1 = new ActionList();
            for (var i = 0; i < params.layerIDs.length; i++) {
                list1.putInteger(params.layerIDs[i]);
            }
            desc1.putList(charIDToTypeID("LyrI"), list1);
            executeAction(charIDToTypeID("move"), desc1, DialogModes.NO);
        } catch (e) {
            psconsole.log(e);
            return false;
        }
    },
    moveLayerToGroup: function (groupID, subID) {
        try {
            var layer = new Layer(groupID);
            var index = layer.index();
            var desc1 = new ActionDescriptor();
            var ref1 = new ActionReference();
            ref1.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            desc1.putReference(charIDToTypeID("null"), ref1);
            var ref2 = new ActionReference();
            ref2.putIndex(charIDToTypeID("Lyr "), index - 1);
            desc1.putReference(charIDToTypeID("T   "), ref2);
            desc1.putBoolean(charIDToTypeID("Adjs"), false);
            desc1.putInteger(charIDToTypeID("Vrsn"), 5);
            var list1 = new ActionList();
            list1.putInteger(subID);
            desc1.putList(charIDToTypeID("LyrI"), list1);
            executeAction(charIDToTypeID("move"), desc1, DialogModes.NO);
        } catch (e) {
            psconsole.log(e);
            return false;
        }
    },
    //从本地导入图层
    importImage: function (params) {
        try {
            var desc1 = new ActionDescriptor();
            desc1.putInteger(charIDToTypeID("Idnt"), 72);
            desc1.putPath(charIDToTypeID("null"), new File(params.filePath));
            desc1.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
            var desc2 = new ActionDescriptor();
            desc2.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), params.offsetX);
            desc2.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), params.offsetY);
            desc1.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), desc2);
            var descriptor = executeAction(charIDToTypeID("Plc "), desc1, DialogModes.NO);
            var descFlags = {
                reference: false,
                extended: false,
                maxRawLimit: 10000,
                maxXMPLimit: 100000,
                saveToFile: null
            };
            var descObject = descriptorInfo.getProperties(descriptor, descFlags);
            return JSON.stringify(descObject.generatorSettings, null, 4);
        } catch (e) {
            psconsole.log(e);
        }
    },
    importImage: function (filePath, offsetX, offsetY) {
        try {
            var desc1 = new ActionDescriptor();
            desc1.putInteger(charIDToTypeID("Idnt"), 72);
            desc1.putPath(charIDToTypeID("null"), new File(filePath));
            desc1.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
            var desc2 = new ActionDescriptor();
            desc2.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), offsetX);
            desc2.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), offsetY);
            desc1.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), desc2);
            var descriptor = executeAction(charIDToTypeID("Plc "), desc1, DialogModes.NO);
            var descFlags = {
                reference: false,
                extended: false,
                maxRawLimit: 10000,
                maxXMPLimit: 100000,
                saveToFile: null
            };
            var descObject = descriptorInfo.getProperties(descriptor, descFlags);
            return JSON.stringify(descObject.generatorSettings, null, 4);
        } catch (e) {
            psconsole.log(e);
        }
    },
    //移动图层位置大小
    transformLayer: function (params) {
        var desc1 = new ActionDescriptor();
        desc1.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
        var desc2 = new ActionDescriptor();
        desc2.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), params.offsetX);
        desc2.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), params.offsetY);
        desc1.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), desc2);
        desc1.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Prc"), params.scaleX);
        desc1.putUnitDouble(charIDToTypeID("Hght"), charIDToTypeID("#Prc"), params.scaleY);
        executeAction(charIDToTypeID("Trnf"), desc1, DialogModes.NO);
        return true;
    },
    transformLayer: function (offsetX, offsetY, scaleX, scaleY) {
        var desc1 = new ActionDescriptor();
        desc1.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
        var desc2 = new ActionDescriptor();
        desc2.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), offsetX);
        desc2.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), offsetY);
        desc1.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), desc2);
        desc1.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Prc"), scaleX);
        desc1.putUnitDouble(charIDToTypeID("Hght"), charIDToTypeID("#Prc"), scaleY);
        executeAction(charIDToTypeID("Trnf"), desc1, DialogModes.NO);
        return true;
    },
    //查
    //获取编组内所有子图层信息
    getLayersInGroup: function (layerID) {
        try {
            var layer = new Layer(layerID);
            var index = layer.index();
            var layers = [];
            var k = 2;
            try {
                activeDocument.backgroundLayer;
            } catch (e) {
                k = 1;
            }
            for (var i = index - k; i >= 1; i--) {
                var ref = new ActionReference();
                ref.putIndex(charIDToTypeID('Lyr '), i);
                var desc = executeActionGet(ref);
                var id = desc.getInteger(stringIDToTypeID('layerID'));
                var sub = new Layer(id);
                if (sub.kind() == 13) {
                    break;
                }
                var iLayer = {
                    name: sub.name(),
                    layerKind: sub.kind(),
                    id: sub.id,
                    index: sub.index(),
                    generatorSettings: sub.generatorSettings(),
                    bounds: sub.bounds(),
                }
                layers.push(iLayer);
            }
            return JSON.stringify(layers);
        } catch (e) {
            psconsole.log(e);
            return false;
        }
    },
    //根据ID获取Layers
    getLayersByIDs: function (layerIDs) {
        try {
            var layers = [];
            for (var i = 0; i < layerIDs.length; i++) {
                psconsole.log(layerIDs[i]);
                var layer = new Layer(layerIDs[i]);
                var iLayer = {
                    name: layer.name(),
                    layerKind: layer.kind(),
                    id: layer.id,
                    index: layer.index(),
                    generatorSettings: layer.generatorSettings(),
                    bounds: layer.bounds(),
                }
                layers.push(iLayer);
            }
            return JSON.stringify(layers);
        } catch (e) {
            psconsole.log(e);
            return false;
        }
    },
    //九宫格导入
    gridGenerat: function (params) {
        for (var i = 0; i < params.length; i++) {
            var importInfo = params[i];
            this.importImage(importInfo.imgDir, importInfo.offsetX, importInfo.offsetY);
            var activeLayer = app.activeDocument.activeLayer;
            this.moveLayerToGroup(importInfo.groupID, activeLayer.id);
        }
    },
    //九宫格形变
    gridDeformation: function (layerID) {
        try {
            var activeLayer = new Layer(layerID);
            var lStr = this.getActiveLayer();
            var l = JSON.parse(lStr);
            var bounds = l.bounds;
            psconsole.log(JSON.stringify(bounds));
            var generatorSettingsStr = activeLayer.generatorSettings();
            if (!generatorSettingsStr) {
                return false;
            }
            var generatorSettings = JSON.parse(generatorSettingsStr);
            var gridInfoStr = generatorSettings.comPosidonPSCep.gridInfo;
            if (!gridInfoStr) {
                return false;
            }
            psconsole.log(gridInfoStr)
            var gridInfo = JSON.parse(gridInfoStr);
            if (bounds.width == gridInfo.width && bounds.height == gridInfo.height) {
                return true;
            }
            //咱们先来计算中间的实际宽高
            var topleftRect, bottomLeftRect, topRightRect;
            for (var i = 0; i < gridInfo.grid.length; i++) {
                var g = gridInfo.grid[i];
                if (g.location === 'topLeft') {
                    topleftRect = g.rect;
                }
                if (g.location === 'bottomLeft') {
                    bottomLeftRect = g.rect;
                }
                if (g.location === 'topRight') {
                    topRightRect = g.rect;
                }
            }
            //实际宽高
            var theoryHeight = (bounds.height - topleftRect.height - bottomLeftRect.height);
            var theoryWidth = (bounds.width - topleftRect.width - topRightRect.width);
            var layersStr = this.getLayersInGroup(layerID);
            var layers = JSON.parse(layersStr);
            var k = 0;
            for (var k = 0; k < layers.length; k++) {
                var layer = layers[k];
                var grid;
                for (var i = 0; i < gridInfo.grid.length; i++) {
                    var g1 = gridInfo.grid[i];
                    if (g1.location === layer.name) {
                        grid = g1;
                    }
                }
                if (!grid) {
                    continue;
                }
                var layerObj = new Layer(layer.id);
                layerObj.select();
                layerObj.show();
                var subLayerBounds = layerObj.bounds();
                psconsole.log(subLayerBounds);
                if (grid.location === "topLeft") { }
                switch (grid.location) {
                    case "topLeft":
                        {
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height;
                            //缩放offset
                            var offsetX = (subLayerBounds.width - grid.validImageInfo.width) / 2;
                            var offsetY = (subLayerBounds.height - grid.validImageInfo.height) / 2;
                            //当前原点
                            var org = {
                                x: subLayerBounds.x + offsetX,
                                y: subLayerBounds.y + offsetY,
                            }
                            //理论位置
                            var theoryOrg = {
                                x: bounds.x + grid.validImageInfo.left,
                                y: bounds.y + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - org.x, theoryOrg.y - org.y, scaleX * 100, scaleY * 100);
                            break;
                        }
                    case "topMid":
                        {
                            if (theoryWidth <= 0) {
                                layerObj.hide();
                                break;
                            }
                            var actualScaleX = grid.validImageInfo.width / grid.rect.width;
                            var actualWidth = subLayerBounds.width / actualScaleX;
                            var scaleX = theoryWidth / actualWidth * 100;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + topleftRect.width + (grid.validImageInfo.left * (theoryWidth / grid.rect.width)),
                                y: bounds.y + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "topRight":
                        {
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width * 100;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + grid.validImageInfo.left + bounds.width - grid.rect.width,
                                y: bounds.y + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "midLeft":
                        {
                            //先宽高
                            //宽
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width * 100;
                            //高
                            if (theoryHeight <= 0) {
                                layerObj.hide();
                                break;
                            }
                            var actualScaleY = grid.validImageInfo.height / grid.rect.height;
                            var actualHeight = subLayerBounds.height / actualScaleY;
                            var scaleY = theoryHeight / actualHeight * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + grid.validImageInfo.left,
                                y: bounds.y + topleftRect.height + (grid.validImageInfo.top * (theoryHeight / grid.rect.height)),
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "midMid":
                        {
                            if (theoryHeight <= 0 || theoryWidth <= 0) {
                                layerObj.hide();
                                break;
                            }
                            var actualScaleX = grid.validImageInfo.width / grid.rect.width;
                            var actualWidth = subLayerBounds.width / actualScaleX;
                            var scaleX = theoryWidth / actualWidth * 100;
                            var actualScaleY = grid.validImageInfo.height / grid.rect.height;
                            var actualHeight = subLayerBounds.height / actualScaleY;
                            var scaleY = theoryHeight / actualHeight * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + topleftRect.width + (grid.validImageInfo.left * (theoryWidth / grid.rect.width)),
                                y: bounds.y + topleftRect.height + (grid.validImageInfo.top * (theoryHeight / grid.rect.height)),
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "midRight":
                        {
                            if (theoryHeight <= 0) {
                                layerObj.hide();
                                break;
                            }
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width * 100;
                            var actualScaleY = grid.validImageInfo.height / grid.rect.height;
                            var actualHeight = subLayerBounds.height / actualScaleY;
                            var scaleY = theoryHeight / actualHeight * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + bounds.width - grid.rect.width + grid.validImageInfo.left,
                                y: bounds.y + topleftRect.height + (grid.validImageInfo.top * (theoryHeight / grid.rect.height)),
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "bottomLeft":
                        {
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width * 100;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + grid.validImageInfo.left,
                                y: bounds.y + bounds.height - bottomLeftRect.height + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "bottomMid":
                        {
                            if (theoryWidth <= 0) {
                                layerObj.hide();
                                break;
                            }
                            var actualScaleX = grid.validImageInfo.width / grid.rect.width;
                            var actualWidth = subLayerBounds.width / actualScaleX;
                            var scaleX = theoryWidth / actualWidth * 100;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + topleftRect.width + (grid.validImageInfo.left * (theoryWidth / grid.rect.width)),
                                y: bounds.y + bounds.height - bottomLeftRect.height + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                    case "bottomRight":
                        {
                            var scaleX = grid.validImageInfo.width / subLayerBounds.width * 100;
                            var scaleY = grid.validImageInfo.height / subLayerBounds.height * 100;
                            this.transformLayer(0, 0, scaleX, scaleY);
                            var newBounds = layerObj.bounds();
                            var theoryOrg = {
                                x: bounds.x + grid.validImageInfo.left + bounds.width - grid.rect.width,
                                y: bounds.y + bounds.height - grid.rect.height + grid.validImageInfo.top,
                            }
                            this.transformLayer(theoryOrg.x - newBounds.x, theoryOrg.y - newBounds.y, 100, 100);
                            break;
                        }
                }
            }
            activeLayer.select();
            return true;
        } catch (e) {
            psconsole.log(e);
            return false;
        }

    },
    //合并调用方法组
    suspendHistory: function (params) {
        var historyName = params.historyName;
        psconsole.log(historyName);
        var functionName = params.functionName;
        psconsole.log(functionName);
        var functionParam = params.functionParam;
        psconsole.log(functionParam);
        if (typeof (functionParam) === 'object') {
            functionParam = JSON.stringify(functionParam);
        }
        app.activeDocument.suspendHistory(historyName, 'this.' + functionName + '(' + functionParam + ')');
    },
    //获取当前活动图层信息
    getActiveLayer: function () {
        var activeLayer = app.activeDocument.activeLayer;
        var l = new Layer(activeLayer.id);
        const boundsUninArray = activeLayer.bounds;
        const bounds = {
            x: boundsUninArray[0].value,
            y: boundsUninArray[1].value,
            width: boundsUninArray[2].value - boundsUninArray[0].value,
            height: boundsUninArray[3].value - boundsUninArray[1].value,
        }
        const layer = {
            name: activeLayer.name,
            id: activeLayer.id,
            layerKind: l.kind(),
            index: l.index(),
            generatorSettings: l.generatorSettings(),
            bounds: bounds,
        }
        return JSON.stringify(layer);
    },
    //文档
    //获取当前活动文档信息
    getActiveDocument: function () {
        const activeDocument = app.activeDocument;
        const document = {
            name: activeDocument.name,
            id: activeDocument.id,
            width: activeDocument.width.value,
            height: activeDocument.height.value,
        }
        return JSON.stringify(document);
    },
    //获取当前Photoshop的interpolation信息
    getPhotoshopPreferencesInterpolation: function () {
        var interpolation = app.preferences.interpolation;
        return interpolation;
    },
    setPhotoshopPreferencesInterpolation: function (resampleMethod) {
        psconsole.log(resampleMethod);
        app.preferences.interpolation = resampleMethod;
        return true;
    },
    //文档瘦身
    documentSlimming: function () {
        try {
            psconsole.log("文档瘦身");
            psconsole.log(psDeepCleaner);
            psDeepCleaner.start();
        } catch (e) {
            psconsole.log(e);
        }

    },
    //获取文档分辨率
    getDocumentResolution: function () {
        return app.activeDocument.resolution;
    },
};
function openImage(params) {
    var path = params.path;
    psconsole.log(path);
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
        psconsole.log(error);
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
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("boundsNoEffects"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var layerDescriptor = executeActionGet(layerReference);
    var rectangle = layerDescriptor.getObjectValue(stringIDToTypeID("boundsNoEffects"));
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
    return JSON.stringify(descObject.generatorSettings, null, 4);
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