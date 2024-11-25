import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ImageSearchImage, ImageSearchImageRef } from "./component/ImageSearchImage";
import { useTranslation } from "react-i18next";
import { TextSearchImage, TextSearchImageRef } from "./component/TextSearchImage";
interface AssetSearchProps {

}
interface AssetSearchRefType {

};
export const AssetSearchRef = React.createRef<AssetSearchRefType>();
export const AssetSearch = forwardRef<AssetSearchRefType, AssetSearchProps>((props, ref) => {

    const { t, i18n } = useTranslation();

    return (
        <PsFunc>
            <PsFuncItem id={"image-search"} title={t('asset_search.lable1')}>
                <ImageSearchImage ref={ImageSearchImageRef}></ImageSearchImage>
            </PsFuncItem>
            <PsFuncItem id={"text-search"} title="语义搜索">
                <TextSearchImage ref={TextSearchImageRef}></TextSearchImage>
            </PsFuncItem>
        </PsFunc>
    );
})