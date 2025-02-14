import {
    AccountCircle,
    Add,
    Addchart,
    Autorenew,
    Check,
    CheckBox,
    CopyAll,
    Delete,
    Devices,
    Edit,
    ImportExport,
    PersonAdd,
    PhoneAndroid,
    PhoneIphone,
    PublishedWithChanges,
    Smartphone,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import {
    Autocomplete,
    Backdrop,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import Api, { API_URI } from '../api';
import {
    MyBreadCrumbs,
    MyButton,
    MyForm,
    MySearchBox,
    MySelect,
    MyTable2,
    RowActions,
    ThongBao,
} from '../components';
import { useToggle } from '../components/HHFormTable/Hooks/useToggle';
import { AppContext } from '../const';
import Helper, { CanWriteQLTK, showConfirmDialog } from '../helpers';
import { MyAutocomplete } from '../kktnn-components';
import '../styles/paper.css';
function List() {
    const [searchParams, setSearchParams] = useSearchParams();
    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const [limit, setLimit] = React.useState(10);
    const [datas, setDatas] = React.useState([]);
    const [page, setPage] = React.useState(0);
    let rows = [];
    if (page >= 0 && page < datas.length) {
        rows = datas[page]?.records;
    }
    const newCQTHs = [
        {
            tenMuc: 'Viện nông hóa thổ nhưỡng',
            maMuc: 'alltw',
        },
        {
            tenMuc: 'Tất cả tỉnh',
            maMuc: 'allTinh',
        },
        {
            tenMuc: 'Tất cả đơn vị trực thuộc',
            maMuc: 'allDVTT',
        },
        ...CQTHs,
    ];
    const { role, scope } = useSelector((state) => state.auth);
    const count = datas.length > 0 ? datas[0].count : 0;
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [id, setID] = useState('');
    const [showDetail, setShowDetail] = useState(false);
    const formikRef = useRef(null);
    const navigate = useNavigate();
    const getList = React.useCallback(
        async ({ tuKhoa, datas, limit, page, signal }) => {
            let anchor = '';
            if (datas?.length > 0) {
                const lastdata = datas[datas.length - 1];
                anchor = lastdata.anchor;
                if (
                    !lastdata.anchor ||
                    lastdata.anchor == '' ||
                    !lastdata.records ||
                    lastdata.records?.length == 0
                ) {
                    setPage(page);
                    return;
                }
                if (page * limit >= datas[0].count) {
                    return;
                }
            }

            const values = formikRef.current.values;

            const response = await new Api().listUser({
                data: {
                    ...values,

                    limit: limit,
                    anchor: anchor,
                    signal,
                },
            });
            if (response?.code === 200 && response?.data) {
                setDatas([...datas, response?.data]);
                setPage(page);
                setLimit(limit);
                const params = { ...values };
                Object.keys(params).forEach(
                    (key) => !params[key] && delete params[key]
                );
            }
            // TODO handle error
        },
        []
    );

    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const values = formikRef?.current.values;
        setID('');
        getList({ ...values, datas, limit, page, signal });
        return () => {
            controller.abort();
        };

    }, []);

    const onNextPage = () => {
        if ((page + 1) * limit >= count) {
            return;
        }
        getList({ datas, limit, page: page + 1 });
    };

    const onChangeLimit = (event) => {
        let v = parseInt(event.target.value);
        if (v == 0) {
            v = 10;
        }
        if (v == limit) {
            return;
        }

        getList({ datas: [], limit: v, page: 0 });
    };

    const handleListButtonClick = () => {
        // Khi click vào nút của list, hiển thị dialog của detail
        setShowDetailDialog(true);
        setID('');
    };

    const handleDetailDialogClose = useCallback(() => {
        // Khi đóng dialog của detail, ẩn dialog đi và set id về rỗng
        setShowDetailDialog(false);
        setShowDetail(false);
        setID('');
    }, []);
    const handleDetailGetID = (id) => {
        if (!id) return;
        setShowDetailDialog(true);
        setID(id);
    };

    const [rmidm, setRmidm] = React.useState({});
    const onFilter = (values) => {
        // setPage(0);
        // setDatas([]);
        getList({
            datas: [],
            limit: limit,
            page: 0,
        });
    };
    // nocreate new const
    const onDelete = React.useCallback(
        async (row) => {
            if (!row || !row.data || !row.data.id) {
                return;
            }
            try {
                const response = await new Api().deleteUser({
                    id: row.data.id,
                });
                if (response?.code === 200) {
                    ThongBao({
                        status: 'success',
                        message: 'Xóa thành công!',
                    });
                    setRmidm({ ...rmidm, [row.data.id]: true });
                }
            } catch (error) {
                ThongBao({
                    status: 'error',
                    message: 'Mẫu đơn này không tồn tại trong hệ thống!',
                });
            }
        },
        [rmidm, setRmidm]
    );
    const user = useSelector((state) => state.auth);
    const rowstart = page * limit + 1;
    const newms = Date.now() - 5 * 60 * 1000;
    const rowClassRules = {
        'row-hidden': (row) => rmidm[row?.data?.id],
        'row-even': (row) => row.rowIndex % 2 === 0,
        'row-new': (row) =>
            rowstart + row.rowIndex <= 5 && row.data?.created > newms,
    };
    const luuVucSongNT = useSelector((state) => state.app?.luuVucSongs) || [];
    const luuVucSongLT =
        useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs) || [];

    const luuVucSongNTNew = [...luuVucSongLT, ...luuVucSongNT];
    const luuVucSongs = scope === 'tinh' ? luuVucSongNTNew : luuVucSongLT;
    const tinhThanhs =
        useSelector((state) => state.app?.DanhMucs?.tinhThanhs) || [];
    const filteredOptions =
        role === 'GiamSat'
            ? [optionsRole[1], optionsRole[2]] // Chỉ hiển thị quyền 'Người dùng' và 'Giám sát'
            : optionsRole; // Hiển thị toàn bộ quyền nếu không phải 'GiamSat'
    const columns = React.useMemo(
        () => [
            {
                headerName: '#',
                field: 'stt',
                width: '80px',
                suppressSizeToFit: true,
                pinned: 'left',
                cellRenderer: (row) => row.rowIndex + rowstart,
            },
            { headerName: 'Tên đăng nhập', field: 'userName', width: '200px', suppressSizeToFit: true, },
            { headerName: 'Họ và tên', field: 'fullName', width: '300px', suppressSizeToFit: true, },
            {
                headerName: 'Phân quyền',
                field: 'role',
                suppressSizeToFit: true,
                width: '300px',
                cellRenderer: (row) => {
                    if (
                        row.data?.role === 'Admin' &&
                        row.data?.typeOfUser === 'system'
                    )
                        return 'Quản trị viên hệ thống';
                    if (row.data?.role === 'Admin') return 'Quản trị viên';
                    if (row.data?.role === 'GiamSat') return 'Giám sát';
                    if (row.data?.role === 'User') return 'Người dùng';
                },
            },
            {
                headerName: 'Phạm vi tài khoản',
                suppressSizeToFit: true,
                field: 'scope',
                width: '500px',
                cellRenderer: (row) => {
                    if (row.data?.scope === 'tw') return 'Trung ương';
                    if (row.data?.scope === 'dvtt') {
                        if (row.data?.coQuanThucHienId) {
                            return CQTHs?.find(
                                (item) =>
                                    item?.maMuc === row.data?.coQuanThucHienId
                            )?.tenMuc;
                        }
                        return 'Đơn vị trực thuộc';
                    }
                    if (row.data?.scope === 'tinh') {
                        if (row.data?.tinhThanhId) {
                            return tinhThanhs?.find(
                                (item) => item?.maTinh === row.data?.tinhThanhId
                            )?.ten;
                        }
                        return 'Tỉnh';
                    }
                },
            },
            {
                headerName: 'Khu vực điều tra',
                suppressSizeToFit: true,
                width: 600, // Dùng số thay vì chuỗi '500px'
                cellRenderer: (row) => {
                    if (row.data?.scope === 'tw' && row.data?.role === 'User') {
                        // Lấy danh sách lưu vực sông liên tỉnh
                        const rowLvs = row.data?.luuVucSongLienTinhIds
                            ?.map((item) => {
                                return luuVucSongs?.find((lv) => lv?.maMuc === item)?.tenMuc;
                            })
                            .filter(Boolean)
                            .join(', ') || 'Chưa phân vùng lưu vực sông điều tra';

                        const rowTinh = row.data?.tinhThanhIds
                            ?.map((item) => {
                                return tinhThanhs?.find((lv) => lv?.maTinh === item)?.tenRutGon;
                            })
                            .filter(Boolean)
                            .join(', ') || 'Chưa phân vùng tỉnh điều tra';
                        return `${rowLvs} | ${rowTinh}`;
                    }
                    if (row.data?.scope === 'dvtt' && row.data?.role === 'User') {
                        // Lấy danh sách lưu vực sông liên tỉnh
                        const rowLvs = row.data?.luuVucSongLienTinhIds
                            ?.map((item) => {
                                return luuVucSongs?.find((lv) => lv?.maMuc === item)?.tenMuc;
                            })
                            .filter(Boolean)
                            .join(', ') || 'Chưa phân vùng lưu vực sông điều tra';

                        const rowTinh = row.data?.tinhThanhIds
                            ?.map((item) => {
                                return tinhThanhs?.find((lv) => lv?.maTinh === item)?.tenRutGon;
                            })
                            .filter(Boolean)
                            .join(', ') || 'Chưa phân vùng tỉnh điều tra';
                        return `${rowLvs} | ${rowTinh}`;
                    }
                    if (row.data?.scope === 'tinh' && row.data?.role === 'User') {
                        // Lấy danh sách lưu vực sông liên tỉnh
                        const rowLvs = row.data?.luuVucSongNoiTinhIds
                            ?.map((item) => {
                                return luuVucSongs?.find((lv) => lv?.maMuc === item)?.tenMuc;
                            })
                            .filter(Boolean)
                            .join(', ') || 'Chưa phân vùng tỉnh điều tra';
                        return `${rowLvs}`;
                    }

                    // Trường hợp không phải 'tw'
                    return '';
                },
            },
            { headerName: 'Số điện thoại', field: 'phone', width: '300px', suppressSizeToFit: true, },
            { headerName: 'Email', field: 'email', width: '350px', suppressSizeToFit: true, },
            {
                headerName: 'Thao tác',
                pinned: 'right',
                suppressSizeToFit: true,
                width: '145px',
                cellRenderer: (row) => (
                    <RowActions
                        row={row}
                        onEdit={(row) => {
                            handleDetailGetID(row?.data?.id);
                            setShowDetail(false);
                        }}
                        onView={(row) => {
                            handleDetailGetID(row?.data?.id);
                            setShowDetail(true);
                        }}
                        onDelete={(row) => onDelete(row)}
                        canWrite={CanWriteQLTK(
                            user,
                            row.data?.scope,
                            row.data?.role,
                            row.data?.typeOfUser
                        )}
                    />
                ),
            },
        ],
        [user, navigate, onDelete, rowstart]
    );
    return (
        <div>
            <MyBreadCrumbs
                title={[
                    { name: 'Biểu mẫu', link: '/danh-sach-bieu-mau' },
                    { name: 'Danh sách tài khoản' },
                ]}
                renderItems={
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                            mr: 2,
                        }}
                    >
                        <>
                            {role === 'Admin' && (
                                <MyButton
                                    txt={'Tạo tài khoản'}
                                    icon={<PersonAdd />}
                                    title={'Tạo tài khoản'}
                                    onClick={() => {
                                        handleListButtonClick();
                                    }}
                                    height={'45px'}
                                />
                            )}
                        </>
                    </Stack>
                }
            />
            <MySearchBox
                name="tuKhoa"
                formikRef={formikRef}
                showState={false}
                initialValues={{
                    tuKhoa: '',
                }}
                onSubmit={onFilter}
            >
                {({ setFieldValue, values }) => (
                    <>
                        <MyAutocomplete
                            getOptionLabel={(option) => option?.ten}
                            options={
                                filteredOptions || []
                            }
                            width="250px"
                            label="Phân quyền"
                            value={filteredOptions.find(
                                (item) => item.key === values.role
                            ) ?? null}
                            onChange={(e, value) => {
                                setFieldValue('role', value?.key);
                            }}
                            placeholder="Chọn quyền"
                        />
                        <MyAutocomplete
                            getOptionLabel={(option) => option?.tenRutGon}
                            options={
                                tinhThanhs || []
                            }
                            width="250px"
                            label="Tỉnh thành"
                            hidden={scope !== 'tw'}
                            value={tinhThanhs.find(
                                (item) => item.ma === values.tinhId
                            ) ?? null}
                            onChange={(e, value) => {
                                setFieldValue('tinhId', value?.maTinh);
                            }}
                            placeholder="Chọn tỉnh thành"
                        />
                        {(scope === 'tw' && role === 'Admin' &&
                            <MyAutocomplete
                                getOptionLabel={(option) => option?.tenMuc}
                                value={newCQTHs.find(
                                    (item) => item.tenMuc === values.scopeTen
                                ) ?? null}
                                options={newCQTHs || []}
                                width="250px"
                                label="Phạm vi"

                                name="tenMuc"
                                onChange={(e, value) => {
                                    if (!value) {
                                        setFieldValue('scopeTen', undefined);
                                        setFieldValue('scope', undefined);
                                        setFieldValue(
                                            'coQuanThucHienId',
                                            undefined
                                        );
                                    } else {
                                        setFieldValue(
                                            'scopeTen',
                                            value?.tenMuc
                                        );
                                        if (value?.maMuc === 'alltw') {
                                            setFieldValue('scope', 'tw');
                                            setFieldValue(
                                                'coQuanThucHienId',
                                                undefined
                                            );
                                        } else if (
                                            value?.maMuc === 'allTinh'

                                        ) {
                                            setFieldValue('scope', 'tinh');
                                            setFieldValue(
                                                'coQuanThucHienId',
                                                undefined
                                            );
                                        } else if (
                                            value?.maMuc === 'allDVTT'
                                        ) {
                                            setFieldValue('scope', 'dvtt');
                                            setFieldValue(
                                                'coQuanThucHienId',
                                                undefined
                                            );
                                        } else {
                                            setFieldValue('scope', 'dvtt');
                                            setFieldValue(
                                                'coQuanThucHienId',
                                                value?.maMuc
                                            );
                                        }
                                    }
                                }}
                                placeholder="Chọn phạm vi"
                            />
                        )}
                    </>
                )}
            </MySearchBox>
            {/* <FilterBox
                {...{
                    newCQTHs,
                    formikRef,
                    searchParams,
                    handleListButtonClick,
                    tinhThanhs,
                    onFilter,
                }}
            /> */}

            <Detail
                onClose={handleDetailDialogClose}
                id={id}
                showDetail={showDetail}
                open={showDetailDialog}
                getlist={() => {
                    const values = formikRef.current.values;
                    getList({ limit, page: 0, datas: [], ...values });
                    getList({ datas: [], limit: limit, page: 0 });
                }}
            />
            <Grid
                container
                justifyContent="space-between"
                alignItems="flex-end"
                ml={2}
                my={1}
            >
                <Typography variant="h7" fontWeight="bold">
                    DANH SÁCH TÀI KHOẢN
                </Typography>
            </Grid>
            <MyTable2
                rows={rows || []}
                columns={columns}
                rowClassRules={rowClassRules}
                limit={limit}
                count={count}
                page={page}
                loading={false}
                onBackPage={() => {
                    setPage(page - 1);
                }}
                onNextPage={onNextPage}
                onChangeLimit={onChangeLimit}
            />
        </div>
    );
}

