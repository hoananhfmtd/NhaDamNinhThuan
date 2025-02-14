import { Box, createFilterOptions, Pagination, Stack, Tooltip } from '@mui/material';
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import DetailLogo from './assets/Question.svg';
import { convertNumber } from './helpers';

import { useSelector } from 'react-redux';

import { Autocomplete, IconButton, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { DeleteForeverRounded, FileUpload } from '@mui/icons-material';
import { vi } from 'date-fns/locale';
import { Field } from 'formik';
import { Grid } from 'react-virtualized';
import Swal from 'sweetalert2';
import Api from './api';
import { MyButton } from './components';
import { loaiBieuMaus, thongTinGiayPheps, trangThaiBieuMaus } from './const';
import { useStores } from './hooks';

const MY_INPUT_HEIGHT = '16PX';
export const MyAutoSizeArea = memo((props) => {
    const textareaRef = useRef(null);
    useEffect(() => {
        const target = textareaRef.current;
        if (target) {
            target.setAttribute(
                'style',
                'height:' + target.scrollHeight + 'px;overflow-y:hidden;'
            );
            const isEventListenerExists =
                target.listeners && target.listeners['input'];

            if (!isEventListenerExists) {
                // Nếu chưa có, thêm event listener và lưu vào biến listeners
                target.addEventListener('input', (e) => OnInput(e), false);
                target.listeners = {
                    ...(target.listeners || {}),
                    input: OnInput,
                };
            }
        }
    }, []);
    const OnInput = useCallback((e) => {
        const target = e.target;
        target.style.height = 0;
        target.style.height = target.scrollHeight + 'px';
    }, []);

    return (
        <textarea
            className={props?.readOnly ? 'no_print' : ''}
            ref={textareaRef}
            {...props}
            value={props.value || ''}
            style={{ ...props.style, height: props?.height || MY_INPUT_HEIGHT }}
        />
    );
});

export const MyPrefixTextarea = memo((props) => {
    const textprefixRef = useRef(null);
    const prefixWidth = useRef(0);

    useEffect(() => {
        const targetPrefix = textprefixRef.current;

        if (targetPrefix) {
            if (!targetPrefix.listeners?.['input']) {
                targetPrefix.addEventListener('input', OnInput, false);
                targetPrefix.listeners = {
                    ...targetPrefix.listeners,
                    input: OnInput,
                };
            }
        }
        if (targetPrefix) {
            prefixWidth.current = targetPrefix.offsetWidth;
        }

        // Đặt text-indent cho tất cả các .textarea-prefix

        document
            .querySelectorAll('.textarea-prefix textarea')
            .forEach((textarea) => {
                const prefix = textarea
                    .closest('.textarea-prefix')
                    .querySelector('span');
                if (prefix) {
                    textarea.style.textIndent = prefix.offsetWidth + 'px';
                }
            });
    }, []);

    const OnInput = useCallback((e) => {
        const target = e.target;
        target.style.height = 0;
        target.style.height = target.scrollHeight + 'px';
    }, []);

    return (
        <div className="textarea-prefix">
            <span ref={textprefixRef}>{props.prefix}</span>
            <textarea
                ref={textprefixRef}
                {...props}
                value={props.value || ''}
                style={{ ...props.style, height: props?.height || 'auto' }}
            />
        </div>
    );
});
const StyledDiv = styled.div`
    text-align: 'center';
    word-break: break-all;
    font-weight: 'bold';
    width: 90%;
    .editable {
        width: 100%;
        border: none;
        outline: none;
        font-size: 12pt;
        padding-left: 2px;
        text-align: center;
        resize: none;
        overflow: hidden;
        white-space: pre-wrap;
        word-break: break-word;
    }
`;

export const TextareaPrefix = ({ onChange, value, prefix }) => {
    const contentRef = useRef(null);
    const onInput = () => {
        onChange(contentRef.current.innerText);
    };
    useEffect(() => {
        // kiểm tra điều kiện cập nhật con trỏ value
        if (contentRef.current && contentRef.current.innerText !== value) {
            contentRef.current.innerText = value;
        }
    }, [value]);

    return (
        <StyledDiv>
            <span style={{ fontSize: '13pt' }}>{prefix}</span>
            <span
                ref={contentRef}
                className="editable"
                contentEditable={true}
                onInput={onInput}
                suppressContentEditableWarning={true}
            ></span>
        </StyledDiv>
    );
};

export const MyInput = memo((props) => {
    return (
        <input
            className={props?.readOnly ? 'no_print' : ''}
            style={{ ...props.style, height: props?.height || MY_INPUT_HEIGHT }}
            value={props.value || ''}
            {...props}
        />
    );
});

export const HomeCard = ({ data, datas }) => {
    return (
        <Box
            sx={{
                padding: '30px',
                backgroundColor: '#FFF',
                borderRadius: '10px',
                width: '96%',
                height: '260px',
                // ml: 2,
                mt: 2.5,
                // mb: 0.5,
                mb: 1,
                display: 'flex',
                flexDirection: 'column',
                // boxShadow: '6px 0px 24px #D5E4EC ',
            }}
            display="flex"
        >
            <Stack
                gap={1}
                mb={3}
                style={{ display: 'flex', flexDirection: 'row' }}
            >
                <img
                    src={data?.images || ''}
                    alt="Group"
                    style={{
                        width: '70px',
                        height: '70px',
                        marginRight: '5px',
                    }}
                />
                <div>
                    <div
                        style={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            marginLeft: '10px',
                            textTransform: 'uppercase',
                        }}
                    >
                        {data?.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {data?.children.map((child, index) => {
                            return (
                                <Link
                                    to={child.path}
                                    key={index}
                                    style={{
                                        textDecoration: 'none',
                                        marginRight: '10px',
                                        color: 'rgba(31, 31, 31, 1)',
                                    }}
                                >
                                    <Tooltip
                                        title={`Xem chi tiết ${child.name}`}
                                        key={index}
                                    >
                                        <span
                                            style={{
                                                fontWeight: '400',
                                                fontSize: '14px',
                                                marginLeft: '10px',
                                                fontFamily:
                                                    'Roboto, sans-serif',
                                                lineHeight: '21px',
                                            }}
                                        >
                                            <img
                                                src={DetailLogo}
                                                alt="Group"
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    marginRight: '5px',
                                                }}
                                            />
                                            {child.name}
                                        </span>
                                    </Tooltip>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </Stack>

            <div
                style={{
                    borderTop: '1px solid black',
                    marginBottom: '10px',
                    opacity: '0.1',
                }}
            ></div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Stack spacing={0.5}>
                    {data?.scores.map((score, index) => {
                        return (
                            <div key={index}>
                                <label
                                    style={{
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        fontFamily: 'Roboto, sans-serif',
                                        lineHeight: '27px',
                                        color: 'rgba(69, 69, 69, 1)',
                                    }}
                                >
                                    {score.name}:
                                </label>
                            </div>
                        );
                    })}
                </Stack>

                <Stack spacing={0.5}>
                    {data?.scores.map((score, index) => {
                        return (
                            <div key={index}>
                                <span
                                    style={{
                                        fontWeight: '600',
                                        fontSize: '18px',
                                        marginLeft: '10px',
                                        textAlign: 'center',
                                        fontFamily: 'Roboto, sans-serif',
                                    }}
                                >
                                    {convertNumber(
                                        datas[0]?.[`${score?.value}`]
                                    ) || 0}
                                </span>
                            </div>
                        );
                    })}
                </Stack>
            </div>
        </Box>
    );
};

const timeStyle = (errors) => {
    return {
        backgroundColor: 'white',
        marginBottom: '8px',
        '.MuiFormHelperText-root': {
            color: '#f44335 !important',
            marginTop: '5px !important',
            paddingLeft: '5px !important',
            fontSize: '13px',
        },
        '& .MuiOutlinedInput-root': {
            height: '33px',
            '& fieldset': {
                borderColor: errors
                    ? '#e91e63 !important'
                    : '#cbd5e0 !important',
            },
            '&:hover fieldset': {
                borderColor: '#a0a0a0 !important',
            },
            '&.Mui-focused fieldset': {
                border: errors
                    ? '1px solid #e91e63 !important'
                    : '1px solid #1a73e8 !important',
            },
        },
        '& .MuiOutlinedInput-input.Mui-disabled': {
            WebkitTextFillColor: '#00000099',
        },
    };
};

export const TimeSelect = ({ rowData, setRowData }) => {
    const [value, setValue] = React.useState(
        rowData.thoiGian ? new Date(rowData.thoiGian * 1000) : null
    );
    useEffect(() => {
        if (rowData.thoiGian) {
            setValue(new Date(rowData.thoiGian * 1000));
        } else {
            setValue(null);
        }
    }, [rowData.thoiGian]);

    return (
        <td style={{ textAlign: 'center' }}>
            <div>
                <LocalizationProvider
                    adapterLocale={vi}
                    dateAdapter={AdapterDateFns}
                >
                    <DesktopDatePicker
                        className="DesktopDatePicker"
                        mintime={new Date()}
                        value={value}
                        inputFormat={'dd/MM/yyyy'}
                        openTo={'day'}
                        onChange={(newValue) => {
                            setValue(newValue);
                            setRowData({
                                _id: rowData._id,
                                thoiGian: newValue.getTime() / 1000,
                            });
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '33px',
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                inputProps={{
                                    ...params.inputProps,
                                    placeholder: 'Chọn thời gian',
                                    sx: {
                                        color: '#3a4c6b',
                                        fontSize: '13.5px',
                                        padding: '12px 0px 12px 15px!important',
                                    },
                                }}
                                sx={timeStyle(null)}
                            />
                        )}
                    />
                </LocalizationProvider>
            </div>
            {rowData.error?.thoiGian && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.thoiGian}
                </span>
            )}
        </td>
    );
};
export const TimeSelectNew = ({ rowData, onSelect }) => {
    const handleSelect = (newValue) => {
        if (newValue) {
            const timestamp = newValue.getTime() / 1000; // Chuyển đổi thời gian thành Unix timestamp
            onSelect({
                thoiGian: timestamp,
                formattedTime: newValue.toLocaleDateString('vi-VN'),
            });
        } else {
            onSelect({ thoiGian: null });
        }
    };

    return (
        <td style={{ textAlign: 'center' }}>
            <div>
                <LocalizationProvider adapterLocale={vi} dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                        className="DesktopDatePicker"
                        value={rowData?.thoiGian ? new Date(rowData.thoiGian * 1000) : null}
                        inputFormat="dd/MM/yyyy"
                        openTo="day"
                        onChange={handleSelect}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '33px',
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                placeholder="Chọn thời gian"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '24px',
                                    },
                                    '& input': {
                                        color: '#3a4c6b',
                                        fontSize: '13.5px',
                                    },
                                }}
                            />
                        )}
                    />
                </LocalizationProvider>
            </div>
            {rowData?.error?.thoiGian && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error.thoiGian}
                </span>
            )}
        </td>
    );
};
const autocompleteStyle = {
    '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon': {
        '.MuiOutlinedInput-root': {
            padding: '4.5px',
            border: 'none', // Xóa border ở đây
            boxShadow: 'none', // Xóa shadow n
        },
    },
    '& .MuiOutlinedInput-root': {
        padding: '4.5px',
        fontSize: '12px',
        fontWeight: 'normal',
        // width: '200px',
        // backgroundColor: '',
        height: 'fit-content',
        border: 'none', // Xóa border ở đây
        '& .MuiAutocomplete-input': {
            height: '100%',
            width: '100%',
            padding: '0px',
            textOverflow: 'ellipsis',
        },
        '& .MuiAutocomplete-tag': {
            height: '100%',
            width: '100%',
            marginBottom: '-2px',
        },
    },
};
// thêm dữ liệu lớn file tổng hợp
export const workerImportTongHop = () => {
    const workerCode = `
    function convertToFloatForSelectedKeys(obj, keys) {
        const newObj = { ...obj };
        keys.forEach(key => {
            if (newObj[key]) {
                newObj[key] = parseFloat(newObj[key]);
            }
        });
        return newObj;
    }
    let isPaused = false;
    let isCancelled = false;
    const self = this;
    self.onmessage = async function(e) {
        if (e.data.command === 'start') {
            isPaused = false;
            isCancelled = false;
             let isCompletedNotified = false;
           const { initialValues, selectLVS, scope, tinhThanh, coQuanThucHien, API_URI, accessoken, saveCompletedGroups,selectUpload, bieuMau, fileName } = e.data;
            let completedGroups = saveCompletedGroups || 0;
            const totalGroups = initialValues.length;
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        //     const random = Math.floor(Math.random() * 10000);
        //    const newFileName =selectUpload?.key==='taoMoi' ? fileName.split('.')[0]+ "("+ random + ').xlsx': fileName; 
         
            for (let i = completedGroups; i < totalGroups; i++) {
                const group = initialValues[i];
                while (isPaused) {
                    await sleep(1000);
                    self.postMessage({ status: 'paused', group, completedGroups, totalGroups });
                    return;
                }
                
                const dateObject = new Date(\`\${group.nam}-\${group.thang}-\${group.ngay}\`);
                const dateNow = new Date();
                const ngayLapBieu = dateObject.getTime() || dateNow.getTime();
                const values = {
                    ...group,
                    Id: 0,
                    phuDe:'(Số liệu tại '+ selectLVS?.luuVucSong+')',
                    ngayLapBieu: group?.ngayLapBieu? group?.ngayLapBieu: ngayLapBieu,
                    coQuanCapTinh:scope!=='tinh'? 'Bộ Tài nguyên và Môi trường':'UBND '+tinhThanh,
                    hoHoacCongTrinhs: group.hoHoacCongTrinhs.map((ho) => ({ ...ho })),
                    luuVucSong: selectLVS?.luuVucSong,
                    luuVucSongId: selectLVS?.luuVucSongId,
                    tinhThanh: group.tinhThanh,
                    tinhThanhId: group.tinhThanhId,
                    quanHuyenId: group.quanHuyenId,
                    phuongXaId: group.phuongXaId,
                    createdByFile:  fileName,
                    quanHuyen: group.quanHuyen,
                    phuongXa: group.phuongXa,
                };
  
                if (scope === 'dvtt') {
                    values.coQuanThucHien = coQuanThucHien?.tenMuc;
                } else if (scope === 'tw') {
                    values.coQuanThucHien = 'Viện nông hóa thổ nhưỡng';
                }else{
                    values.coQuanThucHien = 'Sở tài nguyên và môi trường';
                }
                
  
                let dataToSend = convertToFloatForSelectedKeys(values, ['soLuongGieng', 'chieuSauKhaiThac', 'luuLuongKhaiThac']);
                if (bieuMau === '19') {
                    dataToSend = convertToFloatForSelectedKeys(values, ['soLuongGieng', 'chieuSauKhaiThac', 'luuLuongKhaiThac']);
                } else if (bieuMau === '17') {
                    dataToSend = convertToFloatForSelectedKeys({ ...values }, ['luuLuongKhaiThac', 'dienTichTuoi', 'dienTichNuoiTrongThuySan', 'congSuatPhatDien', 'soHoDanDuocCapNuoc']);
                } else if (bieuMau === '21') {
                    dataToSend = convertToFloatForSelectedKeys({ ...values }, ['luuLuongNuocThai', 'luongNuocSuDung']);
                }
  
                try {
                    const response = await fetch(\`\${API_URI}bieumauso\${bieuMau}s-upsert\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessoken}\`,
                        },
                        body: JSON.stringify(dataToSend),
                    });
  
                    if (response.ok) {
                        completedGroups++;
                        const progress = Math.round((completedGroups / totalGroups) * 100);
                        const slHoCongTrinh=values.hoHoacCongTrinhs.length;
                        self.postMessage({ status: 'success', group, completedGroups,slHoCongTrinh, totalGroups, progress });
                        if (completedGroups === totalGroups && !isCompletedNotified) {
                             isCompletedNotified = true;
                            self.postMessage({ status: 'completed', progress });
                        }
                    } else {
                        throw new Error('Lỗi kết nối!');
                    }
                } catch (error) {
                    self.postMessage({ status: 'error', message: error.message });
                    return;
                }
            }
         } else if (e.data.command === 'pause') {
            isPaused = true;
        } else if (e.data.command === 'resume') {
            isPaused = false;
        } else if (e.data.command === 'cancel') {
            self.postMessage({ status: 'cancelled'});
            return;
        }
    }
    `;

    // Tạo Blob từ đoạn mã chuỗi
    const workerBlob = new Blob([workerCode], {
        type: 'application/javascript',
    });
    const workerImportTongHop = new Worker(URL.createObjectURL(workerBlob));
    return workerImportTongHop;
};

