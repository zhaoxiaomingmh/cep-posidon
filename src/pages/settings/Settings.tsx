import React, { forwardRef, useTransition } from "react";
import './Settings.scss'
import useUserStore from "@/store/modules/userStore";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import { PsFunc } from "@/hooks/func/PsFunc";
import { Button, defaultTheme, Heading, Provider, } from "@adobe/react-spectrum";
import { psConfig } from "@/utlis/util-env";
import utilHttps from "@/utlis/util-https";
import { IPosidonResponse, IProjectStorehouse, IUser } from "@/store/iTypes/iTypes";
import { defaultProjectHeadImage } from "@/utlis/const";
import { useTranslation } from "react-i18next";
interface SettingsRefType { };
interface SettingsProps { }
export const SettingsRef = React.createRef<SettingsRefType>();
export const Settings = forwardRef<SettingsRefType, SettingsProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const project = useUserStore(state => state.getProject());
    const setProject = useUserStore(state => state.setProject);
    const { t, i18n } = useTranslation();

    const handleChange = async (event) => {
        const target = event.target.value;
        const p = user.projects.find(x => x.id === parseInt(target));
        if (!p.storehouses) {
            const posidonResole: any = await utilHttps.httpGet(psConfig.getStorehouse, { projectId: project.id });
            if (posidonResole.status == 200) {
                const response = posidonResole.data as IPosidonResponse;
                if (response.code == 0) {
                    const data: IProjectStorehouse = response.data;
                    p.storehouses = data.storehouses;
                    const updatedProjects = user.projects?.map(project => {
                        if (project.id === project.id) {
                            return {
                                ...project,
                                storehouses: data.storehouses
                            };
                        }
                    });

                    const u: IUser = {
                        ...user,
                        last: p.id,
                        projects: updatedProjects
                    }
                    setUser(u);
                    localStorage.setItem('cep-user', JSON.stringify(u));
                }
            }
        }
        setProject(p);
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
                        i18n.changeLanguage(target)
                    }} defaultValue={'cn'}>
                        <option key='cn' value='cn'>简体中文</option>
                        <option key='en' value='en'>English</option>
                        <option key='jp' value='jp'>日本語</option>
                    </select>
                </div>
                <div className="settings__content__team">
                    <div className="settings__content__team__title">
                        <span id="currunt-team">当前项目</span>
                        <select onChange={handleChange} defaultValue={project.id}>
                            {user.projects?.map((p, index) => {
                                return <option key={index} value={p.id}>{p.name}</option>
                            })}
                        </select>
                    </div>
                    <div className="settings__content__team__preview">
                        <img id='project-head' src={project?.head ? psConfig.host + project.head.replace('..', '') : psConfig.host + defaultProjectHeadImage.replace('..', '')} />
                        <div className="settings__content__team__preview__project-name">
                            <span>{project?.name}</span>
                            <span>{project?.projectEditorType}</span>
                        </div>
                    </div>
                </div>
                <div className="settings__footer">
                    <Button variant={"primary"} onPress={() => {
                        window.localStorage.removeItem('cep-user');
                        setUser(undefined);
                    }}>
                        注销
                    </Button>
                    {/* 
                    <button onClick={() => {
                        window.localStorage.removeItem('cep-user');
                        setUser(undefined);
                    }}>
                        注销
                    </button> */}
                </div>
            </PsFuncItem>
        </PsFunc>
    );
}); 