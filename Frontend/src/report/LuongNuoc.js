import React, { useEffect } from 'react'
import { MyBreadCrumbs, MyButton, MyTable2, ThongBao } from '../components'
import { Link } from 'react-router-dom'
import Api from '../api'

import { useSelector } from 'react-redux'
import { Box, Modal, Tooltip, Typography } from '@mui/material'
import HQTable from '../components/HQTable/HQTable'
import CloseIcon from '@mui/icons-material/Close';
import { CanListDetailOfReport } from '../helpers';

const ChiTieuLuongNuocCT = () => {
    const [dataTable, setDataTable] = React.useState([])
    const user = useSelector((state) => state?.auth);
    const [id, setId] = React.useState(null)
    const [tinhThanhs, setTinhThanhs] = React.useState(null)
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true) };
    const handleClose = () => { setOpen(false); setId(null); setTinhThanhs(null) };
    const [dataModal, setDataModal] = React.useState([])

    const payload = { groupBy: 'tinh' }

    const fetchData = async () => {
        await new Api()
            .listChiTieuKiemKe({ data: payload })
            .then((res) => {
                if (res.code === 200) {
                    setDataTable(res.data?.chiTieus);
                } else {
                    ThongBao({ code: res.code });
                }

            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi sảy ra, xem tại log!' });
            });
    }

    useEffect(() => {
        fetchData()
    }, [])


    const [count, setCount] = React.useState(0)
    const payloadFilter = {
        tuKhoa: "",
        tinhThanhId: id,
        tinhThanh: tinhThanhs,
        limit: 10,
        anchor: 0
    }

    const getList = async (payload) => {
        new Api().listLuongNuoc({
            data: payload
        })
            .then((res) => {
                if (res.code === 200) {
                    setDataModal(res.data?.records)

                    setCount(res.data?.count)
                    console.log('res.data?.records', res.data?.records)
                    handleOpen()
                } else {
                    ThongBao({ code: res.code });
                }
            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi sảy ra, xem tại log!' });
            });
    }

    useEffect(() => {
        if (id) {
            getList(payloadFilter)
        }
    }, [id])

    useEffect(() => {
        if (count > 0 && count > 10) {
            getList({ ...payloadFilter, limit: count });
        }
    }, [count]);

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableBackdropClick
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '70px',
                }}
            >
                <Box
                    sx={{
                        width: '60vw',
                        height: '40vh',
                        background: '#fff',
                        borderRadius: '6px',
                    }}
                >
                    <MyButton
                        icon={<CloseIcon />}
                        onClick={handleClose}
                        txt={'Đóng'}
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
                        sx={{ textAlign: 'center', mt: 3 }}
                    >
                        {
                            tinhThanhs ? `Danh sách biểu mẫu tổng hợp lượng nước mặt tại ${tinhThanhs} - ${id}` : `Danh sách biểu mẫu tổng hợp lượng nước mặt`
                        }
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        height: 'calc(100% - 50px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '10px',
                    }}>
                        <HQTable
                            colDef={
                                <colgroup>
                                    <col style={{ textAlign: 'center' }} />
                                    <col />
                                    <col />
                                    <col />
                                    <col />
                                </colgroup>
                            }
                            header={
                                <>
                                    <tr>
                                        <th rowSpan={2}>Mã tỉnh</th>
                                        <th rowSpan={2}>Cơ quan thực hiện</th>
                                        <th rowSpan={2}>Biểu mẫu</th>
                                        <th rowSpan={2}>Biểu mẫu ID</th>
                                        <th rowSpan={2}>Lượng nước</th>
                                    </tr>
                                </>
                            }
                            body={dataModal?.map((item, index) => {
                                return (
                                    <tr
                                        key={index}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <td style={{ textAlign: 'left' }}>
                                            {item.tinhThanhId}
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            {item.coQuanThucHien}
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            {`${item.tenBieuMau} `}
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            {`${item.id} `}
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            {item.luongNuoc}
                                        </td>
                                    </tr>
                                );
                            })}
                        />
                    </Box>
                </Box>
            </Modal>

            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu lượng nước theo tỉnh/thành phố' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Tỉnh', field: 'tinhThanhId', width: '90px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Tỉnh', field: 'tinhThanh', width: '180px', suppressSizeToFit: true },
                    {
                        headerName: 'Lượng nước mặt ', field: 'luongNuocMat', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocMat > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return (
                                    <Link onClick={() => {
                                        setId(params.data.tinhThanhId)
                                        setTinhThanhs(params.data.tinhThanh)
                                    }}>
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                )
                            } else {
                                return <span>{params.value || 0}</span>
                            }
                        }
                    },
                    {
                        headerName: 'Lượng nước dưới đất ', field: 'luongNuocNgam', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocNgam > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return (
                                    <Link onClick={() => {
                                        setId(params.data.tinhThanhId)
                                        setTinhThanhs(params.data.tinhThanh)
                                    }}>
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                )
                            } else {
                                return <span>{params.value || 0}</span>
                            }
                        }
                    },
                    {
                        headerName: 'Lượng nước mưa', field: 'luongNuocMua', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocMua > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return (
                                    <Link onClick={() => {
                                        setId(params.data.tinhThanhId)
                                        setTinhThanhs(params.data.tinhThanh)
                                    }}>
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                )
                            } else {
                                return <span>{params.value || 0}</span>
                            }

                        }
                    },
                ]}
            />

        </>
    )
}

const ChiTieuLuongNuocLVS = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([])
    const payload = {
        groupBy: 'lvs'
    }


    const listLVS = useSelector((state) => state?.app);
    const LVSarr = listLVS?.DanhMucs?.luuVucSongs || []
    const LVS = LVSarr.map((item) => item.maMuc) || []

    const fetchData = async () => {
        await new Api()
            .listChiTieuKiemKe({ data: payload })
            .then((res) => {
                if (res.code === 200) {
                    setDataTable(res.data?.chiTieus);

                } else {
                    ThongBao({ code: res.code });
                }
            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi sảy ra, xem tại log!' });
            });
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu lượng nước theo lưu vực sông' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã lưu vực', field: 'luuVucSongId', width: '180px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên lưu vực', field: 'luuVucSong', width: '300px', suppressSizeToFit: true },
                    {
                        headerName: 'Lượng nước mặt ', field: 'luongNuocMat', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocMat > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/bieu-mau-3?luuVucSongId=${params.data.luuVucSongId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params.value || 0}
                                    </Tooltip>
                                </Link>
                            } else {
                                return <span>{params.value || 0}</span>
                            }

                        }
                    },
                    {
                        headerName: 'Lượng nước dưới đất ', field: 'luongNuocNgam', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocNgam > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/bieu-mau-11?luuVucSongId=${params.data.luuVucSongId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params.value || 0}
                                    </Tooltip>
                                </Link>
                            } else {
                                return <span>{params.value || 0}</span>
                            }

                        }
                    },
                    {
                        headerName: 'Lượng nước mưa ', field: 'luongNuocMua', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.luongNuocMua > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/bieu-mau-25?luuVucSongId=${params.data.luuVucSongId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params.value || 0}
                                    </Tooltip>
                                </Link>
                            } else {
                                return <span>{params.value || 0}</span>
                            }

                        }
                    },

                ]}
            />
        </>
    )
}

export { ChiTieuLuongNuocCT, ChiTieuLuongNuocLVS };