export const workerImportChiTiet = () => {
    const workerCode = `
    function convertToFloatForSelectedKeys(obj, keys) {
        const newObj = { ...obj };
        keys.forEach(key => {
            if (newObj[key]) {
                newObj[key] = parseFloat(newObj[key]);
            }
        });
        return newObj;
    }
   
    let isPaused = false;
    let isCancelled = false;
    const self = this;
    self.onmessage = async function(e) {
        if (e.data.command === 'start') {
            isPaused = false;
            isCancelled = false;
             let isCompletedNotified = false; 
           const { initialValues, selectLVS, scope,tinhThanh, coQuanThucHien, API_URI, accessoken, saveCompletedGroups, selectUpload,bieuMau, fileName } = e.data;
            let completedGroups = saveCompletedGroups || 0;
            const totalGroups = initialValues.length;
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        //       const random = Math.floor(Math.random() * 10000);
        //    const newFileName =selectUpload?.key==='taoMoi' ? fileName.split('.')[0] + "("+random + ').xlsx': fileName; 
      
            for (let i = completedGroups; i < totalGroups; i++) {
                const group = initialValues[i];
                while (isPaused) {
                    await sleep(1000);
                    self.postMessage({ status: 'paused', group, completedGroups, totalGroups });
                    return;
                }
                // if (isCancelled) {
                //     self.postMessage({ status: 'cancelled', group, completedGroups: 0, progress: 0 });
                //     return;
                // }
                const dateObject = new Date(\`\${group.nam}-\${group.thang}-\${group.ngay}\`);
                const dateNow = new Date();
                const ngayLapBieu = dateObject.getTime() || dateNow.getTime();
                  const values = {
                        ...group,
                        Id: 0,
                        phuDe:'(Số liệu tại '+ bieuMau==='18'? group?.luuVucSong : selectLVS?.luuVucSong+')',
                        coQuanCapTinh:scope!=='tinh'? 'Bộ Tài nguyên và Môi trường':'UBND '+tinhThanh,
                        luuVucSong: bieuMau==='18'? group?.luuVucSong:selectLVS?.luuVucSong,
                        luuVucSongId:bieuMau==='18'?'': selectLVS?.luuVucSongId,
                        createdByFile: fileName,
                    };
                if (scope === 'dvtt') {
                    values.coQuanThucHien = coQuanThucHien?.tenMuc;
                } else if (scope === 'tw') {
                    values.coQuanThucHien = 'Viện nông hóa thổ nhưỡng';
                }else{
                    values.coQuanThucHien = 'Sở tài nguyên và môi trường';
                }
                const data={...values}
  
               
                try {
                    const response = await fetch(\`\${API_URI}bieumauso\${bieuMau}s-upsert\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessoken}\`,
                        },
                        body: JSON.stringify(data),
                    });
  
                    if (response.ok) {
                        completedGroups++;
                        const progress = Math.round((completedGroups / totalGroups) * 100);
                        self.postMessage({ status: 'success', group, completedGroups, totalGroups, progress });
  
                         if (completedGroups === totalGroups && !isCompletedNotified) {
                             isCompletedNotified = true;
                            self.postMessage({ status: 'completed', progress });
                        }
                    } else {
                        throw new Error('Lỗi kết nối!');
                    }
                } catch (error) {
                    self.postMessage({ status: 'error', message: error.message });
                    return;
                }
            }
         } else if (e.data.command === 'pause') {
            isPaused = true;
        } else if (e.data.command === 'resume') {
            isPaused = false;
        } else if (e.data.command === 'cancel') {
            self.postMessage({ status: 'cancelled'});
            return;
        }
    }
    `;

    // Tạo Blob từ đoạn mã chuỗi
    const workerBlob = new Blob([workerCode], {
        type: 'application/javascript',
    });
    const workerImportTongHop = new Worker(URL.createObjectURL(workerBlob));
    return workerImportTongHop;
};

export const workerExport = () => {
    const worker_code = `
        import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

        onmessage = async function (e) {
            const { arrayBuffer } = e.data; // Nhận ArrayBuffer từ main thread
            try {
                // Đọc tệp Excel từ ArrayBuffer
                   const startTime = performance.now(); // Bắt đầu đo thời gian
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                // nếu file trống thì thông báo lỗi 

                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    postMessage({ status: 'error', message: 'File không có dữ liệu' });
                    return;
                }

                // Lấy tên sheet đầu tiên
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Đọc dữ liệu từ sheet chỉ định
                let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                // Xóa các hàng trống ngay từ đầu
                rows = rows.filter(row => !row.every(cell => cell === ""));
                if(rows?.length===0){
                    postMessage({ status: 'error', message: 'File không có dữ liệu' });
                    return;
                }
                // Trả dữ liệu về main thread
                postMessage({
                    status: 'success',
                    data: rows,
                });
                const endTime = performance.now(); 
                console.log('Thời gian đọc file: ', (endTime - startTime).toFixed(2) + 'ms');
                console.log('rows', rows);

            } catch (error) {
                postMessage({ status: 'error', message: 'Có lỗi xảy ra khi đọc tệp Excel: ' + error.message });
            }
        };
    `;

    const workerExport = new Worker(
        URL.createObjectURL(
            new Blob([worker_code], { type: 'text/javascript' })
        ),
        { type: 'module' }
    );

    return workerExport;
};

export const layDuLieu = () => {
    const worker_code = `
    onmessage = async function (e) {
        const { API_URI, doiTuong, accessToken, limit,bieuMau } = e.data; // Nhận tham số từ main thread
        let page = 1;
        let allData = [];
        // Hàm để gọi API theo trang
        let includeBieuMauSo18= bieuMau==='BieuMauSo18'?true:false;
        let includeBieuMauSo20= bieuMau==='BieuMauSo20'?true: false;
        let includeBieuMauSo22= bieuMau==='BieuMauSo22'?true: false;
        const bieuMauSelect= bieuMau!=='All'? bieuMau:'';
        async function fetchData() {
            try {
                const initialResponse = await fetch(\`\${API_URI}\${doiTuong}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: \`Bearer \${accessToken}\`,
                    },
                    body: JSON.stringify({ page, limit,bieuMau:bieuMauSelect,includeBieuMauSo18,includeBieuMauSo20 ,includeBieuMauSo22}),
                });
                const initialData = await initialResponse.json();
                allData = allData.concat(initialData.records || []);
                const totalRecords = initialData.count; // Lấy tổng số bản ghi phải lấy

                // Gửi dữ liệu của trang đầu tiên về main thread
                // Tính toán phần trăm dữ liệu đã tải
                let progressPercentage = (allData.length / totalRecords) * 100;
                postMessage({
                    status: 'progress',
                    data: allData,
                    progressExport: Math.round(progressPercentage) 
                });

                while (allData.length < totalRecords) {
                    page++; // Tăng page để lấy trang tiếp theo
                    const response = await fetch(\`\${API_URI}\${doiTuong}\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessToken}\`,
                        },
                       body: JSON.stringify({ page, limit,bieuMau:bieuMauSelect,includeBieuMauSo18,includeBieuMauSo20 ,includeBieuMauSo22}),
                    });
                    const data = await response.json();
                    // Nếu số bản ghi trong lần gọi này vượt quá số bản ghi còn thiếu
                    const remainingRecords = totalRecords - allData.length;
                   if (responseTime <= 10) {
                        limit *= 2; // Tăng gấp đôi nếu thời gian phản hồi <= 10 giây
                    } else if (responseTime > 10 && responseTime <= 20) {
                        // Giữ nguyên limit nếu thời gian phản hồi nằm trong khoảng từ 10 đến 20 giây
                        limit = limit;
                    } else if (responseTime > 20) {
                        limit = Math.max(100, Math.floor(limit / 2)); // Giảm một nửa nhưng không dưới 100 nếu thời gian phản hồi > 20 giây
                    }
                   progressPercentage = (allData.length / totalRecords) * 100;
                    postMessage({
                        status: 'progress',
                        data: allData,
                        progressExport: Math.round(progressPercentage) 
                    });
                    // delay 1s để tránh gọi API quá nhanh
                    // await new Promise(resolve => setTimeout(resolve, 300));
                    
                }

                // Gửi tất cả dữ liệu sau khi lấy xong
                postMessage({
                    status: 'success',
                    data: allData,
                    progressExport:100,
                });

            } catch (error) {
                postMessage({ status: 'error', message: 'Có lỗi xảy ra: ' + error.message });
            }
        }

        // Bắt đầu gọi API
        fetchData();
    };
    `;

    const workerExport = new Worker(
        URL.createObjectURL(
            new Blob([worker_code], { type: 'text/javascript' })
        ),
        { type: 'module' }
    );

    return workerExport;
};

