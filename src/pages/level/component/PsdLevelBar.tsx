
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import "./PsdLevelBar.scss"
import { ISvnPsdGroup, ISvnPsdGroupItem } from "@/store/iTypes/iTypes";

interface PsdLevelToolBarProps {
    levels: ISvnPsdGroup[],
    level: number,
    changeLevel: (level: number) => void,
    categories: ISvnPsdGroupItem[],
    category: number,
    changeCategory: (category: number) => void,
    dir: number,
}
type PsdLevelToolBarRefType = {  
};
export const PsdLevelBarRef = React.createRef<PsdLevelToolBarRefType>();
export const PsdLevelBar = forwardRef<PsdLevelToolBarRefType, PsdLevelToolBarProps>((props, ref) => {

    return (
        <div className="psd-level-bar-container">
            <div className="psd-level-column">
                {
                    props.levels.map((svnGroup, index) => {
                        return <div className="level-item" key={index}
                            style={{
                                backgroundColor: props.level === svnGroup.parentId ? "#1c61e7" : "rgba(153, 153, 153, 0.5)"
                            }}
                            onClick={() => { props.changeLevel(svnGroup.parentId) }}>
                            <span>{svnGroup.parentDir}</span>
                        </div>;
                    })
                }
            </div>
            <div className="design-asset-classification">
                {
                    props.categories?.map((dir, index) => {
                        return <div className={`dir-item ${dir.id === props.category?'active':''}`} key={index}
                            onClick={() => { 
                                props.changeCategory(dir.id) }}
                        >
                            <span>{dir.name}</span>
                        </div>;
                    })
                }
            </div>
        </div>
    );
})