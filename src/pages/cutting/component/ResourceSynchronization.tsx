import useDocumentStore from "@/store/modules/documentStore";
import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import './rs.scss'
import { PsInput } from "@/hooks/input/PsInput";
import { PsAction } from "@/hooks/button/PsAction";
import psHandler from "@/service/handler";
import { IFigmaUrlSettings } from "@/store/iTypes/iTypes";

type ResourceSynchronizationProps = {
}
type ResourceSynchronizationRefType = {
};

export const ResourceSynchronizationRef = React.createRef<ResourceSynchronizationRefType>();
export const ResourceSynchronization = forwardRef<ResourceSynchronizationRefType, ResourceSynchronizationProps>((props, ref) => {

    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const [figmaSettings, setFigmaSettings] = useState<IFigmaUrlSettings>(undefined);
    const [figmaId, setFigmaId] = useState<string>(undefined);
    useEffect(() => {
        refreshFigmaSettings();
    }, [])
    const refreshFigmaSettings = () => {
        psHandler.getDocGeneratorSettings().then((gerJson) => {
            console.log('gerJson', gerJson)
            const posidonCep = gerJson["generatorSettings"]["posidonCep"];
            if (posidonCep) {
                const figmaUrlSettings: IFigmaUrlSettings = {
                    resourceSynchronizationURL: posidonCep["ResourceSynchronizationURL"] ?? "",
                    resourceSynchronizationTime: posidonCep["resourceSynchronizationTime"] ?? "",
                    resourceSynchronizationTimeStamp: posidonCep["resourceSynchronizationTimeStamp"] ?? ""
                }
                console.log('figmaUrlSettings', figmaUrlSettings)
                setFigmaSettings(figmaUrlSettings);
            }
        })
    }
    const entryFigmaId = (value) => {
        setFigmaId(value)
    }
    return (
        <div className="resource-synchronization-container">
            <div className="rs-layer-select-box">
                <span>当前选中图层信息</span>
                <div className="rs-layer-info-item" style={{ display: "flex", alignItems: "center" }}>
                    <div className="rs-layer-select-title">
                        <span>名称:</span>
                    </div>
                    <span style={{
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>{activeLayer?.name}</span>
                </div>
                <div className="rs-layer-info-item">
                    <div className="rs-layer-select-title">
                        <span >关联ID:</span>
                    </div>
                    <PsInput callback={entryFigmaId} value={figmaId} placeholder="请输入Figma节点ID">
                        <PsAction>
                            <img src="../cep-posidon/src/asset/svg/pensou.svg"></img>
                        </PsAction>
                    </PsInput>
                </div>
            </div>
            <div className="rs-group-tree-box">
                <span>当前文件已绑定编组</span>
                <div className="rs-tree-view">
                </div>
            </div>
            <div className="rs-footer" >
                <PsInput placeholder="点击下方按钮生成切图" callback={() => { }} value={figmaSettings?.resourceSynchronizationURL} disabled={true} >
                    <PsAction callback={() => { }} disabled={true}>
                        <img src="../cep-posidon/src/asset/svg/paste.svg"></img>
                    </PsAction>
                </PsInput> 
                <button className="rs-footer-button" onClick={() => {
                    psHandler.getAllLayerList();
                }}> 
                    同步所选编组
                </button>
            </div>
        </div>
    );
})