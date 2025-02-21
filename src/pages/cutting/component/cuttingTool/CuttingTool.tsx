import React, { useEffect, useImperativeHandle, useState } from "react";
import { forwardRef } from "react";
import './cuttingTool.scss';
import { ICuttingToolExportParams, ICuttingToolLayer, ICuttingType, IGeneratorAction, IGeneratorSettingsObj, IHorizontal, ILayer, IStatus, IVertical, IWaitIte, LayerKind } from "@/store/iTypes/iTypes";
import psHandler from "@/service/handler";
import useDocumentStore from "@/store/modules/documentStore";
import { ExportDialog, ExportDialogRef } from "./ExportDialog";
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'

type CuttingToolPageProps = {
}
type CuttingToolPageRefType = {
    refreshExportTaskStatus: (status: IStatus, layerId: number) => void
};

export const CuttingToolPageRef = React.createRef<CuttingToolPageRefType>();
export const CuttingToolPage = forwardRef<CuttingToolPageRefType, CuttingToolPageProps>((props, ref) => {

    useImperativeHandle(ref, () => {
        return {
            refreshExportTaskStatus: refreshExportTaskStatus,
        }
    })

    //ps数据
    const doc = useDocumentStore(state => state.getActiveDocument());
    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    useEffect(() => {
        if (!activeLayer) return;
        if (checkedList?.findIndex(item => item.id === activeLayer.id) !== -1) {
            checkNewLayer(activeLayer);
        } else {
            setCheckedItem(undefined);
        }
    }, [activeLayer])

    //已选中资源
    const [checkedList, setCheckedList] = useState<ILayer[]>([]);
    const [checkedItem, setCheckedItem] = useState<ILayer>(undefined);
    const checkNewLayer = async (layer: ILayer) => {
        if (checkedItem?.id !== layer.id) {
            setCheckedItem(layer)
            const layers = await psHandler.getLayersByIDs([layer.id]);
            const currentLayer = layers[0];
            let generaterSettings = JSON.parse(currentLayer.generatorSettings) ?? {};
            let layerPosidon = generaterSettings.comPosidonPSCep ?? {};
            if (layerPosidon.cuttingToolWidth) setWidth(parseFloat(layerPosidon.cuttingToolWidth));
            if (layerPosidon.cuttingToolHeight) setHeight(parseFloat(layerPosidon.cuttingToolHeight));
            if (layerPosidon.cuttingToolMultiple) setMultiple(parseFloat(layerPosidon.cuttingToolMultiple));
            if (layerPosidon.cuttingToolCuttingType) setCuttingType(layerPosidon.cuttingToolCuttingType);
            await psHandler.selectLayer(layer.id);
        }
    }
    useEffect(() => {
        init();
    }, [doc])
    const init = async () => {
        //获取已选中资源
        const docGeneratorSettings = await psHandler.getDocGeneratorSettings();
        if (docGeneratorSettings?.comPosidonPSCep) {
            const comPosidonPSCep: IGeneratorSettingsObj = docGeneratorSettings.comPosidonPSCep;
            const markIds = JSON.parse(comPosidonPSCep.cuttingToolMarkIds) as number[];
            if (markIds?.length > 0) {
                const layers = await psHandler.getLayersByIDs(markIds);
                setCheckedList(layers);
            }
        }
        setSuccessList([]);
        setFailList([]);
        setPercentage(0);
    }
    //新增选中资源
    const addCheckedLayer = async () => {
        if (checkedItem || !activeLayer) return;
        if (activeLayer.layerKind === LayerKind.adjustment) {
            alert('调整图层不可标记');
            return;
        }
        if (checkedList.findIndex(item => item.id === activeLayer.id) !== -1) return;
        setSuccessList([]);
        setFailList([]);
        setPercentage(0);
        //需要确定的是是否要加参数
        const currentLayer = await psHandler.getActiveLayer();
        let layerGS = JSON.parse(currentLayer.generatorSettings) ?? {};
        let layerPosidon = layerGS.comPosidonPSCep ?? {};
        if (cuttingType === ICuttingType.fixedSize) {
            if (width != undefined && height != undefined && !Number.isNaN(width) && !Number.isNaN(height)) {
                layerPosidon.cuttingToolCuttingType = ICuttingType.fixedSize;
                layerPosidon.cuttingToolWidth = width;
                layerPosidon.cuttingToolHeight = height;
                await psHandler.setLayerGeneratorSettings(activeLayer.id, layerPosidon);
            }
        } else {
            if (multiple != undefined && !Number.isNaN(multiple)) {
                layerPosidon.cuttingToolCuttingType = ICuttingType.multipleSize;
                layerPosidon.cuttingToolMultiple = multiple;
                await psHandler.setLayerGeneratorSettings(activeLayer.id, layerPosidon);
            }
        }
        setCheckedList([...checkedList, activeLayer]);
        setCheckedItem(activeLayer);
        let ids = checkedList.map(item => item.id);
        ids.push(activeLayer.id);
        const docGeneratorSettings = await psHandler.getDocGeneratorSettings();
        let comPosidonPSCep: IGeneratorSettingsObj = docGeneratorSettings.comPosidonPSCep ?? {};
        comPosidonPSCep.cuttingToolMarkIds = JSON.stringify(ids);
        await psHandler.setDocGeneratorSettings(comPosidonPSCep);
    }
    //删除选中资源
    const removeCheckedLayer = async (layer: ILayer) => {
        if (status === IStatus.loading) return;
        console.log('removeCheckedLayer', layer)
        const currentLayer: ILayer[] = await psHandler.getLayersByIDs([layer.id]);
        let layerGS = JSON.parse(currentLayer[0].generatorSettings) ?? {};
        let layerPosidon = layerGS.comPosidonPSCep ?? {};
        delete layerPosidon.cuttingToolCuttingType;
        if (layerPosidon.cuttingToolWidth) delete layerPosidon.cuttingToolWidth;
        if (layerPosidon.cuttingToolHeight) delete layerPosidon.cuttingToolHeight;
        if (layerPosidon.cuttingToolMultiple) delete layerPosidon.cuttingToolMultiple;
        await psHandler.setLayerGeneratorSettings(layer.id, layerPosidon);

        const layers = checkedList.filter(item => item.id !== layer.id);
        setCheckedList(layers);
        setCheckedItem(undefined);
        let ids = layers.map(item => item.id);
        const docGeneratorSettings = await psHandler.getDocGeneratorSettings();
        const comPosidonPSCep: IGeneratorSettingsObj = docGeneratorSettings.comPosidonPSCep ?? {};
        comPosidonPSCep.cuttingToolMarkIds = JSON.stringify(ids);
        await psHandler.setDocGeneratorSettings(comPosidonPSCep);
    }
    //切图方式
    const [cuttingType, setCuttingType] = useState<ICuttingType>(ICuttingType.fixedSize);
    //切图参数
    const [width, setWidth] = useState<number>(undefined);
    const [height, setHeight] = useState<number>(undefined);
    const [multiple, setMultiple] = useState<number>(undefined);
    // 修改任务参数
    const updateLayerCuttingParma = async () => {
        if (!checkedItem) { return; }
        const layers = await psHandler.getLayersByIDs([checkedItem.id])
        const layer = layers[0];
        let layerGS = JSON.parse(layer.generatorSettings) ?? {};
        let layerPosidon = layerGS.comPosidonPSCep ?? {};
        layerPosidon.cuttingToolCuttingType = cuttingType;
        if (cuttingType === ICuttingType.fixedSize) {
            if (width != undefined && height != undefined && !Number.isNaN(width) && !Number.isNaN(height) && width !== 0 && height !== 0) {
                layerPosidon.cuttingToolWidth = width;
                layerPosidon.cuttingToolHeight = height;
                if (layerPosidon.multiple) delete layerPosidon.multiple;
            } else {
                delete layerPosidon.cuttingToolCuttingType;
                if (layerPosidon.multiple) delete layerPosidon.multiple;
                if (layerPosidon.cuttingToolWidth) delete layerPosidon.cuttingToolWidth;
                if (layerPosidon.cuttingToolHeight) delete layerPosidon.cuttingToolHeight;
            }
        } else {
            if (multiple != undefined && !Number.isNaN(multiple) && multiple !== 0) {
                layerPosidon.cuttingToolMultiple = multiple;
                if (layerPosidon.cuttingToolWidth) delete layerPosidon.cuttingToolWidth;
                if (layerPosidon.cuttingToolHeight) delete layerPosidon.cuttingToolHeight;
            } else {
                delete layerPosidon.cuttingToolCuttingType;
                if (layerPosidon.multiple) delete layerPosidon.multiple;
                if (layerPosidon.cuttingToolWidth) delete layerPosidon.cuttingToolWidth;
                if (layerPosidon.cuttingToolHeight) delete layerPosidon.cuttingToolHeight;
            }
        }
        await psHandler.setLayerGeneratorSettings(layer.id, layerPosidon);
        alert('修改成功');
    }
    //任务模块
    const [status, setStatus] = useState<IStatus>(IStatus.success);
    const [successList, setSuccessList] = useState<number[]>([]);
    const [failList, setFailList] = useState<number[]>([]);
    const [percentage, setPercentage] = useState<number>(0);

    //开始导出任务
    const startExport = async (localPath: string) => {
        if (checkedList.length === 0 || !localPath || status === IStatus.loading) return;
        setStatus(IStatus.loading);
        setSuccessList([]);
        setFailList([]);
        setPercentage(0);
        //组装导出参数
        const resolution = await psHandler.getDocumentResolution();
        let exportParams: ICuttingToolExportParams = {
            path: localPath,
            resolution: parseFloat(resolution),
            layers: []
        };
        let ids = checkedList.map((layer) => { return layer.id });
        const layers = await psHandler.getLayersByIDs(ids)
        layers.map((layer) => {
            //获取图层原生参数
            let layerGS = JSON.parse(layer.generatorSettings) ?? {};
            let layerPosidon = layerGS.comPosidonPSCep ?? {};
            //获取切图参数
            let cuttingType = layerPosidon.cuttingToolCuttingType;
            let cuttingWidth = layerPosidon.cuttingToolWidth;
            let cuttingHeight = layerPosidon.cuttingToolHeight;
            let cuttingMultiple = layerPosidon.cuttingToolMultiple;
            //多种情况分别处理
            let cuttingLayer: ICuttingToolLayer = {
                layerId: layer.id,
                name: layer.name,
                isNative: cuttingType ? false : true,
                horizontal: IHorizontal.twoWay,
                vertical: IVertical.twoWay,
            }
            if (cuttingType) {
                cuttingLayer.cuttingType = cuttingType;
                if (cuttingType == ICuttingType.fixedSize) {
                    cuttingLayer.width = parseFloat(cuttingWidth);
                    cuttingLayer.height = parseFloat(cuttingHeight);
                } else {
                    cuttingLayer.multiple = parseFloat(cuttingMultiple);
                }
            }
            exportParams.layers.push(cuttingLayer);
        })

        //开始导出 to生成器
        psHandler.sendToGenerator({
            from: "com.posidon.cep.panel",
            action: IGeneratorAction.cuttingToolExport,
            data: exportParams
        })
    }

    //刷新任务状态
    const refreshExportTaskStatus = (taskStatus: IStatus, layerId: number) => {
        if (!checkedList.some(item => item.id === layerId)) return;
        if (taskStatus === IStatus.success) {
            if (!successList.includes(layerId)) {
                setSuccessList([...successList, layerId]);
            }
        } else {
            if (!failList.includes(layerId)) {
                setFailList([...failList, layerId]);
            }
        }
    }

    useEffect(() => {
        const count = successList.length + failList.length;
        let per = Math.round(count / checkedList.length * 100);
        per = per > 100 ? 100 : per;
        setPercentage(per);
        if (status === IStatus.loading && count === checkedList.length) {
            setStatus(IStatus.success);
            alert("图片导出成功");
        }
    }, [failList, successList])
    return (
        <div className="cutting-tool-page" >
            <div className="cutting-tool-page-list-container">
                <div className="cutting-tool-page-list-header">
                    <div className="cutting-tool-page-list-header-title">
                        <span>已标记资源</span>
                    </div>
                </div>
                <div className="cutting-tool-page-list-box">
                    {
                        checkedList?.length > 0
                        &&
                        <div className="cutting-tool-page-list-table">
                            <PerfectScrollbar >
                                {
                                    checkedList?.map((layer, index) => {
                                        return (
                                            <div className="cutting-tool-page-list-item"
                                                key={index}
                                                onClick={() => {
                                                    checkNewLayer(layer);
                                                }}
                                                style={{
                                                    backgroundColor: checkedItem?.id === layer.id ? "#1472e6" : undefined,
                                                    color: checkedItem?.id === layer.id ? "#ffffff" : undefined,
                                                }}
                                            >
                                                <div className="item-label">
                                                    <span title={layer.name}>{layer.name}</span>
                                                    {
                                                        successList.includes(layer.id)
                                                        &&
                                                        <img style={{ margin: "0px 5px", width: 14, height: 14 }} src="./dist/static/images/svg/success.svg"></img>
                                                    }
                                                    {
                                                        failList.includes(layer.id)
                                                        &&
                                                        <img style={{ margin: "0px 5px", width: 14, height: 14 }} src="./dist/static/images/svg/fail.svg"></img>
                                                    }
                                                </div>

                                                <div className="icon-fork" onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    if (confirm("确定删除?")) {
                                                        removeCheckedLayer(layer);
                                                    }
                                                }}>
                                                    <img src="./dist/static/images/svg/fork.svg"></img>
                                                </div>
                                            </div>);
                                    })
                                }
                            </PerfectScrollbar>
                        </div>
                    }
                    {
                        checkedList?.length === 0
                        &&
                        <div className="cutting-tool-page-list-empty">
                            <span>暂无资源</span>
                        </div>
                    }
                </div>
            </div>
            <div className="cutting-tool-page-list-vector"></div>
            <div className="cutting-tool-page-list-options">
                <div className="cutting-tool-page-list-options-sliding-window">
                    <div
                        className={`cutting-tool-page-list-options-sliding-window-item ${cuttingType === ICuttingType.fixedSize?'selected':''}`}
                        onClick={() => { setCuttingType(ICuttingType.fixedSize) }}>
                        <span>固定尺寸</span>
                    </div>
                    <div
                        className={`cutting-tool-page-list-options-sliding-window-item ${cuttingType === ICuttingType.multipleSize?'selected':''}`}
                        onClick={() => { setCuttingType(ICuttingType.multipleSize) }}>
                        <span>倍数尺寸</span>
                    </div>
                </div>
                <div className="frame-15618">
                    {
                        cuttingType === ICuttingType.fixedSize
                        &&
                        <div className="arithmetic-input-box">
                            <div className="input-item1">
                                <input type="number"
                                    placeholder="100"
                                    value={width == undefined ? '' : width}
                                    onChange={(event) => {
                                        const value = parseFloat(event.target.value);
                                        if (value >= 0 || Number.isNaN(value)) {
                                            setWidth(Math.round(value));
                                        }
                                    }}></input>
                            </div>
                            <div className="symbol-item">
                                ×
                            </div>
                            <div className="input-item1" >
                                <input type="number"
                                    placeholder="100"
                                    value={height == undefined ? '' : height}
                                    onChange={(event) => {
                                        const value = parseFloat(event.target.value);
                                        if (value >= 0 || Number.isNaN(value)) {
                                            setHeight(Math.round(value));
                                        }
                                    }}></input>
                            </div>
                            <div className="symbol-item">
                                PX
                            </div>
                        </div>
                    }
                    {
                        cuttingType === ICuttingType.multipleSize
                        &&
                        <div className="arithmetic-input-box">
                            <div className="input-item1">
                                <input type="number"
                                    placeholder="2"
                                    value={multiple == undefined ? '' : multiple}
                                    onChange={(event) => {
                                        const value = parseFloat(event.target.value);
                                        if (value >= 0 || Number.isNaN(value)) {
                                            setMultiple(Math.round(value));
                                        }
                                    }}></input>
                            </div>
                            <div className="symbol-item">
                                倍数
                            </div>
                        </div>
                    }
                </div>

                <div className="frame-15614">
                    <button onClick={() => {
                        ExportDialogRef?.current?.show();
                    }}>全部导出</button>
                    {
                        checkedItem ?
                            <button
                                onClick={() => { updateLayerCuttingParma() }}
                                disabled={status === IStatus.loading ? true : false}
                                style={{
                                    backgroundColor: "#1472e6",
                                    border: "0px"
                                }}
                            >修改标记</button>
                            :
                            <button
                                onClick={() => { addCheckedLayer() }}
                                disabled={status === IStatus.loading ? true : false}
                                style={{
                                    backgroundColor: "#1472e6",
                                    border: "0px"
                                }}
                            >标记为新增资源</button>
                    }


                </div>

            </div>
            {
                <ExportDialog
                    ref={ExportDialogRef}
                    percentage={percentage}
                    startExport={startExport}
                ></ExportDialog>
            }
        </div >
    );
})