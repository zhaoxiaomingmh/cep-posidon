import React, { forwardRef } from "react";
interface PsFuncItemRef { }
export interface PsFuncItemProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

export const PsFuncItem = forwardRef<PsFuncItemRef, PsFuncItemProps>((props, ref) => {
    return (
        <div>
            {props.children}
        </div>
    );
})