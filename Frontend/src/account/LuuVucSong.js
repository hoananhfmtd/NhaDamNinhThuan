import { yupResolver } from '@hookform/resolvers/yup';
import {
    Autocomplete,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Grid,
    Typography,
} from '@mui/material';
import { isEmpty } from 'lodash';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import Api from '../api';
import {
    MyBreadCrumbs,
    MyButton,
    MySearchBox,
    MyTable2,
    RowActions,
    ThongBao,
} from '../components';
import { useToggle } from '../components/HHFormTable/Hooks/useToggle';
import { getLuuVucSongLienTinhs, getLuuVucSongs } from '../store';

const schema = yup.object().shape({
    loai: yup.string(),
    maMuc0: yup
        .string()
        .matches('^[a-zA-Z0-9]+$', 'Định dạng mã lưu vực sông chưa đúng')
        .min(2, 'Mã lưu vực sông tối thiểu 4 ký tự')
        .max(30, 'Mã lưu vực sông tối đa 30 ký tự')
        .required('Mã lưu vực sông không được để trống'),
    tenMuc: yup.string().required('Tên lưu vực sông không được để trống'),
    luuVucSongLienTinhId: yup.string().when('loai', (loai, schema) => {
        if (loai.includes('noitinh')) {
            return schema.required("Lưu vực sông liên kết không được để trống")
        }
    }),
});

