import React, { useEffect } from 'react'
import { MyBreadCrumbs, MyTable2, ThongBao } from '../components'
import { Link } from 'react-router-dom'
import Api from '../api'
import { Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'
import { CanListDetailOfReport } from '../helpers';

const ChiTieuXaThaiCT = () => {
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
                ThongBao({ status: 'error', message: 'Có lỗi sảy ra, xem tại log!', err });
            });
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng đối tượng xả thải theo tỉnh/thành phố' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Tỉnh', field: 'tinhThanhId', width: '100px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Tỉnh', field: 'tinhThanh', width: '300px', suppressSizeToFit: true },

                    {
                        headerName: 'Số lượng đối tượng xả thải nước mặt',
                        field: 'soLuongDoiTuongXaThaiNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            console.log('params', params?.data?.tinhThanhId)
                            if (params.data.soLuongDoiTuongXaThaiNuocMat > 0 && CanListDetailOfReport(user, "tinh", params.data.tinhThanhId)) {
                                return <Link to={`/doi-tuong-xa-thai?tinhThanhId=${params.data.tinhThanhId}`} >
                                    <Tooltip title="Xem chi tiết">
                                        {params?.value || 0}
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

const ChiTieuXaThaiLVS = () => {
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
            <MyBreadCrumbs title={[{ name: 'Chi tiết chỉ tiêu số lượng đối tượng xả thải theo lưu vực sông' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã lưu vực sông', field: 'luuVucSongId', width: 'auto', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên lưu vực sông', field: 'luuVucSong', width: '300px', suppressSizeToFit: true },
                    {
                        headerName: 'Số lượng đối tượng xả thải ',
                        field: 'soLuongDoiTuongXaThaiNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (params.data.soLuongDoiTuongXaThaiNuocMat > 0 && CanListDetailOfReport(user, "lvs", params.data.luuVucSongId)) {
                                return <Link to={`/doi-tuong-xa-thai?luuVucSongId=${params.data.luuVucSongId}`} >
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

export { ChiTieuXaThaiCT, ChiTieuXaThaiLVS };
