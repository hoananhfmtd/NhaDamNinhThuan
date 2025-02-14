import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import Api from './api';
import { ThongBao } from './components';
import { mapSameItem } from './kktnn-components';

export const actionTypes = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    GET_HUYEN: 'GET_HUYEN',
    GET_TINH_THANH0S: 'GET_TINH_THANH0S',
    GET_DANHMUCS: 'GET_DANHMUCS',
    SET_LVS: 'SET_LVS',
    SET_TINH: 'SET_TINH',
    RESET_LVS: 'RESET_LVS',
    RESET_TINH: 'RESET_TINH',
    IS_TOTAL: 'IS_TOTAL',
    GET_LVS: "GET_LVS",
    GET_NGUON_NUOC: "GET_NGUON_NUOC",
    GET_NGUON_NUOC_NGAM: "GET_NGUON_NUOC_NGAM",
    GET_LVS_LIEN_TINH: "GET_LVS_LIEN_TINH",
    GET_CBDT: "GET_CBDT"
}

export const getHuyen = () => async (dispatch) => {
    let data = {};
    new Api()
        .listHuyen({ data })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_HUYEN, payload: res.data?.records });
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

export const getAllTinhThanh0s = () => async (dispatch) => {
    new Api()
        .getListAllTinhThanh0s({})
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_TINH_THANH0S, payload: res.data });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

export const getDanhMucs = () => async (dispatch) => {
    new Api()
        .getAllDanhMucs({})
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_DANHMUCS, payload: res.data });
            } else {

                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getDanhMucs error', err);
        });
}

export const getLuuVucSongs = () => async (dispatch) => {
    new Api()
        .getAllLVS({
            phanTrang: false
        })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_LVS, payload: res.data.records });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getLVS error', err);
        });
}
export const getNguonNuoc = () => async (dispatch) => {
    new Api()
        .getNguonNuocMats({
            isFetchAll: true,
            loaiNguonNuoc: 'SongSuoiKenhRach'
        })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_NGUON_NUOC, payload: res.data.records });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getLVS error', err);
        });
}
export const getNguonNuocNgam = () => async (dispatch) => {
    new Api()
        .getNguonNuocDuoiDats({
            isFetchAll: true
        })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_NGUON_NUOC_NGAM, payload: res.data.records });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getLVS error', err);
        });
}
export const getLuuVucSongLienTinhs = () => async (dispatch) => {
    new Api()
        .getAllLVS({
            lienTinh: true
        })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_LVS_LIEN_TINH, payload: res.data.records });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getLVS error', err);
        });
}

export const getCanBoDieuTras = () => async (dispatch) => {
    new Api()
        .listUser({ data: { canBoDieuTra: true, anchor: "" } })
        .then((res) => {
            if (res.code === 200) {
                dispatch({ type: actionTypes.GET_CBDT, payload: res.data.records });
            } else {
                ThongBao({ code: res.code });
            }
        })
        .catch((err) => {
            console.log('getGET_CBDT error', err);
        });
}


