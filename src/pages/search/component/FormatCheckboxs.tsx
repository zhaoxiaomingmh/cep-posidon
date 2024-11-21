import React, { forwardRef, useState } from "react";
import './formatCheckboxs.scss'
import { ImageFormat } from "@/store/iTypes/iTypes";

export type FormatCheckboxsProps = {
    formats: ImageFormat[],
    changeFormats: Function
};
type FormatCheckboxsRefType = {};
export const FormatCheckboxsRef = React.createRef<FormatCheckboxsRefType>();
export const FormatCheckboxs = forwardRef<FormatCheckboxsRefType, FormatCheckboxsProps>((props, ref) => {

    return (
        <div className="formats-container">
            <FormatCheckBox key={"PSD"} title={"PSD"} callback={props.changeFormats} formats={props.formats} format={'psd'} />
            <FormatCheckBox key={"PNG"} title={"PNG"} callback={props.changeFormats} formats={props.formats} format={'png'} />
            <FormatCheckBox key={"JPG"} title={"JPG"} callback={props.changeFormats} formats={props.formats} format={'jpg'} />
            <FormatCheckBox key={"comp"} title={"组件"} callback={props.changeFormats} formats={props.formats} format={'comp'} />
        </div>
    );
})

export const FormatCheckBox = (props: { callback: Function, title: string, formats: ImageFormat[], format: ImageFormat }) => {
    return (
        <div className="format-checkbox-container"
            onClick={() => {
                props.callback(props.format);
            }}
        >
            {
                props.formats.includes(props.format)
                &&
                <div className="format-check-box">
                    <div style={{
                        background: "#1f88ea",
                        width: "4px",
                        height: "4px",
                    }}>
                    </div>
                </div>
            }
            {
                !props.formats.includes(props.format)
                &&
                <div className="format-check-box"
                    style={{
                        borderColor: "#bbbbbb"
                    }}
                >

                </div>
            }
            <span className="checkBox_name">{props.title}</span>
        </div>
    );
}