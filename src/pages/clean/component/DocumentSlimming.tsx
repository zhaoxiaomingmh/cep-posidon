import { forwardRef } from "react";
import React from "react";
import './documentSlimming.scss';
import psHandler from "@/service/handler";
type DocumentSlimmingProps = {
}
type DocumentSlimmingRefType = {
};

export const DocumentSlimming = forwardRef<DocumentSlimmingRefType, DocumentSlimmingProps>((props, ref) => {

    const documentSlimming = async () => {
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