export const layDuLieuTongHop = () => {
    const worker_code = `
    onmessage = async function (e) {
        const { API_URI, doiTuong,limitProgess, accessToken,data } = e.data; // Nhận tham số từ main thread
        let limit = limitProgess||1000;
        let page = 1;
        let allData = [];
        const bieuMau=data?.bieuMau;
        const loaiDiaDiem=data?.loaiDiaDiem;
        const tinhThanhIds=data?.tinhThanhIds;
        const luuVucSongIds=data?.luuVucSongIds;
        const coQuanThucHienIds=data?.coQuanThucHienIds;
        const quyMoGt= data?.quyMoGt;
        const quyMoLte= data?.quyMoLte;
        const nam= data?.nam;
        const chatLuongNuocMat= data?.chatLuongNuocMat;
        let groupByDVHC = true;
        let includeBieuMauSo18 = true;
        let includeBieuMauSo20 = true;
        let includeBieuMauSo22 = true;
        const bieuMauSelect= bieuMau!=='All'? bieuMau:'';
        // Hàm để gọi API theo trang
        async function fetchData() {
            try {
                const initialResponse = await fetch(\`\${API_URI}\${doiTuong}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: \`Bearer \${accessToken}\`,
                    },
                    body: JSON.stringify({chatLuongNuocMat, groupByDVHC,loaiDiaDiem,page, limit,nam,quyMoGt,quyMoLte, tinhThanhIds,luuVucSongIds,coQuanThucHienIds,bieuMau,includeBieuMauSo18,includeBieuMauSo20,includeBieuMauSo22}),
                });
                const initialData = await initialResponse.json();
                allData = allData.concat(initialData.records || []);
                const totalRecords = initialData.count; // Lấy tổng số bản ghi phải lấy

                // Gửi dữ liệu của trang đầu tiên về main thread
                // Tính toán phần trăm dữ liệu đã tải
                let progressPercentage = (allData.length / totalRecords) * 100;
                postMessage({
                    status: 'progress',
                    data: allData,
                    progressExport:progressPercentage.toFixed(2),
                    countTH:totalRecords
                });
                while (allData.length < totalRecords) {
                    const start = Date.now();
                    page++; // Tăng page để lấy trang tiếp theo
                    const response = await fetch(\`\${API_URI}\${doiTuong}\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessToken}\`,
                        },
                    body: JSON.stringify({chatLuongNuocMat,groupByDVHC,loaiDiaDiem, page, limit,nam,quyMoGt,quyMoLte ,tinhThanhIds,luuVucSongIds,coQuanThucHienIds,bieuMau,includeBieuMauSo18,includeBieuMauSo20,includeBieuMauSo22}),
                    });

                    const data = await response.json();
                    const end = Date.now();
                       const responseTime = (end - start) / 1000; // Đổi ra giây
                    // Nếu số bản ghi trong lần gọi này vượt quá số bản ghi còn thiếu
                    const remainingRecords = totalRecords - allData.length;
                    if (data.records.length > remainingRecords) {
                        allData = allData.concat(data.records.slice(0, remainingRecords)); // Chỉ lấy số bản ghi còn thiếu
                        console.log('allData1',allData);
                    } else {
                        allData = allData.concat(data.records || []);
                        console.log('allData2',allData);
                    }
                    if (responseTime <= 10) {
                        limit *= 2; // Tăng gấp đôi nếu thời gian phản hồi <= 10 giây
                    } else if (responseTime > 10 && responseTime <= 20) {
                        // Giữ nguyên limit nếu thời gian phản hồi nằm trong khoảng từ 10 đến 20 giây
                        limit = limit;
                    } else if (responseTime > 20) {
                        limit = Math.max(100, Math.floor(limit / 2)); // Giảm một nửa nhưng không dưới 100 nếu thời gian phản hồi > 20 giây
                    }
                   progressPercentage = (allData.length / totalRecords) * 100;
                    postMessage({
                        status: 'progress',
                        // data: allData,
                        limitCall:limit,
                         progressExport:progressPercentage.toFixed(2) ,
                    });
                    // delay 1s để tránh gọi API quá nhanh
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                }

                // Gửi tất cả dữ liệu sau khi lấy xong
                postMessage({
                    status: 'success',
                    data: allData,
                    progressExport:100,
                });

            } catch (error) {
                postMessage({ status: 'error', message: 'Có lỗi xảy ra: ' + error.message });
            }
        }

        // Bắt đầu gọi API
        fetchData();
    };
    `;

    const workerExport = new Worker(
        URL.createObjectURL(
            new Blob([worker_code], { type: 'text/javascript' })
        ),
        { type: 'module' }
    );

    return workerExport;
};
export const generatePDF = () => {
    const self = this;
    self.onmessage = function (e) {
        const { data, pageCount, rowsPerPage, scale, pageWidth, pageHeight } =
            e.data;

        // Make sure jsPDF is available. Import the script if using it inside a worker.
        // For this example, we're assuming that jsPDF has been made available globally in the worker context.

        // Initialize jsPDF instance
        const { jsPDF } = self; // Assuming `jsPDF` is available globally in the worker

        const pdf = new jsPDF();
        let currentPage = 0;

        // Loop through each page of data and render it to the PDF
        for (let i = 0; i < pageCount; i++) {
            const startRow = i * rowsPerPage;
            const endRow = Math.min(startRow + rowsPerPage, data.length);
            const currentRows = data.slice(startRow, endRow);

            if (i > 0) {
                pdf.addPage(); // Add a new page for each set of data
            }

            // Draw the data on the PDF
            currentRows.forEach((item, index) => {
                const y = 10 + index * 10;
                pdf.text(
                    `Row ${startRow + index + 1}: ${item.field1} | ${item.field2} | ${item.field3}`,
                    10,
                    y
                );
                // Modify this rendering logic based on your data and layout requirements
            });

            // If it's the last page, add footer
            if (i === pageCount - 1) {
                pdf.text('Footer text here', 10, pageHeight - 10);
            }
        }

        // Send the generated PDF back to the main thread
        postMessage({ status: 'success', pdf: pdf.output('arraybuffer') });
    };
};

export const layDuLieuTuTuKhiCuon = () => {
    const worker_code = `
    onmessage = async function (e) {
        const { API_URI, doiTuong, accessToken,data, limitProgess,isContinueFetch, page, totalData, dataCalled } = e.data;
        let allData = [...dataCalled]; // Dữ liệu cũ + mới
        let limit = limitProgess||1000; 
        const bieuMau=data?.bieuMau;
        const loaiDiaDiem=data?.loaiDiaDiem;
        const loaiNguonNuoc=data?.loaiNguonNuoc;
        const tinhThanhIds=data?.tinhThanhIds;
        const luuVucSongIds=data?.luuVucSongIds;
        const coQuanThucHienIds=data?.coQuanThucHienIds;
        const chatLuongNuocMat= data?.chatLuongNuocMat;
        const quyMoGt= data?.quyMoGt;
        const quyMoLte= data?.quyMoLte;
        const nam= data?.nam;
        let includeBieuMauSo18 = true;
        let includeBieuMauSo20 = true;
        let includeBieuMauSo22 = true;
        let groupByDVHC=true;
        async function fetchData() {
            try {
                // Chỉ gọi API trang đầu tiên
                if (page === 1) {
                    const initialResponse = await fetch(\`\${API_URI}\${doiTuong}\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessToken}\`,
                        },
                        body: JSON.stringify({
                            page, limit,loaiDiaDiem,chatLuongNuocMat,nam,groupByDVHC, tinhThanhIds,loaiNguonNuoc, luuVucSongIds,quyMoGt,quyMoLte, coQuanThucHienIds, bieuMau, includeBieuMauSo18, includeBieuMauSo20, includeBieuMauSo22
                        }),
                    });

                    const initialData = await initialResponse.json();
                    allData = allData.concat(initialData.records || []);
                    const totalRecords = initialData.count;

                    postMessage({
                        status: 'progress',
                        data: allData,
                        progressExport: ((allData.length / totalRecords) * 100).toFixed(2),
                        countTH: totalRecords,
                        page,
                    });
                }

                // Fetch dữ liệu cho các trang còn lại
                while (dataCalled.length < totalData && isContinueFetch && page > 1) {
                     const start = Date.now();
                    const response = await fetch(\`\${API_URI}\${doiTuong}\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: \`Bearer \${accessToken}\`,
                        },
                        body: JSON.stringify({
                            page, limit,loaiDiaDiem,chatLuongNuocMat,nam, groupByDVHC,tinhThanhIds,loaiNguonNuoc, luuVucSongIds,quyMoGt,quyMoLte, coQuanThucHienIds, bieuMau, includeBieuMauSo18, includeBieuMauSo20, includeBieuMauSo22
                        }),
                    });

                    const data = await response.json();
                      const end = Date.now();
                    const remainingRecords = totalData - dataCalled.length;
                    const responseTime = (end - start) / 1000; // Đổi ra giây
                    console.log('responseTime', responseTime);  
                    // Cập nhật dữ liệu gọi thêm
                    if (data.records.length > remainingRecords) {
                        allData = dataCalled.concat(data.records.slice(0, remainingRecords));
                    } else {
                        allData = dataCalled.concat(data.records || []);
                    }
                    if (responseTime <= 10) {
                        limit *= 2;
                    } else if (responseTime > 20) {
                        limit = Math.max(100, Math.floor(limit / 2)); // Giảm một nửa nhưng không dưới 100
                    }
                    // Tiến độ
                    let progressPercentage = (allData.length / totalData) * 100;
                    postMessage({
                        status: 'progress',
                        data: allData,
                        progressExport: progressPercentage.toFixed(2),
                        countTH: totalData,
                        page,
                        limitCall:limit,
                    });
           
                    // Tạm dừng giữa các lần gọi API
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Cập nhật trang
                    page++;
                }
            } catch (error) {
                postMessage({ status: 'error', message: 'Có lỗi xảy ra: ' + error.message });
            }
        }

        fetchData();
    };
    `;

    const workerExport = new Worker(
        URL.createObjectURL(
            new Blob([worker_code], { type: 'text/javascript' })
        ),
        { type: 'module' }
    );

    return workerExport;
};

