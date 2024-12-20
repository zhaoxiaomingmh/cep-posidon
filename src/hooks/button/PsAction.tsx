import React from "react";
import { forwardRef } from "react";
import "./PsAction.scss"

interface PsActionRefType {

};
interface PsActionProps {
    callback?: Function
    children?: React.ReactNode
}
export const PsActionRef = React.createRef<PsActionRefType>();
export const PsAction = forwardRef<PsActionRefType, PsActionProps>((props, ref) => {
    return (
        <div className="ps-action">
            {props.children}
        </div>
    );
})