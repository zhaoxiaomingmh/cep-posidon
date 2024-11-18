import { Login, LoginRef } from "@/pages/welcome/Login";
import psHandler from "@/service/handler";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef } from "react";

interface AppRefType { };
interface AppProps { }

export const AppRef = React.createRef<AppRefType>();

export const App = forwardRef<AppRefType, AppProps>((props, ref) => {
    
    const user = useUserStore(state => state.getUser());
    const handler = psHandler;

    const onClick = () => {
        handler.getActiveLayerName();
    }

    return (
        <div className="App">
            {
                user ?
                    <div>
                        <button onClick={() => { onClick() }}>点击获取信息</button>
                    </div>
                    :
                    <Login ref={LoginRef} />
            }
        </div>
    );
});