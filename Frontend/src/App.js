import moment from 'moment';
import 'moment/locale/vi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts';
import * as actions from './store';
import './styles/App.css';

import { List as AccountList } from './account/Account';


import { DanhSachBieuMauRoutes } from './layouts/DanhSachBieuMau';

import { useSelector } from 'react-redux';

import DangNhap from './account/Login';

import ErrorReportList from "./account/ErrorReportList";
import { List as LuuVucSongList } from './account/LuuVucSong';
import { List as LuuVucSongNTList } from './account/LuuVucSongNoiTinh';

import { List as LoaiCongTrinhList } from './account/LoaiCongTrinh';
import { List as LoaiHinhNuocThaiList } from './account/LoaiHinhNuocThai';
import { List as LuuVucSongRiengList } from './account/LuuVucSongRieng';
import PhuongXaList from './account/PhuongXa';
import QuanHuyenList from './account/QuanHuyen';
import TinhThanhList from './account/TinhThanh';

import Policy from './account/Policy';
import ResetPassword from './account/ResetPassword';

import { Box, Button } from '@mui/material';
import { NewAppContext } from './const';
import DashBoard from './report/DashBoard';

moment.locale('vi');

window.globalRouter = null;


const privateRoute = (scope, role, coQuanThucHienId) => {
    return (
        <Route element={<MainLayout />}>
            <Route index element={<DashBoard />} />
            <Route path="trang-chu" index element={<DashBoard />} />
            <Route path="danh-sach-bieu-mau" element={<Outlet />}>
                {DanhSachBieuMauRoutes.map((route, index) => (
                    <Route
                        path={route.path}
                        key={index}
                        index
                        element={<route.main />}
                    />
                ))}
            </Route>
        </Route>
    );
};

const PageNotFound = () => {
    const { isLogin } = useSelector((s) => s.auth);
    if (!isLogin) return null;
    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <h1
                style={{
                    fontWeight: 700,
                    fontSize: 80,
                }}
            >
                404
            </h1>
            <span>Không tìm thấy trang mà bạn yêu cầu!</span>
            <Box mt={2}>
                <Button sx={{ textTransform: 'capitalize' }}>
                    <Link
                        to={isLogin ? "/trang-chu" : "/dang-nhap"}
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        {isLogin ? 'Quay lại Trang chủ' : 'Về trang Đăng nhập'}
                    </Link>
                </Button>
            </Box>
        </div>
    );
};

const App = () => {
    const { isLogin, scope, role, coQuanThucHienId } = useSelector((state) => state?.auth);
    const dispatch = useDispatch();
    useEffect(() => {
        if (window.location.pathname.includes('/dang-nhap') || !isLogin) return;
        // dispatch(actions.getHuyen());
        // dispatch(actions.getAllTinhThanh0s());
        // dispatch(actions.getDanhMucs());
        // dispatch(actions.getLuuVucSongs());
        // // dispatch(actions.getLuuVucSongLienTinhs());
        // dispatch(actions.getCanBoDieuTras());
        // dispatch(actions.getNguonNuoc());
        // dispatch(actions.getNguonNuocNgam());
    }, [dispatch, isLogin]);
    NewAppContext();

    return (
        <>
            <Routes>
                {isLogin ? (
                    privateRoute(scope, role, coQuanThucHienId)
                ) : (
                    <Route path="" element={<DangNhap />} />
                )}
                <Route path="policy" element={<Policy />} />
                <Route path="dang-nhap" element={<DangNhap />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </>
    );
};

export default App;
