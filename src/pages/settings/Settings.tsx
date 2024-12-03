import React, { forwardRef, useEffect, useTransition } from "react";
import './Settings.scss'
import useUserStore from "@/store/modules/userStore";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import { PsFunc } from "@/hooks/func/PsFunc";
import { Button, defaultTheme, Heading, Provider, } from "@adobe/react-spectrum";
import { psConfig } from "@/utlis/util-env";
import utilHttps from "@/utlis/util-https";
import { IPosidonResponse, IProject, IProjectStorehouse, IUser } from "@/store/iTypes/iTypes";
import { defaultProjectHeadImage } from "@/utlis/const";
import psHandler from "@/service/handler";
import iService from "@/service/service";
import axios from "axios";
interface SettingsRefType { };
interface SettingsProps { }
export const SettingsRef = React.createRef<SettingsRefType>();
export const Settings = forwardRef<SettingsRefType, SettingsProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const project = useUserStore(state => state.getProject());
    const setProject = useUserStore(state => state.setProject);

    const handleChange = async (event) => {
        const target = event.target.value;
        const pid = parseInt(target);
        const p = user.projects.find(x => x.id === pid);
        if (!p.storehouses) {
            const posidonResole: any = await utilHttps.httpGet(psConfig.getStorehouse, { projectId: pid });
            if (posidonResole.status === 200) {
                const response = posidonResole.data as IPosidonResponse;
                if (response.code === 0) {
                    const data: IProjectStorehouse = response.data;
                    p.storehouses = data.storehouses;
                    const updatedProjects = user.projects.map(project => {
                        if (project.id === pid) {
                            return {
                                ...project,
                                storehouses: data.storehouses
                            };
                        }
                        return project;
                    });

                    const u: IUser = {
                        ...user,
                        last: p.id,
                        projects: updatedProjects
                    };
                    console.log('u', u);
                    setUser(u);
                    localStorage.setItem('cep-user', JSON.stringify(u));
                }
            }
        }
        setProject(p);
    };
    const reProject = async () => {
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
    }
    const update = () => {
    }

    return (
        <PsFunc>
            <PsFuncItem id={"settings"} title="设置">
                <div className="settings__header">
                    <div className="settings__header__avatar">
                        <Heading>
                            {user?.name ? user.name.slice(0, 1) : '爹'}
                        </Heading>
                    </div>
                    <div className="settings__header__user">
                        <Heading>
                            {user?.name ? user.name : '爹'}
                        </Heading>
                        <div className="settings__header__user__email">
                            {user?.email ? user.email : '邮箱地址'}
                        </div>
                    </div>
                </div>
                <div className="settings__content__lan">
                    <span>语言</span>
                    < select onChange={(event) => {
                        let target = event.target.value;
                    }} defaultValue={'cn'}>
                        <option key='cn' value='cn'>简体中文</option>
                        <option key='en' value='en'>English</option>
                        <option key='jp' value='jp'>日本語</option>
                    </select>
                </div>
                <div className="settings__content__team">
                    <div className="settings__content__team__title">
                        <span id="currunt-team">当前项目
                        </span>
                        <select style={{minHeight : "20px"}} onChange={handleChange} defaultValue={project?.id}> 
                            {user.projects?.map((p, index) => {
                                return <option key={index} value={p.id}>{p.name}</option>
                            })}
                        </select>
                    </div>
                    <div className="settings__content__team__preview">
                        {
                            project &&
                            <img id='project-head' src={project?.head ? psConfig.host + project.head.replace('..', '') : psConfig.host + defaultProjectHeadImage.replace('..', '')} />
                        }
                        <div className="settings__content__team__preview__project-name">
                            <span>{project?.name}</span>
                            <span>{project?.projectEditorType}</span>
                        </div>
                    </div>
                </div>
                <div className="settings__version">
                   版本号: {psConfig.version}
                </div>
                <div className="settings__footer">
                    <Button variant={"primary"} onPress={() => {
                        window.localStorage.removeItem('cep-user');
                        setUser(undefined);
                    }}>
                        注销
                    </Button>
                    <Button variant={"primary"} onPress={() => {
                        psHandler.restart();
                    }}>
                        重启
                    </Button>
                    <Button variant={"primary"}
                        onPress={() => {
                            reProject();
                        }}
                    > 刷新</Button>
                    <Button variant={"primary"}
                        onPress={() => {
                            update();
                        }}
                    > 更新</Button>
                </div>

            </PsFuncItem>
        </PsFunc>
    );
}); 