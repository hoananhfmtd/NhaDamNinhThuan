import { Tooltip } from '@mui/material'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Api from '../api'
import { MyBreadCrumbs, MyTable2, ThongBao } from '../components'
import { CanListDetailOfReport } from '../helpers'

const ChiTieuSoLuongNuocMuaLVS = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([])
    const payload = { groupBy: 'lvs' }

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
            <MyBreadCrumbs title={[{ name: 'Biểu mẫu', link: '' }, { name: 'Đối tượng số lượng nước - Lưu vực sông' }]} />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'Mã Lưu Vực', field: 'luuVucSongId', width: '180px', suppressSizeToFit: true, pinned: 'left' },
                    { headerName: 'Tên Lưu vực', field: 'luuVucSong', width: '300px', suppressSizeToFit: true },
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

export { ChiTieuSoLuongNuocMuaLVS }
