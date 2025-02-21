import useDocumentStore from "@/store/modules/documentStore";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { forwardRef } from "react";
import 'react-perfect-scrollbar/dist/css/styles.css';
import './rs.scss'
import { PsInput } from "@/hooks/input/PsInput";
import { PsAction } from "@/hooks/button/PsAction";
import psHandler from "@/service/handler";
import { IGeneratorSettingsObj, IGeneratorAction, ILayer, IWaitIte } from "@/store/iTypes/iTypes";

import { Button, Checkbox } from 'antd';
import type { CheckboxProps } from 'antd';
import { psConfig } from "@/utlis/util-env";
import nas from "@/service/nas";
import path from "path";
import PerfectScrollbar from 'react-perfect-scrollbar'

type ResourceSynchronizationProps = {
}
type ResourceSynchronizationRefType = {
    updateWaitQueue: (type: 'generate' | 'upload', state: 'success' | 'error', layerId: number, path: string) => void,
    updateFigmaDownline: (url?: string) => void,
    init: () => void
};

export const ResourceSynchronizationRef = React.createRef<ResourceSynchronizationRefType>();
export const ResourceSynchronization = forwardRef<ResourceSynchronizationRefType, ResourceSynchronizationProps>((props, ref) => {

    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const [figmaSettings, setFigmaSettings] = useState<IGeneratorSettingsObj>(undefined);
    const [figmaId, setFigmaId] = useState<string>(undefined);
    const [groups, setGroups] = useState<ILayer[]>([]);
    const [checkedList, setCheckedList] = useState<ILayer[]>([]);
    const indeterminate = checkedList.length > 0 && checkedList.length < groups.length;
    const checkAll = groups.length === checkedList.length;
    const [status, setStatus] = useState<'idle' | 'generate' | 'upload'>('idle');
    const [generateList, setGenerateList] = useState<IWaitIte[]>([]);
    const [uploadList, setUploadList] = useState<IWaitIte[]>([]);
    const [failList, setFailList] = useState<IWaitIte[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        init();
    }, [])
    useEffect(() => {
        if (activeLayer?.generatorSettings?.comPosidonPSCep?.figmaNodeId) {
            setFigmaId(activeLayer.generatorSettings?.comPosidonPSCep?.figmaNodeId)
        } else {
            setFigmaId(undefined)
        }
    }, [activeLayer])
    useEffect(() => {
        if (status != 'idle' && checkedList.length != 0 && checkedList.length === (uploadList.length + failList.length)) {
            if (uploadList.length > 0) {
                let fuList: {
                    figmaNodeId: string,
                    url: string
                }[] = [];
                uploadList.forEach(u => {
                    let layer = checkedList.find(i => i.id === u.id);
                    if (layer) {
                        const furl = {
                            figmaNodeId: layer.generatorSettings?.comPosidonPSCep?.figmaNodeId,
                            url: u.data
                        }
                        fuList.push(furl);
                    }
                })
                if (fuList.length === 0) {
                    toNative();
                }
                const filename = new Date().getTime().toString() + ".txt"
                const dirPath = path.join(psConfig.downloadDir(), filename);
                const str = JSON.stringify(fuList);
                console.log("str", str);
                console.log("dirPath", dirPath);
                const result = window.cep.fs.writeFile(dirPath, str, "");
                if (result.err == 0) {
                    nas.uploadFile(dirPath, filename, "text/plain")
                } else {
                    alert("文件写入本地失败")
                    toNative();
                }
            }
        }
    }, [uploadList])
    const init = () => {
        setStatus('idle');
        setGenerateList([]);
        setUploadList([]);
        setFailList([]);
        refreshFigmaSettings();
        getGroups();
    }
    useImperativeHandle(ref, () => {
        return {
            updateWaitQueue: updateWaitQueue,
            updateFigmaDownline: updateFigmaDownline,
            init: init
        }
    })
    const updateFigmaDownline = (url?: string) => {
        toNative();
        if (!url) {

        } else {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const formattedDate = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            const settings = {
                ResourceSynchronizationURL: url,
                resourceSynchronizationTime: formattedDate,
                resourceSynchronizationTimeStamp: new Date().getTime(),
            }
            psHandler.setDocGeneratorSettings(settings, refreshFigmaSettings)
            const images = window.cep.fs.readdir(psConfig.figmaImageDir());
            if (images.err === 0) {
                images.data.forEach(i => {
                    const image = path.join(psConfig.figmaImageDir(), i)
                    window.cep.fs.deleteFile(image)
                })
            }
            copyToClipboard(url);
            alert("已成功复制到剪贴板")
        }
    }
    const updateWaitQueue = (type: 'generate' | 'upload', state: 'success' | 'error', layerId: number, data: string) => {
        if (type === 'generate') {
            if (checkedList.some(i => i.id == layerId) && !generateList.some(i => i.id == layerId)) {
                const layer = checkedList.find(i => i.id == layerId);
                const wait: IWaitIte = {
                    id: layer.id,
                    name: layer.name,
                    data: data,
                }
                console.log('generate', wait)
                if (state === 'success') {
                    setGenerateList([...generateList, wait])
                    const fileName = path.basename(data);
                    nas.uploadFile(wait.data!, fileName, "image/png", layerId);
                } else {
                    setFailList([...failList, wait])
                }
            }
        } else {
            if (checkedList.some(i => i.id == layerId) && !uploadList.some(i => i.id == layerId)) {
                const layer = checkedList.find(i => i.id == layerId);
                const wait: IWaitIte = {
                    id: layer.id,
                    name: layer.name,
                    data: data,
                }
                console.log('upload', wait)
                if (state === 'success') {
                    setUploadList([...uploadList, wait])
                } else {
                    setFailList([...failList, wait])
                }
            }
        }
    }
    const refreshFigmaSettings = () => {
        psHandler.getDocGeneratorSettings().then((gerJson: any) => {
            console.log('gerJson', gerJson)
            if (gerJson.comPosidonPSCep) {
                setFigmaSettings(gerJson.comPosidonPSCep)
            }

        })
    }
    const getGroups = () => {
        psHandler.getAllLayerList(7).then((layers: ILayer[]) => {
            const figmaLinkGroups = layers.filter((l) => l.generatorSettings?.comPosidonPSCep?.figmaNodeId);
            setGroups(figmaLinkGroups);
            setLoading(false);
        })
    }
    const entryFigmaId = (value) => {
        setFigmaId(value)
    }
    const copyToClipboard = (txt) => {
        var textarea = document.createElement("textarea")
        document.body.appendChild(textarea)
        textarea.value = txt
        textarea.select()
        document.execCommand("Copy")
        document.body.removeChild(textarea)
    }
    const addOrUpdateFigmaId = async () => {
        if (!activeLayer || !figmaId) return;
        const currentLayer = await psHandler.getActiveLayer();
        console.log('currentLayer', currentLayer)
        let layerGS = JSON.parse(currentLayer.generatorSettings) ?? {};
        let layerPosidon = layerGS.comPosidonPSCep ?? {};
        if (layerPosidon.figmaNodeId) {
            if (layerPosidon.figmaNodeId) delete layerPosidon.figmaNodeId;
            psHandler.setLayerGeneratorSettings(activeLayer.id, layerPosidon, () => {
                psHandler.refreshActiveLayer();
                setUploadList([]);
                setFailList([])
                setGenerateList([]);
                setGroups(prevGroups => prevGroups.filter(i => i.id !== activeLayer.id));
                if (checkedList.some(i => i.id === activeLayer.id)) setCheckedList(prevCheckedList => prevCheckedList.filter(i => i.id !== activeLayer.id));
            });
        } else {
            layerPosidon.figmaNodeId = figmaId;
            psHandler.setLayerGeneratorSettings(activeLayer.id, layerPosidon, () => {
                psHandler.refreshActiveLayer();
                const layer: ILayer = {
                    id: activeLayer.id,
                    name: activeLayer.name,
                    layerKind: activeLayer.layerKind,
                    generatorSettings: {
                        comPosidonPSCep: {
                            figmaNodeId: figmaId,
                        }
                    }
                }
                if (!groups.some(i => i.id === activeLayer.id)) {
                    setGroups(prevGroups => [...prevGroups, layer]);
                }
                if (!checkedList.some(i => i.id === activeLayer.id)) setCheckedList(prevCheckedList => [...prevCheckedList, layer]);
            });
        }
    }
    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? groups : []);
    };
    const onChange = (group: ILayer) => {
        if (!checkedList.includes(group)) {
            setCheckedList([...checkedList, group]);
        } else {
            setCheckedList(checkedList.filter(v => v !== group));
        }
    };
    const generateFigmaUrl = () => {
        if (checkedList?.length === 0) {
            alert('请选择要同步的编组');
            return;
        }
        setStatus('generate');
        setGenerateList([]);
        setUploadList([]);
        setFailList([])
    }
    useEffect(() => {
        if (status != 'generate') return;
        if (generateList.length === 0 && uploadList.length === 0 && failList.length === 0) {
            checkedList.forEach(layer => {
                const filename = new Date().getTime();
                psHandler.sendToGenerator({
                    from: "com.posidon.cep.panel",
                    action: IGeneratorAction.fastExport,
                    data: {
                        layerId: layer.id,
                        filename: filename.toString(),
                        path: psConfig.figmaImageDir(),
                        format: "png",
                    }
                })
            })
        }
    }, [generateList, uploadList, failList, status])
    const toNative = () => {
        setStatus('idle');
    }
    return (
        <div className="resource-synchronization-container">
            <div className="rs-layer-select-box">
                <span>当前选中图层信息</span>
                <div className="rs-layer-info-item" style={{ display: "flex", alignItems: "center" }}>
                    <div className="rs-layer-select-title">
                        <span>名称:</span>
                    </div>
                    <span style={{
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>{activeLayer?.name}</span>
                </div>
                <div className="rs-layer-info-item">
                    <div className="rs-layer-select-title">
                        <span >关联ID:</span>
                    </div>
                    <PsInput disabled={activeLayer?.layerKind == 7 && (activeLayer?.generatorSettings?.comPosidonPSCep?.figmaNodeId)} callback={entryFigmaId} value={figmaId} placeholder="请输入Figma节点ID">
                        <PsAction callback={() => { addOrUpdateFigmaId() }}>
                            {
                                activeLayer?.generatorSettings?.comPosidonPSCep?.figmaNodeId ?
                                    <img src="./dist/static/images/svg/brush.svg"></img> :
                                    <img src="./dist/static/images/svg/pensou.svg"></img>
                            }
                        </PsAction>
                    </PsInput>
                </div>
            </div>
            <div className="rs-group-tree-box">
                <div className="rs-group-tree-box-title">
                    <span>当前文件已绑定编组</span>
                </div>
                {
                    loading ? <span>加载中....</span> :
                        <div className="rs-tree-view">
                            <div className="rs-check-all">
                                <Checkbox disabled={status != 'idle'} className="ps-checkbox" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>全选</Checkbox>
                            </div>
                            <div className="checkbox_wrap">
                                <PerfectScrollbar>
                                    {
                                        groups.map((group, index) => {
                                            return (<Checkbox disabled={status != 'idle'} className="ps-checkbox" key={index} checked={checkedList.includes(group)} onChange={(eve) => {
                                                onChange(group);
                                            }}>
                                                <div className="rs-check-item" onClick={(a) => {
                                                    psHandler.selectLayer(group.id);
                                                }}>
                                                    <span>{group.name}</span>
                                                    {
                                                        failList.some(i => i.id === group.id)
                                                        &&
                                                        <img style={{ marginLeft: "5px", width: 14, height: 14 }} src="./dist/static/images/svg/fail.svg"></img>
                                                    }
                                                    {
                                                        uploadList.some(i => i.id === group.id)
                                                        &&
                                                        <img style={{ marginLeft: "5px", width: 14, height: 14 }} src="./dist/static/images/svg/success.svg"></img>
                                                    }
                                                </div>
                                            </Checkbox>)
                                        })
                                    }
                                </PerfectScrollbar>
                            </div>
                        </div>
                }
            </div>
            <div className="rs-footer" >
                <PsInput placeholder="点击下方按钮生成切图,生成过程中请勿关闭插件" callback={() => { }}
                    value={figmaSettings?.ResourceSynchronizationURL}
                    disabled={false} >
                    <PsAction callback={() => {
                        figmaSettings?.ResourceSynchronizationURL &&
                            copyToClipboard(figmaSettings?.ResourceSynchronizationURL)
                    }}>
                        <img src="./dist/static/images/svg/paste.svg"></img>
                    </PsAction>
                </PsInput>
                <div className="rs-time">
                    <span>切图时间 :</span>
                    <span>{figmaSettings?.resourceSynchronizationTime}</span>
                </div>
                <Button className="rs-url-button" type="primary" loading={status !== 'idle'} onClick={generateFigmaUrl}>
                    {
                        status === 'idle' ?
                            <span>同步所选编组</span> :
                            <span>同步中</span>
                    }
                </Button>
            </div>
        </div>
    );
})