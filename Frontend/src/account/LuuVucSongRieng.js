import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    // loai: yup.string(),
    // maMuc: yup
    //     .string()
    //     .matches('^[a-zA-Z0-9]+$', 'Định dạng mã lưu vực sông chưa đúng')
    //     .min(2, 'Mã lưu vực sông tối thiểu 4 ký tự')
    //     .max(30, 'Mã lưu vực sông tối đa 30 ký tự')
    //     .required('Mã lưu vực sông không được để trống'),
    tenMuc: yup.string().required('Tên lưu vực sông không được để trống'),
    // luuVucSongLienTinhMa: yup.string().when('loai', (loai, schema) => {
    //     if (loai.includes('noitinh')) {
    //         return schema.required("Lưu vực sông liên kết không được để trống")
    //     }
    // }),
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
    const { role, scope, tinhThanh, tinhThanhId, coQuanThucHienId, userName } = useSelector(
        (state) => state.auth
    );
    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const lvsLienTinhs = useSelector(
        (state) => state.app?.luuVucSongLienTinhs || []
    );

    const getList = React.useCallback(async ({ datas, limit, page, signal }) => {
        let anchor = 0;
        if (datas?.length > 0) {
            const lastdata = datas[datas.length - 1];
            anchor = lastdata.anchor;
            if (
                !lastdata.anchor ||
                lastdata.anchor === 0 ||
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
        const response = await new Api().getAllLVSRieng({
            tuKhoa: values?.tuKhoa === '' ? undefined : values?.tuKhoa,
            limit: limit,
            scope,
            tinhThanhId,
            coQuanThucHienId,
            anchor: anchor.toString(),
            signal
        });
        if (response?.code === 200 && response?.data) {
            console.log(response.data);
            setDatas([...datas, response?.data]);
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
                const response = await new Api().deleteLVSRieng(row.data.maMuc);
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
        return role === "Admin" && row?.data?.createdBy === userName;
    };

    const columns = React.useMemo(
        () => [
            {
                headerName: 'Mã lưu vực sông',
                minWidth: 200,
                field: 'maMuc',
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
            //             {row?.data?.loai === 'lientinh' && <span>Liên Tỉnh</span>}
            //             {row?.data?.loai === 'noitinh' && <span>Nội Tỉnh</span>}
            //             {row?.data?.loai === 'noitinhdoclap' && <span>Nội Tỉnh Độc Lập</span>}
            //         </div>
            //     ),
            // },
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
                            lvsLienTinhs.find(lvs => lvs.maMuc === row?.data?.luuVucSongLienTinhMa)?.tenMuc ?? "Không có"
                        }
                    </div>
                ),
            },
            // Chỉ hiện thao tác với tài khoản admin
            ...role === 'Admin' ? [{
                headerName: 'Thao tác',
                pinned: 'right',
                width: '150px',
                suppressSizeToFit: true,
                cellRenderer: (row) => (
                    <RowActions
                        row={row}
                        onView={(row) => handleGetDetail(row?.data?.maMuc, 'view')}
                        onEdit={(row) => handleGetDetail(row?.data?.maMuc, 'edit')}
                        onDelete={(row) => handleDelete(row)}
                        canWrite={action(row)}
                        canView={action(row)}
                    />
                ),
            }] : []
        ],
        [role, navigate, handleDelete, scope, lvsLienTinhs]
    );
    const [open, { setTrue, setFalse }] = useToggle();
    const [status, setStatus] = useState(''); // new, view, edit
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
        try {
            const result = await new Api().upsertLVSRieng({
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
                    message: `${status === 'new' ? 'Thêm mới' : 'Cập nhật'} lưu vực sông thành công !`,
                });
                dispatch(getLuuVucSongs());
                // dispatch(getLuuVucSongLienTinhs());
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleGetDetail = async (data, isEdit) => {
        try {
            const result = await new Api().getLVSRieng(data);
            if (result?.code === 200) {
                const data = result?.data;
                reset({
                    ...data,
                });
                setStatus(isEdit)
                setTrue();
            }
        } catch (error) {
            console.log(error);
        }
    };

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
    // const watchMaLVS = watch('maMuc');
    // const watchLoaiLVS = watch('loai');

    React.useEffect(() => {
        if (!open) {
            reset({
                // maMuc: '',
                tenMuc: '',
                // coQuanThucHienIds: [],
            });
        }
        // eslint-disable-next-line
    }, [open]);

    const canCreate = React.useMemo(() => {
        if (role !== 'Admin') return false;
        if (role === 'Admin' && !['tw', 'tinh', 'dvtt'].includes(scope)) return false;
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
                            <MyButton
                                txt="Thêm mới"
                                onClick={() => {
                                    setTrue();
                                    setStatus('new');
                                }}
                            />
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
            <div
                style={{
                    backgroundColor: '#F2F4F6',
                    padding: '20px 0px 20px 10px',
                    fontWeight: '500',
                }}
            >
                <Typography
                    variant="h7"
                    fontWeight="bold"
                    lineHeight="1.5"
                >
                    Danh Mục Lưu Vực Sông
                </Typography>
            </div>
            <MyTable2
                rows={rows || []}
                columns={columns}
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
                    {status === 'new'
                        ? 'Thêm mới '
                        : status === 'view'
                            ? 'Chi tiết'
                            : 'Cập nhật'} lưu vực sông
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
                    {/* {scope === 'tinh' && role === 'Admin' && (
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
                    )} */}
                    {/* <Controller
                        name="maMuc"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                inputProps={{
                                    readOnly: !isEdit
                                        ? false
                                        : !watch('canEdit'),
                                }}
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                                id="outlined-error"
                                label="Mã lưu vực sông"
                                size="small"
                            />
                        )}
                    /> */}
                    <Controller
                        name="tenMuc"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                inputProps={{
                                    readOnly: status === 'view'
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
                    {/* {scope === 'tinh' &&
                        role === 'Admin' &&
                        watchLoaiLVS === 'noitinh' && (
                            <>
                                <Controller
                                    name="luuVucSongLienTinhMa"
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
                        )} */}
                </DialogContent>
                <DialogActions>
                    <MyButton
                        txt="Đóng"
                        variant="outlined"
                        onClick={setFalse}
                    ></MyButton>
                    {status !== 'view' &&
                        < MyButton
                            txt={status === 'edit' ? 'Cập nhật' : 'Thêm mới'}
                            onClick={handleSubmit(handleUpsert, (errors) => {
                                console.log('Error', errors);
                            })}
                        />}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export { List };

