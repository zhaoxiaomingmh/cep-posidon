import React, { forwardRef } from "react";
import './treePath.scss'
import { IPath } from "@/store/iTypes/iTypes";

type TreePathProps = {
    paths: IPath[],
    toRoot: () => void
    toTarget: (target: IPath) => void
}
type TreePathRefType = {
};
export const TreePathRef = React.createRef<TreePathRefType>();
export const TreePath = forwardRef<TreePathRefType, TreePathProps>((props, ref) => {
    return (
        <div className="tree-path-container">
            <div className="root-dir" onClick={() => {
                props.toRoot();
            }}>
                {"根目录"}
            </div>
            {props.paths.map((path, index) => {
                if (index != 0) {
                    return <div className="sub-dir" key={index} onClick={() => { props.toTarget(path) }}>
                        <svg width="6" height="7" viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.69886 3.93182L0.210227 6.72727V5.63636L4.42045 3.60795L4.38636 3.67614V3.50568L4.42045 3.57386L0.210227 1.54545V0.454545L5.69886 3.25V3.93182Z" fill="#999999" />
                        </svg>
                        <span>
                            {path.path}
                        </span>
                    </div>;
                }
            })}
        </div>
    );
})