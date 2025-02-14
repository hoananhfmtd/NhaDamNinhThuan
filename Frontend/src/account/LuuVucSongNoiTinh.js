import { yupResolver } from '@hookform/resolvers/yup';
import { Add } from '@mui/icons-material';
import { Autocomplete, Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { isEmpty } from 'lodash';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import Api, { API_URI } from '../api';
import { MyBreadCrumbs, MyButton, MySearchBox, MySelect, MyTable2, RowActions, ThongBao } from '../components';
import { useToggle } from '../components/HHFormTable/Hooks/useToggle';
import { getLuuVucSongLienTinhs, getLuuVucSongs } from '../store';


const schema = yup.object().shape({
    loai: yup.string(),
    maMuc0: yup.string().matches('^[a-zA-Z0-9]+$', 'Định dạng mã lưu vực sông chưa đúng').min(2, 'Mã lưu vực sông tối thiểu 4 ký tự').max(30, 'Mã lưu vực sông tối đa 30 ký tự').required('Mã lưu vực sông không được để trống'),
    tenMuc: yup.string().required('Tên lưu vực sông không được để trống'),
    luuVucSongLienTinhId: yup.string().when('loai', (loai, schema) => {
        if (loai.includes('noitinh')) {
            return schema.required('Lưu vực sông liên kết không được để trống');
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
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const count = datas.length > 0 ? datas[0].count : 0;
    const formikRef = React.useRef(null);
    const navigate = useNavigate();
    const { role, scope, tinhThanh, tinhThanhId } = useSelector((state) => state.auth);
    const lvsLienTinhs = useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs || []);
    const getList = React.useCallback(async ({ maTinhs = '01', datas, limit, page, signal }) => {
        let anchor = 0;
        if (datas?.length > 0) {
            const lastdata = datas[datas.length - 1];
            anchor = lastdata.anchor;
            if (!lastdata.anchor || lastdata.anchor == '' || !lastdata.records || lastdata.records?.length == 0) {
                setPage(page);
                return;
            }
            if (page * limit >= datas[0].count) {
                return;
            }
        }
        const values = formikRef.current.values;
        const response = await new Api().getAllLVS({
            tuKhoa: values?.tuKhoa === '' ? undefined : values?.tuKhoa,
            // phanTrang: false,
            tinhThanhId: scope !== 'tinh' ? maTinhs : tinhThanhId,
            limit: limit,
            page: page,
            anchor: anchor,
            signal,
        });
        if (response?.code === 200 && response?.data) {
            setDatas([...datas, response?.data]);
            setPage(page);
            setLimit(limit);
            const params = { ...values };
            Object.keys(params).forEach((key) => !params[key] && delete params[key]);
        } else {
            ThongBao({ code: response?.code });
        }
        // TODO handle error
    }, []);

    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const values = formikRef?.current.values;
        getList({ ...values, maTinhs: values?.tinhThanhId, datas, limit, page, signal });
        // getList({ datas, limit, page, signal });
        return () => controller.abort();
    }, []); // Gọi lại khi `page` thay đổi
    const onNextPage = () => {
        const values = formikRef?.current.values;
        if ((page + 1) * limit >= count) {
            return;
        }
        getList({ maTinhs: values?.tinhThanhId, datas, limit, page: page + 1 });
    };
    const onChangeLimit = (event) => {
        const values = formikRef?.current.values;
        let v = parseInt(event.target.value);
        if (v == 0) {
            v = 10;
        }
        if (v == limit) {
            return;
        }
        getList({ maTinhs: values?.tinhThanhId, datas: [], limit: v, page: 0 });
    };

    const onFilter = (values) => {
        // setPage(0);
        // setDatas([]);
        getList({ maTinhs: values?.tinhThanhId, datas: [], limit: limit, page: 0, tuKhoa: values.tuKhoa?.trim()?.toLowerCase() });
    };

    const handleDelete = React.useCallback(
        async (row) => {
            if (!row?.data?.id) {
                return;
            }
            try {
                const response = await new Api().deleteLVS(row.data.id);
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
        if (row?.data?.loai === 'lientinh' && role === 'Admin' && scope === 'tw') return true;
        if ((row?.data?.loai === 'noitinh' || row?.data?.loai === 'noitinhdoclap') && role === 'Admin' && scope === 'tinh') return true;
        return false;
    };
    const rowstart = page * limit + 1;
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
            {
                headerName: 'Lưu vực sông liên kết',
                suppressSizeToFit: true,
                field: 'loai',
                flex: 1,
                cellRenderer: (row) => <div>{lvsLienTinhs.find((lvs) => lvs.maMuc === row?.data?.luuVucSongLienTinhId)?.tenMuc ?? 'Không có'}</div>,
            },
            {
                headerName: 'Người tạo',
                suppressSizeToFit: true,
                field: 'createdBy',
                flex: 1,
                cellRenderer: (row) => <div>{lvsLienTinhs.find((lvs) => lvs.maMuc === row?.data?.luuVucSongLienTinhId)?.tenMuc ?? 'Không có'}</div>,
            },
            {
                headerName: 'Thao tác',
                pinned: 'right',
                width: '110px',
                suppressSizeToFit: true,
                cellRenderer: (row) => <RowActions row={row} onView={(row) => handleGetDetail(row?.data?.id)} onDelete={(row) => handleDelete(row)} canWrite={action(row)} canView={action(row)} />,
            },
        ],
        [role, navigate, handleDelete, scope, rowstart]
    );
    const columnLTs = React.useMemo(
        () => [
            {
                headerName: '#',
                field: 'stt',
                width: '80px',
                suppressSizeToFit: true,
                pinned: 'left',
                cellRenderer: (row) => row.rowIndex + rowstart,
            },
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
            {
                headerName: 'Lưu vực sông liên tỉnh',
                suppressSizeToFit: true,
                field: 'loai',
                flex: 1,
                cellRenderer: (row) => <div>{lvsLienTinhs.find((lvs) => lvs.maMuc === row?.data?.luuVucSongLienTinhId)?.tenMuc ?? 'Không có'}</div>,
            },
        ],
        [role, navigate, handleDelete, scope, rowstart]
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
    const accessoken = localStorage.getItem('access-token');
    const handleUpsert = async (data) => {
        // if (!isEdit) {
        //     const exist = await handleCheck(watchMaLVS);
        //     if (exist) return;
        // }
        try {
            // console.log(scope, tinhThanhId, role)
            // const result = await new Api().upsertLVS({
            const _data = {
                ...data,
                loai: scope === 'tw' ? 'lientinh' : data.loai,
                tinhThanhId: scope === 'tinh' ? tinhThanhId : undefined,
                tinhThanh: scope === 'tinh' ? tinhThanh : undefined,
                // coQuanThucHienIds: data?.coQuanThucHienIds?.filter(Boolean),
            };
            fetch(`${API_URI}luuvucsongs-upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessoken}`,
                },
                body: JSON.stringify(_data),
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
                    if (data === 'ten_datontai') {
                        ThongBao({
                            status: 'error',
                            message: 'Tên sông đã tồn tại ',
                        });
                        // setErrosBE(
                        //     ''
                        // );
                    } else {
                        setPage(0);
                        setDatas([]);
                        getList({ datas: [], limit: limit, page: 0 });
                        setFalse();
                        ThongBao({
                            status: 'success',
                            message: `${!isEdit ? 'Thêm mới' : 'Cập nhật'} lưu vực sông thành công!`,
                        });
                        dispatch(getLuuVucSongs());
                        // dispatch(getLuuVucSongLienTinhs());
                    }
                })
                .catch((err) => {
                    ThongBao({
                        status: 'error',
                        message: 'Có lỗi xảy ra: Xem chi tiết tại log!',
                    });
                });
        } catch (error) {
            console.log(error);
        }
    };

    const handleGetDetail = async (data) => {
        try {
            const result = await new Api().getLVS(data);
            if (result?.code === 200) {
                const data = result?.data;
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
                            setValue('maMuc0', result?.data?.[0]?.maMuc0 + Math.ceil(Math.random() * 100));
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
    const watchMaLVS = watch('maMuc0');
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
        if (role === 'Admin' && scope === 'tinh') return true;
        // if (role === 'Admin' && !['tw', 'tinh'].includes(scope)) return false;
        return false;
    }, [role, scope]);

    return (
        <div>
            <MyBreadCrumbs
                title={[{ name: 'Biểu mẫu', link: '/danh-sach-bieu-mau' }, { name: 'Lưu vực sông' }]}
                renderItems={
                    canCreate ? (
                        <Box mr={2}>
                            <MyButton
                                icon={<Add />}
                                txt="Thêm mới lưu vực sông"
                                height="45px"
                                onClick={() => {
                                    setTrue();
                                    setIsEdit(false);
                                }}
                                hidden={!canCreate}
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
                {({ setFieldValue, values }) => (
                    <>
                        {scope !== 'tinh' && (
                            <div container justifyContent="space-between" alignItems="flex-end" my={1}>
                                <MySelect
                                    options={tinhThanh0s}
                                    width="250px"
                                    label="Tỉnh thành"
                                    value={values.tinhThanh || 'Thành phố Hà Nội'}
                                    name="ten"
                                    onChange={(e, value) => {
                                        setFieldValue('tinhThanh', value?.ten);
                                        setFieldValue('tinhThanhId', value?.ma);
                                        getList({ maTinhs: value?.ma, datas: [], limit: 10, page: 0 });
                                    }}
                                    placeholder="Chọn tỉnh/thành phố"
                                />
                            </div>
                        )}
                    </>
                )}
            </MySearchBox>
            <Grid
                container
                justifyContent="space-between"
                alignItems="flex-end"
                ml={2}
                my={1}
            >
                <Typography variant="h7" fontWeight="bold">
                    DANH SÁCH CÁC LƯU VỰC SÔNG NỘI TỈNH

                </Typography>
            </Grid>
            <MyTable2
                rows={rows || []}
                columns={scope === 'tinh' ? columns : columnLTs}
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
            <Dialog open={open} onClose={setFalse} aria-labelledby="responsive-dialog-title" maxWidth="lg">
                <DialogTitle id="responsive-dialog-title" textAlign={'center'} alignItems={'center'}>
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
                                        value={loaiLVSNoiTinh.find((i) => i.value === field.value) ?? null}
                                        options={loaiLVSNoiTinh}
                                        getOptionLabel={(option) => option.title}
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
                                                error={Boolean(fieldState.error)}
                                                helperText={fieldState.error?.message}
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
                                    readOnly: role !== 'Admin',
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
                                    readOnly: role !== 'Admin',
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
                    {scope === 'tinh' && role === 'Admin' && watchLoaiLVS === 'noitinh' && (
                        <>
                            <Controller
                                name="luuVucSongLienTinhId"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Autocomplete
                                        value={lvsLienTinhs.find((i) => i?.maMuc === field.value) || null}
                                        getOptionLabel={(option) => option?.tenMuc}
                                        getOptionKey={(option) => option?.maMuc}
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
                                                error={Boolean(fieldState.error)}
                                                helperText={fieldState.error?.message}
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
                    <MyButton txt="Đóng" variant="outlined" onClick={setFalse}></MyButton>
                    <MyButton txt={isEdit ? 'Cập nhật' : 'Thêm mới'} onClick={handleSubmit(handleUpsert, (errors) => { })}></MyButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export { List };

