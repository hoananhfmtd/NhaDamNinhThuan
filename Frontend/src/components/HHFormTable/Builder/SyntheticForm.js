import { Addchart } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Checkbox, Modal, Stack, Typography } from '@mui/material';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import Swal from 'sweetalert2';
import { MyButton, MySelect, ThongBao } from '../..';
import { showConfirmDialog } from '../../../helpers';
import { useToggle } from '../Hooks/useToggle';
import notFound from '/src/assets/images/not_found.png';
export function useSynthetic() {
    const [isSynthetic, setIsSynthetic] = React.useState(false);
    const [queryParams] = useSearchParams();

    const synthetic = queryParams.get('synthetic');

    React.useEffect(() => {
        if (synthetic != null) setIsSynthetic(true);
        else setIsSynthetic(false);
    }, [synthetic]);

    return {
        isSynthetic,
        setIsSynthetic,
    };
}

export const SyntheticFormItem = ({ label, value }) => {
    return (
        <div
            style={{
                display: 'flex',
                gap: 8,
                alignItems: 'start',
                fontSize: 14,
            }}
        >
            <span
                style={{
                    flexShrink: 0,
                }}
            >
                {label}
            </span>
            <span style={{ fontWeight: 500 }}>{value ?? 'Chưa có'}</span>
        </div>
    );
};

const defaultValues = {
    limit: undefined,
    anchor: 0,
    count: 0,
    tinhThanhIds: [],
    luuVucSongIds: [],
};

