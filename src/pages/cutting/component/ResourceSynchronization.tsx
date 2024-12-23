import useDocumentStore from "@/store/modules/documentStore";
import React from "react";
import { forwardRef } from "react";
import './rs.scss'
import { PsInput } from "@/hooks/input/PsInput";
import { PsAction } from "@/hooks/button/PsAction";
import psHandler from "@/service/handler";

type ResourceSynchronizationProps = {
}
type ResourceSynchronizationRefType = {
};
export const ResourceSynchronizationRef = React.createRef<ResourceSynchronizationRefType>();
export const ResourceSynchronization = forwardRef<ResourceSynchronizationRefType, ResourceSynchronizationProps>((props, ref) => {

    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const [figmaId, setFigmaId] = React.useState<string>(undefined);
    const entryFigmaId = (value) => {
        setFigmaId(value)
    }
    const test = () => {
        psHandler.getLayerInfoByID(-1, "generatorSettings").then((result) => { })
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
                        <span >FigmaId:</span>
                    </div>
                    <PsInput callback={entryFigmaId} value={figmaId} placeholder="请输入Figma节点ID">
                        <PsAction >
                            <img src="../cep-posidon/src/asset/svg/pensou.svg"></img>
                        </PsAction>
                    </PsInput>
                </div>
            </div>
            <div className="rs-group-tree-box">
                <span>当前文件已绑定编组</span>
            </div>
            <div className="rs-footer" >
                <PsInput placeholder="点击下方按钮生成新的链接" disabled={true} >
                    <PsAction callback={test}>
                        <img src="../cep-posidon/src/asset/svg/paste.svg"></img>
                    </PsAction>
                </PsInput>
            </div>
        </div>
    );
})