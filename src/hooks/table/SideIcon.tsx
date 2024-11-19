import useAppStore from "@/store/modules/appStore";
import { forwardRef } from "react"
import './SideIcon.scss'
import React from 'react';

interface SideIconRef { }
interface SideIconProps {
    id: string;
    active: boolean;
    children: React.ReactNode;
    callback?: () => void;
}
export const SideIcon = forwardRef<SideIconRef, SideIconProps>((props, ref) => {

    const setTable = useAppStore(state => state.setTable);

    return (
        <div className="side-icon" onClick={() => {
                if(props.active) return;
                setTable(props.id);
        }}>
            <div className={`side-icon__main ${props.active ? "selected" : ""}`}>
                {props.children}
            </div>
        </div>);
})