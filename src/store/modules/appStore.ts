import { create } from 'zustand';
import { IAppState } from '../iTypes/iTypes';

const useAppStore = create<IAppState>((set, get) => ({
    table: undefined,
    tables: undefined,
    func: undefined,
    funcs: undefined,
    latest: undefined,
    setTable(table: string) {
        set(state => ({
            ...state,
            table: table
        }))
    },
    getTable() {
        return get().table;
    },
    setTables(tables: string[]) {
        set(state => ({
            ...state,
            tables: tables
        }))
    },
    getTables() {
        return get().tables;
    },
    setFunc(func: string) {
        set(state => ({
            ...state,
            func: func
        }))
    },
    getFunc() {
        return get().func;
    },
    setFuncs(funcs: string[]) {
        set(state => ({
            ...state,
            funcs: funcs
        }))
    },
    getFuncs() {
        return get().funcs;
    },
    getVersion() {
        const latest = get().latest;
        if (!latest) return "1.0.0";
        const vers = latest.split("");
        let version = "";
        vers.forEach((v, i) => {
            if (i == vers.length - 1) {
                version += v
            } else {
                version += v + ".";
            }
        })
        return version;
    },
    setVersion(latest: string) {
        set(state => ({
            ...state,
            latest: latest
        }))
    }
}));
export default useAppStore; 