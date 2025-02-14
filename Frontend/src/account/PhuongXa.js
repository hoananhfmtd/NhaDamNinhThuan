import { Grid, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Api from '../api';
import { MyBreadCrumbs, MySearchBox, MySelect, MyTable2, ThongBao } from '../components';
import Helper from '../helpers';
import '../styles/paper.css';
import { MyAutocomplete } from '../kktnn-components';

export default function List() {
    const [dataTable, setDataTable] = useState([]);
    const [options, setOptions] = useState([]);
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);

    const formikRef = useRef(null);

    useEffect(() => {
        getApi({ maHuyen: '001' });
        getApiHuyen({ maTinh: '01' });
    }, []);

    const getApiHuyen = ({ maTinh }) => {
        new Api()
            .listDanhMucCapHuyen({ data: { maTinh: maTinh } })
            .then((res) => {
                if (res.code === 200) {
                    setOptions(res.data.records);
                } else {
                    ThongBao({ code: res.code });
                }
            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi xảy ra, xem log!' });
            });
    };

    const getApi = ({ maHuyen }) => {
        new Api()
            .listDanhMucCapXa({ data: { maHuyen: maHuyen } })
            .then((res) => {
                if (res.code === 200) {
                    setDataTable(Helper.addSttToTableDataSource(res.data.records));
                } else {
                    ThongBao({ code: res.code });
                }
            })
            .catch((err) => {
                ThongBao({ status: 'error', message: 'Có lỗi xảy ra, xem log!' });

            });
    };

    return (
        <div>
            <MyBreadCrumbs title={[{ name: 'Biểu mẫu', link: '/danh-sach-bieu-mau' }, { name: 'Danh sách huyện tỉnh' }]} />
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

                        <MySelect
                            options={tinhThanh0s}
                            width="250px"
                            label="Tỉnh thành"
                            value={values.tinhThanh || 'Thành phố Hà Nội'}
                            name="ten"
                            onChange={(e, value) => {
                                setFieldValue('tinhThanh', value?.ten);
                                getApiHuyen({ maTinh: value?.ma });
                            }}
                            placeholder="Chọn tỉnh/thành phố"
                        />
                        <MySelect
                            options={options}
                            width="250px"
                            label="Huyện"
                            value={values.quanHuyen || 'Quận Ba Đình'}
                            name="ten"
                            onChange={(e, value) => {
                                setFieldValue('quanHuyen', value?.ten);
                                getApi({ maHuyen: value?.ma });
                            }}
                            placeholder="Chọn quận/huyện"
                        />
                    </>
                )}
            </MySearchBox>
            <Grid container justifyContent="space-between" alignItems="flex-end" my={1}>
                <Typography variant="h7" fontWeight="bold">
                    DANH SÁCH CÁC PHƯỜNG XÃ
                </Typography>
            </Grid>
            <MyTable2
                rows={dataTable}
                hidePagination={true}
                columns={[
                    { headerName: 'STT', field: 'stt', width: '80px', suppressSizeToFit: true, pinned: 'left', cellRenderer: row => row.rowIndex + 1 },
                    { headerName: 'Mã phường xã', field: 'maXa' },
                    { headerName: 'Tên Huyện', field: 'ten' },
                ]}
            />
        </div>
    );
}
