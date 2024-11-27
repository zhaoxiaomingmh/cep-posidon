
import React, { forwardRef } from "react";
import "./artbook.scss";
import { IGalleryItem } from "@/store/iTypes/iTypes";
import { transparent } from "@/utlis/const";

type ArtbookRefType = {};
type ArtbookProps = {
    file: IGalleryItem,
    background: number,
    enterTheFolder: (file: IGalleryItem) => void,
};
export const ArtbookRef = React.createRef<ArtbookRefType>();
export const Artbook = forwardRef<ArtbookRefType, ArtbookProps>((props, ref) => {

    const getBackgroundColor = (type: number): string => {
        if (type == 0) return null;
        if (type == 1) return "#ffffff";
        if (type == 2) return "#787878";
        if (type == 3) return "#000000";
    }

    return (
        <div className="artbook-container" onDoubleClick={() => { props.enterTheFolder(props.file) }}>
            <div className="preview-content" key={"preview-content-1"}>
                {props.file.files.map((file, index) => {
                    if (index < 2) {
                        return (
                            file.isFile ?
                                <div className="preview-box"
                                    key={index}
                                    style={{
                                        backgroundImage: props.background == 0 ? `url(${transparent})` : null,
                                        backgroundSize: props.background == 0 ? 'cover' : null,
                                        backgroundPosition: props.background == 0 ? 'center' : null,
                                        backgroundRepeat: props.background == 0 ? 'no-repeat' : null,
                                        background: getBackgroundColor(props.background)
                                    }}
                                >
                                    <img src={file.thumb} />
                                </div>
                                :
                                <div className="preview-box" key={index}>
                                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M28.4937 18.5031C28.4937 18.7692 28.5997 19.0243 28.7884 19.2124C28.9771 19.4006 29.233 19.5063 29.4999 19.5063C29.7668 19.5063 30.0227 19.4006 30.2114 19.2124C30.4001 19.0243 30.5062 18.7692 30.5062 18.5031C30.5062 18.2371 30.4001 17.9819 30.2114 17.7938C30.0227 17.6057 29.7668 17.5 29.4999 17.5C29.233 17.5 28.9771 17.6057 28.7884 17.7938C28.5997 17.9819 28.4937 18.2371 28.4937 18.5031Z" fill="#C0C0C0" />
                                        <path d="M29.4998 21.4969C28.9436 21.4969 28.4936 21.9468 28.4936 22.5V25.0219C28.4936 26.125 27.5967 27.0219 26.4936 27.0219H6.51543C5.4123 27.0219 4.51543 26.125 4.51543 25.0219V7.03123C4.51543 5.9281 5.4123 5.03123 6.51543 5.03123H13.4686L16.0529 9.50935C16.2592 9.8656 16.6529 10.0469 17.0373 10.0031H26.4904C27.5936 10.0031 28.4904 10.9 28.4904 12.0031V14.5031C28.4904 15.0562 28.9404 15.5062 29.4967 15.5062C30.0529 15.5062 30.5029 15.0562 30.5029 14.5031C30.5029 14.4781 30.5029 14.4531 30.4998 14.4281V12.0062C30.4998 10.2812 29.4092 8.81248 27.8779 8.24998V8.21873C27.8779 6.08748 26.1342 4.34373 24.0029 4.34373H15.3811L14.9186 3.5406C14.6873 3.13748 14.3561 3.03435 14.0654 3.0406L14.0623 3.03748H6.50293C4.29355 3.03748 2.50293 4.8281 2.50293 7.03748V24.9781C2.50293 27.1875 4.29355 28.9781 6.50293 28.9781H26.5029C28.7123 28.9781 30.5029 27.1875 30.5029 24.9781V22.575C30.5061 22.55 30.5061 22.525 30.5061 22.5C30.5061 21.9468 30.0561 21.4969 29.4998 21.4969ZM23.8467 6.33748C24.8342 6.33748 25.6592 7.06248 25.8186 8.00623H17.4967L16.5342 6.33748H23.8467Z" fill="#C0C0C0" />
                                    </svg>
                                </div>
                        );
                    }
                })}
            </div>
            <div className="preview-content" key={"preview-content-2"}>
                {props.file.files.map((file, index) => {
                    if (index > 1 && index < 4) {
                        return (
                            file.isFile ?
                                <div className="preview-box"
                                    key={index}
                                    style={{
                                        backgroundImage: props.background == 0 ? `url(${transparent})` : null,
                                        backgroundSize: props.background == 0 ? 'cover' : null,
                                        backgroundPosition: props.background == 0 ? 'center' : null,
                                        backgroundRepeat: props.background == 0 ? 'no-repeat' : null,
                                        background: getBackgroundColor(props.background)
                                    }}
                                >
                                    <img src={file.thumb} />
                                </div>
                                :
                                <div className="preview-box" key={index}>
                                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M28.4937 18.5031C28.4937 18.7692 28.5997 19.0243 28.7884 19.2124C28.9771 19.4006 29.233 19.5063 29.4999 19.5063C29.7668 19.5063 30.0227 19.4006 30.2114 19.2124C30.4001 19.0243 30.5062 18.7692 30.5062 18.5031C30.5062 18.2371 30.4001 17.9819 30.2114 17.7938C30.0227 17.6057 29.7668 17.5 29.4999 17.5C29.233 17.5 28.9771 17.6057 28.7884 17.7938C28.5997 17.9819 28.4937 18.2371 28.4937 18.5031Z" fill="#C0C0C0" />
                                        <path d="M29.4998 21.4969C28.9436 21.4969 28.4936 21.9468 28.4936 22.5V25.0219C28.4936 26.125 27.5967 27.0219 26.4936 27.0219H6.51543C5.4123 27.0219 4.51543 26.125 4.51543 25.0219V7.03123C4.51543 5.9281 5.4123 5.03123 6.51543 5.03123H13.4686L16.0529 9.50935C16.2592 9.8656 16.6529 10.0469 17.0373 10.0031H26.4904C27.5936 10.0031 28.4904 10.9 28.4904 12.0031V14.5031C28.4904 15.0562 28.9404 15.5062 29.4967 15.5062C30.0529 15.5062 30.5029 15.0562 30.5029 14.5031C30.5029 14.4781 30.5029 14.4531 30.4998 14.4281V12.0062C30.4998 10.2812 29.4092 8.81248 27.8779 8.24998V8.21873C27.8779 6.08748 26.1342 4.34373 24.0029 4.34373H15.3811L14.9186 3.5406C14.6873 3.13748 14.3561 3.03435 14.0654 3.0406L14.0623 3.03748H6.50293C4.29355 3.03748 2.50293 4.8281 2.50293 7.03748V24.9781C2.50293 27.1875 4.29355 28.9781 6.50293 28.9781H26.5029C28.7123 28.9781 30.5029 27.1875 30.5029 24.9781V22.575C30.5061 22.55 30.5061 22.525 30.5061 22.5C30.5061 21.9468 30.0561 21.4969 29.4998 21.4969ZM23.8467 6.33748C24.8342 6.33748 25.6592 7.06248 25.8186 8.00623H17.4967L16.5342 6.33748H23.8467Z" fill="#C0C0C0" />
                                    </svg>
                                </div>
                        );
                    }
                })}
            </div>
            <div className="file-name-bar">
                <span
                    style={{
                        fontSize: "12px",
                        width: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis"
                    }}
                >{props.file.name}</span>

                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L1 9" stroke="white" />
                </svg>
            </div>
        </div>
    );
})