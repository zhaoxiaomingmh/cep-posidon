import { create } from 'zustand';
import { IAppState } from '../iTypes/iTypes';
import { AppRef } from '@/router/App';

const useAppStore = create<IAppState>((set, get) => ({
    table: undefined,
    tables: undefined,
    func: undefined,
    funcs: undefined,
    setTable(table: string) {
        set(state => ({
            ...state,
            table: table
        }))
        AppRef?.current?.updateTimestamp(table)
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
}));
export default useAppStore; 