const textStyle = (fontWeight, border) => {
    return {
        width: '100%',
        '.MuiFormHelperText-root': {
            color: '#f44335 !important',
            marginTop: '5px !important',
            marginRight: '0px',
            marginLeft: '0px',
            paddingLeft: '5px !important',
        },
        '& .MuiAutocomplete-endAdornment': {
            display: 'none',
        },
        '& .MuiOutlinedInput-root': {
            border: 'none', // Xóa border của TextField
            '& fieldset': {
                border: border ? '1px solid #cbd5e0 !important' : 'none',
            },
            fontWeight: fontWeight || 'normal',
        },

        // '& .MuiOutlinedInput-root': {
        //     '& fieldset': {
        //         borderColor: errors ? '#e91e63 !important' : '#cbd5e0 !important',
        //     },
        //     '&:hover fieldset': {
        //         borderColor: '#cbd5e0 !important',
        //     },
        //     '&.Mui-focused fieldset': {
        //         border: errors ? '1px solid #e91e63 !important' : '1px solid #cbd5e0 !important',
        //     },
        // },
        '& .MuiOutlinedInput-input.Mui-disabled': {
            WebkitTextFillColor: '#00000099',
        },
        '& .MuiInputBase-input': {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        '& .MuiAutocomplete-tag': {
            backgroundColor: 'transparent !important',
            border: 'none !important',
            color: '#000', // Adjust text color as needed
            fontWeight: 'normal',
            padding: '0 !important',
            margin: '0 5px 0 0 !important',
            boxShadow: 'none !important',
            '& .MuiChip-deleteIcon': {
                display: 'none', // Hide the delete icon
            },
        },
    };
};

export const LVSSelect = ({ rowData, setRowData }) => {
    const LVSs = useSelector((state) => state.app?.luuVucSongs || []);
    let defaultLVS =
        LVSs.find(
            (lvs) =>
                lvs.maMuc === rowData?.luuVucSongId ||
                lvs.tenMuc === rowData?.luuVucSongId ||
                lvs.tenMuc === rowData?.luuVucSong
        ) || null;
    const [luuVucSong, setLuuVucSong] = useState(defaultLVS);

    return (
        <td style={{ textAlign: 'center' }}>
            <Autocomplete
                options={LVSs || []}
                title={luuVucSong}
                value={luuVucSong}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle()}
                        placeholder="Chọn lưu vực sông"
                    />
                )}
                onChange={(e, value) => {
                    if (luuVucSong && luuVucSong.maMuc === value?.maMuc) {
                        return;
                    }
                    setLuuVucSong(value);
                    setRowData({
                        _id: rowData._id,
                        luuVucSong: value?.tenMuc,
                        luuVucSongId: value?.maMuc,
                    });
                }}
                sx={autocompleteStyle}
            />

            {rowData.error?.luuVucSong && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.luuVucSong}
                </span>
            )}
        </td>
    );
};
export const QuanHuyenSelect = ({ onSelect, tinhThanhId, quanHuyenId }) => {
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const defaultTinhThanh = useMemo(
        () =>
            tinhThanh0s.find(
                (tinhThanh0) =>
                    tinhThanh0.ma === tinhThanhId ||
                    tinhThanh0.tenRutGon === tinhThanhId
            ) || null,
        [tinhThanhId, tinhThanh0s]
    );

    const defaultQuanHuyen = useMemo(
        () =>
            defaultTinhThanh?.quanHuyens?.find(
                (quanHuyen) =>
                    quanHuyen.ma === quanHuyenId ||
                    quanHuyen.tenRutGon === quanHuyenId
            ) || null,
        [defaultTinhThanh, quanHuyenId]
    );

    const currentValue = useMemo(() => {
        if (defaultQuanHuyen) return defaultQuanHuyen;
        if (quanHuyenId) return { ma: '', tenRutGon: quanHuyenId };
        return null;
    }, [defaultQuanHuyen, quanHuyenId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (currentValue?.ma !== value?.ma) {
                onSelect({
                    quanHuyen: value?.tenRutGon,
                    quanHuyenId: value?.ma,
                });
            }
        },
        [currentValue, onSelect]
    );

    const handleInputChange = useCallback(
        (e, value) => {
            if (value !== '' && value === currentValue?.tenRutGon) {
                onSelect({ quanHuyen: value, quanHuyenId: currentValue?.ma });
            }
            else {
                onSelect({ quanHuyen: value, quanHuyenId: '' });
            }
        },
        [currentValue, onSelect]
    );

    return (
        <Autocomplete
            options={defaultTinhThanh?.quanHuyens || []}
            value={currentValue}
            freeSolo={!tinhThanhId ? false : true}
            title={currentValue?.tenRutGon || ''}
            getOptionLabel={(option) => option.tenRutGon || ''}
            isOptionEqualToValue={(option, value) =>
                option.ma === value.ma || option.tenRutGon === value.tenRutGon
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle()}
                    placeholder={"Chọn quận huyện"}
                />
            )}
            onChange={handleSelect}
            onInputChange={handleInputChange}
            sx={autocompleteStyle}
            noOptionsText={'Cần chọn tỉnh thành!'}
        />
    );
};
export const PhuongXaSelect = ({
    onSelect,
    tinhThanhId,
    quanHuyenId,
    phuongXaId,
    autoFocus,
}) => {
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);

    const defaultTinhThanh = useMemo(() => {
        return (
            tinhThanh0s.find(
                (tinhThanh0) =>
                    tinhThanh0.ma === tinhThanhId ||
                    tinhThanh0.tenRutGon === tinhThanhId
            ) || null
        );
    }, [tinhThanhId, tinhThanh0s]);

    const defaultQuanHuyen = useMemo(() => {
        return (
            defaultTinhThanh?.quanHuyens?.find(
                (quanHuyen) =>
                    quanHuyen.ma === quanHuyenId ||
                    quanHuyen.tenRutGon === quanHuyenId
            ) || null
        );
    }, [defaultTinhThanh, quanHuyenId]);

    const defaultPhuongXa = useMemo(() => {
        return (
            defaultQuanHuyen?.phuongXas?.find(
                (phuongXa) =>
                    phuongXa.ma === phuongXaId ||
                    phuongXa.tenRutGon === phuongXaId
            ) || null
        );
    }, [defaultQuanHuyen, phuongXaId]);

    const currentValue = useMemo(() => {
        if (defaultPhuongXa) return defaultPhuongXa;
        if (phuongXaId) return { ma: '', tenRutGon: phuongXaId };
        return null;
    }, [defaultPhuongXa, phuongXaId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (currentValue?.ma !== value?.ma) {
                onSelect({
                    phuongXa: value?.tenRutGon || '',
                    phuongXaId: value?.ma || '',
                });
            }
        },
        [currentValue, onSelect]
    );
    const handleInputChange = useCallback(
        (e, value) => {
            if (value !== '' && value === currentValue?.tenRutGon) {
                onSelect({ phuongXa: value, phuongXaId: currentValue?.ma });
            }
            else {
                onSelect({ phuongXa: value, phuongXaId: '' });
            }
        },
        [currentValue, onSelect]
    );
    return (
        <Autocomplete
            options={defaultQuanHuyen?.phuongXas || []}
            value={currentValue}
            freeSolo={(!tinhThanhId || !quanHuyenId) ? false : true}
            autoFocus={autoFocus}
            title={currentValue?.tenRutGon || ''}
            getOptionLabel={(option) => option.tenRutGon || ''}
            isOptionEqualToValue={(option, value) =>
                option.ma === value.ma || option.tenRutGon === value.tenRutGon
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle()}
                    placeholder="Chọn phường xã"
                />
            )}
            onChange={handleSelect}
            onInputChange={handleInputChange}
            sx={autocompleteStyle}
            noOptionsText={!tinhThanhId ? 'Cần chọn tỉnh thành' : 'Cần chọn quận huyện'}
        />
    );
};
export const TinhThanhSelect = ({ onSelect, tinhThanhId, fontWeight }) => {
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const { scope } = useSelector((state) => state.auth);

    const tinhThanh = useMemo(() => {
        const found = tinhThanh0s.find(
            (tinhThanh0) =>
                tinhThanh0.ma === tinhThanhId ||
                tinhThanh0.tenRutGon === tinhThanhId
        );
        return (
            found || (tinhThanhId ? { tenRutGon: tinhThanhId, ma: '' } : null)
        );
    }, [tinhThanhId, tinhThanh0s]);
    const currentValue = useMemo(() => {
        if (tinhThanh) return tinhThanh;
        if (tinhThanhId) return { ma: '', tenRutGon: tinhThanhId };
        return null;
    }, [tinhThanh, tinhThanhId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (value?.ma && currentValue?.ma !== value.ma) {
                onSelect({
                    tinhThanh: value.tenRutGon,
                    tinhThanhId: value.ma,
                });
            }
        },
        [currentValue, onSelect]
    );

    const handleInputChange = useCallback(
        (e, value) => {
            if (value && value.trim() !== currentValue?.tenRutGon) {
                onSelect({ tinhThanh: value, tinhThanhId: '' });
            }
        },
        [currentValue, onSelect]
    );

    return (
        <Autocomplete
            options={
                scope === 'tinh' && tinhThanhId ? [currentValue] : tinhThanh0s || []
            }
            readOnly={scope === 'tinh'}
            value={currentValue}
            title={currentValue?.tenRutGon || ''}
            getOptionLabel={(option) => option?.tenRutGon || ''}
            isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                return option.ma === value.ma;
            }}
            freeSolo
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle(fontWeight)}
                    placeholder={
                        tinhThanh?.tenRutGon
                            ? `Đã chọn: ${tinhThanh.tenRutGon}`
                            : 'Chọn tỉnh thành'
                    }
                />
            )}

            onChange={handleSelect}
            onInputChange={handleInputChange}
            sx={autocompleteStyle}
        />
    );
};
export const TinhThanhSelectFilter = ({ onSelect, tinhThanhId }) => {
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);

    const tinhThanh = useMemo(
        () =>
            tinhThanh0s.find(
                (tinhThanh0) =>
                    tinhThanh0.ma === tinhThanhId ||
                    tinhThanh0.tenRutGon === tinhThanhId
            ) || { tenRutGon: tinhThanhId, ma: '', label: tinhThanhId },
        [tinhThanhId, tinhThanh0s]
    );

    const handleSelect = useCallback(
        (e, value) => {
            if (tinhThanh?.ma !== value?.ma) {
                onSelect({
                    tinhThanh: value?.tenRutGon,
                    tinhThanhId: value?.ma,
                });
            }
        },
        [tinhThanh, onSelect]
    );

    const handleInputChange = useCallback(
        (e, value) => {
            if (value !== '') {
                onSelect({ tinhThanh: value, tinhThanhId: value });
            }
        },
        [onSelect]
    );

    return (
        <Autocomplete
            options={tinhThanh0s || []}
            value={tinhThanh}
            freeSolo
            title={tinhThanh?.tenRutGon || ''}
            getOptionLabel={(option) => option?.tenRutGon || ''}
            isOptionEqualToValue={(option, value) => option?.ma === value?.ma}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle()}
                    placeholder={
                        tinhThanh?.tenRutGon
                            ? `Đã chọn: ${tinhThanh.tenRutGon}`
                            : 'Chọn tỉnh thành'
                    }
                />
            )}
            onChange={handleSelect}
            onInputChange={handleInputChange}
            sx={autocompleteStyle}
        />
    );
};

export const UploadFiles = ({
    keyIndex,
    initialValues,
    onChange,
    title = '',
    ...props
}) => {
    const [buckget, setBuckget] = React.useState(initialValues || []);
    const [files, setFiles] = React.useState([]);
    React.useEffect(() => {
        if (!initialValues) return;
        setBuckget([...initialValues]);
    }, [initialValues]);
    const handleUploadFiles = async (files) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                formData.append('files', file);
            }
            const response = await new Api().UploadFile({ data: formData });
            if (Array.isArray(response)) {
                setBuckget([...buckget, ...response]);
                onChange([...buckget, ...response]);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
        }
    };
    const deleteFile = (file) => {
        const _buckget = buckget.filter(
            (item) => item?.file_path !== file?.file_path
        );
        setBuckget(_buckget);
        onChange(_buckget);
    };
    React.useEffect(() => {
        if (files.length === 0) return;
        handleUploadFiles(files);
    }, [files]);

    React.useEffect(() => {
        onChange(buckget);
    }, [buckget]);
    const id = React.useId();

    return (
        <div {...props}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <p>{title}</p>
            </div>
            {buckget.length === 0 ? (
                <p style={{ fontStyle: 'italic' }}>Bạn chưa chọn ảnh nào!</p>
            ) : (
                <div className="images-list">
                    {buckget?.length > 0 &&
                        buckget.map((item, index) => (
                            <div key={keyIndex}>
                                <p style={{ fontStyle: 'italic' }}>
                                    Ảnh {index + 1}
                                </p>
                                <img
                                    height={300}
                                    src={new Api().getImage(item?.file_path)}
                                    alt=""
                                />
                                <Tooltip title="Xóa ảnh">
                                    <IconButton
                                        aria-label={'Xóa ảnh'}
                                        size="large"
                                        onClick={() => deleteFile(item)}
                                    >
                                        <DeleteForeverRounded
                                            sx={{
                                                color: '#f44336',
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                                <hr />
                            </div>
                        ))}
                </div>
            )}

            <label
                className="no_print"
                htmlFor={'input' + id}
                style={{ paddingTop: 12 }}
            >
                <MyButton
                    variant="outlined"
                    component="span"
                    txt="Chọn ảnh"
                    mt={5}
                    color="primary"
                    startIcon={<FileUpload />}
                />
                <input
                    id={'input' + id}
                    type="file"
                    multiple
                    style={{
                        display: 'none',
                    }}
                    onChange={(e) => {
                        console.log(e.target.files);
                        setFiles(e.target.files);
                    }}
                />
            </label>
        </div>
    );
};
export const LuuVucSongSelect2 = ({ onSelect, luuVucSongId, fontWeight }) => {
    const { scope } = useSelector((state) => state.auth);
    let LVSs = []
    if (scope === 'tinh') {
        LVSs = useSelector((state) => state.app?.luuVucSongs || []);
    }
    else {
        LVSs = useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs || []);
    }
    const luuVucSong = useMemo(() => {
        const found = LVSs.find(
            (luuVucSong0) =>
                luuVucSong0.maMuc === luuVucSongId ||
                luuVucSong0.tenMuc === luuVucSongId
        );
        return found || { tenMuc: luuVucSongId || '', maMuc: luuVucSongId || '' };
    }, [luuVucSongId, LVSs]);

    const handleSelect = useCallback(
        (e, value) => {
            if (value?.maMuc) {
                onSelect({ luuVucSong: value.tenMuc, luuVucSongId: value.maMuc });
            }
        },
        [onSelect]
    );

    const handleInputChange = useCallback(
        (e, value) => {
            if (value && value.trim() !== luuVucSong?.tenMuc) {
                onSelect({ luuVucSong: value, luuVucSongId: '' });
            }
        },
        [luuVucSong, onSelect]
    );

    return (
        <Autocomplete
            options={LVSs || []}
            value={luuVucSong}
            getOptionLabel={(option) => option.tenMuc || ''}
            isOptionEqualToValue={(option, value) =>
                option?.maMuc === value?.maMuc
            }
            freeSolo
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle(fontWeight)}
                    placeholder="Chọn Lưu vực sông"
                />
            )}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            sx={autocompleteStyle}
        />
    );
};
export const LuuVucSongSelect = ({ onSelect, luuVucSongId, fontWeight, border, readOnly }) => {
    // Lấy dữ liệu lưu vực sông từ Redux
    const { scope } = useSelector((state) => state.auth);
    const luuVucSongNT = useSelector((state) => state.app?.luuVucSongs) || [];
    const luuVucSongLT = useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs) || [];
    const luuVucSongNTNew = [
        ...luuVucSongLT,
        ...luuVucSongNT,
    ];
    const LVSs =
        scope === 'tinh'
            ? luuVucSongNTNew
            : luuVucSongLT;

    const uniqueLVSs = useMemo(() => {
        const map = new Map();
        LVSs.forEach((item) => {
            if (!map.has(item.maMuc)) {
                map.set(item.maMuc, item);
            }
        });
        return Array.from(map.values());
    }, [LVSs]);

    const defaultLuuVucSong = useMemo(
        () =>
            uniqueLVSs.find(
                (item) =>
                    item.maMuc === luuVucSongId || item.tenMuc === luuVucSongId
            ) || null,
        [luuVucSongId, uniqueLVSs]
    );

    const currentValue = useMemo(() => {
        if (defaultLuuVucSong) return defaultLuuVucSong;
        else if (luuVucSongId) return { tenMuc: luuVucSongId, maMuc: '' };
        return null;
    }, [defaultLuuVucSong, luuVucSongId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (currentValue?.maMuc !== value?.maMuc) {
                onSelect({
                    luuVucSong: value?.tenMuc,
                    luuVucSongId: value?.maMuc,
                });
            }
        },
        [currentValue, onSelect]
    );
    const handleInputChange = useCallback(
        (e, value) => {
            if (value !== '' && value === currentValue?.tenMuc) {
                onSelect({ luuVucSong: value, luuVucSongId: currentValue?.maMuc });
            }
            else {
                onSelect({ luuVucSong: value, luuVucSongId: '' });
            }
        },
        [currentValue, onSelect]
    );
    return (
        <>
            <Autocomplete
                readOnly={readOnly}
                options={uniqueLVSs}
                value={currentValue}
                title={currentValue?.tenMuc || ''}
                getOptionLabel={(option) => option.tenMuc || ''}
                isOptionEqualToValue={(option, value) =>
                    option?.maMuc === value?.maMuc
                }
                freeSolo
                renderOption={(props, option) => (
                    <li {...props} key={option.maMuc || option.tenMuc}>
                        {option.tenMuc}
                    </li>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle(fontWeight, border)}
                        placeholder={readOnly ? '' : "Chọn Lưu vực sông"}
                    />
                )}
                onInputChange={handleInputChange}
                onChange={handleSelect}
                sx={autocompleteStyle}
            />
        </>
    );
};
export const NguonNuocNgamSelect = ({ onSelect, nguonNuocId, fontWeight, border }) => {
    let LVSs = useSelector((state) => state.app?.nguonNuocNgams || []);
    // Lấy dữ liệu lưu vực sông từ Redux


    const defaultLuuVucSong = useMemo(
        () =>
            LVSs.find(
                (item) =>
                    item.tangChuaNuoc === nguonNuocId
            ) || null,
        [nguonNuocId, LVSs]
    );

    const currentValue = useMemo(() => {
        if (defaultLuuVucSong) return defaultLuuVucSong;
        else if (nguonNuocId) return { tangChuaNuoc: nguonNuocId };
        return null;
    }, [defaultLuuVucSong, nguonNuocId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (currentValue?.tangChuaNuoc !== value?.tangChuaNuoc) {
                onSelect({
                    nguonNuoc: value?.tangChuaNuoc,
                });
            }
        },
        [currentValue, onSelect]
    );
    const handleInputChange = useCallback(
        (e, value) => {
            if (value !== '' && value === currentValue?.tangChuaNuoc) {
                onSelect({ nguonNuoc: currentValue?.tangChuaNuoc });
            }
            else {
                onSelect({ nguonNuoc: value });
            }
        },
        [currentValue, onSelect]
    );
    return (
        <Autocomplete
            options={LVSs}
            value={currentValue}
            title={currentValue?.tangChuaNuoc || ''}
            getOptionLabel={(option) => option.tangChuaNuoc || ''}
            isOptionEqualToValue={(option, value) =>
                option?.tangChuaNuoc === value?.tangChuaNuoc
            }
            freeSolo
            renderOption={(props, option) => (
                <li {...props} key={option.tangChuaNuoc}>
                    {option.tangChuaNuoc}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle(fontWeight, border)}
                    placeholder="Chọn hoặc nhập tầng chứa nước"
                />
            )}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            sx={autocompleteStyle}
        />
    );
};

