import { Menu, MenuOpen } from '@mui/icons-material';
import { Avatar, Stack, Typography } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import 'sweetalert2/dist/sweetalert2.min.css'
import { useSelector } from 'react-redux';
import ProfileSection from './Appbar/ProfileSection';
import { MySideBar } from './Sidebar';
import { useSidebarContext } from './Sidebar/SidebarContext';
import { defineColors } from './config';

import LogoVien from '../assets/LogoVien.png';

const drawerWidth = 280;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 16px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 16px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        // marginLeft: drawerWidth,
        width: `calc(100%)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

export default function MainLayout() {
    const navigate = useNavigate();
    const { draw, toggleDraw } = useSidebarContext();

    const { isLogin } = useSelector((state) => state?.auth);

    React.useEffect(() => {
        if (isLogin === false) {
            navigate('/dang-nhap');
        }
    }, [isLogin, navigate]);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                sx={{
                    backgroundColor: '#F2F4F6',
                    stroke: '1px solid rgba(198, 198, 198, 1)',
                    borderBottom: '1px solid rgba(198, 198, 198, 1)',
                    boxShadow: 'none !important',
                }}
                position="fixed"
                open={draw}
            >
                <Toolbar>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                    >
                        <Stack direction="row" pl={1} alignItems="center" gap={1}>
                            <IconButton
                                sx={{
                                    color: defineColors.layout.icon.toggleDraw,
                                }}
                                aria-label="open drawer"
                                onClick={toggleDraw}
                                edge="start"
                            >
                                {!draw ? (
                                    <MenuOpen style={{ color: 'black' }} />
                                ) : (
                                    <Menu style={{ color: 'black' }} />
                                )}
                            </IconButton>
                            <Box
                                sx={{
                                    width: 'fit-content',
                                }}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                gap={1}
                            >
                                <Link to={'/trang-chu'}>
                                    <Avatar
                                        src={LogoVien}
                                        sx={{
                                            width: '45px',
                                            height: '45px',
                                            flexShrink: 0,
                                        }}
                                    />
                                </Link>
                            </Box>
                            <Stack>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        color: '#1F1F1F',
                                    }}
                                >
                                    Viện nông hóa thổ nhưỡng
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        color: '#86583f',
                                        // textShadow:
                                        //     '2px 2px 5px rgba(0, 126, 200, 0.45)',
                                    }}
                                >
                                    Hệ thống quản lý sản phẩm Nha Đam
                                </Typography>
                            </Stack>
                            {/* )} */}
                        </Stack>
                        <ProfileSection />
                    </Stack>
                </Toolbar>
            </AppBar>
            <Drawer PaperProps={{
                sx: {
                    borderRight: 'none'
                }
            }} variant="permanent" open={draw}>
                <DrawerHeader></DrawerHeader>
                <MySideBar />
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, overflowX: 'hidden', background: '#F2F4F6' }}
            >
                <DrawerHeader></DrawerHeader>
                <div
                    className="content-container"
                    style={{ overflow: 'hidden', background: '#F2F4F6', paddingLeft: 6 }}
                >
                    <Outlet />
                </div>
            </Box>
            <>
                <ToastContainer
                    position="bottom-right"
                    autoClose={500}
                    hideProgressBar={true}
                    closeOnClick
                    theme="colored"
                />
            </>
        </Box>
    );
}
