import { FileDownload, Print, Save } from '@mui/icons-material';
import { isEmpty, trim } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import querystring from 'query-string';
import React, { memo, useEffect, useState } from 'react';
import SyncLoader from 'react-spinners/SyncLoader';
import Swal from 'sweetalert2';
import { MyButton, ThongBao } from './components';
import JSZip from 'jszip';

export const toFixedNumber = (v) => {
    try {
        if (typeof v !== 'number') return v?.toString();
        return Number.isInteger(v) ? v : v.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
    } catch (error) {
        return 0;
    }
}
// Tạo tệp ZIP chứa tệp PDF
export const downloadZip = async (pdfBlob, fileName) => {
    try {
        const zip = new JSZip();
        // Thêm tệp PDF vào ZIP
        zip.file(`${fileName}.pdf`, pdfBlob, { binary: true });

        // Tạo tệp ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Tạo URL và tải xuống tệp ZIP
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${fileName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
    } catch (error) {
        console.error('Error creating ZIP file:', error);
    }
};
export const showConfirmDialog = (message, title, callback, options = {}) => {
    Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        ...options,
    }).then(async (result) => {
        await callback(result.isConfirmed);
    });
};
export const clearAllIndexedDB = async () => {
    try {
        // Lấy danh sách tất cả cơ sở dữ liệu trong IndexedDB
        const dbs = await indexedDB.databases();

        // Lặp qua từng cơ sở dữ liệu và xóa nó
        for (const db of dbs) {
            if (db.name) {
                indexedDB.deleteDatabase(db.name);
            }
        }
    } catch (error) {
        console.error("Error clearing IndexedDB databases:", error);
    }
};

export const checkMatch = (item1, dataDoiTuong, id) => {
    // Kiểm tra match1: điều kiện tất cả đều khớp
    const match1 = dataDoiTuong.some(d =>
        d?.id === item1?.id &&
        d?.bieuMauId === parseInt(id) &&
        d?.indexOnBieuMau === item1?.indexOnBieuMau &&
        d?.bieuMau === item1?.bieuMau &&
        d?.loaiNguonNuoc === item1?.loaiNguonNuoc
    );

    // Kiểm tra match2: điều kiện không khớp với bieuMauId và indexOnBieuMau
    const match2 = dataDoiTuong.some(d =>
        d?.id === item1?.id && (
            (d?.bieuMauId !== parseInt(id) ||
                d?.indexOnBieuMau !== item1?.indexOnBieuMau ||
                d?.loaiNguonNuoc === item1?.loaiNguonNuoc) &&
            (d?.bieuMau === item1?.bieuMau)
        )
    );
    // Kiểm tra match4: điều kiện không khớp với bieuMauId và indexOnBieuMau (ap dụng cho các biểu mẫu có biểu mẫu điều tra chi tiết)
    const match4 = dataDoiTuong.some(d =>
        d?.id === item1?.id &&
        // (d?.loaiNguonNuoc === item1?.loaiNguonNuoc) &&
        (d?.bieuMau !== item1?.bieuMau)

    );
    // Kiểm tra match3: điều kiện id không khớp
    const match3 = dataDoiTuong.every(d => d?.id !== item1?.id);
    let idDataDoiTuong = '';
    if (match4) {
        // lấy ra id của dataDoiTuong
        idDataDoiTuong = dataDoiTuong.find(d => d?.id === item1?.id)?.bieuMauId;
    }
    // Trả về kết quả dưới dạng giá trị
    return { match1, match2, match3, match4, idDataDoiTuong };
};
export function CanListDetailOfReport(user, groupBy, groupById) {
    if (!user) {
        return false;
    }
    if (user.role !== 'Admin') {
        return false;
    }
    if (user.scope === 'tw') {
        return true;
    }
    if (
        user.scope === 'tinh' &&
        groupBy === 'tinh' &&
        user.tinhThanhId === groupById
    ) {
        return true;
    }
    if (user.scope === 'dvtt' && groupBy === 'lvs') {
        // TODO valid luuVucSongId
        return true;
    }
    return false;
}

export function CanWrite(userName, createdBy, published) {
    if (published) {
        return false;
    }

    if (createdBy === userName) {
        return true;
    }

    return false;
}

export function CanPublic(scope, bieuScope, role) {
    if (scope !== bieuScope) {
        return false;
    }
    if (role !== 'Admin' && role !== 'GiamSat') {
        return false;
    }
    return true;
}

export function CanWriteQLTK(user, rowScope, rowRole, rowTypeOfUsers) {
    if (user.role === 'GiamSat') {
        return false;
    }
    if (rowTypeOfUsers === 'system' && user.typeOfUsers === 'system') {
        return true;
    }
    if (
        rowRole === 'Admin' &&
        user.scope === rowScope &&
        user.typeOfUsers !== 'system'
    ) {
        return false;
    }
    if (rowRole === 'Admin' && user.scope === 'tw' && rowScope === 'tinh') {
        return true;
    }
    if (rowTypeOfUsers === 'system') {
        return false;
    }
    if (rowTypeOfUsers !== 'system') {
        return true;
    }
    return false;
}

export const objectSearchParams = (params) => {
    const result = JSON.parse(
        '{"' +
        decodeURI(params)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
        '"}'
    );
    return result;
};

export const getValueByPath = (obj, path) => {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value && value.hasOwnProperty(key)) {
            value = value[key];
        } else {
            return undefined; // Trả về undefined nếu key không tồn tại trong đường dẫn.
        }
    }

    return value;
};

