import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ImageSearchImage, ImageSearchImageRef } from "./component/ImageSearchImage";
interface AssetSearchProps {

}
interface AssetSearchRefType {

};
export const AssetSearchRef = React.createRef<AssetSearchRefType>();
export const AssetSearch = forwardRef<AssetSearchRefType, AssetSearchProps>((props, ref) => {
    return (
        <PsFunc>
            <PsFuncItem id={"image-search"} title="图片搜索">
                <ImageSearchImage ref={ImageSearchImageRef}></ImageSearchImage>
            </PsFuncItem>
            <PsFuncItem id={"text-search"} title="语义搜索">
                <div>这是测试2的页面 </div>
            </PsFuncItem>
        </PsFunc>
    );
})