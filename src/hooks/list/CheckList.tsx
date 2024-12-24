import { IItem } from "@/store/iTypes/iTypes";
import React, { forwardRef } from "react";

interface CheckListRef { }
interface CheckListProps {
    items?: IItem[]
}
export const CheckList = forwardRef<CheckListRef, CheckListProps>((props, ref) => {

    return (
        <div className="check-list-container">
            
        </div>
    )
})