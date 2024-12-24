import React from "react";
import { forwardRef } from "react";
import './PsInput.scss'

interface PsInputRefType {

};
interface PsInputProps {
    children?: React.ReactNode
    value?: string,
    callback?: (string) => void,
    placeholder?: string
    disabled?: boolean
    defaultValue?: string
}
export const PsInputRef = React.createRef<PsInputRefType>();
export const PsInput = forwardRef<PsInputRefType, PsInputProps>((props, ref) => {
    return (
        <div className="ps-input">
            <input disabled={props.disabled ?? undefined} type="text" value={props.value} placeholder={props.placeholder} defaultValue={props.defaultValue} onChange={(event) => {
                props.callback && props.callback(event.target.value);
            }} />
            {props.children}
        </div>
    );
})