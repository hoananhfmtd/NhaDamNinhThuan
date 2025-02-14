import { RestartAltOutlined } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { viVN } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import vi from 'dayjs/locale/vi';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Api from '../api';
import { MySelect } from '../components';
import { useStores } from '../hooks';
const optionsDay = [
    { label: '7 ngày gần nhất', day: 7 },
    { label: '30 ngày gần nhất', day: 30 },
]
const listBieuMau = [
    {
        tenBieuMau: 'Biểu mẫu số 1',
        bieuMau: 'BieuMauSo1'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 2',
        bieuMau: 'BieuMauSo2'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 3',
        bieuMau: 'BieuMauSo3'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 4',
        bieuMau: 'BieuMauSo4'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 5',
        bieuMau: 'BieuMauSo5'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 6',
        bieuMau: 'BieuMauSo6'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 7',
        bieuMau: 'BieuMauSo7'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 8',
        bieuMau: 'BieuMauSo8'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 9',
        bieuMau: 'BieuMauSo9'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 10',
        bieuMau: 'BieuMauSo10'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 11',
        bieuMau: 'BieuMauSo11'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 12',
        bieuMau: 'BieuMauSo12'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 13',
        bieuMau: 'BieuMauSo13'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 14',
        bieuMau: 'BieuMauSo14'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 15',
        bieuMau: 'BieuMauSo15'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 17',
        bieuMau: 'BieuMauSo17'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 18',
        bieuMau: 'BieuMauSo18'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 19',
        bieuMau: 'BieuMauSo19'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 20',
        bieuMau: 'BieuMauSo20'
    },
    {
        tenBieuMau: 'Biểu mẫu số 21',
        bieuMau: 'BieuMauSo21'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 22',
        bieuMau: 'BieuMauSo22'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 23',
        bieuMau: 'BieuMauSo23'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 24',
        bieuMau: 'BieuMauSo24'
    }
    ,
    {
        tenBieuMau: 'Biểu mẫu số 25',
        bieuMau: 'BieuMauSo25'
    }

]
const bieumautinh = ["BieuMauSo2", "BieuMauSo3", "BieuMauSo5", "BieuMauSo6", "BieuMauSo10", "BieuMauSo12", "BieuMauSo15", "BieuMauSo17", "BieuMauSo18", "BieuMauSo21", "BieuMauSo22", "BieuMauSo23", "BieuMauSo24"];
const bieumaukttv = ["BieuMauSo9", "BieuMauSo25"];
export default function BieuMauCountByBM() {
    const [reports, setReports] = React.useState([{ tenBieuMau: '', soLuong: 0 }]);
    const [filtered, setFiltered] = React.useState({
    });
    const { scope, tinhThanhId, coQuanThucHienId } = useSelector(
        (state) => state?.auth
    );

    const CQTHs = useSelector(
        (state) => state.app?.DanhMucs?.coQuanThucHiens || []
    );
    const { coQuanThucHiens } = useStores();
    const CQTHTWs = useMemo(() => coQuanThucHiens
        .filter(item => item.is !== 'scope')
        .map((item) => ({
            value: item.value,
            label: item.label,
            is: item.is,
        })), [])
    const tinhThanhs =
        useSelector((state) => state.app?.DanhMucs?.tinhThanhs || []);
    // const [showFilterNT, setShowFilterNT] = React.useState(false);
    //list từ 1 đến 25

    const checkFilter = (listBieuMau, tinhThanhId, scope, coQuanThucHienId, bieumautinh, bieumaukttv) => {
        if (tinhThanhId && scope === "tinh") {
            return listBieuMau.filter((i) => bieumautinh.includes(i.bieuMau));
        } else if (coQuanThucHienId === '06dvtt' && scope === "dvtt") {
            return listBieuMau.filter((i) => bieumaukttv.includes(i.bieuMau));
        } else if (coQuanThucHienId !== '06dvtt' && scope === "dvtt") {
            return listBieuMau.filter((i) => !bieumaukttv.includes(i.bieuMau));
        } else {
            return listBieuMau;
        }
    };
    const filteredListBM = checkFilter(listBieuMau, tinhThanhId, scope, coQuanThucHienId, bieumautinh, bieumaukttv);
    const filteredDay = (day) => {
        if (day === 7) {
            return optionsDay.filter((i) => i.day === 7);
        } else {
            return optionsDay.filter((i) => i.day === 30);
        }
    }
    const filterDay = filteredDay(filtered?.day || 30);
    const handleThongKe = async () => {
        const _filtered = { ...filtered };
        const now = dayjs().endOf('day');
        // const startOfDay = (date) => Math.ceil(dayjs(date).startOf('day').valueOf() / 3600000);
        const startOfDay = (date) => dayjs(date).startOf('day').valueOf();
        const endOfDay = (date) => dayjs(date).endOf('day').valueOf();
        // const endOfDay = (date) => Math.ceil(dayjs(date).endOf('day').valueOf() / 3600000);
        if (_filtered.day === 7) {
            _filtered.tuNgay = startOfDay(now.subtract(7, 'day'));
            _filtered.denNgay = endOfDay(now);
        } else {
            _filtered.tuNgay = startOfDay(now.subtract(30, 'day'));
            _filtered.denNgay = endOfDay(now);
        }
        if (tinhThanhId && scope === 'tinh') {
            _filtered.tinhThanhId = tinhThanhId;
        }
        if (coQuanThucHienId && scope === 'dvtt') {
            _filtered.coQuanThucHienId = coQuanThucHienId;
        }
        // Convert tuNgay and denNgay to hour 
        _filtered.tuNgay = Math.floor(_filtered.tuNgay / (1000 * 60 * 60));
        _filtered.denNgay = Math.floor(_filtered.denNgay / (1000 * 60 * 60));
        (async () => {
            await getThongKe(_filtered);
        })();
    };

    const getThongKe = async (_filtered) => {
        try {
            const response = await new Api().thongKeSoLuongBieuMau({ data: _filtered });
            if (response?.code === 200) {
                // nếu tk của tỉnh sẽ chỉ hiển thị những cột bản ghi có tenBieuMau có trong bieumautinh
                let data = response?.data;
                if (response?.data.length === 0) {
                    data = [{ tenBieuMau: 'Không có dữ liệu', soLuong: 0 }];
                }
                if (scope === 'tinh') {
                    // nếu data không phải 1 mảng thì chuyển nó về mảng 
                    if (!Array.isArray(data)) {
                        data = [data];
                    }
                    setReports(data);
                }
                else {
                    if (!Array.isArray(data)) {
                        data = [data];
                    }
                    setReports(data);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }



    React.useEffect(() => {
        const _filtered = { ...filtered };
        const now = dayjs().endOf('day');
        // const startOfDay = (date) => Math.ceil(dayjs(date).startOf('day').valueOf() / 3600000);
        const startOfDay = (date) => dayjs(date).startOf('day').valueOf();
        const endOfDay = (date) => dayjs(date).endOf('day').valueOf();
        // const endOfDay = (date) => Math.ceil(dayjs(date).endOf('day').valueOf() / 3600000);
        if (_filtered.day === 7) {
            _filtered.tuNgay = startOfDay(now.subtract(7, 'day'));
            _filtered.denNgay = endOfDay(now);
        } else {
            _filtered.tuNgay = startOfDay(now.subtract(30, 'day'));
            _filtered.denNgay = endOfDay(now);
        }

        // Convert tuNgay and denNgay to hour 
        _filtered.tuNgay = Math.floor(_filtered.tuNgay / (1000 * 60 * 60));
        _filtered.denNgay = Math.floor(_filtered.denNgay / (1000 * 60 * 60));

        (async () => {
            await getThongKe(_filtered);
        })();
    }, [filtered.coQuanThucHienIds, filtered.day, filtered.bieuMau, filtered.tinhThanhId]);

    // danh sách test 7 ngày và số lượng bản ghi tương ứng
    const RenderLegend = (props) => {
        const { payload } = props;
        return (
            <div style={{ display: 'flex', justifyContent: 'end' }}>
                {payload.map((entry, index) => (
                    <div style={{ display: 'flex', marginLeft: 50, position: 'relative' }} key={index}>
                        <div
                            style={{
                                width: 30,
                                height: 8,
                                borderRadius: 10,
                                marginTop: 3,
                                marginRight: 5,
                                background: entry.color,

                            }}
                        ></div>
                        <div className="bieudocot-legend-label" >Biểu mẫu</div>
                    </div>
                ))}
            </div>
        );
    };
    const chuyenNgay = (date) => {
        // từ timestamp sang ngày tháng 
        // date = 1724778000 chuyển thành ngày tháng
        const dateNgay = new Date(date * 1000);
        const ngay = dateNgay.getDate();
        const thang = dateNgay.getMonth() + 1;
        return ngay + '/' + thang;


    }

    // // biểu đồ chấm
    // const CustomTooltipNgayTao = ({ active, payload, label }) => {
    //     if (active && payload && payload.length) {
    //         return (
    //             <div style={{ background: '#000000ba', borderRadius: 5, padding: 10, color: '#fff' }}>
    //                 <div>{`Ngày ${payload[0].payload.name}`}</div>
    //                 <div>{`Bản ghi: ${payload[0].payload.uv}`}</div>
    //             </div>
    //         );
    //     }

    //     return null;
    // };

    const getCQTHValues = React.useMemo(() => {
        return [
            ...CQTHTWs?.filter(
                (t) => !!filtered?.tinhThanhIds?.find((i) => i === t.value)),
            ...CQTHTWs?.filter(
                (t) => !!filtered?.coQuanThucHienIds?.find((i) => i === t.value))
        ];
    }, [CQTHTWs, filtered]);

    // biểu đồ cột
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#000000ba', borderRadius: 5, padding: 10, color: '#fff' }}>
                    {/* <div>{`Biểu mẫu ${label}`}</div> */}
                    <div>{`Bản ghi: ${payload[0].value}`}</div>
                </div>
            );
        }

        return null;
    };
    return (
        <div style={{ border: '1px solid black !important' }}>

            {/* Biểu đồ thống kê */}
            <Box mt={5} style={{ width: '97.5%', marginLeft: '23px' }}>
                <div style={{ borderRadius: '8px' }}>
                    <Box >
                        <Box display="flex" gap={3} justifyContent="left" >
                        </Box>
                        <Box display="flex" gap={3} justifyContent="right" pt={5} style={{ backgroundColor: '#fff ', borderRadius: ' 10px 10px 0 0', position: 'relative' }}>

                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={vi} localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}>
                                <Typography sx={{ fontFamily: 'Inter', fontWeight: 'bold', fontSize: '16px', position: 'absolute', left: '40px', top: "40px" }}>THỐNG KÊ SỐ LƯỢNG THEO TỪNG BIỂU MẪU</Typography>
                                {/* tạo select 7 ngày gần nhất và 30 ngày gần nhất */}
                                <>
                                    {scope === 'tw' && (
                                        <MySelect
                                            options={CQTHTWs}
                                            width="300px"
                                            limitTags={3}
                                            multiple
                                            value={getCQTHValues}
                                            name="label"
                                            onChange={(e, value) => {
                                                console.log('search value', value);

                                                const coQuanThucHienIds = [];
                                                const tinhThanhIds = [];

                                                value.forEach(item => {
                                                    if (item.is === 'coQuanThucHienIds') {
                                                        coQuanThucHienIds.push(item.value);
                                                    }
                                                    if (item.is === 'tinhThanhIds') {
                                                        tinhThanhIds.push(item.value);
                                                    }
                                                })

                                                setFiltered(prev => ({
                                                    ...prev,
                                                    coQuanThucHienIds,
                                                    tinhThanhIds
                                                }))
                                            }}
                                            placeholder="Chọn cơ quan thực hiện"
                                        />
                                    )}

                                    <MySelect
                                        options={filteredListBM}
                                        width="200px"
                                        name="tenBieuMau"
                                        value={filtered?.tenBieuMau}
                                        onChange={(e, value) => {
                                            setFiltered((prev) => ({
                                                ...prev,
                                                bieuMau: value?.bieuMau,
                                                tenBieuMau: value?.tenBieuMau
                                            }));
                                        }}
                                        placeholder="Chọn biểu mẫu"
                                    />

                                    <MySelect
                                        options={
                                            optionsDay
                                        }
                                        width={200}
                                        name="label"
                                        value={filtered?.label || filterDay[0]}
                                        onChange={(e, value) => {
                                            setFiltered((prev) => ({
                                                ...prev,
                                                day: value?.day,
                                                lable: value?.label
                                            }));
                                        }}
                                        placeholder="Chọn khoảng thời gian"

                                    />

                                </>
                                {/* 
                                {showFilterNT && (
                                    <>
                                        <DatePicker
                                            slotProps={{ textField: { size: 'small' } }}
                                            label="Chọn ngày bắt đầu"
                                            onChange={(e) => {
                                                const timestamp = dayjs(e).valueOf();
                                                setFiltered((prev) => ({
                                                    ...prev,
                                                    tuNgay: timestamp
                                                }));
                                            }}
                                            format="DD/MM/YYYY"
                                        />
                                        <DatePicker
                                            slotProps={{ textField: { size: 'small' } }}
                                            onChange={(e) => {
                                                const timestamp = dayjs(e).valueOf();
                                                setFiltered((prev) => ({
                                                    ...prev,
                                                    denNgay: timestamp
                                                }));

                                            }}
                                            format="DD/MM/YYYY"
                                            label="Chọn ngày kết thúc"
                                        />
                                    </>
                                )} */}
                                <IconButton
                                    onClick={() => {
                                        handleThongKe();
                                    }}
                                    title='Thống kê'
                                >
                                    <RestartAltOutlined />
                                </IconButton>

                            </LocalizationProvider>

                        </Box>
                    </Box>

                    <div style={{ height: 450, backgroundColor: '#fff', borderRadius: ' 0 0  10px 10px', paddingBottom: '30px', }}>
                        <>
                            {/* <ResponsiveContainer>
                                    <ScatterChart
                                        data={
                                            (filtered.day === 7 ? day7 : day30)
                                                .map((dayItem) => ({
                                                    name: dayItem.day, // Ngày hiển thị trên trục X
                                                    uv: reports.find((i) => dayjs(i?.ngayTao).format('DD/MM') === dayItem.day)?.soLuong || 0, // Số lượng bản ghi tương ứng
                                                }))
                                        }
                                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                                        title="Biểu đồ số lượng biểu mẫu được tạo theo thời gian"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" name="Biểu mẫu" />
                                        <YAxis dataKey="uv" name="Số lượng" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" align="right" content={<RenderLegend />} />
                                        <Scatter name="Số lượng biểu mẫu" dataKey="uv" fill="#b0d8ee" />
                                    </ScatterChart>
                                </ResponsiveContainer> */}
                            {/* //Biểu đồ cột */}
                            <ResponsiveContainer >
                                <BarChart
                                    data={
                                        (reports)
                                            ?.sort((a, b) => a?.index - b?.index)
                                            .map((bMItem) => ({
                                                name: bMItem.tenBieuMau.replace('bieumauso', '').trim(), // Ngày hiển thị trên trục X
                                                uv: bMItem.soLuong || 0,
                                            }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} />
                                    <XAxis dataKey="name" axisLine={true} tickLine={true} label={{ value: 'Tên biểu mẫu', position: 'bottom', offset: 0, fill: '#000' }} />
                                    <YAxis label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', fill: '#000' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" align="right" content={<RenderLegend />} />
                                    <Bar dataKey="uv" fill="#b0d8ee" radius={5} barSize={14} />
                                </BarChart>
                                {reports.some(item => item.tenBieuMau === '' && item.soLuong === 0) && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <CircularProgress
                                            size={24}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <span style={{
                                            color: '#1976d2',
                                            fontSize: '16px',
                                            margin: '5px',
                                        }}> Đang tải dữ liệu...</span>
                                    </div>
                                )
                                }
                            </ResponsiveContainer>
                        </>
                    </div>
                </div>
            </Box>

        </div>
    );
};

