import Zip from 'jszip';
import pathLib from 'path';
const fs = window.cep.fs;

export async function unZipFromBuffer(buffer: Buffer, localPath: string, callback: Function) {
    const zip = await Zip.loadAsync(buffer);
    const zipFileKeys = Object.keys(zip.files);
    const promises = zipFileKeys.map(async (filename) => {
        console.log('开始处理', filename);
        const isFile = !zip.files[filename].dir;
        console.log('是否为文件', isFile);
        const fullPath = pathLib.join(localPath, filename);
        console.log('要保存的完整路径', fullPath);
        const directory = isFile ? pathLib.dirname(fullPath) : fullPath;
        try {
            if (isFile) {
                const content = await zip.files[filename].async('nodebuffer');
                if (content) {
                    const result = fs.writeFile(fullPath, content.toString('base64'), "Base64");
                    if (result.err === 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    console.log('文件内容为空');
                    return true
                }
            } else {
                return true;
            }
        } catch (error) {
            console.log('文件解压失败', error);
            return false;
        }
    });
    const results = await Promise.all(promises);
    if (results.every(result => result === true)) {
        callback();
    } else {
        console.log('解压失败');
        return true;
    }
}
