import { create } from 'zustand';
import { IUser, IUserState } from '../iTypes/iTypes';


const useUserStore = create<IUserState>((set, get) => ({
    user: undefined,
    setUser(user: IUser) {
        set(state => ({
            ...state,
            user: user
        }))
    },
    getUser() {
        return get().user
    }
}));
export default useUserStore; 