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
import psHandler from "@/service/handler";
import { GridPage, GridPageRef } from "@/pages/grid/GridPage";
import { Clean, CleanRef } from "@/pages/clean/Clean";

export const Face = forwardRef(() => {
    return (
        <div className="ps-face">
            <PsTable>
                <PsTableItem
                    id={"asset-search-page"}
                    icon={
                        <i className="iconfont icon-imgSearch"></i>
                    }  >
                    <AssetSearch ref={AssetSearchRef} />
                </PsTableItem>
                <PsTableItem
                    id={"psd-level-page"}
                    icon={
                        <i className="iconfont icon-level"></i>
                    }  >
                    <PsdLevel ref={PsdLevelRef} />
                </PsTableItem>
                <PsTableItem
                    id={"cutting-page"}
                    icon={
                        <img src={"./dist/static/images/svg/cutting.svg"}></img>
                    }  >
                    <Cutting ref={CuttingRef} />
                </PsTableItem>
                <PsTableItem
                    id={"grid-page"}
                    icon={
                        <img src={"./dist/static/images/svg/grid.svg"}></img>
                    }  >
                    <GridPage ref={GridPageRef} />
                </PsTableItem>
                <PsTableItem
                    id={"clean-page"}
                    icon={
                        <img src={"./dist/static/images/svg/PsClean.svg"}></img>
                    }>
                    <Clean ref={CleanRef} />
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