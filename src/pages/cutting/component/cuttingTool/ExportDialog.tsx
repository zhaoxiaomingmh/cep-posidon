import React, { forwardRef, useImperativeHandle, useState } from "react";
import './exportDialog.scss';

export interface ExportDialogRefProps {
    percentage: number,
    startExport: (path: string) => void,
}
export interface ExportDialogRefType {
    show: () => void,
    close: () => void,
};
export const ExportDialogRef = React.createRef<ExportDialogRefType>();
export const ExportDialog = forwardRef<ExportDialogRefType, ExportDialogRefProps>((props, ref) => {

    const [open, setOpen] = useState<boolean>(false);
    const [path, setPath] = useState<string>("");
    const [options, setOptions] = useState<string[]>([])
    useImperativeHandle(ref, () => {
        return {
            show: show,
            close: close,
        }
    })
    const show = () => {
        setOpen(true);
    }
    const close = () => {
        setOpen(false);
    }
    const chioceDir = () => {
        const dir = window.cep.fs.showOpenDialog(false, true, "选择保存的路径", null, null);
        if (dir.err === 0) {
            const dirPath = dir.data[0];
            if (dirPath && options.findIndex(item => item === dirPath) === -1) {
                setOptions([...options, dirPath])
                setPath(dirPath);
            }
        }
    }
    return (
        <div>
            {
                open
                &&
                <div className='export-dialog'>
                    <div className="export-dialog-header">
                        <div className="export-dialog-header-desc">
                            <span>导出到</span>
                        </div>
                        <div className="export-dialog-header-select">
                            <select onChange={(event) => setPath(event.target.value)}>
                                {
                                    options.map((option, index) => {
                                        return (<option value={option} key={index}>{option}</option>);
                                    })
                                }
                            </select>
                        </div>
                        <div className="export-dialog-header-file-chioce" onClick={() => { chioceDir() }}>
                            <img src="./dist/static/images/svg/file.svg" style={{ width: "37px", height: "33px" }}></img>
                        </div>
                    </div>
                    <div className="export-dialog-progress-bar">
                        <div id="progress-bar" style={{ width: `${Math.round(props.percentage)}%` }} > </div>
                    </div>
                    <div className="vector2"> </div>

                    <div className="export-dialog-options">
                        <div className="export-dialog-options-item"
                            onClick={() => { close() }}>
                            取消
                        </div>
                        <div className="export-dialog-options-item"
                            style={{ backgroundColor: "#1471e6" }}
                            onClick={() => {
                                if (!path) {
                                    alert("请选择导出路径");
                                    return;
                                }
                                props.startExport(path)
                            }}
                        >
                            确定
                        </div>
                    </div>

                </div>
            }
        </div>);
})