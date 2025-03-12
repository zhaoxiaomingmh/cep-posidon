import { NoSVNLibrary } from "@/hooks/gallery/NoSVNLibrary";
import levService from "@/service/levelService";
import iService from "@/service/service";
import { IDownloader, IFunctionName, IGalleryItem, ImageFormat, IPath, ISvnPsdGroup, ISvnPsdGroupItem } from "@/store/iTypes/iTypes";
import useUserStore from "@/store/modules/userStore";
import { psConfig } from "@/utlis/util-env";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { PsdLevelBar, PsdLevelBarRef } from "./component/PsdLevelBar";
import { Gallery } from "@/hooks/gallery/Gallery";
import { TreePath } from "./component/TreePath";
import path from "path";

type PsdLevelProps = {
}
type PsdLevelRefType = {
    setLevelGroup: (group: ISvnPsdGroup[]) => void
    setProgress: (progress: number | undefined) => void,
};
export const PsdLevelRef = React.createRef<PsdLevelRefType>();
export const PsdLevel = forwardRef<PsdLevelRefType, PsdLevelProps>((props, ref) => {
    const size: number = 20;
    const project = useUserStore(state => state.getProject());
    const user = useUserStore(state => state.getUser());
    const myServeice = levService;

    
    const [levelGroup, setLevelGroup] = useState<ISvnPsdGroup[]>(undefined);
    const [isCreate, setIsCreate] = useState<boolean>(false);
    const [level, setLevel] = useState<number>(1);
    const [categories, setCategories] = useState<ISvnPsdGroupItem[]>(undefined);
    const [category, setCategory] = useState<number>(undefined);
    const [dir, setDir] = useState<number>(-1);
    const [page, setPage] = useState<number>(1);
    const [canScroll, setCanScroll] = useState<boolean>(true);
    const [files, setGItems] = useState<IGalleryItem[]>(undefined);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [treePath, setTreePath] = useState<IPath[]>([]);
    const [downloader, setDownloader] = useState<IDownloader>({ id: 0, progress: 0, complete: true });
    useImperativeHandle(ref, () => {
        return {
            setLevelGroup: setLevelGroup,
            setProgress: setProgress,
        }
    })
    useEffect(() => {
        if (project?.storehouses?.length) {
            const hasTypeOne = project.storehouses.some(item => item.type === 'DESIGN');
            if (hasTypeOne) {
                setIsCreate(true)
                myServeice.getCategoryDirectory(project.id)
            } else {
                setIsCreate(false)
            }
        }
    }, [project?.storehouses])
    useEffect(() => {
        setPage(1);
        setDir(-1);
        setIsSearch(true);
        setGItems([]);
        GetGalleryItems(category, 1);
        setTreePath([{
            id: category,
            path: "根目录",
            parent: []
        }]);
    }, [category])
    useEffect(() => {
        if (!levelGroup) return;
        setPage(1)
        setCanScroll(true)
        setGItems([]);
        setDir(-1);
        const ds = levelGroup.find(x => x.parentId === level)?.dirs;
        setCategories(ds)
        if (ds && ds.length > 0) {
            var dir = ds[0];
            setCategory(dir.id)
            // setIsSearch(true)
        } else {
            setIsSearch(false)
            setCanScroll(false);
        }
    }, [levelGroup, level])
    const GetGalleryItems = async (id: number, page: number) => {
        if (!category) return;
        try {
            const data = await iService.getDirTree(id, page, 20);
            let gItems: IGalleryItem[] = [];
            data.children.forEach(file => {
                let gItem: IGalleryItem = {
                    id: file.id,
                    isFile: file.isFile,
                    name: file.name,
                }
                if (file.isFile) {
                    let extWithDot = path.extname(file.name);
                    let formate = extWithDot.startsWith('.') ? extWithDot.slice(1) : extWithDot;
                    gItem.fileUrl = file.fileUrl;
                    gItem.thumb = file.thumb;
                    gItem.svnPsdLevelId = file.svnPsdLevelId;
                    gItem.format = formate as ImageFormat;
                } else {
                    gItem.files = [];
                    file.children.forEach(child => {
                        let extWithDot = path.extname(child.name);
                        let formate = extWithDot.startsWith('.') ? extWithDot.slice(1) : extWithDot;
                        let subItem: IGalleryItem = {
                            isFile: child.isFile,
                            name: child.name,
                            id: child.id,
                            svnPsdLevelId: child.svnPsdLevelId,
                            thumb: child.thumb,
                            fileUrl: child.fileUrl,
                            format: formate as ImageFormat
                        }
                        gItem.files.push(subItem);
                    })
                }
                gItems.push(gItem)
            })
            if (data.children.length < size) {
                setCanScroll(false);
            } else {
                setCanScroll(true);
            }
            if (page > 1) {
                setGItems(prevFiles => [...prevFiles, ...gItems]);
            } else {
                setGItems(gItems);
            }
            setIsSearch(false);
            if( data.children.length > 0) {
                iService.increaseFunctionCount(IFunctionName.psdLevel, project.id, project.name, user.id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const scrollBottom = () => {
        if (!canScroll) return;
        if (isSearch) return;
        setIsSearch(true);
        const newPage = page + 1;
        setPage(newPage);
        GetGalleryItems(dir === -1 ? category : dir, newPage);
    }
    const downloadPsdFile = (img: IGalleryItem) => {
        if (!downloader.complete) {
            alert('其他文件在下载')
            return;
        }
        setDownloader({ id: img.id, progress: 0, complete: false });
        myServeice.downFile(img, project);
    }
    const returnToFolder = (path: IPath) => {
        if (treePath.length == 0) return;
        let paths: IPath[] = [];
        treePath.map((item, index) => {
            if (index < path.parent.length) {
                paths.push(item)
            }
        })
        setTreePath(paths);
        setDir(path.id);
        setPage(1);
        GetGalleryItems(path.id, 1);
    }
    const enterTheFolder = (f: IGalleryItem) => {
        if (treePath.findIndex(x => x.id === f.id) !== -1) return;
        const latest = treePath[treePath.length - 1];
        let parent = latest.parent;
        parent.push(latest.id);
        const path: IPath = {
            id: f.id as number,
            path: f.name,
            parent: parent
        }
        setTreePath([...treePath, path]);
        setDir(f.id as number);
        setPage(1);
        GetGalleryItems(f.id as number, 1);
    }
    const toRoot = () => {
        setTreePath([{
            id: category,
            path: "根目录",
            parent: []
        }]);
        setPage(1);
        setDir(-1);
        GetGalleryItems(category, 1);
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
    return (
        <div className="psd-level" style={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {!project
                &&
                <NoSVNLibrary desc={"请先选择一个可用的项目"} />
            }
            {
                (project && !isCreate)
                &&
                <NoSVNLibrary desc={"暂未设置仓库地址，请点击"} url={psConfig.host + "/project/" + project.id + "/TeamDetail"} clickDesc={"这里"} gotoSet={"前往设置"} />
            }
            {
                (levelGroup && isCreate)
                &&
                <PsdLevelBar
                    ref={PsdLevelBarRef}
                    levels={levelGroup}
                    level={level}
                    changeLevel={setLevel}
                    categories={categories}
                    category={category}
                    changeCategory={setCategory}
                    dir={dir}
                />
            }
            {
                (isCreate && files)
                &&
                <Gallery
                    files={files}
                    isSearch={isSearch}
                    canScroll={canScroll}
                    scrollBottom={scrollBottom}
                    downloader={downloader}
                    toDownload={downloadPsdFile}
                    enterTheFolder={enterTheFolder}>
                    <TreePath
                        paths={treePath}
                        toRoot={toRoot}
                        toTarget={returnToFolder}
                    />
                </Gallery>
            }
        </div>
    );
})