import { Grid, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Api from '../api';
import { MyBreadCrumbs, MySearchBox, MyTable2, ThongBao } from '../components';
import Helper from '../helpers';
import '../styles/paper.css';

export default function List() {
    const [dataTable, setDataTable] = useState([]);

    const formikRef = useRef(null);

    useEffect(() => {
        const values = formikRef.current.values;
        getApi(values);
    }, []);

    const getApi = ({ tukhoa, limit, anchor, page, ...rest }) => {
        new Api()
            .listDanhMucCapTinh({ data: { tukhoa, limit, anchor, page, ...rest } })
            .then((res) => {
                if (res.code === 200) {
                    setDataTable(Helper.addSttToTableDataSource(res.data.records, page, limit));
                    if (res.data?.count) {
                    }
                } else {
                    ThongBao({ code: res.code });
                }
            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi xảy ra, xem log!' })

            });
    };

    return (
        <div>
            <MyBreadCrumbs title={[{ name: 'Biểu mẫu', link: '/danh-sach-bieu-mau' }, { name: 'Danh sách các tỉnh' }]} />
            <MySearchBox
                name="tuKhoa"
                formikRef={formikRef}
                showState={false}
                initialValues={{
                    tuKhoa: '',
                    limit: 10,
                    anchor: '',
                }}
                onSubmit={(values) => {
                    getApi(values);
                }}
            >
                {({ handleSubmit, setFieldValue, handleChange, values, errors }) => (
                    <>
                        <Grid container justifyContent="space-between" alignItems="flex-end" my={1}>
                            <Typography variant="h7" fontWeight="bold">
                                DANH SÁCH CÁC TỈNH THÀNH
                            </Typography>
                        </Grid>
                    </>
                )}
            </MySearchBox>
            <MyTable2
                columns={[
                    { headerName: 'STT', field: 'stt', width: '80px', suppressSizeToFit: true, pinned: 'left', cellRenderer: row => row.rowIndex + 1 },
                    { headerName: 'Mã Tỉnh', field: 'maTinh', width: 'auto' },
                    { headerName: 'Tên Tỉnh', field: 'ten', width: 'auto' },
                ]}
                rows={dataTable}
                hidePagination={true}
            />
        </div>
    );
}
