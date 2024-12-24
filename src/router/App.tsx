import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import { ILayer, IPosidonResponse, IProject, IProjectStorehouse, IUser, IVersion } from "@/store/iTypes/iTypes";
import useDocumentStore from "@/store/modules/documentStore";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Button, darkTheme, defaultTheme, lightTheme, Provider } from '@adobe/react-spectrum';
import { Face } from "./Face";
import { psConfig } from "@/utlis/util-env";
import './app.scss'
import utilHttps from "@/utlis/util-https";
import { defaultProjectHeadImage } from "@/utlis/const";
import iService from "@/service/service";
import { Update, UpdateRef } from "@/pages/welcome/Update";

interface AppRefType {
    refresh: () => void;
    user: IUser;
    selectLayer: (layerID: number, _name: string, kind: number) => void
};
interface AppProps { }
export const AppRef = React.createRef<AppRefType>();
export const App = forwardRef<AppRefType, AppProps>((props, ref) => {
    const handler = psHandler;
    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const setProject = useUserStore(state => state.setProject);
    const activeDocument = useDocumentStore(state => state.getActiveDocument());
    const setActiveDocument = useDocumentStore(state => state.setActiveDocument);
    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const setActiveLayer = useDocumentStore(state => state.setActiveLayer);
    const [currentTheme, setCurrentTheme] = useState(defaultTheme)
    const [currentScheme, setCurrentScheme] = useState<'dark' | 'light'>('dark')
    const [themeClass, setThemeClass] = useState('dark')
    const [version, setVersion] = useState<string>(psConfig.version);
    const [desc, setDesc] = useState<string>("");

    useImperativeHandle(ref, () => {
        return {
            refresh: checkActiveDocument,
            user: user,
            selectLayer: selectLayer
        }
    })
    useEffect(() => {
        const exid = handler.extId;
        if (psConfig.env == "prod" && exid == "posidon-ps-cep-main") {
            checkUpdate();
        }
        checkActiveDocument();
        getUserInLocalStorage();
        syncTheme();

    }, [])
    const checkUpdate = async () => {
        const buffer = await iService.downLoadPosidonFile(psConfig.versinFile, "desc.json");
        if (!buffer) return;
        const jsonString = buffer.toString('utf-8');
        const lastestVersion = JSON.parse(jsonString) as IVersion;
        setVersion(lastestVersion.version);
        setDesc(lastestVersion.description);
    }
    const syncTheme = () => {
        const { theme, currentInterface } = handler.getCurrentTheme();
        if (theme === darkTheme) {
            setCurrentScheme('dark')
        } else {
            setCurrentScheme('light')
        }
        setThemeClass(currentInterface)
        setCurrentTheme(currentTheme)
    }
    const checkActiveDocument = async () => {
        const activeDocument = await handler.getActiveDocument();
        setActiveDocument(activeDocument);
        const layer = await handler.getActiveLayer();
        if (layer) {
            selectLayer(layer.id, layer.name, layer.layerKind)
        }
    }
    const getUserInLocalStorage = async () => {
        const userStr = localStorage.getItem('cep-user');
        if (!userStr) return;
        const user = JSON.parse(userStr) as IUser;
        if (user.env !== psConfig.env) {
            localStorage.removeItem('cep-user');
        } else {
            let timer = new Date(user.expired)
            if (timer > new Date()) {
                const posidonResole: any = await utilHttps.httpGet(psConfig.getProject, { userId: user.id });
                const data = posidonResole.data;
                let projects: IProject[] = [];
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    let projectInfo: IProject = {
                        name: item.name,
                        id: item.id,
                        head: item.headImageUrl ? item.headImageUrl : defaultProjectHeadImage,
                        projectEditorType: item.projectEditorType,
                    }
                    projects.push(projectInfo);
                }
                user.projects = projects;
                if (projects?.length > 0) {
                    let project: IProject = undefined;
                    if (user.last != -1) {
                        project = projects.find(p => p.id === user.last);
                    }

                    project = project ? project : projects[0];
                    user.last = project.id;
                    const posidonResole: any = await utilHttps.httpGet(psConfig.getStorehouse, { projectId: project.id });
                    if (posidonResole.status == 200) {
                        const response = posidonResole.data as IPosidonResponse;
                        if (response.code == 0) {
                            const data: IProjectStorehouse = response.data;
                            project.storehouses = data.storehouses;
                            const foundProject = user.projects.find(x => x.id === project.id);
                            if (foundProject) {
                                foundProject.storehouses = data.storehouses;
                            } else {
                                user.last = -1;
                            }
                        }
                    }
                    setProject(project);
                }
                setUser(user);
                if (user.last != -1 && user.projects) {
                    const project = user.projects.find(p => p.id === user.last);
                    setProject(project)
                }
            } else {
                localStorage.removeItem('cep-user');
            }
        }
    }
    const selectLayer = (layerID: number, _name: string, kind?: number) => {
        const layer: ILayer = {
            id: layerID,
            name: _name,
            layerKind: kind ?? 1,
        }
        setActiveLayer(layer);
    }

    return (
        <Provider theme={currentTheme} colorScheme={currentScheme} isQuiet>
            <div className={`ps-app theme-${themeClass}`}>
                <div style={{ width: '100%', height: '100%' }}>
                    {
                        (psConfig.version !== version) ?
                            <Update version={version} desc={desc} ref={UpdateRef}
                            /> :
                            <div style={{ width: '100%', height: '100%', display: "flex" }}>
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
                    }
                </div>
            </div>
        </Provider>
    );
});