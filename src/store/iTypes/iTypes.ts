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
    projects?: IProject[],
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
    storehouses?: IStorehouse[],
    projectEditorType: string
}

export interface IDocument {
    id: number,
    name: string,
    layers?: ILayer[],
    activeLayer?: ILayer,
}

export interface ILayer {
    id: number,
    name: string,
    layerKind: LayerKind,
    index?: number,
    bounds?: IBounds
    generatorSettings?: any
    subLayers?: ILayer[],
}

export interface IBounds {
    x: number,
    y: number,
    width: number,
    height: number,
}

export enum LayerKind {
    any = 0,
    pixel = 1,
    adjustment = 2,
    text = 3,
    vector = 4,
    smartObject = 5,
    video = 6,
    group = 7,
    threeD = 8,
    gradient = 9,
    pattern = 10,
    solidColor = 11,
    background = 12,
    groupEnd = 13
}

export interface IGeneratorSettings {

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

export interface IEventData {
    _obj: string,
    null: IlayerPro,
    makeVisible: boolean,
    layerID?: number[],
    documentID?: number
}

export interface IlayerPro {
    _name: string,
    _ref: string,
}

export interface IPosidonResponse {
    code?: number,
    message?: string,
    data?: any,
    state?: boolean,
    error?: string
}


export interface IGalleryItem {
    id: string | number,
    isFile: boolean,
    name: string,
    svnPsdLevelId?: number,
    fileUrl?: string,
    thumb?: string,

    files?: IGalleryItem[],
    dis?: number,
    format?: ImageFormat
    projectName?: string
}

export type IDownloader = {
    progress: number,
    id: number | string,
    complete: boolean,
}

export type ImageFormat = 'png' | 'jpg' | 'psd' | 'comp';

export interface IProjectStorehouse {
    id: number,
    name: string,
    storehouses: IStorehouse[]
}

export type IStorehouse = {
    type: IStorehouseType,
    projectName: string,
}

export type IStorehouseType = 'components' | 'interfaces' | 'ENGINEERING' | 'DESIGN' | 'All'


export interface IFile {
    name: string,
    ext: string,
    path: string,
    url?: string,
    base64?: string,
}

export interface ISearchItem {
    projectName: string,
    type: IStorehouseType,
    page: number,
    size: number,
    canSearch: boolean
}

export interface ISearchResult {
    projectName: string,
    page: number,
    data: ISearchImageResponseItem[],
    dis: number,
    isTotal: boolean
}

export interface ISearchImageResponseItem {
    id: string
    path: string
    dis: number
    thumbnail: string
    name: string,
    ext: string
}

export interface IAccountResponse {
    id: number,
    baseUrl: string,
    accountType: number,
    username: string,
    password: string,
    data: string
}

export interface ISvnPsdGroup {
    parentDir: string
    parentId: number
    dirs: ISvnPsdGroupItem[]
}

export interface ISvnPsdGroupItem {
    id: number
    levelType: number,
    name: string
    projectId: number
    userId: number
}

export interface IPath {
    id: number,
    path: string,
    parent: number[],
    level?: number,
}

export interface ISvnPsdDirTreeNode {
    name: string,
    id: number,
    parent: number,
    level: number,
    projectId: number,
    children: ISvnPsdDirTreeNode[],
    levelType: number,
    isFile: boolean,
    thumb?: string,
    fileUrl?: string,
    svnPsdLevelId?: number,
    fileId?: number,
}

export interface IPosidonPageResponse extends IPosidonResponse {
    total: number
}

export interface IVersion {
    version: string,
    name: string,
    description: string
}

export interface IGeneratorSettingsParams {
    key: string,
    settings: any,
    layerId: string
}

export interface IFigmaUrlSettings {
    resourceSynchronizationURL: string,
    resourceSynchronizationTime: string,
    resourceSynchronizationTimeStamp: string
}

export interface IItem {
    id: number,
    name: string,
    checked: boolean,
    subItems?: IItem[],
}