const optionsRole = [
    {
        ten: 'Quản trị viên',
        key: 'Admin',
    },
    {
        ten: 'Giám sát',
        key: 'GiamSat',
    },
    {
        ten: 'Người dùng',
        key: 'User',
    },
];
const optionsScope = [
    {
        ten: 'Trung ương',
        key: 'tw',
    },
    {
        ten: 'Đơn vị trực thuộc',
        key: 'dvtt',
    },
    {
        ten: 'Tỉnh',
        key: 'tinh',
    },
];

const FilterBox = ({
    formikRef,
    searchParams,
    handleListButtonClick,
    tinhThanhs,
    onFilter,
    newCQTHs,
}) => {
    const { role, scope } = useSelector((state) => state?.auth);
    return (
        <MySearchBox
            name="tuKhoa"
            formikRef={formikRef}
            showState={false}
            initialValues={{
                tuKhoa: '',
            }}
            hidden={role !== 'Admin'}
            onSubmit={onFilter}
            customButton={[
                { title: 'Thêm mới', action: () => handleListButtonClick() },
            ]}
        >
            {({ setFieldValue, values }) => (
                <>
                    <MySelect
                        options={
                            role === 'GiamSat'
                                ? [optionsRole[1], optionsRole[2]]
                                : optionsRole
                        }
                        width="250px"
                        label="Phân quyền"
                        value={values.roleTen || null}
                        name="ten"
                        onChange={(e, value) => {
                            setFieldValue('roleTen', value?.ten);
                            setFieldValue('role', value?.key);
                        }}
                        placeholder="Chọn quyền"
                    />
                    {scope !== 'tinh' && (
                        <MySelect
                            options={tinhThanhs}
                            width="250px"
                            label="Tỉnh thành"
                            value={values.tinhThanhTen || null}
                            name="tenRutGon"
                            onChange={(e, value) => {
                                setFieldValue('tinhThanhTen', value?.tenRutGon);
                                setFieldValue('tinhId', value?.maTinh);
                            }}
                            placeholder="Chọn tỉnh/thành phố"
                        />
                    )}

                    {scope === 'tw' && role === 'Admin' && (
                        <>
                            <>
                                <MySelect
                                    options={newCQTHs}
                                    width="250px"
                                    label="Phạm vi"
                                    value={values.scopeTen || null}
                                    name="tenMuc"
                                    onChange={(e, value) => {
                                        if (!value) {
                                            setFieldValue('scopeTen', null);
                                            setFieldValue('scope', '');
                                            setFieldValue(
                                                'coQuanThucHienId',
                                                ''
                                            );
                                        } else {
                                            setFieldValue(
                                                'scopeTen',
                                                value?.tenMuc
                                            );
                                            if (value?.maMuc === 'alltw') {
                                                setFieldValue('scope', 'tw');
                                                setFieldValue(
                                                    'coQuanThucHienId',
                                                    ''
                                                );
                                            } else if (
                                                value?.maMuc === 'allTinh'
                                            ) {
                                                setFieldValue('scope', 'tinh');
                                                setFieldValue(
                                                    'coQuanThucHienId',
                                                    ''
                                                );
                                            } else if (
                                                value?.maMuc === 'allDVTT'
                                            ) {
                                                setFieldValue('scope', 'dvtt');
                                                setFieldValue(
                                                    'coQuanThucHienId',
                                                    ''
                                                );
                                            } else {
                                                setFieldValue('scope', 'dvtt');
                                                setFieldValue(
                                                    'coQuanThucHienId',
                                                    value?.maMuc
                                                );
                                            }
                                        }
                                    }}
                                    placeholder="Chọn phạm vi"
                                />
                            </>
                        </>
                    )}
                </>
            )}
        </MySearchBox>
    );
};

