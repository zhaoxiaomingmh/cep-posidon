import { Login, LoginRef } from "@/pages/welcome/Login";
import useUserStore from "@/store/modules/userStore";
import React, { forwardRef } from "react";

interface AppRefType { };
interface AppProps { }

export const AppRef = React.createRef<AppRefType>();

export const App = forwardRef<AppRefType, AppProps>((props, ref) => {
    const user = useUserStore(state => state.getUser());

    return (
        <div className="App">
            {
                user ?
                    <div>
                        <button >点击获取信息</button>
                    </div>
                    :
                    <Login ref={LoginRef} />
            }
        </div>
    );
});