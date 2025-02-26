import { create } from 'zustand';
import { IImageExportSetting, ISettingsState } from '../iTypes/iTypes';

const useSettingsStore = create<ISettingsState>((set, get) => ({
    imageExportSetting: {
        compress: true,
        rename: true
    },
    getImageExportSetting () {
        return get().imageExportSetting;
    },
    setImageExportSetting (imageExportSetting: IImageExportSetting) {
        set(state => ({
            ...state,
            imageExportSetting: imageExportSetting
        }))
    }
}));
export default useSettingsStore; 