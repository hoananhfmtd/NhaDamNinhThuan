import axios from 'axios';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import { AppContext } from './const';
import createEvent from './eventDispatcher';
import { showConfirmDialog } from './helpers';
// TODO remove persist: replace by redux store or global variable

export const API_URI = import.meta.env.VITE_API_URI;
export const REACT_APP_API_GEO_URI = import.meta.env.VITE_API_GEO_URI;
export const API_GEOSERVER_URI = REACT_APP_API_GEO_URI + '/kiem_ke_tnn/wms';
export const API_GEOSERVER_URI_QUERY =
    REACT_APP_API_GEO_URI + '/kiem_ke_tnn/ows';

function getHeaders() {
    if (AppContext.AccessToken) {
        // TODO refresh token
        return {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + AppContext.AccessToken,
        };
    }
    return { 'Content-Type': 'application/json' };
}

const axiosClient = axios.create({
    baseURL: API_URI,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, /',
    },
    withCredentials: false,
    fetchOptions: {
        mode: 'cors',
    },
});

let isRedirecting = false;

axiosClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access-token');
    config.headers.Authorization = accessToken ? `Bearer ${accessToken}` : '';
    return config;
});
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401
        if (error.code === 'ERR_NETWORK' && error.request) {
        }
        if (error.response && error.response.status === 401) {
            if (!isRedirecting) {
                isRedirecting = true;
                const currentUrl = window.location.pathname;
                if (currentUrl !== '/dang-nhap') {
                    showConfirmDialog(
                        'Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại để tiếp tục!',
                        'Cảnh báo',
                        (result) => {
                            if (!result) return;
                            window.localStorage.removeItem('persist:authen');
                            window.localStorage.removeItem('persist:app');
                            window.localStorage.removeItem('access-token');
                            window.location.href = '/dang-nhap';
                        },
                        { showCancelButton: false }
                    );
                    return;
                }
            }
        }
        return Promise.reject(error);
    }
);

export async function callAPI({ method, path, data }) {
    try {
        if (method !== 'GET' && method !== 'POST') {
            method = 'post';
        }
        if (method === 'GET') {
            const qr = queryString.stringify({ ...data });
            if (qr !== '') {
                path = path + '?' + qr;
            }
            data = null;
        }
        const body = { ...data };
        if (!isEmpty(body?.isTongHop)) {
            body['tinhThanhId'] = body?.queryParams?.tinhThanhIds?.[0];
            body['tinhThanhIds'] = body?.queryParams?.tinhThanhIds;
            body['luuVucSongId'] = body?.queryParams?.luuVucSongIds?.[0];
            body['luuVucSongIds'] = body?.queryParams?.luuVucSongIds;
        }
        if (!isEmpty(body?.Scope)) {
            body['scope'] = body?.Scope;
            delete body['Scope'];
        }
        // console.log("DATA:::", data)
        const response = await axiosClient[method.toLowerCase()](
            path,
            body,
            {
                signal: data?.signal ?? undefined,
            }
        );
        const isUpdate =
            (path.includes('add') || path.includes('upsert')) &&
            Boolean(data?.id);
        createEvent({ path, method, isUpdate, updateId: data?.id, isSyncthetic: !isEmpty(body?.queryParams) });
        return {
            code: response.status,
            data: response?.data,
            type: '',
        };
    } catch (error) {
        // Do not handle
        return {
            code: error?.response?.status,
            data: null,
            type: 'error',
        };
    }
}

function callAPIUploadFile({ data }) {
    const method = 'POST';
    return fetch(API_URI + 'upload-file', {
        method: method,
        body: data,
    })
        .then((response) => {
            if (!response) {
                // TODO
                return;
            }
            if (!response.ok) {
                // TODO
                return;
            }
            // lỗi hệ thống k xử lý được?
            if (response.status === 299) {
                return response.json().then((err) => {
                    throw new Error(err && err.message);
                });
            }
            return response.json();
        })
        .then((resdata) => {
            if (!resdata) {
                // throw new Error(MESSAGE.cscore_tnn_ERROR);
                return;
            }
            return resdata;
        });
}