const List = () => {
    const dispatch = useDispatch();
    const [limit, setLimit] = React.useState(10);
    const [datas, setDatas] = React.useState([]);
    const [page, setPage] = React.useState(0);
    let rows = [];
    if (page >= 0 && page < datas.length) {
        rows = datas[page]?.records;
    }
    const count = datas.length > 0 ? datas[0].count : 0;
    const formikRef = React.useRef(null);
    const navigate = useNavigate();
    const { role, scope, tinhThanh, tinhThanhId } = useSelector(
        (state) => state.auth
    );
    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const lvsLienTinhs = useSelector(
        (state) => state.app?.DanhMucs?.luuVucSongLienTinhs || []
    );

    const getList = React.useCallback(async ({ datas, limit, page, signal }) => {
        let anchor = '';
        if (datas?.length > 0) {
            const lastdata = datas[datas.length - 1];
            anchor = lastdata.anchor;
            if (
                !lastdata.anchor ||
                lastdata.anchor === '' ||
                !lastdata.records ||
                lastdata.records?.length === 0
            ) {
                return;
            }
            if ((page + 1) * limit >= datas[0].count) {
                return;
            }
        }
        const values = formikRef.current.values;
        const response = await new Api().getAllLVS({
            tuKhoa: values?.tuKhoa === '' ? undefined : values?.tuKhoa,
            limit: limit,
            anchor: anchor,
            signal,
        });
        if (response?.code === 200 && response?.data) {
            const _datass = {
                records: lvsLienTinhs
            }
            setDatas([...datas, _datass]);
        }
        // TODO handle error
    }, []);

    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        getList({ datas, limit, page, signal });
        return () => {
            controller.abort();
        }

    }, []);

    const onNextPage = () => {
        if ((page + 1) * limit >= count) {
            return;
        }
        setPage(page + 1);
        getList({ datas, limit, page });
    };

    const onChangeLimit = (event) => {
        let v = parseInt(event.target.value);
        if (v == 0) {
            v = 10;
        }
        if (v == limit) {
            return;
        }
        setLimit(v);
        setPage(0);
        setDatas([]);
        getList({ datas: [], limit: v, page: 0 });
    };

    const onFilter = (values) => {
        setPage(0);
        setDatas([]);
        getList({ datas: [], limit: limit, page: 0 });
    };

    const handleDelete = React.useCallback(
        async (row) => {
            if (!row?.data?.maMuc) {
                return;
            }
            try {
                const response = await new Api().deleteLVS(row.data.maMuc);
                if (response?.code === 200) {
                    setPage(0);
                    setDatas([]);
                    getList({ datas: [], limit: limit, page: 0 });
                    ThongBao({
                        status: 'success',
                        message: 'Xóa lưu vực sông thành công!',
                    });
                }
            } catch (error) {
                ThongBao({
                    status: 'error',
                    message: 'Lưu vực sông không tồn tại trong hệ thống!',
                });
            }
        },
        // eslint-disable-next-line
        []
    );
    const action = (row) => {
        if (row?.data?.loai === 'lientinh' && role === 'Admin' && scope === 'tw')
            return true;
        if (
            (row?.data?.loai === 'noitinh' || row?.data?.loai === 'noitinhdoclap') &&
            role === 'Admin' &&
            scope === 'tinh'
        )
            return true;
        return false;
    };

    const columns = React.useMemo(
        () => [
            {
                headerName: 'Mã lưu vực sông',
                minWidth: 200,
                field: 'maMuc0',
                flex: 1,
                suppressSizeToFit: true,
            },
            {
                headerName: 'Tên lưu vực sông',
                suppressSizeToFit: true,
                field: 'tenMuc',
                flex: 1,
            },
            {
                headerName: 'Loại lưu vực sông',
                suppressSizeToFit: true,
                field: 'loai',
                flex: 1,
                cellRenderer: (row) => (
                    <div>
                        {row?.data?.loai === 'lientinh' && <span>Liên Tỉnh</span>}
                        {row?.data?.loai === 'noitinh' && <span>Nội Tỉnh</span>}
                        {row?.data?.loai === 'noitinhdoclap' && <span>Nội Tỉnh Độc Lập</span>}
                    </div>
                ),
            },
            // {
            //     headerName: 'Tỉnh thành',
            //     suppressSizeToFit: true,
            //     field: 'tinhThanh',
            //     flex: 0.5,
            // },
            // {
            //     headerName: 'Số lượng đơn vị trực thuộc',
            //     suppressSizeToFit: true,
            //     field: 'loai',
            //     flex: 1,
            //     cellRenderer: (row) => (
            //         <div>
            //             {row?.data?.coQuanThucHienIds?.filter(Boolean)
            //                 ?.length ?? 0}
            //         </div>
            //     ),
            // },
            {
                headerName: 'Lưu vực sông liên kết',
                suppressSizeToFit: true,
                field: 'loai',
                flex: 1,
                cellRenderer: (row) => (
                    <div>
                        {
                            lvsLienTinhs.find(lvs => lvs.maMuc === row?.data?.luuVucSongLienTinhId)?.tenMuc ?? "Không có"
                        }
                    </div>
                ),
            },
            {
                headerName: 'Thao tác',
                pinned: 'right',
                width: '110px',
                suppressSizeToFit: true,
                cellRenderer: (row) => (
                    <RowActions
                        row={row}
                        onView={(row) => handleGetDetail(row?.data?.maMuc)}
                        onDelete={(row) => handleDelete(row)}
                        canWrite={action(row)}
                        canView={action(row)}
                    />
                ),
            },

        ],
        [role, navigate, handleDelete, scope, lvsLienTinhs]
    );
    const columnLTs = React.useMemo(
        () => [
            { headerName: 'STT', field: 'stt', width: '80px', suppressSizeToFit: true, pinned: 'left', cellRenderer: row => row.rowIndex + 1 },
            {
                headerName: 'Mã lưu vực sông',
                minWidth: 200,
                field: 'maMuc0',
                flex: 1,
                suppressSizeToFit: true,
            },
            {
                headerName: 'Tên lưu vực sông',
                suppressSizeToFit: true,
                field: 'tenMuc',
                flex: 1,
            },
            // {
            //     headerName: 'Loại lưu vực sông',
            //     suppressSizeToFit: true,
            //     field: 'loai',
            //     flex: 1,
            //     cellRenderer: (row) => (
            //         <div>
            //             {!row?.data?.loai && <span>Liên Tỉnh</span>}
            //         </div>
            //     ),
            // },
            // {
            //     headerName: 'Lưu vực sông liên kết',
            //     suppressSizeToFit: true,
            //     field: 'loai',
            //     flex: 1,
            //     cellRenderer: (row) => (
            //         <div>
            //             {
            //                 lvsLienTinhs.find(lvs => lvs.maMuc === row?.data?.luuVucSongLienTinhId)?.tenMuc ?? "Không có"
            //             }
            //         </div>
            //     ),
            // },
            // {
            //     headerName: 'Thao tác',
            //     pinned: 'right',
            //     width: '110px',
            //     suppressSizeToFit: true,
            //     cellRenderer: (row) => (
            //         <RowActions
            //             row={row}
            //             onView={(row) => handleGetDetail(row?.data?.maMuc)}
            //             onDelete={(row) => handleDelete(row)}
            //             canWrite={action(row)}
            //             canView={action(row)}
            //         />
            //     ),
            // },

        ],
        [role, navigate, handleDelete, scope, lvsLienTinhs]
    );
    const [open, { setTrue, setFalse }] = useToggle();
    const [isEdit, setIsEdit] = React.useState(false);
    const {
        control,
        reset,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm({
        mode: 'onChange',
        defaultValues: {},
        resolver: yupResolver(schema),
    });

    const handleUpsert = async (data) => {
        if (!isEdit) {
            const exist = await handleCheck(watchMaLVS);
            if (exist) return;
        }
        try {
            // console.log(scope, tinhThanhId, role)
            const result = await new Api().upsertLVS({
                ...data,
                loai: scope === 'tw' ? 'lientinh' : data.loai,
                tinhThanhId: scope === 'tinh' ? tinhThanhId : undefined,
                tinhThanh: scope === 'tinh' ? tinhThanh : undefined,
                coQuanThucHienIds: data?.coQuanThucHienIds?.filter(Boolean),
            });
            if (result?.code === 200) {
                setPage(0);
                setDatas([]);
                getList({ datas: [], limit: limit, page: 0 });
                setFalse();
                ThongBao({
                    status: 'success',
                    message: `${!isEdit ? 'Thêm mới' : 'Cập nhật'
                        } lưu vực sông thành công!`,
                });
                dispatch(getLuuVucSongs());
                // dispatch(getLuuVucSongLienTinhs());
            }
        } catch (error) {
            console.log(error);
        }
    };


    const handleGetDetail = async (data) => {
        try {
            const result = await new Api().getLVS(data);
            if (result?.code === 200) {
                const data = result?.data?.[0];
                console.log(data);

                reset({
                    ...data,
                });
                setIsEdit(true);
                setTrue();
            }
        } catch (error) {
            console.log(error);
        }
    };


    const handleCheck = React.useCallback(
        async (data) => {
            try {
                const result = await new Api().getLVS(data);
                if (result?.code === 200 && !isEmpty(result?.data)) {
                    Swal.fire({
                        title: 'Mã lưu vực sông đã tồn tại',
                        text: 'Bạn có 2 lựa chọn',
                        icon: 'warning',
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonText: 'Cập nhật',
                        denyButtonText: 'Tiếp tục thêm mới',
                        cancelButtonText: 'Hủy',
                        allowOutsideClick: false,
                        allowEnterKey: false,
                        allowEscapeKey: false,
                    }).then(async (r) => {
                        if (r.isConfirmed) {
                            reset(result?.data?.[0]);
                            setIsEdit(true);
                        } else if (r.isDenied) {
                            setValue(
                                'maMuc',
                                result?.data?.[0]?.maMuc +
                                Math.ceil(Math.random() * 100)
                            );
                        } else if (r.isDismissed) {
                            setFalse();
                        }
                    });
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        },
        [reset, setValue, setFalse]
    );
    const loaiLVSNoiTinh = React.useMemo(
        () => [
            {
                title: 'Nội tỉnh',
                value: 'noitinh',
            },
            {
                title: 'Nội tỉnh độc lập',
                value: 'noitinhdoclap',
            },
        ],
        []
    );
    const watchMaLVS = watch('maMuc');
    const watchLoaiLVS = watch('loai');

    // React.useEffect(() => {
    //     if (isEdit || isEmpty(watchMaLVS)) return;
    //     handleCheck(watchMaLVS);
    // }, [watchMaLVS, handleCheck, isEdit]);

    React.useEffect(() => {
        if (!open) {
            reset({
                maMuc0: '',
                tenMuc: '',
                // coQuanThucHienIds: [],
            });
        }
        // eslint-disable-next-line
    }, [open]);

    const canCreate = React.useMemo(() => {
        if (role !== 'Admin') return false;
        if (role === 'Admin' && !['tw', 'tinh'].includes(scope)) return false;
        return true;
    }, [role, scope]);

    return (
        <div>
            <MyBreadCrumbs
                title={[
                    { name: 'Biểu mẫu', link: '/danh-sach-bieu-mau' },
                    { name: 'Lưu vực sông' },
                ]}
                renderItems={
                    canCreate ? (
                        <Box mr={2}>
                            {/* <MyButton
                                txt="Thêm mới"
                                onClick={() => {
                                    setTrue();
                                    setIsEdit(false);
                                }}
                            /> */}
                        </Box>
                    ) : null
                }
            />
            <MySearchBox
                name="tuKhoa"
                formikRef={formikRef}
                showState={false}
                initialValues={{ tuKhoa: undefined }}
                onSubmit={(values) => {
                    onFilter(values);
                }}
            >
                {({
                    handleSubmit,
                    setFieldValue,
                    handleChange,
                    values,
                    errors,
                }) => <></>}
            </MySearchBox>
            <Grid
                container
                justifyContent="space-between"
                alignItems="flex-end"
                ml={2}
                my={1}
            >
                <Typography variant="h7" fontWeight="bold">
                    DANH SÁCH LƯU VỰC SÔNG LIÊN TỈNH
                </Typography>
            </Grid>

            <MyTable2
                rows={rows || []}
                columns={columnLTs}
                limit={limit}
                count={count}
                page={page}
                loading={false}
                onBackPage={() => {
                    setPage(page - 1);
                }}
                onNextPage={onNextPage}
                hidePagination={true}
                onChangeLimit={onChangeLimit}
            />
            <Dialog
                open={open}
                onClose={setFalse}
                aria-labelledby="responsive-dialog-title"
                maxWidth="lg"
            >
                <DialogTitle
                    id="responsive-dialog-title"
                    textAlign={'center'}
                    alignItems={'center'}
                >
                    {isEdit ? 'Cập nhật ' : 'Thêm mới '} lưu vực sông
                </DialogTitle>
                <DialogContent
                    style={{
                        width: '800px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        paddingTop: 10,
                    }}
                >
                    {scope === 'tinh' && role === 'Admin' && (
                        <>
                            <Controller
                                name="loai"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Autocomplete
                                        value={
                                            loaiLVSNoiTinh.find(
                                                (i) => i.value === field.value
                                            ) ?? null
                                        }
                                        options={loaiLVSNoiTinh}
                                        getOptionLabel={(option) =>
                                            option.title
                                        }
                                        defaultValue={loaiLVSNoiTinh[0]}
                                        getOptionKey={(option) => option.value}
                                        onChange={(e, option) => {
                                            field.onChange(option?.value);
                                        }}
                                        size="small"
                                        renderInput={(paramss) => (
                                            <TextField
                                                {...paramss}
                                                placeholder="Chọn loại lưu vực sông nội tỉnh"
                                                label="Loại lưu vực sông nội tỉnh"
                                                error={Boolean(
                                                    fieldState.error
                                                )}
                                                helperText={
                                                    fieldState.error?.message
                                                }
                                                style={{
                                                    width: '100%',
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </>
                    )}
                    <Controller
                        name="maMuc0"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                inputProps={{
                                    // readOnly: !isEdit
                                    //     ? false
                                    //     : !watch('canEdit'),
                                    readOnly: role !== 'Admin'
                                }}
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                                id="outlined-error"
                                label="Mã lưu vực sông"
                                size="small"
                            />
                        )}
                    />
                    <Controller
                        name="tenMuc"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                inputProps={{
                                    readOnly: role !== 'Admin'
                                }}
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                                id="outlined-error"
                                label="Tên lưu vực sông"
                                size="small"
                            />
                        )}
                    />
                    {/* {scope === 'tw' && role === 'Admin' && (
                        <Controller
                            name="coQuanThucHienIds"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    value={
                                        CQTHs.filter((i) =>
                                            field.value?.includes(i?.maMuc)
                                        ) || null
                                    }
                                    getOptionLabel={(option) => option?.tenMuc}
                                    options={CQTHs}
                                    multiple
                                    onChange={(e, values) => {
                                        field.onChange(
                                            values?.map((i) => i?.maMuc)
                                        );
                                    }}
                                    size="small"
                                    renderInput={(paramss) => (
                                        <TextField
                                            {...paramss}
                                            placeholder="Chọn cơ quan thực hiện"
                                            label="Cơ quan thực hiện"
                                            style={{
                                                width: '100%',
                                            }}
                                        />
                                    )}
                                />
                            )}
                        />
                    )} */}
                    {scope === 'tinh' &&
                        role === 'Admin' &&
                        watchLoaiLVS === 'noitinh' && (
                            <>
                                <Controller
                                    name="luuVucSongLienTinhId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Autocomplete
                                            value={
                                                lvsLienTinhs.find(
                                                    (i) =>
                                                        i?.maMuc === field.value
                                                ) || null
                                            }
                                            getOptionLabel={(option) =>
                                                option?.tenMuc
                                            }
                                            getOptionKey={(option) =>
                                                option?.maMuc
                                            }
                                            options={lvsLienTinhs}
                                            onChange={(e, value) => {
                                                field.onChange(value?.maMuc);
                                            }}
                                            size="small"
                                            renderInput={(paramss) => (
                                                <TextField
                                                    {...paramss}
                                                    placeholder="Chọn lưu vực sông liên kết"
                                                    label="Lưu vực sông liên kết"
                                                    error={Boolean(
                                                        fieldState.error
                                                    )}
                                                    helperText={
                                                        fieldState.error
                                                            ?.message
                                                    }
                                                    style={{
                                                        width: '100%',
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </>
                        )}
                </DialogContent>
                <DialogActions>
                    <MyButton
                        txt="Đóng"
                        variant="outlined"
                        onClick={setFalse}
                    ></MyButton>
                    <MyButton
                        txt={isEdit ? 'Cập nhật' : 'Thêm mới'}
                        onClick={handleSubmit(
                            handleUpsert, (errors) => {
                            })}

                    ></MyButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export { List };

