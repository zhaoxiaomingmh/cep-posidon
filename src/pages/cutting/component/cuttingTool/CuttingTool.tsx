import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import './cuttingTool.scss';
import { ICuttingType, IGeneratorSettingsObj, ILayer, IStatus } from "@/store/iTypes/iTypes";
import psHandler from "@/service/handler";
import useDocumentStore from "@/store/modules/documentStore";
import { ExportDialog, ExportDialogRef } from "./ExportDialog";

type CuttingToolPageProps = {
}
type CuttingToolPageRefType = {
};

export const CuttingToolPageRef = React.createRef<CuttingToolPageRefType>();
export const CuttingToolPage = forwardRef<CuttingToolPageRefType, CuttingToolPageProps>((props, ref) => {

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
    }
    //新增选中资源
    const addCheckedLayer = async () => {
        if (checkedItem || !activeLayer) return;
        if (checkedList.findIndex(item => item.id === activeLayer.id) !== -1) return;
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
    const removeCheckedLayer = async () => {
        if (!checkedItem) return;
        const currentLayer: ILayer[] = await psHandler.getLayersByIDs([checkedItem.id]);
        let layerGS = JSON.parse(currentLayer[0].generatorSettings) ?? {};
        let layerPosidon = layerGS.comPosidonPSCep ?? {};
        delete layerPosidon.cuttingToolCuttingType;
        if (layerPosidon.cuttingToolWidth) delete layerPosidon.cuttingToolWidth;
        if (layerPosidon.cuttingToolHeight) delete layerPosidon.cuttingToolHeight;
        if (layerPosidon.cuttingToolMultiple) delete layerPosidon.cuttingToolMultiple;
        await psHandler.setLayerGeneratorSettings(checkedItem.id, layerPosidon);

        const layers = checkedList.filter(item => item.id !== checkedItem.id);
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
    //任务模块
    const [status, setStatus] = useState<IStatus>(IStatus.wait);
    const [percentage, setPercentage] = useState<number>(0);

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
                                            <span>{layer.name}</span>
                                        </div>);
                                })
                            }
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
                        className="cutting-tool-page-list-options-sliding-window-item"
                        style={{
                            backgroundColor: cuttingType === ICuttingType.fixedSize ? "rgba(255, 255, 255, 0.1)" : undefined,
                        }}
                        onClick={() => { setCuttingType(ICuttingType.fixedSize) }}>
                        <span>固定尺寸</span>
                    </div>
                    <div
                        className="cutting-tool-page-list-options-sliding-window-item"
                        style={{
                            backgroundColor: cuttingType === ICuttingType.multipleSize ? "rgba(255, 255, 255, 0.1)" : undefined,
                        }}
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
                                        setWidth(value);
                                    }}></input>
                            </div>
                            <div className="symbol-item">
                                X
                            </div>
                            <div className="input-item1" >
                                <input type="number"
                                    placeholder="100"
                                    value={height == undefined ? '' : height}
                                    onChange={(event) => {
                                        const value = parseFloat(event.target.value);
                                        setHeight(value);
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
                                        setMultiple(value);
                                    }}></input>
                            </div>
                            <div className="symbol-item">
                                倍数
                            </div>
                        </div>
                    }
                </div>
                {
                    checkedItem ?
                        <div className="frame-15614">
                            <button
                                onClick={() => { removeCheckedLayer() }}>删除标记</button>
                            <button onClick={() => {
                                ExportDialogRef?.current?.show();
                            }}>全部导出</button>
                            <button >修改标记</button>
                        </div>
                        :
                        <div className="frame-15614">
                            <button onClick={() => { addCheckedLayer() }}>标记为新增资源</button>
                        </div>
                }
            </div>
            {
                <ExportDialog
                    ref={ExportDialogRef}
                    percentage={percentage}
                ></ExportDialog>
            }
        </div >
    );
})