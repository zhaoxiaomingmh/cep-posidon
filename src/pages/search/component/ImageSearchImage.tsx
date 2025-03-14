import { NoSVNLibrary } from "@/hooks/gallery/NoSVNLibrary";
import { IDownloader, IFile, IGalleryItem, ImageFormat, ISearchItem, ISearchResult, IStorehouseType } from "@/store/iTypes/iTypes";
import useUserStore from "@/store/modules/userStore";
import { psConfig } from "@/utlis/util-env";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { forwardRef } from "react";
import path from 'path'
import iService from "@/service/service";
import { Gallery } from "@/hooks/gallery/Gallery";
import { FormatCheckboxs } from "./FormatCheckboxs";
import reService from "@/service/resourceService";

import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'
import './index.scss'

export interface selectOption {
    value: IStorehouseType,
    name: string
}

interface ImageSearchImageProps {

};
interface ImageSearchImageRefType {
    setSearchResult: (result: ISearchResult[] | undefined) => void,
    setProgress: (progress: number | undefined) => void,
};

interface DropSelectProps {
    options: selectOption[],
    onChange: (value: IStorehouseType) => void
    value?: IStorehouseType,
    isDisabled?: boolean,
}
export const DropSelect = (props: DropSelectProps) => {
    const [showSelect, setShowSelect] = useState(false)
    const [currentName, setCurrentName] = useState('全局')
    const onSelect = () => {
        if (!props.isDisabled) setShowSelect(true)
    }
    const onBlur = () => {
        setShowSelect(false)

    }


    const handleSelect = (option: { value: IStorehouseType, name: string }) => {
        props.onChange(option.value);
        setCurrentName(option.name);
        setShowSelect(false);
    }

    return <div className={`select-wrap ${props.isDisabled ? 'disabled' : ''}`}>
        <div className="select-content">
            <div className="select-trigger" onClick={onSelect}>
                <span>{currentName}</span>
                <svg width="9" height="6" viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.5 0.5L4.5 4.5L8.5 0.5" />
                </svg>
            </div>
            <ul className="select-options" style={{ display: showSelect ? "block" : '' }}>
                {props.options.map((option) => <li key={option.value} onClick={() => handleSelect(option)}>{option.name}</li>)}
            </ul>
        </div>
        <div className="outSelect" style={{ display: showSelect ? "block" : '' }} onClick={onBlur}></div>
    </div>
}

interface segmentProps {
    images: string[];
    bgType: number;
    onSearch: (index: number) => void;
}

const SegmentList = (props: segmentProps) => {
    const [currentIndex, setCurrentIndex] = useState(-1)
    const handleSegmentSearch = (imgBase64: string, idx: number) => {
        setCurrentIndex(idx)
        props.onSearch(idx)
    }
    return <div className="segment-wrap">
        <PerfectScrollbar onScrollY={() => {
            console.log('onScrollY');
        }}>
            {props.images.map((image, idx) => {
                return <div key={idx} className={`segment-item backgroundType_${props.bgType} ${currentIndex == idx ? 'selected' : ''}`} onClick={() => handleSegmentSearch(image, idx)}><img src={image} /></div>
            })}
        </PerfectScrollbar>
    </div>
}

const options: selectOption[] = [{
    value: 'All',
    name: '全局'
}, {
    value: 'ENGINEERING',
    name: '资源库'
}, {
    value: 'DESIGN',
    name: '资产库'
}, {
    value: 'components',
    name: '组件库'
}, {
    value: 'interfaces',
    name: '界面库'
}]

