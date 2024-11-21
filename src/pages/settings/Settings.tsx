import React, { forwardRef } from "react";
import './Settings.scss'
import useUserStore from "@/store/modules/userStore";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import { PsFunc } from "@/hooks/func/PsFunc";
import { Button, defaultTheme, Heading, Provider, } from "@adobe/react-spectrum";
import { psConfig } from "@/utlis/util-env";
interface SettingsRefType { };
interface SettingsProps { }
export const SettingsRef = React.createRef<SettingsRefType>();
export const Settings = forwardRef<SettingsRefType, SettingsProps>((props, ref) => {

    const user = useUserStore(state => state.getUser());
    const setUser = useUserStore(state => state.setUser);
    const project = useUserStore(state => state.getProject());
    const setProject = useUserStore(state => state.setProject);

    const handleChange = (event) => {
        const target = event.target.value;
        const p = user.projectjects.find(x => x.id === parseInt(target));
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
                </div>
                <div className="settings__content__team">
                    <div className="settings__content__team__title">
                        <span id="currunt-team">当前项目</span>
                        <select onChange={handleChange}>
                            {user.projectjects?.map((p, index) => {
                                return <option key={index} value={p.id}>{p.name}</option>
                            })}
                        </select>
                    </div>
                    <div className="settings__content__team__preview">
                        <img id='project-head' src={psConfig.host + project.head.replace('..', '')} />
                        <div className="settings__content__team__preview__project-name">
                            <span>{project.name}</span>
                            <span>{project.projectEditorType}</span>
                        </div>
                    </div>
                </div>

                <div className="settings__footer">
                    {/* <Button variant={"primary"} onPress={() => {
                        window.localStorage.removeItem('cep-user');
                        setUser(undefined);
                    }}>
                        注销
                    </Button> */}

                    <button onClick={() => {
                        window.localStorage.removeItem('cep-user');
                        setUser(undefined);
                    }}>
                        注销
                    </button>
                </div>
            </PsFuncItem>
        </PsFunc>
    );
}); 