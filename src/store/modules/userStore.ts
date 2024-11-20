import { create } from 'zustand';
import { IUser, IUserState } from '../iTypes/iTypes';


const useUserStore = create<IUserState>((set, get) => ({
    user: undefined,
    project: undefined,
    setUser(user: IUser) {
        set(state => ({
            ...state,
            user: user
        }))
    },
    getUser() {
        return get().user
    },
    setProject(project) {
        set(state => ({
            ...state,
            project: project
        }))
    },
    getProject() {
        return get().project
    }
}));
export default useUserStore; 