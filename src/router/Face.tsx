import { forwardRef } from "react"
import './Face.scss'
import { PsTable } from "@/hooks/table/PsTable";
import { PsTableItem } from "@/hooks/table/PsTableItem";
import React from 'react';
import { AssetSearch, AssetSearchRef } from "@/pages/search/AssetSearch";
import { Settings, SettingsRef } from "@/pages/settings/Settings";
import { PsdLevel, PsdLevelRef } from "@/pages/level/PsdLevel";
import '@/asset/iconfont/font.css'
import '../asset/svg/cutting.svg'
import { Cutting, CuttingRef } from "@/pages/cutting/Cutting";

export const Face = forwardRef(() => {
    return (
        <div className="ps-face">
            
            <PsTable>
                <PsTableItem
                    id={"asset-search"}
                    icon={
                        <i className="iconfont icon-imgSearch"></i>
                    }  >
                    <AssetSearch ref={AssetSearchRef} />
                </PsTableItem>
                <PsTableItem
                    id={"psd-level"}
                    icon={
                        <i className="iconfont icon-level"></i>
                    }  >
                    <PsdLevel ref={PsdLevelRef} />
                </PsTableItem>
                <PsTableItem
                    id={"cutting"}
                    icon={
                        <img src="../cep-posidon/src/asset/svg/cutting.svg"></img>
                    }  >
                    <Cutting ref={CuttingRef} />
                </PsTableItem>
                <PsTableItem id="gap" isGap></PsTableItem>
                <PsTableItem
                    id="settings"
                    icon={
                        <i className="iconfont icon-setting"></i>
                    } >
                    <Settings ref={SettingsRef} />
                </PsTableItem>
            </PsTable>
        </div >
    );
})