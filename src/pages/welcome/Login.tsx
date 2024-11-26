import React, { useContext } from "react";
import { forwardRef } from "react";
import './login.scss'
import useUserStore from "@/store/modules/userStore";
import { IPosidonResponse, IProject, IProjectStorehouse, IUser } from "@/store/iTypes/iTypes";
import * as signalR from "@microsoft/signalr";
import { psConfig } from "@/utlis/util-env";
import { util } from "@/utlis/util";
import utilHttps from "@/utlis/util-https";
import { defaultProjectHeadImage } from "@/utlis/const";
import { useProvider } from "@adobe/react-spectrum";

interface LoginRefType { };
interface LoginProps { }
export const LoginRef = React.createRef<LoginRefType>();
export const Login = forwardRef<LoginRefType, LoginProps>((props, ref) => {

    const setUser = useUserStore(state => state.setUser);
    const setProject = useUserStore(state => state.setProject);

    const {theme, colorScheme} = useProvider()

    const handleLogin = () => {
        let currentStateId = util.uuid();
        let connection = new signalR.HubConnectionBuilder().withUrl(psConfig.host + psConfig.hubservice, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect()
            .build();
        console.log('signalr start');
        connection.start().catch(err => console.error(err.toString()));
        console.log('signalr connected');
        connection.on("ReturnConnectionId", (connectionID) => {
            const link = `${psConfig.host}?type=FigmaPlugin&state=${currentStateId}&connectionid=${connectionID}`;
            const cs = new CSInterface();
            cs.openURLInDefaultBrowser(link);
        });

        connection.on("FigmaPluginLoginSuccessCallback", (state, userInfo, isExternal) => {
            console.log("登录信息", state, userInfo, isExternal);
            if (state && state == currentStateId) {
                updateUser(userInfo, isExternal);
            }
        });
    };

    const updateUser = async (userInfo, isExternal: boolean) => {
        let user: IUser = {
            id: userInfo.id,
            env: psConfig.env,
            loginType: isExternal ? "External" : "OpenID",
            name: userInfo.name,
            email: userInfo.netaseEmail,
            head: userInfo.headImageUrl,
            expired: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
            last: -1,
        }

        const posidonResole: any = await utilHttps.httpGet(psConfig.getProject, { userId: user.id });
        if (posidonResole.status != 200) {
            //todo:报错
            return;
        }
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
        if (projects.length > 0) {
            let project = projects[0];
            user.last = project.id;
            const posidonResole: any = await utilHttps.httpGet(psConfig.getStorehouse, { projectId: project.id });
            if (posidonResole.status == 200) {
                const response = posidonResole.data as IPosidonResponse;
                if(response.code == 0) {
                    const data: IProjectStorehouse = response.data;
                    project.storehouses = data.storehouses;
                    user.projects.find(x => x.id === project.id).storehouses = data.storehouses;
                }
            }
            setProject(project);
        }
        console.log('user', user);
        setUser(user);
        localStorage.setItem('cep-user', JSON.stringify(user));
    };

    return (
        <div className="login-wrap">
            <div className="login-wrap-icon">
                <svg style={{ flex: "1" }} width="146" height="112" viewBox="0 0 146 112" fill={colorScheme=='dark'?'#fff':'#000'} xmlns="http://www.w3.org/2000/svg">
                    <path d="M81.0516 76.3042C80.0156 63.7992 78.8202 30.665 78.4217 16.9653C75.8715 11.7085 73.7994 6.05336 72.6039 0C71.4085 6.05336 69.3364 11.7085 66.7862 16.9653C66.3877 30.665 65.1923 63.8788 64.1562 76.3838C69.3364 75.9856 74.9948 75.8263 81.0516 76.3042Z" />
                    <path d="M41.0436 50.4181L40.9639 50.4977C41.0436 50.4977 41.442 50.4977 41.9999 50.4977C43.8329 50.5774 47.1801 51.2146 46.3034 54.7192C45.108 60.215 42.0796 70.6491 35.0664 83.0744C35.0664 83.0744 41.8405 80.0477 52.7588 77.8972C56.7435 61.3301 58.6562 34.7272 58.8953 30.1871C50.8461 41.9753 42.0796 49.5419 41.0436 50.4181Z" />
                    <path d="M104.162 50.4181L104.242 50.4977C104.162 50.4977 103.764 50.4977 103.206 50.4977C101.373 50.5774 98.0257 51.2146 98.9024 54.7192C100.098 60.215 103.126 70.6491 110.139 83.0744C110.139 83.0744 103.365 80.0477 92.4471 77.8972C88.4623 61.3301 86.5496 34.7272 86.3105 30.1871C94.3598 41.9753 103.126 49.5419 104.162 50.4181Z" />
                    <path d="M57.8586 101.008C56.2647 100.849 54.5114 100.849 52.9175 100.849C50.447 100.849 48.7733 100.769 48.7733 99.0968C48.7733 97.7427 50.4469 97.1055 53.8738 97.1055C56.2647 97.1055 58.2571 97.5834 58.8946 99.0968L62.2418 96.9462C62.2418 96.9462 62.0028 96.6276 61.8434 96.3887C60.4885 94.7161 57.9383 93.8399 53.7941 93.8399C46.8607 93.8399 44.3901 95.9904 44.3901 99.2561C44.3901 102.92 46.7013 103.876 49.0921 104.274C53.1566 104.991 58.815 103.796 58.815 106.106C58.815 107.779 56.7429 108.416 54.0332 108.416C51.5627 108.416 47.4982 107.221 47.1794 105.708L43.6729 108.655C44.2307 109.372 45.0277 109.929 46.0637 110.487C47.2591 111.044 50.3673 111.92 53.7145 111.92C60.4089 111.92 63.1982 109.451 63.1982 105.708C63.1982 104.194 62.6403 103.239 62.0028 102.601C60.9667 101.646 59.9307 101.168 57.8586 101.008Z" />
                    <path d="M13.6279 94.0789H0.557867H0C0 94.0789 0.557867 95.2736 0.557867 95.8312V109.929C0.557867 110.407 0 111.681 0 111.681H0.557867H4.62233H5.18019C5.18019 111.681 4.62233 110.487 4.62233 109.929V104.672V104.433V100.69V99.1765V97.6631H13.6279C14.8233 97.6631 15.6203 98.141 15.6203 99.0968C15.6203 100.132 14.8233 100.69 13.6279 100.69H11.8746C10.0416 100.769 8.4477 101.885 7.41166 102.92C7.33197 103 7.25227 103.079 7.17257 103.159C6.7741 103.557 5.97715 104.194 5.33958 104.354H6.13654H13.4685C17.6924 104.354 19.8441 102.362 19.8441 99.1765C19.8441 95.9905 17.772 94.0789 13.6279 94.0789Z" />
                    <path d="M72.7612 94.0789H72.2034H68.1389H67.5811C67.5811 94.0789 68.1389 95.2736 68.1389 95.8312V109.929C68.1389 110.407 67.5811 111.681 67.5811 111.681H68.1389H72.2034H72.7612C72.7612 111.681 72.2831 110.566 72.2034 110.009V95.8312C72.2034 95.194 72.7612 94.0789 72.7612 94.0789Z" />
                    <path d="M144.647 95.7515C144.647 95.2736 145.205 93.9992 145.205 93.9992H144.647H141.061H140.423H139.865C139.865 93.9992 140.423 95.1939 140.423 95.7515V106.026L131.338 96.1497L130.939 95.7515L129.903 94.716C129.983 94.7957 130.621 95.5125 130.78 97.9817C130.78 98.0613 130.78 98.141 130.78 98.2206C130.86 99.5747 131.338 101.805 132.693 103.318L140.423 111.602H144.727H145.285C145.285 111.602 144.727 110.407 144.727 109.849V95.7515H144.647Z" />
                    <path d="M124.324 94.0789C124.324 94.0789 124.882 95.2736 124.882 95.8311V109.929C124.882 110.407 124.324 111.681 124.324 111.681H124.882H129.106V103.398V99.3357V94.1585H124.882H124.324V94.0789Z" />
                    <path d="M129.105 111.602H129.663C129.663 111.602 129.105 110.407 129.105 109.849V111.602Z" />
                    <path d="M26.3784 110.805C24.8642 110.009 23.7485 108.894 22.8718 107.54C21.9952 106.106 21.5967 104.593 21.5967 102.84C21.5967 101.088 21.9952 99.4951 22.8718 98.141C23.7485 96.7073 24.8642 95.6719 26.3784 94.8754C27.8926 94.0789 29.5662 93.6807 31.3992 93.6807C33.2322 93.6807 34.9058 94.0789 36.42 94.8754C37.9342 95.6719 39.0499 96.787 39.9266 98.141C40.8032 99.5747 41.2017 101.088 41.2017 102.84C41.2017 104.593 40.8032 106.186 39.9266 107.54C39.0499 108.973 37.9342 110.009 36.42 110.805C34.9058 111.602 33.3119 112 31.3992 112C29.5662 112 27.8926 111.602 26.3784 110.805ZM34.2682 107.779C35.1449 107.301 35.7824 106.584 36.2606 105.787C36.7388 104.991 36.9779 103.955 36.9779 102.84C36.9779 101.725 36.7388 100.769 36.2606 99.8933C35.7824 99.0172 35.1449 98.38 34.2682 97.9021C33.3916 97.4242 32.4352 97.1852 31.3992 97.1852C30.3632 97.1852 29.4068 97.4242 28.5302 97.9021C27.6535 98.38 27.016 99.0968 26.5378 99.8933C26.0596 100.769 25.8205 101.725 25.8205 102.84C25.8205 103.955 26.0596 104.911 26.5378 105.787C27.016 106.664 27.6535 107.301 28.5302 107.779C29.4068 108.257 30.3632 108.495 31.3992 108.495C32.4352 108.495 33.3916 108.257 34.2682 107.779Z" />
                    <path d="M106.393 110.805C104.879 110.009 103.763 108.894 102.886 107.54C102.01 106.106 101.611 104.593 101.611 102.84C101.611 101.088 102.01 99.4951 102.886 98.141C103.763 96.7073 104.879 95.6719 106.393 94.8754C107.907 94.0789 109.581 93.6807 111.414 93.6807C113.247 93.6807 114.92 94.0789 116.435 94.8754C117.949 95.6719 119.065 96.787 119.941 98.141C120.818 99.5747 121.216 101.088 121.216 102.84C121.216 104.593 120.818 106.186 119.941 107.54C119.065 108.973 117.949 110.009 116.435 110.805C114.92 111.602 113.327 112 111.414 112C109.581 112 107.907 111.602 106.393 110.805ZM114.283 107.779C115.16 107.301 115.797 106.584 116.275 105.787C116.753 104.991 116.993 103.955 116.993 102.84C116.993 101.725 116.753 100.769 116.275 99.8933C115.797 99.0172 115.16 98.38 114.283 97.9021C113.406 97.4242 112.45 97.1852 111.414 97.1852C110.378 97.1852 109.421 97.4242 108.545 97.9021C107.668 98.38 107.031 99.0968 106.552 99.8933C106.074 100.769 105.835 101.725 105.835 102.84C105.835 103.955 106.074 104.911 106.552 105.787C107.031 106.664 107.668 107.301 108.545 107.779C109.421 108.257 110.378 108.495 111.414 108.495C112.45 108.495 113.406 108.257 114.283 107.779Z" />
                    <path d="M88.0629 94.2382H85.1939H84.3172H83.2015C83.2812 94.2382 83.9985 94.3178 85.3533 95.5922C86.3096 96.4683 87.7441 97.5038 89.6568 97.8224C93.2431 98.2206 95.0761 99.8933 95.0761 102.681C95.0761 105.708 92.7649 107.46 88.1426 107.46H82.5639V97.6631V96.3887V94.955V94.1585H78.3401H77.7822C77.7822 94.1585 78.3401 95.4329 78.3401 95.9108V109.531C78.3401 110.088 77.7822 111.283 77.7822 111.283H78.3401H88.7005C96.7497 111.283 99.4593 106.504 99.4593 102.681C99.3 95.9904 94.2791 94.2382 88.0629 94.2382Z" />
                </svg>
            </div>
            <button id="login-button" onClick={() => { handleLogin() }}>登录</button>
        </div >
    )
});