export const convertFileSize = function (sizeInBytes) {
    var units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    var i = 0;
    while (sizeInBytes >= 1024 && i < units.length - 1) {
        sizeInBytes /= 1024;
        i++;
    }
    return sizeInBytes?.toFixed(2) + ' ' + units[i] || 0;
};
// sắp xếp mảng theo Xã huyện tỉnh
export const sapXepViTriHanhChinh = function (data) {
    const dataSX = data.sort((a, b) => {
        const keys = ['tinhThanh', 'quanHuyen', 'phuongXa'];

        for (let key of keys) {
            const valA = a[key] || ''; // Giá trị mặc định là chuỗi rỗng
            const valB = b[key] || '';
            // Nếu `valA` trống mà `valB` không trống, đưa `valA` xuống cuối
            if (!valA && valB) return 1;
            if (valA && !valB) return -1;

            // Nếu cả hai đều không trống, so sánh giá trị
            // if (valA < valB) return -1;
            // if (valA > valB) return 1;
            // sắp xếp theo thứ tự tiếng việt
            const comparison = valA.localeCompare(valB, 'vi');
            if (comparison !== 0) return comparison;
        }
        return 0; // Nếu tất cả các thuộc tính đều bằng nhau
    });
    return dataSX;
};
// Convert input thành kiểu số việt nam
// FD là phân số muốn lấy
export const formatVietNamNumber = function (value, FD = 3) {
    // Kiểm tra giá trị null, undefined, hoặc chuỗi rỗng
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    // FD <= 0 chỉ lấy số nguyên
    if (FD <= 0) {
        if (typeof value === 'number') {
            return value;
        }
        let input = convertStringToNumber(value?.replace(/[^0-9.]/g, ''));
        return input || 0;
    }

    // Nếu là chuỗi và có chứa dấu thập phân
    if (typeof value === 'string' && value?.includes(',')) {
        return value;
    } else {
        let input = convertStringToNumber(value);
        // Đổi số thành string có kiểu 1.000.000,2
        if (input || input === 0) {
            if (typeof input !== 'number') {
                ThongBao({ status: 'warn', message: 'Nhập sai định dạng!' });
            }
            const numberString = input?.toLocaleString('vi-VN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: FD,
            });

            const arraySplit = numberString.split(',');
            if (convertStringToNumber(arraySplit[1]) > 0) {
                return numberString;
            } else {
                return arraySplit[0];
            }
        }
    }
};


const LoadingComponent = () => {
    return (
        <SyncLoader
            color="#b0d8ee"
            loading
            margin={5}
            size={10}
            speedMultiplier={1}
        />
    );
};
export const Loading = memo(LoadingComponent);

// convert string thành số
export function convertStringToNumber(inputString) {
    if (typeof inputString === 'number') {
        return inputString;
    }
    if (inputString === null) {
        return 0;
    }
    if (!inputString || typeof inputString !== 'string') {
        return 0;
    }
    // Loại bỏ các ký tự không cần thiết
    const cleanedString = inputString.replace(/[^0-9.,]/g, '');
    // Chuyển đổi dấu chấm (hàng nghìn) thành không gì cả
    const stringWithoutThousandsSeparator = cleanedString.replace(/\./g, '');

    // Thay thế dấu phẩy (thập phân) bằng dấu chấm
    const stringWithDotAsDecimalSeparator =
        stringWithoutThousandsSeparator.replace(/,/g, '.');
    // Chuyển đổi chuỗi thành số
    const numberValue = parseFloat(stringWithDotAsDecimalSeparator);

    // Kiểm tra xem chuyển đổi thành công hay không
    if (isNaN(numberValue)) {
        return null; // Trả về null nếu không thể chuyển đổi thành số
    }

    return numberValue;
}

export const convertNumber = (number) => {
    if (number === null || number === undefined) {
        return 0;
    }
    if (number > 1000000) {
        let [integer, decimal] = number.toString().split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (decimal) {
            return `${integer}`;
        }
        return integer;
    } else {
        return number;
    }
};

export const totalYear = (data) => {
    const months = Array.from(
        {
            length: 12,
        },
        (_, i) => convertStringToNumber(data[`thang${i + 1}`] ?? 0)
    );
    const total = months.reduce((sum, value) => sum + value, 0);
    console.log('totalYear', formatVietNamNumber(total));
    return formatVietNamNumber(total);
};

export const totalMuaKho = (data) => {
    const selectedMonths = ['thang7', 'thang8', 'thang9', 'thang10'].map(
        (month) => convertStringToNumber(data[month] ?? 0)
    );
    const total = selectedMonths.reduce((sum, value) => sum + value, 0);
    return formatVietNamNumber(total);
};

export const totalMuaMua = (data) => {
    const selectedMonths = [
        'thang11',
        'thang12',
        'thang1',
        'thang2',
        'thang3',
        'thang4',
        'thang5',
        'thang6',
    ].map((month) => convertStringToNumber(data[month] ?? 0));
    const total = selectedMonths.reduce((sum, value) => sum + value, 0);
    return formatVietNamNumber(total);
};

// convert các key(keysToConvert) trong obj thành số
export const convertToFloatForSelectedKeys = (obj, keysToConvert) => {
    if (typeof obj !== 'object' || obj === null) {
        // Nếu obj không phải là object hoặc là null, hoặc là giá trị nguyên thủy, không cần chuyển đổi.
        return obj;
    }

    if (Array.isArray(obj)) {
        console.log('error', obj, keysToConvert);
        // Nếu obj là một mảng, chuyển đổi từng phần tử trong mảng.
        return obj.map((item) =>
            convertToFloatForSelectedKeys(item, keysToConvert)
        );
    }

    // Nếu obj là một object, duyệt qua từng thuộc tính và chuyển đổi giá trị nếu key nằm trong danh sách keysToConvert.
    const result = {};
    for (const key in obj) {
        // Kiểm tra kay object phải tồn tại
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // nếu tìm thấy luôn key cần chuyển đổi và kiểu dữ liệu đang là string thì sẽ parse
            if (keysToConvert.includes(key) && typeof obj[key] === 'string') {
                // Chuyển đổi dấu chấm (hàng nghìn) thành không gì cả
                const stringWithoutThousandsSeparator = obj[key].replace(
                    /\./g,
                    ''
                );
                // Thay thế dấu phẩy (thập phân) bằng dấu chấm
                const stringWithDotAsDecimalSeparator =
                    stringWithoutThousandsSeparator.replace(/,/g, '.');
                // Chuyển đổi chuỗi thành số
                const numberValue =
                    parseFloat(stringWithDotAsDecimalSeparator) || 0;
                if (isNaN(numberValue)) {
                    result[key] = 0; // Trả về null nếu không thể chuyển đổi thành số
                }

                result[key] = numberValue;
            }
            // Nếu vẫn là object thì sẽ đệ quy
            else if (typeof obj[key] === 'object') {
                result[key] = convertToFloatForSelectedKeys(
                    obj[key],
                    keysToConvert
                );
            }
            // Các trường hợp còn lại giữ nguyên
            else {
                result[key] = obj[key];
            }
        }
    }

    return result;
};

