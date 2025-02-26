import { forwardRef, useEffect, useState } from "react";
import React from "react";
import './cuttingSetting.scss'
import useAppStore from "@/store/modules/appStore";
import useSettingsStore from "@/store/modules/settings";
import { IImageExportSetting } from "@/store/iTypes/iTypes";

type CuttingSettingRefType = {
}
type CuttingSettingProps = {
    func: string
};
export const CuttingSetting = forwardRef<CuttingSettingRefType, CuttingSettingProps>((props, ref) => {

    const setFunc = useAppStore(state => state.setFunc);
    const imageExportSetting = useSettingsStore(state => state.getImageExportSetting());
    const setImageExportSetting = useSettingsStore(state => state.setImageExportSetting);

    const setCompress = () => {
        const newImageExportSetting: IImageExportSetting = {
            ...imageExportSetting,
            compress: !imageExportSetting.compress
        }
        setImageExportSetting(newImageExportSetting);
    }

    const setRename = (rename: boolean) => {
        const newImageExportSetting: IImageExportSetting = {
            ...imageExportSetting,
            rename: rename
        }
        setImageExportSetting(newImageExportSetting);
    }

    return (
        <div className="cutting-setting-container">
            <div className="cutting-setting-header">
                <img id="return-img" src="./dist/static/images/svg/left.svg" onClick={() => {
                    setFunc(props.func);
                }}></img>
                <span id="cutting-title-text">切图设置</span>
            </div>

            <div className="vector"></div>

            <div className="cutting-setting-main">
                <div className="frame15652">
                    <span>
                        PNG压缩
                    </span>

                    <div className="frame15651">
                        <div id="frame15650" onClick={() => {
                            setCompress();
                        }}>
                            {
                                imageExportSetting.compress &&
                                <div id="checked-rect">
                                </div>
                            }
                        </div>
                        <span>开启PNG压缩</span>
                    </div>

                </div>
                <div className="frame15652">
                    <span>
                        重名文件
                    </span>

                    <div className="frame15655">
                        <div className="frame15651">
                            <div className="frame15654" onClick={() => {
                                setRename(true);
                            }}>
                                {
                                    imageExportSetting.rename
                                    &&
                                    <div className="check-ellipse">

                                    </div>
                                }
                            </div>
                            <span>重命名</span>
                        </div>
                        <div className="frame15651" >
                            <div className="frame15654" onClick={() => {
                                setRename(false);
                            }}>
                                {
                                    !imageExportSetting.rename
                                    &&
                                    <div className="check-ellipse">

                                    </div>
                                }
                            </div>
                            <span>覆盖</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
})