function callAPIDownloadFile({ data }) {
    const path = API_URI + 'download-file';
    const method = 'POST';

    let canopen = false;
    if (data && data.file_name) {
        let arr = data.file_name.split('.');
        if (
            arr &&
            arr.length > 0 &&
            arr[arr.length - 1].toUpperCase() === 'PDF'
        ) {
            canopen = true;
        }
    }

    if (canopen) {
        return fetch(path, {
            method: method,
            headers: getHeaders(),
            responseType: 'blob',
            body: data !== null ? JSON.stringify(data) : null,
        })
            .then((response) => {
                if (!response) {
                    // TODO
                    return;
                }

                if (!response.ok) {
                    // TODO
                    return;
                }

                // lỗi hệ thống k xử lý được?
                if (response.status === 299) {
                    return response.json().then((err) => {
                        throw new Error(err && err.message);
                    });
                }

                return response.arrayBuffer();
            })
            .then((resdata) => {
                if (!resdata) {
                    // TODO throw new Error(MESSAGE.cscore_tnn_ERROR);
                    return;
                }

                window.open(
                    URL.createObjectURL(
                        new Blob([resdata], { type: 'application/pdf' })
                    )
                );
            });
    }

    return fetch(path, {
        method: method,
        headers: getHeaders(),
        responseType: 'blob',
        body: data !== null ? JSON.stringify(data) : null,
    })
        .then((response) => {
            if (!response) {
                // TODO
                return;
            }

            if (!response.ok) {
                // TODO
                return;
            }

            // lỗi hệ thống k xử lý được?
            if (response.status === 299) {
                return response.json().then((err) => {
                    throw new Error(err && err.message);
                });
            }

            return response.blob();
        })
        .then((resdata) => {
            if (!resdata) {
                return;
            }

            const url = window.URL.createObjectURL(resdata);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', data.file_name);
            document.body.appendChild(link);
            link.click();
        });
}

export default class Api {
    // File
    UploadFile = async ({ data }) => callAPIUploadFile({ data: data });
    DownloadFile = async ({ data }) => callAPIDownloadFile({ data: data });
    getImage = (path) => API_URI + 'files/' + path;

