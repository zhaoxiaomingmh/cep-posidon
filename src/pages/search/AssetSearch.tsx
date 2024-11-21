import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
interface AssetSearchProps {

}
interface AssetSearchRefType {

};
export const AssetSearchRef = React.createRef<AssetSearchRefType>();
export const AssetSearch = forwardRef<AssetSearchRefType, AssetSearchProps>((props, ref) => {

    return (
        <PsFunc>
            <PsFuncItem id={"func1"} title="func1">
                <div>这是测试1的页面 </div>
            </PsFuncItem>
            <PsFuncItem id={"func2"} title="func2">
                <div>这是测试2的页面 </div>
            </PsFuncItem>
        </PsFunc>
    );
})