import Zip from 'jszip';
import pathLib from 'path';

export async function unZipFromBuffer(buffer: Buffer, localPath: string, callback?: Function) {
    const zip = await Zip.loadAsync(buffer);
    const zipFileKeys = Object.keys(zip.files);
    const promises = zipFileKeys.map(async (filename) => {
        const isFile = !zip.files[filename].dir;
        console.log('是否为文件', isFile);
        const newFilename = filename.split('/').slice(1).join('/');
        console.log('开始处理', newFilename);
        const fullPath = pathLib.join(localPath, newFilename);
        console.log('要保存的完整路径', fullPath);
        const directory = isFile ? pathLib.dirname(fullPath) : fullPath;
        try {
            if (!isFile) {
                const dirRe = window.cep.fs.stat(fullPath)
                if (dirRe.err != 0) {
                    window.cep.fs.makedir(fullPath);
                }
                console.log('创建文件夹成功');
                return true;
            }
            if (isFile) {
                const content = await zip.files[filename].async('nodebuffer');
                if (content) {
                    try {
                        //@ts-ignore
                        writeFileFromBuff(fullPath, content);
                        return true;
                    } catch (e) {
                        return false;
                    }
                } else {
                    console.log('文件内容为空');
                    return true
                }
            }
        } catch (error) {
            console.log('文件解压失败', error);
            return false;
        }
    });
    const results = await Promise.all(promises);
    if (results.every(result => result === true)) {
        if (callback) callback();
    } else {
        console.log('解压失败');
        return true;
    }
}