const SyntheticForm = ({
    renderItem = (item = {}) => <div></div>,
    onSelected = async () => { },
    fetch,
    initialValues = {},
    params = {},
}) => {
    console.log('params', params);
    const [open, { setFalse, setTrue }] = useToggle(false);
    const { scope } = useSelector((state) => state?.auth);
    const tinhThanhs =
        useSelector((state) => state.app?.DanhMucs?.tinhThanhs) || [];
    const luuVucSongs = useSelector((state) => state.app?.luuVucSongs) || [];
    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const { watch, getValues, setValue, reset } = useForm({
        defaultValues: defaultValues,
    });
    const watchValue = watch();

    const getFormSynthetic = React.useCallback(() => {
        setTrue();
    }, [setTrue]);

    const [selected, setSelected] = React.useState([]);
    const [data, setData] = React.useState([]);

    const fetchData = async (value) => {
        try {
            const response = await fetch({
                data: value
                    ? { ...value, ...params }
                    : { ...watchValue, ...params },
            });
            if (response?.code === 200 && response?.data) {
                if (response?.data) {
                    const records = response?.data?.records;
                    setData(records);

                    const lastRecord = records[records.length - 1];
                    setValue('anchor', lastRecord.id);
                    const _watch = value ?? watchValue;
                    if (_watch.count === 0) {
                        setValue('count', response?.data?.count);
                    }
                }
            }
        } catch (error) {
            // console.log(99999999 + error)
        }
    };

    const handleFilter = async () => {
        try {
            fetchData({
                ...watchValue,
                anchor: 0,
            });
            ThongBao({ status: 'success', message: 'Lấy dữ liệu thành công' });
        }
        catch (error) {
            ThongBao({ status: 'error', message: 'Lấy dữ liệu thất bại' });
        }
    };

    const handleLoadMore = async () => {
        await fetchData();
    };

    React.useEffect(() => {
        fetchData();

    }, []);

    React.useEffect(() => {
        if (!initialValues) return;
        try {
            const ids = initialValues?.bieuMau?.map((i) => i?.bieuMauId);
            setSelected(data?.filter((i) => ids?.includes(i?.id)));
        } catch (error) { }

    }, [data]);

    const handleSynthetic = async () => {
        try {
            // lấy ra các bản ghi đã chọn
            const dataSelect = data.filter((i) => selected.includes(i.id));
            await onSelected(dataSelect, watchValue);
            showConfirmDialog(
                'Hệ thống đã tải dữ liệu thành công. Bạn hãy ấn nút "Thêm Biểu Tổng Hợp" để lưu lại biểu mẫu tổng hợp này.',
                'Thông báo',
                () => { },
                {
                    showCancelButton: false
                }
            );
        } catch (error) {
            console.log(error)
        } finally {
            setFalse();
        }
    };

    const handleUnSelected = async () => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo',
            text: 'Bạn có chắc chắn muốn xóa tất cả các lựa chọn trước đó?',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        });
        if (result.isConfirmed) {
            setSelected([]);
        }
    };

    return (
        <>
            <MyButton
                txt="Tổng hợp"
                icon={<Addchart />}
                onClick={getFormSynthetic}
            />
            <Modal
                open={open}
                onClose={setFalse}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '4%',
                    marginBottom: '4%',
                }}
            >
                <Box
                    sx={{
                        width: '80vw',
                        background: '#fff',
                        borderRadius: '6px',
                    }}
                >
                    <MyButton
                        icon={<CloseIcon />}
                        onClick={setFalse}
                        txt="Đóng"
                        style={{
                            float: 'right',
                            background: '#fff',
                            color: '#000',
                        }}
                    />
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mt: 3,
                        }}
                    >
                        Danh sách tổng hợp dữ liệu
                    </Typography>
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                            ml: 1,
                        }}
                    >
                        {scope !== 'tinh' && (
                            <MySelect
                                options={tinhThanhs}
                                width="200px"
                                value={tinhThanhs.filter((item) =>
                                    watchValue?.tinhThanhIds?.includes(item.ma)
                                )}
                                label="Tỉnh thành"
                                multiple
                                name="ten"
                                onChange={(e, value) => {
                                    reset({
                                        ...getValues(),
                                        tinhThanhIds: value?.map((i) => i?.ma),
                                        anchor: 0,
                                    });
                                }}
                                placeholder="Chọn tỉnh/thành phố"
                            />
                        )}
                        <MySelect
                            multiple
                            options={luuVucSongs}
                            width="200px"
                            value={luuVucSongs.filter((item) =>
                                watchValue?.luuVucSongIds?.includes(item.maMuc)
                            )}
                            label="Lưu vực sông"
                            name="tenMuc"
                            onChange={(e, value) => {
                                reset({
                                    ...getValues(),
                                    luuVucSongIds: value?.map((i) => i?.maMuc),
                                    anchor: 0,
                                });
                            }}
                            placeholder="Chọn Lưu vực sông"
                        />
                        {scope === 'tw' && (
                            <MySelect
                                options={CQTHs}
                                width="300px"
                                value={CQTHs.filter((item) =>
                                    watchValue?.coQuanThucHienIds?.includes(
                                        item.maMuc
                                    )
                                )}
                                label="Cơ quan thực hiện"
                                multiple
                                name="tenMuc"
                                onChange={(e, value) => {
                                    reset({
                                        ...getValues(),
                                        coQuanThucHienIds: value?.map(
                                            (i) => i?.maMuc
                                        ),
                                        anchor: 0,
                                    });
                                }}
                                placeholder="Chọn cơ quan thực hiện"
                            />
                        )}
                    </Stack>
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            float: 'right',
                            mr: 2,
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <MyButton
                            icon={<GetAppIcon />}
                            txt="Lấy dữ liệu "
                            onClick={handleFilter}
                            title={'Lấy dữ liệu'}
                            variant="outlined"
                            style={{
                                marginTop: '20px',
                            }}
                        />
                        {data.length > 0 && selected?.length > 0 && (
                            <MyButton
                                icon={<SyncIcon />}
                                // loading={
                                //   loadingFilter
                                // }
                                // txt={
                                //   loadingFilter
                                //     ? `Đang tổng hợp... (${Math.round(
                                //       progress
                                //     )}%)`
                                //     : 'Tổng hợp'
                                // }
                                txt="Tổng hợp"
                                onClick={() => {
                                    handleSynthetic();
                                }}

                                style={{
                                    marginTop: '20px',
                                }}
                            />
                        )}
                    </Stack>
                    <Stack>
                        <p style={{ fontWeight: 'bold', margin: '0 10px 0 10px', fontSize: '12px' }}>Tiêu chí tổng hợp :</p>
                        <div
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                height: '60px',
                                textAlign:
                                    'left',
                                ml: 1,
                                fontSize: 12,
                                overflow: 'auto',
                                margin: '0 10px 0 10px',
                            }}
                        >
                            {`${watchValue?.tinhThanhIds?.length > 0
                                ? `${watchValue?.tinhThanhIds
                                    ?.map(
                                        (i) =>
                                            tinhThanhs.find(
                                                (j) => j.ma === i
                                            )?.ten
                                    )
                                    .join(', ')}`
                                : ''
                                } ${watchValue?.luuVucSongIds?.length > 0
                                    ? `, ${watchValue?.luuVucSongIds
                                        ?.map(
                                            (i) =>
                                                luuVucSongs.find(
                                                    (j) => j.maMuc === i
                                                )?.tenMuc
                                        )
                                        .join(', ')}`
                                    : ''
                                } ${watchValue?.coQuanThucHienIds?.length > 0
                                    ? `, ${watchValue?.coQuanThucHienIds
                                        ?.map(
                                            (i) =>
                                                CQTHs.find(
                                                    (j) => j.maMuc === i
                                                )?.tenMuc
                                        )
                                        .join(', ')}`
                                    : ''
                                }`}

                        </div>
                    </Stack>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'calc(100% - 250px)',
                            padding: '10px',
                        }}
                    >
                        {data.length > 0 ? (
                            <>
                                <p
                                    style={{
                                        fontSize: '12px',
                                        marginTop: '10px',
                                    }}
                                >
                                    Số công trình đã chọn: {selected.length}/{data.length}
                                </p>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 'calc(100% - 20px)',
                                    }}
                                >
                                    <AllTableRow
                                        {...{
                                            data,
                                            setSelected,
                                            selected,
                                        }} />
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box
                                    style={{ marginLeft: '5%' }}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    height="100%"
                                >
                                    <img
                                        src={notFound}
                                        alt="Không có dữ liệu"
                                        style={{
                                            maxWidth: '300px',
                                            marginBottom: '20px',
                                        }}
                                    />
                                    <Typography
                                        textAlign="center"
                                        variant="h6"
                                        color="textSecondary"
                                    >
                                        Không có dữ liệu!
                                    </Typography>
                                </Box>
                            </>
                        )}
                        {/* <MyButton
                            txt="Xem thêm"
                            onClick={handleLoadMore}
                            
                        /> */}
                    </Box>
                </Box>
            </Modal>
        </>
    );
};
const AllTableRow = React.memo(
    ({ data, CQTHs, setIdsData, setSelected, selected }) => {
        const idsSet = useMemo(() => new Set(selected), [selected]);

        const handleCheckboxChange = useCallback(
            (item) => (e) => {
                const isChecked = e.target.checked;

                setSelected((prevIds) => {
                    const updatedIds = new Set(prevIds);
                    if (isChecked) {
                        updatedIds.add(item.id);
                    } else {
                        updatedIds.delete(item.id);
                    }
                    return Array.from(updatedIds);
                });

                // setIdsData logic đã bị bỏ qua
            },
            [setSelected]
        );

        const RowRenderer = ({ index, style }) => {
            const item = data[index];
            return (
                <div className="row-tonghop" style={style} key={item.id}>
                    <div className="col-12-td" style={{ width: '50px' }}>
                        <Checkbox
                            size='small'
                            checked={idsSet.has(item.id)}
                            onChange={handleCheckboxChange(item)}
                        />
                    </div>
                    <RowDataBangTongHop item={item} index={index} CQTHs={CQTHs} />
                </div>
            );
        };

        return (
            <div className="table-tonghop">
                <div className="thead-tonghop">
                    <div className="col-12-th" style={{ width: '50px', height: '50px' }}>
                        <Checkbox
                            size='small'
                            checked={selected.length === data?.length}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelected(data.map((item) => item.id)); // Chỉ set các ID
                                } else {
                                    setSelected([]);
                                }
                            }}
                        />
                    </div>
                    <div className="col-12-th">Cơ quan thực hiện</div>
                    <div className="col-12-th">Lưu vực sông</div>
                    <div className="col-12-th">Người lập biểu</div>
                    <div className="col-12-th">Ngày lập biểu</div>
                    <div className="col-12-th" style={{ marginRight: data?.length > 7 ? '11px' : '1.2px' }}>Nơi lập biểu</div>
                </div>
                <div className='tbody-tonghop' >
                    <List
                        height={350}
                        itemCount={data?.length}
                        itemSize={50}
                        width={'100%'}
                        style={{ overflow: 'auto' }}
                    >
                        {RowRenderer}
                    </List>
                </div>
            </div>
        );
    }
);

const RowDataBangTongHop = React.memo(({ item, index, CQTHs }) => {
    return (
        <>
            <div className="col-12-td" style={{ wordBreak: 'break-all' }}>{item?.coQuanThucHien}</div>
            <div className="col-12-td" style={{ wordBreak: 'break-all' }} >{item?.luuVucSong}</div>
            <div className="col-12-td" style={{ wordBreak: 'break-all' }}>{item?.nguoiLapBieu}</div>
            <td className="col-12-td" style={{ wordBreak: 'break-all' }}>
                {moment(item?.ngayLapBieu).format('DD/MM/YYYY')}
            </td>
            <div className="col-12-td" style={{ wordBreak: 'break-all' }}>{item?.noiLapBieu}</div>
        </>
    );
});

export default SyntheticForm;
