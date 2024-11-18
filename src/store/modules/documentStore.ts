import { create } from "zustand";
import { IDocument, IDocumentState, ILayer } from "../iTypes/iTypes";


const useDocumentStore = create<IDocumentState>((set, get) => ({
    activeDocument: undefined,
    setActiveDocument(document: IDocument | undefined) {
        set(state => ({
            ...state,
            document: document
        }))
    },
    getActiveDocument() {
        return get().activeDocument
    },
    setActiveLayer(layer: ILayer | undefined) {
        if (!get().activeDocument) return;
        set(state => ({
            ...state,
            activeDocument: {
                ...state.activeDocument,
                activeLayer: layer
            }
        }))
    },
    getActiveLayer() {
        return get().activeDocument?.activeLayer;
    }
}));

export default useDocumentStore; 