import React, { forwardRef } from "react";
import './PsFunc.scss'
interface PsFuncItemRef { }
export interface PsFuncItemProps {
    id: string;
    title: string;
    children: React.ReactNode;
    right?: boolean;
}

export const PsFuncItem = forwardRef<PsFuncItemRef, PsFuncItemProps>((props, ref) => {
    return (
        <div className="ps-func__item">
            {props.children}
        </div>
    );
})