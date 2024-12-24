import { IItem } from "@/store/iTypes/iTypes";
import React, { forwardRef } from "react";
import './checkList.scss';

interface CheckListRef { }
interface CheckListProps {
    items?: IItem[]
}
export const CheckList = forwardRef<CheckListRef, CheckListProps>((props, ref) => {

    return (
        <div className="check-list-container">
            {
                props.items?.map((item, index) => {
                    return (
                        <div className="check-list-item" key={index}>
                     
                            <div className="check-list-item-left-box">

                            </div>
                        </div>
                    );
                })
            }
        </div>
    )
})