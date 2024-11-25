import React, { forwardRef, useEffect } from "react";
import './PsFunc.scss'
import useAppStore from "@/store/modules/appStore";
import { PsFuncItemProps } from "./PsFuncItem";
import { ActionButton } from "@adobe/react-spectrum";

interface PsFuncRef { }
interface PsFuncProps {
    children: React.ReactElement<PsFuncItemProps> | React.ReactElement<PsFuncItemProps>[];
}
export const PsFunc = forwardRef<PsFuncRef, PsFuncProps>((props, ref) => {

    const func = useAppStore(state => state.func);
    const setFunc = useAppStore(state => state.setFunc);

    useEffect(() => {
        Array.isArray(props.children) ? setFunc(props.children[0].props.id) : setFunc(props.children.props.id);
    }, [])

    return (
        <div className="ps-func">
            <div className="ps-func__toolbar">
                {(Array.isArray(props.children) ? props.children : [props.children]).map((child: any, index) =>
                    <div key={index} className="ps-func__toolbar__title">
                        <ActionButton
                            isQuiet={true}
                            onPress={() => setFunc(child.props.id)}
                        >
                            {child.props.title}
                        </ActionButton>
                    </div>
                )}
            </div>
            {
                func
                &&
                (Array.isArray(props.children) ? props.children.map((child, index) => {
                    return child.props.id === func ? child : null;
                }) : props.children)}
        </div>
    );
})