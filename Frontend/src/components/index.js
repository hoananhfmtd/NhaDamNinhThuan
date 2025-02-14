import {
    ArrowBack,
    Check,
    CloudUpload,
    CopyAll,
    DoneAll,
    ExpandLess,
    ExpandMore,
    FilterAltOff,
    MoreVert,
    Print,
    PushPinSharp,
    Save,
    SaveAlt,
    SwapHoriz,
    Warning,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import BackupIcon from '@mui/icons-material/Backup';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ModeOutlinedIcon from '@mui/icons-material/ModeOutlined';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ReportIcon from '@mui/icons-material/Report';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Backdrop,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    Link,
    ListItemIcon,
    Menu,
    MenuItem,
    Popover,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import { tooltipClasses } from '@mui/material/Tooltip';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { vi } from 'date-fns/locale';
import { FastField, Formik, isFunction } from 'formik';
import lodash, { cloneDeep, isArray, isEmpty } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import LogoEdit from '../assets/edit.png';
import LogoDelete from '../assets/trash.png';
import { Appcolors, FontSize } from '../const.js';
import { showConfirmDialog } from '../helpers.js';
import { useIsFirstRender, useStores } from '../hooks.js';
import { MyAutocomplete } from '../kktnn-components.js';
import '../styles/index.css';
import { useToggle } from './HHFormTable/Hooks/useToggle.js';
import { removeEmpty } from './HHFormTable/utils.js';

export function AnchorPagination({
    limit = 10,
    count = 0,
    page = 0,
    onBackPage,
    onNextPage,
    onChangeLimit,
}) {
    if (limit <= 0) {
        limit = 10;
    }
    const rowstart = page * limit + 1;
    let rowend = (page + 1) * limit;
    if (rowend > count) {
        rowend = count;
    }

    return (
        <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            marginTop={1}
        >
            {count ? (
                <Box
                    sx={{
                        minWidth: 80,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        mr: '10px',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: FontSize.textFieldLabel,
                            textAlign: 'center',
                        }}
                        variant="body2"
                        color={'#000000b3'}
                    >
                        <strong>{rowstart} </strong>
                        {'-'}
                        <strong>{rowend} </strong>
                        {' of '}
                        <strong>{count}</strong>
                    </Typography>
                </Box>
            ) : (
                <></>
            )}

            <Box sx={{ minWidth: 80, height: 30 }}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Dòng</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={limit}
                        label="Dòng"
                        onChange={onChangeLimit}
                        sx={{ height: 30 }}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid>
                <IconButton
                    aria-label="delete"
                    disabled={rowstart <= 1}
                    onClick={onBackPage}
                    color="primary"
                >
                    <ChevronLeftIcon />
                </IconButton>
                <IconButton
                    aria-label="delete"
                    disabled={rowend >= count}
                    color="primary"
                    onClick={onNextPage}
                >
                    <ChevronRightIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}

export function MyTable2({
    rows,
    columns,
    limit,
    count = 0,
    page,
    loading,
    onBackPage,
    onNextPage,
    onChangeLimit,
    onRowClicked,
    openDraw,
    gridOptions,
    hidePagination,
    ...tableProps
}) {
    const gridRef = useRef();
    const autofit = true;

    const rowstart = page * limit + 1;
    rows.forEach((row, index) => {
        row.stt = rowstart + index;
    });

    useEffect(() => {
        if (loading) {
            gridRef.current?.api?.showLoadingOverlay();
        } else {
            gridRef.current?.api?.hideOverlay();
            if (count <= 0) {
                gridRef.current?.api?.showNoRowsOverlay();
            }
        }
    }, [loading, count]);

    useEffect(() => {
        if (autofit) {
            setTimeout(function () {
                if (gridRef.current !== null) {
                    gridRef.current.api.sizeColumnsToFit();
                }
            }, 200);
        }
    }, [openDraw, autofit]);

    const onGridReady = (params) => {
        if (autofit === true) {
            params.api.sizeColumnsToFit();
        }
    };

    const defaultColDef = {
        // nếu text quá dài thì hiện ...
        resizable: false,
        editable: false,
        suppressMovable: true,
        filter: false,
        wrapText: true,
        minWidth: 50,
        sortable: false,
        cellStyle: {
            borderLeft: '1px solid #eeeeed',
            fontWeight: '400', // '500',
            fontFamily: 'Inter, sans-serif',
            color: '#344767', // 'rgba(52, 52, 52, 1)',
            fontSize: '13px', // '14px',
            lineHeight: '1.5', // '20px',
            // display: 'flex',
            // alignItems: 'center',
            verticalAlign: 'middle',
            whiteSpace: 'normal', // Cho phép văn bản xuống dòng
            overflow: 'hidden', // Ẩn phần vượt ra ngoài
            textOverflow: 'ellipsis', // Hiển thị "..." khi văn bản bị cắt
            display: '-webkit-box', // Tạo kiểu container box
            WebkitBoxOrient: 'vertical', // Định hướng phần tử là chiều dọc
            // WebkitLineClamp: 2,            // Giới hạn số dòng là 2
            // border: '1px solid red'
        },
        headerClass: 'my-header-class',
    };

    return (
        <div
            className="example-wrapper"
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#F2F4F6',
            }}
        >
            <div
                className="ag-theme-alpine"
                style={{ height: '100%', width: '100%' }}
            >
                <AgGridReact
                    {...tableProps}
                    ref={gridRef}
                    columnDefs={columns}
                    rowData={rows} // ignore deleted row
                    onRowClicked={onRowClicked}
                    gridOptions={{
                        ...gridOptions,
                        enableCellTextSelection: true,
                        ensureDomOrder: true,
                        rowSelection: 'multiple',
                    }}
                    rowHeight={41}
                    overlayNoRowsTemplate={'Không có dữ liệu'}
                    loadingOverlayComponent={
                        <div style={{ width: '100%', height: '100%' }}>
                            <CircularProgress />
                        </div>
                    }
                    overlayLoadingTemplate="Đang tải dữ liệu"
                    domLayout="autoHeight"
                    singleClickEdit={true}
                    stopEditingWhenCellsLoseFocus={true}
                    autofit={autofit}
                    groupSelectsChildren={true}
                    enableRangeSelection={true}
                    rowDragManaged={true}
                    animateRows={true}
                    autoHeight={true}
                    onGridReady={onGridReady}
                    defaultColDef={defaultColDef}
                />
                {!hidePagination && (
                    <AnchorPagination
                        limit={limit}
                        count={count}
                        page={page}
                        onBackPage={onBackPage}
                        onNextPage={onNextPage}
                        onChangeLimit={onChangeLimit}
                    />
                )}
            </div>
        </div>
    );
}

