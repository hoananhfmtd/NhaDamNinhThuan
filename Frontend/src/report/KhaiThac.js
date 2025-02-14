import { Tooltip } from '@mui/material'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Api from '../api'
import { MyBreadCrumbs, MyTable2, ThongBao } from '../components'
import { CanListDetailOfReport } from '../helpers'


const ChiTieuKhaiThacCT = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([])
    const payload = { groupBy: "tinh" }

    const fetchData = async () => {
        console.log('payload', payload)
        await new Api()
            .listChiTieuKiemKe({ data: payload })
            .then((res) => {
                if (res.code === 200) {
                    console.log('code', res.data?.chiTieus)
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
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng đối tượng khai thác theo tỉnh/thành phố' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Tỉnh', field: 'tinhThanhId', width: '90px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Tỉnh', field: 'tinhThanh', width: '180px', suppressSizeToFit: true },
                    {
                        headerName: 'Số lượng đối tượng khai thác nước mặt',
                        field: 'soLuongDoiTuongKhaiThacNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongDoiTuongKhaiThacNuocMat > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return <Link to={`/doi-tuong-nuoc-mat?tinhThanhId=${params.data.tinhThanhId}`} >
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
                        headerName: 'Số lượng đối tượng khai thác nước ngầm',
                        field: 'soLuongDoiTuongKhaiThacNuocNgam',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongDoiTuongKhaiThacNuocNgam > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return <Link to={`/doi-tuong-nuoc-duoi-dat?tinhThanhId=${params.data.tinhThanhId}`} >
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

const ChiTieuKhaiThacLVS = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([])
    const payload = { groupBy: 'lvs' }

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
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng đối tượng khai thác theo lưu vực sông' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã lưu vực sông', field: 'luuVucSongId', width: 'auto', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên lưu vực sông', field: 'luuVucSong', width: '300px', suppressSizeToFit: true },
                    {
                        headerName: 'Số lượng đối tượng khai thác nước mặt',
                        field: 'soLuongDoiTuongKhaiThacNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongDoiTuongKhaiThacNuocMat > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/doi-tuong-nuoc-mat?luuVucSongId=${params.data.luuVucSongId}`} >
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
                        headerName: 'Số lượng đối tượng khai thác nước ngầm',
                        field: 'soLuongDoiTuongKhaiThacNuocNgam',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongDoiTuongKhaiThacNuocNgam > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/doi-tuong-nuoc-duoi-dat?luuVucSongId=${params.data.luuVucSongId}`} >
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

export { ChiTieuKhaiThacCT, ChiTieuKhaiThacLVS }
