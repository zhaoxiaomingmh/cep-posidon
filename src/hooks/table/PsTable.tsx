import useAppStore from "@/store/modules/appStore";
import { forwardRef, useEffect } from "react"
import { SideIcon } from "./SideIcon";
import { PsTableItemProps } from "./PsTableItem";
import './PsTable.scss'
import React from 'react';
import { AppRef } from "@/router/App";

interface PsTableRef { }
interface PsTableProps {
    children: React.ReactElement<PsTableItemProps>[]
}

export const PsTable = forwardRef<PsTableRef, PsTableProps>((props, ref) => {

    const table = useAppStore(state => state.getTable());
    const tables = useAppStore(state => state.getTables());
    const setTables = useAppStore(state => state.setTables);
    const setTable = useAppStore(state => state.setTable);

    useEffect(() => {
        if (!props.children) return;
        const tables: string[] = props.children.map(child => {
            return child.props.id;
        })
        setTables(tables);
        setTable(tables[0]);
    }, [])

    return (
        <div className="ps-table">
            <div className="ps-table__main">
                {
                    props.children.map((child, i) => {
                        return (
                            child.props.id === table
                            &&
                            child.props.children
                        );
                    })
                    // React.Children.map((props.children), (child, index) => {
                    //     if (!child) return null;
                    //     return (React.cloneElement(child, { key: index }))
                    // })
                }
            </div>
            <div className="ps-table__side">
                {
                    props.children.map((child, i) => {
                        return (
                            <SideIcon key={i} active={child.props.id == table} id={child.props.id} isGap={child.props.isGap}>
                                {child.props.icon}
                            </SideIcon>
                        );
                    })
                }
            </div>
        </div>
    );
})