import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Avatar, Button, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cirensoft from '../assets/Cirensoft.png';
import CirensoftLogo from '../assets/Logo-Cirensoft.png';
import { defineColors } from '../layouts/config';

import { API_URI } from '../api';
import { ThongBao } from '../components';



const ResetPassword = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const resetToken = searchParams.get("token");
    const userName = searchParams.get("userName");
    console.log('resetToken', resetToken, userName);
    // TODO valid token

    const [showPassword, setShowPassword] = React.useState(false);
    const [submit, setSubmit] = React.useState(false);
    const [error, setError] = React.useState(false);
    const API_RESET = `${API_URI}users/resetmatkhau`

    const navigate = useNavigate();

    const [payload, setPayload] = React.useState({
        password: '',
        confirmPassword: '',
    });

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleReset();
        }
    };

    const handleReset = async () => {
        setSubmit(true);
        let isValid = true;
        if (payload.confirmPassword.trim() === '' || payload.password.trim() === '' || payload.password.trim() !== payload.confirmPassword.trim()) {
            isValid = false;
            ThongBao({ status: 'warn', message: 'Mật khẩu không trùng khớp, vui lòng kiểm tra lại' });
        } else {
            isValid = true;
        }
        if (isValid) {
            fetch(`${API_RESET}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    matKhau: payload.password,
                    token: resetToken,
                }),
            })
                .then((res) => {
                    if (res.status === 200) {
                        console.log('res', res);
                        return res.text();
                    }
                    return null;
                })
                .then((data) => {
                    if (data === '1') {
                        ThongBao({ status: 'success', message: 'Thay đổi mật khẩu thành công' });
                        navigate('/dang-nhap');
                    }
                })
                .catch((err) => {
                    ThongBao({ status: 'warn', message: 'Thay đổi khẩu không thành công' });
                    console.log('err', err);
                });
        }
    };
    const [resetPassword, setResetPassword] = React.useState(false);

    useEffect(() => {
        if (payload.confirmPassword.trim() === '' || payload.password.trim() === '' || payload.password.trim() !== payload.confirmPassword.trim()) {
            setResetPassword(false);
        } else {
            setResetPassword(true);
        }
    }, [payload.password, payload.confirmPassword]);

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', alignItems: 'center' }}>
                <img src={Cirensoft} alt="Ảnh nằm toàn màn hình" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '485px', height: '689.8px', borderRadius: '20px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#FFFF', position: 'relative', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '485px', height: '650px', borderRadius: '20px' }}>
                        <Grid item xs={12} sm={6} md={4} lg={3} style={{ backgroundColor: '#ffffff', width: '357px', height: '450px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Avatar src={CirensoftLogo} sx={{ width: 84, height: 84, borderRadius: '50%', mb: 1, mt: 2 }} onClick={() => navigate('/trang-chu')} />
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
                                    BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Roboto',
                                        fontWeight: 'medium',
                                        fontSize: '16px',
                                        textAlign: 'center',
                                        color: '#b0d8ee',
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
                                    ĐỔI MẬT KHẨU
                                </Typography>
                            </div>




                            <TextField
                                label="Tên đăng nhập"
                                disabled={true}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={userName}
                                onKeyUp={handleKeyPress}
                                readOnly
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
                                label="Mật khẩu mới"
                                variant="outlined"
                                fullWidth
                                id='password'
                                margin="normal"
                                type={showPassword ? 'text' : 'password'}
                                value={payload.password}
                                onKeyUp={handleKeyPress}
                                // required
                                onChange={(e) => setPayload((prev) => ({ ...prev, password: e.target.value }))}
                                error={submit && !payload.password.trim()}
                                helperText={submit && payload.password.trim() === '' ? 'Vui lòng nhập mật khẩu' : ''}
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
                                        <IconButton onClick={handleTogglePasswordVisibility} edge="end" sx={{ color: '#000000', opacity: 0.8 }}>
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            <TextField
                                label="Nhập lại mật khẩu"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                type={showPassword ? 'text' : 'password'}
                                value={payload.confirmPassword}
                                onKeyUp={handleKeyPress}
                                onChange={(e) => setPayload((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                error={submit && !payload.confirmPassword.trim()}
                                helperText={submit && payload.confirmPassword.trim() === '' ? 'Vui lòng nhập mật khẩu xác minh' : ''}
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
                                        <IconButton onClick={handleTogglePasswordVisibility} edge="end" sx={{ color: '#000000', opacity: 0.8 }}>
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                            />
                            <Button
                                disabled={!resetPassword}
                                fullWidth
                                size="large"
                                onClick={handleReset}
                                sx={{
                                    color: '#fff',
                                    fontSize: '16.84px',
                                    fontFamily: 'Inter',
                                    fontWeight: 'semiBold',
                                    backgroundColor: resetPassword ? '#b0d8ee' : 'white',
                                    padding: '14px 0px',
                                    paragraphSpacing: '18.33px',
                                    '&:hover': {
                                        backgroundColor: '#115293',
                                    },
                                    textTransform: 'none',
                                    mt: error ? 0 : 3,
                                }}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Grid>
                    </div>

                </div>
            </div>
        </>
    );
};
export default ResetPassword;
