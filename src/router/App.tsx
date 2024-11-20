import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import { IDocument, IPosidonResponse, IProject, IUser } from "@/store/iTypes/iTypes";
import useDocumentStore from "@/store/modules/documentStore";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, darkTheme, defaultTheme, lightTheme, Provider } from '@adobe/react-spectrum';
import { Face } from "./Face";
import { psConfig } from "@/utlis/util-env";
import utilHttps from "@/utlis/util-https";
import { defaultProjectHeadImage } from "@/utlis/const";

interface AppRefType {
    refresh: () => void;
    user: IUser;
};
interface AppProps { }
export const AppRef = React.createRef<AppRefType>();
export const App = forwardRef<AppRefType, AppProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const project = useUserStore(state => state.getProject());
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
    useEffect(() => {
        if (user && !user.projectjects) {
            getProjectInfo();
        }
    }, [user])
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
            if (user.expired > new Date()) {
                setUser(user);
            } else {
                localStorage.removeItem('cep-user');
            }
        }
    }
    const getProjectInfo = async () => {
        const posidonResole: any = await utilHttps.httpGet(psConfig.host + psConfig.getProject, { userId: user.id });
        if (posidonResole.status != 200) {
            //todo:报错
            return;
        }
        const response = posidonResole.data as IPosidonResponse;
        if (response.code != 200) {
            //todo:报错
            return;
        }
        const data = response.data;
        let projects: IProject[] = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let projectInfo: IProject = {
                name: item.name,
                id: item.id,
                head: item.headImageUrl ? item.headImageUrl : defaultProjectHeadImage,
            }
            projects.push(projectInfo);
        }
        let last = -1;
        if (projects.length > 0) {
            let project: IProject = undefined;
            user.last == -1 ? projects[0] : (projects.find(p => p.id === user.last) || projects[0]);
            last = project.id;
            setProject(project);
        }

        const u: IUser = {
            ...user,
            last: last,
            projectjects: projects
        }
        setUser(u);
        localStorage.removeItem('cep-user');
        localStorage.setItem('cep-user', JSON.stringify(u));
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