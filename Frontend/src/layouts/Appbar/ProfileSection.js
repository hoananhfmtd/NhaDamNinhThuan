import {
    CheckCircleRounded,
    Devices,
    Error,
    EventNote,
    FeedbackOutlined,
    LockOpen,
    Save,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CallIcon from '@mui/icons-material/Call';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LaptopIcon from '@mui/icons-material/Laptop';
import Logout from '@mui/icons-material/Logout';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SaveIcon from '@mui/icons-material/Save';
import {
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { ActivitiesListModal, DevicesListModal } from '../../account/Account';
import Api, { API_URI } from '../../api';
import QRZalo from '../../assets/images/QRzalo.jpg';
import zaloIcon from '../../assets/images/zalo.png';
import { MyButton, MyForm, ThongBao } from '../../components';
import { clearAllIndexedDB, showConfirmDialog } from '../../helpers';
import { actionTypes } from '../../store';
import { HelpBox } from '../help';
import { Report } from '../report';
const ProfileSection = () => {
    const { role, typeOfUsers, scope, fullName, coQuanThucHienId } = useSelector(
        (state) => state?.auth
    );
    const tinhThanhs =
        useSelector((state) => state.app?.DanhMucs?.tinhThanhs) || [];
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPasswordOld, setShowPasswordOld] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showPasswordCF, setShowPasswordCF] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [error, setError] = React.useState('');
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const [loading, setLoading] = React.useState(false);
    const handleClose = () => {
        setAnchorEl(null);
    };
    const [openDialog, setOpenDialog] = React.useState(false);
    const [openDialogMK, setOpenDialogMK] = React.useState(false);
    const [openDialogCF, setOpenDialogCF] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [fullNameAvt, setFullNameAvt] = React.useState('');

    const formRef = React.useRef(null);
    const formRefMK = React.useRef(null);
    const isNullish = (value) =>
        value === undefined || value === null || value === '';

    const handleCloseDialog = () => {
        if (isEditing) {
            setOpenDialogCF(true);
        } else {
            setOpenDialog(false);
        }
    };
    const handleEditClick = () => {
        setIsEditing(true);
    };
    const handleCloseCF = () => {
        setOpenDialogCF(false);
    };
    const handleConfirmCF = () => {
        setOpenDialogCF(false);
        if (isEditing) {
            setOpenDialog(false);
            setIsEditing(false);
            setError({});
        } else {
            setOpenDialogMK(false);
            setOpenDialog(true);
        }
    };
    const resetDuLieu = () => {
        dispatch({
            type: actionTypes.RESET_LVS,
            payload: {
                id: 'bieuNhap',
            },
        });
        dispatch({
            type: actionTypes.RESET_TINH,
            payload: {
                id: 'bieuNhap',
            },
        });
    };
    const handleSaveClick = async () => {
        if (Object.values(error).some((e) => e)) {
            ThongBao({
                status: 'error',
                message: Object.values(error).find((e) => e),
            });
            return;
        }
        setIsEditing(false);
        try {
            const { id, fullName, email, phone } = formRef.current.values;
            const res = await new Api().updateInfo({
                data: { id, fullName, email, phone },
            });
            if (res.code === 200) {
                ThongBao({ status: 'success', message: 'Lưu thành công' });
                getMe();
            } else {
                ThongBao({ code: res.code });
            }
        } catch (err) {
            console.log(err);
            ThongBao({ status: 'error', message: 'Lưu thất bại' });
        }
    };
    const [initialValues, setInitialValues] = React.useState();
    const handleLogout = () => {
        showConfirmDialog(
            'Chú ý: các thông tin mà bạn chưa lưu sẽ bị xóa vĩnh viễn!',
            'Bạn muốn đăng xuất?',
            async (result) => {
                if (result) {
                    dispatch({ type: 'LOGOUT' });
                    resetDuLieu();
                    clearAllIndexedDB();
                    const response = await new Api().logout();
                    if (response.code === 200) {
                        navigate('/dang-nhap');
                    }
                }
            }
        );
    };
    // xóa dữ liệu indexDB

    React.useEffect(() => {
        getMe();
    }, []);
    const PasswordVisibilityToggle = ({ visible, toggleVisibility }) => (
        <InputAdornment position="end">
            <IconButton onClick={toggleVisibility} edge="end">
                {visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );
    const accessoken = localStorage.getItem('access-token');
    const handleCloseDialogMK = () => {
        const { oldPass, newPass, confirmPassword } = formRefMK.current.values;

        if (
            isNullish(oldPass) &&
            isNullish(newPass) &&
            isNullish(confirmPassword)
        ) {
            setOpenDialogMK(false);
            setOpenDialog(true);
        } else {
            setOpenDialogCF(true);
        }
    };
    const [setErrorBE, setErrosBE] = React.useState('');
    const handleChangePassWord = async () => {
        const { oldPass, newPass, confirmPassword } = formRefMK.current.values;
        if (!oldPass) {
            formRefMK.current.setErrors({
                oldPass: 'Mật khẩu cũ không được để trống',
            });
            return;
        }
        if (!newPass) {
            formRefMK.current.setErrors({
                newPass: 'Mật khẩu mới không được để trống',
            });
            return;
        }
        if (!confirmPassword) {
            formRefMK.current.setErrors({
                confirmPassword: 'Xác nhận mật khẩu không được để trống',
            });
            return;
        }
        if (newPass !== confirmPassword) {
            formRefMK.current.setErrors({
                confirmPassword:
                    'Xác nhận mật khẩu không khớp với mật khẩu mới',
            });
            return;
        }
        if (newPass.length < 6) {
            formRefMK.current.setErrors({
                newPass: 'Mật khẩu phải lớn hơn 6 ký tự',
            });
            return;
        }
        fetch(`${API_URI}users/doimatkhau`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessoken}`,
            },
            body: JSON.stringify({ oldPass, newPass }),
        })
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                }
                if (res.status !== 200) {
                    return res.text();
                }
            })
            .then((data) => {
                if (data === 'matkhau_error') {
                    ThongBao({
                        status: 'error',
                        message: 'Mật khẩu cũ của bạn không đúng!',
                    });
                    setErrosBE('Mật khẩu cũ của bạn không đúng!');
                } else {
                    ThongBao({
                        status: 'success',
                        message: 'Đổi mật khẩu thành công',
                    });
                    setOpenDialogMK(false);
                    setOpenDialog(true);
                    setErrosBE('');
                }
            })
            .catch((err) => {
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra: Xem chi tiết tại log!',
                });
            });
    };
    const getMe = async () => {
        setLoading(true);
        try {
            const res = await new Api().getProfile({ data: {} });
            if (res.code === 200) {
                const data = { ...res.data };
                setFullNameAvt(data?.fullName);
                setInitialValues(data);
            } else {
                if (res.code === 401) {
                    dispatch({
                        type: actionTypes.LOGOUT,
                    });
                }
            }
        } catch (err) {
            ThongBao({ status: 'error', message: 'Có lỗi xảy ra, xem log!' });
        } finally {
            setLoading(false);
        }
    };
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Vui lòng nhập email'),
        fullName: Yup.string().required('Vui lòng nhập họ và tên'),
        phone: Yup.string()
            .required('Vui lòng nhập số điện thoại')
            .matches(/^[0-9]+$/, 'Số điện thoại không hợp lệ')
            .max(10, 'Số điện thoại phải là 10 số')
            .min(10, 'Số điện thoại phải là 10 số'),
    });
    const checkValidate = (field, value) => {
        validationSchema
            .validateAt(field, { [field]: value })
            .then(() => {
                setError((prevErrors) => ({ ...prevErrors, [field]: '' }));
                setIsSuccess((prevSuccess) => ({
                    ...prevSuccess,
                    [field]: true,
                }));
            })
            .catch((err) => {
                setError((prevErrors) => ({
                    ...prevErrors,
                    [field]: err.message,
                }));
                setIsSuccess((prevSuccess) => ({
                    ...prevSuccess,
                    [field]: false,
                }));
            });
    };
    const handleShowDialog = () => {
        setOpenDialog(true);
        setLoading(true);
        setAnchorEl(null);
        getMe();
    };

    return (
        <>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                keepMounted
                maxWidth="30vw"
            >
                {loading ? (
                    <div
                        style={{
                            width: '30vw',
                            height: '65vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <DialogContent
                            style={{
                                width: '1000px',
                                display: 'flex',
                                flexDirection: 'column',
                                paddingTop: 10,
                            }}
                        >
                            <MyForm
                                formikRef={formRef}
                                dataFormik={initialValues}
                                validationSchema={validationSchema}
                                onSubmitAPI={() => { }}
                                editable={true}
                                children={({
                                    values,
                                    errors,
                                    setFieldValue,
                                }) => (
                                    <>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '20px',
                                                }}
                                            >
                                                Thông tin cá nhân
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    gap: 3,
                                                }}
                                            >
                                                <MyButton
                                                    icon={<LockOpen />}
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setOpenDialog(false);
                                                        setOpenDialogMK(true);
                                                    }}
                                                    txt="Đổi mật khẩu"
                                                />
                                            </Box>
                                        </Box>

                                        {/* <DialogContent> */}
                                        <Grid
                                            container
                                            spacing={2}
                                            textAlign="center"
                                            justifyContent="center"
                                            mt={2}
                                        >
                                            <Grid
                                                item
                                                xs={12}
                                                sx={{
                                                    backgroundColor: '#e0f2fe',
                                                }}
                                                ml={2}
                                            >
                                                <Avatar
                                                    alt={values?.avatarUrl}
                                                    src={
                                                        values?.avatarUrl ||
                                                        'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                                                    }
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        margin: '0 auto',
                                                    }}
                                                />
                                            </Grid>
                                            <Grid
                                                item
                                                xs={12}
                                                sx={{
                                                    backgroundColor: '#e0f2fe',
                                                }}
                                                ml={2}
                                                pb={1}
                                            >
                                                <Typography variant="h6">
                                                    {values?.userName}
                                                    <Tooltip
                                                        title="Đã xác thực"
                                                        placement="right"
                                                    >
                                                        <IconButton
                                                            aria-label={
                                                                'Đã xác thực'
                                                            }
                                                            size="small"
                                                            onClick={() => { }}
                                                        >
                                                            <CheckCircleRounded
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    color: '#4CAF50',
                                                                }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                display={'flex'}
                                                xs={12}
                                                ml={2}
                                                pb={1}
                                                justifyContent={'flex-end'}
                                            >
                                                {isEditing ? (
                                                    <Tooltip
                                                        title="Lưu chỉnh sửa"
                                                        placement="top"
                                                    >
                                                        <MyButton
                                                            icon={<SaveIcon />}
                                                            color="info"
                                                            onClick={
                                                                handleSaveClick
                                                            }
                                                            txt="Lưu lại chỉnh sửa"
                                                        />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip
                                                        title="Chỉnh sửa thông tin"
                                                        placement="top"
                                                    >
                                                        <MyButton
                                                            icon={<EditIcon />}
                                                            color="info"
                                                            onClick={
                                                                handleEditClick
                                                            }
                                                            txt="Chỉnh sửa thông tin cá nhân"
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Grid>

                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Họ và tên:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {isEditing ? (
                                                    <div>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            value={
                                                                values.fullName ||
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    'fullName',
                                                                    e.target
                                                                        .value
                                                                );
                                                                checkValidate(
                                                                    'fullName',
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            error={
                                                                !!error.fullName
                                                            }
                                                            helperText={
                                                                error.fullName ||
                                                                (isSuccess.fullName &&
                                                                    'Họ và tên hợp lệ')
                                                            }
                                                            FormHelperTextProps={{
                                                                style: {
                                                                    color: isSuccess.fullName
                                                                        ? '#4CAF50'
                                                                        : 'red',
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {values?.fullName}
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Email:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {isEditing ? (
                                                    <div>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            value={
                                                                values.email ||
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    'email',
                                                                    e.target
                                                                        .value
                                                                );
                                                                checkValidate(
                                                                    'email',
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            error={
                                                                !!error.email
                                                            }
                                                            helperText={
                                                                error.email ||
                                                                (isSuccess.email &&
                                                                    'Email hợp lệ')
                                                            }
                                                            FormHelperTextProps={{
                                                                style: {
                                                                    color: isSuccess.email
                                                                        ? '#4CAF50'
                                                                        : 'red',
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {values?.email}
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Tài khoản:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {typeOfUsers === 'system' && (
                                                    <Typography variant="body1">
                                                        Quản trị viên hệ thống
                                                    </Typography>
                                                )}
                                                {role === 'Admin' &&
                                                    scope === 'tw' &&
                                                    typeOfUsers !==
                                                    'system' && (
                                                        <Typography variant="body1">
                                                            Quản trị viên trung
                                                            ương
                                                        </Typography>
                                                    )}
                                                {role === 'Admin' &&
                                                    scope === 'dvtt' &&
                                                    typeOfUsers !==
                                                    'system' && (
                                                        <Typography variant="body1">
                                                            Quản trị viên đơn vị
                                                            trực thuộc
                                                        </Typography>
                                                    )}
                                                {role === 'Admin' &&
                                                    scope === 'tinh' && (
                                                        <Typography variant="body1">
                                                            Quản trị viên tỉnh
                                                        </Typography>
                                                    )}
                                                {role === 'GiamSat' &&
                                                    scope === 'tw' && (
                                                        <Typography variant="body1">
                                                            Giám sát trung ương
                                                        </Typography>
                                                    )}
                                                {role === 'GiamSat' &&
                                                    scope === 'dvtt' && (
                                                        <Typography variant="body1">
                                                            Giám sát đơn vị trực
                                                            thuộc
                                                        </Typography>
                                                    )}
                                                {role === 'GiamSat' &&
                                                    scope === 'tinh' && (
                                                        <Typography variant="body1">
                                                            Giám sát tỉnh
                                                        </Typography>
                                                    )}
                                                {role === 'User' && (
                                                    <Typography variant="body1">
                                                        Người dùng
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Số điện thoại:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {isEditing ? (
                                                    <div>
                                                        <TextField
                                                            variant="outlined"
                                                            size="small"
                                                            value={
                                                                values.phone ||
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    'phone',
                                                                    e.target
                                                                        .value
                                                                );
                                                                checkValidate(
                                                                    'phone',
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            error={
                                                                !!error.phone
                                                            }
                                                            helperText={
                                                                error.phone ||
                                                                (isSuccess.phone &&
                                                                    'Số điện thoại hợp lệ')
                                                            }
                                                            FormHelperTextProps={{
                                                                style: {
                                                                    color: isSuccess.phone
                                                                        ? '#4CAF50'
                                                                        : 'red',
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {values?.phone}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Phạm vi:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    {scope === 'tw'
                                                        ? 'Trung ương'
                                                        : scope === 'dvtt'
                                                            ? 'Đơn vị trực thuộc'
                                                            : tinhThanhs.find(
                                                                (item) =>
                                                                    item?.maTinh ===
                                                                    values?.tinhThanhId
                                                            )?.ten}
                                                </Typography>
                                            </Grid>
                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    Cơ quan thực hiện:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                <Typography variant="body1">
                                                    {values?.coQuanThucHien}
                                                </Typography>
                                            </Grid>
                                            <Divider sx={{ width: '100%' }} />
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {role === 'GiamSat' && (
                                                    <Typography variant="body1">
                                                        Thành viên nhóm:
                                                    </Typography>
                                                )}
                                                {role === 'User' && (
                                                    <Typography variant="body1">
                                                        Giám sát nhóm:
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{ textAlign: 'left' }}
                                            >
                                                {role === 'GiamSat' && (
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                    >
                                                        {values?.members?.map(
                                                            (item, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={item}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            )
                                                        )}
                                                        {values?.members
                                                            ?.length === 0 && (
                                                                <Typography variant="body1">
                                                                    chưa có thành
                                                                    viên
                                                                </Typography>
                                                            )}
                                                    </Stack>
                                                )}
                                                {role === 'User' && (
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                    >
                                                        <Chip
                                                            label={
                                                                values?.supervisor ||
                                                                'chưa có giám sát viên'
                                                            }
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                )}
                                            </Grid>

                                            {role !== 'Admin' && (
                                                <Divider
                                                    sx={{ width: '100%' }}
                                                />
                                            )}
                                        </Grid>
                                        {/* </DialogContent> */}
                                    </>
                                )}
                            />
                        </DialogContent>
                        <DialogActions>
                            <MyButton
                                txt="Đóng"
                                onClick={handleCloseDialog}
                                variant="outlined"
                            ></MyButton>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            {/* Dialog đổi mật khẩu */}
            <Dialog open={openDialogMK} maxWidth="30vw">
                {loading ? (
                    <div
                        style={{
                            width: '30vw',
                            height: '45vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CircularProgress />
                    </div>
                ) : (
                    <DialogContent
                        style={{
                            width: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingTop: 10,
                        }}
                    >
                        <MyForm
                            formikRef={formRefMK}
                            dataFormik={initialValues}
                            onSubmitAPI={() => { }}
                            editable={true}
                            children={({
                                values,
                                errors,
                                setFieldValue,
                                ...formik
                            }) => (
                                <>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 'bold',
                                                fontSize: '20px',
                                                pb: 2
                                            }}
                                        >
                                            Đổi mật khẩu
                                        </Typography>
                                    </Box>

                                    <Grid
                                        container
                                        spacing={2}
                                        textAlign="center"
                                        justifyContent="center"
                                    >
                                        <Grid
                                            item
                                            xs={12}
                                            sx={{ textAlign: 'left', display: 'flex', 'alignItems': 'center', gap: 1, flexDirection: 'column    ' }}
                                        >
                                            <TextField
                                                fullWidth
                                                id="oldPass"
                                                required
                                                name="oldPass"
                                                type={
                                                    showPasswordOld
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                size='small'
                                                label="Mật khẩu cũ"
                                                placeholder='Nhập vào mật khẩu cũ'
                                                value={values?.oldPass}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        'oldPass',
                                                        e.target.value
                                                    )
                                                }
                                                error={
                                                    setErrorBE ||
                                                        errors?.oldPass
                                                        ? true
                                                        : false
                                                }
                                                helperText={
                                                    setErrorBE ||
                                                    errors?.oldPass
                                                }
                                                InputProps={{
                                                    // Add the toggle component as the end adornment
                                                    endAdornment: (
                                                        <PasswordVisibilityToggle
                                                            visible={
                                                                showPasswordOld
                                                            }
                                                            toggleVisibility={() =>
                                                                setShowPasswordOld(
                                                                    !showPasswordOld
                                                                )
                                                            }
                                                        />
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Mật khẩu mới"
                                                placeholder='Nhập vào mật khẩu mới'
                                                id="newPass"
                                                name="newPass"
                                                size='small'
                                                required
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={values?.newPass}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        'newPass',
                                                        e.target.value
                                                    )
                                                }
                                                error={
                                                    errors?.newPass
                                                        ? true
                                                        : false
                                                }
                                                helperText={errors?.newPass}
                                                InputProps={{
                                                    // Add the toggle component as the end adornment
                                                    endAdornment: (
                                                        <PasswordVisibilityToggle
                                                            visible={
                                                                showPassword
                                                            }
                                                            toggleVisibility={() =>
                                                                setShowPassword(
                                                                    !showPassword
                                                                )
                                                            }
                                                        />
                                                    ),
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                label="Mật khẩu xác nhận"
                                                placeholder='Nhập vào mật khẩu xác nhận'
                                                size='small'
                                                required
                                                type={
                                                    showPasswordCF
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={values?.confirmPassword}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        'confirmPassword',
                                                        e.target.value
                                                    )
                                                }
                                                error={
                                                    errors?.confirmPassword
                                                        ? true
                                                        : false
                                                }
                                                helperText={
                                                    errors?.confirmPassword
                                                }
                                                InputProps={{
                                                    // Add the toggle component as the end adornment
                                                    endAdornment: (
                                                        <PasswordVisibilityToggle
                                                            visible={
                                                                showPasswordCF
                                                            }
                                                            toggleVisibility={() =>
                                                                setShowPasswordCF(
                                                                    !showPasswordCF
                                                                )
                                                            }
                                                        />
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <DialogActions >
                                        <MyButton variant="outlined" onClick={handleCloseDialogMK} style={{ marginTop: '10px' }} txt="Đóng">
                                        </MyButton>
                                        <MyButton
                                            style={{ marginTop: '10px' }}
                                            icon={<Save />}
                                            txt="Lưu thay đổi"
                                            onClick={() => {
                                                handleChangePassWord();
                                            }}
                                        />
                                    </DialogActions>
                                </>
                            )}
                        />
                    </DialogContent>
                )}
            </Dialog>

            <Dialog
                open={openDialogCF}
                onClose={handleCloseCF}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Xác nhận</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn đóng mà không lưu các thay đổi
                        không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MyButton onClick={handleCloseCF} color="primary">
                        Hủy
                    </MyButton>
                    <MyButton onClick={handleConfirmCF} color="primary">
                        Xác nhận
                    </MyButton>
                </DialogActions>
            </Dialog>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconBox />

                <div
                    style={{
                        marginRight: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'black',
                    }}
                >
                    <span
                        style={{
                            fontSize: '14px',
                            fontStyle: 'Regular',
                            font: 'Inter',
                        }}
                    >
                        {fullNameAvt || 'Chưa cập nhật'}
                    </span>
                    {typeOfUsers === 'system' && role === 'Admin' && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'Light',
                                font: 'Inter',
                                color: '#5B5B5B',
                            }}
                        >
                            Quản trị viên hệ thống
                        </span>
                    )}

                    {typeOfUsers !== 'system' &&
                        role === 'Admin' &&
                        scope === 'tw' && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'Light',
                                    font: 'Inter',
                                    color: '#5B5B5B',
                                }}
                            >
                                Quản trị viên trung ương
                            </span>
                        )}
                    {typeOfUsers !== 'system' &&
                        role === 'Admin' &&
                        scope === 'dvtt' && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'Light',
                                    font: 'Inter',
                                    color: '#5B5B5B',
                                }}
                            >
                                Quản trị viên đơn vị trực thuộc
                            </span>
                        )}
                    {typeOfUsers !== 'system' &&
                        role === 'Admin' &&
                        scope === 'tinh' && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontStyle: 'Light',
                                    font: 'Inter',
                                    color: '#5B5B5B',
                                }}
                            >
                                Quản trị viên tỉnh
                            </span>
                        )}
                    {role === 'GiamSat' && scope === 'tw' && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'Light',
                                font: 'Inter',
                                color: '#5B5B5B',
                            }}
                        >
                            Giám sát trung ương
                        </span>
                    )}
                    {role === 'GiamSat' && scope === 'tinh' && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'Light',
                                font: 'Inter',
                                color: '#5B5B5B',
                            }}
                        >
                            Giám sát tỉnh
                        </span>
                    )}
                    {role === 'GiamSat' && scope === 'dvtt' && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'Light',
                                font: 'Inter',
                                color: '#5B5B5B',
                            }}
                        >
                            Giám sát đơn vị trực thuộc
                        </span>
                    )}
                    {role === 'User' && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontStyle: 'Light',
                                font: 'Inter',
                                color: '#5B5B5B',
                            }}
                        >
                            Người dùng
                        </span>
                    )}
                </div>

                <svg
                    onClick={handleClick}
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        cursor: "pointer",
                        borderRadius: '50%',
                        border: '1px solid rgb(145 135 135)',
                    }}
                >
                    <rect width="40" height="40" rx="20" fill="#F2F4F6" />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M26.0002 16C26.0002 19.3137 23.314 22 20.0002 22C16.6865 22 14.0002 19.3137 14.0002 16C14.0002 12.6863 16.6865 10 20.0002 10C23.314 10 26.0002 12.6863 26.0002 16ZM24.0002 16C24.0002 18.2091 22.2094 20 20.0002 20C17.7911 20 16.0002 18.2091 16.0002 16C16.0002 13.7909 17.7911 12 20.0002 12C22.2094 12 24.0002 13.7909 24.0002 16Z"
                        fill="#5B0400"
                    />
                    <path
                        d="M20.0002 25C13.5259 25 8.00952 28.8284 5.9082 34.192C6.4201 34.7004 6.95934 35.1812 7.52353 35.6321C9.08827 30.7077 13.997 27 20.0002 27C26.0035 27 30.9122 30.7077 32.477 35.6321C33.0412 35.1812 33.5804 34.7004 34.0923 34.1921C31.991 28.8284 26.4746 25 20.0002 25Z"
                        fill="#5B0400"
                    />
                </svg>
            </div>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                        width: 200,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    MenuItem
                    onClick={handleShowDialog}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#e0f2fe',
                        },
                    }}
                >
                    <Avatar /> Cá nhân
                </MenuItem>
                <Divider />

                <div>
                    {role === 'Admin' && (
                        <ActivitiesListModal>
                            <MenuItem
                                sx={{
                                    '&:hover': {
                                        backgroundColor: '#e0f2fe',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <EventNote fontSize="small" />
                                </ListItemIcon>
                                Nhật ký hoạt động
                            </MenuItem>
                        </ActivitiesListModal>
                    )}
                </div>

                <div>
                    <DevicesListModal>
                        <MenuItem
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#e0f2fe',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Devices fontSize="small" />
                            </ListItemIcon>
                            Quản lý thiết bị
                        </MenuItem>
                    </DevicesListModal>
                </div>

                {/* <MenuItem
                    sx={{
                        '&:hover': {
                            backgroundColor: '#e0f2fe',
                        },
                    }}
                    onClick={handleClose}
                >
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Cài đặt
                </MenuItem> */}

                {coQuanThucHienId === 'c1dvtt' && <MenuItem
                    sx={{
                        '&:hover': {
                            backgroundColor: '#e0f2fe',
                        },
                    }}
                    onClick={() => navigate("/error-report-list")}
                >
                    <ListItemIcon>
                        <Error fontSize="small" />
                    </ListItemIcon>
                    Danh sách lỗi
                </MenuItem>}

                <MenuItem
                    sx={{
                        '&:hover': {
                            backgroundColor: '#e0f2fe',
                        },
                    }}
                    onClick={handleLogout}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Đăng xuất
                </MenuItem>
            </Menu>
        </>
    );
};

const IconBox = () => {
    const [open, setOpen] = React.useState(false);
    const [openReport, setOpenReport] = React.useState(false);
    const [showZalo, setShowZalo] = React.useState(false);
    const containerRef = React.useRef(null);
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowZalo(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleZaloClick = (event) => {
        event.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
        setShowZalo((prev) => !prev);
    };
    return (
        <div
            style={{
                display: 'flex',
                marginRight: '50px ',
                alignItems: 'center',
                gap: 12,
            }}
            ref={containerRef}
        >

            <div>
                <Tooltip title="Thông tin nhóm hỗ trợ" placement="top">
                    <div
                        onClick={handleZaloClick}
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: 'rgba(0, 0, 0, 0.87)',
                        }}
                    >
                        <img
                            src={zaloIcon}
                            alt="Zalo"
                            style={{
                                width: '30px',
                                height: '30px',
                            }}
                        />
                    </div>
                </Tooltip>
            </div>
            {showZalo && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50px',
                        right: '50px',
                        background: '#fff',
                        color: '#000',
                        border: '1px solid #ddd',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <h4>Thông tin nhóm hỗ trợ</h4>
                    <p>Liên hệ với chúng tôi qua Zalo để được hỗ trợ nhanh chóng.</p>
                    <hr />
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#333',
                            }}
                        >
                            <img
                                src={QRZalo} // Đường dẫn đến biểu tượng Zalo
                                alt="Zalo"
                                style={{
                                    width: '40%',
                                    height: '40%',
                                    marginRight: '20px',
                                }}
                                title='Quét mã QR để tham gia nhóm'
                            />
                            <ul
                                style={{
                                    listStyle: 'none',
                                    margin: 0,
                                    padding: 0,
                                    color: '#555',
                                    fontSize: '16px',
                                }}
                            >
                                <QrCodeScannerIcon
                                    style={{
                                        fontSize: '24px',
                                        marginRight: '10px',
                                    }}
                                />
                                Quét mã QR để tham gia nhóm.<br />
                                <LaptopIcon
                                    style={{
                                        fontSize: '24px',
                                        marginRight: '10px',
                                    }}
                                /> <a href="https://zalo.me/g/ikeial028" target="_blank" rel="noreferrer" title='Click để tham gia nhóm'>Tham gia nhóm trên web</a><br />
                                <CallIcon
                                    style={{
                                        fontSize: '24px',
                                        marginRight: '10px',
                                    }}
                                />
                                Hotline hỗ trợ.
                                <li style={{ margin: '4px 30px' }}>0987 024 636</li>
                                <li style={{ margin: '4px 30px' }}>0869 359 672</li>
                                <li style={{ margin: '4px 30px' }}>0963 234 104</li>
                                <li style={{ margin: '4px 30px' }}>0974 716 892</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <Tooltip title="Hướng dẫn sử dụng" placement="top">
                    <a
                        style={{
                            textDecoration: 'none',
                            color: 'rgba(0, 0, 0, 0.87)',
                        }}
                        href="https://drive.google.com/drive/folders/1mlguSo4BhxkZo4Cnpz7kC2R19prWfDgm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <HelpOutlineIcon />
                    </a>
                </Tooltip>
            </div>
            <div>
                <Tooltip title="Phản hồi và góp ý" placement="top">
                    <FeedbackOutlined
                        style={{
                            color: 'rgba(0, 0, 0, 0.87)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setOpenReport(true)}
                    />
                </Tooltip>
            </div>
            <div>
                <Tooltip
                    title="Chuyển đổi tọa độ VN2000, WGS84"
                    placement="top"
                >
                    <BuildCircleOutlinedIcon
                        style={{
                            color: 'rgba(0, 0, 0, 0.87)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setOpen(true)}
                    />
                </Tooltip>
            </div>
            <HelpBox open={open} onClose={() => setOpen(false)} />
            <Report open={openReport} onClose={() => setOpenReport(false)} />
        </div>
    );
};

export default ProfileSection;
