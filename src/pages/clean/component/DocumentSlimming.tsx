import { forwardRef } from "react";
import React from "react";
import './documentSlimming.scss';
import psHandler from "@/service/handler";
import useUserStore from "@/store/modules/userStore";
import { IFunctionName } from "@/store/iTypes/iTypes";
import iService from "@/service/service";
type DocumentSlimmingProps = {
}
type DocumentSlimmingRefType = {
};

export const DocumentSlimming = forwardRef<DocumentSlimmingRefType, DocumentSlimmingProps>((props, ref) => {
    const project = useUserStore(state => state.getProject());
    const user = useUserStore(state => state.getUser());
    
    const documentSlimming = async () => {
        await iService.increaseFunctionCoutn(IFunctionName.psdDeepClean, project.id, project.name, user.id);
        await psHandler.documentSlimming();
    }

    return (
        <div className="document-slimming-container">
            <div className="doc-preview">
                <span>预览图施工中...</span>
            </div>
            <div className="doc-slimming-footer">
                <button onClick={() => {
                    if (confirm("开始瘦身？过程会比较慢，请耐心等待")) {
                        documentSlimming();
                    }
                }}>一键瘦身</button>
            </div>
        </div>)
})