export const NguonNuocSelect = ({ onSelect, nguonNuocId, fontWeight, border, bieu18, luuVucSongId }) => {
    let LVSs = useSelector((state) => state.app?.nguonNuocs || []);
    // Lấy dữ liệu lưu vực sông từ Redux
    if (luuVucSongId) {
        LVSs = LVSs.filter(item => item.luuVucSongId === luuVucSongId)
    }
    const uniqueLVSs = useMemo(() => {
        const map = new Map();
        LVSs.forEach((item) => {
            if (!map.has(item.maSong)) {
                map.set(item.maSong, item);
            }
        });
        return Array.from(map.values());
    }, [LVSs]);

    const defaultLuuVucSong = useMemo(
        () =>
            uniqueLVSs.find(
                (item) =>
                    item.maSong === nguonNuocId || item.ten === nguonNuocId
            ) || null,
        [nguonNuocId, uniqueLVSs]
    );

    const currentValue = useMemo(() => {
        if (defaultLuuVucSong) return defaultLuuVucSong;
        if (nguonNuocId) {
            // Kiểm tra nếu nguonNuocId không khớp, tạo giá trị hợp lệ
            return { ten: nguonNuocId, maSong: '' };
        }
        return null;
    }, [defaultLuuVucSong, nguonNuocId]);

    const handleSelect = useCallback(
        (e, value) => {
            if (currentValue?.maSong !== value?.maSong) {
                onSelect({
                    nguonNuoc: value?.ten,
                    nguonNuocId: value?.maSong,
                    // luuVucSongId: value?.luuVucSongId,
                    // luuVucSong: value?.luuVucSong,
                });
            }
        },
        [currentValue, onSelect]
    );
    const handleInputChange = useCallback(
        (e, value) => {
            const matchedOption = uniqueLVSs.find((item) => item.ten === value);
            if (matchedOption) {
                onSelect({
                    nguonNuoc: matchedOption.ten,
                    nguonNuocId: matchedOption.maSong,
                    // luuVucSongId: matchedOption.luuVucSongId,
                    // luuVucSong: matchedOption.luuVucSong,
                });
            } else {
                onSelect({
                    nguonNuoc: value,
                    nguonNuocId: '',
                    // luuVucSongId: '',
                    // luuVucSong: '',
                });
            }
        },
        [uniqueLVSs, onSelect]
    );
    return (
        <Autocomplete
            options={luuVucSongId ? uniqueLVSs : []}
            value={currentValue}
            title={currentValue?.ten || ''}
            getOptionLabel={(option) => option.ten || ''}
            isOptionEqualToValue={(option, value) =>
                option?.maSong === value?.maSong || option?.ten === value?.ten
            }
            freeSolo={luuVucSongId ? true : false}
            renderOption={(props, option) => (
                <li {...props} key={option.maSong || option.ten}>
                    {option.ten}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={textStyle(fontWeight, border)}
                    placeholder="Chọn hoặc nhập nguồn nước, sông suối"
                />
            )}
            noOptionsText={luuVucSongId ? '' : 'Cần chọn lưu vực sông!'}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            sx={autocompleteStyle}
        />
    );
};
export const DVHCSelect = ({ setRowData, rowData }) => {
    const { tinhThanhId } = useSelector((state) => state?.auth);
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const defaultTinhThanh =
        tinhThanh0s.find(
            (tinhThanh0) =>
                tinhThanh0.ma === tinhThanhId ||
                tinhThanh0.ma === rowData.tinhThanhId ||
                tinhThanh0.ten === rowData.tinhThanh
        ) ||
        rowData.tinhThanh ||
        null;
    const defaultQuanHuyen =
        defaultTinhThanh?.quanHuyens?.find(
            (quanHuyen) => quanHuyen.ma === rowData.quanHuyenId
        ) ||
        rowData.quanHuyen ||
        null;
    const defaultPhuongXa =
        defaultQuanHuyen?.phuongXas?.find(
            (phuongXa) => phuongXa.ma === rowData.phuongXaId
        ) ||
        rowData.phuongXa ||
        null;

    const [tinhThanh, setTinhThanh] = useState(defaultTinhThanh);
    const [quanHuyen, setQuanHuyen] = useState(defaultQuanHuyen);
    const [phuongXa, setPhuongXa] = useState(defaultPhuongXa);

    return (
        <>
            <td style={{ textAlign: 'center' }}>
                <Autocomplete
                    options={quanHuyen?.phuongXas || []}
                    value={phuongXa}
                    title={phuongXa}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            sx={textStyle()}
                            placeholder="Chọn phường xã"
                        />
                    )}
                    onChange={(e, value) => {
                        if (phuongXa && phuongXa.ma === value?.ma) {
                            return;
                        }
                        setPhuongXa(value);
                        setRowData({
                            _id: rowData._id,
                            phuongXa: value?.ten,
                            phuongXaId: value?.ma,
                        });
                    }}
                    sx={autocompleteStyle}
                    noOptionsText={'Cần chọn quận huyện!'}
                />
                {rowData.error?.phuongXa && (
                    <span
                        className="no_print"
                        style={{ color: 'red', fontSize: '10px' }}
                    >
                        {rowData.error?.phuongXa}
                    </span>
                )}
            </td>
            <td style={{ textAlign: 'center' }}>
                <Autocomplete
                    options={tinhThanh?.quanHuyens || []}
                    value={quanHuyen}
                    title={quanHuyen}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            sx={textStyle()}
                            placeholder="Chọn quận huyện"
                        />
                    )}
                    onChange={(e, value) => {
                        if (quanHuyen && quanHuyen.ma === value?.ma) {
                            return;
                        }
                        setQuanHuyen(value);

                        setRowData({
                            _id: rowData._id,
                            quanHuyen: value?.ten,
                            quanHuyenId: value?.ma,
                            phuongXa: undefined,
                            phuongXaId: undefined,
                        });
                    }}
                    sx={autocompleteStyle}
                    noOptionsText={'Cần chọn tỉnh thành!'}
                />
                {rowData.error?.quanHuyen && (
                    <span
                        className="no_print"
                        style={{ color: 'red', fontSize: '10px' }}
                    >
                        {rowData.error?.quanHuyen}
                    </span>
                )}
            </td>
            <td style={{ textAlign: 'center' }}>
                <Autocomplete
                    options={tinhThanhId ? [defaultTinhThanh] : tinhThanh0s}
                    value={tinhThanh}
                    title={tinhThanh}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            sx={textStyle()}
                            placeholder="Chọn tỉnh thành"
                        />
                    )}
                    onChange={(e, value) => {
                        if (tinhThanh && tinhThanh.ma === value?.ma) {
                            return;
                        }
                        setTinhThanh(value);
                        setRowData({
                            _id: rowData._id,
                            tinhThanh: value?.ten,
                            tinhThanhId: value?.ma,
                            quanHuyen: undefined,
                            quanHuyenId: undefined,
                            phuongXa: undefined,
                            phuongXaId: undefined,
                        });
                    }}
                    sx={autocompleteStyle}
                />
                {rowData.error?.tinhThanh && (
                    <span
                        className="no_print"
                        style={{ color: 'red', fontSize: '10px' }}
                    >
                        {rowData.error?.tinhThanh}
                    </span>
                )}
            </td>
        </>
    );
};

export const DVHCSelectBang = ({ values, setFieldData, errors }) => {
    const { tinhThanhId } = useSelector((state) => state?.auth);
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const defaultTinhThanh =
        tinhThanh0s.find(
            (tinhThanh0) =>
                tinhThanh0.ma === tinhThanhId || tinhThanh0.ma === tinhThanhId
        ) || null;
    const defaultQuanHuyen =
        defaultTinhThanh?.quanHuyens?.find(
            (quanHuyen) => quanHuyen.ma === values.quanHuyenId
        ) || null;
    const defaultPhuongXa =
        defaultQuanHuyen?.phuongXas?.find(
            (phuongXa) => phuongXa.ma === values.phuongXaId
        ) || null;

    const [tinhThanh, setTinhThanh] = useState(defaultTinhThanh);
    const [quanHuyen, setQuanHuyen] = useState(defaultQuanHuyen);
    const [phuongXa, setPhuongXa] = useState(defaultPhuongXa);

    return (
        <>
            <Grid container spacing={2} mb={3}>
                <Grid item width={50} />
                <Grid
                    item
                    xs={3.6}
                    display="flex"
                    alignItems="center"
                    id="tinhThanh"
                >
                    <p style={{ fontSize: '13px', width: '150px' }}>
                        Tỉnh/thành phố:
                        <span
                            className="no_print"
                            style={{ color: 'red', margin: '3px' }}
                        >
                            *
                        </span>
                    </p>
                    <Autocomplete
                        options={quanHuyen?.phuongXas || []}
                        value={phuongXa}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                sx={textStyle()}
                                placeholder="Chọn phường xã"
                            />
                        )}
                        onChange={(e, value) => {
                            if (phuongXa && phuongXa.ma === value?.ma) {
                                return;
                            }
                            setPhuongXa(value);
                            setFieldData({
                                phuongXa: value?.ten,
                                phuongXaId: value?.ma,
                            });
                        }}
                        sx={autocompleteStyle}
                        noOptionsText={'Cần chọn quận huyện!'}
                    />
                    {errors?.phuongXa && (
                        <span
                            className="no_print"
                            style={{ color: 'red', fontSize: '10px' }}
                        >
                            {errors?.phuongXa}
                        </span>
                    )}
                    <Grid item xs={3.6} display="flex" alignItems="center">
                        <p style={{ fontSize: '13px', width: '170px' }}>
                            Quận/huyện/thị xã:
                            <span
                                className="no_print"
                                style={{ color: 'red', margin: '3px' }}
                            >
                                *
                            </span>
                        </p>
                        <Autocomplete
                            options={tinhThanh?.quanHuyens || []}
                            value={quanHuyen}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={textStyle()}
                                    placeholder="Chọn quận huyện"
                                />
                            )}
                            onChange={(e, value) => {
                                if (quanHuyen && quanHuyen.ma === value?.ma) {
                                    return;
                                }
                                setQuanHuyen(value);
                                setFieldData({
                                    quanHuyen: value?.ten,
                                    quanHuyenId: value?.ma,
                                    phuongXa: undefined,
                                    phuongXaId: undefined,
                                });
                            }}
                            sx={autocompleteStyle}
                            noOptionsText={'Cần chọn tỉnh thành!'}
                        />
                        {errors?.quanHuyen && (
                            <span
                                className="no_print"
                                style={{ color: 'red', fontSize: '10px' }}
                            >
                                {errors?.quanHuyen}
                            </span>
                        )}
                    </Grid>
                    <Grid
                        item
                        xs={3.6}
                        display="flex"
                        alignItems="center"
                        id="xaPhuong"
                    >
                        <p style={{ fontSize: '13px', width: '170px' }}>
                            Xã/phường/thị trấn:
                            <span
                                className="no_print"
                                style={{ color: 'red', margin: '3px' }}
                            >
                                *
                            </span>
                        </p>
                        <Autocomplete
                            options={
                                tinhThanhId ? [defaultTinhThanh] : tinhThanh0s
                            }
                            value={tinhThanh}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={textStyle()}
                                    placeholder="Chọn tỉnh thành"
                                />
                            )}
                            onChange={(e, value) => {
                                if (tinhThanh && tinhThanh.ma === value?.ma) {
                                    return;
                                }
                                setTinhThanh(value);
                                setFieldData({
                                    tinhThanh: value?.ten,
                                    tinhThanhId: value?.ma,
                                    quanHuyen: undefined,
                                    quanHuyenId: undefined,
                                    phuongXa: undefined,
                                    phuongXaId: undefined,
                                });
                            }}
                            sx={autocompleteStyle}
                        />
                        {errors?.tinhThanh && (
                            <span
                                className="no_print"
                                style={{ color: 'red', fontSize: '10px' }}
                            >
                                {errors?.tinhThanh}
                            </span>
                        )}
                    </Grid>
                    <Grid item width={50} />
                </Grid>
            </Grid>
        </>
    );
};