export const appReducer = (state = {
    listHuyen: [],
    TinhThanh0s: [],
    DanhMucs: {},
    LVSs: {},
    isTotal: {}
}, action) => {
    switch (action.type) {
        case actionTypes.SET_LVS:
            return {
                ...state,
                LVSs: {
                    ...state.LVSs,
                    [action.payload.id]: action.payload
                }
            }
        case actionTypes.SET_TINH:
            return {
                ...state,
                TINHs: {
                    ...state.TINHs,
                    [action.payload.id]: action.payload
                }
            }

        case actionTypes.RESET_LVS:
            return {
                ...state,
                LVSs: {
                    ...state.LVSs,
                    [action.payload.id]: null
                }
            }
        case actionTypes.RESET_TINH:
            return {
                ...state,
                TINHs: {
                    ...state.TINHs,
                    [action.payload.id]: null
                }
            }
        case actionTypes.IS_TOTAL:
            return {
                ...state,
                isTotal: {
                    ...state.isTotal,
                    [action.payload.id]: action.payload.isTotal
                }
            }
        case actionTypes.GET_HUYEN:
            return {
                ...state,
                listHuyen: action.payload
            }
        case actionTypes.GET_LVS:
            return {
                ...state,
                luuVucSongs: action.payload.map((i, index) => ({
                    ...i,
                    label: i.tenMuc,
                    id: index + 1
                }))
            }
        case actionTypes.GET_NGUON_NUOC:
            return {
                ...state,
                nguonNuocs: action.payload.map((i, index) => ({
                    ...i,
                    label: i.tenSong,
                    id: index + 1
                }))
            }
        case actionTypes.GET_NGUON_NUOC_NGAM:
            return {
                ...state,
                nguonNuocNgams: action.payload.map((i, index) => ({
                    ...i,
                    label: i.tenSong,
                    id: index + 1
                }))
            }
        case actionTypes.GET_LVS_LIEN_TINH:
            return {
                ...state,
                luuVucSongLienTinhs: action.payload.map((i, index) => ({
                    ...i,
                    label: i.tenMuc,
                    id: index + 1
                }))
            }
        case actionTypes.GET_CBDT:
            return {
                ...state,
                canBoDieuTras: mapSameItem(action.payload.map((i, index) => ({
                    fullName: i.fullName,
                    username: i.userName,
                    ...i
                })), "fullName")
            }
        case actionTypes.GET_DANHMUCS:
            const LVSs = action.payload?.luuVucSongs || []
            LVSs.forEach((lvs, i) => {
                lvs.label = lvs.tenMuc
                lvs.id = i + 1
            })
            return {
                ...state,
                DanhMucs: action.payload
            }
        case actionTypes.GET_TINH_THANH0S:
            const tinhThanh0s = action.payload?.records || []
            tinhThanh0s.forEach((tinhThanh0, i) => {
                tinhThanh0.label = tinhThanh0.ten
                tinhThanh0.id = i + 1
                if (!tinhThanh0.quanHuyens) {
                    return
                }
                tinhThanh0.quanHuyens.forEach((quanHuyen, j) => {
                    quanHuyen.label = quanHuyen.ten
                    quanHuyen.id = j + 1
                    if (!quanHuyen.phuongXas) {
                        return
                    }
                    quanHuyen.phuongXas.forEach((phuongXa, k) => {
                        phuongXa.label = phuongXa.ten
                        phuongXa.id = k + 1
                    })
                })
            })
            return {
                ...state,
                TinhThanh0s: tinhThanh0s
            }
        default:
            return state;
    }
}

export const authReducer = (state = {
    isLogin: false,
    accessToken: null,
    role: null,
    scope: null,
    fullName: null,
    tinhThanhId: null,
    tinhThanh: null,
    userName: null,
    typeOfUsers: null,
    coQuanThucHienId: null,
    coQuanThucHien: null,
}, action) => {
    switch (action.type) {
        case actionTypes.LOGIN:
            return {
                ...state,
                isLogin: action.isLogin,
                accessToken: action.accessToken,
                role: action.role,
                scope: action.scope,
                fullName: action.fullName,
                tinhThanhId: action.tinhThanhId,
                tinhThanh: action.tinhThanh,
                userName: action.userName,
                typeOfUsers: action.typeOfUsers,
                coQuanThucHienId: action.coQuanThucHienId,
                coQuanThucHien: action.coQuanThucHien,
            };
        case actionTypes.LOGOUT:
            return {
                ...state,
                isLogin: false,
                accessToken: null,
            };
        default:
            return state;
    }
};

const commonConfig = {
    storage,
    stateReconsiler: autoMergeLevel2,
};

const authConfig = {
    ...commonConfig,
    key: 'authen',
    whitelist: ['accessToken', 'isLogin', 'role', 'scope', 'typeOfUsers', 'fullName', 'userName', 'tinhThanhId', 'tinhThanh', 'coQuanThucHienId', 'coQuanThucHien'],
};

const appConfig = {
    ...commonConfig,
    key: 'app',
    whitelist: ['TinhThanh0s', 'listHuyen', 'DanhMucs'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authConfig, authReducer),
    app: persistReducer(appConfig, appReducer),
});

export default rootReducer;
