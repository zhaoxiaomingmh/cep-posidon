import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import { IFunctionName, ILayer, IPosidonResponse, IProject, IProjectStorehouse, IUser, IVersion } from "@/store/iTypes/iTypes";
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
import path from "path";
import { ExportDialog, ExportDialogRef } from "@/pages/cutting/component/cuttingTool/ExportDialog";

interface AppRefType {
    refresh: () => void;
    user: IUser;
    selectLayer: (layer: ILayer) => void
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
    const [generate, setGenerate] = useState<string>(undefined);
    const [update, setUpdate] = useState<'latest' | 'plugin' | 'generator'>('latest');

    useImperativeHandle(ref, () => {
        return {
            refresh: checkActiveDocument,
            user: user,
            selectLayer: setActiveLayer
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
        clearTheCache();
    }, [])
    const checkUpdate = async () => {
        const buffer = await iService.downLoadPosidonFile(psConfig.versinFile, "desc.json");
        if (!buffer) return;
        const jsonString = buffer.toString('utf-8');
        const lastestVersion = JSON.parse(jsonString) as IVersion;
        setVersion(lastestVersion.version);
        setDesc(lastestVersion.description);
        if (lastestVersion.version !== psConfig.version) {
            setUpdate('plugin');
            return;
        }
        setVersion(psConfig.generatorVersion);
        if (!psConfig.generator()) {
            setUpdate('generator');
            return;
        }
        const generatorJson = path.join(psConfig.generator(), "package.json");
        setVersion(psConfig.generatorVersion);
        if (window.cep.fs.stat(psConfig.generator()).err === 0 && window.cep.fs.stat(generatorJson).err === 0) {
            const jsonStr = window.cep.fs.readFile(generatorJson, "Base64");
            if (jsonStr.err === 0) {
                const str = window.cep.encoding.convertion.b64_to_utf8(jsonStr.data)
                console.log("读取到json字符串", str)
                const gJson = JSON.parse(str);
                console.log("生成器版本", gJson.version)
                if (psConfig.generatorVersion == gJson.version) {
                    return;
                } else {
                    setVersion(gJson.version);
                    setUpdate('generator');
                }
            }
        } else {
            setUpdate('generator');
        }
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
        await handler.refreshActiveLayer();
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
                iService.increaseFunctionCoutn(IFunctionName.activePlugin, projects[0]?.id, projects[0]?.name, user.id);
            } else {
                localStorage.removeItem('cep-user');
            }
        }
    }
    const clearTheCache = () => {
        const previewImageDir = psConfig.previewImageDir();
        //@ts-ignore
        fsRemoveDir(previewImageDir, true);
    }

    return (
        <Provider theme={currentTheme} colorScheme={currentScheme} isQuiet>
            <div className={`ps-app theme-${themeClass}`}>
                <div style={{ width: '100%', height: '100%' }}>
                    {
                        update != 'latest' ?
                            <Update target={update} version={version} pluginDesc={desc} ref={UpdateRef} /> :
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