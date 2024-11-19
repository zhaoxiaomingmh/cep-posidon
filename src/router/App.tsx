import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import { IDocument } from "@/store/iTypes/iTypes";
import useDocumentStore from "@/store/modules/documentStore";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, darkTheme, defaultTheme, lightTheme, Provider } from '@adobe/react-spectrum';
import { Face } from "./Face";

interface AppRefType {
};
interface AppProps { }
export const AppRef = React.createRef<AppRefType>();
export const App = forwardRef<AppRefType, AppProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const activeDocument = useDocumentStore(state => state.getActiveDocument());
    const setActiveDocument = useDocumentStore(state => state.setActiveDocument);
    const handler = psHandler;
    useImperativeHandle(ref, () => {
        return {}
    })
    useEffect(() => {
        checkActiveDocument();
    })

    const checkActiveDocument = async () => {
        const activeDocument = await handler.getActiveDocument();
        setActiveDocument(activeDocument);
    }

    return (
        <Provider theme={darkTheme}>
            <div className="ps-app">
                {
                    user ?
                        (
                            activeDocument ?
                                <Face />
                                :
                                <div> 求求你先打开个文档 </div>
                        )
                        :
                        <Login ref={LoginRef} />
                }
            </div>
        </Provider>
    );
});