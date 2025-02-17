import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React from "react";
import { forwardRef } from "react";
import { DocumentSlimming } from "./component/DocumentSlimming";

type CleanProps = {
}
type CleanRefType = {
};
export const CleanRef = React.createRef<CleanRefType>();
export const Clean = forwardRef<CleanRefType, CleanProps>((props, ref) => {
    return (
        <PsFunc>
            <PsFuncItem id={"document-slimming"} title={('PSD瘦身')}>
                <DocumentSlimming ref={DocumentSlimming}></DocumentSlimming>
            </PsFuncItem>
        </PsFunc>
    );
})