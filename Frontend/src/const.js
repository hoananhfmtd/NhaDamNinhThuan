import * as jwt_decode from 'jwt-decode';

export const FontSize = {
    LabelMarginBottom: '5px !important',
    textFieldLabel: '14px',
    textField: '13.5px',
};

export const Appcolors = {
    title: '#202124',
    backgroundColor: '#f0f2f5',
    textFiled: '#3a4c6b',
    textFiledDisabled: '#00000099',
    backgroundDisabled: '#0000000f',
    success: '',
    error: '',
    warn: '',
    default: '',
};

export const doiTuongKiemKeListConst = [
    { maMuc: 'DoiTuongXaThai', tenMuc: 'Xả thải' },
    { maMuc: 'DoiTuongKhaiThacNuocMat', tenMuc: 'Khai thác nước mặt' },
    { maMuc: 'DoiTuongKhaiThacNuocNgam', tenMuc: 'Khai thác nước ngầm' }
]

export const trangThaiBieuMaus = [
    {
        value: 'ChuaKiemTra',
        label: 'Chưa kiểm tra',
    },
    {
        value: 'DaKiemTra',
        label: 'Đã kiểm tra',
    },
    {
        value: 'ChuaCongBo',
        label: 'Chưa công bố',
    },
    {
        value: 'DaCongBo',
        label: 'Đã công bố',
    },
]

export const loaiBieuMaus = [
    {
        label: 'Biểu mẫu tổng hợp',
        value: true,
    },
    {
        label: 'Biểu mẫu nhập',
        value: false,
    },
];

export const thongTinGiayPheps = [
    {
        label: 'Có thông tin giấy phép',
        value: true,
    },
    {
        label: 'Chưa có thông tin giấy phép',
        value: false,
    },
];

export const AppContext = {};

export function SetAccessToken(accessToken) {
    if (accessToken) {
        AppContext.AccessToken = accessToken
        AppContext.AccessTokenExpired = getExpired(accessToken)
        localStorage.setItem('access-token', accessToken)
    }
}

export function NewAppContext() {
    const accessToken = localStorage.getItem('access-token')
    if (accessToken) {
        AppContext.AccessToken = accessToken
        AppContext.AccessTokenExpired = getExpired(accessToken)
    }

    AppContext.BaseUrl = window.location.origin
}

// return ms
function getExpired(accessToken) {
    try {
        const payload = jwt_decode.jwtDecode(accessToken);
        if (payload && payload.exp) {
            return payload.exp * 1000
        }
    } catch (error) {
        return 0;
    }

    return 0;
}

console.log("APP_NAME", import.meta.env.VITE_APP_NAME ?? "")

// {start with '/', end without '/'} or empty
export const BASE_PATH = import.meta.env.VITE_BASE_PATH ?? "";

export const MaLoaiCongTrinhs = {
    ML: 'ML',
    TB: 'TB',
    TCNTT: 'TCNTT',
    GD: 'GD',
    GK: 'GK',
    NMN: 'NMN',
    KD: 'KD',
    NTTS: 'NTTS',
    HO: 'HO',
    DD: 'DD',
    CONG: 'CONG',
    HCTD: 'HCTD',
    HCTL: 'HCTL',
    DV: 'DV',
    KHAC: 'KHAC',
}
