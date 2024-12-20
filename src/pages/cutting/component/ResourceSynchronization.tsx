import useDocumentStore from "@/store/modules/documentStore";
import React from "react";
import { forwardRef } from "react";
import './rs.scss'
import { PsInput } from "@/hooks/input/PsInput";
import { PsAction } from "@/hooks/button/PsAction";

type ResourceSynchronizationProps = {
}
type ResourceSynchronizationRefType = {
};
export const ResourceSynchronizationRef = React.createRef<ResourceSynchronizationRefType>();
export const ResourceSynchronization = forwardRef<ResourceSynchronizationRefType, ResourceSynchronizationProps>((props, ref) => {

    const activeLayer = useDocumentStore(state => state.getActiveLayer());

    return (
        <div className="resource-synchronization-container">
            <div className="layer-select-box">
                <span>当前选中图层信息</span>
                <div className="layer-info-item" style={{ display: "flex", alignItems: "center" }}>
                    <div className="layer-select-box-title">
                        <span>名称:</span>
                    </div>
                    <span style={{
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>{activeLayer?.name}</span>
                </div>
                <div className="layer-info-item">
                    <div className="layer-select-box-title">
                        <span >FigmaId:</span>
                    </div>
                    <PsInput >
                        <PsAction >
                            <img src="../cep-posidon/src/asset/svg/pensou.svg" style={{ paddingRight: "10px" }}></img>
                        </PsAction>
                    </PsInput>
                </div>
            </div>
        </div>
    );
})