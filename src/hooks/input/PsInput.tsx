import React from "react";
import { forwardRef } from "react";
import './PsInput.scss'

interface PsInputRefType {

};
interface PsInputProps {
    children?: React.ReactNode
}
export const PsInputRef = React.createRef<PsInputRefType>();
export const PsInput = forwardRef<PsInputRefType, PsInputProps>((props, ref) => {
    return (
        <div className="ps-input">
            <input type="text" />
            {props.children}
        </div>
    );
})