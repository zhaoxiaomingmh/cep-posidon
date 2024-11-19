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
    setUser: (user: IUser) => void;
    getUser: () => IUser | undefined;
}

export interface IUser {
    id: number,
    email?: string,
    name: string,
    projectjects?: IProject[]
}

export interface IProject {
    id: number,
    name: string,
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

