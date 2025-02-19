import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React from "react";
import { forwardRef } from "react";
import { ResourceSynchronization, ResourceSynchronizationRef } from "./component/ResourceSynchronization";
import { CuttingToolPage, CuttingToolPageRef } from "./component/cuttingTool/CuttingTool";

type CuttingProps = {
}
type CuttingRefType = {
};
export const CuttingRef = React.createRef<CuttingRefType>();
export const Cutting = forwardRef<CuttingRefType, CuttingProps>((props, ref) => {
    return (
        <PsFunc>
            <PsFuncItem id={"cutting-tool"} title={('切图工具')}>
                <CuttingToolPage ref={CuttingToolPageRef}></CuttingToolPage>
            </PsFuncItem>
            <PsFuncItem id={"resource-synchronization"} title={('资源同步')}>
                <ResourceSynchronization ref={ResourceSynchronizationRef}></ResourceSynchronization>
            </PsFuncItem>
        </PsFunc>
    );
})