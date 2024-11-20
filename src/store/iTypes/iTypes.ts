export interface IAppState {
    table: string,
    tables: string[],
    func: string,
    funcs: string[],
    setTable: (table: string) => void,
    getTable: () => string | undefined,
    setTables: (tables: string[]) => void,
    getTables: () => string[] | undefined,
    setFunc: (func: string) => void,
    getFunc: () => string | undefined,
    setFuncs: (tables: string[]) => void,
    getFuncs: () => string[] | undefined,
}
export interface IUserState {
    user: IUser,
    project: IProject,
    setUser: (user: IUser) => void;
    getUser: () => IUser | undefined;
    setProject: (project: IProject) => void;
    getProject: () => IProject | undefined;
}

export interface IUser {
    id: number,
    env: IEnv,
    loginType: 'External' | 'OpenID',
    email?: string,
    head?: string,
    name: string,
    projectjects?: IProject[],
    expired: Date
    last: number,
}

export enum IEnv {
    dev = 'dev',
    test = 'test',
    prod = 'prod',
}

export interface IProject {
    id: number,
    head?: string,
    name?: string,
    resource?: any
}

export interface IDocument {
    id: number,
    name: number,
    layers?: ILayer[],
    activeLayer?: ILayer,
}

export interface ILayer {
    id: number,
    name: string,
    kind: string,
    subLayers?: ILayer[],
}

export interface IDocumentState {
    activeDocument?: IDocument,
    setActiveDocument: (document: IDocument | undefined) => void;
    getActiveDocument: () => IDocument | undefined;
    setActiveLayer: (layer: ILayer) => void;
    getActiveLayer: () => ILayer | undefined;
}

export interface IEventResult {
    appId: string,
    data: string,
    extensionId: string,
    scope: string,
    type: string,
}

export type IPosidonResponse = {
    code?: number,
    message?: string,
    data?: any,
    state?: boolean,
    error?: string
}
