import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import './grid.scss';
import Draggable, { DraggableData } from "react-draggable";
import useDocumentStore from "@/store/modules/documentStore";
import psHandler from "@/service/handler";
import { IFunctionName, IGeneratorAction, IGridInfo, IGridParameter, IImage, ILayer, IPoint, IStatus, LayerKind } from "@/store/iTypes/iTypes";
import { psConfig } from "@/utlis/util-env";
import path from "path";
import { Button } from "antd";
import iService from "@/service/service";
import useUserStore from "@/store/modules/userStore";

type GridProps = {
}
type GridRefType = {
    refresh: (status: IStatus) => void,
    handleGridTask: (status: IStatus) => void,
    refreshStatus: IStatus,
    gridStatus: IStatus,
    setRefreshStatus: (status: IStatus) => void,

};
export const GridRef = React.createRef<GridRefType>();
export const Grid = forwardRef<GridRefType, GridProps>((props, ref) => {
    useImperativeHandle(ref, () => {
        return {
            refresh: refresh,
            handleGridTask: handleGridTask,
            refreshStatus: refreshStatus,
            gridStatus: gridStatus,
            setRefreshStatus: setRefreshStatus,
        }
    })
    //原始数据
    const project = useUserStore(state => state.getProject());
    const user = useUserStore(state => state.getUser());
    const doc = useDocumentStore(state => state.getActiveDocument());
    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const setActiveLayer = useDocumentStore(state => state.setActiveLayer);
    const [status, setStatus] = useState<IStatus>(IStatus.wait);
    const [image, setImage] = useState<IImage>(undefined);
    //初始化图片
    useEffect(() => {
        if (activeLayer && gridStatus !== IStatus.loading && refreshStatus !== IStatus.loading) {
            generateImage();
        }
    }, [activeLayer])
    const generateImage = () => {
        //先清除上一张图的缓存
        if (image?.path) {
            window.cep.fs.deleteFile(image?.path);
        }
        if (!activeLayer || (activeLayer.layerKind !== LayerKind.pixel && activeLayer.layerKind !== LayerKind.smartObject && activeLayer.layerKind !== LayerKind.group)) {
            setStatus(IStatus.error);
            return;
        }
        let id = activeLayer.id;
        if (activeLayer.layerKind === LayerKind.group) {
            //判断是不是九宫格编组,九宫格信息存储在编组里
            if (!activeLayer.generatorSettings?.comPosidonPSCep?.isGrid) {
                return;
            }
            id = JSON.parse(activeLayer.generatorSettings?.comPosidonPSCep.gridInfo).layerId;
        }
        const filename = new Date().getTime().toString();
        const filePath = path.join(psConfig.previewImageDir(), filename + ".png");
        if (window.cep.fs.stat(filePath).err === 0) {
            setImage({
                id: activeLayer.id,
                name: filename + ".png",
                path: filePath,
                width: 0,
                height: 0,
            })
            refresh(IStatus.success, filePath);
        } else {
            setStatus(IStatus.loading);
            psHandler.sendToGenerator({
                from: "com.posidon.cep.panel",
                action: IGeneratorAction.fastExport,
                data: {
                    layerId: id,
                    filename: filename,
                    path: psConfig.previewImageDir(),
                    format: "png",
                    imageExportSetting: {
                        compress: false,
                    }
                }
            })
            setImage({
                id: activeLayer.id,
                name: filename + ".png",
                path: filePath,
                width: 0,
                height: 0,
            })
        }

    }
    const refresh = (status: IStatus, path?: string) => {
        if (status === IStatus.success) {
            setStatus(IStatus.success);
            init(path);
        } else {
            setStatus(IStatus.error);
        }
    }
    const init = (fileP?: string) => {
        const imagePath = fileP ?? path.join(psConfig.previewImageDir(), image.name)
        if (window.cep.fs.stat(imagePath).err !== 0) {
            setStatus(IStatus.success);
            return;
        }
        if (imgDivRef.current && imgRef.current) {
            imgRef.current.onload = () => {
                const imgWidth = imgRef.current?.width;
                const imgHeight = imgRef.current?.height;
                console.log(`Image loaded with width: ${imgRef.current?.naturalWidth}px, height: ${imgRef.current?.naturalHeight}px`);
                if (previewRef.current) {
                    imgDivRef.current.style.left = (previewRef.current.clientWidth - imgWidth) / 2 + "px";
                    imgDivRef.current.style.top = (previewRef.current.clientHeight - imgHeight) / 2 + "px";
                }
                //设置分割线
                const leftPreviewPx = Math.round(imgWidth * 0.3);
                setLeftPosition({ x: leftPreviewPx, y: 0 });
                setLeftBounds({ left: 0, right: imgWidth - leftPreviewPx });
                setRightPosition({ x: imgWidth - leftPreviewPx, y: 0 });
                setRightBounds({ left: leftPreviewPx, right: imgWidth });
                const topDisPx = Math.round(imgHeight * 0.3);
                setTopPosition({ x: 0, y: topDisPx });
                setTopBounds({ top: 0, bottom: imgHeight - topDisPx });
                setBottomPosition({ x: 0, y: imgHeight - topDisPx });
                setBottomBounds({ top: topDisPx, bottom: imgHeight });
                setImage({ ...image, width: imgRef.current?.naturalWidth, height: imgRef.current?.naturalHeight });
                //设置input
                //左右
                const leftDisPx = Math.round(imgRef.current?.naturalWidth * 0.3);
                setLeftPx(leftDisPx)
                setLeftPer(30)
                setRightPx(leftDisPx)
                setRightPer(30)
                //上下
                const topPreviewPx = Math.round(imgRef.current?.naturalHeight * 0.3);
                setTopPx(topPreviewPx)
                setTopPer(30)
                setBottomPx(topPreviewPx)
                setBottomPer(30)
            };
            imgRef.current.src = imagePath;
        }
    }
    //画布
    const previewRef = useRef<HTMLDivElement>(null);
    const imgDivRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [canDrag, setCanDrag] = useState<boolean>(true);
    const [dragging, setDragging] = useState<boolean>(false);
    const [point, setPoint] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const handleDragStart = (style: string) => {
        if (previewRef.current) {
            previewRef.current.style.pointerEvents = 'none'; // 禁用事件处理程序
            setPoint({ x: 0, y: 0 });
            setDragging(false);
            document.body.style.cursor = style;
        }
    };
    const handleDragStop = () => {
        if (previewRef.current) {
            previewRef.current.style.pointerEvents = 'auto'; // 重新启用事件处理程序
            document.body.style.cursor = 'default';
        }
    };
    //拖拽线区
    //左拖拽线
    const left = useRef(null);
    const [leftBounds, setLeftBounds] = useState<{ left: number, right: number }>();
    const [leftPosition, setLeftPosition] = useState<{ x: number, y: number }>();
    const handleLeftDragg = (data: DraggableData) => {
        setLeftPosition({ x: data.x, y: 0 });
        setRightBounds({ left: data.x, right: imgRef?.current?.width });
        const leftDisPx = Math.round(data.x / imgRef?.current?.width * image.width);
        setLeftPx(leftDisPx);
        setLeftPer(Math.round(data.x / imgRef?.current?.width * 100));
    }
    //右拖拽线
    const right = useRef(null);
    const [rightBounds, setRightBounds] = useState<{ left: number, right: number }>();
    const [rightPosition, setRightPosition] = useState<{ x: number, y: number }>();
    const handleRightDragg = (data: DraggableData) => {
        setRightPosition({ x: data.x, y: 0 });
        setLeftBounds({ left: 0, right: data.x });
        const per = data.x / imgRef?.current?.width;
        const disPx = Math.round((1 - per) * image.width);
        setRightPx(disPx);
        setRightPer(Math.round((1 - per) * 100));
    }
    //上拖拽线
    const top = useRef(null);
    const [topBounds, setTopBounds] = useState<{ top: number, bottom: number }>();
    const [topPosition, setTopPosition] = useState<{ x: number, y: number }>();
    const handleTopDragg = (data: DraggableData) => {
        setTopPosition({ x: 0, y: data.y });
        setBottomBounds({ top: data.y, bottom: imgRef?.current?.height });
        const per = data.y / imgRef?.current?.height;
        const disPx = Math.round(per * image.height);
        setTopPx(disPx);
        setTopPer(Math.round(per * 100));
    }
    //下拖拽线
    const bottom = useRef(null);
    const [bottomBounds, setBottomBounds] = useState<{ top: number, bottom: number }>();
    const [bottomPosition, setBottomPosition] = useState<{ x: number, y: number }>();
    const handleBottomDragg = (data: DraggableData) => {
        setBottomPosition({ x: 0, y: data.y });
        setTopBounds({ top: 0, bottom: data.y });
        const per = data.y / imgRef?.current?.height;
        const disPx = Math.round((1 - per) * image.height);
        setBottomPx(disPx);
        setBottomPer(Math.round((1 - per) * 100));
    }
    //拖拽条
    const [scale, setScale] = useState<number>(50);
    const scaling = (s: number): number => {
        return (s * s * 4.2) - (s * 0.3) + 0.1;
    }
    const getDisplayValue = () => {
        const s = scaling(scale / 100);
        return Math.round(s * 100);
    }
    const addScale = () => {
        if (scale < 100) {
            setScale(scale + 1);
        }
    }
    const delScale = () => {
        if (scale > 1) {
            setScale(scale - 1);
        }
    }
    useEffect(() => {
        const value = getDisplayValue();
        const sc = value / 100;
        if (imgDivRef?.current) {
            imgDivRef.current.style.transform = `scale(${sc})`
        }
    }, [scale])
    //输入框 
    //等比
    const [proportional, setProportional] = useState<number>(30);
    const onProportionalValueChange = (per: number) => {
        if (per > 50) {
            per = 50;
        }
        if (per < 0) {
            per = 0;
        }
        setProportional(per);
        const height = Math.round(image.height * per / 100);
        const width = Math.round(image.width * per / 100);
        //先输入框
        setLeftPer(per);
        setLeftPx(width);
        setRightPer(per);
        if (width * 2 > image.width) {
            setRightPx(image.width - width);
        } else {
            setRightPx(width);
        }
        setTopPer(per);
        setTopPx(height);
        setBottomPer(per);
        if (height * 2 > image.height) {
            setBottomPx(image.height - height);
        } else {
            setBottomPx(height);
        }
        //更改分割线
        const previewWidth = Math.round(imgRef?.current?.width * per / 100);
        const previewHeight = Math.round(imgRef?.current?.height * per / 100);
        setLeftPosition({ x: previewWidth, y: 0 });
        setLeftBounds({ left: 0, right: imgRef?.current?.width - previewWidth });
        setRightPosition({ x: imgRef?.current?.width - previewWidth, y: 0 });
        setRightBounds({ left: previewWidth, right: imgRef?.current?.width });
        setTopPosition({ x: 0, y: previewHeight });
        setTopBounds({ top: 0, bottom: imgRef?.current?.height - previewHeight });
        setBottomPosition({ x: 0, y: imgRef?.current?.height - previewHeight });
        setBottomBounds({ top: previewHeight, bottom: imgRef?.current?.height });
    }
    //左输入框
    const [leftPx, setLeftPx] = useState<number>(0);
    const [leftPer, setLeftPer] = useState<number>(30);
    const onLeftPxChange = (px: number) => {
        if (px > image.width) {
            px = image.width;
        }
        if (px < 0) {
            px = 0;
        }
        //入的是实际值
        setLeftPx(px);
        //转换成实际百分比
        const per = px / image.width;
        const leftDisPer = Math.round(per * 100)
        setLeftPer(leftDisPer);

        //更改分割线
        console.log('leftBounds', leftBounds)
        const disPx = Math.round(imgRef.current.width * per)
        setLeftPosition({ x: disPx, y: 0 });
        setRightBounds({ left: disPx, right: imgRef?.current?.width });
        if (disPx > rightPosition.x) {
            setRightPosition({ x: disPx, y: 0 });
            const rightDisPer = 1 - per;
            setRightPer(Math.round(rightDisPer * 100));
            setRightPx(image.width - px);
        }
    }
    const onLeftPerChange = (per: number) => {
        if (per > 100) {
            per = 100;
        }
        if (per < 0) {
            per = 0;
        }
        let formattedNum = parseFloat(per.toFixed(2));
        setLeftPer(formattedNum);
        setLeftPx(Math.round(image.width * per / 100));
        const disPx = Math.round(imgRef.current.width * per / 100)
        setLeftPosition({ x: disPx, y: 0 });
        setRightBounds({ left: disPx, right: imgRef?.current?.width });
        if (disPx > rightPosition.x) {
            setRightPosition({ x: disPx, y: 0 });
            const rightDisPer = 100 - per;
            setRightPer(rightDisPer);
            setRightPx(Math.round(image.width * rightDisPer / 100));
        }
    }
    //右输入框
    const [rightPx, setRightPx] = useState<number>(0);
    const [rightPer, setRightPer] = useState<number>(30);
    const onRightPxChange = (px: number) => {
        if (px > image.width) {
            px = image.width;
        }
        if (px < 0) {
            px = 0;
        }
        //入的是实际值
        setRightPx(px);
        //转换成实际百分比
        const per = px / image.width;
        const disPer = Math.round(per * 100)
        setRightPer(disPer);

        //更改分割线
        const disPx = Math.round(imgRef.current.width * per)
        setRightPosition({ x: imgRef?.current?.width - disPx, y: 0 });
        setLeftBounds({ left: 0, right: imgRef?.current?.width - disPx });
        if (disPx > (imgRef?.current?.width - leftPosition.x)) {
            setLeftPosition({ x: (imgRef?.current?.width - disPx), y: 0 });
            const leftDisPer = 1 - per;
            setLeftPer(Math.round(leftDisPer * 100));
            setLeftPx(image.width - px);
        }
    }
    const onRightPerChange = (per: number) => {
        if (per > 100) {
            per = 100;
        }
        if (per < 0) {
            per = 0;
        }
        let formattedNum = parseFloat(per.toFixed(2));
        setRightPer(formattedNum);
        const rpx = Math.round(image.width * per / 100)
        setRightPx(rpx);
        const disPx = Math.round(imgRef.current.width * per / 100)
        setRightPosition({ x: imgRef?.current?.width - disPx, y: 0 });
        setLeftBounds({ left: 0, right: imgRef?.current?.width - disPx });
        if (disPx > (imgRef?.current?.width - leftPosition.x)) {
            setLeftPosition({ x: (imgRef?.current?.width - disPx), y: 0 });
            const leftDisPer = 100 - per;
            setLeftPer(Math.round(leftDisPer));
            setLeftPx(image.width - rpx);
        }
    }
    //上输入框
    const [topPx, setTopPx] = useState<number>(0);
    const [topPer, setTopPer] = useState<number>(30);
    const onTopPxChange = (px: number) => {
        if (px > image.height) {
            px = image.height;
        }
        if (px < 0) {
            px = 0;
        }
        //入的是实际值
        setTopPx(px);
        //转换成实际百分比
        const per = px / image.height;
        const disPer = Math.round(per * 100)
        setTopPer(disPer);

        //更改分割线
        const disPx = Math.round(imgRef.current.height * per)
        setTopPosition({ x: 0, y: disPx });
        setBottomBounds({ top: disPx, bottom: imgRef?.current?.height });
        if (disPx > bottomPosition.y) {
            setBottomPosition({ x: 0, y: disPx });
            const bottomDisPer = 1 - per;
            setBottomPer(Math.round(bottomDisPer * 100));
            setBottomPx(image.height - px);
        }
    }
    const onTopPerChange = (per: number) => {
        if (per > 100) {
            per = 100;
        }
        if (per < 0) {
            per = 0;
        }
        let formattedNum = parseFloat(per.toFixed(2));
        setTopPer(formattedNum);
        const tpx = Math.round(image.height * per / 100)
        setTopPx(tpx);
        const disPx = Math.round(imgRef.current.height * formattedNum / 100)
        setTopPosition({ x: 0, y: disPx });
        setBottomBounds({ top: tpx, bottom: imgRef?.current?.height });
        if (disPx > bottomPosition.y) {
            setBottomPosition({ x: 0, y: disPx });
            const bottomDisPer = 100 - formattedNum;
            setBottomPer(bottomDisPer);
            setBottomPx(image.height - tpx);
        }
    }
    //下输入框
    const [bottomPx, setBottomPx] = useState<number>(0);
    const [bottomPer, setBottomPer] = useState<number>(30);
    const onBottomPxChange = (px: number) => {
        if (px > image.height) {
            px = image.height;
        }
        if (px < 0) {
            px = 0;
        }
        //入的是实际值
        setBottomPx(px);
        //转换成实际百分比
        const per = px / image.height;
        const disPer = Math.round(per * 100)
        setBottomPer(disPer);

        //更改分割线
        const disPx = Math.round(imgRef.current.height * per)
        setBottomPosition({ x: 0, y: (imgRef?.current?.height - disPx) });
        setTopBounds({ top: 0, bottom: imgRef?.current?.height - disPx });
        if (disPx > (imgRef?.current?.height - topPosition.y)) {
            setTopPosition({ x: 0, y: (imgRef?.current?.height - disPx) });
            const topDisPer = 1 - per;
            setTopPer(Math.round(topDisPer * 100));
            setTopPx(image.height - px);
        }
    }
    const onBottomPerChange = (per: number) => {
        if (per > 100) {
            per = 100;
        }
        if (per < 0) {
            per = 0;
        }
        let formattedNum = parseFloat(per.toFixed(2));
        setBottomPer(formattedNum);
        const bpx = Math.round(image.height * per / 100)
        setBottomPx(bpx);
        const disPx = Math.round(imgRef.current.height * formattedNum / 100)
        setBottomPosition({ x: 0, y: (imgRef?.current?.height - disPx) });
        setTopBounds({ top: 0, bottom: imgRef?.current?.height - disPx });
        if (disPx > (imgRef?.current?.height - topPosition.y)) {
            setTopPosition({ x: 0, y: (imgRef?.current?.height - disPx) });
            const topDisPer = 100 - formattedNum;
            setTopPer(topDisPer);
            setTopPx(image.height - bpx);
        }
    }
    useEffect(() => {
        if (leftPer === rightPer && leftPer === rightPer && leftPer === bottomPer) {
            setProportional(leftPer);
        } else {
            setProportional(0);
        }
    }, [leftPer, rightPer, topPer, bottomPer])
    //底部按钮组
    const [gridStatus, setGridStatus] = useState<IStatus>(IStatus.wait);
    const [refreshStatus, setRefreshStatus] = useState<IStatus>(IStatus.wait);
    const generateGrid = async () => {
        if (!(activeLayer.layerKind == LayerKind.pixel || activeLayer.layerKind == LayerKind.smartObject)) {
            alert("当前图层不支持九宫格");
            return;
        }
        await iService.increaseFunctionCount(IFunctionName.grid, project.id, project.name, user.id);
        setGridStatus(IStatus.loading);
        const resolution = await psHandler.getDocumentResolution();
        let gridParameter: IGridParameter = {
            layerId: activeLayer.id,
            split: {
                leftLine: leftPx,
                rightLine: rightPx,
                topLine: topPx,
                bottomLine: bottomPx,
            },
            savePath: psConfig.gridDir(),
            resolution: parseFloat(resolution)
        }
        psHandler.sendToGenerator({
            from: "com.posidon.cep.panel",
            action: IGeneratorAction.grid,
            data: gridParameter
        })
    }
    const handleGridTask = async (status: IStatus) => {
        if (status === IStatus.error) {
            alert("生成失败，请检查参数是否正确");
            setGridStatus(IStatus.error);
            return;
        }
        const activeLayer = await psHandler.getActiveLayer();
        //读取grid信息
        const gridPath = path.join(psConfig.gridDir(), "gridInfo.json");
        if (window.cep.fs.stat(gridPath).err !== 0) {
            setGridStatus(IStatus.error);
            alert("生成失败，图片资源生成失败");
            return;
        }
        const gridBase64 = window.cep.fs.readFile(gridPath, "Base64");
        if (gridBase64.err !== 0) {
            alert("生成失败，资源转换失败");
            return;
        }
        const str = window.cep.encoding.convertion.b64_to_utf8(gridBase64.data)
        const gridInfo = JSON.parse(str) as IGridInfo;
        console.log("gridInfo", gridInfo);
        const doc = await psHandler.getActiveDocument();
        //初始 获取图层中心点
        const centerPoint: IPoint = {
            x: Math.floor(doc.width / 2),
            y: Math.round(doc.height / 2),
        }
        console.log("centerPoint", centerPoint);
        //开导
        const id = activeLayer.id;
        let generatorSettings = activeLayer.generatorSettings;
        //初始 获取到图片原点
        const layerRect: IPoint = {
            x: activeLayer.bounds.x,
            y: activeLayer.bounds.y,
        };
        console.log("nativeLayerRect", layerRect);
        //第一步创建一个编组
        const groupId: number = await psHandler.mkGroup() as number;
        const name = "[grid]" + activeLayer.name;
        console.log("创建新编组", groupId);
        await psHandler.selectLayer(groupId);
        await psHandler.renameLayer(groupId, name);
        let imgs = [];
        //导入子图层
        for (let i = 0; i < gridInfo.grid.length; i++) {
            const iGrid = gridInfo.grid[i];
            if (!iGrid.validImageInfo) {
                continue;
            }
            //计算图片offset
            //先计算原始图片原点
            const imageOrigin: IPoint = {
                x: centerPoint.x - Math.round(iGrid.rect.width / 2),
                y: centerPoint.y - Math.floor(iGrid.rect.height / 2),
            }
            const imageOffset: IPoint = {
                x: layerRect.x + iGrid.rect.left - imageOrigin.x,
                y: layerRect.y + iGrid.rect.top - imageOrigin.y,
            }
            //图片地址
            const imgDir = path.join(psConfig.gridDir(), `${iGrid.location}.png`);
            //先算出位移再移动
            if (iGrid.validImageInfo.width > 0 && iGrid.validImageInfo.height > 0) {
                let imgPart = {
                    imgDir: imgDir,
                    offsetX: imageOffset.x,
                    offsetY: imageOffset.y,
                    groupID: groupId
                }
                imgs.push(imgPart);
            }
        }
        await psHandler.suspendHistory('九宫格切图', 'gridGenerat', imgs);
        //设置原图层不可见
        await psHandler.setLayerVisible(id, false);
        //存储grid信息
        //编组Grid信息
        await psHandler.setLayerGeneratorSettings(groupId, {
            isGrid: true,
            gridInfo: JSON.stringify(gridInfo),
        })
        let cepSettings = generatorSettings?.comPosidonPSCep ?? {};
        cepSettings.isGrid = true;
        cepSettings.group = groupId;
        setGridStatus(IStatus.success);
        await psHandler.selectLayer(groupId);
        const gridLayer = await psHandler.getActiveLayer();
        setActiveLayer(gridLayer);
        alert("生成成功");
    }
    useEffect(() => {
        if (refreshStatus === IStatus.loading) {
            handleResize();
        }
    }, [refreshStatus])
    //尺寸整理
    const handleResize = async () => {
        if (!(activeLayer.layerKind === LayerKind.group && activeLayer.generatorSettings?.comPosidonPSCep?.isGrid)) {
            return;
        }
        //判断是否已经搞完了
        const layers = await psHandler.getLayersInGroup(activeLayer.id);
        const topleftLayer = layers.find(x => x.name == 'topLeft');
        const bottomLeftLayer = layers.find(x => x.name == 'bottomLeft');
        const topRightLayer = layers.find(x => x.name == 'topRight');
        const bottomRightLayer = layers.find(x => x.name == 'bottomRight');
        if (!topleftLayer && !bottomLeftLayer && !topRightLayer && !bottomRightLayer) {
            setRefreshStatus(IStatus.success)
            return;
        }
        //GridInfo 
        const gridInfo = JSON.parse(activeLayer.generatorSettings?.comPosidonPSCep?.gridInfo) as IGridInfo;
        if (topleftLayer) {
            const topleftRect = gridInfo.grid.find(x => x.location == 'topLeft')!.validImageInfo;
            if (topleftRect && (Math.abs(topleftLayer.bounds.width - topleftRect.width) < 1 && Math.abs(topleftLayer.bounds.height - topleftRect.height) < 1)) {
                setRefreshStatus(IStatus.success)
                return;
            }
        }
        if (bottomLeftLayer) {
            const bottomLeftRect = gridInfo.grid.find(x => x.location == 'bottomLeft')!.validImageInfo;
            if (bottomLeftRect && (Math.abs(bottomLeftLayer.bounds.width - bottomLeftRect.width) < 1 && Math.abs(bottomLeftLayer.bounds.height - bottomLeftRect.height) < 1)) {
                setRefreshStatus(IStatus.success)
                return;
            }
        }
        if (topRightLayer) {
            const topRightRect = gridInfo.grid.find(x => x.location == 'topRight')!.validImageInfo;
            if (topRightRect && (Math.abs(topRightLayer.bounds.width - topRightRect.width) < 1 && Math.abs(topRightLayer.bounds.height - topRightRect.height) < 1)) {
                setRefreshStatus(IStatus.success)
                return;
            }
        }
        if (bottomRightLayer) {
            const bottomRightRect = gridInfo.grid.find(x => x.location == 'bottomRight').validImageInfo;
            if (bottomRightRect && (Math.abs(bottomRightLayer.bounds.width - bottomRightRect.width) < 1 && Math.abs(bottomRightLayer.bounds.height - bottomRightRect.height) < 1)) {
                setRefreshStatus(IStatus.success)
                return;
            }
        }
        //修改首选项
        const interpolation = await psHandler.getPhotoshopPreferencesInterpolation();
        if (interpolation != "ResampleMethod.NEARESTNEIGHBOR") {
            console.log("当前插值改为最近邻插值");
            await psHandler.setPhotoshopPreferencesInterpolation("ResampleMethod.NEARESTNEIGHBOR");
        }
        await psHandler.suspendHistory('九宫格形变', 'gridDeformation', activeLayer.id);
        if (interpolation != "ResampleMethod.NEARESTNEIGHBOR") {
            var meth = interpolation as string;
            await psHandler.setPhotoshopPreferencesInterpolation(meth);
        }
        setRefreshStatus(IStatus.success)
        console.log("完成九宫格变形");
    }
    return (
        <div className="grid-container">
            <div className="grid-preview" ref={previewRef}
                onMouseUp={() => {
                    if (!canDrag) return;
                    setDragging(false);
                    setPoint({ x: 0, y: 0 });
                }}
                onMouseDown={(event) => {
                    if (!canDrag) return;
                    setDragging(true);
                    setPoint({ x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => {
                    if (!canDrag) return;
                    if (dragging && imgRef?.current) {
                        const nativeLeft = parseInt(imgDivRef.current.style.left.replace("px", ""));
                        const nativeTop = parseInt(imgDivRef.current.style.top.replace("px", ""));
                        const offsetX = event.clientX - point.x;
                        const offsetY = event.clientY - point.y;
                        const newLeft = nativeLeft + offsetX;
                        const newTop = nativeTop + offsetY;
                        imgDivRef.current.style.left = newLeft + "px";
                        imgDivRef.current.style.top = newTop + "px";
                        setPoint({ x: event.clientX, y: event.clientY });
                    }
                }}
            >
                <div className="grid-preview-content" ref={imgDivRef}
                    onMouseEnter={
                        () => {
                            setCanDrag(false);
                        }}
                    onMouseLeave={() => {
                        setCanDrag(true);
                    }}
                >
                    <img id="grid-image" ref={imgRef} >
                    </img>
                    <div className="grid-drag-line">
                        <Draggable
                            nodeRef={left}
                            defaultClassName="pos-abs"
                            handle=".grid-line-left"
                            axis="x"
                            position={leftPosition}
                            bounds={leftBounds}
                            onStart={() => { handleDragStart('ew-resize') }}
                            onStop={(event, data: DraggableData) => {
                                handleDragStop();
                                handleLeftDragg(data);
                            }}
                        >
                            <div
                                ref={left}
                                className="grid-line-left horizontal"
                                style={{
                                    width: '5px',
                                    height: '100%',
                                    borderLeft: "2px dashed red",
                                    boxSizing: "border-box",
                                }} />
                        </Draggable>
                        <Draggable
                            nodeRef={right}
                            defaultClassName="pos-abs"
                            handle=".grid-line-right"
                            axis="x"
                            position={rightPosition}
                            bounds={rightBounds}
                            onStart={() => handleDragStart('ew-resize')}
                            onStop={(event, data: DraggableData) => {
                                handleDragStop();
                                handleRightDragg(data);
                            }}
                        >
                            <div
                                ref={right}
                                className="grid-line-right horizontal"
                                style={{
                                    width: '5px',
                                    height: '100%',
                                    borderLeft: "2px dashed red",
                                    boxSizing: "border-box",
                                }} />
                        </Draggable>
                        <Draggable
                            nodeRef={top}
                            defaultClassName="pos-abs"
                            handle=".grid-line-top"
                            axis="y"
                            position={topPosition}
                            bounds={topBounds}
                            onStart={() => handleDragStart('ns-resize')}
                            onStop={(event, data: DraggableData) => {
                                handleDragStop();
                                handleTopDragg(data);
                            }}
                        >
                            <div
                                ref={top}
                                className="grid-line-top vertical"
                                style={{
                                    width: '100%',
                                    height: '5px',
                                    borderTop: "2px dashed red",
                                    boxSizing: "border-box",
                                }} />
                        </Draggable>
                        <Draggable
                            nodeRef={bottom}
                            defaultClassName="pos-abs"
                            handle=".grid-line-bottom"
                            axis="y"
                            position={bottomPosition}
                            bounds={bottomBounds}
                            onStart={() => handleDragStart('ns-resize')}
                            onStop={(event, data: DraggableData) => {
                                handleDragStop();
                                handleBottomDragg(data);
                            }}
                        >
                            <div
                                ref={bottom}
                                className="grid-line-bottom vertical"
                                style={{
                                    width: '100%',
                                    height: '5px',
                                    borderTop: "2px dashed red",
                                    boxSizing: "border-box",
                                }} />
                        </Draggable>
                    </div>
                </div>
            </div>
            <div className="grid-slider">
                <div className="scale-value">
                    <span>
                        {`${getDisplayValue()}%`}
                    </span>
                </div>
                <div className="grid-slider-bar">
                    <div className="components-minus" onClick={delScale}>
                        <svg className="icon-grid-calculate" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10610" width="10" height="10">
                            <path d="M928 425.6v144H96v-144z" p-id="10611" fill="#ffffff"></path>
                        </svg>
                    </div>
                    <input id="grid-scale" type="range" value={scale} onChange={(event) => {
                        const value = (event.target as HTMLInputElement).value;
                        setScale(parseInt(value));
                    }} />
                    <div className="components-add" onClick={addScale}>
                        <svg className="icon-grid-calculate" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5174" width="10" height="10">
                            <path d="M947.392 435.328H588.704V76.64a76.672 76.672 0 0 0-153.344 0v358.688H76.672a76.672 76.672 0 0 0 0 153.344h358.688v358.688a76.672 76.672 0 0 0 153.344 0V588.672h358.688a76.64 76.64 0 0 0 0-153.344z" fill="#FFFFFF" p-id="5175"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="grid-input">
                <div className="input-item">
                    <span className="input-label">
                        等比
                    </span>
                    <input type="number" value={proportional} onChange={(event) => {
                        const pre = parseFloat(event.target.value);
                        onProportionalValueChange(pre)
                    }}></input>
                    <span>
                        %
                    </span>
                </div>
                <div className="splider"></div>
                <div className="input-item">
                    <span className="input-label">
                        左
                    </span>
                    <input type="number" value={leftPer} onChange={(event) => {
                        const pre = parseFloat(event.target.value);
                        onLeftPerChange(pre)
                    }}></input>
                    <span>
                        %
                    </span>
                    <input type="number" value={leftPx} onChange={(event) => {
                        const px = parseFloat(event.target.value);
                        onLeftPxChange(px)
                    }}></input>
                    <span>
                        px
                    </span>
                </div>
                <div className="input-item">
                    <span className="input-label">
                        右
                    </span>
                    <input type="number" value={rightPer} onChange={(event) => {
                        const pre = parseFloat(event.target.value);
                        onRightPerChange(pre)
                    }}></input>
                    <span>
                        %
                    </span>
                    <input type="number" value={rightPx} onChange={(event) => {
                        const px = parseFloat(event.target.value);
                        onRightPxChange(px);
                    }}></input>
                    <span>
                        px
                    </span>
                </div>
                <div className="input-item">
                    <span className="input-label">
                        上
                    </span>
                    <input type="number" value={topPer} onChange={(event) => {
                        const per = parseFloat(event.target.value);
                        onTopPerChange(per);
                    }}></input>
                    <span>
                        %
                    </span>
                    <input type="number" value={topPx} onChange={(event) => {
                        const px = parseFloat(event.target.value);
                        onTopPxChange(px);
                    }}></input>
                    <span>
                        px
                    </span>
                </div>
                <div className="input-item">
                    <span className="input-label">
                        下
                    </span>
                    <input type="number" value={bottomPer} onChange={(event) => {
                        const per = parseFloat(event.target.value);
                        onBottomPerChange(per);
                    }}></input>
                    <span>
                        %
                    </span>
                    <input type="number" value={bottomPx} onChange={(event) => {
                        const px = parseFloat(event.target.value);
                        onBottomPxChange(px);
                    }}></input>
                    <span>
                        px
                    </span>
                </div>
            </div>
            <div className="grid-footer">
                {
                    (activeLayer.layerKind == LayerKind.pixel || activeLayer.layerKind == LayerKind.smartObject)
                    &&
                    <Button className="grid-gen" disabled={!(activeLayer.layerKind == LayerKind.pixel || activeLayer.layerKind == LayerKind.smartObject)} type="primary" loading={gridStatus === IStatus.loading} onClick={generateGrid}>
                        生成九宫格
                    </Button>
                }
                {
                    (activeLayer.layerKind == LayerKind.group && activeLayer.generatorSettings?.comPosidonPSCep?.gridInfo)
                    &&
                    <Button className="grid-gen" type="primary" loading={refreshStatus === IStatus.loading} onClick={() => {
                        setRefreshStatus(IStatus.loading)
                    }}>
                        尺寸整理
                    </Button>
                }
            </div>
        </div>
    );
})