import useAppStore from "@/store/modules/appStore";
import { forwardRef } from "react"
import './SideIcon.scss'
import React from 'react';

interface SideIconRef { }
interface SideIconProps {
    id: string;
    active: boolean;
    children: React.ReactNode;
    isGap?: boolean;
    callback?: () => void;
}
export const SideIcon = forwardRef<SideIconRef, SideIconProps>((props, ref) => {

    const setTable = useAppStore(state => state.setTable);

    return (
        <div className={props.isGap ? 'side-gap' : 'side-icon'} onClick={() => {
            if (props.active || props.isGap) return;
            setTable(props.id);
        }}>
            {!props.isGap && <div className={`side-icon__main ${props.active ? "selected" : ""}`}>
                {props.children}
            </div>}
        </div>);
})