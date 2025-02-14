import React, { useEffect } from 'react'
import { MyBreadCrumbs, MyTable2, ThongBao } from '../components'
import { Link } from 'react-router-dom'
import Api from '../api'
import { Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'
import { CanListDetailOfReport } from '../helpers';

const ChiTieuSoLuongNuocCT = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([])
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

    return (
        <>
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng nguồn nước theo tỉnh/thành phố' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Tỉnh', field: 'tinhThanhId', width: '90px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Tỉnh', field: 'tinhThanh', width: '180px', suppressSizeToFit: true },

                    {
                        headerName: 'Số lượng nước mặt',
                        field: 'soLuongNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongNuocMat > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return <Link to={`/bieu-mau-3?tinhThanhId=${params.data.tinhThanhId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params?.value || 0}
                                    </Tooltip>
                                </Link>
                            } else {
                                return <span>{params.value || 0}</span>
                            }
                        },
                    },
                    {
                        headerName: 'Số lượng nước ngầm',
                        field: 'soLuongNuocNgam',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {

                            if (params.data.soLuongNuocNgam > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return <Link to={`/bieu-mau-4?tinhThanhId=${params.data.tinhThanhId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params?.value || 0}
                                    </Tooltip>
                                </Link>
                            } else {
                                return <span>{params.value || 0}</span>
                            }
                        },
                    },
                ]}
            />
        </>
    )
}

const ChiTieuSoLuongNuocLVS = () => {
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
                    console.log('res', res.data?.chiTieus)
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
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng nguồn nước theo lưu vực sông' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Lưu Vực', field: 'luuVucSongId', width: '180px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Lưu vực', field: 'luuVucSong', width: '300px', suppressSizeToFit: true },
                    {
                        headerName: 'Lượng nước mặt ', field: 'soLuongNuocMat', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongNuocMat > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
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
                        headerName: 'Lượng nước ngầm ', field: 'soLuongNuocNgam', width: 'auto', flex: 1, suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongNuocNgam > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/bieu-mau-4?luuVucSongId=${params.data.luuVucSongId}`} >
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

export { ChiTieuSoLuongNuocCT, ChiTieuSoLuongNuocLVS };