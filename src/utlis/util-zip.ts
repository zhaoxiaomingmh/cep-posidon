import Zip from 'jszip';
import fs from 'fs/promises';
import path from 'path';



export async function unzip(archivePath: string, outputDir: string) {
    return fs
        .readFile(archivePath)
        .then((buf) => Zip.loadAsync(buf))
        .then(async (zip) => {
            for (const [relativePath, file] of Object.entries(zip.files)) {
                const filePath = path.join(outputDir, relativePath);
                if (file.dir) {
                    // 创建目录
                    await fs.mkdir(filePath, { recursive: true });
                } else {
                    // 写入文件
                    const content = await file.async('nodebuffer');
                    await fs.writeFile(filePath, content);
                }
            }
        });
}