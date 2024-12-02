import { resolve as resolvePath } from 'path';
const fs = window.cep.fs

export function pathExists(path: string) {
    return fs
        .stat(path)
}