import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React, { useEffect, useState } from "react";
import { forwardRef } from "react";
import { ResourceSynchronization, ResourceSynchronizationRef } from "./component/ResourceSynchronization";
import { CuttingToolPage, CuttingToolPageRef } from "./component/cuttingTool/CuttingTool";
import { CuttingSetting } from "./component/cuttingSetting/CuttingSetting";

type CuttingProps = {
}
type CuttingRefType = {
};
export const CuttingRef = React.createRef<CuttingRefType>();
export const Cutting = forwardRef<CuttingRefType, CuttingProps>((props, ref) => {

    const [func, setFunc] = useState<string>('cutting-tool');

    return (
        <PsFunc>
            <PsFuncItem id={"cutting-tool"} title={('切图工具')}>
                <CuttingToolPage ref={CuttingToolPageRef}></CuttingToolPage>
            </PsFuncItem>
            <PsFuncItem id={"resource-synchronization"} title={('资源同步')}>
                <ResourceSynchronization ref={ResourceSynchronizationRef}></ResourceSynchronization>
            </PsFuncItem>
            <PsFuncItem id={"cutting-option"} title={('...')} right={true}>
                <CuttingSetting ref={CuttingRef} func={func} ></CuttingSetting>
            </PsFuncItem>
        </PsFunc>
    );
})