export const LCTSelect = ({ rowData, setRowData }) => {
    const LCTs = useSelector(
        (state) => state.app?.DanhMucs?.loaiCongTrinhs || []
    );
    const getOptions = React.useMemo(() => {
        const outners = !!!LCTs?.find(s => s.tenMuc === rowData?.loaiCongTrinh) ? [rowData?.loaiCongTrinh] : [];
        return [...LCTs, ...outners?.map(s => ({
            tenMuc: s,
            maMuc: s
        }))];
    }, [LCTs, rowData]);

    const defaultLHNT =
        getOptions.find(
            (lhnt) =>
                lhnt.maMuc === rowData.loaiCongTrinhId ||
                lhnt.tenMuc === rowData.loaiCongTrinh
        ) || null;

    // Nếu không tìm thấy trong danh sách thì dùng giá trị từ rowData
    const [loaiCongTrinh, setLoaiCongTrinh] = useState(
        defaultLHNT || { tenMuc: rowData?.loaiCongTrinh }
    );

    return (
        <td style={{ textAlign: 'center' }}>
            <Autocomplete
                options={getOptions || []}
                value={loaiCongTrinh}
                freeSolo
                onChange={(e, value) => {
                    // Nếu không có trong danh sách, set giá trị từ `value.tenMuc` hoặc giữ nguyên
                    setLoaiCongTrinh(value || { tenMuc: e.target.value });
                    setRowData({
                        _id: rowData._id,
                        loaiCongTrinh: value?.tenMuc || e.target.value,
                        loaiCongTrinhId: value?.maMuc || null,
                    });
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle()}
                        placeholder="Chọn loại công trình"
                    />
                )}
                getOptionLabel={(option) => option.tenMuc || ''}
                renderOption={(props, option) => (
                    <li {...props} key={option.maMuc}>
                        {option.tenMuc}
                    </li>
                )}
                sx={autocompleteStyle}
            />
            {rowData.error?.loaiHinhNuocThaiId && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.loaiHinhNuocThaiId}
                </span>
            )}
        </td>
    );
};
export const LCTSelectNhieu = ({ rowData, setRowData }) => {
    const LCTs = useSelector(
        (state) => state.app?.DanhMucs?.loaiCongTrinhs || []
    );
    const [textPrint, setTextPrint] = useState('');
    const getOptions = React.useMemo(() => {
        const outners = rowData?.loaiCongTrinhs?.filter(i => !Boolean(LCTs?.find(s => s?.tenMuc === i))) ?? [];
        return [...LCTs, ...outners?.map(s => ({
            tenMuc: s,
            maMuc: s
        }))];
    }, [LCTs, rowData]);

    const defaultLCT =
        getOptions.filter(
            (lct) =>
                rowData.loaiCongTrinhIds?.some((id) => id === lct.maMuc) ||
                rowData.loaiCongTrinhIds?.some((id) => id === lct.tenMuc) ||
                rowData.loaiCongTrinhs?.some((id) => id === lct.maMuc) ||
                rowData.loaiCongTrinhs?.some((id) => id === lct.tenMuc)
        ) || [];
    const [loaiCongTrinhIds, setLoaiCongTrinh] = useState(defaultLCT);

    useEffect(() => {
        const defaultLCT =
            getOptions.filter(
                (lct) =>
                    rowData.loaiCongTrinhIds?.some((id) => id === lct.maMuc) ||
                    rowData.loaiCongTrinhIds?.some(
                        (id) => id === lct.tenMuc
                    ) ||
                    rowData.loaiCongTrinhs?.some((id) => id === lct.maMuc) ||
                    rowData.loaiCongTrinhs?.some((id) => id === lct.tenMuc)
            ) || [];
        setLoaiCongTrinh(defaultLCT);
    }, [rowData.loaiCongTrinhIds, getOptions, rowData.loaiCongTrinhs]);


    return (
        <td style={{ textAlign: 'center' }}>
            <div className="no_print">
                <Autocomplete
                    options={getOptions || []}
                    multiple
                    value={loaiCongTrinhIds}
                    onChange={(e, value) => {
                        setLoaiCongTrinh(value);
                        setRowData({
                            _id: rowData._id,
                            loaiCongTrinhs: value.map((v) => v.tenMuc),
                            loaiCongTrinhIds: value.map((v) => v.maMuc),
                        });
                        setTextPrint(value.map((v) => v.tenMuc).join(','));
                    }}
                    sx={autocompleteStyle}
                    renderInput={(params) => (
                        <TextField {...params} sx={textStyle()} />
                    )}
                    renderTags={(list) => {
                        let displayList = list
                            .map((item) => item.tenMuc) // Lấy giá trị `tenMuc` từ mỗi mục
                            .join(', '); // Nối các mục với dấu phẩy và khoảng trắng

                        return <span>{displayList}</span>;
                    }}
                    getOptionLabel={(option) => option.tenMuc}
                    renderOption={(props, option) => (
                        <li {...props} key={option.maMuc}>
                            {option.tenMuc}
                        </li>
                    )}
                />
                {rowData.error?.loaiCongTrinhIds && (
                    <span
                        className="no_print"
                        style={{ color: 'red', fontSize: '10px' }}
                    >
                        {rowData.error?.loaiCongTrinhIds}
                    </span>
                )}
            </div>
        </td>
    );
};
export const TTSDSelect = ({ rowData, setRowData }) => {
    const TTSDs = [
        {
            tenMuc: 'Có',
            maMuc: 'yes',
        },
        {
            tenMuc: 'Không',
            maMuc: 'no',
        },
    ];
    const defaultTTSD =
        TTSDs.find((htkt) => htkt.tenMuc === rowData.tinhTrangSuDung) || null;
    const [tinhTrangSuDung, setTinhTrangSuDung] = useState(defaultTTSD);

    return (
        <td style={{ textAlign: 'center' }}>
            <Autocomplete
                options={TTSDs || []}
                value={tinhTrangSuDung || TTSDs[1]}
                onChange={(e, value) => {
                    setTinhTrangSuDung(value);
                    setRowData({
                        _id: rowData._id,
                        tinhTrangSuDung: value?.tenMuc,
                    });
                }}
                sx={autocompleteStyle}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle()}
                        placeholder="Chọn tình trạng sử dụng"
                    />
                )}
                getOptionLabel={(option) => option.tenMuc}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.maMuc}>
                            {option['tenMuc']}
                        </li>
                    );
                }}
            />
            {rowData.error?.tinhTrangSuDung && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.tinhTrangSuDung}
                </span>
            )}
        </td>
    );
};

export const HTKTSelect = ({ rowData, setRowData }) => {
    const HTKTS = [
        {
            tenMuc: 'Bơm tay',
            maMuc: 'bomTay',
        },
        {
            tenMuc: 'Bơm máy',
            maMuc: 'bomMay',
        },
        {
            tenMuc: 'Tự chảy',
            maMuc: 'tuChay',
        },
    ];
    const defaultHTKTS =
        HTKTS.find((htkt) => htkt.tenMuc === rowData.hinhThucKhaiThac) || null;
    const [hinhThucKhaiThac, setHinhThucKhaiThac] = useState(defaultHTKTS);
    return (
        <td style={{ textAlign: 'center' }}>
            <Autocomplete
                options={HTKTS || []}
                value={hinhThucKhaiThac}
                onChange={(e, value) => {
                    setHinhThucKhaiThac(value);
                    setRowData({
                        _id: rowData._id,
                        hinhThucKhaiThac: value?.tenMuc,
                    });
                }}
                sx={autocompleteStyle}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle()}
                        placeholder="Chọn loại hình thức khai thác"
                    />
                )}
                getOptionLabel={(option) => option.tenMuc}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.maMuc}>
                            {option['tenMuc']}
                        </li>
                    );
                }}
            />
            {rowData.error?.hinhThucKhaiThac && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.hinhThucKhaiThac}
                </span>
            )}
        </td>
    );
};
export const MDSDSelectLuuluong = ({ rowData, onSelect }) => {
    const MDSDs = useSelector(
        (state) => state.app?.DanhMucs?.mucDichSuDungs || []
    );

    const getOptions = React.useMemo(() => {
        const outners = rowData?.mucDichSuDungs?.filter(i => !Boolean(MDSDs?.find(s => s?.tenMuc === i))) ?? [];
        return [...MDSDs, ...outners?.map(s => ({
            tenMuc: s,
            maMuc: `_${s}`,
            isNew: true,
            isPrimary: Boolean(MDSDs?.find(i => (i?.maMuc === s)))
        }))];
    }, [MDSDs, rowData]);

    const defaultMDSD = React.useMemo(() => (
        getOptions.filter(
            (mdsd) =>
                rowData.mucDichSuDungIds?.includes(mdsd.maMuc) ||
                rowData.mucDichSuDungIds?.includes(mdsd.tenMuc) ||
                rowData.mucDichSuDungs?.includes(mdsd.maMuc) ||
                rowData.mucDichSuDungs?.includes(mdsd.tenMuc)
        ).filter(s => !s?.isPrimary) || []
    ), [getOptions, rowData]);

    const [mucDichSuDungs, setMucDichSuDungs] = useState(defaultMDSD);

    useEffect(() => {
        setMucDichSuDungs(defaultMDSD);
    }, [defaultMDSD]);

    const handleSelect = useCallback((e, value) => {
        const selectedValues = value.map((v) => ({
            tenMuc: v.tenMuc,
            maMuc: v.maMuc
        }));

        setMucDichSuDungs(value);
        if (onSelect) {
            onSelect({
                mucDichSuDungs: selectedValues.map((v) => v.tenMuc),
                mucDichSuDungIds: selectedValues.map((v) => v.maMuc),
                luuLuongKhaiThacText: selectedValues.map((v) => v.tenMuc).join(','),
            });
        }
    }, [onSelect]);

    return (
        <td style={{ textAlign: 'center' }}>
            <div className="no_print">
                <Autocomplete
                    options={getOptions || []}
                    value={mucDichSuDungs}
                    multiple
                    onChange={handleSelect}
                    renderInput={(params) => (
                        <TextField {...params} sx={textStyle()} />
                    )}
                    renderTags={(list) => {
                        let displayList = list
                            .map((item) => item.tenMuc)
                            .join(',').replace(/,,+/g, ',').trim();

                        if (displayList.startsWith(',')) {
                            displayList = displayList.slice(1);
                        }
                        if (displayList.endsWith(',')) {
                            displayList = displayList.slice(0, -1);
                        }

                        return <span>{displayList}</span>;
                    }}
                    getOptionLabel={(option) => option.tenMuc}
                    renderOption={(props, option) => (
                        <li {...props} key={option.maMuc}>
                            {option.tenMuc}
                        </li>
                    )}
                    sx={autocompleteStyle}
                />

                {rowData.error?.mucDichSuDungIds && (
                    <span
                        className="no_print"
                        style={{ color: 'red', fontSize: '10px' }}
                    >
                        {rowData.error?.mucDichSuDungIds}
                    </span>
                )}
            </div>
        </td>
    );
};

export const MDSDSelect = ({ rowData, setRowData, setLuuLuong }) => {
    const MDSDs = useSelector(
        (state) => state.app?.DanhMucs?.mucDichSuDungs || []
    );
    const getOptions = React.useMemo(() => {
        const outners = rowData?.mucDichSuDungs?.filter(i => !Boolean(MDSDs?.find(s => s?.tenMuc === i))) ?? [];
        return [...MDSDs, ...outners?.map(s => ({
            tenMuc: s,
            maMuc: `_${s}`,
            isNew: true,
            isPrimary: Boolean(MDSDs?.find(i => (i?.maMuc === s)))
        }))];
    }, [MDSDs, rowData]);

    const defaultMDSD =
        getOptions.filter(
            (mdsd) =>
                rowData.mucDichSuDungIds?.includes(mdsd.maMuc) ||
                rowData.mucDichSuDungIds?.includes(mdsd.tenMuc) ||
                rowData.mucDichSuDungs?.includes(mdsd.maMuc) ||
                rowData.mucDichSuDungs?.includes(mdsd.tenMuc)
        ).filter(s => !s?.isPrimary) || [];

    const [mucDichSuDungs, setMucDichSuDungs] = useState(defaultMDSD);
    useEffect(() => {
        const defaultMDSD =
            getOptions.filter(
                (mdsd) =>
                    rowData.mucDichSuDungIds?.includes(mdsd.maMuc) ||
                    rowData.mucDichSuDungIds?.includes(mdsd.tenMuc) ||
                    rowData.mucDichSuDungs?.includes(mdsd.maMuc) ||
                    rowData.mucDichSuDungs?.includes(mdsd.tenMuc)
            ).filter(s => !s?.isPrimary) || [];
        setMucDichSuDungs(defaultMDSD);
    }, [rowData.mucDichSuDungIds, getOptions, rowData.mucDichSuDungs]);

    return (
        <>
            <td style={{ textAlign: 'center' }}>
                <div className="no_print">
                    <Autocomplete
                        options={getOptions || []}
                        value={mucDichSuDungs}
                        multiple
                        onChange={(e, value) => {
                            setMucDichSuDungs(value);
                            setLuuLuongKhac(value.map((v) => v.tenMuc).join(',') || '');
                            setRowData({
                                _id: rowData._id,
                                mucDichSuDungs: value.map((v) => v.tenMuc),
                                mucDichSuDungIds: value.map((v) => v.maMuc),
                                luuLuongKhaiThacText: value.map((v) => v.tenMuc).join(','),
                            });
                        }}
                        renderInput={(params) => (
                            <TextField {...params} sx={textStyle()} />
                        )}
                        renderTags={(list) => {
                            let displayList = list
                                .map((item) => item.tenMuc) // Lấy giá trị `tenMuc` từ mỗi mục
                                .join(',').replace(/,,+/g, ',').trim(); // Nối các mục với dấu phẩy và khoảng trắng
                            // xóa dấu , thừa
                            // Nếu chuỗi bắt đầu hoặc kết thúc với dấu ;, loại bỏ chúng
                            if (displayList.startsWith(',')) {
                                displayList = displayList.slice(1);
                            }
                            if (displayList.endsWith(',')) {
                                displayList = displayList.slice(0, -1);
                            }

                            return <span>{displayList}</span>;
                        }}
                        getOptionLabel={(option) => option.tenMuc}
                        renderOption={(props, option) => (
                            <li {...props} key={option.maMuc}>
                                {option.tenMuc}
                            </li>
                        )}
                        sx={autocompleteStyle}
                    />

                    {rowData.error?.mucDichSuDungIds && (
                        <span
                            className="no_print"
                            style={{ color: 'red', fontSize: '10px' }}
                        >
                            {rowData.error?.mucDichSuDungIds}
                        </span>
                    )}
                </div>
            </td>
        </>
    );
};

