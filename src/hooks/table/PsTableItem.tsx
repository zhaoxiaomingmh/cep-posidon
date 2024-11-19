import { forwardRef } from "react"
import React from 'react';


export interface PsTableItemProps {
    id: string
    icon: React.ReactNode
    children: React.ReactNode
}
interface PsTableItemRef { }
export const PsTableItem = forwardRef<PsTableItemRef, PsTableItemProps>((props, ref) => {

    return (
        <div className="ps-table-temp">
            {props.children}
        </div>
    );
})