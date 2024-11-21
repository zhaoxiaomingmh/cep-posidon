import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import { IUser } from "@/store/iTypes/iTypes";
import useDocumentStore from "@/store/modules/documentStore";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, darkTheme, defaultTheme, lightTheme, Provider } from '@adobe/react-spectrum';
import { Face } from "./Face";
import { psConfig } from "@/utlis/util-env";

interface AppRefType {
    refresh: () => void;
    user: IUser;
};
interface AppProps { }
export const AppRef = React.createRef<AppRefType>();
export const App = forwardRef<AppRefType, AppProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const setProject = useUserStore(state => state.setProject);
    const activeDocument = useDocumentStore(state => state.getActiveDocument());
    const setActiveDocument = useDocumentStore(state => state.setActiveDocument);
    const handler = psHandler;
    useImperativeHandle(ref, () => {
        return {
            refresh: checkActiveDocument,
            user: user
        }
    })
    useEffect(() => {
        checkActiveDocument();
        getUserInLocalStorage();
    }, [])
    const checkActiveDocument = async () => {
        const activeDocument = await handler.getActiveDocument();
        setActiveDocument(activeDocument);
    }
    const getUserInLocalStorage = () => {
        const userStr = localStorage.getItem('cep-user');
        if (!userStr) return;
        const user = JSON.parse(userStr) as IUser;
        if (user.env !== psConfig.env) {
            localStorage.removeItem('cep-user');
        } else {
            let timer = new Date(user.expired)
            if (timer > new Date()) {
                setUser(user);
                if (user.last != -1 && user.projectjects) {
                    const project = user.projectjects.find(p => p.id === user.last);
                    setProject(project)
                }
            } else {
                localStorage.removeItem('cep-user');
            }
        }
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