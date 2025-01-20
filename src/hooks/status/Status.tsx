import { IStatus } from "@/store/iTypes/iTypes";
import React, { useEffect } from "react";
import { forwardRef } from "react";
import './status.scss';

type StatusProps = {
    status: IStatus,
    message?: string,
    width: string,
    height: string,
    iconWidth: string,
    iconHeight: string,
}
type StatusRefType = {
};
export const StatusRef = React.createRef<StatusRefType>();
export const Status = forwardRef<StatusRefType, StatusProps>((props, ref) => {
    return (
        <div className="status" style={{ width: props.width, height: props.height }}>
            {
                props.status === IStatus.wait
                &&
                <div className="status-main">
                    <img src="./dist/static/images/svg/wait.svg" style={{ width: props.iconWidth, height: props.iconHeight }}></img>
                    <span>等待中...</span>
                </div>
            }
            {
                props.status === IStatus.loading
                &&
                <div className="status-main" >
                    <img src="./dist/static/images/svg/huojian.svg" style={{ width: props.iconWidth, height: props.iconHeight }}></img>
                    <span>加载中...</span>
                </div>
            }
            {
                props.status === IStatus.error
                &&
                <div className="status-main">
                    <img src="./dist/static/images/svg/huojian.svg" style={{ width: props.iconWidth, height: props.iconHeight }}></img>
                    <span>{props.message}</span>
                </div>
            }
        </div>
    );
});