export const ScrollButton = ({
    onSave,
    onPrint,
    isEdit,
    onDownload,
    isExcel,
}) => {
    const buttonContainerStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
    };
    const [showButton, setShowButton] = useState(false);
    const checkScrollPosition = () => {
        const scrollPosition = window.scrollY;
        const windowHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const scrolledPercentage = (scrollPosition / windowHeight) * 100;
        if (scrolledPercentage > 10) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    };
    useEffect(() => {
        window.addEventListener('scroll', checkScrollPosition);
        return () => {
            window.removeEventListener('scroll', checkScrollPosition);
        };
    }, []);

    return (
        <div>
            {showButton && (
                <div style={buttonContainerStyle}>
                    <MyButton
                        icon={<Print />}
                        txt="Xuất PDF"
                        onClick={onPrint}
                    />
                    {isExcel && (
                        <MyButton
                            icon={<FileDownload />}
                            txt="Xuất excel"
                            onClick={onDownload}
                        />
                    )}
                    <MyButton
                        icon={<Save />}
                        txt={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                        onClick={onSave}
                    />
                </div>
            )}
        </div>
    );
};

export const filterAndKeepFirstDuplicate = (arr, name) => {
    const seenMaMuc = new Set();
    return arr?.filter((obj) => {
        const maMuc = obj[name];
        if (!seenMaMuc.has(maMuc)) {
            seenMaMuc.add(maMuc);
            return true;
        }
        return false;
    });
};

