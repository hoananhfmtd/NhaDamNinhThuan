import { Button, Dialog, DialogActions, DialogTitle, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import Api from '../api';
import { MyBreadCrumbs, MySearchBox, MyTable2, RowActions } from '../components';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import '../styles/paper.css';
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function List() {
    const [limit, setLimit] = useState(10);
    const [datas, setDatas] = useState([]);
    const [page, setPage] = useState(0);
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [isImageDialogOpened, setIsImageDialogOpened] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    let rows = [];
    if (page >= 0 && page < datas.length) {
        rows = datas[page]?.records;
    }
    const count = datas.length > 0 ? datas[0].count : 0;
    const formikRef = useRef(null);

    const getList = useCallback(
        async ({ tuKhoa, datas, limit, page, signal }) => {
            let anchor = '';
            if (datas?.length > 0) {
                const lastdata = datas[datas.length - 1];
                anchor = lastdata.anchor;
                if (
                    !lastdata.anchor ||
                    lastdata.anchor == '' ||
                    !lastdata.records ||
                    lastdata.records?.length == 0
                ) {
                    setPage(page);
                    return;
                }
                if (page * limit >= datas[0].count) {
                    return;
                }
            }

            const values = formikRef?.current?.values ?? {};

            const response = await new Api().getFeedbackList({
                data: {
                    ...values,

                    limit: limit,
                    anchor: anchor,
                    signal,
                },
            });
            if (response?.code === 200 && response?.data) {
                setDatas([...datas, response?.data]);
                setPage(page);
                setLimit(limit);
                const params = { ...values };
                Object.keys(params).forEach(
                    (key) => !params[key] && delete params[key]
                );
            }
            // TODO handle error
        },
        []
    );

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const values = formikRef?.current?.values ?? {};
        getList({ ...values, datas, limit, page, signal });
        return () => {
            controller.abort();
        };
    }, []);

    const onNextPage = () => {
        if ((page + 1) * limit >= count) {
            return;
        }
        getList({ datas, limit, page: page + 1 });
    };

    const onChangeLimit = (event) => {
        let v = parseInt(event.target.value);
        if (v == 0) {
            v = 10;
        }
        if (v == limit) {
            return;
        }

        getList({ datas: [], limit: v, page: 0 });
    };

    return (
        <div>
            <MyBreadCrumbs title={[{ name: 'Danh sách lỗi' },]} />
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
                    values.datas = [];
                    values.page = page;
                    values.limit = limit;
                    getList(values);
                }}
            >
                {() => (
                    <>
                        <Grid container justifyContent="space-between" alignItems="flex-end" my={1}>
                            <Typography variant="h7" fontWeight="bold">
                                DANH SÁCH LỖI DO NGƯỜI DÙNG BÁO CÁO
                            </Typography>
                        </Grid>
                    </>
                )}
            </MySearchBox>
            <MyTable2
                limit={limit}
                count={count}
                page={page}
                loading={false}
                onBackPage={() => {
                    setPage(page - 1);
                }}
                onNextPage={onNextPage}
                onChangeLimit={onChangeLimit}
                columns={[
                    { headerName: 'STT', field: 'stt', width: '80px', suppressSizeToFit: true, pinned: 'left', cellRenderer: row => row.rowIndex + 1 },
                    { headerName: 'Mô tả', field: 'moTa', width: '800px', cellStyle: { 'text-overflow': 'ellipsis', 'white-space': 'nowrap', 'overflow': 'hidden', 'display': 'block' } },
                    { headerName: 'Tên người dùng', field: 'createdBy', minWidth: 100, flex: 1 },
                    {
                        headerName: 'Thao tác',
                        pinned: 'right',
                        suppressSizeToFit: true,
                        width: '145px',
                        cellRenderer: (row) => (
                            <RowActions
                                row={row}
                                onView={(row) => {
                                    setDialogData(row.data);
                                    setIsDialogOpened(true);
                                }}

                            />
                        ),
                    },
                ]}
                rows={rows}
            />

            <Dialog open={isDialogOpened}
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "50%",
                            maxWidth: "60vw",
                            maxHeight: "70vh"
                        },
                    },
                }}
            >
                <DialogTitle>Thông tin chi tiết lỗi</DialogTitle>

                <Grid px={3}>
                    <Typography variant='subtitle2' style={{ fontSize: 16 }} mb={1}>Mô tả:</Typography>
                    <Typography variant='body1'>{dialogData?.moTa}</Typography>
                </Grid>

                <Grid px={3} pt={2}>
                    <Typography variant='subtitle2' style={{ fontSize: 16 }} mb={1}>File đính kèm:</Typography>
                    <Grid container >
                        {/* Hiển thị các file đính kèm */}
                        {dialogData?.tepDinhKems?.map(img =>
                            <Grid
                                item m={1} p={1} xs={5} sm={5} md={5} key={img.file_path}
                                sx={{
                                    cursor: 'pointer',
                                    height: '200px',
                                    width: '300px',
                                    border: 1,
                                    borderColor: 'lightblue',
                                    borderRadius: 1
                                }}
                                onClick={() => setIsImageDialogOpened(true)}
                            >
                                <img
                                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                    src={new Api().getImage(img.file_path)} />
                            </Grid>)
                        }
                    </Grid>
                </Grid>

                <DialogActions>
                    <MyButton onClick={() => {
                        setIsDialogOpened(false);
                        setDialogData(null);
                    }}
                        txt='Đóng'
                        variant='outlined'
                    >
                    </MyButton>
                </DialogActions>
            </Dialog>

            <Lightbox
                carousel={{ finite: dialogData?.tepDinhKems?.length }}
                open={isImageDialogOpened}
                close={() => setIsImageDialogOpened(false)}
                slides={dialogData?.tepDinhKems?.map(img => ({
                    src: new Api().getImage(img.file_path),
                }))}
                plugins={[Zoom, Thumbnails]}
                zoom={{
                    maxZoomPixelRatio: 4
                }}
                thumbnails={{
                    position: 'bottom'
                }}
            />
        </div>
    );
}
