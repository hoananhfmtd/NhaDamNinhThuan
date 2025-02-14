import {
    AssignmentOutlined,
    DensitySmallOutlined,
    GridView,
    InfoOutlined,
    List,
    PivotTableChartOutlined,
    RestartAltOutlined,
    Search,
    TravelExploreOutlined,
} from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    Box,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Tab,
    Tabs,
} from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import React from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { FastFormDataInfo, FormDataInfo } from '../../layouts/config';
import FormCard from './FormCard';
import './index.scss';

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light'
                ? 'rgb(55, 65, 81)'
                : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity
                ),
            },
        },
    },
}));

export const DanhSachBieuMauRoutes = [
    {
        path: '',
        main: () => <DanhSachBieuMau />,
    },
    {
        path: 'nhap-nhanh',
        main: () => <DanhSachBieuMau fast />,
    },
];

const scopeValue = 1;
const coQuanTHValue = 1;
const bieuNhapValue = 1;
const coQuanTHConLai = 1;

const DanhSachBieuMau = ({ fast = false }) => {
    const _FormDataInfo = fast ? FastFormDataInfo : FormDataInfo;
    const [keyword, setKeyword] = React.useState('');
    const [formList, setFormList] = React.useState(_FormDataInfo);
    // biểu 9 và 25 là cơ quan thực hiện trung tâm khí tượng thủy văn
    const { scope, coQuanThucHienId, role } = useSelector(
        (state) => state?.auth
    );
    const userScope = scope;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selected, setSelected] = React.useState('Tất cả');
    const [tab, setTab] = React.useState('1');

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const formListSearch = React.useMemo(() => {
        return formList.filter((form) => {
            const userScopeMatch =
                userScope === 'tinh'
                    ? form.scope === scopeValue
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            const bieuNhapTW =
                role !== 'Admin' && userScope === 'tw'
                    ? form.bieuNhapValue === bieuNhapValue
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            const bieuNhapTinh =
                role !== 'Admin' && userScope === 'tinh'
                    ? form.scope === scopeValue &&
                    form.bieuNhapValue === bieuNhapValue
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            //danh sách admin dvtt khí tượng thủy văn
            const coQuanTHMatchAdmin9va25 =
                role === 'Admin' && coQuanThucHienId === '06dvtt'
                    ? form.coQuanTHAdmin === 2
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            //danh sách !admin dvtt khí tượng thủy văn
            const coQuanTHMatch9va25 =
                role !== 'Admin' && coQuanThucHienId === '06dvtt'
                    ? form.coQuanTH === coQuanTHValue
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            // danh sách !admin dvtt không là kTTV
            const coQuanTHMatchConLai =
                role !== 'Admin' && coQuanThucHienId !== '06dvtt'
                    ? form.coQuanTHConLai === coQuanTHConLai
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            const coQuanTHMatchAdminConLai =
                role === 'Admin' && coQuanThucHienId !== '06dvtt'
                    ? form.coQuanTHAdminConLai === 1
                    : form.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    form.title.toLowerCase().includes(keyword.toLowerCase());
            // admin xem hết tất cả
            if (userScope === 'tw' && role === 'Admin') {
                return userScopeMatch;
            } else if (role !== 'Admin' && userScope === 'tw') {
                return bieuNhapTW;
            } else if (role !== 'Admin' && userScope === 'tinh') {
                return bieuNhapTinh;
            } else if (role === 'Admin' && userScope === 'tinh') {
                return userScopeMatch;
            } else if (coQuanThucHienId === '06dvtt' && role !== 'Admin') {
                return coQuanTHMatch9va25;
            } else if (coQuanThucHienId !== '06dvtt' && role !== 'Admin') {
                return coQuanTHMatchConLai;
            } else if (coQuanThucHienId !== '06dvtt' && role === 'Admin') {
                return coQuanTHMatchAdminConLai;
            } else if (coQuanThucHienId === '06dvtt' && role === 'Admin') {
                return coQuanTHMatchAdmin9va25;
            }
            return userScopeMatch;
        });
    }, [formList, userScope, keyword, role, coQuanThucHienId]);

    const getClassName = React.useCallback(
        (className) => {
            if (tab === '1') return className + '-special';
            else return className;
        },
        [tab]
    );

    return (
        <div className={getClassName('form-list__container')}>
            <div className="form-list__container--box">
                <Box
                    sx={{
                        p: 5,
                    }}
                    width={800}
                    display="flex"
                    flexDirection="column"
                >
                    <OutlinedInput
                        sx={{
                            width: '100%',
                            pr: 1,
                            pl: 2,
                            height: 50,
                            backgroundColor: '#E9EEF6',
                            borderRadius: '20px',
                            '& fieldset': { border: 'none' },
                            '.MuiInputBase-input': {
                                '::placeholder': {
                                    color: 'black !important',
                                },
                            },
                        }}
                        id="form-box-keyword"
                        placeholder="Tìm kiếm biểu mẫu"
                        startAdornment={
                            <InputAdornment position="start">
                                <Search stroke={1.5} size="1rem" />
                            </InputAdornment>
                        }
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        aria-describedby="keyword-helper-text"
                        inputProps={{
                            'aria-label': 'weight',
                        }}
                    />

                    <Box
                        display="flex"
                        width="auto"
                        justifyContent="center"
                        alignItems="center"
                        pt={2}
                        gap={1}
                    >
                        <Button
                            id="demo-customized-button"
                            aria-controls={
                                open ? 'demo-customized-menu' : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            variant="contained"
                            disableElevation
                            onClick={handleClick}
                            startIcon={<InfoOutlined />}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                color: 'black',
                                borderRadius: '20px !important',
                                backgroundColor: '#E9EEF6',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#E9EEF6',
                                },
                            }}
                        >
                            {selected}
                        </Button>

                        <StyledMenu
                            id="demo-customized-menu"
                            MenuListProps={{
                                'aria-labelledby': 'demo-customized-button',
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem
                                onClick={() => {
                                    setFormList(_FormDataInfo);
                                    setSelected('Tất cả');
                                    handleClose();
                                }}
                                disableRipple
                            >
                                <DensitySmallOutlined />
                                Tất cả
                            </MenuItem>
                            {!fast && (
                                <MenuItem
                                    onClick={() => {
                                        setFormList(
                                            _FormDataInfo.filter(
                                                (i) => i?.type === 1
                                            )
                                        );
                                        handleClose();
                                        setSelected('Tổng hợp');
                                    }}
                                    disableRipple
                                >
                                    <PivotTableChartOutlined />
                                    Tổng hợp
                                </MenuItem>
                            )}
                            <MenuItem
                                onClick={() => {
                                    setFormList(
                                        _FormDataInfo.filter(
                                            (i) => i?.type === 2
                                        )
                                    );
                                    handleClose();
                                    setSelected('Điều tra thực địa');
                                }}
                                disableRipple
                            >
                                <TravelExploreOutlined />
                                Điều tra thực địa
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    setFormList(
                                        _FormDataInfo.filter(
                                            (i) => i?.type === 3
                                        )
                                    );
                                    handleClose();
                                    setSelected('Nhập nội nghiệp');
                                }}
                                disableRipple
                            >
                                <AssignmentOutlined />
                                Nhập nội nghiệp
                            </MenuItem>
                        </StyledMenu>

                        <Tabs
                            value={tab}
                            onChange={handleChange}
                            textColor="primary"
                            indicatorColor="primary"
                            variant='standard'
                            sx={{ minHeight: '38px', height: '38px' }}
                        >
                            <Tab value="1" icon={<List />} />
                            <Tab value="2" icon={<GridView />} />
                        </Tabs>

                        <div style={{
                            flexShrink: 0,
                        }}>
                            <IconButton
                                onClick={() => {
                                    setFormList(_FormDataInfo);
                                    setKeyword('');
                                    setSelected('Tất cả');
                                }}
                            >
                                <RestartAltOutlined />
                            </IconButton>
                        </div>
                    </Box>
                </Box>
            </div>

            <div className="base-grid">
                {formListSearch.map((form, index) => (
                    <FormCard
                        fast={fast}
                        key={uuidv4()}
                        data={form}
                        dataSearch={keyword}
                        special={tab === '1'}
                    />
                ))}
            </div>

            <div>
                {!formListSearch?.length > 0 && (
                    <div className="form-list__container--empty">
                        <span>
                            Không tìm thấy biểu mẫu phù hợp với từ khóa
                            <span
                                style={{
                                    color: '#b0d8ee',
                                }}
                            >
                                {' '}
                                "{keyword}"
                            </span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