export const LHNTSelect = ({ rowData, setRowData }) => {
    const LHNTs = useSelector(
        (state) => state.app?.DanhMucs?.loaiHinhNuocThais || []
    );
    const getOptions = React.useMemo(() => {
        const outners = !!!LHNTs?.find(s => s.tenMuc === rowData?.loaiHinhNuocThai) ? [rowData?.loaiHinhNuocThai] : [];
        return [...LHNTs, ...outners?.map(s => ({
            tenMuc: s,
            maMuc: s
        }))];
    }, [LHNTs, rowData]);

    const defaultLHNT =
        getOptions.find(
            (lhnt) =>
                lhnt.maMuc === rowData.loaiHinhNuocThaiId ||
                lhnt.tenMuc === rowData.loaiHinhNuocThai
        ) || null;

    // Nếu không tìm thấy trong danh sách thì dùng giá trị từ rowData
    const [loaiHinhNuocThai, setLoaiHinhNuocThai] = useState(
        defaultLHNT || { tenMuc: rowData?.loaiHinhNuocThai }
    );

    return (
        <td style={{ textAlign: 'center' }}>
            <Autocomplete
                options={getOptions || []}
                value={loaiHinhNuocThai}
                freeSolo
                onChange={(e, value) => {
                    // Nếu không có trong danh sách, set giá trị từ `value.tenMuc` hoặc giữ nguyên
                    setLoaiHinhNuocThai(value || { tenMuc: e.target.value });
                    setRowData({
                        _id: rowData._id,
                        loaiHinhNuocThai: value?.tenMuc || e.target.value,
                        loaiHinhNuocThaiId: value?.maMuc || null,
                    });
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textStyle()}
                        placeholder="Chọn loại hình nước thải"
                    />
                )}
                getOptionLabel={(option) => option.tenMuc || ''}
                renderOption={(props, option) => (
                    <li {...props} key={option.maMuc}>
                        {option.tenMuc}
                    </li>
                )}
                sx={autocompleteStyle}
            />
            {rowData.error?.loaiHinhNuocThaiId && (
                <span
                    className="no_print"
                    style={{ color: 'red', fontSize: '10px' }}
                >
                    {rowData.error?.loaiHinhNuocThaiId}
                </span>
            )}
        </td>
    );
};

export const MyAutocomplete = ({
    value,
    onChange,
    options,
    placeholder,
    label,
    width = 300,
    sx = {},
    clearable = false,
    ...props
}) => {
    return (
        <Autocomplete
            sx={{
                width,
                ...sx,
            }}
            value={value}
            options={options}
            onChange={onChange}
            ChipProps={{
                deleteIcon: clearable ? undefined : <div></div>,
            }}
            size="small"
            renderInput={(paramss) => (
                <TextField
                    {...paramss}
                    placeholder={placeholder}
                    label={label}
                    style={{
                        width: '100%',
                        backgroundColor: '#fff',
                    }}
                />
            )}
            {...props}
        />
    );
};

export const MySelectTime2 = ({ label, placeholder, readOnly, ...props }) => {
    const [value, setValue] = React.useState(
        props?.value ? new Date(props?.value * 1000) : null
    );
    useEffect(() => {
        if (props?.value) {
            setValue(
                new Date(
                    props?.divide ? props?.value * 3600000 : props?.value * 1000
                )
            );
        } else {
            setValue(null);
        }
    }, [props?.value]);

    const handleChange = (newValue) => {
        try {
            if (props?.range === 'from') {
                newValue.setHours(0, 0, 0, 0);
            } else if (props?.range === 'to') {
                newValue.setHours(23, 0, 0, 0);
            }
            setValue(newValue);
            props.onChange(
                Math.floor(newValue.getTime() / (props?.divide || 1000))
            );
        } catch { }
    };
    return (
        <div>
            <LocalizationProvider
                adapterLocale={vi}
                dateAdapter={AdapterDateFns}
            >
                <DesktopDatePicker
                    className="DesktopDatePicker"
                    mintime={new Date()}
                    disabled={props.disabled}
                    maxDate={props?.maxDate ? props.maxDate : null}
                    minDate={props?.minDate ? props.minDate : null}
                    value={value || null}
                    inputFormat={
                        props.inputFormat ? props.inputFormat : 'dd/MM/yyyy'
                    }
                    sx={{
                        backgroundColor: '#fff',
                    }}
                    openTo={props.openTo ? props.openTo : 'day'}
                    onChange={handleChange}
                    placeholder={placeholder}
                    label={label}
                    slotProps={{ textField: { size: 'small' } }}
                    textField={(params) => (
                        <TextField
                            {...params}
                            onBlur={props.handleOnBlur}
                            onSubmit={props.handleOnSubmit}
                            fullWidth
                        />
                    )}
                    readOnly={readOnly}
                />
            </LocalizationProvider>
        </div>
    );
};

export const mapSameItem = (items = [], key = '') => {
    items.forEach(() => {
        let count = 0;
        items.forEach((child, childIndex) => {
            if (items.filter((i) => i[key] === child[key]).length > 1) {
                items[childIndex][key] =
                    `[${count + 1}] ${items[childIndex][key]}`;
                count++;
            }
        });
    });

    return items;
};

