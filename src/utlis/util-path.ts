import { resolve as resolvePath } from 'path';
import fs from 'fs/promises';
import originFs, { constants as FS_CONSTANTS } from 'fs';


const PROJECT_ROOT = resolvePath(__dirname, '..');


export function pathExists(path: string) {
    return fs
        .access(path, FS_CONSTANTS.F_OK)
        .then(() => true)
        .catch(() => false);
}