import { Tooltip } from '@mui/material';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Api from '../api';
import { MyBreadCrumbs, MyTable2, ThongBao } from '../components';
import { CanListDetailOfReport } from '../helpers';


const ChiTieuChatLuongNuocCT = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([]);
    const payload = { groupBy: 'tinh' };

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
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi sảy ra, xem tại log!',
                });
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <MyBreadCrumbs
                title={[
                    {
                        name: 'Chi tiết chỉ tiêu chất lượng nước theo tỉnh/thành phố',
                    },
                ]}
            />
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    {
                        headerName: 'Mã tỉnh',
                        field: 'tinhThanhId',
                        width: '90px',
                        suppressSizeToFit: true,
                        pinned: 'left',
                    },
                    {
                        headerName: 'Tên tỉnh',
                        field: 'tinhThanh',
                        width: '180px',
                        suppressSizeToFit: true,
                    },

                    {
                        headerName: 'Số lượng điểm đo chất lượng nước mặt',
                        field: 'chatLuongNuocMat',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (
                                params.data.chatLuongNuocMat > 0 &&
                                CanListDetailOfReport(
                                    user,
                                    'tinh',
                                    params.data.tinhThanhId
                                )
                            ) {
                                return (
                                    <Link
                                        to={`/bieu-mau-10?tinhThanhId=${params.data.tinhThanhId}`}
                                    >
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                );
                            } else {
                                return <span>{params.value || 0}</span>;
                            }
                        },
                    },
                    {
                        headerName: 'Số lượng điểm đo chất lượng nước dưới đất',
                        field: 'chatLuongNuocNgam',
                        width: 'auto',
                        flex: 1,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (
                                params.data.chatLuongNuocNgam > 0 &&
                                CanListDetailOfReport(
                                    user,
                                    'tinh',
                                    params.data.tinhThanhId
                                )
                            ) {
                                return (
                                    <Link
                                        to={`/bieu-mau-11?tinhThanhId=${params.data.tinhThanhId}`}
                                    >
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                );
                            } else {
                                return <span>{params.value || 0}</span>;
                            }
                        },
                    },
                    {
                        field: 'WQI',
                        groupId: 'WQI',
                        suppressSizeToFit: true,
                        children: [
                            {
                                headerName: 'Tổng số điểm',
                                width: 120,
                                cellRenderer: (params) => {
                                    return (
                                        <div>
                                            {params?.data?.chatLuongNuocWQI
                                                ? Object.values(
                                                    params?.data
                                                        ?.chatLuongNuocWQI
                                                ).reduce((a, b) => a + b, 0)
                                                : 0}
                                        </div>
                                    );
                                },
                            },
                            {
                                headerName:
                                    'Rất tốt (giá trị WQI từ 91 đến 100)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.rattot'
                            },
                            {
                                headerName:
                                    'Trung bình (giá trị WQI từ 51 đến 75)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.trungbinh'
                            },
                            {
                                headerName: 'Kém (giá trị WQI từ 26 đến 50)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.kem'
                            },
                            {
                                headerName:
                                    'Ô nhiễm nặng (giá trị WQI từ 10 đến 25)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.onhiemnang'
                            },
                            {
                                headerName:
                                    'Ô nhiễm rất nặng (giá trị WQI < 10)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.onhiemratnang'
                            },
                        ],
                    },
                ]}
            />
        </>
    );
};

const ChiTieuChatLuongNuocLVS = () => {
    const user = useSelector((state) => state?.auth);
    const [dataTable, setDataTable] = React.useState([]);
    const payload = { groupBy: 'lvs' };

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
                ThongBao({
                    status: 'error',
                    message: 'Có lỗi sảy ra, xem tại log!',
                });
            });
    };

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <>
            <MyBreadCrumbs
                title={[
                    { name: 'Biểu mẫu', link: '' },
                    {
                        name: 'Chi tiết chỉ tiêu chất lượng nước theo lưu vực sông',
                    },
                ]}
            />
            <MyTable2
                columns={[
                    {
                        headerName: 'Mã lưu vực sông',
                        field: 'luuVucSongId',
                        width: '180px',
                        suppressSizeToFit: true,
                    },
                    {
                        headerName: 'Tên lưu vực sông',
                        field: 'luuVucSong',
                        width: '300px',
                        suppressSizeToFit: true,
                    },
                    {
                        headerName: 'Số lượng điểm đo chất lượng nước mặt',
                        field: 'chatLuongNuocMat',
                        width: 350,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (
                                params.data.chatLuongNuocMat > 0 &&
                                CanListDetailOfReport(
                                    user,
                                    'lvs',
                                    params.data.luuVucSongId
                                )
                            ) {
                                return (
                                    <Link
                                        to={`/bieu-mau-10?luuVucSongId=${params.data.luuVucSongId}`}
                                    >
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                );
                            } else {
                                return <span>{params.value || 0}</span>;
                            }
                        },
                    },
                    {
                        headerName: 'Số lượng điểm đo chất lượng nước dưới đất',
                        field: 'chatLuongNuocNgam',
                        width: 300,
                        suppressSizeToFit: true,
                        cellRenderer: (params) => {
                            if (
                                params.data.chatLuongNuocNgam > 0 &&
                                CanListDetailOfReport(
                                    user,
                                    'lvs',
                                    params.data.luuVucSongId
                                )
                            ) {
                                return (
                                    <Link
                                        to={`/bieu-mau-11?luuVucSongId=${params.data.luuVucSongId}`}
                                    >
                                        <Tooltip title="Xem chi tiết">
                                            {params.value || 0}
                                        </Tooltip>
                                    </Link>
                                );
                            } else {
                                return <span>{params.value || 0}</span>;
                            }
                        },
                    },
                    {
                        field: 'WQI',
                        groupId: 'WQI',
                        suppressSizeToFit: true,
                        children: [
                            {
                                headerName: 'Tổng số điểm',
                                width: 120,
                                cellRenderer: (params) => {
                                    return (
                                        <div>
                                            {params.data?.chatLuongNuocWQI
                                                ? Object.values(
                                                    params.data
                                                        ?.chatLuongNuocWQI
                                                ).reduce((a, b) => a + b, 0)
                                                : 0}
                                        </div>
                                    );
                                },
                            },
                            {
                                headerName:
                                    'Rất tốt (giá trị WQI từ 91 đến 100)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.rattot'
                            },
                            {
                                headerName:
                                    'Trung bình (giá trị WQI từ 51 đến 75)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.trungbinh'
                            },
                            {
                                headerName: 'Kém (giá trị WQI từ 26 đến 50)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.kem'
                            },
                            {
                                headerName:
                                    'Ô nhiễm nặng (giá trị WQI từ 10 đến 25)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.onhiemnang'
                            },
                            {
                                headerName:
                                    'Ô nhiễm rất nặng (giá trị WQI < 10)',
                                // width: 'auto',
                                // flex: 1,
                                width: 120,
                                field: 'chatLuongNuocWQI.onhiemratnang'
                            },
                        ],
                    },
                ]}
                rows={dataTable}
                hidePagination={true}
            />
        </>
    );
};

export { ChiTieuChatLuongNuocCT, ChiTieuChatLuongNuocLVS };

