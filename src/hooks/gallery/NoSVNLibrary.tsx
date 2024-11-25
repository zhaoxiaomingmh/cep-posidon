import React, { forwardRef } from "react";
import './NoSVNLibrary.scss';

type NoSVNLibraryProps = {
    desc: string
    url?: string
    clickDesc?: string
    gotoSet?: string
}
type NoSVNLibraryRefType = {};
export const NoSVNLibraryRef = React.createRef<NoSVNLibraryRefType>();
export const NoSVNLibrary = forwardRef<NoSVNLibraryRefType, NoSVNLibraryProps>((props, ref) => {
    return (
        <div className="no-svn-library-container">
            <svg width="65" height="40" viewBox="0 0 65 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2029_5263)">
                    <path d="M32.5 39.7032C50.1731 39.7032 64.5 36.5925 64.5 32.7552C64.5 28.9179 50.1731 25.8071 32.5 25.8071C14.8269 25.8071 0.5 28.9179 0.5 32.7552C0.5 36.5925 14.8269 39.7032 32.5 39.7032Z" fill="#7A7979" />
                    <path d="M55.5 13.6653L45.354 2.24866C44.867 1.47048 44.156 1 43.407 1H21.593C20.844 1 20.133 1.47048 19.646 2.24767L9.5 13.6663V22.8367H55.5V13.6653Z" stroke="#D9D9D9" />
                    <path d="M42.113 16.8128C42.113 15.2197 43.107 13.9046 44.34 13.9036H55.5V31.9059C55.5 34.0132 54.18 35.7402 52.55 35.7402H12.45C10.82 35.7402 9.5 34.0122 9.5 31.9059V13.9036H20.66C21.893 13.9036 22.887 15.2167 22.887 16.8098V16.8317C22.887 18.4248 23.892 19.7111 25.124 19.7111H39.876C41.108 19.7111 42.113 18.4128 42.113 16.8198V16.8128Z" fill="#535353" stroke="#D9D9D9" />
                </g>
                <defs>
                    <clipPath id="clip0_2029_5263">
                        <rect width="64" height="40" fill="white" transform="translate(0.5)" />
                    </clipPath>
                </defs>
            </svg>
            <span>{props.desc}
                {props.url &&
                    <span onClick={() => {
                        const cs = new CSInterface();
                        cs.openURLInDefaultBrowser(props.url);
                    }}
                        style={{
                            color: "blue",
                            cursor: "pointer"
                        }}
                    >
                        {props.clickDesc}
                    </span>
                }
                {props.gotoSet}
            </span>
        </div >
    );
});