export const ThongBao = ({ code, message, status }) => {
    if (code) {
        switch (code) {
            case 200:
                return toast.success(message ? message : 'Thành công', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 299:
                return toast.warn(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 500:
                return toast.error(message ? message : 'Máy chủ đã gặp sự cố', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 400:
                return toast.error('Bad Request', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 401:
                return toast.error('Không xác thực', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 404:
                return toast.error('Không tìm thấy dữ liệu', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 408:
                return toast.error('Hết thời gian yêu cầu máy chủ', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 502:
                return toast.error('Hệ thống không phản hồi', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 503:
                return toast.error('Máy chủ không phản hồi do quá thời gian', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            default:
                return toast.error(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
        }
    } else {
        switch (status) {
            case 'success':
                return toast.success(message ? message : 'Thành công', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 'warn':
                return toast.warn(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 'error':
                return toast.error(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            case 'info':
                return toast.info(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            default:
                return toast.error(message ? message : 'Có lỗi xảy ra', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
        }
    }
};

export function RowActions({
    row,
    onView,
    onEdit,
    onDelete,
    canWrite = false,
    canView = true,
}) {
    const actionView = (
        <Tooltip title="Xem chi tiết" arrow>
            <IconButton
                onClick={() => {
                    onView(row);
                }}
            >
                <InfoIcon style={{ fontSize: '20px' }} />
            </IconButton>
        </Tooltip>
    ); // #3163c6
    const actionEdit = onEdit && (
        <Tooltip title="Sửa" arrow>
            <IconButton
                onClick={() => {
                    onEdit(row);
                }}
            >
                <ModeOutlinedIcon style={{ fontSize: '20px' }} />
            </IconButton>
        </Tooltip>
    ); // #63c2de

    const [refConfirm, setRefConfirm] = React.useState(null);
    // #f44336
    const actionDelete = (
        <>
            <Tooltip title="Xóa" arrow>
                <IconButton
                    onClick={(event) => setRefConfirm(event.currentTarget)}
                >
                    <DeleteOutlineIcon style={{ fontSize: '20px' }} />
                </IconButton>
            </Tooltip>
            <Popover
                open={refConfirm ? true : false}
                anchorEl={refConfirm}
                onClose={() => setRefConfirm(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div style={{ padding: '5px' }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '12px',
                            gap: '5px',
                        }}
                    >
                        <ReportIcon sx={{ color: 'orange', width: '18px' }} />
                        <Typography color={'#00000099'}>
                            Xóa bản ghi này ?{' '}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '16px',
                            gap: '5px',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            onClick={() => setRefConfirm(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            Hủy
                        </div>
                        <div
                            onClick={() => {
                                setRefConfirm(null);
                                onDelete(row);
                            }}
                            style={{ cursor: 'pointer', color: '#f44336' }}
                        >
                            Xóa
                        </div>
                    </div>
                </div>
            </Popover>
        </>
    );

    return (
        <>
            {canView && actionView}
            {canWrite && actionEdit}
            {canWrite && actionDelete}
        </>
    );
}

export function MyThaoTac({
    scopeTw,
    handleEdit,
    handleList,
    handleDetail,
    handleDelete,
    handleMap,
    handleFile,
    handleSetting,
    handleCongBo,
    handleOpenNewTab,
    conditionMap = true,
    ...props
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickDelete = () => {
        setAnchorEl(null);
        handleDelete(props.prams.data);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const { role } = useSelector((state) => state.auth);
    const userRole = role;
    return (
        <div className="mythaotac">
            {handleSetting ? (
                <Tooltip title="Cấu hình" arrow>
                    <SettingsIcon
                        onClick={() => {
                            handleSetting(props.prams.data);
                        }}
                        style={{ color: '#616161', fontSize: '20px' }}
                    />
                </Tooltip>
            ) : (
                ''
            )}
            {handleMap ? (
                <Tooltip title="Xem bản đồ" arrow disableInteractive>
                    <LanguageOutlinedIcon
                        onClick={() => {
                            if (!conditionMap) {
                                ThongBao({
                                    status: 'warn',
                                    message: 'Chưa có dữ liệu không gian',
                                });
                                return;
                            }
                            handleMap(props?.prams?.data);
                        }}
                        style={{
                            color: conditionMap ? '#63c2de' : 'lightgrey',
                            cursor: 'pointer',
                        }}
                    />
                </Tooltip>
            ) : (
                ''
            )}
            {handleFile ? (
                <Tooltip title="File đính kèm" arrow>
                    <DescriptionIcon
                        onClick={handleFile}
                        style={{ color: '#ff9800', fontSize: '20px' }}
                    />
                </Tooltip>
            ) : (
                ''
            )}
            {handleDetail ? (
                <Tooltip title="Xem chi tiết" arrow>
                    <InfoIcon
                        onClick={() => {
                            handleDetail(props.prams.data);
                        }}
                        style={{ color: '#3163c6', fontSize: '20px' }}
                    />
                </Tooltip>
            ) : (
                ''
            )}

            {handleCongBo ? (
                <Tooltip title="Công bố dữ liệu" arrow>
                    <BackupIcon
                        onClick={() => {
                            handleCongBo(props.prams.data);
                        }}
                        style={{ color: '#3163c6', fontSize: '20px' }}
                    />
                </Tooltip>
            ) : (
                ''
            )}

            {handleEdit && (
                <>
                    <Tooltip title="Sửa" arrow>
                        {/* <ModeOutlinedIcon
                                onClick={() => {
                                    handleEdit(props.prams.data);
                                }}
                                style={{ color: '#63c2de', fontSize: '20px' }}
                            /> */}
                        <img
                            src={LogoEdit}
                            alt="edit"
                            style={{
                                color: '#3163c6',
                                fontSize: '16px',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                handleEdit(props.prams.data);
                            }}
                        />
                    </Tooltip>
                </>
            )}
            {handleList ? (
                <Tooltip title="Xem chi tiết" arrow>
                    <label
                        onClick={() => {
                            handleList(props.prams.data);
                        }}
                        style={{ color: '#63c2de', fontSize: '20px' }}
                    >
                        {props.prams.data}
                    </label>
                </Tooltip>
            ) : (
                ''
            )}
            {handleDelete ? (
                <Tooltip title="Xóa" arrow>
                    {/* <DeleteOutlineIcon hidden={scopeTw} onClick={handleClick} style={{ color: '#f44336', fontSize: '20px' }} /> */}
                    <img
                        src={LogoDelete}
                        alt="edit"
                        style={{
                            color: '#3163c6',
                            fontSize: '16px',
                            cursor: 'pointer',
                        }}
                        onClick={handleClick}
                    />
                </Tooltip>
            ) : (
                ''
            )}

            {handleOpenNewTab ? (
                <Tooltip title="QR Code" arrow>
                    <QrCodeIcon
                        onClick={() => {
                            handleOpenNewTab(props.prams.data);
                        }}
                        style={{ color: '#3163c6', fontSize: '20px' }}
                    />
                </Tooltip>
            ) : (
                ''
            )}

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div style={{ padding: '5px' }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '12px',
                            gap: '5px',
                        }}
                    >
                        <ReportIcon sx={{ color: 'orange', width: '18px' }} />
                        <Typography color={'#00000099'}>
                            Xóa bản ghi này ?{' '}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '16px',
                            gap: '5px',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            onClick={handleClose}
                            style={{ cursor: 'pointer' }}
                        >
                            Hủy
                        </div>
                        <div
                            onClick={handleClickDelete}
                            style={{ cursor: 'pointer', color: '#f44336' }}
                        >
                            Xóa
                        </div>
                    </div>
                </div>
            </Popover>
        </div>
    );
}

export const MyBreadCrumbs = ({ title, renderItems, subMenu }) => {
    const [anchorEl, setAlchorEl] = useState(null);
    let navigate = useNavigate(); //chuyển trang

    const link = (value) => {
        if (value !== undefined) {
            navigate(value);
        }
    };
    const hover = (e, value) => {
        const target = e.target;
        if (value) {
            target.style.color = '#38bdf8';
            target.style.textDecoration = 'underline';
            target.style.zIndex = 1100;
        } else {
            if (target.style.color === '#38bdf8') {
                target.style.textDecoration = 'none';
            } else {
                target.style.color = 'inherit';
                target.style.textDecoration = 'none';
            }
        }
    };
    const handleClose = () => {
        setAlchorEl(null);
    };
    return (
        <div
            role="presentation"
            style={{
                backgroundColor: '#fff',
                zIndex: 1100,
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,
                marginTop: 10,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    zIndex: 1100,
                    borderTopRightRadius: 16,
                    borderTopLeftRadius: 16,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        zIndex: 1100,
                        flexShrink: 0,
                        paddingLeft: 10,
                    }}
                >
                    <Link
                        onClick={() => {
                            link(-1);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '20px',
                            zIndex: 1100,
                        }}
                    >
                        <ArrowBack fontSize="inherit" />
                    </Link>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {title &&
                            title.map((e, index) => {
                                if (e?.name === '') return null;
                                return (
                                    <div
                                        key={index}
                                        underline="hover"
                                        onClick={() => {
                                            link(e.link);
                                        }}
                                        onMouseOver={(e) => hover(e, true)}
                                        onMouseLeave={(e) => hover(e, false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            lineHeight: '1',
                                            fontSize: '16px',
                                            color:
                                                index === title.length - 1
                                                    ? '#38bdf8'
                                                    : 'inherit',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {e.name +
                                            (index + 1 < title?.length
                                                ? ' / '
                                                : '')}
                                    </div>
                                );
                            })}
                    </div>
                </div>
                {subMenu && (
                    <div
                        onClick={(e) => {
                            setAlchorEl(e.target);
                        }}
                        style={{
                            width: 'fit-content',
                            height: 'fit-content',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1100,
                        }}
                    >
                        <MoreVert sx={{ fontSize: '22px' }} />
                    </div>
                )}
                {renderItems ?? null}
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {subMenu?.length > 0 ? (
                        subMenu?.map((menu) => (
                            <MenuItem key={menu.label} onClick={menu.event}>
                                {menu?.icon && (
                                    <ListItemIcon>{menu.icon}</ListItemIcon>
                                )}
                                {menu.label}
                            </MenuItem>
                        ))
                    ) : (
                        <div></div>
                    )}
                </Menu>
            </div>
        </div>
    );
};

export const MyButton = React.forwardRef(
    (
        {
            loading = false,
            height,
            size,
            type,
            onClick,
            disabled,
            color = 'primary',
            colorText = '#fff',
            icon,
            width,
            fontSizeIcon,
            txt,
            handleUploadfile,
            uploadfile,
            marginRightStartIcon,
            multiple = false,
            variant = 'contained',
            sx,
            children,
            ...rest
        },
        ref
    ) => {
        return (
            <Tooltip title={txt} arrow>
                <span>
                    <LoadingButton
                        loading={loading}
                        type={type}
                        onClick={onClick}
                        disabled={disabled}
                        sx={{
                            '&.MuiButton-containedPrimary': {
                                fontSize: '12px',
                                minWidth: width,
                                color: colorText ? colorText : '#ffffff',
                                textTransform: 'none',
                                boxShadow: 'none',
                                border: `1px solid ${colorText}`,
                                borderRadius: '8px',
                            },
                            '&.MuiButton-outlinedPrimary': {
                                fontSize: '12px',
                                minWidth: width,
                                textTransform: 'none',
                                boxShadow: 'none',
                                borderRadius: '8px',
                            },
                            height: height ? height : '33px',
                            zIndex: 1100,
                            ...sx,
                        }}
                        disableElevation
                        variant={variant}
                        size={size ? size : 'small'}
                        startIcon={icon}
                        color={color ?? 'primary'}
                        {...rest}
                    >
                        <span
                            style={{
                                paddingTop: 0,
                                textTransform: 'capitalize',
                                fontWeight: 700,
                            }}
                        >
                            {txt}
                        </span>
                        {children}
                        {uploadfile === true ? (
                            <input
                                type="file"
                                hidden
                                multiple={multiple}
                                onClick={(event) => {
                                    event.target.value = null;
                                }}
                                onChange={(item) => handleUploadfile(item)}
                            />
                        ) : (
                            ''
                        )}
                    </LoadingButton>
                </span>
            </Tooltip>
        );
    }
);

export const Search = React.forwardRef(
    ({ width, required, helperText, label, height, ...rest }, ref) => {
        return (
            <div style={{ width: width }}>
                <TextField
                    {...rest}
                    helperText={helperText}
                    variant="outlined"
                    type="search"
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon sx={{ fontSize: '20px' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            height: height ? height : '33px',
                            color: '#3a4c6b',
                            fontSize: FontSize.textField,
                            '& .MuiOutlinedInput-input': {
                                padding: '12px 0px 12px 15px!important',
                            },
                        },
                    }}
                    sx={{
                        '.MuiFormHelperText-root': {
                            color: '#f44335 !important',
                            marginTop: '5px !important',
                            paddingLeft: '5px !important',
                            fontSize: '13px',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: helperText
                                    ? '#e91e63 !important'
                                    : '#cbd5e0 !important',
                            },
                            '&:hover fieldset': {
                                borderColor: '#a0a0a0 !important',
                            },
                            '&.Mui-focused fieldset': {
                                border: helperText
                                    ? '1px solid #e91e63 !important'
                                    : '1px solid #1a73e8 !important',
                            },
                        },
                    }}
                />
            </div>
        );
    }
);

export const MyForm = ({
    width,
    formikRef,
    childrenSearch,
    children,
    customSearch,
    dataFormik,
    validationSchema,
    onSubmitAPI,
    handleAdd,
    showSearch,
    showExcel,
    handleExportExcel,
    handleImportExcel,
    handleChange,
    editable = true,
    showFormikState,
    isql,
    kvtk,
}) => {
    return (
        <Grid item sx={{ width: width ? width : null }}>
            <Formik
                validateOnChange={false}
                validateOnBlur={false}
                innerRef={(f) => (formikRef.current = f)}
                enableReinitialize={true}
                initialValues={dataFormik ?? {}}
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    onSubmitAPI(values, actions);
                }}
            >
                {(props) => (
                    <form
                        id="table"
                        onSubmit={props.handleSubmit}
                        autoComplete="false"
                    >
                        <div>
                            {children ? children(props) : null}
                            {showSearch ? (
                                <div
                                    className="myform__select"
                                    style={{
                                        marginTop: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    {customSearch ? (
                                        <TextField
                                            name="search"
                                            placeholder="Tìm kiếm..."
                                            variant="outlined"
                                            type="search"
                                            value={props.values.search}
                                            onChange={(e) => {
                                                props.setFieldValue(
                                                    'search',
                                                    e.target.value
                                                );
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {props.values.search
                                                            .length > 0 ? (
                                                            <IconButton
                                                                onClick={() => {
                                                                    props.setFieldValue(
                                                                        'search',
                                                                        ''
                                                                    );
                                                                }}
                                                            >
                                                                <ClearIcon fontSize="small" />
                                                            </IconButton>
                                                        ) : (
                                                            <SearchIcon
                                                                sx={{
                                                                    fontSize:
                                                                        '20px',
                                                                }}
                                                            />
                                                        )}
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: '33px',
                                                    color: '#3a4c6b',
                                                    fontSize:
                                                        FontSize.textField,
                                                    '& .MuiOutlinedInput-input':
                                                    {
                                                        padding:
                                                            '12px 0px 12px 15px!important',
                                                    },
                                                },
                                            }}
                                            sx={{
                                                '.MuiFormHelperText-root': {
                                                    color: '#f44335 !important',
                                                    marginTop: '5px !important',
                                                    paddingLeft:
                                                        '5px !important',
                                                    fontSize: '13px',
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor:
                                                            '#cbd5e0 !important',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor:
                                                            '#a0a0a0 !important',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        border: '1px solid #1a73e8 !important',
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <FastField
                                            name="search"
                                            render={({ field }) => (
                                                <Search
                                                    placeholder="Tìm kiếm..."
                                                    {...field}
                                                />
                                            )}
                                        />
                                    )}

                                    <MyButton
                                        txt="Tìm kiếm"
                                        type="submit"
                                        // style={{width: 150, height: 26}}
                                        icon={<SearchRoundedIcon />}
                                    />
                                    {editable && handleAdd && !kvtk && (
                                        <MyButton
                                            onClick={handleAdd}
                                            txt="Thêm mới"
                                            // style={{width: 160, height: 26}}
                                            icon={<AddIcon />}
                                        />
                                    )}

                                    {showExcel && editable && (
                                        <MyButton
                                            txt="Xuất File Excel"
                                            color="#1da51de6"
                                            onClick={handleExportExcel}
                                            icon={<DescriptionIcon />}
                                        />
                                    )}

                                    {showExcel && editable && (
                                        <MyButton
                                            txt="Nhập File Excel"
                                            color="#1da51de6"
                                            onClick={handleImportExcel}
                                            icon={<UploadFileIcon />}
                                        />
                                    )}
                                    {childrenSearch ? childrenSearch : null}
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    </form>
                )}
            </Formik>
        </Grid>
    );
};

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));
const filterOptions = createFilterOptions({
    ignoreCase: true,
    matchFrom: 'start',
    limit: 10,
});

export const MySelectFreeSolo = React.forwardRef(
    (
        {
            errorMessage,
            width,
            multiple,
            clearAble,
            isFilterOptions,
            required,
            helperText,
            onChange,
            value,
            label,
            name,
            tooltip = false,
            tooltipContent,
            options,
            placeholder,
            errors,
            height,
            disabled,
            offPaddingBottom,
            disableClearable = false,
            freeSolo,
            defaultValue,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                style={{
                    width: width,
                    paddingBottom: offPaddingBottom
                        ? '0px !important'
                        : FontSize.DivLabelMarginBottom,
                    alignSelf: 'self-start',
                }}
            >
                {required ? (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                        <span style={{ color: 'red' }}> *</span>
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                    </Typography>
                )}
                <Autocomplete
                    value={value}
                    fullWidth
                    multiple={multiple}
                    options={options}
                    freeSolo
                    autoSelect
                    filterOptions={isFilterOptions && filterOptions}
                    disableClearable={
                        clearAble
                            ? !clearAble
                            : disableClearable
                                ? disableClearable
                                : value
                                    ? false
                                    : true
                    }
                    defaultValue={defaultValue ? defaultValue : undefined}
                    onChange={onChange}
                    onInputChange={
                        freeSolo
                            ? (event, newInputValue) => {
                                onChange(event, newInputValue);
                            }
                            : null
                    }
                    popupIcon={
                        <KeyboardArrowDownIcon
                            style={{ color: '#8080808a', fontSize: '20px' }}
                        />
                    }
                    getOptionLabel={(option, index) => {
                        return typeof option === 'string'
                            ? option
                            : typeof option === 'object'
                                ? option[name]
                                : '';
                    }}
                    renderOption={(props, option, { selected }) => {
                        return (
                            <>
                                {tooltip ? (
                                    <HtmlTooltip
                                        placement="left"
                                        title={
                                            <div {...props}>
                                                {tooltipContent &&
                                                    tooltipContent.map(
                                                        (e, i) => (
                                                            <div key={i}>
                                                                {option[
                                                                    e.content
                                                                ] !== null ? (
                                                                    <Typography
                                                                        color={
                                                                            '#344767e3'
                                                                        }
                                                                        sx={{
                                                                            fontSize:
                                                                                '14px',
                                                                        }}
                                                                    >
                                                                        <b>
                                                                            {
                                                                                e.title
                                                                            }
                                                                        </b>{' '}
                                                                        :{' '}
                                                                        {
                                                                            option[
                                                                            e
                                                                                .content
                                                                            ]
                                                                        }
                                                                    </Typography>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        }
                                    >
                                        <li {...props} key={option[name]}>
                                            <Typography
                                                color={'#344767e3'}
                                                sx={{ fontSize: '14px' }}
                                            >
                                                {option[name]}
                                            </Typography>
                                        </li>
                                    </HtmlTooltip>
                                ) : (
                                    <li {...props} key={option[name]}>
                                        <Typography
                                            color={'#344767e3'}
                                            sx={{ fontSize: '14px' }}
                                        >
                                            {option[name]}
                                        </Typography>
                                    </li>
                                )}
                            </>
                        );
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '4.5px',
                            paddingLeft: '10px',
                            color: Appcolors.textFiled,
                            fontSize: '13px',
                            textOverflow: 'ellipsis',
                            backgroundColor: disabled
                                ? Appcolors.backgroundDisabled
                                : 'white',
                            height: height ? height : '33px',
                            '& .MuiAutocomplete-input': {
                                height: '100%',
                                padding: '0px',
                                textOverflow: 'ellipsis',
                            },
                            '& .MuiAutocomplete-tag': {
                                height: '100%',
                                marginBottom: '-2px',
                            },
                        },
                    }}
                    disabled={disabled}
                    renderInput={(params) => (
                        <>
                            <TextField
                                {...params}
                                helperText={errors && helperText}
                                placeholder={placeholder}
                                sx={{
                                    '.MuiFormHelperText-root': {
                                        color: '#f44335 !important',
                                        marginTop: '5px !important',
                                        marginRight: '0px',
                                        marginLeft: '0px',
                                        paddingLeft: '5px !important',
                                        fontSize: '13px',
                                    },

                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: errors
                                                ? '#e91e63 !important'
                                                : '#cbd5e0 !important',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#a0a0a0 !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: errors
                                                ? '1px solid #e91e63 !important'
                                                : '1px solid #1a73e8 !important',
                                        },
                                    },
                                    '.MuiOutlinedInput-input.Mui-disabled': {
                                        WebkitTextFillColor:
                                            Appcolors.textFiledDisabled,
                                    },
                                }}
                                variant="outlined"
                            />
                            {errorMessage !== null && (
                                <div
                                    style={{
                                        color: 'red',
                                        fontSize: 10,
                                        lineHeight: 1,
                                        wordWrap: '',
                                        whiteSpace: 'wrap',
                                    }}
                                >
                                    {errorMessage}
                                </div>
                            )}
                        </>
                    )}
                    renderTags={(list) => {
                        let displayList = list
                            .map((item) => Object.values(item)[1])
                            .join(', ');

                        // Render <span> elements instead of <Chip> components.
                        return <span>{displayList}</span>;
                    }}
                    {...rest}
                />
            </div>
        );
    }
);

export const MySelectBang = React.memo(
    (
        {
            onFocus,
            onClick,
            limitTags,
            freeSolo,
            description,
            errorMessage,
            width,
            multiple,
            clearAble,
            isFilterOptions,
            required,
            helperText,
            onChange,
            value,
            label,
            name,
            tooltip = false,
            tooltipContent,
            options,
            placeholder,
            errors,
            height,
            disabled,
            offPaddingBottom,
            disableClearable = false,
            defaultValue,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                style={{
                    width: width,
                    paddingBottom: offPaddingBottom
                        ? '0px !important'
                        : FontSize.DivLabelMarginBottom,
                    alignSelf: 'self-start',
                }}
            >
                {required ? (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                        <span style={{ color: 'red' }}> *</span>
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                    </Typography>
                )}
                <Autocomplete
                    value={value}
                    fullWidth
                    name={name}
                    freeSolo={freeSolo}
                    limitTags={limitTags}
                    onFocus={onFocus}
                    multiple={multiple}
                    options={options}
                    filterOptions={isFilterOptions && filterOptions}
                    disableClearable={
                        clearAble
                            ? !clearAble
                            : disableClearable
                                ? disableClearable
                                : value
                                    ? false
                                    : true
                    }
                    defaultValue={defaultValue ? defaultValue : undefined}
                    onChange={onChange}
                    popupIcon={
                        <KeyboardArrowDownIcon
                            style={{ color: '#8080808a', fontSize: '20px' }}
                        />
                    }
                    getOptionLabel={(option, index) => {
                        return typeof option === 'string'
                            ? option
                            : typeof option === 'object'
                                ? option[name]
                                : '';
                    }}
                    renderOption={(props, option) => {
                        return (
                            <>
                                {tooltip ? (
                                    <HtmlTooltip
                                        placement="left"
                                        title={
                                            <div {...props}>
                                                {tooltipContent &&
                                                    tooltipContent.map(
                                                        (e, i) => (
                                                            <div key={i}>
                                                                {option[
                                                                    e.content
                                                                ] !== null ? (
                                                                    <Typography
                                                                        color={
                                                                            '#344767e3'
                                                                        }
                                                                        sx={{
                                                                            fontSize:
                                                                                '14px',
                                                                        }}
                                                                        key={i}
                                                                    >
                                                                        <b>
                                                                            {
                                                                                e.title
                                                                            }
                                                                        </b>{' '}
                                                                        :{' '}
                                                                        {
                                                                            option[
                                                                            e
                                                                                .content
                                                                            ]
                                                                        }
                                                                    </Typography>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        }
                                    >
                                        <li {...props} key={option[name]}>
                                            <Typography
                                                color={'#344767e3'}
                                                sx={{ fontSize: '14px' }}
                                            >
                                                {option[name]}
                                            </Typography>
                                        </li>
                                    </HtmlTooltip>
                                ) : (
                                    <li {...props} key={option[name]}>
                                        <Typography
                                            color={'#344767e3'}
                                            sx={{ fontSize: '14px' }}
                                        >
                                            {option[name]}
                                        </Typography>
                                    </li>
                                )}
                            </>
                        );
                    }}
                    sx={{
                        '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon':
                        {
                            '.MuiOutlinedInput-root': {
                                padding: '4.5px',
                            },
                        },
                        '& .MuiOutlinedInput-root': {
                            padding: '4.5px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            borderRadius: '5px',
                            backgroundColor: disabled
                                ? Appcolors.backgroundDisabled
                                : 'white',
                            height: height ? height : '33px',
                            '& .MuiAutocomplete-input': {
                                height: '100%',
                                padding: '0px',
                                textOverflow: 'ellipsis',
                            },
                            '& .MuiAutocomplete-tag': {
                                height: '100%',
                                marginBottom: '-2px',
                            },
                        },
                    }}
                    disabled={disabled}
                    renderInput={(params) => (
                        <>
                            <TextField
                                {...params}
                                helperText={errors && helperText}
                                placeholder={placeholder}
                                sx={{
                                    '.MuiFormHelperText-root': {
                                        color: '#f44335 !important',
                                        marginTop: '5px !important',
                                        marginRight: '0px',
                                        marginLeft: '0px',
                                        paddingLeft: '5px !important',
                                    },
                                    '& .MuiAutocomplete-endAdornment': {
                                        display: 'none',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        border: '1px solid #e8ebed', // Xóa border của TextField
                                        '& fieldset': {
                                            border: 'none', // Xóa border của fieldset
                                        },
                                    },
                                    '.MuiOutlinedInput-input.Mui-disabled': {
                                        WebkitTextFillColor:
                                            Appcolors.textFiledDisabled,
                                    },
                                    'MuiInputBase-input': {
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                    },
                                }}
                                variant="outlined"
                            />

                            {errorMessage !== null && (
                                <div style={{ position: 'absolute' }}>
                                    <span
                                        className="no_print"
                                        style={{
                                            color: 'red',
                                            fontSize: '12px',
                                            fontStyle: 'italic',
                                            lineHeight: 1,
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        {errorMessage}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                    renderTags={(list) => {
                        let displayList = list
                            .map((item) => Object.values(item)[1])
                            .join(', ');
                        // Render <span> elements instead of <Chip> components.
                        return <span>{displayList}</span>;
                    }}
                    {...rest}
                />
            </div>
        );
    }
);

export const MySelect = React.forwardRef(
    (
        {
            fontWeight,
            errorMessage,
            width,
            multiple,
            clearAble,
            limitTags,
            isFilterOptions,
            required,
            helperText,
            onChange,
            value,
            label,
            name,
            tooltip = false,
            tooltipContent,
            options,
            placeholder,
            errors,
            height,
            disabled,
            offPaddingBottom,
            disableClearable = false,
            defaultValue,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                style={{
                    width: width,
                    paddingBottom: offPaddingBottom
                        ? '0px !important'
                        : FontSize.DivLabelMarginBottom,
                    alignSelf: 'self-start',
                }}
            >
                {required ? (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        className="no_print"
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                        <span className="no_print" style={{ color: 'red' }}>
                            {' '}
                            *
                        </span>
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            marginBottom: label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        className="no_print"
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                    </Typography>
                )}
                <Autocomplete
                    value={value}
                    fullWidth
                    freeSolo
                    disabled={disabled}
                    multiple={multiple}
                    options={options}
                    filterOptions={isFilterOptions && filterOptions}
                    disableClearable={
                        clearAble
                            ? !clearAble
                            : disableClearable
                                ? disableClearable
                                : value
                                    ? false
                                    : true
                    }
                    defaultValue={defaultValue ? defaultValue : undefined}
                    onChange={onChange}
                    popupIcon={
                        <KeyboardArrowDownIcon
                            style={{ color: '#8080808a', fontSize: '20px' }}
                        />
                    }
                    getOptionLabel={(option, index) => {
                        return typeof option === 'string'
                            ? option
                            : typeof option === 'object'
                                ? option[name]
                                : '';
                    }}
                    renderOption={(props, option, { selected }) => {
                        return (
                            <>
                                {tooltip ? (
                                    <HtmlTooltip
                                        placement="left"
                                        title={
                                            <div {...props}>
                                                {tooltipContent &&
                                                    tooltipContent.map(
                                                        (e, i) => (
                                                            <div key={uuidv4()}>
                                                                {option[
                                                                    e.content
                                                                ] !== null ? (
                                                                    <Typography
                                                                        color={
                                                                            '#344767e3'
                                                                        }
                                                                        sx={{
                                                                            fontSize:
                                                                                '14px',
                                                                        }}
                                                                    >
                                                                        <b>
                                                                            {
                                                                                e.title
                                                                            }
                                                                        </b>{' '}
                                                                        :{' '}
                                                                        {
                                                                            option[
                                                                            e
                                                                                .content
                                                                            ]
                                                                        }
                                                                    </Typography>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        }
                                    >
                                        <li {...props} key={option[name]}>
                                            <Typography
                                                color={'#344767e3'}
                                                sx={{ fontSize: '14px' }}
                                            >
                                                {option[name]}
                                            </Typography>
                                        </li>
                                    </HtmlTooltip>
                                ) : (
                                    <li {...props} key={option[name]}>
                                        <Typography
                                            color={'#344767e3'}
                                            sx={{ fontSize: '14px' }}
                                        >
                                            {option[name]}
                                        </Typography>
                                    </li>
                                )}
                            </>
                        );
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '4.5px',
                            paddingLeft: '10px',
                            color: Appcolors.textFiled,
                            fontWeight: fontWeight ? 'bold' : 'normal',
                            fontSize: '13px',
                            textOverflow: 'ellipsis',
                            backgroundColor: disabled
                                ? Appcolors.backgroundDisabled
                                : 'white',
                            height: height ? '40px' : 'fit-content',
                            '& .MuiAutocomplete-input': {
                                height: '100%',
                                padding: '0px',
                                textOverflow: 'ellipsis',
                            },
                            '& .MuiAutocomplete-tag': {
                                height: '100%',
                                marginBottom: '-2px',
                            },
                        },
                    }}
                    renderInput={(params) => (
                        <>
                            <TextField
                                {...params}
                                helperText={errors && helperText}
                                placeholder={placeholder}
                                sx={{
                                    '.MuiFormHelperText-root': {
                                        color: '#f44335 !important',
                                        marginTop: '5px !important',
                                        marginRight: '0px',
                                        marginLeft: '0px',
                                        paddingLeft: '5px !important',
                                        fontSize: '13px',
                                    },

                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: errors
                                                ? '#e91e63 !important'
                                                : '#cbd5e0 !important',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#a0a0a0 !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: errors
                                                ? '1px solid #e91e63 !important'
                                                : '1px solid #1a73e8 !important',
                                        },
                                    },
                                    '.MuiOutlinedInput-input.Mui-disabled': {
                                        WebkitTextFillColor:
                                            Appcolors.textFiledDisabled,
                                    },
                                }}
                                variant="outlined"
                            />
                            {errorMessage !== null && (
                                <div
                                    style={{
                                        position: 'absolute',
                                    }}
                                >
                                    <span
                                        className="no_print"
                                        style={{
                                            color: 'red',
                                            fontSize: 12,
                                            fontStyle: 'italic',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {errorMessage}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                    renderTags={(list, getTagProps) => {
                        const limitTag = limitTags || 1; // Lấy giới hạn từ props hoặc mặc định là 1
                        const displayList = list.slice(0, limitTag); // Lấy các thẻ cần hiển thị
                        return (
                            <>
                                {displayList.map((item, index) => (
                                    <span
                                        key={uuidv4()}
                                        {...getTagProps({ index })}
                                    >
                                        {index > 0 ? ', ' : ''}
                                        {item.tenRutGon ||
                                            item.tenMuc ||
                                            item.ma}{' '}
                                        {/* Ưu tiên hiển thị tenRutGon, nếu không có thì hiển thị ten, cuối cùng là ma */}
                                    </span>
                                ))}
                                {/*     {displayList.map((item, index) => (
                                    <span
                                        key={uuidv4()}
                                        {...getTagProps({ index })}
                                    >
                                        {index > 0 ? ', ' : ''}
                                        {Object.values(item)[1]}{' '}
                                        {/* Hiển thị giá trị đầu tiên của item */}
                                {/* </span> */}
                                {/* ))} */}
                                {/* Hiển thị +n nếu có nhiều phần tử đã chọn vượt quá limitTag */}
                                {list.length > limitTag && (
                                    <span style={{ marginLeft: '5px' }}>
                                        +{list.length - limitTag}{' '}
                                        {/* Hiển thị số phần tử còn lại */}
                                    </span>
                                )}
                            </>
                        );
                    }}
                    // renderTags={(list, getTagProps) => {
                    //     const displayList = list
                    //         .slice(0, 1)
                    //         .map((item, index) => (
                    //             <span
                    //                 key={uuidv4()}
                    //                 {...getTagProps({ index })}
                    //             >
                    //                 {Object.values(item)[1]}
                    //             </span>
                    //         ));
                    //     return displayList;
                    // }}
                    {...rest}
                />
            </div>
        );
    }
);

export const MyTextField = React.forwardRef(
    (
        {
            width,
            required,
            helperText,
            label,
            height,
            disabled,
            errors,
            type,
            length,
            onClear,
            onChange,
            onBlur,
            onClick,
            value,
            acreage,
            InputProps,
            errorMessage,
            ...rest
        },
        ref
    ) => {
        const [hover, setHover] = useState(false);
        return (
            <div
                style={{
                    width: width ? width : '100%',
                    alignSelf: 'self-start',
                }}
            >
                {required ? (
                    <Typography
                        className="no_print"
                        sx={{
                            marginBottom: FontSize.LabelMarginBottom,
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                        {acreage ? (
                            <span>
                                (m<sup>2</sup>):
                            </span>
                        ) : null}
                        <span style={{ color: 'red' }}> *</span>
                    </Typography>
                ) : (
                    label && (
                        <Typography
                            className="no_print"
                            sx={{
                                marginBottom: FontSize.LabelMarginBottom,
                                fontSize: FontSize.textFieldLabel,
                            }}
                            variant="body2"
                            color={errors ? '#f44335' : '#000000b3'}
                        >
                            {label}
                        </Typography>
                    )
                )}
                <div
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '100%',
                    }}
                >
                    <TextField
                        {...rest}
                        helperText={errors && helperText}
                        variant="outlined"
                        type={type ? type : 'search'}
                        fullWidth
                        value={value ? value : ''}
                        disabled={disabled}
                        onChange={onChange}
                        onFocus={onClick}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onBlur={onBlur}
                        InputProps={
                            InputProps
                                ? InputProps
                                : {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {rest.status && (
                                                <ExpandCircleDownIcon
                                                    style={{
                                                        fontSize: '18px',
                                                        color: `${rest.status === 'current' ? '#969696' : rest.status === 'new' ? '#40eb34' : rest.status === 'update' ? '#edb139' : rest.status === 'empty' ? '#f44335' : ''}`,
                                                    }}
                                                />
                                            )}
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {!onClear && errors ? (
                                                <ReportOutlinedIcon
                                                    sx={{
                                                        fontSize: '16px',
                                                        color: '#f44335',
                                                    }}
                                                />
                                            ) : (
                                                <></>
                                            )}
                                            {rest?.showpassword &&
                                                (rest?.openeye ? (
                                                    <IconButton
                                                        onClick={() =>
                                                            rest?.showpassword()
                                                        }
                                                    >
                                                        <VisibilityIcon
                                                            sx={{
                                                                fontSize:
                                                                    '18px',
                                                            }}
                                                        />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton
                                                        onClick={() =>
                                                            rest?.showpassword()
                                                        }
                                                    >
                                                        <VisibilityOffIcon
                                                            sx={{
                                                                fontSize:
                                                                    '18px',
                                                            }}
                                                        />
                                                    </IconButton>
                                                ))}
                                            {!disabled && onClear && (
                                                <IconButton
                                                    className="no_print"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-2px',
                                                        margin: 'auto',
                                                        right: '4px',
                                                    }}
                                                    onClick={() => onClear()}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        //   backgroundColor: disabled ? Appcolors.backgroundDisabled : 'white',
                                        backgroundColor: disabled
                                            ? 'white'
                                            : 'white',
                                        height: height
                                            ? height
                                            : '33px !important',
                                        color: Appcolors.textFiled,
                                        // color: '#000',
                                        fontSize: FontSize.textField,
                                        '& .MuiOutlinedInput-input': {
                                            textOverflow: 'ellipsis',
                                        },
                                        '& .MuiOutlinedInput-input.Mui-disabled':
                                        {
                                            // WebkitTextFillColor: Appcolors.textFiledDisabled,
                                            WebkitTextFillColor: '#000',
                                        },
                                    },
                                }
                        }
                        sx={{
                            '.MuiFormHelperText-root': {
                                color: '#f44335 !important',
                                marginTop: '5px !important',
                                marginRight: '0px',
                                marginLeft: '0px',
                                paddingLeft: '5px !important',
                                fontSize: '13px',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: errors
                                        ? '#e91e63 !important'
                                        : '#cbd5e0 !important',
                                    // borderColor: '#000 !important'
                                },
                                '&:hover fieldset': {
                                    borderColor: '#a0a0a0 !important',
                                    // borderColor: '#000 !important'
                                },
                                '&.Mui-focused fieldset': {
                                    border: errors
                                        ? '1px solid #e91e63 !important'
                                        : '1px solid #1a73e8 !important',
                                },
                            },
                        }}
                    />

                    {errorMessage && (
                        <div
                            className="no_print"
                            style={{ position: 'absolute', bottom: '-20px' }}
                        >
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export const MyTextFieldArea = React.forwardRef(
    (
        {
            width,
            required,
            onChange,
            helperText,
            label,
            height,
            disabled,
            type,
            errors,
            ...rest
        },
        ref
    ) => {
        return (
            <div
                style={{
                    width: width,
                    paddingBottom: FontSize.DivLabelMarginBottom,
                }}
            >
                {required ? (
                    <Typography
                        sx={{
                            marginBottom: FontSize.LabelMarginBottom,
                            fontSize: '14px',
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                        <span style={{ color: 'red' }}> *</span>
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            marginBottom: FontSize.LabelMarginBottom,
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={errors ? '#f44335' : '#000000b3'}
                    >
                        {label}
                    </Typography>
                )}
                <TextField
                    {...rest}
                    helperText={errors && helperText}
                    variant="outlined"
                    multiline
                    disabled={disabled}
                    rows={3}
                    type={type ? type : 'search'}
                    fullWidth
                    onChange={onChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {errors && (
                                    <ReportOutlinedIcon
                                        style={{
                                            fontSize: '16px',
                                            color: '#f44335',
                                        }}
                                    />
                                )}
                            </InputAdornment>
                        ),
                        sx: {
                            color: '#3a4c6b',
                            fontSize: FontSize.textField,
                            '& .MuiOutlinedInput-input': {
                                textOverflow: 'ellipsis',
                            },
                        },
                    }}
                    sx={{
                        // backgroundColor: disabled ? Appcolors.backgroundDisabled : 'white',
                        backgroundColor: disabled ? 'white' : 'white',
                        '.MuiFormHelperText-root': {
                            color: '#f44335 !important',
                            marginTop: '5px !important',
                            paddingLeft: '5px !important',
                            fontSize: '13px',
                        },
                        '& .MuiOutlinedInput-root': {
                            padding: '12px 15px 12px 15px!important',
                            '& fieldset': {
                                borderColor: errors
                                    ? '#e91e63 !important'
                                    : '#cbd5e0 !important',
                            },
                            '&:hover fieldset': {
                                borderColor: '#a0a0a0 !important',
                            },
                            '&.Mui-focused fieldset': {
                                border: '1px solid #1a73e8 !important',
                            },
                        },
                        '& .MuiOutlinedInput-input.Mui-disabled': {
                            // WebkitTextFillColor: Appcolors.textFiledDisabled,
                            WebkitTextFillColor: '#000',
                        },
                    }}
                />
            </div>
        );
    }
);

export const MySelectTime = (props) => {
    const [value, setValue] = React.useState(
        props?.value ? new Date(props?.value * 1000) : null
    );
    useEffect(() => {
        if (props?.value) {
            setValue(
                new Date(
                    props?.divide ? props?.value * 3600000 : props?.value * 1000
                )
            );
        } else {
            setValue(null);
        }
    }, [props?.value]);

    const handleChange = (newValue) => {
        try {
            if (props?.range === 'from') {
                newValue.setHours(0, 0, 0, 0);
            } else if (props?.range === 'to') {
                newValue.setHours(23, 0, 0, 0);
            }
            setValue(newValue);
            props.onChange(
                Math.floor(newValue.getTime() / (props?.divide || 1000))
            );
        } catch { }
    };
    return (
        <div>
            <LocalizationProvider
                adapterLocale={vi}
                dateAdapter={AdapterDateFns}
            >
                {props.required ? (
                    <Typography
                        sx={{
                            marginBottom: props.label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={props.errors ? '#f44335' : '#000000b3'}
                    >
                        {props.label}
                        <span style={{ color: 'red' }}> *</span>
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            marginBottom: props.label
                                ? FontSize.LabelMarginBottom
                                : '0px !important',
                            fontSize: FontSize.textFieldLabel,
                        }}
                        variant="body2"
                        color={props.errors ? '#f44335' : '#000000b3'}
                    >
                        {props.label}
                    </Typography>
                )}
                {props.views && props.views.length > 0 ? (
                    <DesktopDatePicker
                        className="DesktopDatePicker"
                        disabled={props.disabled}
                        mintime={new Date()}
                        views={
                            props.views ? props.views : ['day', 'month', 'year']
                        }
                        maxDate={props?.maxDate ? props.maxDate : null}
                        minDate={props?.minDate ? props.minDate : null}
                        value={value || null}
                        inputFormat={
                            props.inputFormat ? props.inputFormat : 'dd/MM/yyyy'
                        }
                        openTo={props.openTo ? props.openTo : 'day'}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '33px',
                            },
                        }}
                        textField={(params) => (
                            <TextField
                                // helperText={props.errors && props.helperText}
                                {...params}
                                onBlur={props.handleOnBlur}
                                onSubmit={props.handleOnSubmit}
                                fullWidth
                                inputProps={{
                                    ...params.inputProps,
                                    placeholder: props.placeholder,
                                    sx: {
                                        color: Appcolors.textFiled,
                                        fontSize: '13px',
                                        padding: '12px 0px 12px 15px!important',
                                    },
                                }}
                                sx={{
                                    height: '1000px !important',
                                    backgroundColor: props.disabled
                                        ? Appcolors.backgroundDisabled
                                        : 'white',
                                    marginBottom: '8px',
                                    '.MuiFormHelperText-root': {
                                        color: '#f44335 !important',
                                        marginTop: '5px !important',
                                        paddingLeft: '5px !important',
                                        fontSize: '13px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        height: props.height
                                            ? props.height
                                            : '33px',
                                        '& fieldset': {
                                            borderColor: props.errors
                                                ? '#e91e63 !important'
                                                : '#cbd5e0 !important',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#a0a0a0 !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: props.errors
                                                ? '1px solid #e91e63 !important'
                                                : '1px solid #1a73e8 !important',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input.Mui-disabled': {
                                        WebkitTextFillColor:
                                            Appcolors.textFiledDisabled,
                                    },
                                }}
                            />
                        )}
                    />
                ) : (
                    <DesktopDatePicker
                        className="DesktopDatePicker"
                        mintime={new Date()}
                        disabled={props.disabled}
                        maxDate={props?.maxDate ? props.maxDate : null}
                        minDate={props?.minDate ? props.minDate : null}
                        value={value || null}
                        inputFormat={
                            props.inputFormat ? props.inputFormat : 'dd/MM/yyyy'
                        }
                        openTo={props.openTo ? props.openTo : 'day'}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '33px',
                                backgroundColor: '#fff !important',
                            },
                        }}
                        textField={(params) => (
                            <TextField
                                // helperText={props.errors && props.helperText}
                                {...params}
                                onBlur={props.handleOnBlur}
                                onSubmit={props.handleOnSubmit}
                                fullWidth
                                inputProps={{
                                    ...params.inputProps,
                                    placeholder: props.placeholder,
                                    sx: {
                                        color: Appcolors.textFiled,
                                        fontSize: FontSize.textField,
                                        padding: '12px 0px 12px 15px!important',
                                    },
                                }}
                                sx={{
                                    backgroundColor: props.disabled
                                        ? Appcolors.backgroundDisabled
                                        : 'white',
                                    marginBottom: '8px',
                                    '.MuiFormHelperText-root': {
                                        color: '#f44335 !important',
                                        marginTop: '5px !important',
                                        paddingLeft: '5px !important',
                                        fontSize: '13px',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        height: props.height
                                            ? props.height
                                            : '33px',
                                        '& fieldset': {
                                            borderColor: props.errors
                                                ? '#e91e63 !important'
                                                : '#cbd5e0 !important',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#a0a0a0 !important',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: props.errors
                                                ? '1px solid #e91e63 !important'
                                                : '1px solid #1a73e8 !important',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input.Mui-disabled': {
                                        WebkitTextFillColor:
                                            Appcolors.textFiledDisabled,
                                    },
                                }}
                            />
                        )}
                    />
                )}
                {/* {errorsMess} */}
            </LocalizationProvider>
        </div>
    );
};

export const MySearchBox = (props) => {
    const { formikRef, validationSchema, name, onSubmit, children } = props;
    // const [expanded, setExpanded] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const defaultValidationSchema = Yup.object({});
    const handleExpand = () => {
        setExpanded(!expanded);
    };
    const handleClear = (setFieldValue) => {
        setFieldValue(name || 'search', '');
    };
    const debounceSearch = (handleSubmit) => {
        handleSubmit();
    };
    const navigate = useNavigate();
    const location = useLocation();
    const isFirstRender = useIsFirstRender();

    const query = React.useMemo(() => {
        const query = removeEmpty(
            queryString.parse(location.search, { parseBooleans: true })
        );
        Object.keys(query).forEach((key) => {
            // if key in query end with 's' => array
            if (key.endsWith('s') && !key.includes("status")) {
                if (!isArray(query[key])) query[key] = [query[key]];
            }
        });
        return query;
    }, [location.search]);

    React.useEffect(() => {
        if (lodash.isEmpty(query) && isFirstRender) return;
        onSubmit(query);
    }, [location.search]);

    const handleInput = lodash.debounce(debounceSearch, 200);

    return (
        // <div style={{ marginBottom: '15px', width: '100%', height: 'fit-content' }}>
        <div
            style={{
                width: '100%',
                height: 'fit-content',
                backgroundColor: '#fff',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
            }}
        >
            <Formik
                initialValues={query ?? { search: '' }}
                innerRef={(f) => (formikRef.current = f)}
                onSubmit={(values) => {
                    navigate(
                        `?${decodeURIComponent(queryString.stringify(values))}&timestamp=${new Date().getTime()}`
                    );
                }}
                validationSchema={validationSchema || defaultValidationSchema}
            >
                {({
                    handleSubmit,
                    setFieldValue,
                    handleChange,
                    resetForm,
                    values,
                    errors,
                    ...propsForm
                }) => {
                    return (
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                backgroundColor: '#fff',
                                borderBottomLeftRadius: 16,
                                borderBottomRightRadius: 16,
                            }}
                        >
                            <Accordion
                                expanded={expanded}
                                style={{
                                    backgroundColor: '#fff',
                                    borderBottomLeftRadius: 16,
                                    borderBottomRightRadius: 16,
                                }}
                                elevation={0}
                            >
                                <AccordionSummary
                                    id="panel-header"
                                    aria-controls="panel-content"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        '&.Mui-expanded': {
                                            backgroundColor: '#fff',
                                        },
                                        '&.custom-focus-visible': {
                                            backgroundColor: '#fff',
                                        },
                                        borderRadius: 16,
                                    }}
                                    classes={{
                                        focusVisible: 'custom-focus-visible',
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        name={name || 'search'}
                                        label="Từ khóa"
                                        placeholder="Nhập từ khóa cần tìm..."
                                        value={
                                            values[name] ??
                                            values?.search
                                                ?.trim()
                                                ?.toLowerCase() ??
                                            ''
                                        }
                                        onChange={handleChange}
                                        onInput={() =>
                                            handleInput(handleSubmit)
                                        }
                                        sx={{
                                            backgroundColor: '#fff',
                                            mr: 2,
                                        }}
                                        onKeyDown={(e) => { }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon
                                                        sx={{
                                                            fontSize: '18px',
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {
                                                        <ClearIcon
                                                            sx={{
                                                                display: values[
                                                                    name
                                                                ]
                                                                    ? 'block'
                                                                    : 'none',
                                                                fontSize:
                                                                    '18px',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() =>
                                                                handleClear(
                                                                    setFieldValue
                                                                )
                                                            }
                                                        />
                                                    }
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <MyButton
                                            txt="Bỏ lọc"
                                            icon={<FilterAltOff />}
                                            width={130}
                                            height={'40px'}
                                            variant="outlined"
                                            type="reset"
                                            onClick={() => {
                                                resetForm({
                                                    values: {},
                                                });
                                                handleClear(setFieldValue);
                                                navigate('');
                                            }}
                                            disabled={isEmpty(
                                                Object.values(
                                                    values ?? {}
                                                )?.filter((i) => i !== '')
                                            )}
                                            sx={{
                                                flexShrink: 0,
                                            }}
                                        />
                                        <MyButton
                                            txt="Tìm kiếm"
                                            icon={<SearchIcon />}
                                            width={'120px'}
                                            height={'40px'}
                                            type="submit"
                                        />
                                        <IconButton
                                            sx={{ mr: 2 }}
                                            onClick={handleExpand}
                                        >
                                            {!expanded ? (
                                                <ExpandMore />
                                            ) : (
                                                <ExpandLess />
                                            )}
                                        </IconButton>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {children && (
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'flex-end',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    gap: '8px',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                {typeof children === 'function'
                                                    ? children({
                                                        handleSubmit,
                                                        setFieldValue,
                                                        handleChange,
                                                        values,
                                                        errors,
                                                        ...propsForm,
                                                    })
                                                    : children}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    marginRight: '40px',
                                                    marginLeft: '15px',
                                                }}
                                            >
                                                {/* <MyButton
                                                    variant="outlined"
                                                    txt="Làm mới"
                                                    width={'100px'}
                                                    onClick={async () => {
                                                        resetForm();
                                                        handleSubmit(values);
                                                    }}
                                                /> */}
                                            </div>
                                        </div>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </form>
                    );
                }}
            </Formik>
        </div>
    );
};

const VisuallyHiddenInput = styled('input')({
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
    display: 'none',
});

export const InputFileUpload = ({ children, onFileChange }) => {
    return (
        <LoadingButton
            loadingPosition="start"
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            disableElevation
            sx={{
                height: 33,
                textTransform: 'capitalize',
            }}
        >
            {children}
            <VisuallyHiddenInput onChange={onFileChange} type="file" />
        </LoadingButton>
    );
};

export const BaseMenuList = ({ title, items }) => {
    const callFunction = isFunction(items) ? items() : items;
    const renderItems =
        callFunction.length > 0
            ? callFunction
            : [{ label: 'Không có thông tin' }];
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={(e) => {
                    handleClick(e);
                    renderItems.length === 1 && renderItems[0]?.onClick();
                }}
                disabled={renderItems[0]?.disabled}
                sx={{
                    textTransform: 'capitalize',
                }}
            >
                {title}
            </Button>
            {renderItems?.length > 1 && (
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {renderItems.map((item) => (
                        <MenuItem
                            key={uuidv4()}
                            onClick={() => {
                                item?.onClick();
                                handleClose();
                            }}
                            disabled={true}
                        >
                            <span
                                style={{
                                    textTransform: 'capitalize !important',
                                }}
                            >
                                {item.label ?? ''}
                            </span>
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </div>
    );
};
export const LoadingDots = ({ fontSize, color }) => {
    return (
        <div
            className="dots-loading"
            style={{ fontSize: fontSize ? fontSize : '20px', color: color ? color : '#fff' }}
        >
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </div>
    );
};

export const BaseActionButtons = ({
    onDowEXMau,
    titleBieuMau,
    onPrint,
    isFast,
    progressPDF,
    onCopy,
    onConfirm,
    total,
    onExport,
    onPublish,
    onSave,
    btnThemMoiTongHop,
    updated,
    editable,
    showDetail,
    isSubmitting,
    isPublished,
    isConfirmed,
    canPublic,
    children,
    syncthetic,
    onExcel,
    onSaveAndContinue,
    initialValues,
    changeCategories,
    setInitialValues,
    title,
    onShowInfor,
    startChildren,
}) => {
    const { role, scope } = useSelector((state) => state?.auth);
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                position: 'fixed',
                top: '80px',
                right: 20,
                zIndex: 1200,
                backgroundColor: '#fff',
                maxWidth: '100%',
                flexWrap: 'wrap'
            }}
        >
            <ChangeCategoriesModal
                initialValues={initialValues}
                changeCategories={changeCategories}
                setInitialValues={setInitialValues}
                title={title}
                renderButton={(hasError) => (
                    <MyButton
                        icon={hasError ? <Warning /> : <SwapHoriz />}
                        txt={
                            'Chuẩn hóa danh mục ' +
                            (changeCategories?.title ?? '')
                        }
                        variant={'outlined'}
                        color={hasError ? 'warning' : 'primary'}
                    />
                )}
                renderButtonIf={changeCategories && !total && !showDetail}
            >
                {(hasError, hasLvsError) => (
                    <>
                        {startChildren}
                        {total &&
                            !showDetail &&
                            React.Children.map(syncthetic, (child) => {
                                return React.cloneElement(child, {
                                    ...child.props,
                                    onClick: () => {
                                        child.props.onClick();
                                    },
                                });
                            })}
                        {children}
                        {isFunction(onShowInfor) && (
                            <MyButton
                                icon={
                                    <ViewListIcon />
                                }
                                onClick={onShowInfor}
                                txt={
                                    'Xem kết quả'
                                }
                                variant="outlined"
                            />
                        )}
                        {isFunction(onPrint) && (
                            <MyButton
                                icon={
                                    progressPDF?.progress > 0 ? (
                                        ''
                                    ) : (
                                        <Print />
                                    )
                                }
                                disabled={progressPDF?.progress > 0}
                                onClick={onPrint}
                                txt={
                                    progressPDF?.progress > 0 ? (
                                        <>
                                            <span style={{ fontSize: '13px', color: '#1976d2' }}>
                                                {progressPDF?.message ? progressPDF?.message : 'Xuất PDF'}
                                            </span>
                                            <LoadingDots fontSize={20} color={'#1976d2'} />
                                        </>
                                    ) : (
                                        'Xuất PDF'
                                    )
                                }
                                variant="outlined"
                            />
                        )}
                        {isFunction(onExcel) && !total && !showDetail && (
                            <MyButton
                                loadingPosition="start"
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                disableElevation
                                onClick={onExcel}
                                txt="Nhập từ excel"
                            />
                        )}
                        {isFunction(onCopy) && editable && (
                            <MyButton
                                icon={<CopyAll />}
                                txt="Sao chép"
                                onClick={() => {
                                    if (editable) {
                                        onCopy();
                                    } else {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'Chú ý',
                                            text: 'Bạn chỉ có thể sao chép dữ liệu khi đang ở chế độ cập nhật biểu mẫu!',
                                            confirmButtonText: 'Xác nhận',
                                            showCloseButton: false,
                                            showDenyButton: false,
                                            allowOutsideClick: true,
                                            timer: 5000,
                                        });
                                    }
                                }}
                                variant="outlined"
                            />
                        )}

                        {isFunction(onSave) && !showDetail && (
                            <MyButton
                                icon={isSubmitting ? '' : <Save />}
                                txt={
                                    isSubmitting &&
                                        isFunction(onSave) &&
                                        !isFast ? (
                                        <>
                                            <span style={{ fontSize: '13px', color: '#1976d2' }}>
                                                Đang lưu
                                            </span>
                                            <LoadingDots fontSize={20} color={'#1976d2'} />
                                        </>
                                    ) : editable ? (
                                        'Lưu thay đổi'
                                    ) : total ? (
                                        'Thêm biểu tổng hợp'
                                    ) : (
                                        'Thêm mới'
                                    )
                                }
                                onClick={() => {
                                    // console.log(document.querySelector(".__hasError__"));
                                    if (
                                        (document.querySelector(
                                            '.__hasLvsError__'
                                        ) !== null) && !total
                                    ) {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'Chú ý',
                                            text: 'Bạn hãy chuẩn hóa lưu vực sông trước khi lưu!',
                                            confirmButtonText: 'Xác nhận',
                                            showCloseButton: false,
                                            showDenyButton: false,
                                            allowOutsideClick: true,
                                            timer: 5000,
                                        });
                                    } else {
                                        onSave();
                                    }
                                }}
                                disabled={(total && !btnThemMoiTongHop) || isSubmitting}
                            />
                        )}
                        {isFunction(onSaveAndContinue) &&
                            !showDetail &&
                            !editable &&
                            !total && (
                                <MyButton
                                    loadingPosition="start"
                                    startIcon={isFast ? '' : <SaveAlt />}
                                    disableElevation
                                    onClick={onSaveAndContinue}
                                    txt={
                                        isFunction(onSaveAndContinue) &&
                                            isFast ? (
                                            <>
                                                <span
                                                    style={{ fontSize: '13px' }}
                                                >
                                                    Đang lưu
                                                </span>
                                                <LoadingDots fontSize={20} />
                                            </>
                                        ) : (
                                            'Thêm mới & tiếp tục'
                                        )
                                    }
                                />
                            )}
                        {isFunction(onPublish) &&
                            editable &&
                            role === 'Admin' && (
                                <MyButton
                                    icon={<PushPinSharp />}
                                    sx={{
                                        opacity: 1,
                                        pointerEvents: isPublished
                                            ? 'none'
                                            : 'auto',
                                        backgroundColor: isPublished
                                            ? '#686D76'
                                            : '',
                                        color: '#fff',
                                    }}
                                    txt={isPublished ? 'Đã công bố' : 'Công bố'}
                                    // disabled={!isConfirmed}
                                    onClick={() => {
                                        if (!canPublic && editable) {
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Chú ý',
                                                text: 'Bạn không có quyền công bố biểu mẫu này!',
                                                confirmButtonText: 'Xác nhận',
                                                showCloseButton: false,
                                                showDenyButton: false,
                                                allowOutsideClick: true,
                                                timer: 5000,
                                            });
                                        } else if (!editable) {
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Chú ý',
                                                text: 'Bạn chỉ công bố được khi đang ở chế độ cập nhật biểu mẫu!',
                                                confirmButtonText: 'Xác nhận',
                                                showCloseButton: false,
                                                showDenyButton: false,
                                                allowOutsideClick: true,
                                                timer: 5000,
                                            });
                                        } else if (!isConfirmed) {
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Chú ý',
                                                text: 'Chỉ được công bố sau khi đã xác nhận biểu mẫu!',
                                                confirmButtonText: 'Xác nhận',
                                                showCloseButton: false,
                                                showDenyButton: false,
                                                allowOutsideClick: true,
                                                timer: 5000,
                                            });
                                        } else if (isPublished) {
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Chú ý',
                                                text: 'Bạn đã công bố biểu mẫu này rồi!',
                                                confirmButtonText: 'Xác nhận',
                                                showCloseButton: false,
                                                showDenyButton: false,
                                                allowOutsideClick: true,
                                                timer: 5000,
                                            });
                                        } else {
                                            showConfirmDialog(
                                                'Bạn có chắc chắn muốn công bố biểu mẫu này?',
                                                'Thông báo',
                                                async (result) => {
                                                    result && onPublish();
                                                }
                                            );
                                        }
                                    }}
                                />
                            )}
                        {/* )} */}
                        {/* {canPublic && editable && ( */}
                        {isFunction(onConfirm) &&
                            editable &&
                            role === 'Admin' && (
                                <MyButton
                                    icon={
                                        isConfirmed &&
                                            (isConfirmed || 0) > (updated || 0) ? (
                                            <DoneAll
                                                style={{
                                                    width: '10px !important',
                                                    height: '10px !important',
                                                }}
                                            />
                                        ) : (
                                            <Check
                                                style={{
                                                    width: '10px !important',
                                                    height: '10px !important',
                                                }}
                                            />
                                        )
                                    }
                                    sx={{
                                        opacity: 1,
                                        pointerEvents:
                                            isConfirmed &&
                                                (isConfirmed || 0) > (updated || 0)
                                                ? 'none'
                                                : 'auto',
                                        backgroundColor:
                                            isConfirmed &&
                                                (isConfirmed || 0) > (updated || 0)
                                                ? '#686D76'
                                                : '',
                                        color: '#fff',
                                    }}
                                    txt={
                                        isConfirmed &&
                                            (isConfirmed || 0) > (updated || 0)
                                            ? 'Đã xác nhận'
                                            : 'Xác nhận'
                                    }
                                    onClick={() => {
                                        if (!canPublic && editable) {
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Chú ý',
                                                text: 'Bạn không có quyền xác nhận biểu mẫu này!',
                                                confirmButtonText: 'Xác nhận',
                                                showCloseButton: false,
                                                showDenyButton: false,
                                                allowOutsideClick: true,
                                                timer: 5000,
                                            });
                                        }
                                        // else if (!editable) {
                                        //     Swal.fire({
                                        //         icon: 'info',
                                        //         title: 'Chú ý',
                                        //         text: 'Bạn chỉ xác nhận được khi đang ở chế độ cập nhật biểu mẫu!',
                                        //         confirmButtonText: 'Xác nhận',
                                        //         showCloseButton: false,
                                        //         showDenyButton: false,
                                        //         allowOutsideClick: true,
                                        //         timer: 5000,
                                        //     });
                                        // }
                                        // else if (isConfirmed) {
                                        //     Swal.fire({
                                        //         icon: 'info',
                                        //         title: 'Chú ý',
                                        //         text: 'Bạn đã xác nhận biểu mẫu này rồi!',
                                        //         confirmButtonText: 'Xác nhận',
                                        //         showCloseButton: false,
                                        //         showDenyButton: false,
                                        //         allowOutsideClick: true,
                                        //         timer: 5000,
                                        //     });
                                        // }
                                        else {
                                            showConfirmDialog(
                                                'Bạn có chắc chắn muốn xác nhận biểu mẫu này?',
                                                'Thông báo',
                                                async (result) => {
                                                    result && onConfirm();
                                                }
                                            );
                                        }
                                    }}
                                />
                            )}
                        {isFunction(onExport) && editable && (
                            <MyButton
                                loadingPosition="start"
                                startIcon={<SaveAlt />}
                                sx={{
                                    height: 33,
                                    textTransform: 'capitalize',
                                    color: '#fff',
                                }}
                                onClick={onExport}
                                txt="xuất excel"
                            />
                        )}
                        {isFunction(onDowEXMau) && (
                            <Tooltip
                                title="Tải file mẫu"
                                placement="bottom"
                                style={{ zIndex: 1100 }}
                                arrow
                            >
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        zIndex: '1100',
                                    }}
                                    onClick={onDowEXMau}
                                >
                                    <FilePresentIcon
                                        style={{ color: 'rgb(111, 113, 115)' }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '10pt',
                                            color: 'rgb(111, 113, 115)',
                                        }}
                                    >
                                        {titleBieuMau}
                                    </span>
                                </span>
                            </Tooltip>
                        )}
                    </>
                )}
            </ChangeCategoriesModal>
        </Box>
    );
};
export const ScrollBaseActionButtons = ({
    onPrint,
    isFast,
    progressPDF,
    onCopy,
    onConfirm,
    total,
    onExport,
    onPublish,
    onSave,
    btnThemMoiTongHop,
    updated,
    editable,
    showDetail,
    isSubmitting,
    isPublished,
    isConfirmed,
    onTongHop,
    canPublic,
    title,
    children,
    syncthetic,
    onExcel,
    onSaveAndContinue,
    initialValues,
    changeCategories,
    setInitialValues,
}) => {
    const buttonContainerStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
    };
    const { role, scope } = useSelector((state) => state?.auth);
    const [showButton, setShowButton] = useState(false);
    const checkScrollPosition = () => {
        const scrollPosition = window.scrollY;
        const windowHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const scrolledPercentage = (scrollPosition / windowHeight) * 100;
        if (scrolledPercentage > 10) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    };
    useEffect(() => {
        window.addEventListener('scroll', checkScrollPosition);
        return () => {
            window.removeEventListener('scroll', checkScrollPosition);
        };
    }, []);
    return (
        <>
            {/* {showButton && (
                <div style={buttonContainerStyle} >
                    {total &&
                        React.Children.map(syncthetic, (child) => {
                            return React.cloneElement(child, {
                                ...child.props,
                                onClick: () => {
                                    child.props.onClick();
                                },
                            });
                        })}
                </div>
            )} */}
            {showButton && (
                <div style={buttonContainerStyle}>
                    <ChangeCategoriesModal
                        initialValues={initialValues}
                        changeCategories={changeCategories}
                        setInitialValues={setInitialValues}
                        title={title}
                        renderButton={(hasError) => (
                            <MyButton
                                icon={hasError ? <Warning /> : <SwapHoriz />}
                                txt={
                                    'Chuẩn hóa danh mục ' +
                                    (changeCategories?.title ?? '')
                                }
                                variant={'outlined'}
                                color={hasError ? 'warning' : 'primary'}
                            />
                        )}
                        renderButtonIf={
                            changeCategories && !total && !showDetail
                        }
                    >
                        {(hasError, hasLvsError) => (
                            <>
                                {hasLvsError && scope !== 'tinh' && (
                                    <div
                                        className="__hasLvsError__"
                                        style={{ display: 'none' }}
                                    ></div>
                                )}
                                <div>
                                    {total &&
                                        !showDetail &&
                                        React.Children.map(
                                            syncthetic,
                                            (child) => {
                                                return React.cloneElement(
                                                    child,
                                                    {
                                                        ...child.props,
                                                        onClick: () => {
                                                            child.props.onClick();
                                                        },
                                                    }
                                                );
                                            }
                                        )}
                                </div>
                                {children}
                                {isFunction(onPrint) && (
                                    <MyButton
                                        icon={
                                            progressPDF > 0 &&
                                                progressPDF < 100 ? (
                                                ''
                                            ) : (
                                                <Print />
                                            )
                                        }
                                        onClick={onPrint}
                                        txt={
                                            progressPDF > 0 &&
                                                progressPDF < 100 ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        Đang xuất file PDF{' '}
                                                        {progressPDF}s
                                                    </span>
                                                    <LoadingDots
                                                        fontSize={20}
                                                    />
                                                </>
                                            ) : (
                                                'Xuất PDF'
                                            )
                                        }
                                        variant="outlined"
                                    />
                                )}
                                {isFunction(onExcel) &&
                                    !total &&
                                    !showDetail && (
                                        <MyButton
                                            loadingPosition="start"
                                            component="label"
                                            variant="outlined"
                                            startIcon={<CloudUpload />}
                                            disableElevation
                                            onClick={onExcel}
                                            txt="Nhập từ excel"
                                        />
                                    )}
                                {isFunction(onCopy) && editable && (
                                    <MyButton
                                        icon={<CopyAll />}
                                        txt="Sao chép"
                                        onClick={() => {
                                            if (editable) {
                                                onCopy();
                                            } else {
                                                Swal.fire({
                                                    icon: 'info',
                                                    title: 'Chú ý',
                                                    text: 'Bạn chỉ có thể sao chép dữ liệu khi đang ở chế độ cập nhật biểu mẫu!',
                                                    confirmButtonText:
                                                        'Xác nhận',
                                                    showCloseButton: false,
                                                    showDenyButton: false,
                                                    allowOutsideClick: true,
                                                    timer: 5000,
                                                });
                                            }
                                        }}
                                        variant="outlined"
                                    />
                                )}

                                {isFunction(onSave) && !showDetail && (
                                    <MyButton
                                        icon={isSubmitting ? '' : <Save />}
                                        txt={
                                            isSubmitting &&
                                                isFunction(onSave) &&
                                                !isFast ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        Đang lưu
                                                    </span>
                                                    <LoadingDots
                                                        fontSize={20}
                                                    />
                                                </>
                                            ) : editable ? (
                                                'Lưu thay đổi'
                                            ) : total ? (
                                                'Thêm biểu tổng hợp'
                                            ) : (
                                                'Thêm mới'
                                            )
                                        }
                                        onClick={() => {
                                            // console.log(document.querySelector(".__hasError__"));
                                            if (
                                                (document.querySelector(
                                                    '.__hasLvsError__'
                                                ) !== null) && !total
                                            ) {
                                                Swal.fire({
                                                    icon: 'info',
                                                    title: 'Chú ý',
                                                    text: 'Bạn hãy chuẩn hóa lưu vực sông trước khi lưu!',
                                                    confirmButtonText:
                                                        'Xác nhận',
                                                    showCloseButton: false,
                                                    showDenyButton: false,
                                                    allowOutsideClick: true,
                                                    timer: 5000,
                                                });
                                            } else {
                                                onSave();
                                            }
                                        }}
                                        disabled={total && !btnThemMoiTongHop}
                                    />
                                )}
                                {isFunction(onSaveAndContinue) &&
                                    !showDetail &&
                                    !editable &&
                                    !total && (
                                        <MyButton
                                            loadingPosition="start"
                                            startIcon={
                                                isFast ? '' : <SaveAlt />
                                            }
                                            disableElevation
                                            onClick={onSaveAndContinue}
                                            txt={
                                                isFunction(onSaveAndContinue) &&
                                                    isFast ? (
                                                    <>
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            Đang lưu
                                                        </span>
                                                        <LoadingDots
                                                            fontSize={20}
                                                        />
                                                    </>
                                                ) : (
                                                    'Thêm mới & tiếp tục'
                                                )
                                            }
                                        />
                                    )}
                                {isFunction(onPublish) &&
                                    editable &&
                                    role === 'Admin' && (
                                        <MyButton
                                            icon={<PushPinSharp />}
                                            sx={{
                                                opacity: 1,
                                                pointerEvents: isPublished
                                                    ? 'none'
                                                    : 'auto',
                                                backgroundColor: isPublished
                                                    ? '#686D76'
                                                    : '',
                                                color: '#fff',
                                            }}
                                            txt={
                                                isPublished
                                                    ? 'Đã công bố'
                                                    : 'Công bố'
                                            }
                                            // disabled={!isConfirmed}
                                            onClick={() => {
                                                if (!canPublic && editable) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Chú ý',
                                                        text: 'Bạn không có quyền công bố biểu mẫu này!',
                                                        confirmButtonText:
                                                            'Xác nhận',
                                                        showCloseButton: false,
                                                        showDenyButton: false,
                                                        allowOutsideClick: true,
                                                        timer: 5000,
                                                    });
                                                } else if (!editable) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Chú ý',
                                                        text: 'Bạn chỉ công bố được khi đang ở chế độ cập nhật biểu mẫu!',
                                                        confirmButtonText:
                                                            'Xác nhận',
                                                        showCloseButton: false,
                                                        showDenyButton: false,
                                                        allowOutsideClick: true,
                                                        timer: 5000,
                                                    });
                                                } else if (!isConfirmed) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Chú ý',
                                                        text: 'Chỉ được công bố sau khi đã xác nhận biểu mẫu!',
                                                        confirmButtonText:
                                                            'Xác nhận',
                                                        showCloseButton: false,
                                                        showDenyButton: false,
                                                        allowOutsideClick: true,
                                                        timer: 5000,
                                                    });
                                                } else if (isPublished) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Chú ý',
                                                        text: 'Bạn đã công bố biểu mẫu này rồi!',
                                                        confirmButtonText:
                                                            'Xác nhận',
                                                        showCloseButton: false,
                                                        showDenyButton: false,
                                                        allowOutsideClick: true,
                                                        timer: 5000,
                                                    });
                                                } else {
                                                    showConfirmDialog(
                                                        'Bạn có chắc chắn muốn công bố biểu mẫu này?',
                                                        'Thông báo',
                                                        async (result) => {
                                                            result &&
                                                                onPublish();
                                                        }
                                                    );
                                                }
                                            }}
                                        />
                                    )}
                                {/* )} */}
                                {/* {canPublic && editable && ( */}
                                {isFunction(onConfirm) &&
                                    editable &&
                                    role === 'Admin' && (
                                        <MyButton
                                            icon={
                                                isConfirmed &&
                                                    (isConfirmed || 0) >
                                                    (updated || 0) ? (
                                                    <DoneAll
                                                        style={{
                                                            width: '10px !important',
                                                            height: '10px !important',
                                                        }}
                                                    />
                                                ) : (
                                                    <Check
                                                        style={{
                                                            width: '10px !important',
                                                            height: '10px !important',
                                                        }}
                                                    />
                                                )
                                            }
                                            sx={{
                                                opacity: 1,
                                                pointerEvents:
                                                    isConfirmed &&
                                                        (isConfirmed || 0) >
                                                        (updated || 0)
                                                        ? 'none'
                                                        : 'auto',
                                                backgroundColor:
                                                    isConfirmed &&
                                                        (isConfirmed || 0) >
                                                        (updated || 0)
                                                        ? '#686D76'
                                                        : '',
                                                color: '#fff',
                                            }}
                                            txt={
                                                isConfirmed &&
                                                    (isConfirmed || 0) >
                                                    (updated || 0)
                                                    ? 'Đã xác nhận'
                                                    : 'Xác nhận'
                                            }
                                            onClick={() => {
                                                if (!canPublic && editable) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Chú ý',
                                                        text: 'Bạn không có quyền xác nhận biểu mẫu này!',
                                                        confirmButtonText:
                                                            'Xác nhận',
                                                        showCloseButton: false,
                                                        showDenyButton: false,
                                                        allowOutsideClick: true,
                                                        timer: 5000,
                                                    });
                                                }
                                                // else if (!editable) {
                                                //     Swal.fire({
                                                //         icon: 'info',
                                                //         title: 'Chú ý',
                                                //         text: 'Bạn chỉ xác nhận được khi đang ở chế độ cập nhật biểu mẫu!',
                                                //         confirmButtonText: 'Xác nhận',
                                                //         showCloseButton: false,
                                                //         showDenyButton: false,
                                                //         allowOutsideClick: true,
                                                //         timer: 5000,
                                                //     });
                                                // }
                                                // else if (isConfirmed) {
                                                //     Swal.fire({
                                                //         icon: 'info',
                                                //         title: 'Chú ý',
                                                //         text: 'Bạn đã xác nhận biểu mẫu này rồi!',
                                                //         confirmButtonText: 'Xác nhận',
                                                //         showCloseButton: false,
                                                //         showDenyButton: false,
                                                //         allowOutsideClick: true,
                                                //         timer: 5000,
                                                //     });
                                                // }
                                                else {
                                                    showConfirmDialog(
                                                        'Bạn có chắc chắn muốn xác nhận biểu mẫu này?',
                                                        'Thông báo',
                                                        async (result) => {
                                                            result &&
                                                                onConfirm();
                                                        }
                                                    );
                                                }
                                            }}
                                        />
                                    )}
                                {isFunction(onExport) && editable && (
                                    <MyButton
                                        loadingPosition="start"
                                        startIcon={<SaveAlt />}
                                        sx={{
                                            height: 33,
                                            textTransform: 'capitalize',
                                            color: '#fff',
                                        }}
                                        onClick={onExport}
                                        txt="xuất excel"
                                    />
                                )}
                            </>
                        )}
                    </ChangeCategoriesModal>
                </div>
            )}
        </>
    );
};

export const DesignIcon = {
    Home: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_656)">
                    <path
                        d="M10.0001 19V14H14.0001V19C14.0001 19.55 14.4501 20 15.0001 20H18.0001C18.5501 20 19.0001 19.55 19.0001 19V12H20.7001C21.1601 12 21.3801 11.43 21.0301 11.13L12.6701 3.6C12.2901 3.26 11.7101 3.26 11.3301 3.6L2.9701 11.13C2.6301 11.43 2.8401 12 3.3001 12H5.0001V19C5.0001 19.55 5.4501 20 6.0001 20H9.0001C9.5501 20 10.0001 19.55 10.0001 19Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_656">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Map: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_663)">
                    <path
                        d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_663">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Form: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_672)">
                    <path
                        d="M20.41 8.41L15.58 3.58C15.21 3.21 14.7 3 14.17 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9.83C21 9.3 20.79 8.79 20.41 8.41ZM7 7H14V9H7V7ZM17 17H7V15H17V17ZM17 13H7V11H17V13Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_672">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    ObjectList: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_682)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM10 17H5V15H10V17ZM10 13H5V11H10V13ZM10 9H5V7H10V9ZM14.82 15L12 12.16L13.41 10.75L14.82 12.17L17.99 9L19.41 10.42L14.82 15Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_682">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Statistic: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_739)">
                    <path
                        d="M7.5 21H2V9H7.5V21ZM14.75 3H9.25V21H14.75V3ZM22 11H16.5V21H22V11Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_739">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Category: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_749)">
                    <path
                        d="M4 14H8V10H4V14ZM4 19H8V15H4V19ZM4 9H8V5H4V9ZM9 14H21V10H9V14ZM9 19H21V15H9V19ZM9 5V9H21V5H9Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_749">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Setting: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_51_763)">
                    <path
                        d="M19.1401 12.9401C19.1801 12.6401 19.2001 12.3301 19.2001 12.0001C19.2001 11.6801 19.1801 11.3601 19.1301 11.0601L21.1601 9.48012C21.3401 9.34012 21.3901 9.07012 21.2801 8.87012L19.3601 5.55012C19.2401 5.33012 18.9901 5.26012 18.7701 5.33012L16.3801 6.29012C15.8801 5.91012 15.3501 5.59012 14.7601 5.35012L14.4001 2.81012C14.3601 2.57012 14.1601 2.40012 13.9201 2.40012H10.0801C9.84011 2.40012 9.65011 2.57012 9.61011 2.81012L9.25011 5.35012C8.66011 5.59012 8.12011 5.92012 7.63011 6.29012L5.24011 5.33012C5.02011 5.25012 4.77011 5.33012 4.65011 5.55012L2.74011 8.87012C2.62011 9.08012 2.66011 9.34012 2.86011 9.48012L4.89011 11.0601C4.84011 11.3601 4.80011 11.6901 4.80011 12.0001C4.80011 12.3101 4.82011 12.6401 4.87011 12.9401L2.84011 14.5201C2.66011 14.6601 2.61011 14.9301 2.72011 15.1301L4.64011 18.4501C4.76011 18.6701 5.01011 18.7401 5.23011 18.6701L7.62011 17.7101C8.12011 18.0901 8.65011 18.4101 9.24011 18.6501L9.60011 21.1901C9.65011 21.4301 9.84011 21.6001 10.0801 21.6001H13.9201C14.1601 21.6001 14.3601 21.4301 14.3901 21.1901L14.7501 18.6501C15.3401 18.4101 15.8801 18.0901 16.3701 17.7101L18.7601 18.6701C18.9801 18.7501 19.2301 18.6701 19.3501 18.4501L21.2701 15.1301C21.3901 14.9101 21.3401 14.6601 21.1501 14.5201L19.1401 12.9401ZM12.0001 15.6001C10.0201 15.6001 8.40011 13.9801 8.40011 12.0001C8.40011 10.0201 10.0201 8.40012 12.0001 8.40012C13.9801 8.40012 15.6001 10.0201 15.6001 12.0001C15.6001 13.9801 13.9801 15.6001 12.0001 15.6001Z"
                        fill="#333333"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_51_763">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Intructions: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clipPath="url(#clip0_75_794)">
                    <path
                        d="M19 2H5C3.89 2 3 2.9 3 4V18C3 19.1 3.89 20 5 20H9L12 23L15 20H19C20.1 20 21 19.1 21 18V4C21 2.9 20.1 2 19 2ZM19 18H14.17L13.58 18.59L12 20.17L10.41 18.58L9.83 18H5V4H19V18ZM11 15H13V17H11V15ZM12 7C13.1 7 14 7.9 14 9C14 11 11 10.75 11 14H13C13 11.75 16 11.5 16 9C16 6.79 14.21 5 12 5C9.79 5 8 6.79 8 9H10C10 7.9 10.9 7 12 7Z"
                        fill="black"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_75_794">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
        );
    },
    Info: () => {
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M11 17H13V11H11V17ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 9H13V7H11V9Z"
                    fill="black"
                />
                <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="black" />
                <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                    fill="black"
                />
            </svg>
        );
    },
};

export const ChangeCategoriesModal = React.memo(
    ({
        children,
        initialValues,
        changeCategories,
        setInitialValues,
        renderButton,
        renderButtonIf,
    }) => {
        if (!changeCategories)
            return isFunction(children)
                ? children(false, false)
                : (children ?? null);
        const { hints, from, isSub, subFrom } = changeCategories;
        const {
            loaiCongTrinhs,
            mucDichSuDungs,
            loaiHinhNuocThais,
            luuVucSongs,
            scope,
        } = useStores();
        const tabConfigs = React.useMemo(
            () =>
                [
                    {
                        key: 'luuVucSong',
                        label: 'Lưu vực sông',
                    },
                    {
                        key: 'loaiCongTrinh',
                        label: 'Loại công trình',
                    },
                    {
                        key: 'loaiHinhNuocThai',
                        label: 'Loại hình nước thải',
                    },
                    {
                        key: 'mucDichSuDungs',
                        label: 'Mục đích sử dụng',
                    },
                ].filter((s) => hints.includes(s.key)),
            [hints]
        );
        const [tab, setTab] = React.useState(tabConfigs[0].key);
        const [open, { setTrue, setFalse }] = useToggle();
        const [loading, setLoading] = React.useState(false);

        const data = React.useMemo(
            () => cloneDeep(initialValues?.[from]) ?? [],
            [initialValues, from]
        );

        const getMucDichSuDungKhacs = React.useMemo(() => {
            if (!hints.includes('mucDichSuDungs')) return [];
            const uniqueValues = [
                ...new Set(data?.map((s) => s?.mucDichSuDungs)?.flat()),
            ].filter(Boolean);
            return uniqueValues?.filter(
                (item) =>
                    !mucDichSuDungs?.find(
                        (s) => s.tenMuc === item || s.maMuc === item
                    )
            );
        }, [data, mucDichSuDungs]);

        const getLoaiCongTrinhKhacs = React.useMemo(() => {
            if (!hints.includes('loaiCongTrinh')) return [];
            const uniqueValues = [
                ...new Set(data?.map((s) => s?.loaiCongTrinh)),
            ].filter(Boolean);
            return uniqueValues?.filter(
                (item) =>
                    !loaiCongTrinhs?.find(
                        (s) => s.tenMuc === item || s.maMuc === item
                    )
            );
        }, [data, loaiCongTrinhs]);

        const getLoaiHinhNuocThais = React.useMemo(() => {
            if (!hints.includes('loaiHinhNuocThai')) return [];
            const uniqueValues = [
                ...new Set(data?.map((s) => s?.loaiHinhNuocThai)),
            ].filter(Boolean);
            return uniqueValues?.filter(
                (item) =>
                    !loaiHinhNuocThais?.find(
                        (s) => s.tenMuc === item || s.maMuc === item
                    )
            );
        }, [data, loaiHinhNuocThais]);

        const getLuuVucSongKhacs = React.useMemo(() => {
            if (!hints.includes('luuVucSong')) return [];
            if (isSub) {
                const uniqueValues = [
                    ...new Set(
                        data
                            ?.map((i) => i[subFrom]?.map((i) => i?.luuVucSong))
                            ?.flat()
                    ),
                ].filter(Boolean);
                return uniqueValues?.filter(
                    (item) =>
                        !luuVucSongs?.find(
                            (s) => s.tenMuc === item || s.maMuc === item
                        )
                );
            }
            const uniqueValues = [
                ...new Set(data?.map((s) => s?.luuVucSong)),
            ].filter(Boolean);
            return uniqueValues?.filter(
                (item) =>
                    !luuVucSongs?.find(
                        (s) => s.tenMuc === item || s.maMuc === item
                    )
            );
        }, [data, luuVucSongs]);

        const hasError = React.useMemo(
            () =>
                getLoaiCongTrinhKhacs.length > 0 ||
                getLoaiHinhNuocThais.length > 0 ||
                getMucDichSuDungKhacs.length > 0 ||
                getLuuVucSongKhacs.length > 0,
            [
                getLoaiCongTrinhKhacs,
                getMucDichSuDungKhacs,
                getLoaiHinhNuocThais,
                getLuuVucSongKhacs,
            ]
        );

        const hasLvsError = React.useMemo(
            () => getLuuVucSongKhacs.length > 0,
            [getLuuVucSongKhacs]
        );

        const {
            control,
            watch,
            getValues,
            setValue,
            reset,
            formState: { },
        } = useForm({});

        const { fields: mdsdFields, append: appendMdsd } = useFieldArray({
            control,
            name: 'mucDichSuDungs',
        });
        const { fields: lctFields, append: appendLct } = useFieldArray({
            control,
            name: 'loaiCongTrinh',
        });
        const { fields: lhntFields, append: appendLhnt } = useFieldArray({
            control,
            name: 'loaiHinhNuocThai',
        });
        const { fields: lvsFields, append: appendLvs } = useFieldArray({
            control,
            name: 'luuVucSong',
        });

        React.useEffect(() => {
            if (hints.includes('mucDichSuDungs')) {
                setValue('mucDichSuDungs', []);
                getMucDichSuDungKhacs.forEach((item) => {
                    appendMdsd({
                        key: item,
                        labels: [],
                        ids: [],
                    });
                });
            }
            if (hints.includes('loaiCongTrinh')) {
                setValue('loaiCongTrinh', []);
                getLoaiCongTrinhKhacs.forEach((item) => {
                    appendLct({
                        key: item,
                        label: '',
                        id: '',
                    });
                });
            }
            if (hints.includes('loaiHinhNuocThai')) {
                setValue('loaiHinhNuocThai', []);
                getLoaiHinhNuocThais.forEach((item) => {
                    appendLhnt({
                        key: item,
                        label: '',
                        id: '',
                    });
                });
            }
            if (hints.includes('luuVucSong')) {
                setValue('luuVucSong', []);
                getLuuVucSongKhacs.forEach((item) => {
                    appendLvs({
                        key: item,
                        label: '',
                        id: '',
                    });
                });
            }
        }, [
            getMucDichSuDungKhacs,
            getLoaiCongTrinhKhacs,
            getLoaiHinhNuocThais,
            getLuuVucSongKhacs,
        ]);

        const handleChange = (event, newValue) => {
            setTab(newValue);
        };

        const batchUpdate = React.useCallback(
            (callback) => {
                showConfirmDialog(
                    'Bạn có chắc chắn lưu lại những thay đổi này?',
                    'Chú ý!',
                    async (result) => {
                        if (result) {
                            const valueChanged = callback();
                            const initial = cloneDeep(initialValues);
                            if (isSub) {
                                initial[from]?.forEach((item, index) => {
                                    item[subFrom] = valueChanged?.[index];
                                });
                            } else {
                                initial[from] = valueChanged;
                            }
                            console.log('initial', initial);
                            setInitialValues(initial);
                            ThongBao({
                                code: 200,
                                message: 'Chuẩn hóa danh mục thành công!',
                            });
                        } else {
                        }
                    }
                );
            },
            [initialValues]
        );

        const handlePatchValue = async (type = '') => {
            switch (type) {
                case 'mucDichSuDungs': {
                    batchUpdate(() => {
                        const patchValues = getValues()['mucDichSuDungs'];
                        const valueChanged = data?.map((i) => {
                            const mucDichSuDungs = i?.mucDichSuDungs ?? [];
                            const mucDichSuDungIds = i?.mucDichSuDungIds ?? [];
                            patchValues?.forEach((item) => {
                                const indexed = mucDichSuDungs?.findIndex(
                                    (s) =>
                                        s === item?.key && item?.ids?.length > 0
                                );
                                if (indexed >= 0) {
                                    mucDichSuDungs.splice(indexed, 1);
                                    mucDichSuDungs.push(...item.labels);
                                    mucDichSuDungIds.push(...item.ids);
                                }
                            });
                            return {
                                ...i,
                                mucDichSuDungIds: [
                                    ...new Set(mucDichSuDungIds),
                                ],
                                mucDichSuDungs: [...new Set(mucDichSuDungs)],
                            };
                        });
                        return valueChanged;
                    });
                    break;
                }
                case 'loaiCongTrinh': {
                    batchUpdate(() => {
                        const patchValues = getValues()['loaiCongTrinh'];
                        const valueChanged = data?.map((i) => {
                            let loaiCongTrinh = i?.loaiCongTrinh;
                            let loaiCongTrinhId = i?.loaiCongTrinhId;
                            patchValues.forEach((item) => {
                                if (item?.key === loaiCongTrinh && item?.id) {
                                    loaiCongTrinh = item?.label;
                                    loaiCongTrinhId = item?.id;
                                }
                            });
                            return {
                                ...i,
                                loaiCongTrinh,
                                loaiCongTrinhId,
                            };
                        });
                        return valueChanged;
                    });
                    break;
                }
                case 'loaiHinhNuocThai': {
                    batchUpdate(() => {
                        const patchValues = getValues()['loaiHinhNuocThai'];
                        const valueChanged = data?.map((i) => {
                            let loaiHinhNuocThai = i?.loaiHinhNuocThai;
                            let loaiHinhNuocThaiId = i?.loaiHinhNuocThaiId;
                            patchValues.forEach((item) => {
                                if (
                                    item?.key === loaiHinhNuocThai &&
                                    item?.id
                                ) {
                                    loaiHinhNuocThai = item?.label;
                                    loaiHinhNuocThaiId = item?.id;
                                }
                            });
                            return {
                                ...i,
                                loaiHinhNuocThai,
                                loaiHinhNuocThaiId,
                            };
                        });
                        return valueChanged;
                    });
                    break;
                }
                case 'luuVucSong': {
                    batchUpdate(() => {
                        let valueChanged = [];
                        const patchValues = getValues()['luuVucSong'];
                        if (isSub) {
                            valueChanged = data?.map((i) => {
                                const item = i?.[subFrom]?.map((s) => {
                                    let luuVucSong = s?.luuVucSong;
                                    let luuVucSongId = s?.luuVucSongId;
                                    patchValues.forEach((r) => {
                                        if (r?.key === luuVucSong && r?.id) {
                                            luuVucSong = r?.label;
                                            luuVucSongId = r?.id;
                                        }
                                    });
                                    return {
                                        ...s,
                                        luuVucSong,
                                        luuVucSongId,
                                    };
                                });

                                return item;
                            });
                        } else {
                            valueChanged = data?.map((i) => {
                                let luuVucSong = i?.luuVucSong;
                                let luuVucSongId = i?.luuVucSongId;
                                patchValues.forEach((item) => {
                                    if (item?.key === luuVucSong && item?.id) {
                                        luuVucSong = item?.label;
                                        luuVucSongId = item?.id;
                                    }
                                });
                                return {
                                    ...i,
                                    luuVucSong,
                                    luuVucSongId,
                                };
                            });
                        }
                        return valueChanged;
                    });
                    break;
                }
            }
        };

        return (
            <>
                {hasLvsError && scope !== 'tinh' && (
                    <div
                        className="__hasLvsError__"
                        style={{ display: 'none' }}
                    ></div>
                )}
                <div onClick={setTrue}>
                    {renderButtonIf &&
                        isFunction(renderButton) &&
                        renderButton(hasError, hasLvsError)}
                </div>
                {isFunction(children)
                    ? children(hasError, hasLvsError)
                    : children}
                <Dialog
                    open={open}
                    // onClose={setFalse}
                    aria-labelledby="responsive-dialog-title-activity"
                    maxWidth="lg"
                >
                    <DialogTitle
                        id="responsive-dialog-title-activity"
                        textAlign={'center'}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        Chuẩn hóa danh mục
                    </DialogTitle>
                    <DialogContent
                        style={{
                            width: '1000px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
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
                                color="primary"
                            />
                            <span style={{ fontSize: 18, fontWeight: 500 }}>
                                Đang tải dữ liệu
                            </span>
                        </Backdrop>

                        <Tabs
                            value={tab}
                            onChange={handleChange}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="fullWidth"
                            sx={{
                                flex: 1,
                                width: '100%',
                                position: 'sticky',
                                justifyContent: 'space-around',
                                top: 0,
                                backgroundColor: '#fff',
                                pb: 2,
                            }}
                        >
                            {tabConfigs.map((item) => (
                                <Tab
                                    value={item.key}
                                    label={item.label}
                                    key={item.key}
                                />
                            ))}
                        </Tabs>

                        {/* Lưu vực sông */}
                        {tab === 'luuVucSong' && (
                            <Box
                                display="flex"
                                alignItems="start"
                                gap={2}
                                pb={2}
                                width={'100%'}
                            >
                                <Box width={'100%'} maxHeight={400}>
                                    {lvsFields.length > 0 &&
                                        (scope === 'tinh' ? (
                                            <p
                                                style={{
                                                    paddingBottom: 6,
                                                    fontSize: 14,
                                                }}
                                            >
                                                Hệ thống phát hiện các LVS này
                                                không nằm trong danh mục chung.
                                                Bạn hãy chọn LVS có sẵn trong
                                                danh mục để thay thế. Trường hợp
                                                bạn{' '}
                                                <span
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    không thay thế
                                                </span>{' '}
                                                hệ thống sẽ tự động thêm LVS đó
                                                vào trong danh mục "Lưu vực sông
                                                Nội Tỉnh".
                                            </p>
                                        ) : (
                                            <p
                                                style={{
                                                    paddingBottom: 6,
                                                    fontSize: 14,
                                                }}
                                            >
                                                Hệ thống phát hiện các LVS này
                                                không nằm trong danh mục chung.
                                                Bạn hãy chọn LVS Liên Tỉnh có
                                                sẵn trong danh mục để thay thế,
                                                nếu không hệ thống sẽ không cho
                                                phép bạn "Thêm mới".
                                            </p>
                                        ))}
                                    {lvsFields.map((item, index) => (
                                        <Box
                                            key={item.id}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            gap={2}
                                            pb={1}
                                        >
                                            <Chip label={item?.key} />
                                            <MyAutocomplete
                                                value={
                                                    luuVucSongs?.find(
                                                        (i) =>
                                                            watch(
                                                                `luuVucSong.${index}.id`
                                                            ) === i?.maMuc
                                                    ) ?? null
                                                }
                                                getOptionLabel={(option) =>
                                                    option?.tenMuc
                                                }
                                                options={luuVucSongs}
                                                groupBy={(o) => o.hint}
                                                onChange={(e, option) => {
                                                    if (option.length === 0) {
                                                        setValue(
                                                            `luuVucSong.${index}.id`,
                                                            null
                                                        );
                                                        setValue(
                                                            `luuVucSong.${index}.label`,
                                                            null
                                                        );
                                                        return;
                                                    }
                                                    setValue(
                                                        `luuVucSong.${index}.id`,
                                                        option.maMuc
                                                    );
                                                    setValue(
                                                        `luuVucSong.${index}.label`,
                                                        option.tenMuc
                                                    );
                                                }}
                                                placeholder={
                                                    'Chọn lưu vực sông muốn thay đổi'
                                                }
                                                label={
                                                    scope === 'tinh'
                                                        ? 'Chọn lưu vực sông có sẵn trong danh mục'
                                                        : 'Chọn lưu vực sông liên tỉnh có sẵn'
                                                }
                                                sx={{
                                                    width: '100%',
                                                    flex: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    {lvsFields.length === 0 ? (
                                        'Không có lưu vực sông khác danh mục chung'
                                    ) : (
                                        <MyButton
                                            txt="Lưu thay đổi"
                                            disabled={
                                                !watch('luuVucSong')?.find(
                                                    (s) => s?.label
                                                )
                                            }
                                            onClick={() => {
                                                handlePatchValue('luuVucSong');
                                            }}
                                        ></MyButton>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Loại công trình */}
                        {tab === 'loaiCongTrinh' && (
                            <Box
                                display="flex"
                                alignItems="start"
                                gap={2}
                                pb={2}
                                width={'100%'}
                            >
                                <Box width={'100%'} maxHeight={400}>
                                    {lctFields.map((item, index) => (
                                        <Box
                                            key={item.id}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                            pb={1}
                                        >
                                            <Chip label={item?.key} />
                                            <MyAutocomplete
                                                value={
                                                    loaiCongTrinhs?.find(
                                                        (i) =>
                                                            watch(
                                                                `loaiCongTrinh.${index}.id`
                                                            ) === i?.maMuc
                                                    ) ?? null
                                                }
                                                getOptionLabel={(option) =>
                                                    option?.tenMuc
                                                }
                                                options={loaiCongTrinhs}
                                                onChange={(e, option) => {
                                                    if (option.length === 0) {
                                                        setValue(
                                                            `loaiCongTrinh.${index}.id`,
                                                            null
                                                        );
                                                        setValue(
                                                            `loaiCongTrinh.${index}.label`,
                                                            null
                                                        );
                                                        return;
                                                    }
                                                    setValue(
                                                        `loaiCongTrinh.${index}.id`,
                                                        option.maMuc
                                                    );
                                                    setValue(
                                                        `loaiCongTrinh.${index}.label`,
                                                        option.tenMuc
                                                    );
                                                }}
                                                placeholder="Gán loại công trình"
                                                label="Gán loại công trình"
                                                sx={{
                                                    width: '100%',
                                                    flex: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    {lctFields.length === 0 ? (
                                        'Không có loại công trình nào khác danh mục chung'
                                    ) : (
                                        <MyButton
                                            txt="Lưu thay đổi"
                                            disabled={
                                                !watch('loaiCongTrinh')?.find(
                                                    (s) => s?.label
                                                )
                                            }
                                            onClick={() => {
                                                handlePatchValue(
                                                    'loaiCongTrinh'
                                                );
                                            }}
                                        ></MyButton>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Loại hình nước thải */}
                        {tab === 'loaiHinhNuocThai' && (
                            <Box
                                display="flex"
                                alignItems="start"
                                gap={2}
                                pb={2}
                                width={'100%'}
                            >
                                <Box width={'100%'} maxHeight={400}>
                                    {lhntFields.map((item, index) => (
                                        <Box
                                            key={item.id}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                            pb={1}
                                        >
                                            <Chip label={item?.key} />
                                            <MyAutocomplete
                                                value={
                                                    loaiCongTrinhs?.find(
                                                        (i) =>
                                                            watch(
                                                                `loaiHinhNuocThai.${index}.id`
                                                            ) === i?.maMuc
                                                    ) ?? null
                                                }
                                                getOptionLabel={(option) =>
                                                    option?.tenMuc
                                                }
                                                options={loaiCongTrinhs}
                                                onChange={(e, option) => {
                                                    if (option.length === 0) {
                                                        setValue(
                                                            `loaiHinhNuocThai.${index}.id`,
                                                            null
                                                        );
                                                        setValue(
                                                            `loaiHinhNuocThai.${index}.label`,
                                                            null
                                                        );
                                                        return;
                                                    }
                                                    setValue(
                                                        `loaiHinhNuocThai.${index}.id`,
                                                        option.maMuc
                                                    );
                                                    setValue(
                                                        `loaiHinhNuocThai.${index}.label`,
                                                        option.tenMuc
                                                    );
                                                }}
                                                placeholder="Gán loại hình nước thải"
                                                label="Gán loại hình nước thải"
                                                sx={{
                                                    width: '100%',
                                                    flex: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    {lhntFields.length === 0 ? (
                                        'Không có loại hình nước thải danh mục chung'
                                    ) : (
                                        <MyButton
                                            txt="Lưu thay đổi"
                                            disabled={
                                                !watch(
                                                    'loaiHinhNuocThai'
                                                )?.find((s) => s?.label)
                                            }
                                            onClick={() => {
                                                handlePatchValue(
                                                    'loaiHinhNuocThai'
                                                );
                                            }}
                                        ></MyButton>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Mục đích sử dụng */}
                        {tab === 'mucDichSuDungs' && (
                            <Box
                                display="flex"
                                alignItems="start"
                                gap={2}
                                pb={2}
                                width={'100%'}
                            >
                                <Box width={'100%'} maxHeight={400}>
                                    {mdsdFields.map((item, index) => (
                                        <Box
                                            key={item.id}
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                            pb={1}
                                        >
                                            <Chip label={item?.key} />
                                            <MyAutocomplete
                                                value={
                                                    mucDichSuDungs?.filter(
                                                        (i) =>
                                                            watch(
                                                                `mucDichSuDungs.${index}.ids`
                                                            )?.includes(i.maMuc)
                                                    ) ?? null
                                                }
                                                getOptionLabel={(option) =>
                                                    option?.tenMuc
                                                }
                                                options={mucDichSuDungs}
                                                multiple
                                                onChange={(e, options) => {
                                                    if (options.length === 0) {
                                                        setValue(
                                                            `mucDichSuDungs.${index}.ids`,
                                                            null
                                                        );
                                                        setValue(
                                                            `mucDichSuDungs.${index}.labels`,
                                                            null
                                                        );
                                                        return;
                                                    }
                                                    setValue(
                                                        `mucDichSuDungs.${index}.ids`,
                                                        options?.map(
                                                            (i) => i?.maMuc
                                                        )
                                                    );
                                                    setValue(
                                                        `mucDichSuDungs.${index}.labels`,
                                                        options?.map(
                                                            (i) => i?.tenMuc
                                                        )
                                                    );
                                                }}
                                                placeholder="Gán mục đích sử dụng"
                                                label="Gán mục đích sử dụng"
                                                sx={{
                                                    width: '100%',
                                                    flex: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                    {mdsdFields.length === 0 ? (
                                        'Không có mục đích sử dụng nào khác danh mục chung'
                                    ) : (
                                        <MyButton
                                            txt="Lưu thay đổi"
                                            disabled={
                                                !watch('mucDichSuDungs')?.find(
                                                    (s) => s?.labels?.length > 0
                                                )
                                            }
                                            onClick={() => {
                                                handlePatchValue(
                                                    'mucDichSuDungs'
                                                );
                                            }}
                                        ></MyButton>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <MyButton
                            txt="Đóng"
                            onClick={setFalse}
                            variant="outlined"
                        ></MyButton>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
);

export const FormMarkLabel = ({
    setFieldValue,
    values,
    noGutter = false,
    control,
}) => {
    return (
        <Box mr={!noGutter ? 2 : 0} mb={!noGutter ? 2 : 0} className="no_print">
            {control ? (
                <Controller
                    name="label"
                    control={control}
                    render={({ field }) => (
                        <MyTextField
                            value={field.value ?? ''}
                            onChange={(e) => {
                                field.onChange(e);
                            }}
                            size="small"
                            width={200}
                            label="Nhãn của biểu mẫu"
                            placeholder="Nhập vào nhãn"
                        />
                    )}
                />
            ) : (
                <MyTextField
                    value={values?.label ?? ''}
                    onChange={(e) => {
                        setFieldValue('label', e.target.value);
                    }}
                    size="small"
                    width={200}
                    label="Nhãn của biểu mẫu"
                    placeholder="Nhập vào nhãn"
                />
            )}
        </Box>
    );
};