export function makeid(length) {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

const Helper = {
    // FIXME: form comment
    iterationCopy: (src) => {
        const target = {};
        for (const prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    },

    setMaxYear(year) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + year);
        return date;
    },

    formatDate(value, format = 'DD/MM/YYYY') {
        if (!value) {
            return null;
        }
        return moment(value).format(format);
    },
    timestempToDateTime(value, format = 'DD/MM/YYYY') {
        if (!value) {
            return null;
        }
        return moment(new Date(value * 1000)).format(format);
    },
    timestempToDate_Time(value, format = 'DD/MM/YYYY HH:mm') {
        if (!value) {
            return null;
        }
        return moment(new Date(value * 1000)).format(format);
    },
    formatTableDate(value, format) {
        if (!value) {
            return null;
        }
        return moment(value).format(format || 'DD/MM/YYYY');
    },

    removeVietnameseTones(str) {
        const _str = str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return _str?.toLowerCase().replace(/\s/g, ' ');
    },

    formatUTCDate(value, format) {
        if (!value) {
            return null;
        }
        return moment(value)
            .set({ hour: '0', minute: '0', second: '0', millisecond: '0' })
            .toISOString();
    },

    formatDateBold(value, format) {
        return (
            <span style={{ fontWeight: 600, color: '#e8be22' }}>
                {moment(value).format(format || 'DD MMM YYYY')}
            </span>
        );
    },

    renderDateFromTo(from, to) {
        if (!from) {
            return <span>To {this.formatDateBold(to)}</span>;
        }

        return (
            <span>
                From {this.formatDateBold(from)} to {this.formatDateBold(to)}
            </span>
        );
    },

    formatTime(value, format) {
        if (!value) {
            return null;
        }
        return moment(value).format(format || 'DD MMM YYYY hh:mm A');
    },

    formatDateTimeSecond(value, format) {
        if (!value) {
            return null;
        }
        return moment(value).format(format || 'DD-MM-YYYY HH:mm:ss');
    },

    getLocateTime(value) {
        if (!value) {
            return null;
        }
        return moment.utc(value).local();
    },

    compareDate: (date1, date2) => {
        const moment1 = moment(date1, 'YYYY-MM-DD');
        const moment2 = moment(date2, 'YYYY-MM-DD');
        return moment1.isAfter(moment2);
    },

    subtractDate: (date, number, unit = 'd') => {
        return moment(date).subtract(number, unit);
    },

    copyToClipboard: (r) => {
        const inp = document.createElement('input');
        document.body.appendChild(inp);
        inp.value = r;
        inp.select();
        document.execCommand('copy', false);
        inp.remove();
    },

    getFileNameFromInfoSheet: (fileName) => {
        try {
            const a = fileName.split('/');
            return a[a.length - 1];
        } catch (err) {
            return null;
        }
    },

    getBase64FromFile: async (fileContent, cb) => {
        if (!fileContent) {
            return null;
        }
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            let file;
            fileReader.onload = function (fileLoadedEvent) {
                // let file = fileLoadedEvent.target.result;
                file = fileLoadedEvent.target.result;
                // Print data in console
                // cb(file);
                resolve(file);
            };
            fileReader.readAsDataURL(fileContent);
        });
    },

    getBase64FileFromInput: (input, cb) => {
        if (input.files.length > 0) {
            Helper.getBase64FromFile(input.files[0], cb);
        } else {
            return null;
        }
    },

    formatMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',') => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
            const negativeSign = amount < 0 ? '-' : '';
            const i = parseInt(
                (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
            ).toString();
            const j = i.length > 3 ? i.length % 3 : 0;
            return (
                negativeSign +
                (j ? i.substr(0, j) + thousands : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
                (decimalCount
                    ? decimal +
                    Math.abs(amount - i)
                        .toFixed(decimalCount)
                        .slice(2)
                    : '')
            );
        } catch (e) { }
    },

    formatPhoneNumber: (phoneNo) => {
        if (!phoneNo) {
            return null;
        }
        if (phoneNo.includes('+')) {
            return `(${phoneNo})`;
        } else {
            return `(+${phoneNo})`;
        }
    },

    formatMoneyNumeral: function (value) {
        if (value === undefined || value === null || value === '') {
            return '';
        }
        return numeral(value).format('$0,0.00');
    },

    formatMoneyNumeralTrueData: function (value) {
        if (value === undefined || value === null || value === '') {
            return '';
        }
        return numeral(value).format('$0,0.00');
    },

    formatPercentage: function (value) {
        return numeral(Number(value / 100)).format('0.00%');
    },

    openInNewTab: function (url) {
        const win = window.open(url, '_blank');
        win.focus();
    },

    renderAddressCombine: function ({
        Block = '',
        Street = '',
        Floor = '',
        Unit = '',
        Building = '',
        NameOfTown = 'Singapore',
        Postal = '',
    } = {}) {
        return trim(
            `${Block ? Block : ''} ${Street ? Street : ''} ${Floor || Unit ? '#' : ''}${Floor ? Floor : ''}${Floor && Unit ? '-' : ''}${Unit ? Unit : ''} ${Building ? Building : ''} ${NameOfTown ? NameOfTown : ''} ${Postal ? Postal : ''}`.replace(
                /\s+/g,
                ' '
            )
        );
    },

    stringtifyURL: function ({ path = '', params = {} }) {
        return path + '?' + querystring.stringify(params);
    },

    offuscateString: function (str, isEmail = false) {
        if (!str || typeof str !== 'string') {
            return null;
        }
        return isEmail ? `${str.slice(0, 4)} ****` : `**** ${str.slice(-4)}`;
    },

    trySplit(value) {
        if (!value) {
            return [];
        }
        if (typeof value !== 'string') {
            return [];
        }
        return value.split(',').map((o) => o.trim());
    },

    parseNumeral: (number) => {
        return numeral(number).value();
    },

    stringIsNullOrEmpty: (str) => {
        if (!str) {
            return true;
        }
        if (!str.trim()) {
            return true;
        }
        return false;
    },
    // Curry function
    sortString: (field) => (a, b) => {
        return a[field] !== b[field] ? (a[field] < b[field] ? -1 : 1) : 0;
    },
    sortArrayNumber: (array, field) => {
        array.sort(function (a, b) {
            return a[field] - b[field];
        });
        return array;
    },
    sortArrayString: (array) => {
        array.sort(function (a, b) {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        });
        return array;
    },

    // generate placeholder
    genSelectPL: (text) => {
        return `--- ${text} ---`;
    },

    // update object in array
    replaceItem: (newObj, array, field = 'id') => {
        return array.reduce((accumulator, currentObj) => {
            if (currentObj[field] === newObj[field]) {
                return [...accumulator, newObj];
            } else {
                return [...accumulator, currentObj];
            }
        }, []);
    },
    replaceItemNamThu: (newObj, array, field = 'namThu') => {
        return array.reduce((accumulator, currentObj) => {
            if (currentObj[field] === newObj[field]) {
                return [...accumulator, newObj];
            } else {
                return [...accumulator, currentObj];
            }
        }, []);
    },

    removeItemNamThu: (targetObj, array) => {
        return array.reduce((accumulator, currentObj) => {
            if (currentObj.namThu === targetObj.namThu) {
                return accumulator;
            } else {
                return [...accumulator, currentObj];
            }
        }, []);
    },

    removeItem: (targetObj, array, field) => {
        return array.reduce((accumulator, currentObj) => {
            if (currentObj[field] === targetObj[field]) {
                return accumulator;
            } else {
                return [...accumulator, currentObj];
            }
        }, []);
    },
    //get number VD:1.1,1.2...
    generateVersionNumber: (index) => {
        let major = Math.floor(index / 10) + 1;
        let minor = index % 10;
        return major + '.' + minor;
    },
    updateArray: (item, dataSource, isEdit) => {
        var newData = [];
        if (isEdit) {
            if (item.id === 0) {
                dataSource.map((x, idx) => {
                    if (x.stt === item.stt) {
                        dataSource.splice(idx, 1);
                    }
                });
                newData = dataSource;
            } else {
                newData = dataSource.map((x, idx) => ({
                    ...x,
                    daXoa: x.id === item.id ? 1 : x.daXoa,
                }));
            }
        } else {
            dataSource.map((x, idx) => {
                if (x.stt === item.stt) {
                    dataSource.splice(idx, 1);
                }
            });
            newData = dataSource;
        }
        return newData;
    },

    addSttToDataSource: (dataSource) => {
        if (!dataSource) return [];
        let newItems = [];
        if (dataSource) {
            newItems = dataSource.map((item, index) => ({
                ...item,
                stt: index + 1,
            }));
        }
        return newItems;
    },
    addSttToTableDataSource: (dataSource, page, limit) => {
        if (!dataSource) return [];
        let newItems = [];
        if (dataSource) {
            newItems = dataSource.map((item, index) => ({
                ...item,
                refreshKey: page || page === 0 ? null : 'refresh',
                stt: (page ? page : 0) * (limit ? limit : 10) + index + 1,
            }));
        }
        return newItems;
    },

    addSttToDatasourceForReport: (datasource) => {
        return datasource.map((item, index) => ({
            stt: index === 0 ? '' : index,
            ...item,
        }));
    },

    leaveLastToFirst: (datasource) => {
        var dataSource2 = datasource;
        if (dataSource2 && dataSource2.length > 0) {
            var dataSource3 = [dataSource2[dataSource2.length - 1]];
            dataSource2 = dataSource2.slice(0, dataSource2.length - 1);
            dataSource2 = dataSource3.concat(dataSource2);
        }
        return dataSource2;
    },

    checkInt: (value) => {
        return (
            (!isNaN(value) && /^-?(0|[1-9][0-9]*)?$/.test(value)) ||
            value === '' ||
            value === '-'
        );
    },
    checkFloat: (value) => {
        return (
            (!isNaN(value) && /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(value)) ||
            value === '' ||
            value === '-'
        );
    },

    getFieldValueFromID: (id, array, field = 'ten') => {
        if (id && !isEmpty(array)) {
            const item = array.find((item) => item.id === id);
            return item[field];
        }
        return null;
    },
    /*
     * TODO ============================ Nghiệp vụ =============================================*/
    getToaDoX: (toaDo) => {
        if (!toaDo) {
            return null;
        }
        return toaDo.split(',')[0];
    },
    getToaDoY: (toaDo) => {
        if (!toaDo) {
            return null;
        }
        return toaDo.split(',')[1];
    },

    mergeToaDo: (x, y) => {
        if (x && y) {
            return `${x},${y}`;
        }
        return null;
    },

    validateToaDo: (toaDo) => {
        if (!toaDo || toaDo === '') return undefined;
        var pair = toaDo.split(',');
        if (!pair || pair.length !== 2) return 'Tọa độ có định dạng x,y';
        if (pair[0] === '') return 'x không được để trống';
        if (pair[1] === '') return 'y không được để trống';
        if (!Helper.checkFloat(pair[0])) return 'x phải là số nguyên';
        if (!Helper.checkFloat(pair[1])) return 'y phải là số nguyên';
    },
    validateToaDoVung: (toaDo) => {
        if (toaDo && toaDo !== '' && toaDo?.length > 0) {
            if (toaDo.split(';').length === 2) return false;
        }
        return true;
    },
    getYears: () => {
        var c_year = new Date().getFullYear();
        var years = [];
        for (var i = c_year; i >= 1930; i--) {
            years.push({ year: i, id: i });
        }
        return years;
    },

    // Tạo list mã chức năng theo nhóm chức năng
    handleGroupFunctions: (listFunc) => {
        if (!isEmpty(listFunc)) {
            return listFunc.reduce(function (obj, item) {
                obj[item.moduleCode] = obj[item.moduleCode] || [];
                obj[item.moduleCode].push(item.maChucNang);
                return obj;
            }, {});
        }
        return [];
    },

    handleGetEditableFunction: (listFunctions, pageCode) => {
        if (!isEmpty(listFunctions)) {
            return listFunctions.find((item) => item.maChucNang === pageCode);
        }
    },

    isNullOrUndefined: (param) => {
        return (
            param === null ||
            param === undefined ||
            param === '' ||
            param.length <= 0
        );
    },

    isNullOrEmptyItems: (param) => {
        return param === null || param === undefined || param.length <= 0;
    },

    getParam: (searchParams) => {
        const searchParamsString = decodeURIComponent(searchParams.toString());
        const searchParamObject = objectSearchParams(searchParamsString);
        if (searchParamObject.StrSearch !== undefined) {
            var x = searchParamObject.StrSearch.split('+');
            var a = x.map((e) => e + ' ');
            var ten = '';
            a.map((e) => {
                ten += e;
            });
            searchParamObject.StrSearch = ten.trim();
        }
        if (searchParamObject.StrSearch == ' ') {
            searchParamObject.StrSearch = '';
        }
        return searchParamObject;
    },

    getSumOfChild: (child, key) => {
        // Kiểm tra child có phải array không
        if (!Array.isArray(child) || child.length === 0) {
            return 0;
        }
        return formatVietNamNumber(
            child.reduce((total, obj) => {
                return (
                    total +
                    (convertStringToNumber(getValueByPath(obj, key)) || 0)
                );
            }, 0)
        );
    },
    getSumOf2ndDeepChild: (child, key1, key2) => {
        // Kiểm tra child có phải array không
        if (!Array.isArray(child) || child.length === 0) {
            return 0;
        }
        // Lặp child ra
        return formatVietNamNumber(
            child.reduce((totals, object) => {
                return (
                    totals +
                    (object[key1]?.reduce((total, obj) => {
                        return (
                            total +
                            (convertStringToNumber(getValueByPath(obj, key2)) ||
                                0)
                        );
                    }, 0) || 0)
                );
            }, 0)
        );
    },
    getSumOf3ndDeepChild: (child, key1, key2, key3) => {
        // Kiểm tra child có phải array không
        if (!Array.isArray(child) || child.length === 0) {
            return 0;
        }
        // Lặp child ra
        return formatVietNamNumber(
            child.reduce((total1, object1) => {
                return (
                    total1 +
                    (object1[key1]?.reduce((total2, object2) => {
                        return (
                            total2 +
                            (object2[key2]?.reduce((total3, obj) => {
                                return (
                                    total3 +
                                    (convertStringToNumber(obj[key3]) || 0)
                                );
                            }, 0) || 0)
                        );
                    }, 0) || 0)
                );
            }, 0)
        );
    },
    //chuyển số sang số la mã
    convertNummberToLaMa: (num) => {
        if (isNaN(num) || num <= 0 || num >= 4000) {
            return 'Invalid number';
        }
        let result = '';
        const romanNumeralMap = [
            { value: 1000, numeral: 'M' },
            { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },
            { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },
            { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },
            { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },
            { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },
            { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' },
        ];
        for (let i = 0; i < romanNumeralMap.length; i++) {
            const { value, numeral } = romanNumeralMap[i];

            while (num >= value) {
                result += numeral;
                num -= value;
            }
        }

        return result;
    },
    getContentPrint: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef.current;
        const printClone = printTarget.cloneNode(true);
        console.log('printClone', printClone);
        const xaPhuongElement = printClone.querySelector('#xaPhuong');
        const tinhThanhElement = printClone.querySelector('#tinhThanh');
        if (xaPhuongElement && tinhThanhElement) {
            const parent = xaPhuongElement.parentNode;
            const nextSibling =
                xaPhuongElement.nextElementSibling === tinhThanhElement
                    ? xaPhuongElement
                    : xaPhuongElement.nextElementSibling;
            parent.insertBefore(xaPhuongElement, tinhThanhElement);
            parent.insertBefore(tinhThanhElement, nextSibling);
        }

        const inputs = printClone.querySelectorAll('input');
        const textareas = printClone.querySelectorAll('textarea');
        const autocompletes = printClone.querySelectorAll(
            '.MuiAutocomplete-root'
        );
        const filter = printClone.querySelector('#hiddenFilter');
        filter?.remove();
        const btn = printClone.querySelectorAll('button');
        btn?.forEach((btns) => {
            btns?.remove();
        });

        autocompletes.forEach((autocomplete) => {
            if (autocomplete.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css autocomplete
                divElement.innerText = '......';
                divElement.style.minHeight = '12px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            } else {
                // Tạo ra thẻ div
                const value = autocomplete.querySelector('input').value;
                const divElement = document.createElement('div');
                //add id cho div là xa phuong hoặc tinh thanh
                // Sao chép nội dung và css autocomplete
                divElement.innerText = value;
                divElement.style.minHeight = '12px';
                divElement.style.padding = 'none';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            }
        });

        inputs.forEach((input) => {
            if (input.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css input
                divElement.innerText = '......';
                divElement.style.minHeight = '12px';
                divElement.style.padding = 'none';
                // Clone Style
                divElement.className = input.className;
                //Thay thế thẻ input = div được tạo
                input.parentNode.replaceChild(divElement, input);
            } else {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css input
                divElement.innerText = input.value;
                divElement.style.minHeight = '12px';
                divElement.style.padding = 'none';
                // Clone Style
                divElement.className = input.className;
                //Thay thế thẻ input = div được tạo
                input.parentNode.replaceChild(divElement, input);
            }
        });

        textareas.forEach((textarea) => {
            if (textarea.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css input
                divElement.innerText = '......';
                divElement.style.minHeight = '12px';
                // Clone Style
                divElement.className = textarea.className;
                //Thay thế thẻ textarea = div được tạo
                textarea.parentNode.replaceChild(divElement, textarea);
            } else {
                const divElement = document.createElement('div');
                // Sao chép nội dung và css textarea
                divElement.innerText = textarea.value;
                divElement.style.minHeight = '12px';
                divElement.style.padding = 'none';
                // Clone Style
                divElement.className = textarea.className;
                //Thay thế thẻ textarea = div được tạo
                textarea.parentNode.replaceChild(divElement, textarea);
                // Thay thế thẻ textarea bằng input được tạo
            }
        });
        // Xử lý từng trang riêng biệt
        console.timeEnd('printClone');
        return printClone;
    },

    getContentPrintBieu3: (paperRef) => {
        const printTarget = paperRef.current;
        const printClone = printTarget.cloneNode(true);
        // Xử lý các thẻ Autocomplete
        const autocompletes = printClone.querySelectorAll(
            '.MuiAutocomplete-root'
        );
        autocompletes.forEach((autocomplete) => {
            const inputElement = autocomplete.querySelector('input');
            if (inputElement) {
                const value = inputElement.value || ''; // Lấy giá trị từ input
                const divElement = document.createElement('div');
                divElement.innerText = value;
                divElement.style.minHeight = '16px';
                divElement.className = autocomplete.className;
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            }
        });

        // Xử lý các thẻ input
        const inputs = printClone.querySelectorAll('input');
        inputs.forEach((input) => {
            const divElement = document.createElement('div');
            divElement.innerText = input.value || '......'; // Lấy giá trị từ input
            divElement.style.minHeight = '16px';
            divElement.className = input.className;
            input.parentNode.replaceChild(divElement, input);
        });

        // Xử lý các thẻ textarea
        const textareas = printClone.querySelectorAll('textarea');
        textareas.forEach((textarea) => {
            const divElement = document.createElement('div');
            divElement.innerText = textarea.value || '......'; // Lấy giá trị từ textarea
            divElement.style.minHeight = '16px';
            divElement.className = textarea.className;
            textarea.parentNode.replaceChild(divElement, textarea);
        });

        // Xóa filter ẩn nếu có
        const filter = printClone.querySelector('#hiddenFilter');
        filter?.remove();
        return printClone; // Trả về clone đã xử lý
    },
    checkRole: (role, scope, userScope, editable) => {
        if (role === 'GiamSat') {
            return true;
        }
        if (role === 'Admin' && scope === userScope) {
            return true;
        }
        if (editable && scope === userScope) {
            return true;
        }
        if (!editable) {
            return true;
        }
        return false;
    },
    checkRoleAdminSystem: (
        role,
        typeOfUsers,
        rowTypeOfUsers,
        rowRole,
        rowScope,
        scope
    ) => {
        if (role === 'GiamSat') {
            return false;
        }
        if (rowTypeOfUsers === 'system' && typeOfUsers === 'system') {
            return true;
        }
        if (
            rowRole === 'Admin' &&
            scope === rowScope &&
            typeOfUsers !== 'system'
        ) {
            return false;
        }
        if (rowRole === 'Admin' && scope === 'tw' && rowScope === 'tinh') {
            return true;
        }
        if (rowTypeOfUsers === 'system') {
            return false;
        }
        if (rowTypeOfUsers !== 'system') {
            return true;
        }
        return false;
    },

    checkRoleThaoTac: (role, scope, userName, userScope, createdBy) => {
        if (role === 'GiamSat') {
            return true;
        }
        if (createdBy === userName) {
            return true;
        }
        if (role === 'Admin' && scope === userScope) {
            return true;
        }
        return false;
    },
    checkOptionRole: (role, scope, typeOfUsers, selectScope) => {
        if (role === 'Admin' && scope === 'tinh') {
            return false;
        }
        if (role === 'Admin' && scope === 'dvtt') {
            return false;
        }
        if (role === 'Admin' && selectScope !== 'tw') {
            return true;
        }
        if (role === 'Admin' && scope !== 'tw') {
            return false;
        }

        // if (role === 'Admin' && scope === 'tinh') {
        //     return false;
        // }
        return false;
    },
    checkOptionScope: (typeOfUsers, role, selectRole, scope) => {
        if (typeOfUsers === 'system') {
            return true;
        }
        if (scope !== 'tw') {
            return false;
        }
        if (role === 'Admin' && selectRole !== 'Admin') {
            return true;
        }
        return false;
    },
    getContentPrintBieuChiTiet1: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef;
        const printClone = printTarget.cloneNode(true);
        const hiddenFilter = printClone.querySelector('#hiddenFilter');
        hiddenFilter?.remove();
        // căn giữa coQuanThucHienElement chuyển thành thẻ div

        const inputs = printClone?.querySelectorAll('input');
        const buttons = printClone?.querySelectorAll('button');
        const h3s = printClone?.querySelectorAll('h3');
        const h7s = printClone?.querySelectorAll('h7');
        h7s.forEach((h7) => {
            h7.style.fontSize = '18px';
        });
        h3s?.forEach((h3) => {
            h3.style.fontSize = '14px';
        });
        inputs?.forEach((input) => {
            // Style cho input có id bằng removeBorderPrint
            if (input?.id === 'removeBorderPrint') {
                const divElement = document.createElement('div');
                // Sao chép nội dung và CSS của input
                divElement.innerText = input.value;
                divElement.style.minWidth = '100%';

                divElement.style.paddingTop = '6px';
                divElement.style.borderBottom = '1px solid #000000';
                input.parentNode.replaceChild(divElement, input);
            }
        });

        buttons?.forEach((button) => {
            // xóa button
            button?.remove();
        });
        // const textareas = printClone?.querySelectorAll('textarea');
        const autocompletes = printClone?.querySelectorAll(
            '.MuiAutocomplete-root'
        );
        autocompletes?.forEach((autocomplete) => {
            if (autocomplete.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css autocomplete
                divElement.innerText = '......';
                divElement.style.minHeight = '16px';
                divElement.style.width = '400px';
                divElement.style.fontSize = '14px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            } else {
                // Tạo ra thẻ div
                const value = autocomplete.querySelector('input').value;
                // style cho div padding-top :10px

                const divElement = document.createElement('div');
                divElement.style.paddingTop = '7px';
                divElement.style.paddingLeft = '3px';
                divElement.innerText = value;
                divElement.style.width = '400px';
                divElement.style.minHeight = '18px';
                divElement.style.fontSize = '18px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            }
        });

        return printClone;
    },

    getContentPrintBieuChiTiet22: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef;
        const printClone = printTarget.cloneNode(true);
        const thonXomElement = printClone.querySelector('#thonXom');
        const xaPhuongElement = printClone.querySelector('#xaPhuong');
        const quanHuyenElement = printClone.querySelector('#quanHuyen');
        const tinhThanhElement = printClone.querySelector('#tinhThanh');
        const hiddenFilter = printClone.querySelector('#hiddenFilter');
        hiddenFilter?.remove();
        const viTriHanhChinh22 = printClone.querySelector('#viTriHanhChinh22');
        console.log('viTriHanhChinh22', viTriHanhChinh22);
        if (viTriHanhChinh22) {
            viTriHanhChinh22.style.display = 'inline-block';
        }
        const mDSDs = printClone.querySelector('#phuongThucXaThaiHidden');
        const lHNT = printClone.querySelector('#loaiHinhNuocThaiHidden');
        if (lHNT) {
            lHNT.style.display = 'inline-block';
        }
        if (mDSDs) {
            mDSDs.style.display = 'inline-block';
        }
        const cDXT = printClone.querySelector('#cheDoXaThaiHidden');
        if (cDXT) {
            cDXT.style.display = 'inline-block';
        }

        if (xaPhuongElement && quanHuyenElement) {
            const parent = xaPhuongElement.parentNode;
            const nextSibling =
                xaPhuongElement.nextElementSibling === quanHuyenElement
                    ? xaPhuongElement
                    : xaPhuongElement.nextElementSibling;
            parent.insertBefore(xaPhuongElement, quanHuyenElement);
            parent.insertBefore(quanHuyenElement, nextSibling);
        }
        if (thonXomElement && tinhThanhElement) {
            const parent = thonXomElement.parentNode;
            const nextSibling =
                thonXomElement.nextElementSibling === tinhThanhElement
                    ? thonXomElement
                    : thonXomElement.nextElementSibling;
            parent.insertBefore(thonXomElement, tinhThanhElement);
            parent.insertBefore(tinhThanhElement, nextSibling);
        }
        const inputs = printClone?.querySelectorAll('input');
        const buttons = printClone?.querySelectorAll('button');
        const h3s = printClone?.querySelectorAll('h3');
        const h7s = printClone?.querySelectorAll('h7');
        const h6s = printClone?.querySelectorAll('h6');
        h6s.forEach((h6) => {
            h6.style.fontSize = '13pt';
        });
        h7s.forEach((h7) => {
            h7.style.fontSize = '18px';
        });
        h3s?.forEach((h3) => {
            h3.style.fontSize = '14px';
        });
        inputs?.forEach((input) => {
            // Style cho input có id bằng removeBorderPrint
            if (input?.id === 'removeBorderPrint') {
                const divElement = document.createElement('div');
                // Sao chép nội dung và CSS của input
                divElement.innerText = input.value;
                divElement.style.minWidth = '100%';

                divElement.style.paddingTop = '6px';
                divElement.style.borderBottom = '1px solid #000000';
                input.parentNode.replaceChild(divElement, input);
            }
        });

        buttons?.forEach((button) => {
            // xóa button
            button?.remove();
        });
        // const textareas = printClone?.querySelectorAll('textarea');
        const autocompletes = printClone?.querySelectorAll(
            '.MuiAutocomplete-root'
        );
        autocompletes?.forEach((autocomplete) => {
            if (autocomplete.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css autocomplete
                divElement.innerText = '......';
                divElement.style.minHeight = '16px';
                divElement.style.width = '400px';
                divElement.style.fontSize = '14px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            } else {
                // Tạo ra thẻ div
                const value = autocomplete.querySelector('input').value;
                // style cho div padding-top :10px

                const divElement = document.createElement('div');
                divElement.style.paddingTop = '7px';
                divElement.style.paddingLeft = '3px';
                divElement.innerText = value;
                divElement.style.width = '400px';
                divElement.style.minHeight = '18px';
                divElement.style.fontSize = '18px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            }
        });

        return printClone;
    },
    getContentPrintBieuChiTiet: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef;
        const printClone = printTarget.cloneNode(true);
        const thonXomElement = printClone.querySelector('#thonXom');
        const xaPhuongElement = printClone.querySelector('#xaPhuong');
        const quanHuyenElement = printClone.querySelector('#quanHuyen');
        const tinhThanhElement = printClone.querySelector('#tinhThanh');
        const hiddenFilter = printClone.querySelector('#hiddenFilter');
        hiddenFilter?.remove();

        if (xaPhuongElement && quanHuyenElement) {
            const parent = xaPhuongElement.parentNode;
            const nextSibling =
                xaPhuongElement.nextElementSibling === quanHuyenElement
                    ? xaPhuongElement
                    : xaPhuongElement.nextElementSibling;
            parent.insertBefore(xaPhuongElement, quanHuyenElement);
            parent.insertBefore(quanHuyenElement, nextSibling);
        }
        if (thonXomElement && tinhThanhElement) {
            const parent = thonXomElement.parentNode;
            const nextSibling =
                thonXomElement.nextElementSibling === tinhThanhElement
                    ? thonXomElement
                    : thonXomElement.nextElementSibling;
            parent.insertBefore(thonXomElement, tinhThanhElement);
            parent.insertBefore(tinhThanhElement, nextSibling);
        }
        const inputs = printClone?.querySelectorAll('input');
        const buttons = printClone?.querySelectorAll('button');
        const h3s = printClone?.querySelectorAll('h3');
        const h7s = printClone?.querySelectorAll('h7');
        const h6s = printClone?.querySelectorAll('h6');
        h6s.forEach((h6) => {
            h6.style.fontSize = '13pt';
        });
        h7s.forEach((h7) => {
            h7.style.fontSize = '18px';
        });
        h3s?.forEach((h3) => {
            h3.style.fontSize = '14px';
        });
        inputs?.forEach((input) => {
            // Style cho input có id bằng removeBorderPrint
            if (input?.id === 'removeBorderPrint') {
                const divElement = document.createElement('div');
                // Sao chép nội dung và CSS của input
                divElement.innerText = input.value;
                divElement.style.minWidth = '100%';

                divElement.style.paddingTop = '6px';
                divElement.style.borderBottom = '1px solid #000000';
                input.parentNode.replaceChild(divElement, input);
            }
        });

        buttons?.forEach((button) => {
            // xóa button
            button?.remove();
        });
        // const textareas = printClone?.querySelectorAll('textarea');
        const autocompletes = printClone?.querySelectorAll(
            '.MuiAutocomplete-root'
        );
        autocompletes?.forEach((autocomplete) => {
            if (autocomplete.classList.contains('no_replace')) {
                // Tạo ra thẻ div
                const divElement = document.createElement('div');
                // Sao chép nội dung và css autocomplete
                divElement.innerText = '......';
                divElement.style.minHeight = '16px';
                divElement.style.width = '400px';
                divElement.style.fontSize = '14px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            } else {
                // Tạo ra thẻ div
                const value = autocomplete.querySelector('input').value;
                // style cho div padding-top :10px

                const divElement = document.createElement('div');
                divElement.style.paddingTop = '7px';
                divElement.style.paddingLeft = '3px';
                divElement.innerText = value;
                divElement.style.width = '400px';
                divElement.style.minHeight = '18px';
                divElement.style.fontSize = '18px';
                // Clone Style
                divElement.className = autocomplete.className;
                //Thay thế thẻ autocomplete = div được tạo
                autocomplete.parentNode.replaceChild(divElement, autocomplete);
            }
        });

        return printClone;
    },
    getContentPrintBieuChiTiet18: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef?.current;
        const printClone = printTarget.cloneNode(true);
        const buttons = printClone?.querySelectorAll('button');
        const h5s = printClone?.querySelectorAll('h5');

        h5s?.forEach((h5) => {
            h5.remove();
        });

        buttons?.forEach((button) => {
            // xóa button
            button?.remove();
        });
        // const textareas = printClone?.querySelectorAll('textarea');
        const thonXomElement = printClone.querySelector('#thonXom');
        const xaPhuongElement = printClone.querySelector('#xaPhuong');
        const quanHuyenElement = printClone.querySelector('#quanHuyen');
        const tinhThanhElement = printClone.querySelector('#tinhThanh');

        if (xaPhuongElement && quanHuyenElement) {
            const parent = xaPhuongElement.parentNode;
            const nextSibling =
                xaPhuongElement.nextElementSibling === quanHuyenElement
                    ? xaPhuongElement
                    : xaPhuongElement.nextElementSibling;
            parent.insertBefore(xaPhuongElement, quanHuyenElement);
            parent.insertBefore(quanHuyenElement, nextSibling);
        }
        if (thonXomElement && tinhThanhElement) {
            const parent = thonXomElement.parentNode;
            const nextSibling =
                thonXomElement.nextElementSibling === tinhThanhElement
                    ? thonXomElement
                    : thonXomElement.nextElementSibling;
            parent.insertBefore(thonXomElement, tinhThanhElement);
            parent.insertBefore(tinhThanhElement, nextSibling);
        }
        const inputs = printClone?.querySelectorAll('input');
        inputs?.forEach((input) => {
            // xóa placeholder ở thẻ input
            if (input?.placeholder) {
                input.placeholder = '';
            }
        });

        return printClone;
    },
    getContentPrintBieuChiTiet20: (paperRef) => {
        /*LƯU Ý:
         * - paperRef là ref của content muốn In.
         * - class no_replace vào các el input/textarea không muốn bị thay thế bằng div
         * - thêm xử lý logic bên dưới
         */
        const printTarget = paperRef;
        const printClone = printTarget.cloneNode(true);
        const thonXomElement = printClone.querySelector('#thonXom');
        const xaPhuongElement = printClone.querySelector('#xaPhuong');
        const quanHuyenElement = printClone.querySelector('#quanHuyen');
        const tinhThanhElement = printClone.querySelector('#tinhThanh');
        const subTT = printClone.querySelector('#hiddenInput');
        const sus = printClone.querySelector('#new');
        const mDSDs = printClone.querySelector('#mucDichSuDungHiden');
        // hiển thị mục đích sử dụng
        if (mDSDs) {
            // xóa style display:none
            mDSDs.style.display = 'inline-block';
        }
        if (sus) {
            sus.style.paddingLeft = '20px';
        }
        //chuyển subTT thành thẻ div
        if (subTT) {
            const divElement = document.createElement('div');
            divElement.innerText = subTT.value;
            divElement.style.minHeight = '16px';
            divElement.style.fontSize = '18px';
            //xóa padding-right của div
            console.log('divElement', divElement);
            subTT.parentNode.replaceChild(divElement, subTT);
        }

        if (xaPhuongElement && quanHuyenElement) {
            const parent = xaPhuongElement.parentNode;
            const nextSibling =
                xaPhuongElement.nextElementSibling === quanHuyenElement
                    ? xaPhuongElement
                    : xaPhuongElement.nextElementSibling;
            parent.insertBefore(xaPhuongElement, quanHuyenElement);
            parent.insertBefore(quanHuyenElement, nextSibling);
        }
        if (thonXomElement && tinhThanhElement) {
            const parent = thonXomElement.parentNode;
            const nextSibling =
                thonXomElement.nextElementSibling === tinhThanhElement
                    ? thonXomElement
                    : thonXomElement.nextElementSibling;
            parent.insertBefore(thonXomElement, tinhThanhElement);
            parent.insertBefore(tinhThanhElement, nextSibling);
        }

        const inputs = printClone?.querySelectorAll('input');

        const buttons = printClone?.querySelectorAll('button');
        const h3s = printClone?.querySelectorAll('h3');
        const h7s = printClone?.querySelectorAll('h7');
        const h9s = printClone?.querySelectorAll('h9');
        const hiddeninput = printClone?.querySelectorAll('#hiddenMDSDK');
        const hiddenMSelect = printClone?.querySelectorAll('#hiddenMDSD');
        hiddeninput?.forEach((hiddenKhac) => {
            hiddenKhac?.remove();
        });
        const showMSelect = printClone?.querySelectorAll('#showMDSD');
        //ẩn hiddenMSelect và đổi thẻ input showMSelect thành text
        hiddenMSelect?.forEach((hidden) => {
            hidden?.remove();
        });
        showMSelect?.forEach((show) => {
            show.type = 'text';
        });

        h9s?.forEach((h9) => {
            h9?.remove();
        });
        h7s.forEach((h7) => {
            h7.style.fontSize = '18px';
        });
        h3s?.forEach((h3) => {
            h3.style.fontSize = '17px';
        });
        //nếu thẻ input có class hiddenInput thì chuyển thành div

        inputs?.forEach((input) => {
            // style cho inpu có id bằng removeBorderPrint
            if (input?.id === 'removeBorderPrintB20') {
                console.log(input?.id === 'removeBorderPrintB20');
                input.style.border = 'none';
                input.style.paddingTop = '6px';
            }
            // xóa placeholder ở thẻ input
            if (input?.placeholder) {
                input.placeholder = '';
            }
        });

        buttons?.forEach((button) => {
            // xóa button
            button?.remove();
        });

        // const textareas = printClone?.querySelectorAll('textarea');

        return printClone;
    },
    parseJsonData: (records, keys) => {
        if (
            !records ||
            !Array.isArray(records) ||
            !keys ||
            !Array.isArray(keys)
        ) {
            return [];
        }

        return records.map((record) => {
            const parsedRecord = { ...record };

            keys.forEach((key) => {
                if (parsedRecord.hasOwnProperty(key)) {
                    try {
                        const newKey = key.replace(/json/gi, '');
                        const parsedJson = JSON.parse(parsedRecord[key]);
                        parsedRecord[newKey] = parsedJson;
                    } catch (error) {
                        console.error(
                            `Lỗi khi parse "${key}" trong records: `,
                            error
                        );
                    }
                }
            });

            return parsedRecord;
        });
    },
};

export default Helper;
