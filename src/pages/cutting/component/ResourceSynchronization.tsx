import useDocumentStore from "@/store/modules/documentStore";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { forwardRef } from "react";
import './rs.scss'
import { PsInput } from "@/hooks/input/PsInput";
import { PsAction } from "@/hooks/button/PsAction";
import psHandler from "@/service/handler";
import { IFigmaUrlSettings, IGeneratorAction, ILayer, IWaitIte } from "@/store/iTypes/iTypes";

import { Button, Checkbox, Divider } from 'antd';
import type { CheckboxProps } from 'antd';
import { psConfig } from "@/utlis/util-env";
import nas from "@/service/nas";
import path from "path";

type ResourceSynchronizationProps = {
}
type ResourceSynchronizationRefType = {
    updateWaitQueue: (type: 'generate' | 'upload', state: 'success' | 'error', layerId: number, path: string) => void,
    updateFigmaDownline: (url?: string) => void
};

export const ResourceSynchronizationRef = React.createRef<ResourceSynchronizationRefType>();
export const ResourceSynchronization = forwardRef<ResourceSynchronizationRefType, ResourceSynchronizationProps>((props, ref) => {

    const activeLayer = useDocumentStore(state => state.getActiveLayer());
    const [figmaSettings, setFigmaSettings] = useState<IFigmaUrlSettings>(undefined);
    const [figmaId, setFigmaId] = useState<string>(undefined);
    const [groups, setGroups] = useState<ILayer[]>([]);
    const [checkedList, setCheckedList] = useState<ILayer[]>([]);
    const indeterminate = checkedList.length > 0 && checkedList.length < groups.length;
    const checkAll = groups.length === checkedList.length;
    const [status, setStatus] = useState<'idle' | 'generate' | 'upload'>('idle');
    const [generateList, setGenerateList] = useState<IWaitIte[]>([]);
    const [uploadList, setUploadList] = useState<IWaitIte[]>([]);
    const [failList, setFailList] = useState<IWaitIte[]>([]);

    useEffect(() => {
        refreshFigmaSettings();
        getGroups();
    }, [])
    useEffect(() => {
        if (activeLayer?.generatorSettings?.comPosidonPSCep?.figmaNodeId) {
            setFigmaId(activeLayer.generatorSettings?.comPosidonPSCep?.figmaNodeId)
        } else {
            setFigmaId(undefined)
        }
    }, [activeLayer])
    useEffect(() => {
        console.log("uploadList.length", uploadList.length)
        console.log("failList.length", failList.length)
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
    useImperativeHandle(ref, () => {
        return {
            updateWaitQueue: updateWaitQueue,
            updateFigmaDownline: updateFigmaDownline
        } 
    })
    const updateFigmaDownline = (url?: string) => {
        toNative();
        if (!url) {

        } else {
            const settings = {
                ResourceSynchronizationURL: url,
                resourceSynchronizationTime: new Date(),
                resourceSynchronizationTimeStamp: new Date().getTime()
            }
            psHandler.setDocGeneratorSettings(settings, refreshFigmaSettings)
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
        })
    }
    const entryFigmaId = (value) => {
        setFigmaId(value)
    }
    const addOrUpdateFigmaId = () => {
        if (!activeLayer || !figmaId) return;
        if (activeLayer.generatorSettings?.comPosidonPSCep?.figmaNodeId) {
            psHandler.setLayerGeneratorSettings(activeLayer.id, "", () => {
                psHandler.refreshActiveLayer();
                getGroups();
            });
        } else {
            psHandler.setLayerGeneratorSettings(activeLayer.id, figmaId, getGroups);
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
    const toNative = () => {
        setStatus('idle');
        setGenerateList([]);
        setUploadList([]);
        setFailList([])
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
                    <PsInput disabled={activeLayer ? activeLayer.layerKind != 7 : false} callback={entryFigmaId} value={figmaId} placeholder="请输入Figma节点ID">
                        <PsAction callback={addOrUpdateFigmaId}>
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
                <div className="rs-tree-view">
                    <div className="rs-check-all">
                        <Checkbox disabled={status != 'idle'} className="ps-checkbox" indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>全选</Checkbox>
                    </div>
                    {
                        groups.map((group, index) => {
                            return (<Checkbox disabled={status != 'idle'} className="ps-checkbox" key={index} checked={checkedList.includes(group)} onChange={() => { onChange(group) }}>{group.name}</Checkbox>)
                        })
                    }
                </div>
            </div>
            <div className="rs-footer" >
                <PsInput placeholder="点击下方按钮生成切图,生成过程中请勿关闭插件" callback={() => {

                }} value={figmaSettings?.ResourceSynchronizationURL} disabled={false} >
                    <PsAction callback={() => {
                        function copyToClipboard(txt) {
                            var textarea = document.createElement("textarea")
                            document.body.appendChild(textarea)
                            textarea.value = txt
                            textarea.select()
                            document.execCommand("Copy")
                            document.body.removeChild(textarea)
                        }
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