    // Common
    Profile = async () =>
        callAPI({ path: API_URI + 'user/profile', method: 'GET' });
    // Redux service / context
    getListAllTinhThanhs = async ({ } = {}) =>
        callAPI({
            path: API_URI + 'tinhthanhs',
            method: 'GET',
            data: {},
        });
    getListAllTinhThanh0s = async ({ } = {}) =>
        callAPI({
            path: API_URI + 'tinhthanhs',
            method: 'GET',
            data: { includeQhpx: true },
        });
    getListAllQuanHuyens = async ({ maTinh } = {}) =>
        callAPI({
            path: API_URI + 'quanhuyens',
            method: 'GET',
            data: { maTinh },
        });
    getListAllPhuongXas = async ({ maHuyen } = {}) =>
        callAPI({
            path: API_URI + 'phuongxas',
            method: 'GET',
            data: { maHuyen },
        });
    getAllDanhMucs = async ({ } = {}) =>
        callAPI({
            path: API_URI + 'danhmucs-dashboard',
            method: 'GET',
            data: {},
        });
    //Feedback
    upsertFeedback = async ({ data }) =>
        callAPI({
            path: API_URI + 'report-bug',
            method: 'POST',
            data: data,
        });
    getFeedbackList = async ({ data }) =>
        callAPI({
            path: API_URI + 'report-list',
            method: 'POST',
            data: data,
        });
    // New Api down here
    bieu1Detail = async (id) =>
        callAPI({ path: API_URI + `bieumauso1s/${id}`, method: 'GET' });
    bieu1TongHop = async (query) =>
        callAPI({
            path: API_URI + `bieumauso1s-sum`,
            method: 'POST',
            data: query,
        });
    upSertBieu1 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso1s-upsert',
            method: 'POST',
            data: data,
        });
    deleteBieu1 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso1s-delete/${id}`, method: 'POST' });
    listBieu1 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso1s-list', method: 'POST', data: data });
    bieu2Detail = async (id) =>
        callAPI({ path: API_URI + `bieumauso2s/${id}`, method: 'GET' });
    bieu2TongHop = async (query) =>
        callAPI({
            path: API_URI + `bieumauso2s-sum`,
            method: 'POST',
            data: query,
        });
    upSertBieu2 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso2s-upsert',
            method: 'POST',
            data: data,
        });
    deleteBieu2 = async ({ id }) =>
        callAPI({ path: API_URI + `bieumauso2s-delete/${id}`, method: 'POST' });
    listBieu2 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso2s-list', method: 'POST', data: data });
    listBieu20 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso20s-list', method: 'POST', data: data });
    upSertBieu20 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso20s-upsert',
            method: 'POST',
            data: data,
        });
    deleteBieu20 = async ({ id }) =>
        callAPI({
            path: API_URI + `bieumauso20s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    bieu20Detail = async (id) =>
        callAPI({ path: API_URI + `bieumauso20s/${id}`, method: 'GET' });
    listBieu22 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso22s-list', method: 'POST', data: data });

    deleteBieu22 = async ({ id }) =>
        callAPI({ path: API_URI + `bieumauso22s-delete/${id}`, method: 'POST' });
    upSertBieu22 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso22s-upsert',
            method: 'POST',
            data: data,
        });
    bieu22Detail = async (id) =>
        callAPI({ path: API_URI + `bieumauso22s/${id}`, method: 'GET' });
    // HaiQuan
    // bieu 9
    upSertBieu9 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso9s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu9 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso9s-list', method: 'POST', data: data });
    getBieu9 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso9s/${id}`, method: 'GET', data: {} });
    deleteBieu9 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso9s-delete/${id}`, method: 'POST', data: {} });
    // bieu 11
    upSertBieu11 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso11s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu11 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso11s-list', method: 'POST', data: data });
    getBieu11 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso11s/${id}`, method: 'GET', data: {} });
    deleteBieu11 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso11s-delete/${id}`, method: 'POST', data: {} });
    // bieu 14
    upSertBieu14 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso14s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu14 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso14s-list', method: 'POST', data: data });
    getBieu14 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso14s/${id}`, method: 'GET', data: {} });
    deleteBieu14 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso14s-delete/${id}`, method: 'POST', data: {} });
    // bieu 23
    upSertBieu23 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso23s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu23 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso23s-list', method: 'POST', data: data });
    getBieu23 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso23s/${id}`, method: 'GET', data: {} });
    deleteBieu23 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso23s-delete/${id}`, method: 'POST', data: {} });
    // bieu 24
    upSertBieu24 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso24s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu24 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso24s-list', method: 'POST', data: data });
    getBieu24 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso24s/${id}`, method: 'GET', data: {} });
    deleteBieu24 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso24s-delete/${id}`, method: 'POST', data: {} });
    // HaiQuan

    //HoangAnh
    // Bieu21
    upSertBieu21 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso21s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu21 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso21s-list', method: 'POST', data: data });
    getBieu21 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso21s/${id}`,
            method: 'GET',
            data: {},
        });
    deleteBieu21 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso21s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    // Bieu6
    upSertBieu6 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso6s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu6 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso6s-list', method: 'POST', data: data });
    getBieu6 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso6s/${id}`,
            method: 'GET',
            data: {},
        });
    deleteBieu6 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso6s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    //Bieu7
    upSertBieu7 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso7s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu7 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso7s-list', method: 'POST', data: data });
    getBieu7 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso7s/${id}`,
            method: 'GET',
            data: {},
        });
    deleteBieu7 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso7s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    //Bieu12
    upSertBieu12 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso12s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu12 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso12s-list', method: 'POST', data: data });
    getBieu12 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso12s/${id}`,
            method: 'GET',
            data: {},
        });
    deleteBieu12 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso12s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    //Bieu25
    upSertBieu25 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso25s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu25 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso25s-list', method: 'POST', data: data });
    getBieu25 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso25s/${id}`,
            method: 'GET',
            data: {},
        });
    deleteBieu25 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso25s-delete/${id}`,
            method: 'POST',
            data: {},
        });
    //HoangAnh
    // bieu 8
    upSertBieu08 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso8s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu08 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso8s-list', method: 'POST', data: data });
    getBieu08 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso8s/${id}`, method: 'GET', data: {} });
    deleteBieu08 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso8s-delete/${id}`, method: 'POST', data: {} });
    // bieu 13
    upSertBieu13 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso13s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu13 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso13s-list', method: 'POST', data: data });
    getBieu13 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso13s/${id}`, method: 'GET', data: {} });
    deleteBieu13 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso13s-delete/${id}`, method: 'POST', data: {} });
    // bieu 17
    upSertBieu17 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso17s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu17 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso17s-list', method: 'POST', data: data });
    getBieu17 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso17s/${id}`, method: 'GET', data: {} });
    deleteBieu17 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso17s-delete/${id}`, method: 'POST', data: {} });

    // bieumauso10s
    upSertBieu3 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso3s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu3 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso3s-list', method: 'POST', data: data });
    getBieu3 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso3s/${id}`, method: 'GET', data: {} });
    deleteBieu3 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso3s-delete/${id}`, method: 'POST', data: {} });

    upSertBieu4 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso4s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu4 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso4s-list', method: 'POST', data: data });
    getBieu4 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso4s/${id}`, method: 'GET', data: {} });
    deleteBieu4 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso4s-delete/${id}`, method: 'POST', data: {} });

    upSertBieu5 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso5s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu5 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso5s-list', method: 'POST', data: data });
    getBieu5 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso5s/${id}`, method: 'GET', data: {} });
    deleteBieu5 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso5s-delete/${id}`, method: 'POST', data: {} });

    upSertBieu10 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso10s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu10 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso10s-list', method: 'POST', data: data });
    getBieu10 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso10s/${id}`, method: 'GET', data: {} });
    deleteBieu10 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso10s-delete/${id}`, method: 'POST', data: {} });

    upSertBieu15 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso15s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu15 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso15s-list', method: 'POST', data: data });
    getBieu15 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso15s/${id}`, method: 'GET', data: {} });
    deleteBieu15 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso15s-delete/${id}`, method: 'POST', data: {} });

    upSertBieu19 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso19s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu19 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso19s-list', method: 'POST', data: data });
    getBieu19 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso19s/${id}`, method: 'GET', data: {} });
    deleteBieu19 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso19s-delete/${id}`, method: 'POST', data: {} });

    //Tâm

    upSertBieu18 = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'bieumauso18s-upsert',
            method: 'POST',
            data: data,
        });
    listBieu18 = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'bieumauso18s-list', method: 'POST', data: data });
    getBieu18 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso18s/${id}`, method: 'GET', data: {} });
    deleteBieu18 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso18s-delete/${id}`, method: 'POST', data: {} });

    // Đối tượng xả thải
    listDoiTuongXaThai = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'doituongxathais',
            method: 'POST',
            data: data,
        });

    // Đối tượng khai thác nước mặt
    listBieuDTKTNM = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'doituongkhaithacs-nuocmat',
            method: 'POST',
            data: data,
        });

    // Đối tượng khai thác nước ngầm
    listBieuDTKTNN = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'doituongkhaithacs-nuocngam',
            method: 'POST',
            data: data,
        });

    // Đối tượng khai thác
    listBieuDTKT = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'doituongkhaithac',
            method: 'POST',
            data: data,
        });

    apiLogin = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'users-login', method: 'POST', data: data });
    //Quản lý tài khoản
    createTokenByUser = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/createtoken/${data.userName}`,
            method: 'POST',
            data: {},
        });
    changePassWord = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'users-update-password',
            method: 'POST',
            data: data,
        });
    getProfile = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'me', method: 'GET', data: data });
    listUser = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'users-list', method: 'POST', data: data });
    upsertUser = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'users-create',
            method: 'POST',
            data: data,
        });
    updateUser = async ({ data } = {}) =>
        callAPI({ path: API_URI + 'users-update', method: 'POST', data: data });
    updateInfo = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'me-updateinfo',
            method: 'POST',
            data: data,
        });
    getUser = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `users/getbyid/${id}`,
            method: 'GET',
            data: {},
        });
    deleteUser = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `users-delete/${id}`,
            method: 'POST',
            data: {},
        });
    getThanhVienByTinh = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/getbytinhthanhid/${data.tinhid}`,
            method: 'GET',
            data: {},
        });
    getThanhVienByTW = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/getuserbyscope/${data.scope}`,
            method: 'GET',
            data: {},
        });
    getGiamSatByTinh = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/getgiamsatbytinhthanhid/${data.tinhid}`,
            method: 'GET',
            data: {},
        });

    getGiamSatByCQTH = async ({ data } = {}) =>
        callAPI({
            path:
                API_URI + `users/getgiamsatbycoquanthuchienid/${data.coquanid}`,
            method: 'GET',
            data: {},
        });
    getThanhVienByCQTH = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/getbycoquanthuchienid/${data.coquanid}`,
            method: 'GET',
            data: {},
        });

    getGiamSatByTW = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `users/getgiamsatbyscope/${data.scope}`,
            method: 'GET',
            data: {},
        });
    listTinhLVS = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'danhmucs-dashboard',
            method: 'GET',
            data: data,
        });
    listDanhMucCapTinh = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'tinhthanhs',
            method: 'GET',
            data: data,
        });
    listDanhMucCapHuyen = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `quanhuyens?maTinh=${data.maTinh}`,
            method: 'GET',
            data: {},
        });
    listDanhMucCapXa = async ({ data } = {}) =>
        callAPI({
            path: API_URI + `phuongxas?maHuyen=${data.maHuyen}`,
            method: 'GET',
            data: {},
        });
    //Tâm
    listTinh = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'tinhthanhs',
            method: 'GET',
            data: data,
        });
    listHuyen = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'quanhuyens',
            method: 'GET',
            data: data,
        });
    listXa = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'phuongxas',
            method: 'GET',
            data: data,
        });
    getAllDashboardReport = async (data) =>
        callAPI({
            path: API_URI + 'reports-dashboard2',
            method: 'POST',
            data: data,
        });
    thongKeSoLuongBieuMau = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'reports-bieumau-count',
            method: 'POST',
            data: data,
        });
    getAllLVS = async (data = {}) =>
        callAPI({
            path: API_URI + 'luuvucsongs-list',
            method: 'POST',
            data: data,
        });
    getLVS = async (id) =>
        callAPI({ path: API_URI + `luuvucsongs/${id}`, method: 'GET' });
    upsertLVS = async (data = {}) =>
        callAPI({
            path: API_URI + 'luuvucsongs-upsert',
            method: 'POST',
            data: data,
        });
    deleteLVS = async (id) =>
        callAPI({
            path: API_URI + `luuvucsongs-delete/${id}`,
            method: 'POST',
        });
    // getAllLVS2 = async (data = {}) =>
    //     callAPI({
    //         path: API_URI + 'luuvucsong2s',
    //         method: 'POST',
    //         data: data,
    //     });
    // getLVS2 = async (id) =>
    //     callAPI({ path: API_URI + `luuvucsong2/${id}`, method: 'GET' });
    // upsertLVS2 = async (data = {}) =>
    //     callAPI({
    //         path: API_URI + 'luuvucsong2-upsert',
    //         method: 'POST',
    //         data: data,
    //     });
    // deleteLVS2 = async (id) =>
    //     callAPI({
    //         path: API_URI + `luuvucsong2-delete/${id}`,
    //         method: 'POST',
    //     });
    getAllMDSD = async (data = {}) =>
        callAPI({ path: API_URI + 'mucdichsudungs', method: 'POST', data });
    upserMDSD = async (data = {}) =>
        callAPI({ path: API_URI + 'mucdichsudung-upsert', method: 'POST', data });
    getAllLoaiCongTrinh = async (data = {}) =>
        callAPI({ path: API_URI + 'loaicongtrinhs', method: 'POST', data });
    upsertLoaiCongTrinh = async (data = {}) =>
        callAPI({ path: API_URI + 'loaicongtrinh-upsert', method: 'POST', data });
    getLoaiCongTrinh = async (id) =>
        callAPI({ path: API_URI + `loaicongtrinh/${id}`, method: 'GET' });
    deleteLoaiCongTrinh = async (id) =>
        callAPI({ path: API_URI + `loaicongtrinh-delete/${id}`, method: 'POST' });
    getAllLoaiHinhNuocThai = async (data = {}) =>
        callAPI({ path: API_URI + 'loaihinhnuocthais', method: 'POST', data });
    upsertLoaiHinhNuocThai = async (data = {}) =>
        callAPI({ path: API_URI + 'loaihinhnuocthai-upsert', method: 'POST', data });
    getLoaiHinhNuocThai = async (id) =>
        callAPI({ path: API_URI + `loaihinhnuocthai/${id}`, method: 'GET' });
    deleteLoaiHinhNuocThai = async (id) =>
        callAPI({ path: API_URI + `loaihinhnuocthai-delete/${id}`, method: 'POST' });
    getAllLVSRieng = async (data = {}) =>
        callAPI({ path: API_URI + 'luuvucsongriengs', method: 'POST', data: data });
    upsertLVSRieng = async (data = {}) =>
        callAPI({ path: API_URI + 'luuvucsongrieng-upsert', method: 'POST', data: data });
    getLVSRieng = async (id) =>
        callAPI({ path: API_URI + `luuvucsongrieng/${id}`, method: 'GET' });
    deleteLVSRieng = async (id) =>
        callAPI({ path: API_URI + `luuvucsongrieng-delete/${id}`, method: 'POST' });
    //API chỉ tiêu kiểm kê
    listChiTieuKiemKe = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'chitieu-kiemke-reports',
            method: 'POST',
            data: data,
        });
    listLuongNuoc = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'reports-chitieu-kiemke/luuluong-nuocmat',
            method: 'POST',
            data: data,
        });

    //API Publish
    published1 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso1s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published2 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso2s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published3 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso3s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published4 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso4s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published5 = async ({ id } = {}) =>
        callAPI({ path: API_URI + `bieumauso5s-publish/${id}`, method: 'POST', data: {} });
    published6 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso6s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published7 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso7s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published8 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso8s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published9 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso9s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published10 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso10s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published11 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso11s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published12 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso12s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published13 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso13s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published14 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso14s-publish/${id}`,
            method: 'POST',
            data: {},
        });
    published15 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso15s-publish/${id}`,
            method: 'POST',
            data: {},
        });

    confirmed1 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso1s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed2 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso2s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed3 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso3s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed4 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso4s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed5 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso5s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed6 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso6s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed7 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso7s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed8 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso8s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed9 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso9s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed10 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso10s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed11 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso11s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed12 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso12s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed13 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso13s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed14 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso14s-confirm/${id}`,
            method: 'POST',
            data: {},
        });
    confirmed15 = async ({ id } = {}) =>
        callAPI({
            path: API_URI + `bieumauso15s-confirm/${id}`,
            method: 'POST',
            data: {},
        });

    getDevices = async (username) =>
        callAPI({
            path: API_URI + `users/${username}/list-devices`,
            method: 'GET',
        });
    getActivities = async (data) =>
        callAPI({
            path: API_URI + `events-list`,
            method: 'POST',
            data,
        });
    logout = async (devices = []) =>
        callAPI({
            path: API_URI + `accounts-logout`,
            method: 'POST',
            data: devices
                ? {
                    idThietBi: devices,
                }
                : undefined,
        });

    chiTieuKiemKeReport = async ({ data } = {}) =>
        callAPI({
            path: API_URI + 'reports-chitieu-kiemke',
            method: 'POST',
            data: data,
        });

    transformGeometry2 = async (data = {}) =>
        callAPI({
            path: API_URI + 'transform-geometry2',
            method: 'GET',
            data: data,
        });
    transformGeometry = async (data = {}) =>
        callAPI({
            path: 'transform-geometry',
            method: 'POST',
            data: data,
        });
    getCongTrinhChuyenNuocs = (data) => callAPI({ path: "congtrinh-chuyennuocs", data, method: "POST" });
    getLuuLuongNuocs = (data) => callAPI({ path: "luuluongnuocs", data, method: "POST" });
    getChatLuongNuocMats = (data) => callAPI({ path: "chatluong-nuocmats", data, method: "POST" });
    getDoiTuongNuocBiens = (data) => callAPI({ path: "doituongkhaithacs-nuocbien", data, method: "POST" });
    getNguonNuocMats = (data) => callAPI({ path: "nguonnuocmats", data, method: "POST" });
    getLuongMuaTaiTrams = (data) => callAPI({ path: "luongmuataitrams", data, method: "POST" });
    getNguonNuocDuoiDats = (data) => callAPI({ path: "nguonnuocngams", data, method: "POST" });
}
