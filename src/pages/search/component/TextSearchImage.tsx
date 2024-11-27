import { IDownloader, IGalleryItem, ImageFormat, ISearchItem, ISearchResult, IStorehouseType } from "@/store/iTypes/iTypes";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import './index.scss'
import { NoSVNLibrary } from "@/hooks/gallery/NoSVNLibrary";
import reService from "@/service/resourceService";
import useUserStore from "@/store/modules/userStore";
import iService from "@/service/service";
import { useTranslation } from "react-i18next";
import { Gallery } from "@/hooks/gallery/Gallery";
import { psConfig } from "@/utlis/util-env";
import { FormatCheckboxs } from "./FormatCheckboxs";
import { DropSelect, selectOption } from "./ImageSearchImage";

interface TextSearchImageProps {

};
interface TextSearchImageRefType {
    setSearchResult: (result: ISearchResult[] | undefined) => void,
    setProgress: (progress: number | undefined) => void,
};


const options:selectOption[] = [{
    value: 'All',
    name: '全局'
},{
    value: 'ENGINEERING',
    name: '资源库'
},{
    value: 'DESIGN',
    name: '资产库'
},{
    value: 'components',
    name: '组件库'
},{
    value: 'interfaces',
    name: '界面库'
}]
export const TextSearchImageRef = React.createRef<TextSearchImageRefType>();
export const TextSearchImage = forwardRef<TextSearchImageRefType, TextSearchImageProps>((props, ref) => {

    //全局状态
    const project = useUserStore(state => state.project);
    const myService = reService;
    const { t } = useTranslation();
    //局部状态
    const size = 10;
    const [formats, setFormats] = useState<ImageFormat[]>(['psd', 'png', 'jpg', 'comp']);
    const [assetType, setAssetType] = useState<IStorehouseType>('All');
    const [searchPa, setSearchPa] = useState<string>(undefined);
    const [storehouseState, setStorehouseState] = useState<boolean>(false);
    const [searchItems, setSearchItems] = useState<ISearchItem[]>([]);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [imgs, setImages] = useState<IGalleryItem[]>();
    const [canScroll, setCanScroll] = useState<boolean>(false);
    const [downloader, setDownloader] = useState<IDownloader>({ id: 0, progress: 0, complete: true });
    const [filterOptions, setFilterOptions] = useState<selectOption[]>(options)
    const [disableSearch, setDisableSearch] = useState<boolean>(false)
    useImperativeHandle(ref, () => {
        return {
            setSearchResult: setSearchResult,
            setProgress: setProgress
        }
    })
    useEffect(() => {
        if (!project.storehouses || project.storehouses.length === 0) {
            setDisableSearch(true)
            return
        };
        let searchs: ISearchItem[] = [];
        let filterList: selectOption[] = []
        project.storehouses.forEach(element => {
            let item: ISearchItem = {
                projectName: element.projectName,
                type: element.type,
                page: 1,
                size: size,
                canSearch: true
            }
            searchs.push(item);
            const option = options.find(el => el.value == element.type)
            filterList.push(option)
        });
        setFilterOptions(filterList)
        setSearchItems(searchs);
    }, [project.storehouses])
    useEffect(() => {
        if (!searchItems) return;
        updateState();
    }, [searchItems])
    useEffect(() => {
        setImages(undefined);
        setCanScroll(true);
        setIsSearch(false);
        setDownloader({ id: 0, progress: 0, complete: true });
        updateState();
    }, [assetType, formats])
    const updateState = () => {
        let svnState = false;
        let scroollState = false;
        if (assetType === 'All') {
            if (searchItems.length !== 0) {
                svnState = true;
                if (searchItems.some(item => item.canSearch === true)) scroollState = true;
            }
        } else {
            if (searchItems.some(x => x.type === assetType)) {
                svnState = true;
                if (searchItems.some(item => item.canSearch === true && item.type === assetType)) {
                    scroollState = true;
                }
            }
        }
        setStorehouseState(svnState);
        setCanScroll(scroollState);
    }
    const toSearchImage = async (clear: boolean) => {
        if (isSearch) return;
        if (!storehouseState) return;
        if (!searchPa) return;
        setIsSearch(true);
        if (clear) {
            const newItems: ISearchItem[] = searchItems
                .filter(item => (item.type === assetType || assetType === 'All'))
                .map(item => {
                    return {
                        projectName: item.projectName,
                        type: item.type,
                        page: 1,
                        size: size,
                        canSearch: true
                    };
                });
            setCanScroll(true);
            setImages([])
            iService.searchImage(project.id, searchPa, newItems, formats, 1)
        } else {
            const newItems: ISearchItem[] = searchItems
                .filter(item => item.canSearch === true && (item.type === assetType || assetType === 'All'))
                .map(item => {
                    return {
                        projectName: item.projectName,
                        type: item.type,
                        page: item.page + 1,
                        size: size,
                        canSearch: item.canSearch
                    };
                });
            iService.searchImage(project.id, searchPa, newItems, formats, 1)
            setIsSearch(true);
        }
    }
    const setSearchResult = (data: ISearchResult[]) => {
        if (!data) {
            setIsSearch(false);
            setDownloader({ id: 0, progress: 0, complete: true });
            return;
        }
        if (!isSearch) return;
        let allImgs: IGalleryItem[] = [];
        let pros: string[] = [];
        data.forEach(item => {
            if (item.isTotal) {
                pros.push(item.projectName);
            }
            let addImgs: IGalleryItem[] = [];
            item.data.forEach(i => {
                if (imgs && imgs.some(img => img.id === i.id)) return;
                let son: IGalleryItem = {
                    id: i.id,
                    dis: i.dis,
                    isFile: true,
                    name: i.name,
                    format: i.ext as ImageFormat,
                    fileUrl: i.path,
                    thumb: `data:image/png;base64,` + i.thumbnail,
                    projectName: item.projectName
                };
                addImgs.push(son);
            });

            allImgs = [...allImgs, ...addImgs];
        });
        const updatedItems = searchItems.map(item =>
            pros.includes(item.projectName) ? { ...item, canSearch: false } : item
        );
        setSearchItems(updatedItems);
        allImgs.sort((a, b) => a.dis - b.dis);
        setImages(prevImages => prevImages ? [...prevImages, ...allImgs] : allImgs);
        setIsSearch(false);
    }
    const changeFormats = (format: ImageFormat) => {
        setFormats((prevFormats) => {
            if (prevFormats.includes(format)) {
                return prevFormats.filter((f) => f !== format);
            } else {
                return [...prevFormats, format];
            }
        });
    };
    const scrollBottom = () => {
        if (!canScroll) return;
        if (isSearch) return;
        setIsSearch(true);
        toSearchImage(false);
    }
    const downloadFile = (img: IGalleryItem) => {
        if (!downloader.complete) {
            // ExDialogRef.current.showMessage("注意", "有任务正在下载中，请稍后...", 'info');
            return;
        }
        setDownloader({ id: img.id, progress: 0, complete: false });
        myService.downloadFile(img, 'textRef', project);
    }
    const setProgress = (progress: number | undefined) => {
        if (downloader.complete) return;
        console.log('progress', progress);
        if (!progress) {
            setDownloader({
                ...downloader,
                complete: true,
                progress: 100
            })
        } else {
            setDownloader({
                ...downloader,
                progress: progress
            })
        }
    }

    return (
        <div className="image-search-image-container">
            {
                !project
                &&
                <NoSVNLibrary desc={"请先选择一个可用的项目"} />
            }
            {
                project
                &&
                <div className={`image-search-image-search-box ${disableSearch?'disabled':''}`}>
                    <DropSelect isDisabled={disableSearch} options={options} onChange={(val) => {
                                const value = val;
                                setAssetType(value)
                            }}></DropSelect>
                    <div className="image-search-image-input" >
                        <input type="text"
                            className="searchInput"
                            placeholder="支持中英文，英文适配度更高"
                            disabled={disableSearch}
                            onChange={(event) => {
                                setSearchPa(event.target.value);
                            }} />
                    </div>
                    <div className="image-search-image-button">
                        <div className="image-search-image-button-desc" onClick={() => { toSearchImage(true) }} >
                            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5068" id="mx_n_1728554227250" width="16" height="16"><path d="M663.006587 602.400314l-32.11848 0-12.063745-12.080118c40.177008-44.250786 64.278915-104.586905 64.278915-168.934382 0-144.831451-116.607671-261.4381-261.439123-261.4381-144.787449 0-261.386934 116.606648-261.386934 261.4381 0 144.831451 116.598462 261.387958 261.386934 261.387958 64.390455 0 124.725551-24.09372 168.993733-64.279938l12.011556 12.081141 0 32.162482 201.112213 201.051838 60.32691-60.335096L663.006587 602.400314zM421.664154 602.400314c-100.589875 0-181.021662-80.43281-181.021662-181.014499 0-100.641041 80.43281-181.014499 181.021662-181.014499 100.624668 0 181.005289 80.373458 181.005289 181.014499C602.669443 521.967504 522.288822 602.400314 421.664154 602.400314" p-id="5069" fill="#ffffff"></path></svg>
                            <span>{t("asset_search.lable2")}</span>
                        </div>
                    </div>
                </div>
            }
            {/* {
                (project && !project.storehouses)
                &&
                <NoSVNLibrary desc={"暂未设置仓库地址，请点击"} url={psConfig.host + "/project/" + project.id + "/TeamDetail"} clickDesc={"这里"} gotoSet={"前往设置"} />
            } */}
            {
                storehouseState?
                <Gallery files={imgs} isSearch={isSearch} canScroll={canScroll} scrollBottom={scrollBottom} downloader={downloader} toDownload={downloadFile}  >
                    <FormatCheckboxs key={"FormatCheckboxs"} formats={formats} changeFormats={changeFormats} />
                </Gallery>:
                <NoSVNLibrary desc={"暂未设置仓库地址，请点击"} url={psConfig.host + "/project/" + project.id + "/TeamDetail"} clickDesc={"这里"} gotoSet={"前往设置"} />
            }
        </div>
    );
})