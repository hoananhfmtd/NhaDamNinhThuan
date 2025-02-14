import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Avatar,
    Backdrop,
    Button,
    Grid,
    IconButton,
    LinearProgress,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { detect } from 'detect-browser';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { API_URI } from '../api';
import Cirensoft from '../assets/Cirensoft.png';
import CirensoftLogo from '../assets/Logo-Cirensoft.png';
import { SetAccessToken } from '../const';
import { defineColors } from '../layouts/config';
import { actionTypes } from '../store';
const DangNhap = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberPassword, setRememberPassword] = React.useState(false);
    const [autoLogin, setAutoLogin] = React.useState(false);
    const [submit, setSubmit] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [payload, setPayload] = React.useState({
        userName: '',
        password: '',
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLogin } = useSelector((state) => state?.auth);
    const { accessToken } = useSelector((state) => state?.auth);

    useEffect(() => {
        if (isLogin === true && accessToken) {
            navigate('/');
        }
    }, [isLogin, accessToken, navigate]);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRememberPasswordChange = (e) => {
        setRememberPassword(e.target.checked);
    };

    const handleAutoLoginChange = (e) => {
        setAutoLogin(e.target.checked);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        if (!Object.values(payload).filter(Boolean)) return;
        setSubmit(true);
        setLoading(true);
        const browser = detect();
        const client = browser
            ? `${browser.name} on ${browser.os}`
            : 'Không rõ';
        // lấy ra thông tin là máy tính gì để bàn hay laptop hay điện thoại
        //Tên thiết bị là gì ví dụ dektop...
        const deviceInfo = `Trình duyệt: ${browser.name}, Trên ${browser.os}, Phiên bản: ${browser.version}`;
        // Lấy IP từ dịch vụ bên ngoài
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        const clientId = uuidv4();
        localStorage.setItem('clientId', clientId);
        const extendedPayload = {
            ...payload,
            ip,
            client,
            deviceInfo,
            clientId,
        };

        fetch(`${API_URI}users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(extendedPayload),
        })
            .then((res) => {
                if (res.status === 200) {
                    return res.text();
                }
                setError(true);
                setLoading(false);
                return null;
            })
            .then((data) => {
                if (data) {
                    const datax = JSON.parse(data);
                    const {
                        token,
                        role,
                        scope,
                        typeOfUsers,
                        fullName,
                        tinhThanh,
                        tinhThanhId,
                        coQuanThucHienId,
                        coQuanThucHien,
                        userName,
                    } = datax;
                    SetAccessToken(token);
                    dispatch({
                        type: actionTypes.LOGIN,
                        role: role,
                        coQuanThucHien: coQuanThucHien,
                        coQuanThucHienId: coQuanThucHienId,
                        typeOfUsers: typeOfUsers,
                        scope: scope,
                        userName: userName,
                        fullName: fullName,
                        tinhThanh: tinhThanh,
                        tinhThanhId: tinhThanhId,
                        accessToken: token,
                        isLogin: true,
                    });
                    setPayload({ password: '', userName: '' });
                    setLoading(false);
                    navigate('/trang-chu');
                }
            })
            .catch((err) => {
                setError(true);
                setLoading(false);
            });
    };

    return (
        <>
            <Backdrop
                sx={(theme) => ({
                    color: '#fff',
                    zIndex: theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                })}
                open={loading}
            >
                <LinearProgress
                    sx={{
                        width: 700,
                    }}
                    color='primary'
                />
                <span style={{ fontSize: 18, fontWeight: 500 }}>Đang tiến hành xác thực thông tin tài khoản</span>
            </Backdrop>

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    alignItems: 'center',
                }}
            >
                <img
                    src={Cirensoft}
                    alt="Ảnh nằm toàn màn hình"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '485px',
                        height: '591px',
                        borderRadius: '20px',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#FFFF',
                            position: 'relative',
                            width: '485px',
                            borderRadius: '20px',
                            padding: "32px 64px"
                        }}
                    >
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            style={{
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar
                                    src={CirensoftLogo}
                                    sx={{
                                        width: 84,
                                        height: 84,
                                        borderRadius: '50%',
                                        mb: 1,
                                    }}
                                    onClick={() => navigate('/trang-chu')}
                                />
                            </div>

                            <Stack>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter',
                                        fontSize: '16px',
                                        textAlign: 'center',
                                        color: defineColors.text.title,
                                        lineHeight: '19.36px',
                                        fontWeight: 'bold',
                                        mt: 1,
                                    }}
                                >
                                    Viện nông hóa thổ nhưỡng
                                </Typography>

                                <Typography
                                    sx={{
                                        fontFamily: 'Roboto',
                                        fontWeight: 'medium',
                                        fontSize: '16px',
                                        textAlign: 'center',
                                        color: '#007ED2',
                                        lineHeight: '18.75px',
                                        mt: 1,
                                    }}
                                >
                                    Hệ thống quản lý Nha Đam
                                </Typography>
                            </Stack>

                            <div style={{ textAlign: 'center' }}>
                                <Typography
                                    component="h1"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 600,
                                        fontSize: '25.26px',
                                        lineHeight: '30.57px',
                                        paragraphSpacing: '18.33px',
                                        mt: 2,
                                        fontFamily: 'Inter',
                                        color: '#000000',
                                    }}
                                >
                                    ĐĂNG NHẬP
                                </Typography>
                            </div>

                            <TextField
                                label="Tên đăng nhập"
                                id="username"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={payload.userName}
                                onChange={(e) =>
                                    setPayload((prev) => ({
                                        ...prev,
                                        userName: e.target.value,
                                    }))
                                }
                                onKeyUp={handleKeyPress}
                                // required
                                error={submit && !payload.userName.trim()}
                                helperText={
                                    submit && payload.userName.trim() === ''
                                        ? 'Vui lòng nhập tên đăng nhập'
                                        : ''
                                }
                                sx={{
                                    '& label': {
                                        fontFamily: 'Inter',
                                        fontWeight: 'regular',
                                        fontSize: '16.84px',
                                        color: '#000000',
                                    },
                                    '& input': {
                                        '&:focus': {
                                            borderColor: '#B0DBF1',
                                            outline: 'none',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                label="Mật khẩu"
                                variant="outlined"
                                fullWidth
                                id="password"
                                margin="normal"
                                type={showPassword ? 'text' : 'password'}
                                value={payload.password}
                                onKeyUp={handleKeyPress}
                                // required
                                onChange={(e) =>
                                    setPayload((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                error={submit && !payload.password.trim()}
                                helperText={
                                    submit && payload.password.trim() === ''
                                        ? 'Vui lòng nhập mật khẩu'
                                        : ''
                                }
                                sx={{
                                    '& label': {
                                        fontFamily: 'Inter',
                                        fontWeight: 'regular',
                                        fontSize: '16.84px',
                                        color: '#000000',
                                        mb: 3,
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={
                                                handleTogglePasswordVisibility
                                            }
                                            edge="end"
                                            sx={{
                                                color: '#000000',
                                                opacity: 0.8,
                                            }}
                                        >
                                            {showPassword ? (
                                                <Visibility />
                                            ) : (
                                                <VisibilityOff />
                                            )}
                                        </IconButton>
                                    ),
                                }}
                            />
                            {error && (
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontFamily: 'Inter',
                                        color: '#FF004D',
                                        fontSize: '12px',
                                    }}
                                >
                                    Vui lòng kiểm tra lại tên đăng nhập và mật
                                    khẩu.
                                </Typography>
                            )}
                            <Button
                                id="login"
                                fullWidth
                                size="large"
                                onClick={handleLogin}
                                color='primary'
                                variant='contained'
                                sx={{
                                    textTransform: 'none',
                                    mt: error ? 0 : 3,
                                    height: "50px"
                                }}
                            >
                                Đăng nhập
                            </Button>

                            <div style={{ marginTop: '10px' }}>
                                <Link
                                    to={'/policy'}
                                    style={{
                                        color: '#000',
                                        fontSize: '15px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Điều khoản sử dụng
                                </Link>
                            </div>
                        </Grid>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            position: 'absolute',
                            left: '50%',
                            transform: 'translate(-50%, 30%)',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                fontWeight: 'medium',
                                padding: '10px 35px',
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                lineHeight: '22px',
                                alignContent: 'center',
                                color: '#ffff',
                                borderRadius: '100px',
                            }}
                        >
                            Phiên bản: 1.0.0.0 <br /> Bản dịch: 20240418.1
                        </div>
                    </div>

                    <div
                        style={{
                            boder: '1px solid black',
                            textAlign: 'center',
                            marginTop: '20%',
                            color: '#ffff',
                            fontSize: '15px',
                        }}
                    >
                        Phát triển bởi Trung tâm Công nghệ phần mềm và Nền tảng
                        số &copy; 2024
                    </div>
                </div>
            </div>
        </>
    );
};
export default DangNhap;
