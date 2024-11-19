import useAppStore from "@/store/modules/appStore";
import { forwardRef } from "react"
import React from 'react';


export interface FuncProps {
    id: string
    icon: React.ReactNode
    children: React.ReactNode
}
interface FuncRef { }
export const Func = forwardRef<FuncRef, FuncProps>((props, ref) => {


    return (
        <div className="ps-func">
            {props.children}
        </div>
    );
})