export const BaseSearchBox = ({
    children,
    values,
    setFieldValue,
    enableFileExcelFilter = false,
    enableFormTypeFilter = false,
    enableLvsFilter = false,
    enableInvestigateFilter = false,
    enableAddressFilter = false,
    enableForm18n20Filter = false,
    enableForm22Filter = false,
    enableForm25Filter = false,
    isPrimary = false,
    enablePersonalFilter = true,
    enablePersonalCheckFilter = true,
    enableStatus = false
}) => {
    const filterOptions = createFilterOptions({
        matchFrom: 'start',
        stringify: (option) => option.label,
    });

    const {
        canBoDieuTras,
        coQuanThucHiens,
        luuVucSongs,
        tinhThanhs,
        quanHuyens,
        phuongXas,
        handleGetAddress,
        handleClearAddress,
        loaiCongTrinhs,
        mucDichSuDungs,
        scope,
        auth,
    } = useStores();
    const tinhThanhLists = [
        {
            tenRutGon: 'Vùng Trung du và Miền núi phía Bắc',
            maTinh: 'VKT1',
            hint: "Vùng kinh tế"
        },
        {
            tenRutGon: 'Vùng Đồng bằng sông Hồng',
            maTinh: 'VKT2',
            hint: "Vùng kinh tế"
        },
        {
            tenRutGon: 'Vùng Bắc Trụng Bộ và Duyên hải miền Trung',
            maTinh: 'VKT3',
            hint: "Vùng kinh tế"
        },
        {
            tenRutGon: 'Vùng Tây Nguyên',
            maTinh: 'VKT4',
            hint: "Vùng kinh tế"
        },
        {
            tenRutGon: 'Vùng Đông Nam Bộ',
            maTinh: 'VKT5',
            hint: "Vùng kinh tế"
        },
        {
            tenRutGon: 'Vùng Đồng bằng sông Cửu Long',
            maTinh: 'VKT6',
            hint: "Vùng kinh tế"
        },
        ...tinhThanhs?.map(s => ({
            ...s,
            hint: "Tỉnh/Thành phố"
        }))
    ]
    const trangThaiDieuTraOptions = React.useMemo(() => [
        {
            maMuc: 'khong_chi_tiet',
            tenMuc: 'Chưa điều tra chi tiết',
        },
        {
            maMuc: 'chi_tiet',
            tenMuc: 'Đã điều tra chi tiết',
        },
        {
            maMuc: 'chi_tiet_va_tong_hop',
            tenMuc: 'Đã điều tra chi tiết và có trong phiếu tổng hợp',
        },
        {
            maMuc: 'chi_tiet_only',
            tenMuc: 'Đã điều tra chi tiết và không có trong phiếu tổng hợp',
        },
    ], []);

    React.useEffect(() => {
        if (scope === 'tinh' && quanHuyens?.length === 0) {
            handleGetAddress({
                tinhThanhId: auth?.tinhThanhId,
            });
        }
        if (values?.tinhThanhIds?.length === 1 || values?.quanHuyenIds?.length) {
            handleGetAddress({
                tinhThanhId: values?.tinhThanhIds?.[0],
                quanHuyenId: values?.quanHuyenIds?.[0],
            });
        }
    }, []);

    const getCQTHValues = React.useMemo(() => {
        return [
            ...coQuanThucHiens?.filter(
                (t) => !!values?.coQuanThucHienIds?.find((i) => i === t.value)
            ),
            coQuanThucHiens?.find((t) => t.value === values?.scope) ?? null,
        ].filter(Boolean);
    }, [coQuanThucHiens, values]);

    const getLVSValues = React.useMemo(() => {
        return [
            ...luuVucSongs?.filter(
                (t) => !!values?.luuVucSongNoiTinhIds?.find((i) => i === t.value)
            ),
            ...luuVucSongs?.filter(
                (t) => !!values?.luuVucSongLienTinhIds?.find((i) => i === t.value)
            ),
        ].filter(Boolean);
    }, [luuVucSongs, values]);

    return (
        <>
            {scope === 'tw' && auth?.role === "Admin" && (
                <MyAutocomplete
                    value={getCQTHValues}
                    getOptionLabel={(option) => option?.label}
                    groupBy={(option) => option?.hint}
                    options={coQuanThucHiens}
                    multiple
                    width={'49.5%'}
                    onChange={(e, options) => {
                        if (options.length === 0) {
                            setFieldValue('scope', null);
                            setFieldValue('coQuanThucHienIds', null);
                            return;
                        }
                        options.forEach((v) => {
                            if (v.is === 'scope' && v.target === 'only') {
                                setFieldValue('coQuanThucHienIds', null);
                                setFieldValue('scope', v.value);
                                return;
                            }
                            setFieldValue('coQuanThucHienIds', null);
                            setFieldValue('scope', null);
                            setFieldValue('Scope', v.scope);
                            const __coQuanThucHienIds = [
                                ...new Set([
                                    ...(values?.[v.is] ?? []),
                                    v.value,
                                ]),
                            ].filter(item => {
                                return coQuanThucHiens.find(i => i.value === item).scope === v.scope;
                            });
                            setFieldValue(v.is, __coQuanThucHienIds);
                        });
                    }}
                    placeholder="Chọn cơ quan thực hiện"
                    label="Cơ quan thực hiện"
                />
            )}
            {
                enablePersonalFilter && <MyAutocomplete
                    width={'49.68%'}
                    value={
                        canBoDieuTras?.filter((i) =>
                            values.createdBys?.includes(i?.userName)
                        ) ?? null
                    }
                    getOptionLabel={(option) => option?.fullName}
                    options={canBoDieuTras}
                    multiple
                    onChange={(e, values) => {
                        if (values.length === 0) {
                            setFieldValue('createdBys', []);
                            return;
                        }
                        setFieldValue(
                            'createdBys',
                            values?.map((i) => i?.userName)
                        );
                    }}
                    placeholder="Chọn người lập biểu"
                    label="Người lập biểu"
                />
            }
            {
                !isPrimary && <>
                    <MySelectTime2
                        label="Thời gian lập biểu từ"
                        divide={3600000}
                        value={values?.ngayLapBieuHourFrom}
                        range="from"
                        onChange={(value) => {
                            setFieldValue('ngayLapBieuHourFrom', value);
                        }}
                    />
                    <MySelectTime2
                        label="Thời gian lập biểu đến"
                        divide={3600000}
                        value={values?.ngayLapBieuHourTo}
                        range="to"
                        onChange={(value) => {
                            if (values?.ngayLapBieuHourFrom > value) {
                                Swal.fire({
                                    toast: true,
                                    text: "Thời gian đến không được nhỏ hơn thời gian bắt đầu",
                                    icon: 'warning',
                                    position: 'top',
                                    showCancelButton: false,
                                    showCloseButton: false,
                                    showConfirmButton: false,
                                    timer: 3000
                                })
                                return;
                            }
                            setFieldValue('ngayLapBieuHourTo', value);
                        }}
                        readOnly={!values?.ngayLapBieuHourFrom}
                    />
                </>
            }
            {
                !isPrimary && <MyAutocomplete
                    value={
                        trangThaiBieuMaus?.find(
                            (i) => i.value === values.trangThaiBieuMau
                        ) ?? null
                    }
                    getOptionLabel={(option) => option?.label}
                    options={trangThaiBieuMaus}
                    onChange={(e, value) => {
                        if (!value) {
                            setFieldValue('trangThaiBieuMau', null);
                            return;
                        }
                        setFieldValue('trangThaiBieuMau', value.value);
                    }}
                    placeholder="Chọn trạng thái biểu mẫu"
                    label="Trạng thái biểu mẫu"
                />
            }
            {
                (enablePersonalCheckFilter ?? enablePersonalFilter) && <MyAutocomplete
                    value={
                        canBoDieuTras?.filter((i) =>
                            values?.confirmedBys?.includes(i?.userName)
                        ) ?? null
                    }
                    getOptionLabel={(option) => option?.fullName}
                    options={canBoDieuTras?.filter(s => s?.role === 'Admin')}
                    multiple
                    onChange={(e, values) => {
                        if (values.length === 0) {
                            setFieldValue('confirmedBys', []);
                            return;
                        }
                        setFieldValue(
                            'confirmedBys',
                            values?.map((i) => i?.userName)
                        );
                    }}
                    placeholder="Chọn người kiểm tra"
                    label="Người kiểm tra"
                />
            }
            {(enableLvsFilter ||
                enableInvestigateFilter ||
                enableForm18n20Filter ||
                enableForm22Filter ||
                enableForm25Filter) && (
                    <>
                        <MyAutocomplete
                            value={getLVSValues}
                            getOptionLabel={(option) => option?.label}
                            groupBy={(option) => option?.hint}
                            options={luuVucSongs}
                            filterOptions={filterOptions}
                            multiple
                            onChange={(e, options) => {
                                setFieldValue('luuVucSongNoiTinhIds', null);
                                setFieldValue('luuVucSongLienTinhIds', null);
                                options.forEach((v) => {
                                    const ids = [
                                        ...new Set([
                                            ...(values?.[v.is] ?? []),
                                            v.value,
                                        ]),
                                    ];
                                    setFieldValue(v.is, ids);
                                });
                            }}
                            width={"49.5%"}
                            placeholder="Chọn lưu vực sông"
                            label="Lưu vực sông"
                        />
                    </>
                )}
            {enableFormTypeFilter && (
                <MyAutocomplete
                    value={
                        loaiBieuMaus?.find(
                            (i) => i.value === values.isTongHop
                        ) ?? null
                    }
                    getOptionLabel={(option) => option?.label}
                    options={loaiBieuMaus}
                    onChange={(e, value) => {
                        if (!value) {
                            setFieldValue('isTongHop', null);
                            return;
                        }
                        setFieldValue('isTongHop', value.value);
                    }}
                    placeholder="Chọn loại biểu mẫu"
                    label="Loại biểu mẫu"
                />
            )}
            {(enableFileExcelFilter ||
                enableInvestigateFilter ||
                enableForm18n20Filter ||
                enableForm22Filter ||
                enableForm25Filter) && (
                    <TextField
                        sx={{
                            backgroundColor: '#fff',
                            width: 300,
                        }}
                        value={values.createdByFile ?? ''}
                        onChange={(e) => {
                            setFieldValue('createdByFile', e.target.value);
                        }}
                        label="Tên tệp excel"
                        placeholder="Nhập tên tệp excel"
                        size="small"
                    />
                )}
            {(enableAddressFilter ||
                enableInvestigateFilter ||
                enableForm18n20Filter ||
                enableForm22Filter ||
                enableForm25Filter) && (
                    <>
                        {scope !== 'tinh' && (
                            <MyAutocomplete
                                value={tinhThanhLists?.filter((i) =>
                                    !!values.tinhThanhTen?.find(s => s === i.tenRutGon)
                                ) ?? null}
                                getOptionLabel={(option) => option?.tenRutGon}
                                options={tinhThanhLists}
                                multiple
                                groupBy={(s) => s.hint}
                                onChange={(e, options) => {
                                    const mappings = {
                                        VKT1: ['02', '04', '20', '24', '25', '19', '06', '08', '10', '15', '12', '14', '11', '17'],
                                        VKT2: ['01', '31', '30', '33', '26', '27', '34', '36', '35', '37', '22'],
                                        VKT3: ['38', '40', '42', '44', '45', '46', '48', '49', '51', '52', '54', '56', '58', '60'],
                                        VKT4: ['62', '64', '66', '67', '68'],
                                        VKT5: ['79', '75', '77', '74', '70', '72'],
                                        VKT6: ['92', '80', '82', '83', '84', '86', '89', '87', '91', '93', '94', '95', '96'],
                                    };
                                    // Nếu không có lựa chọn nào, xóa tất cả các trường liên quan
                                    if (!options || options.length === 0) {
                                        setFieldValue('tinhThanhIds', null);
                                        setFieldValue('tinhThanhTen', null);
                                        setFieldValue('quanHuyenIds', null);
                                        setFieldValue('phuongXaIds', null);
                                        handleClearAddress({ tinhThanh: true });
                                        return;
                                    }
                                    // Danh sách `tinhThanhIds` và `tinhThanhTen`
                                    let tinhThanhIds = [];
                                    let tinhThanhTen = [];
                                    options.forEach((option) => {
                                        if (mappings[option?.maTinh]) {
                                            // Nếu là vùng kinh tế, thêm tất cả mã từ mapping
                                            tinhThanhIds.push(...mappings[option?.maTinh]);
                                        } else {
                                            // Nếu là tỉnh lẻ, thêm trực tiếp mã tỉnh
                                            tinhThanhIds.push(option?.maTinh);
                                        }
                                        tinhThanhTen.push(option?.tenRutGon);
                                    });
                                    // Đảm bảo giá trị là duy nhất
                                    tinhThanhIds = [...new Set(tinhThanhIds)];
                                    tinhThanhTen = [...new Set(tinhThanhTen)];
                                    // Cập nhật giá trị
                                    setFieldValue('tinhThanhIds', tinhThanhIds);
                                    setFieldValue('tinhThanhTen', tinhThanhTen);
                                    // Nếu chỉ chọn một tỉnh, lấy danh sách huyện, xã
                                    if (options.length === 1 && !mappings[options[0]?.maTinh]) {
                                        handleGetAddress({ tinhThanhId: options[0]?.maTinh });
                                    }
                                }}
                                placeholder="chọn Vùng kinh tế & Tỉnh thành"
                                label="Vùng kinh tế & Tỉnh thành"
                            />
                        )}
                        <MyAutocomplete
                            value={quanHuyens?.filter((i) =>
                                !!values.quanHuyenIds?.find(s => s === i.maHuyen)
                            ) ?? null}
                            getOptionLabel={(option) => option?.tenRutGon}
                            options={quanHuyens}
                            multiple
                            onChange={(e, options) => {
                                if (options.length === 0) {
                                    setFieldValue('phuongXaIds', null);
                                    setFieldValue('quanHuyenIds', null);
                                    handleClearAddress({ quanHuyen: true });
                                    return;
                                } else {
                                    if (options.length === 1) {
                                        handleGetAddress({ quanHuyenId: options?.[0]?.maHuyen });
                                    } else {
                                        setFieldValue('phuongXaIds', null);
                                        handleClearAddress({ quanHuyen: true });
                                    }
                                }
                                setFieldValue('quanHuyenIds', options?.map((i) => i?.maHuyen))
                            }}
                            placeholder="Chọn quận/huyện/thị xã"
                            label="Huyện"
                            readOnly={values?.tinhThanhIds?.length > 1}
                        />
                        <MyAutocomplete
                            value={phuongXas?.filter((i) =>
                                !!values.phuongXaIds?.find(s => s === i.maXa)
                            ) ?? null}
                            getOptionLabel={(option) => option?.tenRutGon}
                            options={phuongXas}
                            multiple
                            onChange={(e, options) => {
                                if (options.length === 0) {
                                    setFieldValue('phuongXaIds', null);
                                    return;
                                }
                                setFieldValue('phuongXaIds', options?.map((i) => i?.maXa))
                            }}
                            placeholder="Chọn xã/phường/thị trấn"
                            label="Xã"
                            readOnly={(values?.quanHuyenIds?.length > 1) || (values?.tinhThanhIds?.length > 1)}
                        />
                    </>
                )}
            {
                enableStatus && <MyAutocomplete
                    options={trangThaiDieuTraOptions}
                    getOptionLabel={(option) => option?.tenMuc}
                    label="Trạng thái điều tra"
                    value={trangThaiDieuTraOptions?.find(
                        (i) => i.maMuc === values.status
                    ) ?? null}
                    onChange={(e, value) => {
                        if (!value) {
                            setFieldValue('status', null);
                            return;
                        }
                        setFieldValue('status', value.maMuc);
                    }}
                    placeholder="Chọn trạng thái điều tra"
                />
            }
            {enableForm18n20Filter && (
                <>
                    <MyAutocomplete
                        value={
                            loaiCongTrinhs?.find(
                                (i) => i.maMuc === values.loaiCongTrinhId
                            ) ?? null
                        }
                        getOptionLabel={(option) => option?.tenMuc}
                        options={loaiCongTrinhs}
                        onChange={(e, value) => {
                            if (!value) {
                                setFieldValue('loaiCongTrinhId', null);
                                return;
                            }
                            setFieldValue('loaiCongTrinhId', value.maMuc);
                        }}
                        placeholder="Chọn loại công trình"
                        label="Loại công trình"
                    />
                    <MyAutocomplete
                        value={
                            mucDichSuDungs?.find(
                                (i) => i.maMuc === values.mucDichSuDungId
                            ) ?? null
                        }
                        getOptionLabel={(option) => option?.tenMuc}
                        options={mucDichSuDungs}
                        onChange={(e, value) => {
                            if (!value) {
                                setFieldValue('mucDichSuDungId', null);
                                return;
                            }
                            setFieldValue('mucDichSuDungId', value.maMuc);
                        }}
                        placeholder="Chọn mục đích sử dụng"
                        label="Mục đích sử dụng"
                    />
                </>
            )}
            {(enableForm18n20Filter || enableForm22Filter) && (
                <MyAutocomplete
                    value={
                        thongTinGiayPheps?.find(
                            (i) => i.value === values.coThongTinGiayPhep
                        ) ?? null
                    }
                    getOptionLabel={(option) => option?.label}
                    options={thongTinGiayPheps}
                    onChange={(e, value) => {
                        if (!value) {
                            setFieldValue('coThongTinGiayPhep', null);
                            return;
                        }
                        setFieldValue('coThongTinGiayPhep', value.value);
                    }}
                    placeholder="Chọn thông tin giấy phép"
                    label="Thông tin giấy phép"
                />
            )}
            {enableForm25Filter && (
                <TextField
                    sx={{
                        backgroundColor: '#fff',
                        width: 300,
                    }}
                    type='number'
                    value={values.namDoLuongMua || ''}
                    onChange={(e) => {
                        setFieldValue('namDoLuongMua', Number(e.target.value));
                    }}
                    label="Năm đo lượng mưa"
                    placeholder="Nhập năm đo lượng mưa"
                    size="small"
                />
            )}
            {/* <MyAutocomplete
                            value={
                                loaiBieuMaus?.find(
                                    (i) => i.value === values.isTongHop
                                ) ?? null
                            }
                            getOptionLabel={(option) => option?.label}
                            options={loaiBieuMaus}
                            onChange={(e, value) => {
                                if (!value) {
                                    setFieldValue('isTongHop', null);
                                    return;
                                }
                                setFieldValue('isTongHop', value.value);
                            }}
                            placeholder="Chọn trạng thái biểu mẫu"
                            label="Trạng thái biểu mẫu"
                        /> */}
            {/* <MyAutocomplete
                            value={__coQuanThucHiens?.filter((i) =>
                                !!values.coQuanThucHienIds?.find(s => s === i.maMuc)
                            ) ?? null}
                            getOptionLabel={(option) => option?.tenMuc}
                            options={__coQuanThucHiens}
                            multiple
                            onChange={(e, options) => {
                                if (options.length === 0) {
                                    setFieldValue('coQuanThucHienIds', null);
                                    return;
                                }
                                setFieldValue('coQuanThucHienIds', options?.map((i) => i?.maMuc))
                            }}
                            placeholder="Chọn cơ quan thực hiện"
                            label="Cơ quan thực hiện"
                        />
                        <MyAutocomplete
                            value={tinhThanhs?.filter((i) =>
                                !!values.tinhThanhIds?.find(s => s === i.maTinh)
                            ) ?? null}
                            getOptionLabel={(option) => option?.tenRutGon}
                            options={tinhThanhs}
                            multiple
                            onChange={(e, options) => {
                                if (options.length === 0) {
                                    setFieldValue('tinhThanhIds', null);
                                    return;
                                }
                                setFieldValue('tinhThanhIds', options?.map((i) => i?.maTinh))
                            }}
                            placeholder="Chọn tỉnh thành"
                            label="Tỉnh thành"
                        /> */}
        </>
    );
};

export const FormPagination = ({ onPaginationChange, page, totalPages }) => {
    const hasPagination = totalPages >= 2;

    return (
        <>
            {hasPagination && (
                <Pagination
                    style={{ display: 'flex', justifyContent: 'flex-end' }}
                    page={page}
                    onChange={(e, page) => {
                        onPaginationChange(e, page);
                    }}
                    count={totalPages}
                />
            )}
        </>
    );
};