export const ImageSearchImageRef = React.createRef<ImageSearchImageRefType>();
export const ImageSearchImage = forwardRef<ImageSearchImageRefType, ImageSearchImageProps>((props, ref) => {
    //全局状态
    const project = useUserStore(state => state.project);
    const myService = reService;
    //局部状态
    const size = 10;
    const [formats, setFormats] = useState<ImageFormat[]>(['psd', 'png', 'jpg']);
    const [assetType, setAssetType] = useState<IStorehouseType>('All');
    const [searchFile, setSearchFile] = useState<IFile>(undefined);
    const [storehouseState, setStorehouseState] = useState<boolean>(false);
    const [searchItems, setSearchItems] = useState<ISearchItem[]>([]);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [imgs, setImages] = useState<IGalleryItem[]>();
    const [canScroll, setCanScroll] = useState<boolean>(false);
    const [downloader, setDownloader] = useState<IDownloader>({ id: 0, progress: 0, complete: true });
    const [filterOptions, setFilterOptions] = useState<selectOption[]>(options)
    const [disableSearch, setDisableSearch] = useState<boolean>(false)
    const [bgType, setBgType] = useState<number>(0)
    const [segmentImages, setSegmentImages] = useState<string[]>([]) //图片分段元素URL
    const [sub, setSub] = useState<number>(-1) //记录子元素的index,如果为-1则不使用子元素去搜索
    useImperativeHandle(ref, () => {
        return {
            setSearchResult: setSearchResult,
            setProgress: setProgress
        }
    })
    useEffect(() => {
        if (!project?.storehouses?.length) {
            setDisableSearch(true)
            return
        }
        setDisableSearch(false)
        let searchs: ISearchItem[] = [];
        let filterList: selectOption[] = []

        project?.storehouses.forEach(element => {
            let item: ISearchItem = {
                projectName: element.projectName,
                type: element.type,
                page: 1,
                size: size,
                canSearch: true
            }
            searchs.push(item);

            const option = options.find(el => el.value == element.type)
            if (!filterList.some(o => o.value === option.value)) {
                filterList.push(option);
            }
        }, []);

        setFilterOptions(filterList)
        setSearchItems(searchs);
    }, [project?.storehouses])
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
            if (searchItems.length != 0) {
                svnState = true;
                if (searchItems.some(item => item.canSearch === true)) scroollState = true;
            }
        } else {
            if (searchItems.some(x => x.type == assetType)) {
                svnState = true;
                if (searchItems.some(item => item.canSearch === true && item.type === assetType)) {
                    scroollState = true;
                }
            }
        }
        setStorehouseState(svnState);
        setCanScroll(scroollState);
    }
    const loadImage = () => {
        const images = window.cep.fs.showOpenDialog(false, false, "选择你要上传的图片", null, ["gif", "jpg", "jpeg", "png", "bmp", "webp", "svg"]);
        if (images.data.length > 0) {
            const filePath = images.data[0];
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath);
            const f: IFile = {
                name: fileName,
                ext: fileExtension,
                path: filePath,
            }
            setSub(-1)
            setSegmentImages([])
            setSearchFile(f);
            newSearch(f, -1)
            getSegmentImages(f.path)
        }
    }
    const getImageUrl = async (file: IFile): Promise<string> => {
        let imageUrl: string = undefined;
        if (!file.url) {
            imageUrl = await iService.generateImageUrl(file.path);
            if (!imageUrl) {
                // ExDialogRef.current.showMessage('失败', '生成ImageUrl失败，请联系管理员', 'error')
                alert('犯病了')
                return;
            }
        } else imageUrl = file.url

        if (imageUrl?.length > 0) {
            setSearchFile(prev => {
                return {
                    ...prev,
                    url: imageUrl,
                }
            });
        }
        return imageUrl
    }
    const newSearch = async (file: IFile, index: number) => {
        setSub(index)
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
        setIsSearch(true);
        const imgUrl = await getSearchUrl(file, index);
        if (!imgUrl) {
            alert('生成图片错误')
            return;
        }
        await iService.searchImage(project.id, imgUrl, newItems, formats, 0)
    }
    const getSegmentImages = async (path: string) => {
        const images = await iService.generateImageElement(path)
        setSegmentImages(images)
    }
    const toSearchImage = async (clear: boolean) => {
        if (isSearch) return;
        if (!storehouseState) return;
        if (!searchFile) return;
        if (!canScroll) return;
        const imageUrl = await getImageUrl(searchFile)
        if (clear) {
            setSub(-1)
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
            setIsSearch(true);
            iService.searchImage(project.id, imageUrl ? psConfig.host + imageUrl : psConfig.host + searchFile.url, newItems, formats, 0)
        } else {
            console.log('searchfile', searchFile)
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
            if (newItems.findIndex(x => x.canSearch === true) === -1) {
                setIsSearch(false);
                setCanScroll(false);
                return;
            }
            const imgUrl = await getSearchUrl(searchFile, sub);
            if (!imgUrl) {
                alert('生成图片错误')
                return;
            }
            iService.searchImage(project.id, imgUrl, newItems, formats, 0)
            setIsSearch(true);
        }
    }
    const getSearchUrl = async (file: IFile, index: number) => {
        let imgUrl = '';
        if (index > -1) {
            if (index >= segmentImages.length) { return undefined; }
            imgUrl = segmentImages[index];
        } else {
            if (!file.url || file.url?.length === 0) {
                const url = await iService.generateImageUrl(file.path)
                if (url?.length === 0) {
                    return undefined;
                }
                setSearchFile(prev => {
                    return {
                        ...prev,
                        url: url,
                    }
                });
                imgUrl = psConfig.host + url;
            } else {
                imgUrl = psConfig.host + file.url;
            }
        }
        console.log('imgUrl', imgUrl)
        return imgUrl;
    }
    const setSearchResult = (data: ISearchResult[]) => {
        if (!data?.length) {
            setIsSearch(false);
            setCanScroll(false);
            setDownloader({ id: 0, progress: 0, complete: true });
            return;
        }
        if (!isSearch) return;
        let allImgs: IGalleryItem[] = [];
        data.forEach(item => {
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
                    thumb: i.thumbnail.startsWith('http://') ? i.thumbnail : `data:image/png;base64,` + i.thumbnail,
                    projectName: item.projectName
                };
                addImgs.push(son);
            });

            allImgs = [...allImgs, ...addImgs];
        });
        const updatedItems = searchItems.map(item => {
            let s = data.find(x => x.projectName == item.projectName)
            if (s) {
                let newS: ISearchItem = {
                    projectName: s.projectName,
                    type: item.type,
                    page: s.page,
                    size: item.size,
                    canSearch: s.page === 10 ? false : !s.isTotal
                }
                return newS
            } else {
                return item;
            }
        });
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
        myService.downloadFile(img, 'imgRef', project);
    }
    const setProgress = (progress: number | undefined) => {
        if (downloader.complete) return;
        if (progress === -1 || progress === 100) {
            setDownloader({
                ...downloader,
                complete: true,
                progress: 100
            })
        } else {
            setDownloader({
                ...downloader,
                progress: progress,
            })
        }
    }
    const handleSegSearch = (index: number) => {
        newSearch(searchFile, index)
    }

    //是否为合法的base64图片url
    const isValidBase64Image = (imageBase64) => {
        return /^data:image\/([a-zA-Z]*);base64,/.test(imageBase64);
    }

    const handleFile = (file:File) => {
        if(file!=null && file.type!=null){
            const isImage = file.type.startsWith('image/');
            if(isImage){
                const reader = new FileReader();
                reader.onload = async(e) => {
                    console.log(e);
                    const binaryData = e.target.result as ArrayBuffer
                    const blobData = new Blob([binaryData])
                    const formData = new FormData();
                    formData.append("file", blobData, file.name);
                    const imgurl = await iService.generateFormDataUrl(formData)
                    console.log(formData, blobData, file.name, imgurl);
                    const f:IFile = {
                        name: file.name,
                        ext: file.type,
                        path: '',
                        url: imgurl
                    }
                    setSearchFile(f)
                    newSearch(f, -1)
                    const images = await iService.generateFormDataImageElement(formData)
                    setSegmentImages(images)

                }
                reader.readAsArrayBuffer(file)
            }else{
                //提示粘贴的必须是图片,而不能是其他类型文件
            }
        }
    }

    const  handlePaste = async(e) => {

        if (e.clipboardData.files.length) {
            const fileObject = e.clipboardData.files[0];
            handleFile(fileObject)
            
        } else {
            alert('No image data was found in your clipboard. Copy an image first or take a screenshot.');
        }
    };

    const handleDrop = async(e) => {
        e.preventDefault();
        if(e.dataTransfer.files.length) {
            const fileObject = e.dataTransfer.files[0]
            handleFile(fileObject)
        } else {

        }
        
    }

    const handleInputChange = (e) => {
        console.log(e);
        setSearchFile(undefined)
        
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
                <div className={`image-search-image-search-box ${disableSearch ? 'disabled' : ''}`}>
                    <DropSelect isDisabled={disableSearch} options={filterOptions} onChange={(val) => {
                        const value = val as IStorehouseType;
                        setAssetType(value)
                    }}></DropSelect>
                    {/* <div className="image-search-image-input"
                        onClick={async () => {
                            if (!disableSearch) loadImage();
                        }}>
                        {
                            !searchFile
                            &&
                            <span style={{
                                fontStyle: 'italic',
                                fontSize: "12px",
                                marginLeft: "5px",
                            }}>
                                {"请选择文件进行上传"}
                            </span>
                        }
                        {
                            searchFile
                            &&
                            <div className="image-search-image-file">
                                <img style={{ width: "36px", height: "36px", objectFit: "contain" }}
                                    src={searchFile.path} />
                                <span>{searchFile.name}</span>
                            </div>
                        }
                    </div> */}
                    <div className="image-search-image-input">
                        {
                            searchFile&& <div className="image-wrap">
                                <img src={searchFile.path?.length>0?searchFile.path:psConfig.host+searchFile.url} />
                            </div>
                        }
                        <input type="text" onPaste={handlePaste} onDrop={handleDrop} placeholder="黏贴截图或拖入图片" onChange={handleInputChange} value={searchFile?searchFile.name:''} />
                    </div>
                    <div className="image-search-image-button">
                        <div className="image-search-image-button-desc" onClick={() => { toSearchImage(true) }} >
                            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5068" id="mx_n_1728554227250" width="16" height="16"><path d="M663.006587 602.400314l-32.11848 0-12.063745-12.080118c40.177008-44.250786 64.278915-104.586905 64.278915-168.934382 0-144.831451-116.607671-261.4381-261.439123-261.4381-144.787449 0-261.386934 116.606648-261.386934 261.4381 0 144.831451 116.598462 261.387958 261.386934 261.387958 64.390455 0 124.725551-24.09372 168.993733-64.279938l12.011556 12.081141 0 32.162482 201.112213 201.051838 60.32691-60.335096L663.006587 602.400314zM421.664154 602.400314c-100.589875 0-181.021662-80.43281-181.021662-181.014499 0-100.641041 80.43281-181.014499 181.021662-181.014499 100.624668 0 181.005289 80.373458 181.005289 181.014499C602.669443 521.967504 522.288822 602.400314 421.664154 602.400314" p-id="5069" fill="#ffffff"></path></svg>
                            <span>{("搜索")}</span>
                        </div>
                    </div>
                </div>
            }
            {
                segmentImages?.length > 0 && <SegmentList images={segmentImages} bgType={bgType} onSearch={img => handleSegSearch(img)}></SegmentList>
            }
            {/* {
                (project && !project.storehouses)
                &&
                <NoSVNLibrary desc={"暂未设置仓库地址，请点击"} url={psConfig.host + "/project/" + project.id + "/TeamDetail"} clickDesc={"这里"} gotoSet={"前往设置"} />
            } */}
            {
                (project?.storehouses?.length && storehouseState) ?
                    <Gallery files={imgs} isSearch={isSearch} canScroll={canScroll} scrollBottom={scrollBottom} downloader={downloader} toDownload={downloadFile} onChangeBg={bgType => setBgType(bgType)} >
                        <FormatCheckboxs key={"FormatCheckboxs"} formats={formats} changeFormats={changeFormats} />
                    </Gallery> :
                    <div>
                        {
                            project &&
                            <NoSVNLibrary desc={"暂未设置仓库地址，请点击"} url={psConfig.host + "/project/" + project?.id + "/TeamDetail"} clickDesc={"这里"} gotoSet={"前往设置"} />
                        }
                    </div>
            }
        </div>
    );
})