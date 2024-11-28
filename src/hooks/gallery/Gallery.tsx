import React, { useRef, useState } from "react";
import { forwardRef } from "react";
import './Gallery.scss'

import { NoSVNLibrary } from "./NoSVNLibrary";
import { IDownloader, IGalleryItem } from "@/store/iTypes/iTypes";
import { Loading } from "../loading/Loading";
import { PreviewBox } from "./PreviewBox";
import { Artbook } from "./Artbook";
import { bg } from "@/utlis/const";



export type GalleryProps = {
    children: React.ReactNode;
    files: IGalleryItem[];
    isSearch: boolean;
    canScroll: boolean;
    scrollBottom: Function,
    downloader: IDownloader,
    toDownload: (img: IGalleryItem) => void,
    enterTheFolder?: (item: IGalleryItem) => void,
    onChangeBg?: (bgType: number) => void,
};
type GalleryRefType = {};
export const GalleryRef = React.createRef<GalleryRefType>();
export const Gallery = forwardRef<GalleryRefType, GalleryProps>((props, ref) => {

    const [background, setBackground] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleScroll = () => {
        if (containerRef.current && props.canScroll && !props.isSearch && props.files) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight) {
                props.scrollBottom();
            }
        }
    };

    const changeBg = (type:number) => {
        setBackground(type)
        props.onChangeBg(type)
    }

    return (
        <div className="gallery-container" >
            <div className="gallery-header">
                {props.children}
                <div className="background-checkboxs">
                    <div
                        key={"background-checkbox-1"}
                        className="background-checkbox"
                        style={{
                            background: "#ffffff",
                            borderColor: background === 1 ? "#1f88ea" : "",
                        }}
                        onClick={() => { changeBg(1); }}
                    />
                    <div
                        key={"background-checkbox-2"}
                        className="background-checkbox"
                        style={{
                            background: "#787878",
                            borderColor: background === 2 ? "#1f88ea" : "",
                        }}
                        onClick={() => { changeBg(2) }}
                    />
                    <div
                        key={"background-checkbox-3"}
                        className="background-checkbox"
                        style={{
                            background: "#000000",
                            borderColor: background === 3 ? "#1f88ea" : "",
                        }}
                        onClick={() => {
                            changeBg(3);
                        }}
                    />
                    <div
                        key={"background-checkbox-0"}
                        className="background-checkbox"
                        style={{
                            backgroundImage: `url(${bg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            borderColor: background === 0 ? "#1f88ea" : "",
                        }}
                        onClick={() => { changeBg(0); }}
                    />

                </div>
            </div>
            {
                props.files ? <div className="image-gallery" ref={containerRef} onScroll={handleScroll} >
                    {
                        props.files?.map((file, index) => {
                            if (file.isFile) {
                                return <PreviewBox
                                    key={index}
                                    background={background}
                                    callback={props.toDownload}
                                    downloadBody={props.downloader}
                                    img={file}
                                />
                            } else {
                                return <Artbook
                                    background={background}
                                    file={file}
                                    key={index}
                                    enterTheFolder={props.enterTheFolder} />
                            }
                        })
                    }
                    {
                        props.files
                        &&
                        <div className="image-gallery-hint">
                            {
                                props.isSearch &&
                                <Loading />
                            }
                            {
                                !props.isSearch &&
                                <div>
                                    {
                                        !props.canScroll &&
                                        <span>已经拉倒底了</span>
                                    }
                                    {
                                        props.canScroll
                                        &&
                                        <span style={{
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            color: "#efefef",
                                        }}>下拉进行刷新</span>
                                    }
                                </div>
                            }
                        </div>
                    }
                </div> : <NoSVNLibrary desc="这里是空空如也。。。" />
            }
        </div>
    );
})