import Zip from 'jszip';
import pathLib from 'path';
const fs = window.cep.fs;

export function unZipFromBuffer(buffer: Buffer, localPath: string) {
    Zip.loadAsync(buffer)
        .then(async (zip) => {
            const zipFileKeys = Object.keys(zip.files);
            zipFileKeys.map(async (filename) => {
                console.log('开始处理', filename);
                const isFile = !zip.files[filename].dir;
                console.log('是否为文件', isFile);
                const fullPath = pathLib.join(localPath!, filename);
                console.log('要保存的完整路径', fullPath);
                const directory = isFile ? pathLib.dirname(fullPath) : fullPath;
                if (isFile) {
                    const content = await zip.files[filename].async('nodebuffer');
                    if (content) {
                        return fs.writeFile(fullPath, content.toString('base64'), "Base64");
                    } else {
                        return true;
                    }
                }
            })
        })
}