function Detail({ onClose, open, id, getlist, showDetail }) {
    const { role, scope, typeOfUsers, coQuanThucHienId } = useSelector(
        (state) => state?.auth
    );
    const luuVucSongNT = useSelector((state) => state.app?.luuVucSongs) || [];
    const luuVucSongLT =
        useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs) || [];

    const luuVucSongNTNew = [...luuVucSongLT, ...luuVucSongNT];
    const luuVucSongs = scope === 'tinh' ? luuVucSongNTNew : luuVucSongLT;
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(() => {
        return {
            id: null,
            userName: null,
            password: null,
            email: null,
            phone: null,
            fullName: null,
            coQuanThucHienId: null,
            role: null,
            scope: null,
            tinhThanhID: null,
            members: [],
            supervisor: null,
        };
    });
    const accessoken = localStorage.getItem('access-token');
    const [errosBE, setErrosBE] = useState('');
    const [selectedMaTinh, setSelectedMaTinh] = useState(null);
    const [selectedMaCoQuanThucHien, setSelectedMaCoQuanThucHien] =
        useState(null);
    const [selectedTenCoQuanThucHien, setSelectedTenCoQuanThucHien] =
        useState(null);
    const [selectedScope, setSelectedScope] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showDescription, setDescription] = useState(false);
    const [chipLabel, setChipLabel] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedTinh, setSelectedTinh] = useState(null);
    const [thanhVien, setThanhVien] = useState([]);
    const [giamSat, setGiamSat] = useState([]);
    const [selectedGiamSat, setSelectedGiamSat] = useState(null);
    const [copy, setCopy] = useState(false);
    const { tinhThanhId } = useSelector((state) => state?.auth);

    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const tinhThanhs =
        useSelector((state) => state.app?.DanhMucs?.tinhThanhs) || [];


    const userRole = role;

    const roleSupperAdmin = [
        { title: 'Quản trị viên', value: 'Admin' },
        { title: 'Giám sát', value: 'GiamSat' },
        { title: 'Người dùng', value: 'User' },
    ];
    const selectCoQuanThucHienTinh = [
        {
            tenMuc: `Sở Tài Nguyên Và Môi Trường ${tinhThanhs.find((item) => item?.maTinh === selectedTinh)?.ten ||
                ''
                }`,
            maMuc: 'coQuanThucHienTinh',
        },
        {
            tenMuc: `Viện nông hóa thổ nhưỡng`,
            maMuc: 'botaiNguyen',
        },
    ];

    const roleAdmin = [
        { title: 'Giám sát', value: 'GiamSat' },
        { title: 'Người dùng', value: 'User' },
    ];
    const scopes = [
        { title: 'Trung ương', value: 'tw' },
        { title: 'Đơn vị trực thuộc', value: 'dvtt' },
        { title: 'Tỉnh', value: 'tinh' },
    ];

    const validationSchema = Yup.object().shape({
        userName: Yup.string()
            .required('Vui lòng nhập tên tài khoản')
            .matches(
                /^([a-z0-9_]+|[a-z0-9.@]+)$/,
                'Tên tài khoản phải bắt đầu bằng chữ cái và chỉ có thể chứa chữ cái không dấu, số, @ và .,không chứa các ký tự đặc biệt khác'
            ),
        password: Yup.string()
            .required('Vui lòng nhập mật khẩu')
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
                'Mật khẩu phải có chữ, số và ký tự đặc biệt'
            ),
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Vui lòng nhập email'),
        fullName: Yup.string().required('Vui lòng nhập họ và tên'),
        tinhThanhID:
            selectedScope?.value === 'tinh'
                ? Yup.string().required('Vui lòng chọn tỉnh thành')
                : '',
        role: Yup.string().required('Vui lòng chọn quyền'),
        scope: Yup.string().required('Vui lòng chọn phạm vi tài khoản'),
        phone: Yup.string()
            .required('Vui lòng nhập số điện thoại')
            .matches(/^[0-9]+$/, 'Số điện thoại không hợp lệ')
            .max(10, 'Số điện thoại phải là 10 số')
            .min(10, 'Số điện thoại phải là 10 số'),
        coQuanThucHienId:
            selectedScope?.value === 'dvtt'
                ? Yup.string().required('Vui lòng chọn cơ quan thực hiện')
                : '',
    });
    const paperRef = useRef();
    const formRef = useRef();

    const handleChangeMaCoQuanThucHien = (event, values) => {
        setSelectedTenCoQuanThucHien(values);
        setSelectedMaCoQuanThucHien(values);
        getApiGiamSatByIdCQTH({ coQuanThucHienId: values?.maMuc });
        getApiThanhVienByIdCQTH({ coQuanThucHienId: values?.maMuc });
    };

    const handleChangeMaTinh = (event, value) => {
        const newMaTinh = value?.maTinh;
        setSelectedMaTinh(value);
        setSelectedMaCoQuanThucHien(null);
        setSelectedTinh(newMaTinh);
        getApiUserByIdTinh({ tinhid: newMaTinh });
        getApiGiamSatByIdTinh({ tinhid: newMaTinh });
    };
    const roleDescriptions = {
        Admin: {
            tw: 'Quyền Quản trị viên của trung ương có thể tạo tất cả các tài khoản khác trong hệ thống, Xem tất cả dữ liệu hệ thống ,Có thể tổng hợp và công bố những biểu mẫu',
            dvtt: 'Quyền Quản trị viên của đơn vị trực thuộc có thể tạo tài khoản giám sát và người dùng cho đơn vị trực thuộc của mình, Xem dữ liệu và tổng hợp những biểu mẫu của đơn vị trực thuộc',
            tinh: 'Quyền Quản trị viên của tỉnh có thể tạo tài khoản giám sát và người dùng cho tỉnh của mình, Xem dữ liệu và tổng hợp những biểu mẫu của tỉnh',
        },
        GiamSat: {
            tw: 'Quyền Giám sát của trung ương có thể xem thông tin các tài khoản mà mình giám sát, Xem dữ liệu và quản lý tất cả biểu mẫu của thành viên mà mình giám sát',
            dvtt: 'Quyền Giám sát của đơn vị trực thuộc có thể xem thông tin các tài khoản mà mình giám sát, Xem dữ liệu và quản lý những biểu mẫu đơn vị trực thuộc của thành viên mà mình giám sát',
            tinh: 'Quyền Giám sát của tỉnh có thể xem thông tin các tài khoản mà mình giám sát, Xem dữ liệu và quản lý những biểu mẫu tỉnh của thành viên mà mình giám sát',
        },
        User: {
            tw: 'Quyền Người dùng của trung ương',
            dvtt: 'Quyền Người dùng của đơn vị trực thuộc có thể thêm dữ liệu các biểu mẫu thuộc phạm vi đơn vị trực thuộc của mình',
            tinh: 'Quyền Người dùng của tỉnh có thể thêm dữ liệu các biểu mẫu thuộc phạm vi tỉnh của mình',
        },
    };
    const handleScopeChange = async (newValue) => {
        setSelectedMaCoQuanThucHien(null);
        setSelectedMaTinh(null);
        setSelectedMembers([]);
        setSelectedGiamSat(null);
        setSelectedScope(newValue);
        if (newValue?.value === 'tw') {
            setSelectedMaCoQuanThucHien(null);
            await getApiGiamSatByTw({ scope: 'tw' });
            await getApiThanhVienByTw({ scope: 'tw' });
        }
        const role = selectedRole?.value;
        const scope = newValue?.value;
        if (role && scope && roleDescriptions[role]?.[scope]) {
            setDescription(true);
            setChipLabel(roleDescriptions[role][scope]);
        } else {
            setDescription(false);
        }
    };
    const handleMemberChange = (event, selectedOptions) => {
        setSelectedMembers(selectedOptions);
    };
    const handleGiamSatChange = (event, newValue) => {
        setSelectedGiamSat(newValue);
    };

    const handleRoleChange = async (newValue) => {
        setSelectedRole(newValue);
        const role = newValue?.value;
        const scope = selectedScope?.value;

        if (role && scope && roleDescriptions[role]?.[scope]) {
            setDescription(true);
            setChipLabel(roleDescriptions[role][scope]);
        } else {
            setDescription(false);
        }
    };
    const getApiUserByIdTinh = ({ ...rest }) => {
        new Api()
            .getThanhVienByTinh({ data: { tinhid: selectedTinh, ...rest } })
            .then((res) => {
                if (res.code === 200) {
                    setThanhVien(res.data);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };
    const getApiGiamSatByTw = ({ scope, supervisor, ...rest }) => {
        new Api()
            .getGiamSatByTW({ data: { scope: selectedScope?.value, ...rest } })
            .then((res) => {
                if (res.code === 200) {
                    setGiamSat(res.data);
                    const setGiamSatNew =
                        res.data?.find(
                            (item) => item?.userName === supervisor
                        ) || null;
                    // setSelectedGiamSat(setGiamSatNew);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };
    const getApiThanhVienByTw = ({ ...rest }) => {
        new Api()
            .getThanhVienByTW({
                data: { scope: selectedScope?.value, ...rest },
            })
            .then((res) => {
                if (res.code === 200) {
                    setThanhVien(res.data);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };
    const getApiGiamSatByIdTinh = ({ supervisor, ...rest }) => {
        new Api()
            .getGiamSatByTinh({ data: { tinhid: selectedTinh, ...rest } })
            .then((res) => {
                if (res.code === 200) {
                    setGiamSat(res.data);
                    const setGiamSatDpNew =
                        res.data?.find(
                            (item) => item?.userName === supervisor
                        ) || null;
                    setSelectedGiamSat(setGiamSatDpNew);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };
    const getApiGiamSatByIdCQTH = ({ supervisor, coQuanThucHienId }) => {
        new Api()
            .getGiamSatByCQTH({ data: { coquanid: coQuanThucHienId } })
            .then((res) => {
                if (res.code === 200) {
                    setGiamSat(res.data);
                    const setGiamSatDpNew =
                        res.data?.find(
                            (item) => item?.userName === supervisor
                        ) || null;
                    setSelectedGiamSat(setGiamSatDpNew);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };
    const handlecreateTokenByUser = ({ userName }) => {
        new Api()
            .createTokenByUser({ data: { userName: userName } })
            .then((res) => {
                if (res.code === 200) {
                    navigator.clipboard.writeText(
                        `${AppContext.BaseUrl}/reset-password?token=${res?.data?.token}&userName=${res?.data?.userName}`
                    );
                    setCopy(true);
                    setTimeout(() => {
                        setCopy(false);
                    }, 2000);
                    ThongBao({
                        status: 'success',
                        message: 'Sao chép link thành công',
                    });
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };

    const getApiThanhVienByIdCQTH = ({ coQuanThucHienId }) => {
        new Api()
            .getThanhVienByCQTH({ data: { coquanid: coQuanThucHienId } })
            .then((res) => {
                if (res.code === 200) {
                    setThanhVien(res.data);
                } else {
                    ThongBao({ code: res.code });
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra, xem log!',
                });
            });
    };

    useEffect(() => {
        if (id) {
            new Api().getUser({ id }).then(async (res) => {
                if (res.code === 200) {
                    const data = { ...res.data };
                    setInitialValues(data);
                    const setSelectedRoleNew =
                        roleSupperAdmin?.find(
                            (item) => item?.value === data?.role
                        ) || null;
                    setSelectedRole(setSelectedRoleNew);
                    const setSelectedScopeNew =
                        scopes.find((item) => item?.value === data?.scope) ||
                        null;
                    setSelectedScope(setSelectedScopeNew);
                    const selectedMaTinhNew =
                        tinhThanhs?.find(
                            (item) => item?.maTinh === data?.tinhThanhId
                        ) || null;
                    const selectedMaCoQuanThucHienNew =
                        CQTHs?.find(
                            (item) => item?.maMuc === data?.coQuanThucHienId
                        ) || null;
                    setSelectedMaCoQuanThucHien(selectedMaCoQuanThucHienNew);
                    setSelectedMaTinh(selectedMaTinhNew);
                    if (setSelectedScopeNew?.value === 'tw') {
                        if (data?.role === 'User') {
                            getApiGiamSatByTw({
                                scope: setSelectedScopeNew?.value,
                                supervisor: data?.supervisor,
                            });
                        }
                        if (data?.role === 'GiamSat') {
                            getApiThanhVienByTw({
                                scope: setSelectedScopeNew?.value,
                            });
                        }
                    } else if (setSelectedScopeNew?.value === 'dvtt') {
                        if (data?.role === 'GiamSat') {
                            getApiThanhVienByIdCQTH({
                                coQuanThucHienId:
                                    selectedMaCoQuanThucHienNew?.maMuc,
                            });
                        }
                        if (data?.role === 'User') {
                            getApiGiamSatByIdCQTH({
                                coQuanThucHienId:
                                    selectedMaCoQuanThucHienNew?.maMuc,
                                supervisor: data?.supervisor,
                            });
                        }
                    } else {
                        if (data?.role === 'GiamSat') {
                            getApiUserByIdTinh({
                                tinhid: selectedMaTinhNew?.maTinh,
                            });
                        }
                        if (data?.role === 'User') {
                            getApiGiamSatByIdTinh({
                                tinhid: selectedMaTinhNew?.maTinh,
                            });
                        }
                    }

                    const membersObjects =
                        data && data.members
                            ? data.members.map((member) => ({
                                userName: member || '',
                            }))
                            : [];

                    setSelectedMembers(membersObjects || []);
                } else {
                    ThongBao({ code: res.code });
                }
            });
            setLoading(false);
        } else {
            setInitialValues({
                userName: '',
                password: '',
                email: '',
                phone: '',
                fullName: '',
                coQuanThucHienId: '',
                role: '',
                scope: '',
                tinhThanhID: '',
                members: [],
                supervisor: '',
            });
            setSelectedRole(null);
            setSelectedScope(null);
            setSelectedMaTinh(null);
            setSelectedMaCoQuanThucHien(null);
            setSelectedMembers([]);
            setSelectedGiamSat(null);
        }
    }, [id]);

    const validateForm = (values) => {
        // Kiểm tra và trả về thông báo lỗi nếu có
        if (!values.userName) {
            return 'Bạn chưa nhập tên tài khoản';
        } else if (!/^([a-z0-9_]+|[a-z0-9.@]+)$/.test(values.userName)) {
            return 'Tên tài khoản phải bắt đầu bằng chữ cái và chỉ có thể chứa chữ cái không dấu, số, @ và .,không chứa các ký tự đặc biệt khác';
        }
        if (!values.fullName) {
            return 'Bạn chưa nhập họ và tên';
        }
        if (id === '') {
            if (!values.password) {
                return 'Bạn chưa nhập mật khẩu';
            }
            if (values.password.length < 6) {
                return 'Mật khẩu phải có ít nhất 6 ký tự';
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(values.password)) {
                return 'Mật khẩu phải là (Số + Ký tự đặc biệt) hoặc (Chữ + Số) hoặc (Chữ + Số + Ký tự đặc biệt)';
            }
        }

        if (!values.email) {
            return 'Bạn chưa nhập email';
        } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
            return 'Email không đúng định dạng';
        }
        if (!values.phone) {
            return 'Bạn chưa nhập số điện thoại';
        }
        if (!/^[0-9]+$/.test(values.phone)) {
            return 'Số điện thoại không hợp lệ';
        }
        if (values.phone.length !== 10) {
            return 'Số điện thoại phải là 10 số';
        }
        if (!values.role) {
            return 'Bạn chưa chọn quyền';
        }
        if (values.role !== 'System' && !values.scope) {
            return 'Bạn chưa chọn phạm vi tài khoản';
        }
        if (values.scope === 'tinh' && !values.tinhThanhID) {
            return 'Bạn chưa chọn tỉnh thành';
        }
        if (values.scope === 'dvtt' && !values.coQuanThucHienId) {
            return 'Bạn chưa chọn cơ quan thực hiện';
        }

        // Trả về null nếu không có lỗi
        return null;
    };

    // xóa itemselected
    const handleSave = async () => {
        const role = selectedRole?.value || null;
        const scope = selectedScope?.value || null;
        const coQuanThucHien = selectedTenCoQuanThucHien?.tenMuc || null;
        const tinhThanhID = selectedMaTinh?.ma || null;
        const members =
            selectedMembers?.map((member) => member?.userName) || null;
        const values = formRef.current.values;
        const supervisor = selectedGiamSat?.userName || null;

        values.coQuanThucHienId = '';
        values.role = role;

        if (scope === 'dvtt') {
            const coQuanThucHienId = selectedMaCoQuanThucHien?.maMuc || null;
            values.coQuanThucHienId = coQuanThucHienId;
        }

        values.scope = scope;
        values.coQuanThucHien = coQuanThucHien;
        values.tinhThanhID = tinhThanhID;
        values.members = members;
        values.supervisor = supervisor;

        const data = { ...values };
        formRef.current.validateForm();

        const error = validateForm(values);
        if (error) {
            ThongBao({ status: 'warn', message: error });
            return;
        }

        setSaveLoading(true);
        fetch(`${API_URI}users/createaccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessoken}`,
            },
            body: JSON.stringify(data),
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
                if (data === 'TaiKhoanDaTonTai') {
                    ThongBao({
                        status: 'error',
                        message:
                            'Tên đăng nhập đã tồn tại vui lòng nhập tên đăng nhập khác',
                    });
                    setErrosBE(
                        'Tên đăng nhập đã tồn tại vui lòng nhập tên đăng nhập khác'
                    );
                } else {
                    ThongBao({
                        status: 'success',
                        message: 'Tạo tài khoản thành công',
                    });
                    setErrosBE('');
                    onClose();
                    getlist();
                }
            })
            .catch((err) => {
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra: Xem chi tiết tại log!',
                });
            });
    };

    const checkOptionRole = Helper.checkOptionRole(
        role,
        scope,
        typeOfUsers,
        selectedScope?.value
    );
    const checkOptionScope = Helper.checkOptionScope(
        typeOfUsers,
        role,
        selectedRole?.value,
        scope
    );

    const PasswordVisibilityToggle = ({ visible, toggleVisibility }) => (
        <InputAdornment position="end">
            <IconButton onClick={toggleVisibility} edge="end">
                {visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );

    const handleUpdate = async () => {
        const role = selectedRole?.value || null;
        const coQuanThucHien = selectedTenCoQuanThucHien?.tenMuc || null;
        const scope = selectedScope?.value || null;
        const tinhThanhID = selectedMaTinh?.ma || null;
        const members =
            selectedMembers?.map((member) => member?.userName) || null;
        const valuesEdit = formRef.current.values;
        const supervisor = selectedGiamSat?.userName || null;
        valuesEdit.coQuanThucHienId = '';
        if (scope === 'dvtt') {
            const coQuanThucHienId = selectedMaCoQuanThucHien?.maMuc || null;
            valuesEdit.coQuanThucHienId = coQuanThucHienId;
        }
        valuesEdit.coQuanThucHien = coQuanThucHien;
        valuesEdit.role = role;
        valuesEdit.scope = scope;
        valuesEdit.tinhThanhID = tinhThanhID;
        valuesEdit.members = members;
        valuesEdit.supervisor = supervisor;
        valuesEdit.password = 'abc123';
        const data = {
            ...valuesEdit,
        };
        // thêm các trường mới bên trên vào data
        formRef.current.validateForm();
        const error = validateForm(valuesEdit);

        if (error) {
            ThongBao({ status: 'warn', message: error });
            return;
        }
        setSaveLoading(true);
        fetch(`${API_URI}users/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessoken}`,
            },
            body: JSON.stringify(data),
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
                if (data === 'TaiKhoanDaTonTai') {
                    ThongBao({
                        status: 'error',
                        message:
                            'Tên đăng nhập đã tồn tại vui lòng nhập tên đăng nhập khác',
                    });
                    setErrosBE(
                        'Tên đăng nhập đã tồn tại vui lòng nhập tên đăng nhập khác'
                    );
                    return;
                } else {
                    ThongBao({
                        status: 'success',
                        message: 'Cập nhật tài khoản thành công',
                    });
                    setErrosBE('');
                    onClose();
                    getlist();
                    return;
                }
            })
            .catch((err) => {
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi xảy ra: Xem chi tiết tại log!',
                });
            });
    };

    return (
        <>
            <Dialog
                open={open}
                maxWidth="53vw"
                maxHeight="50vh"
            // onClose={showDetail ? onClose : () => { }}
            >
                {loading ? (
                    <div
                        style={{
                            width: '53vw',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CircularProgress />
                    </div>
                ) : (
                    <div
                        ref={paperRef}
                        style={{
                            width: '53vw',
                        }}
                    >
                        <MyForm
                            formikRef={formRef}
                            dataFormik={initialValues}
                            onSubmitAPI={() => { }}
                            validationSchema={validationSchema}
                            editable={true}
                            showFormikState={false}
                            children={({
                                values,
                                errors,
                                setFieldValue,
                                ...formik
                            }) => (
                                <>
                                    <DialogTitle>
                                        {id !== ''
                                            ? 'Cập nhật tài khoản'
                                            : 'Thêm mới tài khoản'}
                                    </DialogTitle>
                                    <DialogContent>
                                        <Grid
                                            container
                                            textAlign="left"
                                            justifyContent="center"
                                            gap={1}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid item xs={id ? 6 : 4}>
                                                    <TextField
                                                        value={values?.userName}
                                                        required
                                                        margin="dense"
                                                        id="name1"
                                                        name="userName"
                                                        label="Tên đăng nhập"
                                                        type="text"
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        error={
                                                            errors?.userName ||
                                                            errosBE
                                                        }
                                                        helperText={
                                                            errors?.userName ||
                                                            errosBE
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={id ? 6 : 4}>
                                                    <TextField
                                                        required
                                                        margin="dense"
                                                        value={values?.fullName}
                                                        id="fullName"
                                                        name="fullName"
                                                        label="Họ và tên"
                                                        type="text"
                                                        fullWidth
                                                        variant="outlined"
                                                        error={errors?.fullName}
                                                        helperText={
                                                            errors?.fullName
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        size="small"
                                                    />
                                                </Grid>
                                                {!id ? (
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            required
                                                            margin="dense"
                                                            id="password"
                                                            disabled={
                                                                id !== ''
                                                                    ? true
                                                                    : false
                                                            }
                                                            name="password"
                                                            placeholder="@abc123..."
                                                            type={
                                                                showPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            fullWidth
                                                            variant="outlined"
                                                            label="Mật khẩu"
                                                            onChange={
                                                                formik.handleChange
                                                            }
                                                            helperText={
                                                                errors?.password
                                                            }
                                                            error={
                                                                errors?.password
                                                            }
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
                                                            size="small"
                                                        />
                                                    </Grid>
                                                ) : (
                                                    ''
                                                )}
                                            </Grid>
                                            <Grid container spacing={2} mb={2}>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        required
                                                        margin="dense"
                                                        value={values?.email}
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="abc123@gmail.com"
                                                        fullWidth
                                                        helperText={
                                                            errors?.email
                                                        }
                                                        error={errors?.email}
                                                        label="Email"
                                                        variant="outlined"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        margin="dense"
                                                        required
                                                        id="phone"
                                                        value={values?.phone}
                                                        name="phone"
                                                        type="text"
                                                        variant="outlined"
                                                        helperText={
                                                            errors?.phone
                                                        }
                                                        error={errors?.phone}
                                                        fullWidth
                                                        label="Số điện thoại"
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        size="small"
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid
                                                container
                                                textAlign="left"
                                                justifyContent="left"
                                                spacing={2}
                                                mb={2}
                                            >
                                                <Grid item xs={6}>
                                                    <Autocomplete
                                                        value={
                                                            selectedRole || null
                                                        }
                                                        readOnly={
                                                            userRole ===
                                                            'GiamSat' ||
                                                            showDetail
                                                        }
                                                        getOptionLabel={(
                                                            option
                                                        ) => option.title}
                                                        options={
                                                            checkOptionRole
                                                                ? roleSupperAdmin
                                                                : roleAdmin
                                                        }
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                        size="small"
                                                        renderInput={(
                                                            params
                                                        ) => (
                                                            <TextField
                                                                {...params}
                                                                label="Phân quyền"
                                                                placeholder="Chọn quyền"
                                                                required
                                                                error={
                                                                    errors?.role
                                                                }
                                                                helperText={
                                                                    errors?.role
                                                                }
                                                            />
                                                        )}
                                                        onChange={(
                                                            event,
                                                            newValue
                                                        ) =>
                                                            handleRoleChange(
                                                                newValue
                                                            )
                                                        }
                                                    />
                                                </Grid>

                                                <Grid item xs={6}>
                                                    <Autocomplete
                                                        value={
                                                            selectedScope ||
                                                            null
                                                        }
                                                        readOnly={
                                                            userRole ===
                                                            'GiamSat' ||
                                                            showDetail
                                                        }
                                                        getOptionLabel={(
                                                            option
                                                        ) => option.title}
                                                        size="small"
                                                        options={
                                                            scope === 'dvtt'
                                                                ? [scopes[1]]
                                                                : scope ===
                                                                    'tinh'
                                                                    ? [scopes[2]]
                                                                    : checkOptionScope
                                                                        ? scopes
                                                                        : [
                                                                            scopes[1],
                                                                            scopes[2],
                                                                        ]
                                                        }
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                        renderInput={(
                                                            params
                                                        ) => (
                                                            <TextField
                                                                {...params}
                                                                label="Phạm vi tài khoản"
                                                                placeholder="Chọn phạm vi"
                                                                error={
                                                                    errors?.scope
                                                                }
                                                                required
                                                                helperText={
                                                                    errors?.scope
                                                                }
                                                            />
                                                        )}
                                                        onChange={(
                                                            event,
                                                            newValue
                                                        ) =>
                                                            handleScopeChange(
                                                                newValue
                                                            )
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid
                                                container
                                                textAlign="left"
                                                justifyContent="left"
                                                spacing={2}
                                            >
                                                {selectedScope?.value ===
                                                    'tinh' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectedMaTinh ||
                                                                    null
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) => option?.ten}
                                                                options={
                                                                    scope !== 'tinh'
                                                                        ? tinhThanhs
                                                                        : tinhThanhs?.filter(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item?.maTinh ===
                                                                                tinhThanhId
                                                                        )
                                                                }
                                                                onChange={
                                                                    handleChangeMaTinh
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn tỉnh"
                                                                        label="Tỉnh"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        error={
                                                                            selectedScope?.value ===
                                                                            'tinh' &&
                                                                            errors.tinhThanhID
                                                                        }
                                                                        helperText={
                                                                            selectedScope?.value ===
                                                                            'tinh' &&
                                                                            errors.tinhThanhID
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}
                                                {selectedScope?.value ===
                                                    'dvtt' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectedMaCoQuanThucHien
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) => option?.tenMuc}
                                                                options={
                                                                    scope === 'tw'
                                                                        ? CQTHs
                                                                        : CQTHs?.filter(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item?.maMuc ===
                                                                                coQuanThucHienId
                                                                        )
                                                                }
                                                                onChange={
                                                                    handleChangeMaCoQuanThucHien
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn cơ quan thực hiện"
                                                                        label="Cơ quan thực hiện"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        error={
                                                                            selectedScope?.value ===
                                                                            'dvtt' &&
                                                                            errors.coQuanThucHienId
                                                                        }
                                                                        helperText={
                                                                            selectedScope?.value ===
                                                                            'dvtt' &&
                                                                            errors.coQuanThucHienId
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                            {/* {errors.coQuanThucHienId &&
                                                                selectedScope?.value ===
                                                                'dvtt' && (
                                                                    <div
                                                                        style={{
                                                                            color: 'red',
                                                                            fontSize:
                                                                                '12px',
                                                                            fontWeight:
                                                                                'normal',
                                                                            paddingTop:
                                                                                '3px',
                                                                        }}
                                                                    >
                                                                        {
                                                                            errors.coQuanThucHienId
                                                                        }
                                                                    </div>
                                                                )} */}
                                                        </Grid>
                                                    )}
                                                {selectedScope?.value ===
                                                    'tinh' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectCoQuanThucHienTinh[0]
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) => option?.tenMuc}
                                                                options={[
                                                                    selectCoQuanThucHienTinh[0],
                                                                ]}
                                                                onChange={
                                                                    handleChangeMaCoQuanThucHien
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn cơ quan thực hiện tỉnh"
                                                                        label="Cơ quan thực hiện tỉnh"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}
                                                {selectedScope?.value ===
                                                    'tw' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectCoQuanThucHienTinh[1]
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) => option?.tenMuc}
                                                                options={[
                                                                    selectCoQuanThucHienTinh[1],
                                                                ]}
                                                                onChange={
                                                                    handleChangeMaCoQuanThucHien
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn cơ quan thực hiện "
                                                                        label="Cơ quan thực hiện "
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}

                                                {selectedRole?.value ===
                                                    'User' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectedGiamSat ||
                                                                    null
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) =>
                                                                    option?.userName
                                                                }
                                                                options={giamSat}
                                                                onChange={
                                                                    handleGiamSatChange
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn giám sát"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        label="Giám sát"
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}
                                                {selectedRole?.value ===
                                                    'GiamSat' && (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    selectedMembers
                                                                }
                                                                multiple
                                                                limitTags={2}
                                                                id="multiple-limit-tags"
                                                                options={thanhVien}
                                                                style={{
                                                                    width: '100%',
                                                                }}
                                                                getOptionLabel={(
                                                                    option
                                                                ) =>
                                                                    option?.userName
                                                                }
                                                                size="small"
                                                                renderInput={(
                                                                    params
                                                                ) => (
                                                                    <TextField
                                                                        {...params}
                                                                        placeholder="Chọn thành viên"
                                                                        label="Thành viên"
                                                                    />
                                                                )}
                                                                onChange={
                                                                    handleMemberChange
                                                                }
                                                            />
                                                        </Grid>
                                                    )}
                                                {selectedRole?.value ===
                                                    'User' &&
                                                    (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    scope === 'tinh' ?
                                                                        luuVucSongs?.filter((i) =>
                                                                            !!values.luuVucSongNoiTinhIds?.find(s => s === i.maMuc)
                                                                        ) ?? null :
                                                                        luuVucSongs?.filter((i) =>
                                                                            !!values.luuVucSongLienTinhIds?.find(s => s === i.maMuc)
                                                                        ) ?? null}
                                                                getOptionLabel={(
                                                                    option
                                                                ) =>
                                                                    option?.tenMuc
                                                                }
                                                                limitTags={2}
                                                                multiple
                                                                options={luuVucSongs}
                                                                onChange={(e, value) => {
                                                                    if (scope === 'tinh') {
                                                                        setFieldValue('luuVucSongNoiTinhIds', value.map((i) => i.maMuc))
                                                                    } else {
                                                                        setFieldValue('luuVucSongLienTinhIds', value.map((i) => i.maMuc))
                                                                    }

                                                                }}
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn lưu vực sông"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        label="Phân vùng các lưu vực sông điều tra"
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}
                                                {(selectedRole?.value ===
                                                    'User' && (selectedScope?.value === 'tw' || selectedScope?.value === 'dvtt')) &&
                                                    (
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                readOnly={
                                                                    userRole ===
                                                                    'GiamSat' ||
                                                                    showDetail
                                                                }
                                                                value={
                                                                    tinhThanhs?.filter((i) =>
                                                                        !!values.tinhThanhIds?.find(s => s === i.ma)
                                                                    ) ?? null
                                                                }
                                                                getOptionLabel={(
                                                                    option
                                                                ) =>
                                                                    option?.tenRutGon
                                                                }
                                                                options={tinhThanhs}
                                                                multiple
                                                                limitTags={2}
                                                                onChange={(e, value) => {
                                                                    setFieldValue('tinhThanhIds', value.map((i) => i.ma))
                                                                }}
                                                                size="small"
                                                                renderInput={(
                                                                    paramss
                                                                ) => (
                                                                    <TextField
                                                                        {...paramss}
                                                                        placeholder="Chọn tỉnh thành"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        label="Phân vùng các tỉnh điều tra"
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                    )}



                                            </Grid>

                                            <Grid
                                                container
                                                textAlign="left"
                                                justifyContent="left"
                                                mt={2}
                                            >
                                                {showDescription && (
                                                    <Grid item xs={12}>
                                                        <InputLabel>
                                                            Mô tả:
                                                        </InputLabel>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                flexWrap:
                                                                    'wrap',
                                                            }}
                                                        >
                                                            <Chip
                                                                icon={
                                                                    <ErrorIcon />
                                                                }
                                                                sx={{
                                                                    height: 'auto',
                                                                    padding:
                                                                        '10px', // Thêm padding
                                                                    '& .MuiChip-label':
                                                                    {
                                                                        whiteSpace:
                                                                            'normal',
                                                                        wordBreak:
                                                                            'break-word',
                                                                    },
                                                                }}
                                                                label={
                                                                    <Typography variant="body2">
                                                                        {
                                                                            chipLabel
                                                                        }
                                                                    </Typography>
                                                                }
                                                                fullWidth
                                                            />
                                                        </Box>
                                                    </Grid>
                                                )}
                                                {showDetail &&
                                                    role === 'Admin' && (
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            display={'flex'}
                                                        >
                                                            <InputLabel>
                                                                Link đổi mật
                                                                khẩu
                                                            </InputLabel>
                                                            <MyButton
                                                                icon={
                                                                    copy ? (
                                                                        <CheckBox />
                                                                    ) : (
                                                                        <CopyAll />
                                                                    )
                                                                }
                                                                title={
                                                                    'Sao chép'
                                                                }
                                                                txt={
                                                                    copy
                                                                        ? 'Đã sao chép'
                                                                        : 'Sao chép'
                                                                }
                                                                variant="contained"
                                                                color="primary"
                                                                style={{
                                                                    marginLeft:
                                                                        '10px',
                                                                }}
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    handlecreateTokenByUser(
                                                                        {
                                                                            userName:
                                                                                values?.userName,
                                                                        }
                                                                    );
                                                                }}
                                                            ></MyButton>
                                                        </Grid>
                                                    )}
                                                {/* {showDetail && (
                                                    <DevicesListModal
                                                        key={'management'}
                                                        username={
                                                            values?.userName
                                                        }
                                                    >
                                                        <Button
                                                            sx={{ mt: 1 }}
                                                            fullWidth
                                                            size="medium"
                                                            variant="outlined"
                                                            disableElevation
                                                        >
                                                            <Devices
                                                                sx={{ mr: 1 }}
                                                            />
                                                            <span>
                                                                Quản lý thiết bị
                                                            </span>
                                                        </Button>
                                                    </DevicesListModal>
                                                )} */}
                                            </Grid>
                                        </Grid>
                                    </DialogContent>

                                    {userRole === 'Admin' ? (
                                        !showDetail ? (
                                            <DialogActions>
                                                <MyButton txt="Đóng" onClick={onClose} variant='outlined' size='small' style={{ textTransform: 'none' }}>
                                                </MyButton>
                                                <MyButton
                                                    txt={
                                                        id !== ''
                                                            ? 'Lưu thay đổi'
                                                            : 'Thêm mới'
                                                    }
                                                    onClick={
                                                        id !== ''
                                                            ? handleUpdate
                                                            : handleSave
                                                    }
                                                    title={
                                                        id !== ''
                                                            ? 'Lưu thay đổi'
                                                            : 'Thêm mới'
                                                    }
                                                />
                                            </DialogActions>
                                        ) : (
                                            <DialogActions>
                                                <MyButton txt="Đóng" onClick={onClose} variant='outlined' size='small' style={{ textTransform: 'none' }}>

                                                </MyButton>
                                            </DialogActions>
                                        )
                                    ) : (
                                        <DialogActions>
                                            <MyButton txt="Đóng" onClick={onClose} variant='outlined' size='small' style={{ textTransform: 'none' }}>
                                                Đóng
                                            </MyButton>
                                        </DialogActions>
                                    )}
                                </>
                            )}
                        />
                    </div>
                )}
            </Dialog>
        </>
    );
}

const DevicesListModal = ({ username, children }) => {
    const [open, { setTrue, setFalse }] = useToggle();
    const { userName: currentUsername, accessToken } = useSelector(
        (state) => state.auth
    );
    const [devices, setDevices] = React.useState([]);
    const [selectedDevices, setSelectedDevices] = React.useState([]);

    const getDevicesList = React.useCallback(async () => {
        try {
            const _username = username ? username : currentUsername;
            const response = await new Api().getDevices(_username);
            if (response.code === 200) {
                setDevices(
                    response.data?.filter((device) => device.token !== '')
                );
            } else {
                ThongBao({
                    code: response.code,
                });
                setDevices([]);
            }
        } catch (error) {
            setDevices([]);
            ThongBao({
                code: error?.status,
            });
        }
    }, [username, currentUsername]);

    const handleLogout = React.useCallback(
        async (devices) => {
            try {
                console.log(devices);
                showConfirmDialog(
                    'Bạn sẽ phải thực hiện đăng nhập lại nếu thực hiện đăng xuất',
                    'Bạn muốn đăng xuất khỏi thiết bị này?',
                    async (result) => {
                        if (result) {
                            const response = await new Api().logout(
                                devices
                                    ?.filter((device) => device.id)
                                    .map((device) => device.id)
                            );
                            if (response.code === 200) {
                                ThongBao({
                                    code: 200,
                                    message: `Bạn đã đăng xuất thành công khỏi ${selectedDevices.length} thiết bị`,
                                });
                                setSelectedDevices([]);
                                await getDevicesList();
                            } else {
                                setSelectedDevices([]);
                                await getDevicesList();
                            }
                        }
                    }
                );
            } catch (error) { }
        },
        [getDevicesList, selectedDevices]
    );

    const isSelectedAllDevices = React.useMemo(() => {
        const filteredDevices = devices?.filter(
            (device) => device.token !== accessToken
        );
        if (filteredDevices.length === 0 && devices.length > 0) return false;
        return selectedDevices.length === filteredDevices.length;
    }, [selectedDevices, devices, accessToken]);

    React.useEffect(() => {
        getDevicesList();
    }, [username, getDevicesList]);
    // handle ...

    return (
        <>
            <div onClick={setTrue} style={{ width: '100%' }}>
                {children}
            </div>
            <Dialog
                open={open}
                // onClose={setFalse}
                aria-labelledby="responsive-dialog-title"
                maxWidth="lg"
            >
                <DialogTitle
                    id="responsive-dialog-title"
                    textAlign={'center'}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    Quản lý thiết bị
                    <IconButton onClick={getDevicesList}>
                        <Autorenew />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    style={{
                        width: '1000px',
                        display: 'flex',
                        flexDirection: 'column',
                        paddingTop: 10,
                    }}
                >
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        pb={1}
                    >
                        <Typography>Các thiết bị đã đăng nhập</Typography>
                        {!username && (
                            <Typography
                                fontSize={14}
                                color="#38bdf8"
                                sx={{
                                    opacity: isSelectedAllDevices ? 1 : 0.6,
                                    ':hover': {
                                        opacity: 1,
                                    },
                                    transition: 'all .2s',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    if (isSelectedAllDevices) {
                                        setSelectedDevices([]);
                                        return;
                                    }
                                    setSelectedDevices(
                                        devices?.filter(
                                            (device) =>
                                                device.token !== accessToken
                                        )
                                    );
                                }}
                            >
                                {isSelectedAllDevices
                                    ? 'Bỏ chọn tất cả'
                                    : 'Chọn tất cả'}
                            </Typography>
                        )}
                    </Box>
                    {devices?.length > 0 ? (
                        devices.map((device) => (
                            <Box
                                borderBottom={'1px solid #ccc'}
                                sx={{
                                    ':hover': {
                                        backgroundColor: '#eee',
                                    },
                                    cursor: 'pointer',
                                }}
                                display={'flex'}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                component={'label'}
                                htmlFor={device.token}
                                key={device.token}
                            >
                                <Box
                                    display={'flex'}
                                    alignItems={'center'}
                                    px={2}
                                    py={1}
                                    gap={3}
                                >
                                    <Box>
                                        {device.client === 'android' && (
                                            <PhoneAndroid />
                                        )}
                                        {device.client === 'ios' && (
                                            <PhoneIphone />
                                        )}
                                        {!['android', 'ios'].includes(
                                            device.client
                                        ) && <Devices />}
                                    </Box>
                                    <Box
                                        display={'flex'}
                                        flexDirection={'column'}
                                    >
                                        <Typography
                                            color="#38bdf8"
                                            fontWeight={500}
                                        >
                                            {!['ios', 'android'].includes(
                                                device.client
                                            )
                                                ? 'web'
                                                : device.client}
                                        </Typography>
                                        <Typography fontSize={14}>
                                            {device.deviceInfo}, Địa chỉ IP:{' '}
                                            {device.ip} (
                                            {moment(device.timeLogin).format(
                                                'DD/MM/YYYY hh:mm:ss'
                                            )}
                                            )
                                        </Typography>
                                    </Box>
                                </Box>
                                {device.token !== accessToken && !username ? (
                                    <Checkbox
                                        id={device.token}
                                        checked={Boolean(
                                            selectedDevices.find(
                                                (i) => i.token === device.token
                                            ) ?? 0
                                        )}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDevices([
                                                    ...selectedDevices,
                                                    device,
                                                ]);
                                            } else {
                                                setSelectedDevices(
                                                    selectedDevices.filter(
                                                        (d) =>
                                                            d.token !==
                                                            device.token
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                ) : (
                                    <AccountCircle sx={{ mr: 1 }} />
                                )}
                            </Box>
                        ))
                    ) : (
                        <p>Chưa có thông tin đăng nhập</p>
                    )}
                </DialogContent>
                <DialogActions>
                    {!username && (
                        <MyButton
                            txt="Đăng xuất"
                            onClick={async () => {
                                await handleLogout(selectedDevices);
                            }}
                            disabled={selectedDevices.length <= 0}
                        ></MyButton>
                    )}
                    <MyButton
                        txt="Đóng"
                        onClick={setFalse}
                        variant="outlined"
                    ></MyButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

const ActivitiesListModal = React.memo(({ children }) => {
    const [open, { setTrue, setFalse }] = useToggle();
    const [activities, setActivities] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const { scope, tinhThanhId, coQuanThucHienId } = useSelector((state) => state.auth);
    const lastId = React.useMemo(
        () => activities[activities.length - 1]?.id,
        [activities]
    );

    const getActivitiesList = React.useCallback(async (anchor = 0) => {
        try {
            setLoading(true);
            const response = await new Api().getActivities({
                anchor,
                scope,
                tinhThanhId,
                coQuanThucHienId
            });
            if (response.code === 200) {
                setActivities(
                    anchor === 0
                        ? [...response.data?.records]
                        : (prevActivities) => [
                            ...prevActivities,
                            ...response.data?.records,
                        ]
                );
            } else {
                ThongBao({
                    code: response.code,
                });
                setActivities([]);
            }
        } catch (error) {
            console.log(error);
            setActivities([]);
            ThongBao({
                code: error?.status,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        getActivitiesList();
    }, []);

    const getActivity = (eventType, bieuMau, bieuMauId) => {
        const sbm = bieuMau?.replace('BieuMauSo', '')?.replace('undefined', '');
        switch (eventType) {
            case 'create_bieu_mau': {
                return `Tạo biểu mẫu số ${sbm}`;
            }
            case 'syncthetic_bieu_mau': {
                return `Tổng hợp biểu mẫu số ${sbm}`;
            }
            case 'update_bieu_mau': {
                return `Cập nhật biểu mẫu số ${sbm} với id (${bieuMauId})`;
            }
            case 'delete_bieu_mau': {
                return `Xóa biểu mẫu số ${sbm} với id (${bieuMauId})`;
            }
            case 'confirm_bieu_mau': {
                return `Xác nhận biểu mẫu số ${sbm} với id (${bieuMauId})`;
            }
            case 'publish_bieu_mau': {
                return `Công bố biểu mẫu số ${sbm} với id (${bieuMauId})`;
            }
            case 'import_excel': {
                return `Nhập tệp Excel biểu mẫu số ${sbm}`;
            }
            default:
                return '';
        }
    };
    return (
        <>
            <div onClick={setTrue}>{children}</div>
            <Dialog
                open={open}
                onClose={setFalse}
                aria-labelledby="responsive-dialog-title-activity"
                maxWidth="lg"
            >
                <DialogTitle
                    id="responsive-dialog-title-activity"
                    textAlign={'center'}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    Nhật ký hoạt động của phạm vi {' '}
                    {scope === 'tw'
                        ? 'Trung ương'
                        : scope === 'tinh'
                            ? 'Tỉnh'
                            : 'Đơn vị trực thuộc'}
                    <IconButton onClick={() => getActivitiesList(0)}>
                        <Autorenew />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    style={{
                        width: '1000px',
                        display: 'flex',
                        flexDirection: 'column',
                        paddingTop: 10,
                    }}
                >
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        pb={1}
                    >
                        <Typography>
                            {loading && 'Đang tải'} Tổng số các hoạt động gần
                            đây: {!loading && activities.length}
                        </Typography>
                    </Box>
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
                    {activities?.length > 0 &&
                        activities.map((activity) => (
                            <Box
                                borderBottom={'1px solid #ccc'}
                                sx={{
                                    ':hover': {
                                        backgroundColor: '#eee',
                                    },
                                    cursor: 'pointer',
                                }}
                                display={'flex'}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                component={'label'}
                                key={activity.id}
                            >
                                <Box
                                    display={'flex'}
                                    alignItems={'center'}
                                    px={2}
                                    py={1}
                                    gap={3}
                                >
                                    <Box>
                                        {activity.eventType ===
                                            'import_excel' && <ImportExport />}
                                        {activity.eventType ===
                                            'create_bieu_mau' && <Add />}
                                        {activity.eventType ===
                                            'update_bieu_mau' && <Edit />}
                                        {activity.eventType ===
                                            'delete_bieu_mau' && <Delete />}
                                        {activity.eventType ===
                                            'confirm_bieu_mau' && <Check />}
                                        {activity.eventType ===
                                            'publish_bieu_mau' && (
                                                <PublishedWithChanges />
                                            )}
                                        {activity.eventType ===
                                            'syncthetic_bieu_mau' && (
                                                <Addchart />
                                            )}
                                        {activity.eventType === 'open_app' && (
                                            <Smartphone />
                                        )}
                                    </Box>
                                    <Box
                                        display={'flex'}
                                        flexDirection={'column'}
                                    >
                                        <Typography
                                            color="#38bdf8"
                                            fontWeight={500}
                                        >
                                            <span>
                                                <span style={{ color: '#000' }}>
                                                    Tài khoản (
                                                    {activity?.issuer}) đã
                                                </span>{' '}
                                                {getActivity(
                                                    activity?.eventType,
                                                    activity?.bieuMau,
                                                    activity?.bieuMauId
                                                )}
                                            </span>
                                            {!activity?.bieuMau &&
                                                activity.eventType ===
                                                'open_app' &&
                                                'Mở ứng dụng di động'}
                                        </Typography>
                                        <Typography fontSize={14}>
                                            {activity?.data?.deviceInfo}, Địa
                                            chỉ IP: {activity.ip} (
                                            {moment(activity.created).format(
                                                'DD/MM/YYYY hh:mm:ss'
                                            )}
                                            )
                                        </Typography>
                                        {activity?.eventType ===
                                            'import_excel' && (
                                                <Typography
                                                    fontSize={14}
                                                    sx={{
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Trạng thái{' '}
                                                    {activity?.description?.includes(
                                                        'thành công'
                                                    )
                                                        ? 'thành công'
                                                        : 'thất bại'}{' '}
                                                    <span
                                                        style={{
                                                            fontWeight: 500,
                                                        }}
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: 'Chi tiết',
                                                                text: activity?.data
                                                                    ?.description,
                                                                confirmButtonText:
                                                                    'Xác nhận',
                                                            });
                                                        }}
                                                    >
                                                        (Xem chi tiết)
                                                    </span>
                                                </Typography>
                                            )}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    {!loading && activities?.length === 0 && (
                        <p>Chưa có thông tin</p>
                    )}
                    <Box mt={2} display={'flex'} justifyContent={'center'}>
                        <MyButton
                            txt="Xem thêm"
                            disabled={loading}
                            variant="outlined"
                            onClick={() => getActivitiesList(lastId)}
                        ></MyButton>
                    </Box>
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
});

export { ActivitiesListModal, DevicesListModal, List };

