import { Check } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import readXlsxFile from 'read-excel-file';
function ExcelDateToJSDate(date) {
    const _date = new Date(Math.round((date - 25569) * 86400 * 1000));
    return moment(_date).format("DD/MM/YYYY");
}



export const useExcelReaderService = (mapping = []) => {
    const LHNTs =
        useSelector((state) => state.app?.DanhMucs?.loaiHinhNuocThais || []);
    const LCTs =
        useSelector((state) => state.app?.DanhMucs?.loaiCongTrinhs || []);
    const MDSDs =
        useSelector((state) => state.app?.DanhMucs?.mucDichSuDungs || []);
    const tinhThanh0s = useSelector((state) => state.app?.TinhThanh0s || []);
    const { scope, tinhThanhId, tinhThanh } = useSelector(
        (state) => state?.auth
    );
    const luuVucSongNT = useSelector((state) => state.app?.luuVucSongs) || [];
    const luuVucSongLT = useSelector((state) => state.app?.DanhMucs?.luuVucSongLienTinhs) || [];

    const luuVucSongNTNew = [
        ...luuVucSongLT,
        ...luuVucSongNT,
    ];
    const luuVucSongs =
        scope === 'tinh'
            ? luuVucSongNTNew
            : luuVucSongLT;
    const autoMappingMdsd = (mdsds = []) => {
        let mucDichSuDungs = [];
        let mucDichSuDungIds = [];
        try {
            mdsds?.forEach((item) => {
                const isExistName = MDSDs?.find(s => (s?.tenMuc === item));
                const isExistId = MDSDs?.find(s => (s?.maMuc === item));
                if (Boolean(isExistName)) {
                    mucDichSuDungs.push(isExistName?.tenMuc);
                    mucDichSuDungIds.push(isExistName?.maMuc);
                }
                if (Boolean(isExistId)) {
                    mucDichSuDungs.push(isExistId?.tenMuc);
                    mucDichSuDungIds.push(isExistId?.maMuc);
                }
                if (!Boolean(isExistId) && !Boolean(isExistName)) {
                    mucDichSuDungs.push(item);
                }
            })

            return {
                mucDichSuDungIds: [...new Set(mucDichSuDungIds)],
                mucDichSuDungs: [...new Set(mucDichSuDungs)]
            }
        } catch (error) {
            return {
                mucDichSuDungIds: [...new Set(mucDichSuDungIds)],
                mucDichSuDungs: [...new Set(mucDichSuDungs)]
            }
        }
    }

    const autoMappingLct = (lcts = []) => {
        let loaiCongTrinhs = [];
        let loaiCongTrinhIds = [];
        try {
            lcts?.forEach((item) => {
                const isExistName = LCTs?.find(s => (s?.tenMuc === item));
                const isExistId = LCTs?.find(s => (s?.maMuc === item));
                if (Boolean(isExistName)) {
                    loaiCongTrinhs.push(isExistName?.tenMuc);
                    loaiCongTrinhIds.push(isExistName?.maMuc);
                }
                if (Boolean(isExistId)) {
                    loaiCongTrinhs.push(isExistId?.tenMuc);
                    loaiCongTrinhIds.push(isExistId?.maMuc);
                }
                if (!Boolean(isExistId) && !Boolean(isExistName)) {
                    loaiCongTrinhs.push(item);
                }
            })

            return {
                loaiCongTrinhIds: [...new Set(loaiCongTrinhIds)],
                loaiCongTrinhs: [...new Set(loaiCongTrinhs)]
            }
        } catch (error) {
            return {
                loaiCongTrinhIds: [...new Set(loaiCongTrinhIds)],
                loaiCongTrinhs: [...new Set(loaiCongTrinhs)]
            }
        }
    }

    const handleFormat = (data = []) => {
        try {
            const result = data
                .map((i) => {
                    if (i.every((i) => i === null)) {
                        return 'null';
                    }
                    return i;
                })
                ?.filter((i) => i !== 'null');
            result?.forEach((item) => {
                while (item?.[0] === null) {
                    item?.shift();
                }
            });
            return result;
        } catch (error) {
            toast.error('Đã có xảy ra khi cấu trúc lại dữ liệu', {
                icon: '🚫',
            });
            console.log(error);
        }
    };

    const mappingByIndex = (data) => {
        try {
            const _data = handleFormat(data);
            const result = _data?.slice(1);
            const response = [];

            result?.forEach((item) => {
                const _item = {};
                item?.forEach((subItem, index) => {
                    const _key = mapping?.find(
                        (i) => i?.columnIndex === index
                    )?.name;
                    const _value = subItem;
                    _item[_key] = _value;
                });
                response.push(_item);
            });

            return response;
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi hệ thống tái cấu trúc dữ liệu', {
                icon: '🚫',
            });
            console.log(error);
        }
    };

    const removeStr = (str) => {
        const _str = str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return _str?.toLowerCase().replace(/\s/g, '-');
    };

    const mappingByName = (data) => {
        try {
            const _data = handleFormat(data);
            const headers = _data?.[0];
            const results = _data?.slice(1);
            const response = [];

            results?.forEach((item) => {
                const _item = {};
                item?.forEach((subItem, index) => {
                    const _key = removeStr(headers?.[index]);
                    const _value = subItem;
                    const _define = mapping?.find(
                        (i) => removeStr(i.name) === _key
                    );
                    if (_define) {
                        _item[_define?.key] = _value;
                    }
                });
                response.push(_item);
            });

            return response;
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi hệ thống tái cấu trúc dữ liệu', {
                icon: '🚫',
            });
            console.log(error);
        }
    };

    const mappingByHeaders = (data = [], headers = []) => {
        try {
            return data?.map((item, index) => {
                const _item = {};
                item?.forEach((subItem, subIndex) => {
                    const _key = headers?.[subIndex];
                    const _value = subItem;
                    _item[_key] = _value;
                });
                return _item;
            });
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi hệ thống tái cấu trúc dữ liệu', {
                icon: '🚫',
            });
            console.log(error);
        }
    };

    const getAllHeadersByIndex = (data, from, to) => {
        return {
            headers: data?.slice(from, to) || [],
            data: data?.slice(to + 1) || [],
        };
    };

    // regex kiểm tra xem có phải kí tự la mã hay không
    const isLaMa = (str = '') => {
        const regex = /[a-zA-Z]/g;
        return regex?.test(str);
    };

    const isBlockHeader = ({ data = [] }) => {
        return isLaMa(data?.[0]);
    };
    const isBlockHeaderTinh = ({ data }) => {
        // cắt đi các chữ của data[1] 'T.', 'TP.', 'Tỉnh', 'Thành phố' để kiểm tra xem có phải là tên tỉnh không
        const dataStr = convertDataImport(data[1], 'String');
        const _data = dataStr.replace(/T\.|TP\.|Tỉnh|Thành phố/g, '').trim();
        return tinhThanh0s.some((tinh) => tinh.tenRutGon === _data) || ''; // Kiểm tra nếu `tenTinh` có trong danh sách `tinhThanh0s`
    };

    const isBlockHeaderLVS = ({ data }) => {
        const dataStr = convertDataImport(data[1], 'String');
        const _data = dataStr.replace(/\s+/g, '').trim();
        return luuVucSongs.some((lvs) => lvs.tenMuc === _data) || ''; // Kiểm tra nếu `tenTinh` có trong danh sách `tinhThanh0s`
    };
    // const isBlockHeaderIsLaMa = ({ data }) => {
    //     return isLaMa(data?.[0]);
    // }
    const isBlockHeaderIsLaMa = ({ data }) => {
        // Nếu dòng đó trống thì bỏ qua nó 
        if (data?.[0] === null) {
            return false;
        }

        // Kiểm tra xem cột đầu tiên có phải số La Mã tự đánh không
        return isLaMa(data?.[0]);
    };
    const isStringNumber = (str) => {
        const regex = /^[0-9]+$/;
        return regex?.test(str);
    };
    const xoaTienTo = (str, type) => {
        if (type === 'tinh') {
            return str.replace(/T\.|TP\.|Tỉnh|Thành phố/g, '').trim();
        }
        if (type === 'huyen') {
            return str.replace(/TX\.|TP\.|Thị xã|Quận|Huyện|Thành phố/g, '').trim();
        }
        if (type === 'xa') {
            return str.replace(/TT\.|P\.|Xã|Phường|Thị trấn/g, '').trim();
        }
    }

    const unique = (data = []) => {
        return [...new Set(data)];
    };

    const removeEmptyArray = (
        data = {
            header: [],
            data: [],
        },
        removePattern = {
            key: 'header',
            hint: '',
        }
    ) => {
        try {
            const response = [];
            data?.forEach((row) => {
                if (row?.header?.length > 0) {
                    response.push(row);
                }
            });

            if (removePattern?.key) {
                const index = response?.findIndex((i) =>
                    i?.[removePattern?.key]?.includes(removePattern?.hint)
                );
                if (index > -1) {
                    response?.splice(index, 1);
                }
            }
            return response;
        } catch (error) {
            toast.error(
                'Đã có lỗi khi hệ thống thực hiện loại bỏ một số dữ liệu',
                {
                    icon: '🚫',
                }
            );
            console.log(error);
        }
    };
    const trySplitToBlocks = (data = [], hint = '', rowIndex = 0) => {
        try {
            const _data = [];
            let _key = -1;
            // Normalize hint để loại bỏ khoảng trắng và không phân biệt hoa/thường
            const normalizedHint = hint.trim().toLowerCase();

            data?.forEach((row) => {
                // Chuẩn hóa giá trị trong cột
                const cellValue = String(row?.[rowIndex] || '').trim().toLowerCase();

                if (cellValue.includes(normalizedHint)) {
                    // Nếu dòng này chứa header, tạo block mới
                    _key++;
                    _data[_key] = [];
                } else if (_key >= 0) {
                    // Thêm dòng vào block hiện tại
                    _data[_key]?.push(row);
                }
            });

            if (_key === -1) {
                console.warn('Không tìm thấy bất kỳ block nào với hint:', hint);
            }

            return _data;
        } catch (error) {
            console.error('Đã có lỗi khi tách dữ liệu:', error);
            throw new Error('Cấu trúc dữ liệu hoặc hint không hợp lệ');
        }
    };

    // const trySplitToBlocks = (data = [], hint = '', rowIndex = 0) => {
    //     // từ các dòng dữ liệu, tách ra các block dữ liệu theo header
    //     try {
    //         const _data = [];
    //         let _key = -1;
    //         data?.forEach((row) => {
    //             if (String(row?.[rowIndex])?.includes(hint)) {
    //                 _key++;
    //                 _data[_key] = [];
    //             } else {
    //                 _data[_key]?.push(row);
    //             }
    //         });

    //         return _data;
    //     } catch (error) {
    //         toast.error(
    //             'Đã có lỗi khi tách dữ liệu | Cấu trúc file không hợp lệ',
    //             {
    //                 icon: '🚫',
    //             }
    //         );
    //         console.log(error);
    //     }
    // };
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    const isRomanNumeral = (str) => {
        const romanRegex = /^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
        return romanRegex.test(str.trim());
    };

    const splitArrayLaMa = (data = [], rowIndex = 1) => {
        const response = [];

        data.forEach((row) => {
            if (row && row[rowIndex]) {
                const normalizedRow = removeAccents(
                    row[rowIndex].trim().toUpperCase()
                );
                const isRoman = isRomanNumeral(normalizedRow);

                if (isRoman) {
                    response.push({
                        header: row,
                        data: [],
                    });
                } else if (response.length > 0) {
                    response[response.length - 1].data.push(row);
                }
            }
        });

        return response;
    };
    const splitArray = (data = [], hints = [], rowIndex = 1) => {
        const response = [];

        data.forEach((row) => {
            const cell = row && row[rowIndex] ? String(row[rowIndex]).trim() : null; // Đảm bảo `row[rowIndex]` là chuỗi
            if (cell) {
                const normalizedCell = removeAccents(cell.toLowerCase());
                const hasHint = hints.some((hint) =>
                    normalizedCell.includes(removeAccents(hint.trim().toLowerCase()))
                );

                if (hasHint) {
                    response.push({
                        header: row,
                        data: [],
                    });
                } else if (response.length > 0) {
                    response[response.length - 1].data.push(row);
                }
            }
        });

        return response;
    };
    const splitArrayChuoi = (data = [], hints = [], rowIndex = 1) => {
        const response = [];

        data.forEach((row) => {
            if (row && row[rowIndex]) {
                const normalizedRow = removeAccents(
                    row[rowIndex].trim().toLowerCase()
                );

                // Kiểm tra nếu `hints` là hàm hoặc là mảng chuỗi
                const hasHint =
                    typeof hints === "function"
                        ? hints(row[rowIndex])  // Sử dụng hàm kiểm tra
                        : hints.some(hint => normalizedRow.includes(removeAccents(hint.trim().toLowerCase()))); // Kiểm tra với mảng chuỗi

                if (hasHint) {
                    response.push({
                        header: row,
                        data: [],
                    });
                } else if (response.length > 0) {
                    response[response.length - 1].data.push(row);
                }
            }
        });

        return response;
    };
    const splitWithPattern = (data = [], pattern) => {
        const response = [];
        data?.forEach((row) => {
            if (pattern(row)) {
                response?.push({
                    header: row,
                    data: [],
                });
            } else {
                response?.[response?.length - 1]?.data?.push(row);
            }
        });

        return response;
    };

    const checkColumnExists = (data, index, keyword) => {
        return (
            data[index] &&
            data[index][0] &&
            data[index][0].some(
                (item) =>
                    typeof item === 'string' &&
                    item.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    };
    const checkColumnExists1Chieu = (data, index, keyword) => {
        if (Array.isArray(keyword)) {
            return data[index].some(
                (item) =>
                    typeof item === 'string' &&
                    keyword.map(i => i?.toLowerCase()).includes(item.toLowerCase())
            );
        }
        return data[index].some(
            (item) =>
                typeof item === 'string' &&
                item.toLowerCase().includes(keyword.toLowerCase())
        );
    };
    const total = (data) => {
        return data?.reduce((acc, cur) => {
            return acc + Number(cur);
        }, 0);
    };
    // tạo key so sánh trùng dữ liệu
    const createKey = (str) => {// ánh xạ theo chữ VN
        if (!str) return '';
        const vietnameseMap = {
            'á': 'as', 'à': 'af', 'ả': 'ar', 'ã': 'ax', 'ạ': 'aj',
            'â': 'aa', 'ấ': 'aas', 'ầ': 'aaf', 'ẩ': 'aar', 'ẫ': 'aax', 'ậ': 'aaj',
            'ă': 'aw', 'ắ': 'aws', 'ằ': 'awf', 'ẳ': 'awr', 'ẵ': 'awx', 'ặ': 'awj',
            'Á': 'As', 'À': 'Af', 'Ả': 'Ar', 'Ã': 'Ax', 'Ạ': 'Aj',
            'Â': 'Aa', 'Ấ': 'Aas', 'Ầ': 'Aaf', 'Ẩ': 'Aar', 'Ẫ': 'Aax', 'Ậ': 'Aaj',
            'Ă': 'Aw', 'Ắ': 'Aws', 'Ằ': 'Awf', 'Ẳ': 'Awr', 'Ẵ': 'Awx', 'Ặ': 'Awj',
            'é': 'es', 'è': 'ef', 'ẻ': 'er', 'ẽ': 'ex', 'ẹ': 'ej',
            'ê': 'ee', 'ế': 'ees', 'ề': 'eef', 'ể': 'eer', 'ễ': 'eex', 'ệ': 'eej',
            'É': 'Es', 'È': 'Ef', 'Ẻ': 'Er', 'Ẽ': 'Ex', 'Ẹ': 'Ej',
            'Ê': 'Ee', 'Ế': 'Ees', 'Ề': 'Eef', 'Ể': 'Eer', 'Ễ': 'Eex', 'Ệ': 'Eej',
            'í': 'is', 'ì': 'if', 'ỉ': 'ir', 'ĩ': 'ix', 'ị': 'ij',
            'Í': 'Is', 'Ì': 'If', 'Ỉ': 'Ir', 'Ĩ': 'Ix', 'Ị': 'Ij',
            'ó': 'os', 'ò': 'of', 'ỏ': 'or', 'õ': 'ox', 'ọ': 'oj',
            'ô': 'oo', 'ố': 'oos', 'ồ': 'oof', 'ổ': 'oor', 'ỗ': 'oox', 'ộ': 'ooj',
            'ơ': 'ow', 'ớ': 'ows', 'ờ': 'owf', 'ở': 'owr', 'ỡ': 'owx', 'ợ': 'owj',
            'Ó': 'Os', 'Ò': 'Of', 'Ỏ': 'Or', 'Õ': 'Ox', 'Ọ': 'Oj',
            'Ô': 'Oo', 'Ố': 'Oos', 'Ồ': 'Oof', 'Ổ': 'Oor', 'Ỗ': 'Oox', 'Ộ': 'Ooj',
            'Ơ': 'Ow', 'Ớ': 'Ows', 'Ờ': 'Owf', 'Ở': 'Owr', 'Ỡ': 'Owx', 'Ợ': 'Owj',
            'ú': 'us', 'ù': 'uf', 'ủ': 'ur', 'ũ': 'ux', 'ụ': 'uj',
            'ư': 'uw', 'ứ': 'uws', 'ừ': 'uwf', 'ử': 'uwr', 'ữ': 'uwx', 'ự': 'uwj',
            'Ú': 'Us', 'Ù': 'Uf', 'Ủ': 'Ur', 'Ũ': 'Ux', 'Ụ': 'Uj',
            'Ư': 'Uw', 'Ứ': 'Uws', 'Ừ': 'Uwf', 'Ử': 'Uwr', 'Ữ': 'Uwx', 'Ự': 'Uwj',
            'ý': 'ys', 'ỳ': 'yf', 'ỷ': 'yr', 'ỹ': 'yx', 'ỵ': 'yj',
            'Ý': 'Ys', 'Ỳ': 'Yf', 'Ỷ': 'Yr', 'Ỹ': 'Yx', 'Ỵ': 'Yj',
            'đ': 'dd', 'Đ': 'Dd',
            ' ': '', '-': '', '_': ''
        };

        return str
            .split('')
            .map(char => vietnameseMap[char] || char) // Thay thế bằng bảng ánh xạ
            .join('')
            .replace(/[^a-z0-9]/gi, '') // Giữ lại chữ và số
            .toLowerCase(); // Chuyển thành chữ thường
    };
    const removeVietnameseTones = (str) => {
        if (!str) return '';
        else {
            return str
                .normalize('NFD')                     // Tách dấu khỏi ký tự
                .replace(/[\u0300-\u036f]/g, '')      // Loại bỏ tất cả dấu
                .replace(/đ/g, 'd')                   // Chuyển 'đ' thành 'd'
                .replace(/Đ/g, 'D')                   // Chuyển 'Đ' thành 'D'
                .replace(/[^a-zA-Z0-9\s]/g, '')       // Loại bỏ các ký tự đặc biệt, giữ lại chữ và số
                .replaceAll(/\s/g, '')            // Loại bỏ khoảng trắng thừa
                .trim()                               // Loại bỏ khoảng trắng đầu và cuối chuỗi
                .toLowerCase();  // Chuyển tất cả thành chữ thường
        }
    };

    function convertExcelDateToText(excelDate) {
        const excelEpoch = new Date(1899, 11, 30);
        const days = parseInt(excelDate, 10);
        const date = new Date(
            excelEpoch.getTime() + days * 24 * 60 * 60 * 1000
        );

        // Định dạng ngày thành chuỗi (dd/mm/yyyy)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`; // Định dạng ngày mong muốn (dd/mm/yyyy)
    }
    const convertTime = (dateString) => {
        var date = new Date(dateString);
        var timestamp = date.getTime();
        return Math.floor(timestamp);
    };
    function isExcelDate(value) {
        // Kiểm tra nếu giá trị là số
        if (typeof value === 'number') {
            // Giá trị date trong Excel phải lớn hơn 0 (tính từ 1900-01-01)
            // Một số hệ thống Excel có thể bắt đầu từ 1904, tùy phiên bản, nhưng thông thường là 1900
            // Giả sử rằng số ngày hợp lệ sẽ nằm trong khoảng từ 1 đến 2958465 (tương ứng 9999-12-31)
            if (value === 0) return true;
            return value >= 1 && value <= 2958465; // Giới hạn từ 1900-01-01 đến 9999-12-31
        }

        // Trả về false nếu không phải là số
        return false;
    }
    function convertExcelDateToTimestamp(excelDate) {
        if (!excelDate) return null;
        const excelDates = convertExcelDateToText(excelDate);

        // Nếu định dạng đã là yyyy-mm-dd thì không cần chuyển đổi, chỉ lấy timestamp
        if (excelDates.includes('-')) {
            const date = new Date(excelDates);
            return date.getTime();
        }

        // Nếu định dạng đã là dd/mm/yyyy thì chuyển sang yyyy-mm-dd
        else if (excelDates.includes('/')) {
            const dateParts = excelDates.split('/');

            // Xác định dạng ngày từ dd/mm/yyyy thành yyyy-mm-dd
            const dateObject = new Date(
                +dateParts[2],
                dateParts[1] - 1,
                +dateParts[0]
            );
            return dateObject.getTime();
        }

        // Trường hợp Excel date dưới dạng số (số serial của Excel), chuyển thành timestamp
        else if (!isNaN(excelDates)) {
            // Ngày Excel bắt đầu từ 1/1/1900, cần cộng thêm số miligiây cho việc tính toán timestamp
            const excelStartDate = new Date(1900, 0, 1);
            const timestamp =
                excelStartDate.getTime() + (excelDates - 1) * 86400000; // 86400000 là số mili giây trong 1 ngày
            return timestamp;
        }

        return null; // Trả về null nếu không phải định dạng ngày hợp lệ
    }

    // Hàm xử lý giá trị cell
    function getCellValueProcessed(
        row,
        columnName,
        columnMappings,
        type = 'string'
    ) {
        const columnMapping = columnMappings.find(
            (col) => col.name === columnName
        );
        if (!columnMapping || columnMapping.index === -1) return null;

        const cellValue = row[columnMapping.index];

        // Xử lý dữ liệu dựa trên loại (string, number, etc.)
        if (type === 'number') {
            if (typeof cellValue === 'string') {
                // nếu trống thì bằng 0
                if (cellValue === '') {
                    return 0;
                }
                // nếu chuỗi có dấu ,chuyển dấu, thành. 
                if (cellValue.includes(',')) {
                    return parseFloat(cellValue.replace(',', '.'));
                }
                return !isNaN(cellValue) ? parseFloat(cellValue) : 'error';
            } else {
                return cellValue;
            }
        }
        if (type === 'date') {
            return convertExcelDateToTimestamp(cellValue);
        }

        return typeof cellValue === 'string'
            ? cellValue.trim() + ''
            : cellValue + '';
    }

    // Hàm xử lý danh sách chuỗi, sau đó kiểm tra với hàm callback
    function splitAndMap(value, callback) {
        return typeof value === 'string'
            ? value.split(',').map((item) => callback(item.trim()))
            : [];
    }

    // const removePrefixes = (str, prefixes) => {
    //     const regex = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
    //     return str.replace(regex, '').trim();
    // };
    // const removePrefixes = (str, prefixes) => {
    //     const regex = new RegExp(`^\\s*(${prefixes.map(prefix => `(?:${prefix}\\b)`).join('|')})\\s+`, 'i');
    //     return str.replace(regex, '').trim();
    // };
    const removePrefixes = (str, prefixes) => {
        const regex = new RegExp(`^(${prefixes.map(prefix => `${prefix}(\\b|$)`).join('|')})\\s*`, 'i');
        return str.replace(regex, '').trim();
    };
    const findTinhThanh = (tinhThanhs, tinhThanh) => {
        const tinhThanhFormatted = removeVietnameseTones(
            xoaPhuDeTinhThanh(tinhThanh.trim())
        );
        return (
            tinhThanhs?.find(
                (tinhThanh0) =>
                    removeVietnameseTones(tinhThanh0.tenRutGon) ===
                    tinhThanhFormatted
            ) || null
        );
    };
    const findQuanHuyen = (tinhThanhs, quanHuyen) => {
        const quanHuyenFormatted = removeVietnameseTones(
            xoaPhuDeQuanHuyen(quanHuyen.trim())
        );
        return (
            tinhThanhs?.quanHuyens?.filter(
                (quanHuyen0) =>
                    removeVietnameseTones(quanHuyen0?.tenRutGon) ===
                    quanHuyenFormatted
            ) || []
        );
    };
    const xoaPhuDeTinhThanh = (tinhThanh) => {
        // xóa chữ thuộc cả viết hoa và viết thường
        // nếu tinhThanh là số thì return số 
        if (isStringNumber(tinhThanh)) return tinhThanh;
        if (tinhThanh === null || tinhThanh === '') return '';
        tinhThanh = tinhThanh?.toLowerCase()
            .replace('t.', '')
            .replace('tp.', '')
            .replace('tỉnh', '')
            .replace('thành phố', '')
            .replace('t ', '')
            .replace('tp ', '')
            .trim();
        return tinhThanh;
    }
    const xoaPhuDeQuanHuyen = (quanHuyen) => {
        // xóa chữ thuộc cả viết hoa và viết thường
        // nếu quanHuyen là số thì return số 
        if (isStringNumber(quanHuyen)) return quanHuyen;
        if (quanHuyen === null || quanHuyen === '') return '';
        quanHuyen = quanHuyen?.toLowerCase()
            ?.replace('tx.', '')
            .replace('tp.', '')
            .replace('thị xã', '')
            .replace('quận', '')
            .replace('huyện', '')
            .replace('thành Phố', '')
            .replace('tx', '')
            .replace('tp ', '')
            .replace('h.', '')
            .replace('q.', '')
            .replace('h ', '')
            .replace('q ', '')
            .trim();
        return quanHuyen;
    }
    const xoaPhuDePhuongXa = (phuongXa) => {
        // xóa chữ thuộc cả viết hoa và viết thường
        // nếu phuongXa là số thì return số 
        if (isStringNumber(phuongXa)) return phuongXa;
        if (phuongXa === null || phuongXa === '') return '';
        phuongXa = phuongXa?.toLowerCase()
            ?.replace('tt.', '')
            .replace('p.', '')
            .replace('xã', '')
            .replace('phường', '')
            .replace('thị trấn', '')
            .replace('tt ', '')
            .replace('p ', '')
            .replace('x.', '')
            .replace('x ', '')
            .trim();
        return phuongXa;
    }
    const findPhuongXa = (quanHuyen, phuongXa) => {
        const phuongXaFormatted = removeVietnameseTones(
            xoaPhuDePhuongXa(phuongXa.trim())
        );
        for (const quanHuyen0 of quanHuyen) {
            const phuongXaFound = quanHuyen0.phuongXas?.find((phuongXa0) => {
                const formattedPhuongXa0 = removeVietnameseTones(
                    phuongXa0?.tenRutGon
                );
                return formattedPhuongXa0 === phuongXaFormatted;
            });

            if (phuongXaFound) {
                return phuongXaFound;
            }
        }

        return null;
    };

    // hàm check lưu vực sông
    const findLuuVucSongId = (luuVucSong) => {
        // Kiểm tra luuVucSongs và luuVucSong có hợp lệ
        if (!Array.isArray(luuVucSongs) || !luuVucSong) return '';
        // Xóa khoảng trống, dấu và chuyển thành chữ thường
        luuVucSong = removeVietnameseTones(luuVucSong);
        // Tìm `item` có `tenMuc` trùng khớp với `luuVucSong`
        const matchedItem = luuVucSongs.find((item) => {
            return item && item.tenMuc && removeVietnameseTones(item.tenMuc) === luuVucSong;
        });
        return matchedItem ? matchedItem.maMuc : '';
    };
    const xoaPhuDeluuVucSong = (luuVucSong) => {
        // xóa chữ thuộc cả viết hoa và viết thường
        // nếu luuVucSong là số thì return số 
        if (isStringNumber(luuVucSong)) return luuVucSong;
        if (luuVucSong === null || luuVucSong === '') return '';
        luuVucSong = luuVucSong?.replace('Thuộc', '')
            .replace('thuộc', '')
            .trim();
        return luuVucSong;

    };
    // convert data import
    const convertDataImport = (data, type) => {
        switch (type) {
            case 'String':
                return data != null && data !== '' ? String(data) : ''; // Chuyển đổi thành chuỗi hoặc trả về chuỗi rỗng
            case 'Number':
                return typeof data === 'number' ? data : parseFloat(data).toFixed(2) || 0; // Chuyển đổi thành số, nếu là chuỗi thì chuyển đổi, nếu không thì trả về 0
            default:
                return data;
        }
    };
    function sumMuaMua(thang5, thang6, thang7, thang8, thang9, thang10) {
        return strToNumber(thang5) + strToNumber(thang6) + strToNumber(thang7) + strToNumber(thang8) + strToNumber(thang9) + strToNumber(thang10);
    }
    function sumMuaKho(thang11, thang12, thang1, thang2, thang3, thang4) {
        return strToNumber(thang11) + strToNumber(thang12) + strToNumber(thang1) + strToNumber(thang2) + strToNumber(thang3) + strToNumber(thang4);
    }

    function strToNumber(str) {
        if (typeof str === 'number') {
            // chuyển sang string 
            return parseFloat((str).toFixed(3)) || 0;
        }
        if (typeof str === 'string') {
            const cleanedStr = str.replace(/\./g, '').replace(',', '.');
            // chuyển sang số
            const parsedNumber = parseFloat(cleanedStr);
            return parseFloat((parsedNumber).toFixed(3)) || 0;
        }
        // Xóa dấu chấm (dấu phân cách hàng nghìn) và thay dấu phẩy (phân cách thập phân) bằng dấu chấm
    }


    function strThemSo0(str) {
        if (typeof str === 'number') {
            if (str < 10) {
                // Thêm số 0 đằng trước nếu < 10
                return '0' + parseFloat(str.toFixed(3)) || 0;
            }
            return parseFloat(str.toFixed(3)) || 0;
        }

        if (typeof str === 'string') {
            // Kiểm tra nếu chuỗi không chứa ký tự số
            if (!/^\d+([.,]\d+)?$/.test(str)) {
                // Trả về giá trị ban đầu nếu không hợp lệ
                return str;
            }

            // Xóa dấu chấm (phân cách hàng nghìn) và thay dấu phẩy (phân cách thập phân) bằng dấu chấm
            const cleanedStr = str.replace(/\./g, '').replace(',', '.');
            const parsedNumber = parseFloat(cleanedStr);

            if (parsedNumber < 10) {
                // Thêm số 0 đằng trước nếu < 10
                return '0' + parseFloat(parsedNumber.toFixed(3)) || 0;
            }
            return parseFloat(parsedNumber.toFixed(3)) || 0;
        }

        // Trả về giá trị mặc định nếu không phải số hoặc chuỗi
        return str;
    }


    // bieu 3 excel
    const bieu31Mapping = (data) => {

        try {
            const _data = trySplitToBlocks(
                handleFormat(data),
                'Số lượng nguồn nước'
            );
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists(_data, 0, 'mã sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột mã sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'tên sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột tên sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'chảy ra'),
                    message: 'Dữ liệu mục 3.1 thiếu cột chảy ra',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'chiều dài (km)'),
                    message: 'Dữ liệu mục 3.1 thiếu cột chiều dài',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        0,
                        'chiều dài thuộc tỉnh, thành phố (km)'
                    ),
                    message: 'Dữ liệu mục 3.1 thiếu cột chiều dài thuộc tỉnh thành',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí đầu sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột vị trí đầu sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí cuối sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột vị trí cuối sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'ghi chú'),
                    message: 'Dữ liệu mục 3.1 thiếu cột ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });

            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // Lấy ra các header/data của từng block dữ liệu
            const { data: results1 } = getAllHeadersByIndex(_data[0], 0, 2);

            const response1 = splitWithPattern(results1, (row) =>
                isBlockHeader({ data: row })
            );
            console.log('response1', response1);
            const output1 = [];
            // let rowHasError = false;
            // let maSongMap = new Map();

            response1?.forEach((row) => {

                // rowHasError = false; // Đặt mặc định là không có lỗi cho từng dòng

                if (row?.header?.length > 0) {
                    let maSong0 = '';
                    let luuVucSongId = '';
                    let luuVucSong = '';
                    let maSong1 = convertTextToNumber(row?.header?.[1], 'number');
                    let maSong2 = convertTextToNumber(row?.header?.[2], 'number');
                    let maSong3 = convertTextToNumber(row?.header?.[3], 'number');
                    let maSong4 = convertTextToNumber(row?.header?.[4], 'number');
                    let maSong5 = convertTextToNumber(row?.header?.[5], 'number');
                    let maSong6 = convertTextToNumber(row?.header?.[6], 'number');
                    let maSong7 = convertTextToNumber(row?.header?.[7], 'number');
                    let maSong8 = convertTextToNumber(row?.header?.[8], 'number');
                    let maSong9 = convertTextToNumber(row?.header?.[9], 'number');
                    let maSong10 = convertTextToNumber(row?.header?.[10], 'number');
                    let maSong11 = convertTextToNumber(row?.header?.[11], 'number');
                    let maSong12 = convertTextToNumber(row?.header?.[12], 'number');
                    let maSong13 = convertTextToNumber(row?.header?.[13], 'number');
                    if ((typeof maSong1 === 'number' && maSong1 !== 0) || (typeof maSong2 === 'number' && maSong2 !== 0) || (typeof maSong3 === 'number' && maSong3 !== 0) || (typeof maSong4 === 'number' && maSong4 !== 0) || (typeof maSong5 === 'number' && maSong5 !== 0) || (typeof maSong6 === 'number' && maSong6 !== 0) || (typeof maSong7 === 'number' && maSong7 !== 0) || (typeof maSong8 === 'number' && maSong8 !== 0) || (typeof maSong9 === 'number' && maSong9 !== 0) || (typeof maSong10 === 'number' && maSong10 !== 0) || (typeof maSong11 === 'number' && maSong11 !== 0) || (typeof maSong12 === 'number' && maSong12 !== 0) || (typeof maSong13 === 'number' && maSong13 !== 0)) {
                        maSong0 = `${strThemSo0(maSong1)},${strThemSo0(maSong2)},${strThemSo0(maSong3)},${strThemSo0(maSong4)},${strThemSo0(maSong5)},${strThemSo0(maSong6)},${strThemSo0(maSong7)},${strThemSo0(maSong8)},${strThemSo0(maSong9)},${strThemSo0(maSong10)},${strThemSo0(maSong11)},${strThemSo0(maSong12)},${strThemSo0(maSong13)}`;
                        luuVucSong = xoaPhuDeluuVucSong(row?.header?.[14]);
                        luuVucSongId = findLuuVucSongId(luuVucSong);
                        if (luuVucSongId === '') {
                            // rowHasError = true;
                            errorMessagesAll.push('Không tìm thấy ' + luuVucSong + ' tại mục ' + row?.header?.[0] + '.');
                        }
                        else {
                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                        }
                    } else {
                        luuVucSong = xoaPhuDeluuVucSong(row?.header?.[1]);
                        luuVucSongId = findLuuVucSongId(luuVucSong);
                        // Kiểm tra nếu không tìm thấy lưu vực sông
                        if (luuVucSongId === '') {
                            // rowHasError = true;
                            errorMessagesAll.push('Không tìm thấy ' + luuVucSong + ' tại mục ' + row?.header?.[0] + '.');
                        }
                        else {
                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                        }
                    }
                    // Nếu không có lỗi, xử lý dòng
                    // if (!rowHasError) {
                    const modelSong = row?.data?.map((i, index) => {
                        // rowHasError = false;
                        // Tạo mã sông duy nhất
                        // const maSong = `${i?.[1]},${i?.[2]},${i?.[3]},${i?.[4]},${i?.[5]},${i?.[6]},${i?.[7]},${i?.[8]},${i?.[9]},${i?.[10]},${i?.[11]},${i?.[12]},${i?.[13]}`;
                        // const maSongUnique = convertDataImport(maSong, "String");

                        // // Kiểm tra trùng mã sông
                        // if (maSongMap.has(maSongUnique)) {
                        //     const duplicateIndex = maSongMap.get(maSongUnique);
                        //     rowHasError = true;
                        //     errorMessagesAll.push(`Mã tự đánh sông bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex} ,thuộc ${luuVucSong}.`);
                        //     return null; // Không thêm dòng lỗi
                        // } else {
                        //     maSongMap.set(maSongUnique, index + 1);
                        // }
                        // Trả về dữ liệu nếu không lỗi
                        // if (!rowHasError) {
                        return {
                            stt: convertDataImport(i?.[0], "String"),
                            maSong1: strThemSo0(i?.[1]) || '',
                            maSong2: strThemSo0(i?.[2]) || '',
                            maSong3: strThemSo0(i?.[3]) || '',
                            maSong4: strThemSo0(i?.[4]) || '',
                            maSong5: strThemSo0(i?.[5]) || '',
                            maSong6: strThemSo0(i?.[6]) || '',
                            maSong7: strThemSo0(i?.[7]) || '',
                            maSong8: strThemSo0(i?.[8]) || '',
                            maSong9: strThemSo0(i?.[9]) || '',
                            maSong10: strThemSo0(i?.[10]) || '',
                            maSong11: strThemSo0(i?.[11]) || '',
                            maSong12: strThemSo0(i?.[12]) || '',
                            maSong13: strThemSo0(i?.[13]) || '',
                            ten: convertDataImport(i?.[14], "String"),
                            chayRa: convertDataImport(i?.[15], "String"),
                            chieuDai: strToNumber(i?.[16]),
                            chieuDaiThuocTinhThanh: convertDataImport(i?.[17], "String"),
                            viTriDauSong: {
                                vN2000x: convertDataImport(i?.[18], "number") || 0,
                                vN2000y: convertDataImport(i?.[19], "number") || 0,
                                xaHuyenTinh: convertDataImport(i?.[20], "String"),
                            },
                            viTriCuoiSong: {
                                vN2000x: convertDataImport(i?.[21], "number") || 0,
                                vN2000y: convertDataImport(i?.[22], "number") || 0,
                                xaHuyenTinh: convertDataImport(i?.[23], "String"),
                            },
                            ghiChu: convertDataImport(i?.[24], "String"),
                            indexOnBieuMau: i?.[25] || '',
                            isDeleted: removeVietnameseTones(i?.[26]) === 'co',
                        };
                        // }
                        // return null; // Trường hợp không cần thêm
                    })
                    // .filter(Boolean); // Loại bỏ các giá trị null

                    // Thêm vào output1 nếu không có lỗi
                    output1.push({
                        stt: convertDataImport(row?.header?.[0], "String"),
                        luuVucSong: luuVucSong,
                        luuVucSongId: luuVucSongId,
                        maSong0: maSong0,
                        modelSong: modelSong,
                    });
                }
                // }
            });
            return {
                luuVucSongs: output1,
                errorMessages: errorMessagesAll.join('\n'),
                error: false,
            };
        }
        catch (error) {
            return {
                errorMessages: 'Dữ liệu không đúng cấu trúc',
                error: true,
            }
        };
    };
    const bieu32Mapping = (data) => {
        try {

            const _data = trySplitToBlocks(
                handleFormat(data),
                'Số lượng nguồn nước'
            );
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists(_data, 0, 'tên hồ chứa'),
                    message: 'Dữ liệu mục 3.2 thiếu cột tên hồ chứa',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'nguồn nước khai thác'),
                    message: 'Dữ liệu mục 3.2 thiếu cột nguồn nước khai thác',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'thuộc hệ thống sông'),
                    message: 'Dữ liệu mục 3.2 thiếu cột thuộc hệ thống sông',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        0,
                        'diện tích mặt nước (m2)'
                    ),
                    message: 'Dữ liệu mục 3.2 thiếu cột diện tích mặt nước (m2)',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        0,
                        'dung tích toàn bộ (triệu m3)'
                    ),
                    message:
                        'Dữ liệu mục 3.2 thiếu cột dung tích toàn bộ (triệu m3)',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        0,
                        'dung tích hữu ích (triệu m3)'
                    ),
                    message:
                        'Dữ liệu mục 3.2 thiếu cột dung tích hữu ích (triệu m3)',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí hành chính'),
                    message: 'Dữ liệu mục 3.2 thiếu cột vị trí hành chính',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'mục đích sử dụng'),
                    message: 'Dữ liệu mục 3.2 thiếu cột mục đích sử dụng',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'ghi chú'),
                    message: 'Dữ liệu mục 3.2 thiếu cột ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // Lấy ra các header/data của từng block dữ liệu
            const { data: results2 } = getAllHeadersByIndex(_data[0], 0, 1);
            // let tenHoChuaViTriMap = new Map();

            const aoHoDamPhas = results2?.map((i, index) => {
                // let rowHasError = false;
                let luuVucSong = xoaPhuDeluuVucSong(i?.[3]);
                const luuVucSongId = findLuuVucSongId(luuVucSong);
                if (!luuVucSongId) {
                    errorMessagesAll.push(`Không tìm thấy lưu vực sông tại mục ${i?.[0]}`);
                    // rowHasError = true;
                }
                else {
                    luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                }

                return {
                    stt: convertDataImport(i?.[0], "String"),
                    ten: convertDataImport(i?.[1], "String"),
                    nguonNuocKhaiThac: convertDataImport(i?.[2], "String"),
                    luuVucSong: luuVucSong,
                    luuVucSongId: luuVucSongId,
                    dienTichMatNuoc: strToNumber(i?.[4]),
                    dungTichToanBo: strToNumber(i?.[5]),
                    dungTichHuuIch: strToNumber(i?.[6]),
                    viTriHanhChinh: convertDataImport(i?.[7], "String"),
                    ...autoMappingMdsd(i?.[8]?.split(",")?.map(i => i?.trim())),
                    ghiChu: convertDataImport(i?.[9], "String"),
                    indexOnBieuMau: i?.[10] || "",
                    isDeleted: removeVietnameseTones(i?.[11]) === "co",
                };
                // }
                // return null; // Bỏ qua dòng có lỗi
            });
            // .filter(Boolean);
            return {
                aoHoDamPhas: aoHoDamPhas,
                error: false,
                errorMessages: errorMessagesAll.join("\n"),
            };
        }
        catch (error) {
            return {
                errorMessages: 'Dữ liệu không đúng cấu trúc',
                error: true,
            }
        };
    };


    const bieu3Mapping = (data) => {
        try {
            const _data = trySplitToBlocks(
                handleFormat(data),
                'Số lượng nguồn nước'
            );
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists(_data, 0, 'mã sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột mã sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'tên sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột tên sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'chảy ra'),
                    message: 'Dữ liệu mục 3.1 thiếu cột chảy ra',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'chiều dài (km)'),
                    message: 'Dữ liệu mục 3.1 thiếu cột chiều dài',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        0,
                        'chiều dài thuộc tỉnh, thành phố (km)'
                    ),
                    message: 'Dữ liệu mục 3.1 thiếu cột chiều dài thuộc tỉnh thành',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí đầu sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột vị trí đầu sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí cuối sông'),
                    message: 'Dữ liệu mục 3.1 thiếu cột vị trí cuối sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'ghi chú'),
                    message: 'Dữ liệu mục 3.1 thiếu cột ghi chú',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'tên hồ chứa'),
                    message: 'Dữ liệu mục 3.2 thiếu cột tên hồ chứa',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'nguồn nước khai thác'),
                    message: 'Dữ liệu mục 3.2 thiếu cột nguồn nước khai thác',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'thuộc hệ thống sông'),
                    message: 'Dữ liệu mục 3.2 thiếu cột thuộc hệ thống sông',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        1,
                        'diện tích mặt nước'
                    ),
                    message: 'Dữ liệu mục 3.2 thiếu cột diện tích mặt nước (m2)',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        1,
                        'dung tích toàn bộ (triệu m3)'
                    ),
                    message:
                        'Dữ liệu mục 3.2 thiếu cột dung tích toàn bộ (triệu m3)',
                },
                {
                    condition: !checkColumnExists(
                        _data,
                        1,
                        'dung tích hữu ích (triệu m3)'
                    ),
                    message:
                        'Dữ liệu mục 3.2 thiếu cột dung tích hữu ích (triệu m3)',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'vị trí hành chính'),
                    message: 'Dữ liệu mục 3.2 thiếu cột vị trí hành chính',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'mục đích sử dụng'),
                    message: 'Dữ liệu mục 3.2 thiếu cột mục đích sử dụng',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'ghi chú'),
                    message: 'Dữ liệu mục 3.2 thiếu cột ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });

            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // Lấy ra các header/data của từng block dữ liệu
            const { data: results1 } = getAllHeadersByIndex(_data[0], 0, 2);
            const { data: results2 } = getAllHeadersByIndex(_data[1], 0, 1);

            const response1 = splitWithPattern(results1, (row) =>
                isBlockHeader({ data: row })
            );
            const output1 = [];
            // let maSongMap = new Map();
            // let tenHoChuaViTriMap = new Map();


            response1?.forEach((row) => {
                // let rowHasError1 = false;
                if (row?.header?.length > 0) {
                    let maSong0 = '';
                    let luuVucSongId = '';
                    let luuVucSong = '';
                    let maSong1 = convertTextToNumber(row?.header?.[1], 'number');
                    let maSong2 = convertTextToNumber(row?.header?.[2], 'number');
                    let maSong3 = convertTextToNumber(row?.header?.[3], 'number');
                    let maSong4 = convertTextToNumber(row?.header?.[4], 'number');
                    let maSong5 = convertTextToNumber(row?.header?.[5], 'number');
                    let maSong6 = convertTextToNumber(row?.header?.[6], 'number');
                    let maSong7 = convertTextToNumber(row?.header?.[7], 'number');
                    let maSong8 = convertTextToNumber(row?.header?.[8], 'number');
                    let maSong9 = convertTextToNumber(row?.header?.[9], 'number');
                    let maSong10 = convertTextToNumber(row?.header?.[10], 'number');
                    let maSong11 = convertTextToNumber(row?.header?.[11], 'number');
                    let maSong12 = convertTextToNumber(row?.header?.[12], 'number');
                    let maSong13 = convertTextToNumber(row?.header?.[13], 'number');
                    if ((typeof maSong1 === 'number' && maSong1 !== 0) || (typeof maSong2 === 'number' && maSong2 !== 0) || (typeof maSong3 === 'number' && maSong3 !== 0) || (typeof maSong4 === 'number' && maSong4 !== 0) || (typeof maSong5 === 'number' && maSong5 !== 0) || (typeof maSong6 === 'number' && maSong6 !== 0) || (typeof maSong7 === 'number' && maSong7 !== 0) || (typeof maSong8 === 'number' && maSong8 !== 0) || (typeof maSong9 === 'number' && maSong9 !== 0) || (typeof maSong10 === 'number' && maSong10 !== 0) || (typeof maSong11 === 'number' && maSong11 !== 0) || (typeof maSong12 === 'number' && maSong12 !== 0) || (typeof maSong13 === 'number' && maSong13 !== 0)) {
                        maSong0 = `${strThemSo0(maSong1)},${strThemSo0(maSong2)},${strThemSo0(maSong3)},${strThemSo0(maSong4)},${strThemSo0(maSong5)},${strThemSo0(maSong6)},${strThemSo0(maSong7)},${strThemSo0(maSong8)},${strThemSo0(maSong9)},${strThemSo0(maSong10)},${strThemSo0(maSong11)},${strThemSo0(maSong12)},${strThemSo0(maSong13)}`;
                        luuVucSong = xoaPhuDeluuVucSong(row?.header?.[14]);
                        luuVucSongId = findLuuVucSongId(luuVucSong);
                        if (luuVucSongId === '') {
                            // rowHasError = true;
                            errorMessagesAll.push('Không tìm thấy ' + luuVucSong + ' tại mục ' + row?.header?.[0] + '.');
                        }
                        else {
                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                        }
                    } else {
                        luuVucSong = xoaPhuDeluuVucSong(row?.header?.[1]);
                        luuVucSongId = findLuuVucSongId(luuVucSong);
                        // Kiểm tra nếu không tìm thấy lưu vực sông
                        if (luuVucSongId === '') {
                            // rowHasError = true;
                            errorMessagesAll.push('Không tìm thấy ' + luuVucSong + ' tại mục ' + row?.header?.[0] + '.');
                        }
                        else {
                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                        }
                    }
                    // Nếu không có lỗi, xử lý dòng
                    // if (!rowHasError1) {
                    const modelSong = row?.data?.map((i, index) => {
                        // rowHasError1 = false;
                        // // Tạo mã sông duy nhất
                        // const maSong = `${i?.[1]},${i?.[2]},${i?.[3]},${i?.[4]},${i?.[5]},${i?.[6]},${i?.[7]},${i?.[8]},${i?.[9]},${i?.[10]},${i?.[11]},${i?.[12]},${i?.[13]}`;
                        // const maSongUnique = convertDataImport(maSong, "String");

                        // // Kiểm tra trùng mã sông
                        // if (maSongMap.has(maSongUnique)) {
                        //     const duplicateIndex = maSongMap.get(maSongUnique);
                        //     rowHasError1 = true;
                        //     errorMessagesAll.push(`Mã tự đánh sông bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex} ,thuộc ${luuVucSong}.`);
                        //     return null;
                        // } else {
                        //     maSongMap.set(maSongUnique, index + 1);
                        // }
                        // // Trả về dữ liệu nếu không lỗi
                        // if (!rowHasError1) {
                        return {
                            stt: convertDataImport(i?.[0], "String"),
                            maSong1: strThemSo0(i?.[1]) || '',
                            maSong2: strThemSo0(i?.[2]) || '',
                            maSong3: strThemSo0(i?.[3]) || '',
                            maSong4: strThemSo0(i?.[4]) || '',
                            maSong5: strThemSo0(i?.[5]) || '',
                            maSong6: strThemSo0(i?.[6]) || '',
                            maSong7: strThemSo0(i?.[7]) || '',
                            maSong8: strThemSo0(i?.[8]) || '',
                            maSong9: strThemSo0(i?.[9]) || '',
                            maSong10: strThemSo0(i?.[10]) || '',
                            maSong11: strThemSo0(i?.[11]) || '',
                            maSong12: strThemSo0(i?.[12]) || '',
                            maSong13: strThemSo0(i?.[13]) || '',
                            ten: convertDataImport(i?.[14], "String"),
                            chayRa: convertDataImport(i?.[15], "String"),
                            chieuDai: strToNumber(i?.[16]),
                            chieuDaiThuocTinhThanh: convertDataImport(i?.[17], "String"),
                            viTriDauSong: {
                                vN2000x: convertDataImport(i?.[18], "number") || 0,
                                vN2000y: convertDataImport(i?.[19], "number") || 0,
                                xaHuyenTinh: convertDataImport(i?.[20], "String"),
                            },
                            viTriCuoiSong: {
                                vN2000x: convertDataImport(i?.[21], "number") || 0,
                                vN2000y: convertDataImport(i?.[22], "number") || 0,
                                xaHuyenTinh: convertDataImport(i?.[23], "String"),
                            },
                            ghiChu: convertDataImport(i?.[24], "String"),
                            indexOnBieuMau: i?.[25] || '',
                            isDeleted: removeVietnameseTones(i?.[26]) === 'co',
                        };
                        // }
                        // return null; // Trường hợp không cần thêm
                    });
                    // .filter(Boolean); // Loại bỏ các giá trị null
                    output1.push({
                        stt: convertDataImport(row?.header?.[0], "String"),
                        luuVucSong: luuVucSong,
                        luuVucSongId: luuVucSongId,
                        modelSong: modelSong,
                    });
                }
                // }
            });
            const aoHoDamPhas = results2?.map((i, index) => {
                // let rowHasError = false;
                let luuVucSong = xoaPhuDeluuVucSong(i?.[3]);
                const luuVucSongId = findLuuVucSongId(luuVucSong);
                if (!luuVucSongId) {
                    errorMessagesAll.push(`Không tìm thấy lưu vực sông tại mục ${i?.[0]}`);
                    // rowHasError = true;
                }
                else {
                    luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                }
                // const checkTrungKey = `${i?.[1]},${i?.[7]}`;
                // const tenHoChuaUnique = convertDataImport(checkTrungKey, "String");
                // if (
                //     tenHoChuaViTriMap.has(tenHoChuaUnique)
                // ) {
                //     const duplicateIndex = tenHoChuaViTriMap.get(tenHoChuaUnique);
                //     errorMessagesAll.push(
                //         `Tên hồ chứa và Vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}, thuộc ${luuVucSong} bảng 3.2.`
                //     );
                //     rowHasError = true;
                // }
                // if (!rowHasError) {
                // tenHoChuaViTriMap.set(tenHoChuaUnique, index + 1);
                return {
                    stt: convertDataImport(i?.[0], "String"),
                    ten: convertDataImport(i?.[1], "String"),
                    nguonNuocKhaiThac: convertDataImport(i?.[2], "String"),
                    luuVucSong: luuVucSong,
                    luuVucSongId: luuVucSongId,
                    dienTichMatNuoc: strToNumber(i?.[4]),
                    dungTichToanBo: strToNumber(i?.[5]),
                    dungTichHuuIch: strToNumber(i?.[6]),
                    viTriHanhChinh: convertDataImport(i?.[7], "String"),
                    ...autoMappingMdsd(i?.[8]?.split(",")?.map(i => i?.trim())),
                    // mucDichSuDungIds: i?.[8]?.split(",")?.map(i => findMucDichSuDung(i?.trim())),
                    ghiChu: convertDataImport(i?.[9], "String"),
                    indexOnBieuMau: i?.[10] || "",
                    isDeleted: removeVietnameseTones(i?.[11]) === "co",
                };
                // }
                // return null; // Bỏ qua dòng có lỗi
            });
            // .filter(Boolean);
            return {
                luuVucSongs: output1,
                aoHoDamPhas: aoHoDamPhas,
                errorMessages: errorMessagesAll.join('\n'),
                error: false,
            }

        }

        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // bieu 4 excel
    const bieu4Mapping = (data) => {
        try {
            const { data: results1 } = getAllHeadersByIndex(
                handleFormat(data),
                0,
                2
            );
            ;
            const _data = handleFormat(data);
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tên tầng chứa nước'
                    ),
                    message: 'Dữ liệu thiếu cột tên tầng chứa nước',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Diện tích phân bố (km2)'
                    ),
                    message: 'Dữ liệu thiếu cột Diện tích phân bố (km2)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Chiều sâu phân bố (m)'
                    ),
                    message: 'Dữ liệu thiếu cột chiều sâu phân bố (m)',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Ghi chú'),
                    message: 'Dữ liệu thiếu cột ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            // Nếu có lỗi, trả về thông báo lỗi và dừng hàm
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            const response1 = splitWithPattern(results1, (row) =>
                isBlockHeader({ data: row })
            );
            // lấy ra list tỉnh
            const output1 = {
                caNuoc: {},
                tinhHoacLuuVucSongs: [],
                tinhs: [],
                luuVucSongs: [],
            };
            // let rowHasError = false;
            if (response1 && response1.length > 0) {
                response1?.forEach((row) => {
                    if (row?.header?.[0] === 'I') {
                        // let tangChuaNuocCNMap = new Map();
                        const tangChuaNuocs = row?.data?.map((i, index) => {
                            // rowHasError = false;
                            // const checkTrungKey = `${i?.[1]}`;
                            // const tenTangChuaNuocUnique = convertDataImport(checkTrungKey, "String");
                            // if (tangChuaNuocCNMap.has(tenTangChuaNuocUnique)) {
                            //     const duplicateIndex = tangChuaNuocCNMap.get(tenTangChuaNuocUnique);
                            //     errorMessagesAll.push(`Tên tầng chứa nước bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}.`);
                            //     rowHasError = true;
                            // }
                            // else {
                            //     tangChuaNuocCNMap.set(tenTangChuaNuocUnique, index + 1);
                            // }
                            // if (!rowHasError) {
                            return {
                                stt: convertDataImport(i?.[0], "String"),
                                tangChuaNuoc: i?.[1],
                                dienTichPhanBo: strToNumber(i?.[2]),
                                chieuSauPhanBoTu: strToNumber(i?.[3]),
                                chieuSauPhanBoDen: strToNumber(i?.[4]),
                                ghiChu: i?.[5],
                                indexOnBieuMau: i?.[6] || '',
                                isDeleted: removeVietnameseTones(i?.[7]) === ('co') ? true : false,
                            }
                            // }
                            // return null;
                        });
                        // .filter(Boolean);
                        output1.caNuoc = {
                            tangChuaNuocs: tangChuaNuocs || [],
                        }
                    }
                    else {
                        // let tangChuaNuocTinhLVSMap = new Map();
                        // rowHasError = false;
                        let temp = {};
                        temp.stt = convertDataImport(row?.header?.[0], "String");

                        const tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(row?.header?.[1], "String"));
                        const luuVucSongsList = luuVucSongs.find((item) => item.tenMuc === row?.header?.[1]);

                        if (tinhThanhsList) {
                            temp.tinh = tinhThanhsList.tenRutGon;
                            temp.tinhId = tinhThanhsList?.maTinh || '';
                        } else if (luuVucSongsList) {
                            temp.luuVucSong = row?.header?.[1];
                            temp.luuVucSongId = findLuuVucSongId(temp.luuVucSong);
                            temp.luuVucSong = luuVucSongs.find(i => i.maMuc === temp.luuVucSongId)?.tenMuc;
                        } else {
                            // rowHasError = true;
                            errorMessagesAll.push(`Không tìm thấy tỉnh thành hoặc lưu vực sông tại mục ${temp.stt}`);
                        }

                        const _tangChuaNuoc = row?.data?.map((i, index) => {
                            // const checkTrungKey = convertDataImport(i?.[1], "String");
                            // if (!checkTrungKey) {
                            //     errorMessagesAll.push(`Tên tầng chứa nước không hợp lệ tại dòng ${index + 1}`);
                            //     // rowHasError = true;
                            //     return null;
                            // }
                            // if (tangChuaNuocTinhLVSMap.has(checkTrungKey)) {
                            //     const duplicateIndex = tangChuaNuocTinhLVSMap.get(checkTrungKey);
                            //     errorMessagesAll.push(`Tên tầng chứa nước bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}.`);
                            //     // rowHasError = true;
                            //     return null;
                            // }
                            // tangChuaNuocTinhLVSMap.set(checkTrungKey, index + 1);

                            return {
                                stt: convertDataImport(i?.[0], 'String'),
                                tangChuaNuoc: convertDataImport(i?.[1], 'String'),
                                dienTichPhanBo: strToNumber(i?.[2]),
                                chieuSauPhanBoTu: strToNumber(i?.[3]),
                                chieuSauPhanBoDen: strToNumber(i?.[4]),
                                ghiChu: convertDataImport(i?.[5], 'String'),
                                indexOnBieuMau: i?.[6] || '',
                                isDeleted: removeVietnameseTones(i?.[7]) === 'co',
                            };
                        });
                        // .filter(Boolean);

                        // if (!rowHasError) {
                        if (temp.tinh) {
                            output1.tinhs.push({ ...temp, tangChuaNuocs: _tangChuaNuoc || [] });
                        } else {
                            output1.luuVucSongs.push({ ...temp, tangChuaNuocs: _tangChuaNuoc || [] });
                        }
                        // }
                    }

                });
            }
            return {
                ...output1,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    function findViTriHanhChinh(xa, huyen, tinh, stt, tinhThanhListss) {
        let errorMessage = [];
        if (!tinhThanhListss) {
            let tinhThanhsList = null;
            if (scope === 'tinh' && tinhThanh) {
                tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(tinhThanh, "String"));
            }
            else {
                tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(tinh, "String"));
            }
            let quanHuyenList = [];
            let phuongXaList = [];

            if (tinhThanhsList) {
                quanHuyenList = findQuanHuyen(tinhThanhsList, convertDataImport(huyen, "String"));
                phuongXaList = findPhuongXa(quanHuyenList, convertDataImport(xa, "String"));
            }
            const tinhThanhData = tinhThanhsList?.tenRutGon || tinh || null;
            const tinhThanhId = tinhThanhsList?.ma || null;
            const quanHuyen = quanHuyenList?.[0]?.tenRutGon || huyen || null;
            const quanHuyenId = quanHuyenList?.[0]?.ma || null;
            const phuongXa = phuongXaList?.tenRutGon || xa || null;
            const phuongXaId = phuongXaList?.ma || null;
            if (tinhThanhId === null) {
                errorMessage.push(`Không tìm thấy tên tỉnh thành tại ${tinh} mục ${stt}`);
            }
            if (quanHuyenId === null) {
                errorMessage.push(`Không tìm thấy tên quận huyện tại ${huyen} mục ${stt}`);
            }
            if (phuongXaId === null) {
                errorMessage.push(`Không tìm thấy tên xã phường tại ${xa} mục ${stt}`);
            }
            const dataViTri = {
                tinhThanh: tinhThanhData,
                tinhThanhId: tinhThanhId,
                quanHuyen: quanHuyen,
                quanHuyenId: quanHuyenId,
                phuongXa: phuongXa,
                phuongXaId: phuongXaId,
            };
            return {
                dataViTri: dataViTri,
                errorMessage: errorMessage.join('\n'),
            };
        }
        else {
            let quanHuyenList = [];
            let phuongXaList = [];
            if (tinhThanhListss) {
                quanHuyenList = findQuanHuyen(tinhThanhListss, convertDataImport(huyen, "String"));
                phuongXaList = findPhuongXa(quanHuyenList, convertDataImport(xa, "String"));
            }
            const tinhThanhData = tinhThanhListss?.tenRutGon || tinh || null;
            const tinhThanhId = tinhThanhListss?.ma || null;
            const quanHuyen = quanHuyenList?.[0]?.tenRutGon || huyen || null;
            const quanHuyenId = quanHuyenList?.[0]?.ma || null;
            const phuongXa = phuongXaList?.tenRutGon || xa || null;
            const phuongXaId = phuongXaList?.ma || null;
            if (tinhThanhId === null) {
                errorMessage.push(`Không tìm thấy tên tỉnh thành tại ${tinh} mục ${stt}`);
            }
            if (quanHuyenId === null) {
                errorMessage.push(`Không tìm thấy tên quận huyện tại ${huyen} mục ${stt}`);
            }
            if (phuongXaId === null) {
                errorMessage.push(`Không tìm thấy tên xã phường tại ${xa} mục ${stt}`);
            }
            const dataViTri = {
                tinhThanh: tinhThanhData,
                tinhThanhId: tinhThanhId,
                quanHuyen: quanHuyen,
                quanHuyenId: quanHuyenId,
                phuongXa: phuongXa,
                phuongXaId: phuongXaId,
            };
            return {
                dataViTri: dataViTri,
                errorMessage: errorMessage.join('\n'),
            };
        }
    }
    function luongMua1Nam(thang1, thang2, thang3, thang4, thang5, thang6, thang7, thang8, thang9, thang10, thang11, thang12) {
        const dataMua = {
            thang1: strToNumber(thang1),
            thang2: strToNumber(thang2),
            thang3: strToNumber(thang3),
            thang4: strToNumber(thang4),
            thang5: strToNumber(thang5),
            thang6: strToNumber(thang6),
            thang7: strToNumber(thang7),
            thang8: strToNumber(thang8),
            thang9: strToNumber(thang9),
            thang10: strToNumber(thang10),
            thang11: strToNumber(thang11),
            thang12: strToNumber(thang12),
        }
        return dataMua;
    }

    // bieu 5 excel
    const bieu5Mapping = (data) => {
        try {

            const _data = trySplitToBlocks(
                data,
                'Tổng lượng dòng chảy'
            );
            console.log('_data', _data);
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc ',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                // {
                //     condition: !checkColumnExists(_data, 0, 'lưu vực sông'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột lưu vực sông',
                // },
                // {
                //     condition: !checkColumnExists(_data, 0, 'vị trí tính toán'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột vị trí tính toán',
                // },
                // {
                //     condition: !checkColumnExists(_data, 0, 'tháng'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột tháng',
                // },
                // {
                //     condition: !checkColumnExists(_data, 0, 'mùa mưa'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột mùa mưa',
                // },
                // {
                //     condition: !checkColumnExists(_data, 0, 'mùa khô'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột mùa khô',
                // },
                // {
                //     condition: !checkColumnExists(_data, 0, 'cả năm'),
                //     message: 'Dữ liệu mục 5.1 thiếu cột cả năm',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'các trạm'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột các trạm',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'vị trí tính toán'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột vị trí tính toán',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'tháng'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột tháng',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'mùa mưa'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột mùa mưa',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'mùa khô'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột mùa khô',
                // },
                // {
                //     condition: !checkColumnExists(_data, 1, 'cả năm'),
                //     message: 'Dữ liệu mục 5.2 thiếu cột cả năm',
                // },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }

            // console.log('_data', _data);
            // Lấy ra các header/data của từng block dữ liệu
            const { data: results1 } = getAllHeadersByIndex(_data[0], 0, 2);
            const { data: results2 } = getAllHeadersByIndex(_data[1], 0, 2);

            const response1 = splitWithPattern(results1, (row) =>
                isBlockHeader({ data: row })
            );
            const response2 = splitWithPattern(results2, (row) =>
                isStringNumber(row?.[0])
            );
            const output = {
                luuVucSongLienTinhs: [],
                luuVucSongNoiTinhs: [],
                luuVucSongs: [],
            };
            // let rowHasError = false;
            response1?.forEach((row) => {
                if (scope == 'tinh' && row?.header?.[1] === 'Cả nước') {
                    return;
                }
                if (scope == 'tinh' && row?.header?.[1] !== 'Lưu vực sông nội tỉnh' || row?.header?.[1] !== 'Lưu vực sông nội tỉnh') {
                    errorMessagesAll.push('Dữ liệu không đúng cấu trúc tại bảng 5.1 thiếu dòng Lưu vực sông nội tỉnh');
                    // rowHasError = true;
                    // return;
                }
                if (scope !== 'tinh' && row?.header?.[1] !== 'Lưu vực sông liên tỉnh') {
                    errorMessagesAll.push('Dữ liệu không đúng cấu trúc tại bảng 5.1 thiếu dòng Lưu vực sông liên tỉnh');
                    // rowHasError = true;
                    // return;
                }
                // if (!rowHasError) {
                if (row?.header?.[1] === 'Lưu vực sông liên tỉnh') {
                    if (scope === 'tinh') {
                        errorMessagesAll.push('Tài khoản không có quyền nhập dữ liệu lưu vực sông liên tỉnh');
                        // return;
                    }
                    // const luuVucSongLienTinhsMap = new Map();
                    const data = row?.data?.map((i, index) => {
                        let luuVucSong = i?.[1];
                        const luuVucSongId = findLuuVucSongId(luuVucSong) || '';
                        if (!luuVucSongId) {
                            errorMessagesAll.push(`Không tìm thấy mã lưu vực sông tại ${luuVucSong} tại mục ${index + 1}`);
                            // return null;
                        }
                        else {
                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                        }
                        const dataViTriHanhChinh = findViTriHanhChinh(i?.[2], i?.[3], i?.[4], index + 1);
                        if (dataViTriHanhChinh.errorMessage) {
                            errorMessagesAll.push(dataViTriHanhChinh.errorMessage);
                            // return null;
                        }
                        // const checkTrungKey = `${luuVucSongId},${dataViTriHanhChinh.dataViTri.phuongXaId},${dataViTriHanhChinh.dataViTri.quanHuyenId},${dataViTriHanhChinh.dataViTri.tinhThanhId}`;
                        // if (luuVucSongLienTinhsMap.has(checkTrungKey)) {
                        //     const duplicateIndex = luuVucSongLienTinhsMap.get(checkTrungKey);
                        //     errorMessagesAll.push(`Tên Lưu vực sông liên tỉnh và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex} tại ${luuVucSong} `);
                        //     return null;
                        // }
                        // // Đánh dấu đã xử lý key
                        // luuVucSongLienTinhsMap.set(checkTrungKey, index + 1);
                        // Tính toán mua mưa và mùa khô
                        const dataThang = luongMua1Nam(i?.[5], i?.[6], i?.[7], i?.[8], i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14], i?.[15], i?.[16]);
                        //mua Mua tháng 5-10 mùa khô tháng 11-4
                        const muaMua = sumMuaMua(i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14]);
                        const muaKho = sumMuaKho(i?.[15], i?.[16], i?.[5], i?.[6], i?.[7], i?.[8]);
                        const caNam = muaMua + muaKho;
                        return {
                            stt: convertDataImport(i?.[0], "String"),
                            luuVucSong,
                            luuVucSongId,
                            ...dataViTriHanhChinh.dataViTri,
                            ...dataThang,
                            muaMua: i?.[17] ? i?.[17] : muaMua,// nếu có dữ liêu thì dùng i?.[17] || 0
                            muaKho: i?.[18] ? i?.[18] : muaKho,
                            caNam: i?.[19] ? i?.[19] : caNam,
                            indexOnBieuMau: i?.[20] || '',
                            isDeleted: removeVietnameseTones(i?.[21]) === 'co' ? true : false,
                        };
                    });
                    // .filter(Boolean); // Loại bỏ các giá trị null
                    // Gán vào output
                    output.luuVucSongLienTinhs = data || [];
                }
                else {
                    if (row?.header?.[1] === 'Lưu vực sông nội tỉnh') {
                        // const luuVucSongLienTinhsMap = new Map();
                        const data = row?.data?.map((i, index) => {
                            let luuVucSong = i?.[1];
                            const luuVucSongId = findLuuVucSongId(luuVucSong) || '';
                            if (!luuVucSongId) {
                                errorMessagesAll.push(`Không tìm thấy mã lưu vực sông tại ${luuVucSong} tại mục ${index + 1}`);
                                // return null;
                            }
                            else {
                                luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                            }
                            const dataViTriHanhChinh = findViTriHanhChinh(i?.[2], i?.[3], i?.[4], index + 1);
                            if (dataViTriHanhChinh.errorMessage) {
                                errorMessagesAll.push(dataViTriHanhChinh.errorMessage);
                                // return null;
                            }
                            // const checkTrungKey = `${luuVucSongId},${dataViTriHanhChinh.dataViTri.phuongXaId},${dataViTriHanhChinh.dataViTri.quanHuyenId},${dataViTriHanhChinh.dataViTri.tinhThanhId}`;
                            // if (luuVucSongLienTinhsMap.has(checkTrungKey)) {
                            //     const duplicateIndex = luuVucSongLienTinhsMap.get(checkTrungKey);
                            //     errorMessagesAll.push(`Tên Lưu vực sông liên tỉnh và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}. tại ${luuVucSong} `);
                            //     return null;
                            // }
                            // // Đánh dấu đã xử lý key
                            // luuVucSongLienTinhsMap.set(checkTrungKey, index + 1);
                            // Tính toán mua mưa và mùa khô
                            const dataThang = luongMua1Nam(i?.[5], i?.[6], i?.[7], i?.[8], i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14], i?.[15], i?.[16]);
                            //mua Mua tháng 5-10 mùa khô tháng 11-4
                            const muaMua = sumMuaMua(i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14]);
                            const muaKho = sumMuaKho(i?.[15], i?.[16], i?.[5], i?.[6], i?.[7], i?.[8]);
                            const caNam = muaMua + muaKho;
                            return {
                                stt: convertDataImport(i?.[0], "String"),
                                luuVucSong,
                                luuVucSongId,
                                ...dataViTriHanhChinh.dataViTri,
                                ...dataThang,
                                muaMua: i?.[17] ? i?.[17] : muaMua,// nếu có dữ liêu thì dùng i?.[17] || 0
                                muaKho: i?.[18] ? i?.[18] : muaKho,
                                caNam: i?.[19] ? i?.[19] : caNam,
                                indexOnBieuMau: i?.[20] || '',
                                isDeleted: removeVietnameseTones(i?.[21]) === 'co' ? true : false,
                            };
                        });
                        // .filter(Boolean); // Loại bỏ các giá trị null
                        // Gán vào output
                        output.luuVucSongNoiTinhs = data || [];
                    }
                }
                // }
            });
            if (response2?.length > 0) {
                response2?.forEach((row) => {
                    if (!isStringNumber(row?.header?.[0])) return;
                    // const tramMap = new Map();
                    const temp = {
                        stt: convertDataImport(row?.header?.[0]),
                        luuVucSong: row?.header?.[1],
                        luuVucSongId: findLuuVucSongId(row?.header?.[1]) || '',
                    };
                    if (!temp.luuVucSongId) {
                        errorMessagesAll.push(`Không tìm thấy lưu vực sông tại ${temp.luuVucSong} tại mục ${temp.stt}`);
                        // return;
                    }
                    else {
                        temp.luuVucSong = luuVucSongs.find(i => i.maMuc === temp.luuVucSongId)?.tenMuc;
                    }
                    temp.trams = row?.data
                        ?.map((i, index) => {
                            const tram = convertDataImport(i?.[1], "String");
                            // Xử lý vị trí hành chính
                            const dataViTriHanhChinh = findViTriHanhChinh(i?.[2], i?.[3], i?.[4], index);
                            if (dataViTriHanhChinh.errorMessage) {
                                errorMessagesAll.push(dataViTriHanhChinh.errorMessage);
                                // return null;
                            }
                            // Kiểm tra trùng key
                            // const checkTrungKey = `${tram},${temp.luuVucSongId},${dataViTriHanhChinh.dataViTri.phuongXaId},${dataViTriHanhChinh.dataViTri.quanHuyenId},${dataViTriHanhChinh.dataViTri.tinhThanhId}`;
                            // if (tramMap.has(checkTrungKey)) {
                            //     const duplicateIndex = tramMap.get(checkTrungKey);
                            //     errorMessagesAll.push(`Tên trạm và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}.tại ${temp.luuVucSong} mục ${temp.stt}`);
                            //     return null;
                            // }
                            // // Đánh dấu key đã xử lý
                            // tramMap.set(checkTrungKey, index + 1);

                            // Tính toán
                            const dataThang = luongMua1Nam(i?.[5], i?.[6], i?.[7], i?.[8], i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14], i?.[15], i?.[16]);
                            const muaMua = sumMuaMua(i?.[9], i?.[10], i?.[11], i?.[12], i?.[13], i?.[14]);
                            const muaKho = sumMuaKho(i?.[15], i?.[16], i?.[5], i?.[6], i?.[7], i?.[8]);
                            const caNam = muaMua + muaKho;

                            // Trả về đối tượng trạm
                            return {
                                tram,
                                ...dataViTriHanhChinh.dataViTri,
                                ...dataThang,
                                muaMua: i?.[17] ? i?.[17] : muaMua,// nếu có dữ liêu thì dùng i?.[17] || 0
                                muaKho: i?.[18] ? i?.[18] : muaKho,
                                caNam: i?.[19] ? i?.[19] : caNam,
                                indexOnBieuMau: i?.[20] || '',
                                isDeleted: removeVietnameseTones(i?.[21]) === 'co',
                            };
                        });
                    // .filter(Boolean); // Loại bỏ các giá trị null

                    output.luuVucSongs.push(temp);
                });
            }
            return {
                ...output,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }

    };

    // bieu 6 excel
    const bieu6Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: results } = getAllHeadersByIndex(_data, 0, 2);
            const errorMessagesAll = [];

            const response = splitWithPattern(results, (row) => isBlockHeaderTinh({ data: row }));
            if (response.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'tên tỉnh'),
                    message: 'Dữ liệu thiếu cột tên tỉnh',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'vị trí tính toán'
                    ),
                    message: 'Dữ liệu thiếu cột vị trí tính toán',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'tháng'),
                    message: 'Dữ liệu thiếu cột tháng',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'mùa mưa'),
                    message: 'Dữ liệu thiếu cột mùa mưa',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'mùa khô'),
                    message: 'Dữ liệu thiếu cột mùa khô',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'cả năm'),
                    message: 'Dữ liệu thiếu cột cả năm',
                },
            ];


            const output = [];
            if (response.length > 0) {
                response?.forEach((row) => {
                    let tinhThanhsList = null;
                    if (scope === 'tinh' && tinhThanh) {
                        tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(tinhThanh, 'String'));
                    } else {
                        tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(row?.header?.[1], 'String'));
                    }
                    const tinh = tinhThanhsList?.tenRutGon;
                    const tinhId = tinhThanhsList?.ma || null;
                    if (tinhId === null) {
                        errorMessagesAll.push('Không tìm thấy mã tỉnh thành tại mục ' + row?.header?.[0]);
                        // return null;
                    }
                    const temp = {
                        stt: convertDataImport(row?.header?.[0], 'String'),
                        tinh,
                        tinhId,
                        luuVucSongLienTinhs: [],
                        luuVucSongNoiTinhs: [],
                    };
                    const array = splitArray(row?.data, ['Lưu vực']);

                    array?.forEach((arrow) => {
                        if (scope == 'tinh' && arrow?.header?.[1] !== 'Lưu vực sông nội tỉnh') {
                            errorMessagesAll.push('Dữ liệu không đúng cấu trúc thiếu dòng Lưu vực sông nội tỉnh');
                            // rowHasError = true;
                            // return;
                        } if (scope !== 'tinh' && arrow?.header?.[1] !== 'Lưu vực sông liên tỉnh') {
                            errorMessagesAll.push('Dữ liệu không đúng cấu trúc thiếu dòng Lưu vực sông liên tỉnh');
                            // rowHasError = true;
                            // return;
                        }
                        if (scope !== "tinh") {
                            if (arrow?.header?.[1] === "Lưu vực sông liên tỉnh") {
                                // const viTriMap = new Map();
                                arrow.data?.forEach((row, index) => {
                                    const stt = convertDataImport(row?.[0], "String");

                                    if (stt !== "-") {
                                        let luuVucSong = convertDataImport(row?.[1], "String");
                                        const luuVucSongId = findLuuVucSongId(luuVucSong) || "";
                                        if (!luuVucSongId) {
                                            errorMessagesAll.push(`Không tìm thấy ${luuVucSong} mục ${stt}`);
                                            // return null;
                                        }
                                        else {
                                            luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                                        }
                                        temp.luuVucSongLienTinhs.push({
                                            stt: stt,
                                            luuVucSong: luuVucSong,
                                            luuVucSongId: luuVucSongId,
                                            viTris: [],
                                        });
                                    } else {
                                        const viTri = convertDataImport(row?.[1], "String");
                                        const viTriData = findViTriHanhChinh(row?.[2], row?.[3], row?.[4], stt, tinhThanhsList);
                                        if (viTriData.errorMessage) {
                                            errorMessagesAll.push(viTriData.errorMessage);
                                            // return; // Bỏ qua dòng này nếu có lỗi vị trí hành chính
                                        }
                                        // const checkTrungKey = `${viTri},${temp.luuVucSongId},${viTriData.dataViTri.phuongXaId},${viTriData.dataViTri.quanHuyenId},${viTriData.dataViTri.tinhThanhId}`;
                                        // if (viTriMap.has(checkTrungKey)) {
                                        //     const duplicateIndex = viTriMap.get(checkTrungKey);
                                        //     errorMessagesAll.push(
                                        //         `Tên vị trí và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex} tại ${temp.luuVucSong} mục ${temp.stt}`
                                        //     );
                                        //     // return; // Bỏ qua dòng nếu phát hiện trùng lặp
                                        // }
                                        // // Đánh dấu key đã xử lý
                                        // viTriMap.set(checkTrungKey, index + 1);
                                        const dataThang = luongMua1Nam(row?.[4] || 0, row?.[5] || 0, row?.[6] || 0, row?.[7] || 0, row?.[8] || 0, row?.[9] || 0, row?.[10] || 0, row?.[11] || 0, row?.[12] || 0, row?.[13] || 0, row?.[14] || 0, row?.[15] || 0);
                                        const muaMua = sumMuaMua(row?.[8], row?.[9], row?.[10], row?.[11], row?.[12], row?.[13]);
                                        const muaKho = sumMuaKho(row?.[14], row?.[15], row?.[4], row?.[5], row?.[6], row?.[7]);
                                        const caNam = muaMua + muaKho;

                                        const _tempViTri = {
                                            stt: stt,
                                            viTri: viTri || "",
                                            ...viTriData.dataViTri,
                                            ...dataThang,
                                            muaMua: row?.[16] ? row?.[17] : muaMua,// nếu có dữ liêu thì dùng i?.[17] || 0
                                            muaKho: row?.[18] ? row?.[17] : muaKho,
                                            caNam: row?.[19] ? row?.[18] : caNam,
                                            indexOnBieuMau: row?.[19] || "",
                                            isDeleted: removeVietnameseTones(row?.[20]) === "co" ? true : false,
                                        };
                                        // Chỉ thêm vào viTris của lưu vực cuối cùng
                                        const lastLuuVuc = temp.luuVucSongLienTinhs[temp.luuVucSongLienTinhs.length - 1];
                                        if (lastLuuVuc) {
                                            lastLuuVuc.viTris = lastLuuVuc.viTris || [];
                                            lastLuuVuc.viTris.push(_tempViTri);
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            if (arrow?.header?.[1] === 'Lưu vực sông liên tỉnh') {
                                errorMessagesAll.push('Tài khoản này chỉ nằm trong phạm vi thực hiện đối với các lưu vực sông nội tỉnh độc lập. Lỗi tại mục: ' + temp.stt);
                                return;
                            }

                            if (arrow?.header?.[1] === 'Lưu vực sông nội tỉnh') {
                                // let songMap = new Map();
                                arrow?.data?.forEach((row, index) => {
                                    // const _temp = {};
                                    const stt = convertDataImport(row?.[0], "String");
                                    let luuVucSong = convertDataImport(row?.[1], "String");
                                    const luuVucSongId = findLuuVucSongId(luuVucSong) || '';

                                    if (!luuVucSongId) {
                                        errorMessagesAll.push(`Không tìm thấy mã sông tại ${luuVucSong} mục ${stt}`);
                                        // return;
                                    }
                                    else {
                                        luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                                    }
                                    const viTriData = findViTriHanhChinh(row?.[2], row?.[3], row?.[4], row?.[0], tinhThanhsList);
                                    if (viTriData.errorMessage) {
                                        errorMessagesAll.push(viTriData.errorMessage);
                                        // return;
                                    }
                                    // Kiểm tra trùng key
                                    // const viTri = `${row?.[2]},${row?.[3]},${row?.[4]}`; // Tạo key dựa trên thông tin vị trí
                                    // const checkTrungKey = `${viTri},${_temp.luuVucSongId},${viTriData.dataViTri.phuongXaId},${viTriData.dataViTri.quanHuyenId},${viTriData.dataViTri.tinhThanhId}`;
                                    // if (songMap.has(checkTrungKey)) {
                                    //     const duplicateIndex = songMap.get(checkTrungKey);
                                    //     errorMessagesAll.push(`Tên vị trí và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}. Tại ${_temp.luuVucSong} mục ${_temp.stt}`);
                                    //     return;
                                    // }

                                    // // Đánh dấu đã xử lý key
                                    // songMap.set(checkTrungKey, index + 1);
                                    const dataThang = luongMua1Nam(row?.[4], row?.[5], row?.[6], row?.[7], row?.[8], row?.[9], row?.[10], row?.[11], row?.[12], row?.[13], row?.[14], row?.[15]);
                                    const muaMua = sumMuaMua(row?.[8], row?.[9], row?.[10], row?.[11], row?.[12], row?.[13]);
                                    const muaKho = sumMuaKho(row?.[14], row?.[15], row?.[4], row?.[5], row?.[6], row?.[7]);
                                    const caNam = (muaKho + muaMua);
                                    const _temp = {
                                        stt: stt,
                                        luuVucSong: luuVucSong,
                                        luuVucSongId: luuVucSongId,
                                        ...viTriData.dataViTri,
                                        ...dataThang,
                                        muaMua: row?.[16] ? row?.[16] : muaMua,
                                        muaKho: row?.[17] ? row?.[17] : muaKho,
                                        caNam: row?.[18] ? row?.[18] : caNam,
                                        indexOnBieuMau: row?.[19] || '',
                                        isDeleted: removeVietnameseTones(row?.[20]) === 'co',
                                    };
                                    temp.luuVucSongNoiTinhs.push(_temp);
                                });
                            }
                        }
                    });
                    output.push(temp);
                });
            }
            return {
                tinhs: output,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // bieu 7 excel
    const bieu7Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: results } = getAllHeadersByIndex(
                handleFormat(data),
                0,
                2
            );
            ;
            if (!results[0].includes('I')) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const response = splitArrayLaMa(results, 0);
            const output = [];
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'tên sông'),
                    message: 'Dữ liệu thiếu cột tên sông',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'vị trí tính toán'
                    ),
                    message: 'Dữ liệu thiếu cột vị trí tính toán',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'tháng'),
                    message: 'Dữ liệu thiếu cột tháng',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'mùa mưa'),
                    message: 'Dữ liệu thiếu cột mùa mưa',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'mùa khô'),
                    message: 'Dữ liệu thiếu cột mùa khô',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'cả năm'),
                    message: 'Dữ liệu thiếu cột cả năm',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // const duplicateCheck = new Set();

            // Xử lý dữ liệu
            response?.forEach((row) => {
                if (row?.header?.length > 0) {
                    output.push({
                        stt: convertDataImport(row?.header?.[0], "String"),
                        luuVucSong: row?.header?.[1],
                        luuVucSongId: findLuuVucSongId(row?.header?.[1]) || '',
                        songs: [],
                    });
                }
                output?.forEach((i) => {
                    if (i?.luuVucSongId === '') {
                        errorMessagesAll.push(`Không tìm thấy mã lưu vực sông tại ${i?.luuVucSong} mục ${i?.stt}`);
                    }
                    else {
                        i.luuVucSong = luuVucSongs.find(j => j.maMuc === i.luuVucSongId)?.tenMuc;
                    }
                });
            });
            const _out = output?.map((i) => {
                const _songs = response?.find(
                    (j) => j?.header?.[0] === i?.stt
                )?.data;

                const _response = [];
                _songs?.forEach((j, index) => {
                    // let rowError = false;
                    let temp = {};

                    // Xử lý dòng sông
                    if (isStringNumber(j?.[0])) {
                        temp = {
                            stt: convertDataImport(j?.[0], "String"),
                            song: j?.[1],
                            viTriChayVao: {},
                            viTriChayRa: {},
                        };

                        // const checkTrungKey = `${temp.song},${i?.luuVucSongId}`;
                        // if (duplicateCheck.has(checkTrungKey)) {
                        //     errorMessagesAll.push(`Tên sông bị trùng tại dòng ${index + 1} tại ${temp.song}`);
                        //     // rowError = true;
                        // }
                        // duplicateCheck.add(checkTrungKey);
                        // if (!rowError) {
                        _response.push(temp);
                        // }
                    }
                    // Xử lý dòng vị trí
                    if (['a', 'b'].includes(j?.[0])) {
                        const viTriType = j?.[0] === 'a' ? 'Vị trí chảy vào' : 'Vị trí chảy ra';
                        const viTriKey = j?.[0] === 'a' ? 'viTriChayVao' : 'viTriChayRa';

                        const viTriHanhChinh = findViTriHanhChinh(j?.[2], j?.[3], j?.[4], index + 1);
                        const dataThang = luongMua1Nam(j?.[5], j?.[6], j?.[7], j?.[8], j?.[9], j?.[10], j?.[11], j?.[12], j?.[13], j?.[14], j?.[15], j?.[16]);
                        const muaMua = sumMuaMua(j?.[9], j?.[10], j?.[11], j?.[12], j?.[13], j?.[14]);
                        const muaKho = sumMuaKho(j?.[15], j?.[16], j?.[5], j?.[6], j?.[7], j?.[8]);
                        const caNam = muaMua + muaKho;
                        // Tìm temp tương ứng trong _response
                        const currentTemp = _response[_response.length - 1];
                        if (currentTemp) {
                            currentTemp[viTriKey] = {
                                viTri: viTriType,
                                ...viTriHanhChinh.dataViTri,
                                ...dataThang,
                                muaMua: j?.[17] ? j?.[17] : muaMua,
                                muaKho: j?.[18] ? j?.[18] : muaKho,
                                caNam: j?.[19] ? j?.[19] : caNam,
                                indexOnBieuMau: j?.[20] || '',
                                isDeleted: removeVietnameseTones(j?.[21]) === 'co',
                            };
                        }
                    }
                });
                return {
                    ...i,
                    songs: unique(_response),
                    error: false,
                };
            });
            return {
                luuVucSongs: _out,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };

        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // bieu 8 excel
    const bieu8Mapping = (data) => {
        const _data = handleFormat(data);
        // Lấy ra các header/data của từng block dữ liệu
        const { data: results1 } = getAllHeadersByIndex(_data, 0, 2);
        const response1 = splitWithPattern(results1, (row) =>
            isBlockHeaderIsLaMa({ data: row })
        );
        console.log(response1);
        if (response1.length < 1) {
            return {
                errorMessages: 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
        const output1 = [];
        const errorMessagesAll = [];
        const errorConditions = [
            {
                condition: !checkColumnExists1Chieu(
                    _data,
                    0,
                    'tên công trình chuyển nước'
                ),
                message: 'Dữ liệu thiếu cột tên công trình chuyển nước',
            },
            {
                condition: !checkColumnExists1Chieu(
                    _data,
                    0,
                    'vị trí công trình'
                ),
                message: 'Dữ liệu thiếu cột vị trí công trình',
            },
            {
                condition: !checkColumnExists1Chieu(
                    _data,
                    0,
                    'lưu vực sông nhận nước'
                ),
                message: 'Dữ liệu thiếu cột lưu vực sông nhận nước',
            },
            {
                condition: !checkColumnExists1Chieu(
                    _data,
                    0,
                    'Tổng lượng nước chuyển (triệu m3)'
                ),
                message: 'Dữ liệu thiếu cột Tổng lượng nước chuyển (triệu m3)',
            },
        ];
        errorConditions.forEach((i) => {
            if (i.condition) {
                errorMessagesAll.push(i.message);
            }
        });
        const errorMessages = errorMessagesAll.join('\n');
        if (errorMessages) {
            return {
                errorMessages,
                error: true,
            };
        }
        response1?.forEach((row) => {
            if (row?.header?.length > 0) {
                let luuVucSong = convertDataImport(row.header[1], "String");
                const luuVucSongId = findLuuVucSongId(luuVucSong) || '';
                // let rowHasError = false;

                // Kiểm tra nếu không tìm thấy mã sông
                if (luuVucSongId === '') {
                    errorMessagesAll.push(
                        `Không tìm thấy lưu vực sông tại ${luuVucSong}, mục ${convertDataImport(row.header[0], "String")}`
                    );
                    // rowHasError = true;
                }
                else {
                    luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                }

                // if (!rowHasError) {
                // const congTrinMap = new Map();
                const congTrinhs = row?.data?.map((i, index) => {
                    // Tìm vị trí hành chính
                    const viTriHanhChinh = findViTriHanhChinh(i?.[2], i?.[3], i?.[4], index + 1);

                    if (viTriHanhChinh.errorMessage) {
                        errorMessagesAll.push(viTriHanhChinh.errorMessage);
                        // rowHasError = true;
                        // return null;
                    }
                    const luuVucSongNhanNuoc = convertDataImport(i?.[5], "String");
                    const luuVucSongNhanNuocId = findLuuVucSongId(luuVucSongNhanNuoc) || '';
                    if (luuVucSongNhanNuocId === '') {
                        errorMessagesAll.push(`Không tìm thấy mã lưu vực sông nhận nước tại ${i?.[5]}, mục ${convertDataImport(row.header[0], "String")}`);
                        // rowHasError = true;
                        // return null;
                    }

                    // const checkTrungKey = `${i?.[1]},${luuVucSongId},${viTriHanhChinh.dataViTri.phuongXaId},${viTriHanhChinh.dataViTri.quanHuyenId},${viTriHanhChinh.dataViTri.tinhThanhId}`;

                    // // Kiểm tra trùng key
                    // if (congTrinMap.has(checkTrungKey)) {
                    //     const duplicateIndex = congTrinMap.get(checkTrungKey);
                    //     errorMessagesAll.push(
                    //         `Tên công trình và vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}. Tại ${luuVucSong}, mục ${convertDataImport(row.header[0], "String")}`
                    //     );
                    //     return null;
                    // }
                    // congTrinMap.set(checkTrungKey, index + 1);
                    return {
                        stt: convertDataImport(i?.[0], "String"),
                        ten: i?.[1],
                        ...viTriHanhChinh.dataViTri,
                        luuVucSongNhanNuoc,
                        trungBinhMuaLu: strToNumber(i?.[6]),
                        trungBinhMuaCan: strToNumber(i?.[7]),
                        trungBinhCaNam: strToNumber(i?.[8]),
                        indexOnBieuMau: i?.[9] || '',
                        isDeleted: removeVietnameseTones(i?.[10])?.toLowerCase() === 'co',
                    };
                });
                // .filter(Boolean); // Loại bỏ các công trình lỗi (null)

                if (congTrinhs.length > 0) {
                    output1.push({
                        stt: convertDataImport(row.header[0], "String"),
                        luuVucSong,
                        luuVucSongId,
                        congTrinhs,
                    });
                }
                // }
            }
        });

        return {
            luuVucSongs: output1,
            error: false,
            errorMessages: errorMessagesAll.join('\n'),
        };

    };
    // bieu 9 excel ko nhập
    const bieu9Mapping = (data) => {
        try {
            // Xử lý dữ liệu đầu vào và chia thành các khối
            const _data = trySplitToBlocks(
                handleFormat(data),
                'Tổng lượng mưa phân'
            );

            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists(_data, 0, 'lưu vực sông'),
                    message: 'Dữ liệu mục 9.1 thiếu cột lưu vực sông',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'vị trí hành chính'),
                    message: 'Dữ liệu mục 9.1 thiếu cột vị trí hành chính',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'tháng'),
                    message: 'Dữ liệu mục 9.1 thiếu cột tháng',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'mùa mưa'),
                    message: 'Dữ liệu mục 9.1 thiếu cột mùa mưa',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'mùa khô'),
                    message: 'Dữ liệu mục 9.1 thiếu cột mùa khô',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'cả năm'),
                    message: 'Dữ liệu mục 9.1 thiếu cột cả năm',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'lưu vực sông'),
                    message: 'Dữ liệu mục 9.2 thiếu cột lưu vực sông',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'vị trí hành chính'),
                    message: 'Dữ liệu mục 9.2 thiếu cột vị trí hành chính',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'tháng'),
                    message: 'Dữ liệu mục 9.2 thiếu cột tháng',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'mùa mưa'),
                    message: 'Dữ liệu mục 9.2 thiếu cột mùa mưa',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'mùa khô'),
                    message: 'Dữ liệu mục 9.2 thiếu cột mùa khô',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'cả năm'),
                    message: 'Dữ liệu mục 9.2 thiếu cột cả năm',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // Lấy ra các header và data của từng block
            const { data: results1 } = getAllHeadersByIndex(_data[0], 0, 3);
            const { data: results2 } = getAllHeadersByIndex(_data[1], 0, 2);

            // Chia mảng theo điều kiện 'I'
            const response = splitArray(results1, ['I'], 0);
            const response2 = splitArray(results2, ['I'], 0);

            // Khởi tạo các mảng đầu ra
            const output = [];
            const output2 = [];

            // Xử lý và lọc dữ liệu cho namVaLuuVucSongs
            removeEmptyArray(response)?.forEach((row) => {
                const temp = {
                    stt: convertDataImport(row?.header?.[0], "String"),
                    nam: row?.header?.[1],
                    luuVucSongs: [],
                };

                const array = splitArray(row?.data, ['Cả nước']);
                array?.forEach((row) => {
                    const currentSplitArray = splitArray(row?.data, ['Sông']);
                    currentSplitArray?.forEach((innerRow) => {
                        const _temp = {
                            stt: convertDataImport(innerRow?.header?.[0], 'String'),
                            luuVucSong: innerRow?.header?.[1],
                            trams: innerRow?.data?.map((i) => ({
                                stt: convertDataImport(i?.[0], 'String'),
                                tram: i?.[1],
                                xa: i?.[2],
                                huyen: i?.[3],
                                tinh: i?.[4],
                                thang1: i?.[5],
                                thang2: i?.[6],
                                thang3: i?.[7],
                                thang4: i?.[8],
                                thang5: i?.[9],
                                thang6: i?.[10],
                                thang7: i?.[11],
                                thang8: i?.[12],
                                thang9: i?.[13],
                                thang10: i?.[14],
                                thang11: i?.[15],
                                thang12: i?.[16],
                                muaMua: i?.[17],
                                muaKho: i?.[18],
                                caNam: i?.[19],
                            })),
                        };
                        temp.luuVucSongs.push(_temp);
                    });
                });
                output.push(temp);
            });

            // Xử lý và lọc dữ liệu cho namVaTinhs
            removeEmptyArray(response2)?.forEach((row) => {
                const tempb = {
                    stt: convertDataImport(row?.header?.[0], 'String'),
                    nam: row?.header?.[1],
                    tinhs: [],
                };

                const array = splitArray(row?.data, ['Cả nước']);
                array?.forEach((row) => {
                    const currentSplitArray = splitArray(row?.data, [
                        'Tỉnh',
                        'Thành phố',
                    ]);
                    currentSplitArray?.forEach((innerRow) => {
                        const _tempb = {
                            stt: convertDataImport(innerRow?.header?.[0], "String"),
                            tinh: innerRow?.header?.[1],
                            trams: innerRow?.data?.map((i) => ({
                                stt: convertDataImport(i?.[0], "String"),
                                tram: i?.[1],
                                xa: i?.[2],
                                huyen: i?.[3],
                                tinh: i?.[4],
                                thang1: i?.[5],
                                thang2: i?.[6],
                                thang3: i?.[7],
                                thang4: i?.[8],
                                thang5: i?.[9],
                                thang6: i?.[10],
                                thang7: i?.[11],
                                thang8: i?.[12],
                                thang9: i?.[13],
                                thang10: i?.[14],
                                thang11: i?.[15],
                                thang12: i?.[16],
                                muaMua: i?.[17],
                                muaKho: i?.[18],
                                caNam: i?.[19],
                            })),
                        };
                        tempb.tinhs.push(_tempb);
                    });
                });
                output2.push(tempb);
            });

            // Trả về kết quả đã xử lý
            return {
                namVaLuuVucSongs: output,
                namVaTinhs: output2,
                error: false,
            };
        } catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // bieu 10 excel
    const bieu10Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Nguồn nước (sông ,suối, kênh, hồ,đầm,…)'
                    ),
                    message:
                        'Dữ liệu thiếu cột Nguồn nước (sông ,suối, kênh, hồ,đầm,…)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'vị trí hành chính'
                    ),
                    message: 'Dữ liệu thiếu cột vị trí hành chính',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Thuộc lưu vực sông'
                    ),
                    message: 'Dữ liệu thiếu cột Thuộc lưu vực sông',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Giá trị WQI'
                    ),
                    message: 'Dữ liệu thiếu cột Giá trị WQI',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'thời gian'),
                    message: 'Dữ liệu thiếu cột thời gian',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // let viTriMap = new Map();
            const { data: resultsB10 } = getAllHeadersByIndex(_data, 0, 2);
            const viTriQuanTracs = resultsB10?.map((i, index) => {
                let luuVucSong = convertDataImport(i?.[5], "String");
                const luuVucSongId = findLuuVucSongId(luuVucSong) || '';
                // let rowError = false;
                if (luuVucSongId === '') {
                    errorMessagesAll.push(`Không tìm thấy mã sông tại ${luuVucSong} mục ${convertDataImport(i?.[0], "String")}`);
                    // rowError = true;
                    // return null;
                }
                else {
                    luuVucSong = luuVucSongs.find(i => i.maMuc === luuVucSongId)?.tenMuc;
                }
                const thoiGian = typeof i?.[7] === 'string' ? i?.[7] : ExcelDateToJSDate(i?.[7]);
                const nguonNuoc = convertDataImport(i?.[1], "String");
                const dataViTriHanhChinh = findViTriHanhChinh(i?.[2], i?.[3], i?.[4], index + 1);

                if (dataViTriHanhChinh.errorMessage) {
                    errorMessagesAll.push(dataViTriHanhChinh.errorMessage);
                    // rowError = true;
                    // return null;
                }
                // const checkTrungKey = `${nguonNuoc},${thoiGian},${luuVucSongId},${dataViTriHanhChinh.dataViTri.phuongXaId},${dataViTriHanhChinh.dataViTri.quanHuyenId},${dataViTriHanhChinh.dataViTri.tinhThanhId}`;
                // if (viTriMap.has(checkTrungKey)) {
                //     const duplicateIndex = viTriMap.get(checkTrungKey);
                //     errorMessagesAll.push(`Tên vị trí,Vị trí hành chính,Lưu vực sông và thời gian bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}`);
                //     rowError = true;
                //     return null;
                // }
                // if (!rowError) {
                //     viTriMap.set(checkTrungKey, index + 1);
                // const thoiGianCV = convertExcelDateToJSDate(i?.[7]);
                // const thoiGianCV = i?.[7];
                // const timestamp = moment(
                //     thoiGianCV,
                //     'DD/MM/YYYY'
                // ).valueOf();

                // if (isNaN(timestamp)) {
                //     errorMessagesAll.push(`Thời gian không đúng định dạng tại dòng số ${i?.[0]}`);
                // }
                // const thoiGian = timestamp / 1000;
                return {
                    stt: convertDataImport(i?.[0], "String"),
                    nguonNuoc,
                    ...dataViTriHanhChinh.dataViTri,
                    luuVucSong,
                    luuVucSongId,
                    giaTriWQI: strToNumber(i?.[6]),
                    thoiGian: thoiGian,
                    indexOnBieuMau: i?.[8] || '',
                    isDeleted: removeVietnameseTones(i?.[9]) === ('co') ? true : false,
                }
                // }
                // return null;
            });
            // .filter(Boolean);
            return {
                viTriQuanTracs,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        } catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // function convertExcelDateToJSDateEdit(excelDate) {
    //     // Ngày gốc trong Excel là 01/01/1900
    //     const excelEpoch = new Date(1900, 0, 1); // Lưu ý tháng 0 là tháng 1

    //     // Cộng số ngày, trừ 1 ngày do lỗi năm nhuận của Excel
    //     const jsDate = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000); // old code

    //     // Format thành 'dd/mm/yyyy'
    //     const day = jsDate.getDate().toString().padStart(2, '0');
    //     const month = (jsDate.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    //     const year = jsDate.getFullYear();

    //     return `${day}/${month}/${year}`;
    // }

    function convertExcelDateToJSDate(excelDate) {
        // Ngày gốc trong Excel là 01/01/1900
        const excelEpoch = new Date(1900, 0, 1);

        // Kiểm tra và điều chỉnh cho lỗi năm nhuận giả của Excel
        const adjustment = excelDate >= 60 ? -1 : 0; // Trừ 1 nếu ngày >= 60

        // Tính toán ngày JavaScript
        const jsDate = new Date(excelEpoch.getTime() + (excelDate + adjustment - 1) * 24 * 60 * 60 * 1000);

        // Format thành 'dd/mm/yyyy'
        const day = jsDate.getDate().toString().padStart(2, '0');
        const month = (jsDate.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = jsDate.getFullYear();

        return `${day}/${month}/${year}`;
    }

    // bieu 11 excel
    const bieu11Mapping = (data) => {
        try {
            const _data = trySplitToBlocks(
                handleFormat(data),
                'Kiểm kê lượng nước'
            );
            if (_data.length < 1) {
                return {
                    errorMessages: 'Dữ liệu không đúng cấu trúc',
                    error: true,
                };
            }
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists(_data, 0, 'tầng chứa nước'),
                    message: 'Dữ liệu mục 11.1 thiếu cột tầng chứa nước',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'nước ngọt'),
                    message: 'Dữ liệu mục 11.1 thiếu cột nước ngọt',
                },
                {
                    condition: !checkColumnExists(_data, 0, 'nước mặn'),
                    message: 'Dữ liệu mục 11.1 thiếu cột nước mặn',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'tầng chứa nước'),
                    message: 'Dữ liệu mục 11.2 thiếu cột tầng chứa nước',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'nước ngọt'),
                    message: 'Dữ liệu mục 11.2 thiếu cột nước ngọt',
                },
                {
                    condition: !checkColumnExists(_data, 1, 'nước mặn'),
                    message: 'Dữ liệu mục 11.2 thiếu cột nước mặn',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // Lấy ra các header/data của từng block dữ liệu
            const { data: results1 } = getAllHeadersByIndex(_data[0], 0, 2);
            const { data: results2 } = getAllHeadersByIndex(_data[1], 0, 2);


            const response1 = splitWithPattern(results1, (row) => isBlockHeaderIsLaMa({ data: row }));
            const response2 = splitWithPattern(results2, (row) =>
                isStringNumber(row?.[0])
            );
            const output = {
                luuVucSongs2: [],
                tinhThanhs: [],
            };
            if (response1.length > 0) {
                response1?.forEach((row) => {
                    const temp = {};
                    temp.stt = convertDataImport(row?.header?.[0], "String");
                    temp.luuVucSong = row?.header?.[1];
                    temp.luuVucSongId = findLuuVucSongId(row?.header?.[1]) || '';
                    if (temp.luuVucSongId === "") {
                        errorMessagesAll.push(`lưu vực sông không được để trống tại mục ${temp.stt}`);
                    }
                    else {
                        temp.luuVucSong = luuVucSongs.find(i => i.maMuc === temp.luuVucSongId)?.tenMuc;
                    }
                    temp.tangChuaNuocs = row?.data?.map((i) => ({
                        stt: convertDataImport(i?.[0], "String"),
                        tangChuaNuoc: convertDataImport(i?.[1], "String"),
                        nuocNgotDienTichPhanBo: convertDataImport(i?.[2], "String"),
                        nuocNgotTruLuongTiemNang: convertDataImport(i?.[3], "String"),
                        nuocNgotTruLuongCoTheKhaiThac: convertDataImport(i?.[4], "String"),
                        nuocManDienTichPhanBo: convertDataImport(i?.[5], "String"),
                        nuocManTruLuong: convertDataImport(i?.[6], "String"),
                        indexOnBieuMau: i?.[7] || '',
                        isDeleted: removeVietnameseTones(i?.[8]) === ('co') ? true : false,

                    }));
                    output.luuVucSongs2.push(temp);
                });
            }
            if (response2.length > 0) {
                response2?.forEach((row) => {
                    const temp = {};
                    temp.stt = convertDataImport(row?.header?.[0], "String");
                    const tinhThanhsList = findTinhThanh(tinhThanh0s, convertDataImport(row?.header?.[1], "String"));
                    if (tinhThanhsList) {
                        temp.tinhThanh = tinhThanhsList.tenRutGon;
                        temp.tinhId = tinhThanhsList?.maTinh || '';
                        if (!temp.tinhThanh) {
                            errorMessagesAll.push(`Không tìm thấy tỉnh thành tại mục ${temp.stt}`);
                        }
                    }
                    temp.tangChuaNuocs = row?.data?.map((i) => ({
                        stt: convertDataImport(i?.[0], "String"),
                        tangChuaNuoc: convertDataImport(i?.[1], "String"),
                        nuocNgotDienTichPhanBo: convertDataImport(i?.[2], "String"),
                        nuocNgotViTriHanhChinh: convertDataImport(i?.[3], "String"),
                        nuocNgotTruLuongTiemNang: convertDataImport(i?.[4], "String"),
                        nuocNgotTruLuongCoTheKhaiThac: convertDataImport(i?.[5], "String"),
                        nuocManDienTichPhanBo: convertDataImport(i?.[6], "String"),
                        nuocManViTriHanhChinh: convertDataImport(i?.[7], "String"),
                        nuocManTruLuong: convertDataImport(i?.[8], "String"),
                        indexOnBieuMau: i?.[9] || '',
                        isDeleted: removeVietnameseTones(i?.[10]) === ('co') ? true : false,
                    }));
                    output.tinhThanhs.push(temp);
                });
            }
            if (errorMessagesAll && errorMessagesAll.length > 0) {
                return {
                    ...output,
                    errorMessages: errorMessagesAll.join(', '),
                    error: true,
                };
            }
            return {
                ...output,
                error: false,
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // bieu 14 excel
    const bieu14Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: resultsB14 } = getAllHeadersByIndex(_data, 0, 2);
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tên chủ hộ/công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Tên chủ hộ/công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tọa độ (VN 2000 kinh tuyến trục, múi chiếu 3o)'
                    ),
                    message:
                        'Dữ liệu thiếu cột Tọa độ (VN 2000 kinh tuyến trục, múi chiếu 3o)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Vị trí hành chính'
                    ),
                    message: 'Dữ liệu thiếu cột Vị trí hành chính',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Lưu lượng nước khai thác (m3/ngày)'
                    ),
                    message: 'Dữ liệu thiếu cột Lưu lượng nước khai thác (m3/ngày)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'mục đích sử dụng'
                    ),
                    message: 'Dữ liệu thiếu cột mục đích sử dụng',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'ghi chú'),
                    message: 'Dữ liệu thiếu cột ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // let viTriMap = new Map();
            const hoHoacCongTrinhs = resultsB14.map((i, index) => {
                // let rowError = false;
                const dataViTriHanhChinh = findViTriHanhChinh(i?.[4], i?.[5], i?.[6], index + 1);

                if (dataViTriHanhChinh.errorMessage) {
                    errorMessagesAll.push(dataViTriHanhChinh.errorMessage);
                    // rowError = true;
                    // return null;
                }
                // if (!rowError) {
                // const checkTrungKey = `${i?.[1]},${dataViTriHanhChinh.dataViTri.phuongXaId},${dataViTriHanhChinh.dataViTri.quanHuyenId},${dataViTriHanhChinh.dataViTri.tinhThanhId}`;
                // if (viTriMap.has(checkTrungKey)) {
                //     const duplicateIndex = viTriMap.get(checkTrungKey);
                //     errorMessagesAll.push(`Tên Công trình và Vị trí hành chính bị trùng tại dòng ${index + 1} với dòng ${duplicateIndex}`);
                //     rowError = true;
                //     return null;
                // }
                // if (!rowError) {
                // viTriMap.set(checkTrungKey, index + 1);
                return {
                    stt: convertDataImport(i?.[0], 'String'),
                    ten: convertDataImport(i?.[1], 'String'),
                    vN2000x: convertDataImport(i?.[2], 'Number'),
                    vN2000y: convertDataImport(i?.[3], 'Number'),
                    ...dataViTriHanhChinh.dataViTri,
                    luuLuongKhaiThacText: convertDataImport(i?.[7], 'String'),
                    ...autoMappingMdsd(i?.[8]?.split(",")?.map(i => i?.trim())),
                    ghiChu: convertDataImport(i?.[9], 'String'),
                    indexOnBieuMau: i?.[10] || '',
                    isDeleted: removeVietnameseTones(i?.[11]) === ('co') ? true : false,
                };
            }
                // return null;
                // }

                // }
            )
            // .filter(Boolean);
            return {
                hoHoacCongTrinhs,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };

    const bieu21Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: results } = getAllHeadersByIndex(_data, 0, 1);
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tên chủ hộ/công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Tên chủ hộ/công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Thôn, ấp, tổ dân phố,…'
                    ),
                    message: 'Dữ liệu thiếu cột Thôn, ấp, tổ dân phố,…',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Loại hình nước thải'
                    ),
                    message: 'Dữ liệu thiếu cột Loại hình nước thải',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Quy mô của loại hình nước thải'
                    ),
                    message: 'Dữ liệu thiếu cột Quy mô của loại hình nước thải',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Nguồn nước sử dụng'
                    ),
                    message: 'Dữ liệu thiếu cột Nguồn nước sử dụng',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Lượng nước sử dụng (m3/ngày)'
                    ),
                    message: 'Dữ liệu thiếu cột Lượng nước sử dụng (m3/ngày)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Lưu lượng nước thải (m3/ngày)'
                    ),
                    message: 'Dữ liệu thiếu cột Lưu lượng nước thải (m3/ngày)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Nguồn tiếp nhận nước thải'
                    ),
                    message: 'Dữ liệu thiếu cột Nguồn tiếp nhận nước thải',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Thông tin khác'),
                    message: 'Dữ liệu thiếu cột Thông tin khác',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            let congTrinhMap = new Map();
            const hoHoacCongTrinhs = results?.map((i, index) => {
                // let rowError = false
                // const checkTrungKey = i?.[1];
                // if (congTrinhMap.has(checkTrungKey)) {
                //     const duplicateIndex = congTrinhMap.get(checkTrungKey);
                //     errorMessagesAll.push(`tên công trình dòng ${index + 1} bị trùng với dòng ${duplicateIndex + 1}`);
                //     rowError = true;
                // }
                // if (!rowError) {
                //     congTrinhMap.set(checkTrungKey, index);
                return {
                    stt: convertDataImport(i?.[0], 'String'),
                    tenChuHoHoacCongTrinh: convertDataImport(i?.[1], 'String'),
                    thonXom: convertDataImport(i?.[2], 'String'),
                    loaiHinhNuocThai: convertDataImport(i?.[3], 'String'),
                    loaiHinhNuocThaiId:
                        i?.[3] && typeof i?.[3] === 'string'
                            ? findLoaiHinhNuocThai(i?.[3].trim())
                            : '',
                    quyMoLoaiHinhNuocThai: convertDataImport(i?.[4], 'String'),
                    nguonNuocSuDung: convertDataImport(i?.[5], 'String'),
                    luongNuocSuDung: strToNumber(i?.[6]),
                    luuLuongNuocThai: strToNumber(i?.[7]),
                    nguonTiepNhanNuocThai: convertDataImport(i?.[8], 'String'),
                    thongTinKhac: convertDataImport(i?.[9], 'String'),
                    indexOnBieuMau: i?.[10] || '',
                    isDeleted: removeVietnameseTones(i?.[11]) === ('co') ? true : false,
                }
                // }
                // return null;
            });
            // .filter(Boolean);
            // cách 2, lấy theo vị trí của header
            // const aoHoDamPhas = mappingByHeaders(results2, ['stt', 'tenChuHoHoacCongTrinh', 'thonXom', 'loaiHinhNuocThai', 'quyMoLoaiHinhNuocThai', 'nguonNuocSuDung', 'luongNuocSuDung', 'luuLuongNuocThai', 'nguonTiepNhanNuocThai', 'thongTinKhac']);
            return {
                hoHoacCongTrinhs,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };

    const bieu21MappingMaxFile = (data) => {
        try {
            const headerValues = Object.values(data[0]) || [];
            const resultsB21 = data || [];
            // bỏ đi dòng đầu của resultsB21
            resultsB21.shift();
            const keywords = [
                'Xã/Phường/Thị trấn',
                'Huyện',
                'Tỉnh',
                'STT',
                'Tên cơ sở/ chủ hộ sản xuất',
                'Ấp/Khóm/Tổ dân phố',
                'Loại hình nước thải',
                'Quy mô cơ sở hộ sản xuất',
                'Nguồn nước sử dụng',
                'Lượng nước SD (m3/ngày)',
                'Lượng nước thải (m3/ngày)',
                'Nguồn tiếp nhận nước thải',
                'Thông tin khác',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];

            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });
            // kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter(
                (column) => column.index === -1
            );
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }

            const groupedData = {};
            const errorMessages = [];
            const maIdCheckTrung = new Map();
            resultsB21.forEach((row, index) => {
                // Lấy dữ liệu từ các cột tự động nhận diện
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Xã/Phường/Thị trấn',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Huyện',
                    columnMappings,
                    'string'
                );

                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                // Lấy mã của phường/xã, quận/huyện, tỉnh/thành phố
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;

                // Tạo key để nhóm dữ liệu dựa trên phường/xã, quận/huyện, tỉnh/thành phố
                const key = `${tinhThanh}-${quanHuyen}-${phuongXa}`;
                const stt = getCellValueProcessed(
                    row,
                    'STT',
                    columnMappings,
                    'string'
                );
                const tenChuHoHoacCongTrinh = getCellValueProcessed(
                    row,
                    'Tên cơ sở/ chủ hộ sản xuất',
                    columnMappings,
                    'string'
                );
                const maCheckTrung = createKey(tenChuHoHoacCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maIdCheckTrung.has(maCheckTrung)) {
                    const duplicateIndex = maIdCheckTrung.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maIdCheckTrung.set(maCheckTrung, index);
                }

                const thonXom = getCellValueProcessed(
                    row,
                    'Ấp/Khóm/Tổ dân phố',
                    columnMappings,
                    'string'
                );
                const loaiHinhNuocThai = getCellValueProcessed(
                    row,
                    'Loại hình nước thải',
                    columnMappings,
                    'string'
                );
                const quyMoLoaiHinhNuocThai = getCellValueProcessed(
                    row,
                    'Quy mô cơ sở hộ sản xuất',
                    columnMappings,
                    'string'
                );
                const nguonNuocSuDung = getCellValueProcessed(
                    row,
                    'Nguồn nước sử dụng',
                    columnMappings,
                    'string'
                );
                const luongNuocSuDung = getCellValueProcessed(
                    row,
                    'Lượng nước SD (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const luuLuongNuocThai = getCellValueProcessed(
                    row,
                    'Lượng nước thải (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const nguonTiepNhanNuocThai = getCellValueProcessed(
                    row,
                    'Nguồn tiếp nhận nước thải',
                    columnMappings,
                    'string'
                );
                const thongTinKhac = getCellValueProcessed(
                    row,
                    'Thông tin khác',
                    columnMappings,
                    'string'
                );
                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );
                let rowHasError = false;
                const errorConditions = [
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    // {
                    //     condition: phuongXa !== null && phuongXaId === null,
                    //     message: `Phường/xã sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    // {
                    //     condition: quanHuyen !== null && quanHuyenId === null,
                    //     message: `Quận/huyện sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: luongNuocSuDung === 'error',
                        message: ` Lượng nước sử dụng (m3/ngày) phải là số`,
                    },
                    {
                        condition: luuLuongNuocThai === 'error',
                        message: ` Lưu lượng nước thải(m3/ngày) phải là số`,
                    },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập không phải là ngày`,
                    },
                ];
                errorConditions.forEach((errorCondition) => {
                    if (errorCondition.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${errorCondition.message}`
                        );
                        rowHasError = true;
                    }
                });

                if (!rowHasError) {
                    if (!groupedData[key]) {
                        groupedData[key] = {
                            tinhThanh,
                            quanHuyen,
                            phuongXa,
                            tinhThanhId,
                            quanHuyenId,
                            phuongXaId,
                            nguoiCungCapThongTin,
                            canBoDieuTra,
                            nguoiLapBieu,
                            ngayLapBieu,
                            hoHoacCongTrinhs: [],
                        };
                    }
                    // Thêm dữ liệu vào nhóm hoHoacCongTrinhs
                    groupedData[key].hoHoacCongTrinhs.push({
                        stt,
                        tenChuHoHoacCongTrinh,
                        thonXom,
                        loaiHinhNuocThai,
                        quyMoLoaiHinhNuocThai,
                        nguonNuocSuDung,
                        luongNuocSuDung,
                        luuLuongNuocThai,
                        nguonTiepNhanNuocThai,
                        thongTinKhac,
                    });
                }
            });

            const finalData = Object.values(groupedData);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };

    const bieu25Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: results } = getAllHeadersByIndex(_data, 0, 1);
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Ngày'),
                    message: 'Dữ liệu thiếu cột Ngày',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Tháng (mm)'),
                    message: 'Dữ liệu thiếu cột Tháng (mm)',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 1'),
                    message: 'Dữ liệu thiếu cột Tháng 1',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 2'),
                    message: 'Dữ liệu thiếu cột Tháng 2',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 3'),
                    message: 'Dữ liệu thiếu cột Tháng 3',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 4'),
                    message: 'Dữ liệu thiếu cột Tháng 4',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 5'),
                    message: 'Dữ liệu thiếu cột Tháng 5',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 6'),
                    message: 'Dữ liệu thiếu cột Tháng 6',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 7'),
                    message: 'Dữ liệu thiếu cột Tháng 7',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 8'),
                    message: 'Dữ liệu thiếu cột Tháng 8',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 9'),
                    message: 'Dữ liệu thiếu cột Tháng 9',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 10'),
                    message: 'Dữ liệu thiếu cột Tháng 10',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 11'),
                    message: 'Dữ liệu thiếu cột Tháng 11',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 1, 'Tháng 12'),
                    message: 'Dữ liệu thiếu cột Tháng 12',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            const soLieuLuongMuas = [];
            results?.slice(0, 31).forEach((row, index) => {
                const temp = {};
                temp.ngaySo = index + 1;
                new Array(12).fill(0).forEach((_, cIndex) => {
                    temp.thangSo = cIndex + 1;
                    temp.luongMua = row?.[cIndex + 1];
                    soLieuLuongMuas.push({ ...temp });
                });
            });

            return {
                soLieuLuongMuas,
                error: false,
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const bieu17MappingMaxFile = (data) => {
        // Lấy tiêu đề các cột từ dòng đầu tiên
        try {
            const headerValues = Object.values(data[0]) || [];
            const resultsB17 = data || [];
            // bỏ đi dòng đầu của resultsB17
            resultsB17.shift();
            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const keywords = [
                'Xã/Phường/Thị trấn',
                'Huyện',
                'Tỉnh',
                'STT',
                'Tên chủ hộ/ công trình',
                'Ấp/Khóm/Tổ dân phố',
                'Loại công trình',
                'Tên nguồn nước khai thác',
                'Mục đích sử dụng',
                'Ước tính lượng nước khai thác (m3/ngày)',
                'Diện tích tưới (ha)',
                'Diện tích NTTS (ha)',
                'Công suất phát điện (KW)',
                'Số hộ dân được cấp nước',
                'Chế độ khai thác',
                'Ghi chú',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];

            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });

            // Kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter((c) => c.index === -1);
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }

            const groupedData = {};
            const errorMessages = [];
            const maInFileMap = new Map();
            resultsB17.forEach((row, index) => {
                let rowHasError = false;
                // Kiểm tra các dữ liệu bắt buộc
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Xã/Phường/Thị trấn',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Huyện',
                    columnMappings,
                    'string'
                );
                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;
                const key = `${tinhThanh}-${quanHuyen}-${phuongXa}`;
                const stt = getCellValueProcessed(
                    row,
                    'STT',
                    columnMappings,
                    'string'
                );
                const tenChuHoHoacCongTrinh = getCellValueProcessed(
                    row,
                    'Tên chủ hộ/ công trình',
                    columnMappings,
                    'string'
                );
                const maCheckTrung = createKey(tenChuHoHoacCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maInFileMap.has(maCheckTrung)) {
                    const duplicateIndex = maInFileMap.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} công trình: ${tenChuHoHoacCongTrinh} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInFileMap.set(maCheckTrung, index);
                }
                const thonXom = getCellValueProcessed(
                    row,
                    'Ấp/Khóm/Tổ dân phố',
                    columnMappings,
                    'string'
                );
                const loaiCongTrinh = getCellValueProcessed(
                    row,
                    'Loại công trình',
                    columnMappings,
                    'string'
                );
                const loaiCongTrinhId = findLoaiCongTrinh(loaiCongTrinh);
                const mucDichSuDungs = getCellValueProcessed(
                    row,
                    'Mục đích sử dụng',
                    columnMappings,
                    'string'
                )?.split(',');
                // nếu k tìm dc muc dich su dung thì trả về '' thêm vào mucDichSuDungIds
                const mucDichSuDungIds = splitAndMap(
                    getCellValueProcessed(
                        row,
                        'Mục đích sử dụng',
                        columnMappings,
                        'string'
                    ),
                    findMucDichSuDung
                );
                const tenNguonNuoc = getCellValueProcessed(
                    row,
                    'Tên nguồn nước khai thác',
                    columnMappings,
                    'string'
                );
                const luuLuongKhaiThacText = getCellValueProcessed(
                    row,
                    'Ước tính lượng nước khai thác (m3/ngày)',
                    columnMappings,
                    'string'
                );
                const dienTichTuoi = getCellValueProcessed(
                    row,
                    'Diện tích tưới (ha)',
                    columnMappings,
                    'number'
                );
                const dienTichNuoiTrongThuySan = getCellValueProcessed(
                    row,
                    'Diện tích NTTS (ha)',
                    columnMappings,
                    'number'
                );
                const congSuatPhatDien = getCellValueProcessed(
                    row,
                    'Công suất phát điện (KW)',
                    columnMappings,
                    'number'
                );
                const soHoDanDuocCapNuoc = getCellValueProcessed(
                    row,
                    'Số hộ dân được cấp nước',
                    columnMappings,
                    'number'
                );

                const cheDoKhaiThac = getCellValueProcessed(
                    row,
                    'Chế độ khai thác',
                    columnMappings,
                    'string'
                );
                const ghiChu = getCellValueProcessed(
                    row,
                    'Ghi chú',
                    columnMappings,
                    'string'
                );
                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );
                // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới
                const errorConditions = [
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: luuLuongKhaiThacText === 'error',
                        message: `Ước tính lượng nước khai thác (m3/ngày) phải là chữ`,
                    },
                    {
                        condition: dienTichTuoi === 'error',
                        message: `Diện tích tưới (ha) phải là số`,
                    },
                    {
                        condition: dienTichNuoiTrongThuySan === 'error',
                        message: `Diện tích NTTS phải là số`,
                    },
                    {
                        condition: congSuatPhatDien === 'error',
                        message: `Công suất phát điện (KW) phải là số`,
                    },
                    {
                        condition: soHoDanDuocCapNuoc === 'error',
                        message: `Số hộ dân được cấp nước phải là số`,
                    },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập không phải là ngày`,
                    },
                ];
                errorConditions.forEach((errorCondition) => {
                    if (errorCondition.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${errorCondition.message}`
                        );
                        rowHasError = true;
                    }
                });
                if (!rowHasError) {
                    // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới
                    if (!groupedData[key]) {
                        groupedData[key] = {
                            tinhThanh,
                            quanHuyen,
                            phuongXa,
                            phuongXaId,
                            quanHuyenId,
                            tinhThanhId,
                            nguoiCungCapThongTin,
                            canBoDieuTra,
                            nguoiLapBieu,
                            ngayLapBieu,
                            hoHoacCongTrinhs: [],
                        };
                    }
                    // Thêm dữ liệu vào nhóm hoHoacCongTrinhs
                    groupedData[key].hoHoacCongTrinhs.push({
                        stt,
                        tenChuHoHoacCongTrinh,
                        thonXom,
                        loaiCongTrinh,
                        loaiCongTrinhId,
                        tenNguonNuoc,
                        mucDichSuDungs,
                        mucDichSuDungIds,
                        luuLuongKhaiThacText,
                        dienTichTuoi,
                        dienTichNuoiTrongThuySan,
                        congSuatPhatDien,
                        soHoDanDuocCapNuoc,
                        cheDoKhaiThac,
                        ghiChu,
                    });
                }
            });

            const finalData = Object.values(groupedData);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const kiemTraluuLuongKhaiThacText = (MDSD, LLKT, row) => {
        const _mucDichSuDung = MDSD;
        const _luuLuong = LLKT;
        // Tách chuỗi thành mảng
        const danhSach = _luuLuong.split(";");
        // Kiểm tra lỗi
        let errors = [];
        // kiểm tra chuỗi có chứa số không
        const regex = /\d/;
        danhSach.forEach((item) => {
            // Loại bỏ khoảng trắng thừa
            const trimmedItem = item.trim();
            // Kiểm tra xem mục có số đi kèm không
            // if (!regex.test(trimmedItem)) {
            //     errors.push(`Giá trị lưu lượng tại "${trimmedItem}" không hợp lệ, thiếu giá trị lưu lượng.`);
            // }
            // nếu có mỗi số không thì báo phải có chữ đằng trước 
            if (!trimmedItem.match(/[a-zA-Z]/) && _mucDichSuDung?.length > 1 && !_mucDichSuDung.includes('Phát điện')) {
                errors.push(`Dòng ${row} Giá trị lưu lượng tại "${trimmedItem}" không hợp lệ, thiếu mục đích sử dụng.`);
            }
            // lấy ra giá trị số trong trimItem
            const numberLuuLuong = trimmedItem.match(/\d+/g);
            // nếu số lớn hơn 86400 thì báo lỗi
            if (parseInt(numberLuuLuong) > 86400) {
                errors.push(`Dòng ${row} Giá trị lưu lượng tại "${trimmedItem}" không hợp lệ, giá trị phải nhỏ hơn 86400.`);
            }
        });
        if (!_mucDichSuDung.includes('Phát điện') && _mucDichSuDung?.length > 1) {
            _mucDichSuDung.forEach((muc) => {
                // Kiểm tra trong danh sách có tồn tại mục đích sử dụng
                const isFound = danhSach.some((item) =>
                    item && item.trim().toLowerCase().includes(muc.trim().toLowerCase()) // Kiểm tra sự tồn tại
                );
                if (!isFound) {
                    errors.push(`Dòng ${row} Mục đích sử dụng "${muc}" tại lưu lượng khai thác bị thiếu hoặc sai chính tả.`);
                }
            });
        }
        if (errors.length > 0) {
            return errors.join('\n');
        } else {
            return false;
        }
    }
    const bieu18MappingMaxFile = (data) => {
        // Lấy tiêu đề các cột từ dòng đầu tiên
        try {
            const headerValues = Object.values(data[0]) || [];
            const resultsB18 = data || [];
            // bỏ đi dòng đầu của resultsB18
            resultsB18.shift();
            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const keywords = [
                'STT',
                'Mã tự đánh',
                'Số hiệu điểm',
                'Tên chủ hộ/ công trình',
                'Loại công trình KT-SD',
                'Tọa độ X',
                'Tọa độ Y',
                'Ấp/Khóm/Tổ dân phố',
                'Xã/Phường/Thị trấn',
                'Huyện',
                'Tỉnh',
                'Tên tổ chức, cá nhân quản lý',
                'Loại hình doanh nghiệp',
                'Tình hình cấp phép',
                'Số giấy phép',
                'Ngày cấp phép',
                'Thời gian cấp phép',
                'Cơ quan cấp',
                'Tên nguồn nước khai thác',
                'Lưu vực sông',
                'Nguồn nước khác',
                'Phương thức KT',
                'Chế độ khai thác (liên tục, gián đoạn, số giờ trên ngày)',
                'Ước tính lượng nước khai thác (m3/s)',
                'Mục đích sử dụng',
                'Cảm quan về chất lượng nước',
                'Năm xây dựng',
                'Năm hoạt động',
                'Dung tích hồ chứa TL (tr.m3)',
                'DT tưới hồ chứa TL (ha)',
                'DT tiêu hồ chứa TL (ha)',
                'Dung tích hồ chứa TĐ (tr.m3)',
                'DT mặt nước hồ chứa TĐ (ha)',
                'Số tổ máy hồ chứa TĐ',
                'Công suất máy hồ chứa TĐ',
                'DT nước mặt hồ - NTTS (ha)',
                'Diện tích NTTS (ha)',
                'Hình thức NTTS',
                'Lưu lượng NTTS (m3/s)',
                'Số máy trạm bơm',
                'Lưu lượng KT trạm bơm (m3/s)',
                'Cửa xả nước trạm bơm',
                'Số cửa lấy nước trạm bơm',
                'Lưu lượng cống (m3/s)',
                'DT tưới cống (ha)',
                'DT tiêu cống (ha)',
                'Số cửa cống',
                'Chiều cao đập dâng (m)',
                'Chiều dài đập dâng (m)',
                'Số cửa xả',
                'Một số thông tin khác về KT-SD',
                'Lắp đặt TB đo lượng nước KT-SD',
                'Quy trình vận hành',
                'Mô tả QTVH',
                'Nhiệt độ nước',
                'Độ pH',
                'Độ dẫn điện (mS/cm)',
                'Độ muối',
                'Độ đục',
                'Tổng khoáng hóa',
                'Một số thông tin về CLN',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];
            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });

            // Kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter((c) => c.index === -1);
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }

            let groupedDataArray = [];
            const errorMessages = [];
            const maInFileMap = new Map();
            const maIdCheckTrung = new Map();
            resultsB18.forEach((row, index) => {
                let hasError = false;
                // Lấy dữ liệu từ các cột tự động
                const soHieuDiem = getCellValueProcessed(
                    row,
                    'Số hiệu điểm',
                    columnMappings,
                    'string'
                );
                const tenCongTrinh = getCellValueProcessed(
                    row,
                    'Tên chủ hộ/ công trình',
                    columnMappings,
                    'string'
                );

                const vN2000x = getCellValueProcessed(
                    row,
                    'Tọa độ X',
                    columnMappings,
                    'number'
                );
                const vN2000y = getCellValueProcessed(
                    row,
                    'Tọa độ Y',
                    columnMappings,
                    'number'
                );
                const thonXom = getCellValueProcessed(
                    row,
                    'Ấp/Khóm/Tổ dân phố',
                    columnMappings,
                    'string'
                );
                const maTuDanh = getCellValueProcessed(
                    row,
                    'Mã tự đánh',
                    columnMappings,
                    'string'
                ); // Mã tự đánh không được để trống, nếu không có mã thì gán giá trị 'error' để

                if (maInFileMap.has(maTuDanh)) {
                    const duplicateIndex = maInFileMap.get(maTuDanh); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dòng ${index + 1} mã tự đánh: ${maTuDanh} bị trùng với dòng ${duplicateIndex + 1} cột Mã tự đánh`
                    );
                    hasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInFileMap.set(maTuDanh, index);
                }
                // tìm xã huyện tỉnh Id
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Xã/Phường/Thị trấn',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Huyện',
                    columnMappings,
                    'string'
                );

                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                // Lấy mã của phường/xã, quận/huyện, tỉnh/thành phố
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;

                const maCheckTrung = createKey(tenCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maIdCheckTrung.has(maCheckTrung)) {
                    const duplicateIndex = maIdCheckTrung.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} công trình: ${tenCongTrinh} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maIdCheckTrung.set(maCheckTrung, index);
                }
                const tenToChucCaNhanQuanLy = getCellValueProcessed(
                    row,
                    'Tên tổ chức, cá nhân quản lý',
                    columnMappings,
                    'string'
                );
                const loaiHinhDoanhNghiep = getCellValueProcessed(
                    row,
                    'Loại hình doanh nghiệp',
                    columnMappings,
                    'string'
                );
                // const coThongTinGiayPhep = [
                //     'đã cấp',
                //     'có',
                //     'đã cấp phép',
                //     'đã cấp giấy phép',
                //     'có giấy phép'
                // ].includes(
                //     getCellValueProcessed(
                //         row,
                //         'Tình hình cấp phép',
                //         columnMappings,
                //         'string'
                //     ).toLowerCase()
                // );
                // Xử lý cờ coThongTinGiayPhep
                const thongTinGiayPhep = {
                    soGiayPhep: getCellValueProcessed(
                        row,
                        'Số giấy phép',
                        columnMappings,
                        'string'
                    ),
                    ngayCapPhep: convertExcelDateToText(
                        getCellValueProcessed(
                            row,
                            'Ngày cấp phép',
                            columnMappings,
                            'number'
                        )
                    ),
                    thoiHanCapPhep: getCellValueProcessed(
                        row,
                        'Thời gian cấp phép',
                        columnMappings,
                        'string'
                    ),
                    coQuanCap: getCellValueProcessed(
                        row,
                        'Cơ quan cấp',
                        columnMappings,
                        'string'
                    ),
                };
                let coThongTinGiayPhep = false;
                /// nếu thongTinGiayCapPhep.soGiayPhep !=='' thì coThongTinGiayPhep = false
                if (thongTinGiayPhep.soGiayPhep !== '') {
                    coThongTinGiayPhep = true;
                }

                const tenSongSuoi = getCellValueProcessed(
                    row,
                    'Tên nguồn nước khai thác',
                    columnMappings,
                    'string'
                );
                const luuVucSong = getCellValueProcessed(
                    row,
                    'Lưu vực sông',
                    columnMappings,
                    'string'
                );
                const luuVucSongId = findLuuVucSongId(luuVucSong);
                const nguonNuocKhac = getCellValueProcessed(
                    row,
                    'Nguồn nước khác',
                    columnMappings,
                    'string'
                );
                const phuongThucKhaiThac = getCellValueProcessed(
                    row,
                    'Phương thức KT',
                    columnMappings,
                    'string'
                );
                const cheDoKhaiThac = getCellValueProcessed(
                    row,
                    'Chế độ khai thác (liên tục, gián đoạn, số giờ trên ngày)',
                    columnMappings,
                    'string'
                );
                const luuLuongKhaiThacText = getCellValueProcessed(
                    row,
                    'Ước tính lượng nước khai thác (m3/s)',
                    columnMappings,
                    'string'
                );
                const loaiCongTrinh = getCellValueProcessed(
                    row,
                    'Loại công trình KT-SD',
                    columnMappings,
                    'string'
                );
                // const loaiCongTrinhId = LCTs.find(item => item.tenMuc === loaiCongTrinh)?.maMuc || null;
                const loaiCongTrinhId = findLoaiCongTrinh(loaiCongTrinh);

                // const loaiCongTrinh = getCellValueProcessed(
                //     row,
                //     'Loại công trình KT-SD',
                //     columnMappings,
                //     'string'
                // )?.split(',');
                // const loaiCongTrinhId = splitAndMap(
                //     getCellValueProcessed(
                //         row,
                //         'Loại công trình KT-SD',
                //         columnMappings,
                //         'string'
                //     ),
                //     findLoaiCongTrinh
                // );
                //chuyển muc dich su dung sang  []
                const mucDichSuDungs = getCellValueProcessed(
                    row,
                    'Mục đích sử dụng',
                    columnMappings,
                    'string'
                )?.split(',');
                // nếu k tìm dc muc dich su dung thì trả về '' thêm vào mucDichSuDungIds
                const mucDichSuDungIds = splitAndMap(
                    getCellValueProcessed(
                        row,
                        'Mục đích sử dụng',
                        columnMappings,
                        'string'
                    ),
                    findMucDichSuDung
                );


                const camQuanVeChatLuongNuoc = getCellValueProcessed(
                    row,
                    'Cảm quan về chất lượng nước',
                    columnMappings,
                    'string'
                );
                const namXayDung = getCellValueProcessed(
                    row,
                    'Năm xây dựng',
                    columnMappings,
                    'number'
                );
                const namHoatDong = getCellValueProcessed(
                    row,
                    'Năm hoạt động',
                    columnMappings,
                    'number'
                );
                // Xử lý các thông số cho cacThongSo
                const cacThongSo = {
                    hoChuaTL: {
                        dungTich: getCellValueProcessed(
                            row,
                            'Dung tích hồ chứa TL (tr.m3)',
                            columnMappings,
                            'number'
                        ),
                        dungTichTuoi: getCellValueProcessed(
                            row,
                            'DT tưới hồ chứa TL (ha)',
                            columnMappings,
                            'number'
                        ),
                        dungTichTieu: getCellValueProcessed(
                            row,
                            'DT tiêu hồ chứa TL (ha)',
                            columnMappings,
                            'number'
                        ),
                    },
                    hoChuaTD: {
                        dungTich: getCellValueProcessed(
                            row,
                            'Dung tích hồ chứa TĐ (tr.m3)',
                            columnMappings,
                            'number'
                        ),
                        dienTichMatNuoc: getCellValueProcessed(
                            row,
                            'DT mặt nước hồ chứa TĐ (ha)',
                            columnMappings,
                            'number'
                        ),
                        soToMay: getCellValueProcessed(
                            row,
                            'Số tổ máy hồ chứa TĐ',
                            columnMappings,
                            'number'
                        ),
                        congSuatLapMay: getCellValueProcessed(
                            row,
                            'Công suất máy hồ chứa TĐ',
                            columnMappings,
                            'number'
                        ),
                    },
                    hoNTTS: {
                        dungTichMatNuoc: getCellValueProcessed(
                            row,
                            'DT nước mặt hồ - NTTS (ha)',
                            columnMappings,
                            'number'
                        ),
                        dungTichNuoi: getCellValueProcessed(
                            row,
                            'Diện tích NTTS (ha)',
                            columnMappings,
                            'number'
                        ),
                        hinhThucNuoi: getCellValueProcessed(
                            row,
                            'Hình thức NTTS',
                            columnMappings,
                            'string'
                        ),
                        luuLuong: getCellValueProcessed(
                            row,
                            'Lưu lượng NTTS (m3/s)',
                            columnMappings,
                            'number'
                        ),
                    },
                    tramBom: {
                        soMayBom: getCellValueProcessed(
                            row,
                            'Số máy trạm bơm',
                            columnMappings,
                            'number'
                        ),
                        luuLuongKT: getCellValueProcessed(
                            row,
                            'Lưu lượng KT trạm bơm (m3/s)',
                            columnMappings,
                            'number'
                        ),
                        cuaXaNuoc: getCellValueProcessed(
                            row,
                            'Cửa xả nước trạm bơm',
                            columnMappings,
                            'number'
                        ),
                        soCuaLayNuoc: getCellValueProcessed(
                            row,
                            'Số cửa lấy nước trạm bơm',
                            columnMappings,
                            'number'
                        ),
                    },
                    cong: {
                        luuLuong: getCellValueProcessed(
                            row,
                            'Lưu lượng cống (m3/s)',
                            columnMappings,
                            'number'
                        ),
                        dtTuoi: getCellValueProcessed(
                            row,
                            'DT tưới cống (ha)',
                            columnMappings,
                            'number'
                        ),
                        dtTieu: getCellValueProcessed(
                            row,
                            'DT tiêu cống (ha)',
                            columnMappings,
                            'number'
                        ),
                        soCuaCong: getCellValueProcessed(
                            row,
                            'Số cửa cống',
                            columnMappings,
                            'number'
                        ),
                    },
                    dapDang: {
                        chieuCao: getCellValueProcessed(
                            row,
                            'Chiều cao đập dâng (m)',
                            columnMappings,
                            'number'
                        ),
                        chieuDai: getCellValueProcessed(
                            row,
                            'Chiều dài đập dâng (m)',
                            columnMappings,
                            'number'
                        ),
                        soCuaXa: getCellValueProcessed(
                            row,
                            'Số cửa xả',
                            columnMappings,
                            'number'
                        ),
                    },
                    thongTinKhac: getCellValueProcessed(
                        row,
                        'Một số thông tin khác về KT-SD',
                        columnMappings,
                        'string'
                    ),
                };

                const lapDatThietBiDoLuongNuoc = getCellValueProcessed(
                    row,
                    'Lắp đặt TB đo lượng nước KT-SD',
                    columnMappings,
                    'string'
                );
                const coQuyTrinhVanHanh =
                    getCellValueProcessed(
                        row,
                        'Quy trình vận hành',
                        columnMappings,
                        'string'
                    ) === 'Có'.toLowerCase()
                        ? true
                        : false;
                const moTaQuyTrinhVanHanh = getCellValueProcessed(
                    row,
                    'Mô tả QTVH',
                    columnMappings,
                    'string'
                );

                const cacChiTieuChatLuong = {
                    nhietDo: getCellValueProcessed(
                        row,
                        'Nhiệt độ nước',
                        columnMappings,
                        'number'
                    ),
                    doPH: getCellValueProcessed(
                        row,
                        'Độ pH',
                        columnMappings,
                        'number'
                    ),
                    doDan: getCellValueProcessed(
                        row,
                        'Độ dẫn điện (mS/cm)',
                        columnMappings,
                        'number'
                    ),
                    doMuoi: getCellValueProcessed(
                        row,
                        'Độ muối',
                        columnMappings,
                        'number'
                    ),
                    doDuc: getCellValueProcessed(
                        row,
                        'Độ đục',
                        columnMappings,
                        'number'
                    ),
                    tongKhoangHoa: getCellValueProcessed(
                        row,
                        'Tổng khoáng hóa',
                        columnMappings,
                        'number'
                    ),
                    thongTinKhac: getCellValueProcessed(
                        row,
                        'Một số thông tin về CLN',
                        columnMappings,
                        'string'
                    ),
                };

                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );
                // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới

                //validate dữ liệu
                const errorConditions = [
                    {
                        condition: maTuDanh === '',
                        message: `Mã tự đánh không được để trống`,
                    },
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    // {
                    //     condition: phuongXa !== null && phuongXaId === null,
                    //     message: `Phường/xã sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    // {
                    //     condition: quanHuyen !== null && quanHuyenId === null,
                    //     message: `Quận/huyện sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: tenCongTrinh === '',
                        message: `Tên công trình không được để trống`,
                    },
                    {
                        condition: vN2000x === 'error',
                        message: `Tọa độ X phải là số`,
                    },
                    {
                        condition: vN2000y === 'error',
                        message: `Tọa độ Y phải là số`,
                    },
                    {
                        condition: vN2000x === '',
                        message: `Tọa độ X không được để trống`,
                    },
                    {
                        condition: vN2000y === '',
                        message: `Tọa độ Y không được để trống`,
                    },
                    {
                        condition:
                            ![6, 7].includes(vN2000x?.toString().split('.')[0].length),
                        message: `Tọa độ X phải có 6 số hoặc 7 số trước dấu phẩy`,
                    },
                    {
                        condition:
                            vN2000y?.toString().split('.')[0].length !== 6,
                        message: `Tọa độ Y phải có 6 số trước dấu phẩy`,
                    },
                    // { condition: loaiCongTrinhId.length === 0, message: `Loại công trình không được để trống` },
                    // { condition: loaiCongTrinhId.length !== 0 && loaiCongTrinh.length === 0, message: `Loại công trình không đúng định dạng` },
                    // { condition: mucDichSuDungIds.length === 0, message: `Mục đích sử dụng không được để trống` },
                    // { condition: mucDichSuDungIds.length !== 0 && mucDichSuDungs.length === 0, message: `Mục đích sử dụng không đúng định dạng` },
                    {
                        condition: luuVucSong === '',
                        message: `Lưu vực sông không được để trống`,
                    },
                    {
                        condition: luuLuongKhaiThacText === 'error',
                        message: `Lưu lượng KT (m3/ngày) phải là chữ`,
                    },
                    // {
                    //     condition:
                    //         coThongTinGiayPhep &&
                    //         thongTinGiayPhep.soGiayPhep === '',
                    //     message: `Số giấy phép không được để trống`,
                    // },
                    {
                        condition:
                            coThongTinGiayPhep &&
                            !isExcelDate(
                                getCellValueProcessed(
                                    row,
                                    'Ngày cấp phép',
                                    columnMappings,
                                    'number'
                                )
                            ),
                        message: `Ngày cấp phép không phải là ngày`,
                    },
                    {
                        condition:
                            coThongTinGiayPhep &&
                            thongTinGiayPhep.thoiHanCapPhep === '',
                        message: `Thời hạn cấp phép không được để trống`,
                    },
                    {
                        condition:
                            coThongTinGiayPhep && thongTinGiayPhep.coQuanCap === '',
                        message: `Cơ quan cấp không được để trống`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTL?.dungTich === 'error',
                        message: `Dung tích hồ chứa TL (tr.m3) phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTL?.dungTichTuoi === 'error',
                        message: `Dung tích tưới hồ chứa TL (tr.m3) phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTL?.dungTichTieu === 'error',
                        message: `DT tiêu hồ chứa TL (ha) phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTD?.dungTich === 'error',
                        message: `Dung tích hồ chứa TĐ (tr.m3) phải là số`,
                    },
                    {
                        condition:
                            cacThongSo?.hoChuaTD?.dungTichMatNuoc === 'error',
                        message: `DT mặt nước hồ chứa TĐ (ha) phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTD?.soToMay === 'error',
                        message: `Số tổ máy hồ chứa TĐ phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoChuaTD?.congSuatLapMay === 'error',
                        message: `Công suất máy hồ chứa TĐ phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoNTTS?.dungTichMatNuoc === 'error',
                        message: `DT nước mặt hồ - NTTS (ha) phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoNTTS?.dungTichNuoi === 'error',
                        message: `Diện tích NTTS phải là số`,
                    },
                    {
                        condition: cacThongSo?.hoNTTS?.luuLuong === 'error',
                        message: `Lưu lượng NTTS (m3/s) phải là số`,
                    },
                    {
                        condition: cacThongSo?.tramBom?.soMayBom === 'error',
                        message: `Số máy trạm bơm phải là số`,
                    },
                    {
                        condition: cacThongSo?.tramBom?.luuLuongKT === 'error',
                        message: `Lưu lượng KT trạm bơm (m3/s) phải là số`,
                    },
                    {
                        condition: cacThongSo?.tramBom?.soCuaLayNuoc === 'error',
                        message: `Số cửa lấy nước trạm bơm phải là số`,
                    },
                    {
                        condition: cacThongSo?.tramBom?.cuaXaNuoc === 'error',
                        message: `Cửa xả nước trạm bơm phải là số`,
                    },
                    {
                        condition: cacThongSo?.cong?.luuLuong === 'error',
                        message: `Lưu lượng cống (m3/s) phải là số`,
                    },
                    {
                        condition: cacThongSo?.cong?.dtTuoi === 'error',
                        message: `DT tưới cống (ha) phải là số`,
                    },
                    {
                        condition: cacThongSo?.cong?.dtTieu === 'error',
                        message: `DT tiêu cống (ha) phải là số`,
                    },
                    {
                        condition: cacThongSo?.cong?.soCuaCong === 'error',
                        message: `Số cửa cống phải là số`,
                    },
                    {
                        condition: cacThongSo?.dapDang?.chieuCao === 'error',
                        message: `Chiều cao đập dâng (m) phải là số`,
                    },
                    {
                        condition: cacThongSo?.dapDang?.chieuDai === 'error',
                        message: `Chiều dài đập dâng (m) phải là số`,
                    },
                    {
                        condition: cacThongSo?.dapDang?.soCuaXa === 'error',
                        message: `Số cửa xả phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.nhietDo === 'error',
                        message: `Nhiệt độ nước phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.doPH === 'error',
                        message: `Độ pH phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.doDan === 'error',
                        message: `Độ dẫn điện (mS/cm) phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.doMuoi === 'error',
                        message: `Độ muối phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.doDuc === 'error',
                        message: `Độ đục phải là số`,
                    },
                    {
                        condition: cacChiTieuChatLuong?.tongKhoangHoa === 'error',
                        message: `Tổng khoáng hóa phải là số`,
                    },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập không phải là ngày`,
                    },
                ];
                const ktraLuuLuong = kiemTraluuLuongKhaiThacText(mucDichSuDungs, luuLuongKhaiThacText, index + 1);
                if (ktraLuuLuong) {
                    errorMessages.push(ktraLuuLuong);
                }
                errorConditions.forEach((err) => {
                    if (err.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${err.message}`
                        );
                        hasError = true;
                    }
                });
                if (!hasError) {
                    const groupedData = {
                        maTuDanh,
                        soHieuDiem,
                        tenCongTrinh,
                        loaiCongTrinhId,
                        loaiCongTrinh,
                        vN2000x,
                        vN2000y,
                        thonXom,
                        phuongXa,
                        quanHuyen,
                        tinhThanh,
                        phuongXaId,
                        quanHuyenId,
                        tinhThanhId,
                        tenToChucCaNhanQuanLy,
                        loaiHinhDoanhNghiep,
                        coThongTinGiayPhep,
                        thongTinGiayPhep,
                        tenSongSuoi,
                        luuVucSong,
                        luuVucSongId,
                        nguonNuocKhac,
                        phuongThucKhaiThac,
                        mucDichSuDungs,
                        cheDoKhaiThac,
                        luuLuongKhaiThacText,
                        mucDichSuDungIds,
                        camQuanVeChatLuongNuoc,
                        namXayDung,
                        namHoatDong,
                        cacThongSo,
                        lapDatThietBiDoLuongNuoc,
                        coQuyTrinhVanHanh,
                        moTaQuyTrinhVanHanh,
                        cacChiTieuChatLuong,
                        nguoiCungCapThongTin,
                        canBoDieuTra,
                        nguoiLapBieu,
                        ngayLapBieu,
                    };
                    // Hiển thị thông báo lỗi nếu có
                    groupedDataArray.push(groupedData);
                }
            });

            const finalData = Object.values(groupedDataArray);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const bieu20MappingMaxFile = (data) => {
        // Lấy tiêu đề các cột từ dòng đầu tiên
        try {
            const headerValues = Object.values(data[0]) || [];
            const resultsB20 = data || [];
            // bỏ đi dòng đầu của resultsB20
            resultsB20.shift();
            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const keywords = [
                'STT',
                'Mã tự đánh',
                'Số hiệu điểm',
                'Tên chủ hộ/tên công trình',
                'Tọa độ X',
                'Tọa độ Y',
                'Loại công trình',
                'Tổ/thôn/ấp/khóm',
                'Phường/xã',
                'Thành phố/thị xã/huyện',
                'Tỉnh',
                'Thuộc khu/KCN',
                'Năm xây dựng',
                'Năm bắt đầu khai thác',
                'Mục đích sử dụng',
                'Lưu lượng khai thác (m3/ngày)',
                'Công trình cấp nước tập trung',
                'Số hộ sử dụng',
                'Phạm vi cấp nước',
                'Chiều sâu giếng (m)',
                'Đường kính giếng (mm)',
                'Chiều sâu lọc trên (m)',
                'Chiều sâu lọc dưới (m)',
                'Tầng chứa nước khai thác',
                'Mực nước tĩnh (m)',
                'Mực nước động (m)',
                'Lý do không đo được mực nước',
                'Sự biến đổi mực nước theo thời gian',
                'Loại máy bơm',
                'Công suất bơm',
                'Chiều sâu thả máy bơm chìm',
                'Chế độ khai thác (giờ/ngày)',
                'Chất lượng nước',
                'Màu nước',
                'Mùi nước',
                'Chỉ tiêu, diễn biến chất lượng khác',
                'Tình hình cấp phép',
                'Số giấy phép',
                'Ngày cấp phép',
                'Mô tả thông tin khác',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];

            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });

            // Kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter((c) => c.index === -1);
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }
            const maInFileMap = new Map();
            const maInCheckTrung = new Map();
            let groupedDataArray = [];
            const errorMessages = [];
            // Lấy dữ liệu từ các cột tự động nhận diện
            resultsB20.forEach((row, index) => {
                let hasError = false;
                // Lấy dữ liệu từ các cột tự động nhận diện
                const soHieuDiem = getCellValueProcessed(
                    row,
                    'Số hiệu điểm',
                    columnMappings,
                    'string'
                );
                const maTuDanh = getCellValueProcessed(
                    row,
                    'Mã tự đánh',
                    columnMappings,
                    'string'
                );

                if (maInFileMap.has(maTuDanh)) {
                    const duplicateIndex = maInFileMap.get(maTuDanh); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dòng ${index + 1} mã tự đánh: ${maTuDanh} bị trùng với dòng ${duplicateIndex + 1} cột Mã tự đánh`
                    );
                    hasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInFileMap.set(maTuDanh, index);
                }
                const tenChuHoHoacCongTrinh = getCellValueProcessed(
                    row,
                    'Tên chủ hộ/tên công trình',
                    columnMappings,
                    'string'
                );
                const vN2000x = getCellValueProcessed(
                    row,
                    'Tọa độ X',
                    columnMappings,
                    'number'
                );
                const vN2000y = getCellValueProcessed(
                    row,
                    'Tọa độ Y',
                    columnMappings,
                    'number'
                );

                const thonXom = getCellValueProcessed(
                    row,
                    'Tổ/thôn/ấp/khóm',
                    columnMappings,
                    'string'
                );
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Phường/xã',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Thành phố/thị xã/huyện',
                    columnMappings,
                    'string'
                );

                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                // Lấy mã của phường/xã, quận/huyện, tỉnh/thành phố
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;

                const maCheckTrung = createKey(tenChuHoHoacCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maInCheckTrung.has(maCheckTrung)) {
                    const duplicateIndex = maInCheckTrung.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInCheckTrung.set(maCheckTrung, index);
                }
                const KhuCumCongNghiep = getCellValueProcessed(
                    row,
                    'Thuộc khu/KCN',
                    columnMappings,
                    'string'
                );
                const namXayDung = getCellValueProcessed(
                    row,
                    'Năm xây dựng',
                    columnMappings,
                    'number'
                );
                const namKhaiThac = getCellValueProcessed(
                    row,
                    'Năm bắt đầu khai thác',
                    columnMappings,
                    'number'
                );

                // const loaiCongTrinh = getCellValueProcessed(
                //     row,
                //     'Loại công trình',
                //     columnMappings,
                //     'string'
                // )?.split(',');
                const loaiCongTrinh = getCellValueProcessed(
                    row,
                    'Loại công trình',
                    columnMappings,
                    'string'
                );
                // const loaiCongTrinhId = LCTs.find(item => item.tenMuc === loaiCongTrinh)?.maMuc || null;
                const loaiCongTrinhId = findLoaiCongTrinh(loaiCongTrinh);
                // const loaiCongTrinhId = splitAndMap(
                //     getCellValueProcessed(
                //         row,
                //         'Loại công trình',
                //         columnMappings,
                //         'string'
                //     ),
                //     findLoaiCongTrinh
                // );
                //chuyển muc dich su dung sang  []
                const mucDichSuDungs = getCellValueProcessed(
                    row,
                    'Mục đích sử dụng',
                    columnMappings,
                    'string'
                )?.split(',');
                // nếu k tìm dc muc dich su dung thì trả về '' thêm vào mucDichSuDungIds
                const mucDichSuDungIds = splitAndMap(
                    getCellValueProcessed(
                        row,
                        'Mục đích sử dụng',
                        columnMappings,
                        'string'
                    ),
                    findMucDichSuDung
                );

                const luuLuongKhaiThacText = getCellValueProcessed(
                    row,
                    'Lưu lượng khai thác (m3/ngày)',
                    columnMappings,
                    'string'
                );
                const congTrinhCapNuocTapTrung = getCellValueProcessed(
                    row,
                    'Công trình cấp nước tập trung',
                    columnMappings,
                    'string'
                );
                const soHoSuDung = getCellValueProcessed(
                    row,
                    'Số hộ sử dụng',
                    columnMappings,
                    'number'
                );
                const phamViCapNuoc = getCellValueProcessed(
                    row,
                    'Phạm vi cấp nước',
                    columnMappings,
                    'string'
                );

                const chieuSauGieng = getCellValueProcessed(
                    row,
                    'Chiều sâu giếng (m)',
                    columnMappings,
                    'number'
                );
                const duongKinhGieng = getCellValueProcessed(
                    row,
                    'Đường kính giếng (mm)',
                    columnMappings,
                    'number'
                );
                const chieuSauKhaiThacTu = getCellValueProcessed(
                    row,
                    'Chiều sâu lọc trên (m)',
                    columnMappings,
                    'number'
                );
                const chieuSauKhaiThacDen = getCellValueProcessed(
                    row,
                    'Chiều sâu lọc dưới (m)',
                    columnMappings,
                    'number'
                );

                const tangChuaNuocKhaiThac = getCellValueProcessed(
                    row,
                    'Tầng chứa nước khai thác',
                    columnMappings,
                    'string'
                );
                const mucNuocTinh = getCellValueProcessed(
                    row,
                    'Mực nước tĩnh (m)',
                    columnMappings,
                    'number'
                );
                const mucNuocDong = getCellValueProcessed(
                    row,
                    'Mực nước động (m)',
                    columnMappings,
                    'number'
                );
                const lyDoKhongDoDuoc = getCellValueProcessed(
                    row,
                    'Lý do không đo được mực nước',
                    columnMappings,
                    'string'
                );
                const suBienDoiMucNuoc = getCellValueProcessed(
                    row,
                    'Sự biến đổi mực nước theo thời gian',
                    columnMappings,
                    'string'
                );
                const loaiMayBom = getCellValueProcessed(
                    row,
                    'Loại máy bơm',
                    columnMappings,
                    'string'
                );
                const congSuatBom = getCellValueProcessed(
                    row,
                    'Công suất bơm',
                    columnMappings,
                    'string'
                );

                const chieuSauThaMayBom = getCellValueProcessed(
                    row,
                    'Chiều sâu thả máy bơm chìm',
                    columnMappings,
                    'number'
                );
                const cheDoKhaiThac = getCellValueProcessed(
                    row,
                    'Chế độ khai thác (giờ/ngày)',
                    columnMappings,
                    'string'
                );
                const loaiNuocDoChatLuong = getCellValueProcessed(
                    row,
                    'Chất lượng nước',
                    columnMappings,
                    'string'
                );
                const mauChatLuongNuoc = getCellValueProcessed(
                    row,
                    'Màu nước',
                    columnMappings,
                    'string'
                );
                const muiChatLuongNuoc = getCellValueProcessed(
                    row,
                    'Mùi nước',
                    columnMappings,
                    'string'
                );
                const chiTieuDienBienChatLuongKhac = getCellValueProcessed(
                    row,
                    'Chỉ tiêu, diễn biến chất lượng khác',
                    columnMappings,
                    'string'
                );

                // const coThongTinGiayPhep = [
                //     'đã cấp',
                //     'có',
                //     'đã cấp phép',
                //     'đã cấp giấy phép',
                // ].includes(
                //     getCellValueProcessed(
                //         row,
                //         'Tình hình cấp phép',
                //         columnMappings,
                //         'string'
                //     ).toLowerCase()
                // );
                let coThongTinGiayPhep = false;
                const soGiayPhep = getCellValueProcessed(
                    row,
                    'Số giấy phép',
                    columnMappings,
                    'string'
                );
                if (soGiayPhep !== '') {
                    coThongTinGiayPhep = true;
                }
                const ngayCapPhep = convertExcelDateToText(
                    getCellValueProcessed(
                        row,
                        'Ngày cấp phép',
                        columnMappings,
                        'number'
                    )
                );
                const moTaThongTin = getCellValueProcessed(
                    row,
                    'Mô tả thông tin khác',
                    columnMappings,
                    'string'
                );

                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );
                // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới

                //validate dữ liệu
                // tên công trình không để trống
                const errorConditions = [
                    {
                        condition: soHieuDiem === '',
                        message: `Số hiệu điểm không được để trống`,
                    },
                    {
                        condition: maTuDanh === '',
                        message: `Mã tự đánh không được để trống`,
                    },
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    // {
                    //     condition: phuongXa !== null && phuongXaId === null,
                    //     message: `Phường/xã sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    // {
                    //     condition: quanHuyen !== null && quanHuyenId === null,
                    //     message: `Quận/huyện sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: tenChuHoHoacCongTrinh === '',
                        message: `Tên công trình không được để trống`,
                    },
                    {
                        condition: vN2000x === 'error',
                        message: `Tọa độ X phải là số`,
                    },
                    {
                        condition: vN2000y === 'error',
                        message: `Tọa độ Y phải là số`,
                    },
                    {
                        condition: vN2000x === '',
                        message: `Tọa độ X không được để trống`,
                    },
                    {
                        condition: vN2000y === '',
                        message: `Tọa độ Y không được để trống`,
                    },
                    // {
                    //     condition:
                    //         vN2000x !== 'error' &&
                    //         vN2000x?.toString().split('.')[0].length !== 7,
                    //     message: `Tọa độ X phải có 7 số trước dấu phẩy`,
                    // },
                    {
                        condition:
                            ![6, 7].includes(vN2000x?.toString().split('.')[0].length),
                        message: `Tọa độ X phải có 6 số hoặc 7 số trước dấu phẩy`,
                    },
                    {
                        condition:
                            vN2000y?.toString().split('.')[0].length !== 6,
                        message: `Tọa độ Y phải có 6 số trước dấu phẩy`,
                    },
                    {
                        condition: namXayDung === 'error',
                        message: `Năm xây dựng phải là số`,
                    },
                    {
                        condition: namKhaiThac === 'error',
                        message: `Năm bắt đầu khai thác phải là số`,
                    },
                    {
                        condition: luuLuongKhaiThacText === 'error',
                        message: `Lưu lượng khai thác (m3/ngày) phải là số`,
                    },
                    {
                        condition: soHoSuDung === 'error',
                        message: `Số hộ sử dụng phải là số`,
                    },
                    {
                        condition: chieuSauGieng === 'error',
                        message: `Chiều sâu giếng (m) phải là số`,
                    },
                    {
                        condition: duongKinhGieng === 'error',
                        message: `Đường kính giếng (mm) phải là số`,
                    },
                    {
                        condition: chieuSauKhaiThacTu === 'error',
                        message: `Chiều sâu lọc trên (m) phải là số`,
                    },
                    {
                        condition: chieuSauKhaiThacDen === 'error',
                        message: `Chiều sâu lọc dưới (m) phải là số`,
                    },
                    {
                        condition: mucNuocTinh === 'error',
                        message: `Mực nước tĩnh (m) phải là số`,
                    },
                    {
                        condition: mucNuocDong === 'error',
                        message: `Mực nước động (m) phải là số`,
                    },
                    {
                        condition: chieuSauThaMayBom === 'error',
                        message: `Chiều sâu thả máy bơm chìm phải là số`,
                    },
                    {
                        condition: cheDoKhaiThac === 'error',
                        message: `Chế độ khai thác (giờ/ngày) phải là số`,
                    },
                    {
                        condition:
                            coThongTinGiayPhep &&
                            !isExcelDate(
                                getCellValueProcessed(
                                    row,
                                    'Ngày cấp phép',
                                    columnMappings,
                                    'number'
                                )
                            ),
                        message: `Ngày cấp phép phải là ngày`,
                    },
                    // {
                    //     condition: coThongTinGiayPhep && soGiayPhep === '',
                    //     message: `Số giấy phép không được để trống`,
                    // },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập phải là ngày`,
                    },
                ];
                errorConditions.forEach((error) => {
                    if (error.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${error.message}`
                        );
                        hasError = true;
                    }
                });

                if (!hasError) {
                    const groupedData = {
                        maTuDanh,
                        soHieuDiem,
                        tenChuHoHoacCongTrinh,
                        loaiCongTrinhId,
                        loaiCongTrinh,
                        vN2000x,
                        vN2000y,
                        thonXom,
                        phuongXa,
                        quanHuyen,
                        tinhThanh,
                        phuongXaId,
                        quanHuyenId,
                        tinhThanhId,
                        KhuCumCongNghiep,
                        namXayDung,
                        namKhaiThac,
                        mucDichSuDungs,
                        mucDichSuDungIds,
                        luuLuongKhaiThacText,
                        congTrinhCapNuocTapTrung,
                        soHoSuDung,
                        phamViCapNuoc,
                        chieuSauGieng,
                        duongKinhGieng,
                        chieuSauKhaiThacTu,
                        chieuSauKhaiThacDen,
                        tangChuaNuocKhaiThac,
                        mucNuocTinh,
                        mucNuocDong,
                        lyDoKhongDoDuoc,
                        suBienDoiMucNuoc,
                        loaiMayBom,
                        congSuatBom,
                        chieuSauThaMayBom,
                        cheDoKhaiThac,
                        loaiNuocDoChatLuong,
                        mauChatLuongNuoc,
                        muiChatLuongNuoc,
                        chiTieuDienBienChatLuongKhac,
                        coThongTinGiayPhep,
                        soGiayPhep,
                        ngayCapPhep,
                        moTaThongTin,
                        nguoiCungCapThongTin,
                        canBoDieuTra,
                        nguoiLapBieu,
                        ngayLapBieu,
                    };
                    // Hiển thị thông báo lỗi nếu có
                    groupedDataArray.push(groupedData);
                }
            });

            const finalData = Object.values(groupedDataArray);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const bieu22MappingMaxFile = (data) => {
        try {
            // Lấy tiêu đề các cột từ dòng đầu tiên
            const headerValues = Object.values(data[0]) || [];
            const resultsB22 = data || [];
            // bỏ đi dòng đầu của resultsB22
            resultsB22.shift();
            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const keywords = [
                'STT',
                'Mã tự đánh',
                'Số hiệu điểm',
                'Tên cơ sở/ chủ hộ sản xuất',
                'Tọa độ X',
                'Tọa độ Y',
                'Ấp/Khóm/Tổ dân phố',
                'Xã/Phường/Thị trấn',
                'Huyện',
                'Tỉnh',
                'Tên sông điều tra',
                'Lĩnh vực sản xuất',
                'Công suất sản xuất',
                'Tình trạng hoạt động',
                'Có giấy phép XT',
                'Số giấy phép',
                'Ngày cấp phép',
                'Thời gian cấp phép',
                'Cơ quan cấp',
                'Lượng nước SD (m3/ngày)',
                'Cho SH (m3/ngày)',
                'Cho SX (m3/ngày)',
                'Nguồn nước SD',
                'Tên nguồn nước SD',
                'Loại hình nước thải',
                'Lượng nước XT trung bình (m3/h)',
                'Lượng nước XT lớn nhất (m3/h)',
                'Lượng nước thải (m3/ngày)',
                'Phương thức xả thải',
                'Chế độ xả nước thải',
                'Thời gian xả thải',
                'Màu nước XTSXL',
                'Mùi nước XTSXL',
                'pH nước XTSXL',
                'DO nước XTSXL (ml/g)',
                'Nhiệt độ nước XTSXL (oC)',
                'Độ dẫn điện nước XTSXL (mS/cm)',
                'TT khác về NXTSXL',
                'Hệ thông xử lý NT',
                'Công suất xử lý nước thải (m3/ngày)',
                'Nguồn tiếp nhận nước thải',
                'Loại hình cửa xả',
                'LL XT1 (m3/ngày)',
                'Số hiệu XT1',
                'Tọa độ X vị trí XT1',
                'Tọa độ Y vị trí XT1',
                'LL XT2 (m3/ngày)',
                'Số hiệu XT2',
                'Tọa độ X vị trí XT2',
                'Tọa độ Y vị trí XT2',
                'LL XT3 (m3/ngày)',
                'Số hiệu XT3',
                'Tọa độ X vị trí XT3',
                'Tọa độ Y vị trí XT3',
                'Độ sâu của nguồn nước ở KV tiếp nhật NT (m)',
                'Tốc độ dòng chảy tại KV tiếp nhận NT (m/s)',
                'Màu nước tại HT',
                'Mùi nước tại HT',
                'pH nước tại HT',
                'DO nước tại HT (ml/g)',
                'Nhiệt độ nước tại HT (oC)',
                'Độ dẫn điện nước tại HT (mS/cm)',
                'TT khác về Ntại HT',
                'Tình hình quan trắn, đo CLN',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];

            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });

            // Kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter((c) => c.index === -1);
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }

            let groupedDataArray = [];
            const errorMessages = [];
            const maInFileMap = new Map();
            const maIdCheckTrung = new Map();
            resultsB22.forEach((row, index) => {
                let hasError = false;
                // Lấy dữ liệu từ các cột tự động nhận diện
                const soHieuDiem = getCellValueProcessed(
                    row,
                    'Số hiệu điểm',
                    columnMappings,
                    'string'
                );
                const maTuDanh = getCellValueProcessed(
                    row,
                    'Mã tự đánh',
                    columnMappings,
                    'string'
                );
                if (maInFileMap.has(maTuDanh)) {
                    const duplicateIndex = maInFileMap.get(maTuDanh); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dòng ${index + 1} mã tự đánh: ${maTuDanh} bị trùng với dòng ${duplicateIndex + 1} cột Mã tự đánh`
                    );
                    hasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInFileMap.set(maTuDanh, index);
                }
                const tenChuHoHoacCongTrinh = getCellValueProcessed(
                    row,
                    'Tên cơ sở/ chủ hộ sản xuất',
                    columnMappings,
                    'string'
                );
                const vN2000x = getCellValueProcessed(
                    row,
                    'Tọa độ X',
                    columnMappings,
                    'number'
                );
                const vN2000y = getCellValueProcessed(
                    row,
                    'Tọa độ Y',
                    columnMappings,
                    'number'
                );
                const thonXom = getCellValueProcessed(
                    row,
                    'Ấp/Khóm/Tổ dân phố',
                    columnMappings,
                    'string'
                );
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Xã/Phường/Thị trấn',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Huyện',
                    columnMappings,
                    'string'
                );

                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                // Lấy mã của phường/xã, quận/huyện, tỉnh/thành phố
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;
                const maCheckTrung = createKey(tenChuHoHoacCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maIdCheckTrung.has(maCheckTrung)) {
                    const duplicateIndex = maIdCheckTrung.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} công trình: ${tenChuHoHoacCongTrinh} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maIdCheckTrung.set(maCheckTrung, index);
                }
                const tenSong = getCellValueProcessed(
                    row,
                    'Tên sông điều tra',
                    columnMappings,
                    'string'
                );
                const linhVucSanXuat = getCellValueProcessed(
                    row,
                    'Lĩnh vực sản xuất',
                    columnMappings,
                    'string'
                );
                const congSuatSanXuat = getCellValueProcessed(
                    row,
                    'Công suất sản xuất',
                    columnMappings,
                    'string'
                );
                const tinhTrangHoatDong = getCellValueProcessed(
                    row,
                    'Tình trạng hoạt động',
                    columnMappings,
                    'string'
                );
                // const coThongTinGiayPhep = [
                //     'đã cấp',
                //     'có',
                //     'có cấp phép',
                //     'đã cấp phép',
                //     'đã cấp giấy phép',
                // ].includes(
                //     getCellValueProcessed(
                //         row,
                //         'Có giấy phép XT',
                //         columnMappings,
                //         'string'
                //     ).toLowerCase()
                // );
                let coThongTinGiayPhep = false;
                const soGiayPhep = getCellValueProcessed(
                    row,
                    'Số giấy phép',
                    columnMappings,
                    'string'
                );
                if (soGiayPhep !== '') {
                    coThongTinGiayPhep = true;
                }
                const ngayCapPhep = convertExcelDateToText(
                    getCellValueProcessed(
                        row,
                        'Ngày cấp phép',
                        columnMappings,
                        'number'
                    )
                );
                const thoiHanCapPhep = getCellValueProcessed(
                    row,
                    'Thời gian cấp phép',
                    columnMappings,
                    'string'
                );
                const coQuanCapPhep = getCellValueProcessed(
                    row,
                    'Cơ quan cấp',
                    columnMappings,
                    'string'
                );
                const luongNuocSuDung = getCellValueProcessed(
                    row,
                    'Lượng nước SD (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const luongNuocSinhHoat = getCellValueProcessed(
                    row,
                    'Cho SH (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const luongNuocSanXuat = getCellValueProcessed(
                    row,
                    'Cho SX (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const loaiNguonNuocSuDung = getCellValueProcessed(
                    row,
                    'Nguồn nước sử dụng',
                    columnMappings,
                    'string'
                );
                const tenNguonNuocSuDung = getCellValueProcessed(
                    row,
                    'Tên nguồn nước SD',
                    columnMappings,
                    'string'
                );
                const loaiHinhNuocThai = getCellValueProcessed(
                    row,
                    'Loại hình nước thải',
                    columnMappings,
                    'string'
                );
                const loaiHinhNuocThaiId = findLoaiHinhNuocThai(loaiHinhNuocThai);
                const luongNuocXaThaiTrungBinh = getCellValueProcessed(
                    row,
                    'Lượng nước XT trung bình (m3/h)',
                    columnMappings,
                    'number'
                );
                const luongNuocXaThaiLonNhat = getCellValueProcessed(
                    row,
                    'Lượng nước XT lớn nhất (m3/h)',
                    columnMappings,
                    'number'
                );
                const tongLuongNuocXaThai = getCellValueProcessed(
                    row,
                    'Lượng nước thải (m3/ngày)',
                    columnMappings,
                    'number'
                );
                const phuongThucXaThai = getCellValueProcessed(
                    row,
                    'Phương thức xả thải',
                    columnMappings,
                    'string'
                );
                const cheDoNuocXaThai = getCellValueProcessed(
                    row,
                    'Chế độ xả nước thải',
                    columnMappings,
                    'string'
                );
                const thoiGianXaThai = getCellValueProcessed(
                    row,
                    'Thời gian xả thải',
                    columnMappings,
                    'string'
                );
                const chatLuongNuocThai = {
                    chatLuongMauNuoc: getCellValueProcessed(
                        row,
                        'Màu nước XTSXL',
                        columnMappings,
                        'string'
                    ),
                    chatLuongMuiNuoc: getCellValueProcessed(
                        row,
                        'Mùi nước XTSXL',
                        columnMappings,
                        'string'
                    ),
                    chiSopH: getCellValueProcessed(
                        row,
                        'pH nước XTSXL',
                        columnMappings,
                        'number'
                    ),
                    chiSoDO: getCellValueProcessed(
                        row,
                        'DO nước XTSXL (ml/g)',
                        columnMappings,
                        'number'
                    ),
                    nhietDoNuoc: getCellValueProcessed(
                        row,
                        'Nhiệt độ nước XTSXL (oC)',
                        columnMappings,
                        'number'
                    ),
                    doDanDienNuoc: getCellValueProcessed(
                        row,
                        'Độ dẫn điện nước XTSXL (mS/cm)',
                        columnMappings,
                        'number'
                    ),
                    chiSoKhac: getCellValueProcessed(
                        row,
                        'TT khác về NXTSXL',
                        columnMappings,
                        'string'
                    ),
                };
                const coHeThongXuLyNuocThai =
                    getCellValueProcessed(
                        row,
                        'Hệ thông xử lý NT',
                        columnMappings,
                        'string'
                    ).toLowerCase() === 'Có'.toLowerCase()
                        ? true
                        : false;
                const congSuatXuLyNuocThai = getCellValueProcessed(
                    row,
                    'Công suất xử lý nước thải (m3/ngày)',
                    columnMappings,
                    'number'
                );
                // const soDoHeThongXuLyNuocThai = getCellValue(row, columnMappings[39]);
                const nguonTiepNhanNuocThai = getCellValueProcessed(
                    row,
                    'Nguồn tiếp nhận nước thải',
                    columnMappings,
                    'string'
                );
                const loaiHinhCuaXa = getCellValueProcessed(
                    row,
                    'Loại hình cửa xả',
                    columnMappings,
                    'string'
                );
                const viTriXaThais = [
                    {
                        luuLuongXa: getCellValueProcessed(
                            row,
                            'LL XT1 (m3/ngày)',
                            columnMappings,
                            'number'
                        ),
                        soHieuDiemXa: getCellValueProcessed(
                            row,
                            'Số hiệu XT1',
                            columnMappings,
                            'string'
                        ),
                        vN2000x: getCellValueProcessed(
                            row,
                            'Tọa độ X vị trí XT1',
                            columnMappings,
                            'number'
                        ),
                        vN2000y: getCellValueProcessed(
                            row,
                            'Tọa độ Y vị trí XT1',
                            columnMappings,
                            'number'
                        ),
                    },
                    {
                        luuLuongXa: getCellValueProcessed(
                            row,
                            'LL XT2 (m3/ngày)',
                            columnMappings,
                            'number'
                        ),
                        soHieuDiemXa: getCellValueProcessed(
                            row,
                            'Số hiệu XT2',
                            columnMappings,
                            'string'
                        ),
                        vN2000x: getCellValueProcessed(
                            row,
                            'Tọa độ X vị trí XT2',
                            columnMappings,
                            'number'
                        ),
                        vN2000y: getCellValueProcessed(
                            row,
                            'Tọa độ Y vị trí XT2',
                            columnMappings,
                            'number'
                        ),
                    },
                    {
                        luuLuongXa: getCellValueProcessed(
                            row,
                            'LL XT3 (m3/ngày)',
                            columnMappings,
                            'number'
                        ),
                        soHieuDiemXa: getCellValueProcessed(
                            row,
                            'Số hiệu XT3',
                            columnMappings,
                            'string'
                        ),
                        vN2000x: getCellValueProcessed(
                            row,
                            'Tọa độ X vị trí XT3',
                            columnMappings,
                            'number'
                        ),
                        vN2000y: getCellValueProcessed(
                            row,
                            'Tọa độ Y vị trí XT3',
                            columnMappings,
                            'number'
                        ),
                    },
                ];
                const doSauMucNuoc = getCellValueProcessed(
                    row,
                    'Độ sâu của nguồn nước ở KV tiếp nhật NT (m)',
                    columnMappings,
                    'number'
                );
                const tocDoDongChay = getCellValueProcessed(
                    row,
                    'Tốc độ dòng chảy tại KV tiếp nhận NT (m/s)',
                    columnMappings,
                    'number'
                );
                const chatLuongNuocTaiHienTruong = {
                    chatLuongMauNuoc: getCellValueProcessed(
                        row,
                        'Màu nước tại HT',
                        columnMappings,
                        'string'
                    ),
                    chatLuongMuiNuoc: getCellValueProcessed(
                        row,
                        'Mùi nước tại HT',
                        columnMappings,
                        'string'
                    ),
                    chiSopH: getCellValueProcessed(
                        row,
                        'pH nước tại HT',
                        columnMappings,
                        'number'
                    ),
                    chiSoDO: getCellValueProcessed(
                        row,
                        'DO nước tại HT (ml/g)',
                        columnMappings,
                        'number'
                    ),
                    nhietDoNuoc: getCellValueProcessed(
                        row,
                        'Nhiệt độ nước tại HT (oC)',
                        columnMappings,
                        'number'
                    ),
                    doDanDienNuoc: getCellValueProcessed(
                        row,
                        'Độ dẫn điện nước tại HT (mS/cm)',
                        columnMappings,
                        'number'
                    ),
                    chiSoKhac: getCellValueProcessed(
                        row,
                        'TT khác về Ntại HT',
                        columnMappings,
                        'string'
                    ),
                };
                const tinhHinhQuanTracDoDac = getCellValueProcessed(
                    row,
                    'Tình hình quan trắn, đo CLN',
                    columnMappings,
                    'string'
                );
                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );
                // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới
                //validate dữ liệu
                // tên công trình không để trống
                const errorConditions = [

                    {
                        condition: maTuDanh === '',
                        message: `Mã tự đánh không được để trống`,
                    },
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    // {
                    //     condition: phuongXa !== null && phuongXaId === null,
                    //     message: `Phường/xã sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    // {
                    //     condition: quanHuyen !== null && quanHuyenId === null,
                    //     message: `Quận/huyện sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: tenChuHoHoacCongTrinh === '',
                        message: `Tên công trình không được để trống`,
                    },
                    {
                        condition: vN2000x === 'error',
                        message: `Tọa độ X phải là số`,
                    },
                    {
                        condition: vN2000y === 'error',
                        message: `Tọa độ Y phải là số`,
                    },
                    {
                        condition: vN2000x === '',
                        message: `Tọa độ X không được để trống`,
                    },
                    {
                        condition: vN2000y === '',
                        message: `Tọa độ Y không được để trống`,
                    },
                    // { condition: loaiHinhNuocThai === '', message: `Loại hình nước thải không được để trống` },
                    // { condition: loaiHinhNuocThai !== '' && loaiHinhNuocThaiId === '', message: `Loại hình nước thải không đúng định dạng` },
                    // {
                    //     condition: vN2000x?.toString().split('.')[0].length !== 7,
                    //     message: `Tọa độ X phải có 7 số trước dấu phẩy`,
                    // },
                    {
                        condition: ![6, 7].includes(vN2000x?.toString().split('.')[0].length),
                        message: `Tọa độ X phải có 6 số hoặc 7 số trước dấu phẩy`,
                    },
                    {
                        condition: vN2000y?.toString().split('.')[0].length !== 6,
                        message: `Tọa độ Y phải có 6 số trước dấu phẩy`,
                    },
                    {
                        condition: luongNuocSuDung === 'error',
                        message: `Lượng nước sử dụng (m3/ngày) phải là số`,
                    },
                    {
                        condition: luongNuocSinhHoat === 'error',
                        message: `Cho SH (m3/ngày) phải là số`,
                    },
                    {
                        condition: luongNuocSanXuat === 'error',
                        message: `Cho SX (m3/ngày) phải là số`,
                    },
                    {
                        condition: luongNuocXaThaiTrungBinh === 'error',
                        message: `Lượng nước XT trung bình (m3/h) phải là số`,
                    },
                    {
                        condition: luongNuocXaThaiLonNhat === 'error',
                        message: `Lượng nước XT lớn nhất (m3/h) phải là số`,
                    },
                    {
                        condition: tongLuongNuocXaThai === 'error',
                        message: `Tổng lượng nước xả phải là số`,
                    },
                    {
                        condition: doSauMucNuoc === 'error',
                        message: `Độ sâu của nguồn nước ở KV tiếp nhật NT (m) phải là số`,
                    },
                    {
                        condition: tocDoDongChay === 'error',
                        message: `Tốc độ dòng chảy tại KV tiếp nhận NT (m/s) phải là số`,
                    },
                    {
                        condition: chatLuongNuocThai.chiSopH === 'error',
                        message: `Chi sô pH nước XTSXL phải là số`,
                    },
                    {
                        condition: chatLuongNuocThai.chiSoDO === 'error',
                        message: `DO nước XTSXL (ml/g) phải là số`,
                    },
                    {
                        condition: chatLuongNuocThai.nhietDoNuoc === 'error',
                        message: `Nhiệt độ nước XTSXL (oC) phải là số`,
                    },
                    {
                        condition: chatLuongNuocThai.doDanDienNuoc === 'error',
                        message: `Độ dẫn điện nước XTSXL (mS/cm) phải là số`,
                    },
                    {
                        condition: congSuatXuLyNuocThai === 'error',
                        message: `Công suất xử lý nước thải (m3/ngày) phải là số`,
                    },
                    {
                        condition:
                            coThongTinGiayPhep &&
                            !isExcelDate(
                                getCellValueProcessed(
                                    row,
                                    'Ngày cấp phép',
                                    columnMappings,
                                    'number'
                                )
                            ),
                        message: `Ngày cấp phép phải là ngày`,
                    },
                    {
                        condition: coThongTinGiayPhep && thoiHanCapPhep === '',
                        message: `Thời gian cấp phép không được để trống`,
                    },
                    {
                        condition: coThongTinGiayPhep && coQuanCapPhep === '',
                        message: ` Cơ quan cấp không được để trống`,
                    },
                    {
                        condition: viTriXaThais[0].luuLuongXa === 'error',
                        message: `LL XT1 phải là số`,
                    },
                    {
                        condition: viTriXaThais[0].vN2000x === 'error',
                        message: `Tọa độ X vị trí XT1 phải là số`,
                    },
                    {
                        condition: viTriXaThais[0].vN2000y === 'error',
                        message: `Tọa độ Y vị trí XT1 phải là số`,
                    },
                    {
                        condition: viTriXaThais[1].luuLuongXa === 'error',
                        message: `LL XT2 phải là số`,
                    },
                    {
                        condition: viTriXaThais[1].vN2000x === 'error',
                        message: `Tọa độ X vị trí XT2 phải là số`,
                    },
                    {
                        condition: viTriXaThais[1].vN2000y === 'error',
                        message: `Tọa độ Y vị trí XT2 phải là số`,
                    },
                    {
                        condition: viTriXaThais[2].luuLuongXa === 'error',
                        message: `LL XT3 phải là số`,
                    },
                    {
                        condition: viTriXaThais[2].vN2000x === 'error',
                        message: `Tọa độ X vị trí XT3 phải là số`,
                    },
                    {
                        condition: viTriXaThais[2].vN2000y === 'error',
                        message: `Tọa độ Y vị trí XT3 phải là số`,
                    },
                    {
                        condition: chatLuongNuocTaiHienTruong?.chiSopH === 'error',
                        message: `Chi sô pH nước tại HT phải là số`,
                    },
                    {
                        condition: chatLuongNuocTaiHienTruong?.chiSoDO === 'error',
                        message: `DO nước tại HT (ml/g) phải là số`,
                    },
                    {
                        condition:
                            chatLuongNuocTaiHienTruong?.nhietDoNuoc === 'error',
                        message: `Nhiệt độ nước tại HT (oC) phải là số`,
                    },
                    {
                        condition:
                            chatLuongNuocTaiHienTruong?.doDanDienNuoc === 'error',
                        message: `Độ dẫn điện nước tại HT (mS/cm) phải là số`,
                    },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập phải là ngày`,
                    },
                ];
                errorConditions.forEach((error) => {
                    if (error.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${error.message}`
                        );
                        hasError = true;
                    }
                });
                if (!hasError) {
                    const groupedData = {
                        soHieuDiem,
                        maTuDanh,
                        tenChuHoHoacCongTrinh,
                        vN2000x,
                        vN2000y,
                        thonXom,
                        phuongXa,
                        quanHuyen,
                        tinhThanh,
                        phuongXaId,
                        quanHuyenId,
                        tinhThanhId,
                        tenSong,
                        linhVucSanXuat,
                        congSuatSanXuat,
                        tinhTrangHoatDong,
                        coThongTinGiayPhep,
                        soGiayPhep,
                        ngayCapPhep,
                        thoiHanCapPhep,
                        coQuanCapPhep,
                        luongNuocSuDung,
                        luongNuocSinhHoat,
                        luongNuocSanXuat,
                        loaiNguonNuocSuDung,
                        tenNguonNuocSuDung,
                        loaiHinhNuocThai,
                        loaiHinhNuocThaiId,
                        luongNuocXaThaiTrungBinh,
                        luongNuocXaThaiLonNhat,
                        tongLuongNuocXaThai,
                        phuongThucXaThai,
                        cheDoNuocXaThai,
                        thoiGianXaThai,
                        chatLuongNuocThai,
                        coHeThongXuLyNuocThai,
                        congSuatXuLyNuocThai,
                        nguonTiepNhanNuocThai,
                        loaiHinhCuaXa,
                        viTriXaThais,
                        doSauMucNuoc,
                        tocDoDongChay,
                        chatLuongNuocTaiHienTruong,
                        tinhHinhQuanTracDoDac,
                        nguoiCungCapThongTin,
                        canBoDieuTra,
                        nguoiLapBieu,
                        ngayLapBieu,
                    };
                    // Hiển thị thông báo lỗi nếu có
                    groupedDataArray.push(groupedData);
                }
            });

            const finalData = Object.values(groupedDataArray);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        } catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const bieu17Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: resultsB17 } = getAllHeadersByIndex(_data, 0, 1);
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tên chủ hộ/công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Tên chủ hộ/công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Thôn, ấp, tổ dân phố,…'
                    ),
                    message: 'Dữ liệu thiếu cột Thôn, ấp, tổ dân phố,…',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Loại công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Loại công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tên nguồn nước khai thác'
                    ),
                    message: 'Dữ liệu thiếu cột Tên nguồn nước khai thác',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'mục đích sử dụng'
                    ),
                    message: 'Dữ liệu thiếu cột mục đích sử dụng',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Ước tính lượng nước khai thác (m3/ngày)'
                    ),
                    message:
                        'Dữ liệu thiếu cột Ước tính lượng nước khai thác (m3/ngày)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Diện tích tưới (ha)'
                    ),
                    message: 'Dữ liệu thiếu cột Diện tích tưới (ha)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Diện tích nuôi trồng thủy sản (ha)'
                    ),
                    message: 'Dữ liệu thiếu cột Diện tích nuôi trồng thủy sản (ha)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Công xuất phát điện (KW)'
                    ),
                    message: 'Dữ liệu thiếu cột Công xuất phát điện (KW)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Số hộ dân được cấp nước'
                    ),
                    message: 'Dữ liệu thiếu cột Số hộ được dân cấp nước',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Chế độ khai thác'
                    ),
                    message: 'Dữ liệu thiếu cột Chế độ khai thác',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Ghi chú'),
                    message: 'Dữ liệu thiếu cột Ghi chú',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // let congTrinhMap = new Map();
            const hoHoacCongTrinhs = resultsB17.map((i, index) => {
                // let rowError = false
                // const checkTrungKey = i?.[1];
                // if (congTrinhMap.has(checkTrungKey)) {
                //     const duplicateIndex = congTrinhMap.get(checkTrungKey);
                //     errorMessagesAll.push(`tên công trình dòng ${index + 1} bị trùng với dòng ${duplicateIndex + 1}`);
                //     rowError = true;
                //     return null;
                // }
                // if (!rowError) {
                //     congTrinhMap.set(checkTrungKey, index);
                return {
                    stt: convertDataImport(i?.[0], 'String'),
                    tenChuHoHoacCongTrinh: convertDataImport(i?.[1], 'String'),
                    thonXom: convertDataImport(i?.[2], 'String'),
                    // loaiCongTrinhId:
                    //     i?.[3] && typeof i?.[3] === 'string'
                    //         ? i?.[3]
                    //             .split(',')
                    //             .map((tenMuc) =>
                    //                 findLoaiCongTrinh(tenMuc.trim())
                    //             )
                    //         : [],
                    // loaiCongTrinh: i?.[3]?.split(',') || [],
                    loaiCongTrinh: convertDataImport(i?.[3], 'String'),
                    loaiCongTrinhId: findLoaiCongTrinh(i?.[3]),
                    tenNguonNuoc: convertDataImport(i?.[4], 'String'),
                    ...autoMappingMdsd(i?.[5]?.split(",")?.map(i => i?.trim())),
                    luuLuongKhaiThacText: i?.[6],
                    dienTichTuoi: strToNumber(i?.[7]),
                    dienTichNuoiTrongThuySan: strToNumber(i?.[8]),
                    congSuatPhatDien: strToNumber(i?.[9]),
                    soHoDanDuocCapNuoc: strToNumber(i?.[10]),
                    cheDoKhaiThac: convertDataImport(i?.[11], 'String'),
                    ghiChu: convertDataImport(i?.[12], 'String'),
                    indexOnBieuMau: i?.[13],
                    isDeleted: removeVietnameseTones(i?.[14]) === ('co') ? true : false,
                };
                // }
                // return null;
            });
            // .filter(Boolean);
            return {
                hoHoacCongTrinhs,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        } catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    const findMucDichSuDung = (mucDichSuDung) => {
        const mucDichList = MDSDs;
        const mucDichMap = mucDichList.reduce((acc, item) => {
            acc[item.tenMuc.toLowerCase()] = item.maMuc;
            return acc;
        }, {});
        // Kiểm tra và trả về chuỗi rỗng nếu mucDichSuDung không hợp lệ
        if (!mucDichSuDung || typeof mucDichSuDung !== 'string') {
            return '';
        }
        // Nếu mucDichSuDung là mã mục hợp lệ, trả về chính nó
        const isValidMaMuc = Object.values(mucDichMap).includes(mucDichSuDung);
        if (isValidMaMuc) {
            return mucDichSuDung;
        }
        // Nếu không, tìm mã mục dựa trên tên mục
        return mucDichMap[mucDichSuDung.toLowerCase()] || '';
    };
    const findLoaiHinhNuocThai = (loaiHinhNuocThai) => {
        const loaiHinhNuocThaiList = LHNTs;
        const loaiHinhNuocThaiMap = loaiHinhNuocThaiList.reduce((acc, item) => {
            acc[item.tenMuc.toLowerCase()] = item.maMuc;
            return acc;
        }, {});

        return loaiHinhNuocThaiMap[loaiHinhNuocThai.toLowerCase()] || '';
    };
    const findLoaiCongTrinh = (loaiHinhNuocThai) => {
        const loaiCongTrinhList = LCTs;
        const loaiCongTrinhMap = loaiCongTrinhList.reduce((acc, item) => {
            acc[item.tenMuc.toLowerCase()] = item.maMuc;
            return acc;
        }, {});
        // Kiểm tra và trả về chuỗi rỗng nếu loaiHinhNuocThai không hợp lệ
        if (!loaiHinhNuocThai || typeof loaiHinhNuocThai !== 'string') {
            return '';
        }
        // Nếu loaiHinhNuocThai là mã mục hợp lệ, trả về chính nó
        const isValidMaMuc = Object.values(loaiCongTrinhMap).includes(loaiHinhNuocThai);
        if (isValidMaMuc) {
            return loaiHinhNuocThai;
        }
        // Nếu không, tìm mã mục dựa trên tên mục
        return loaiCongTrinhMap[loaiHinhNuocThai.toLowerCase()] || '';
    };

    const findLoaiCongTrinhNhieu = (loaiCongTrinh) => {
        const loaiCongTrinhList = LCTs;
        const loaiCongTrinhMap = loaiCongTrinhList.reduce((acc, item) => {
            acc[item.tenMuc.toLowerCase()] = item.maMuc;
            return acc;
        }, {});

        // Kiểm tra và trả về chuỗi rỗng nếu loaiCongTrinh không hợp lệ
        if (!loaiCongTrinh || typeof loaiCongTrinh !== 'string') {
            return '';
        }

        return loaiCongTrinhMap[loaiCongTrinh.toLowerCase()] || '';
    };

    const bieu19Mapping = (data) => {
        try {
            const _data = handleFormat(data);
            const { data: resultsB19 } = getAllHeadersByIndex(_data, 0, 1);
            const errorMessagesAll = [];
            const errorConditions = [
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Chủ hộ/ tên công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Chủ hộ/ tên công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Thôn, ấp, tổ dân phố,…'
                    ),
                    message: 'Dữ liệu thiếu cột Thôn, ấp, tổ dân phố,…',
                },
                {
                    condition: !checkColumnExists1Chieu(_data, 0, 'Số lượng giếng'),
                    message: 'Dữ liệu thiếu cột Số lượng giếng',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Lượng nước khai thác ước tính (m3/ngày)'
                    ),
                    message:
                        'Dữ liệu thiếu cột Lượng nước khai thác ước tính (m3/ngày)',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Loại công trình'
                    ),
                    message: 'Dữ liệu thiếu cột Loại công trình',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Hình thức khai thác'
                    ),
                    message: 'Dữ liệu thiếu cột Hình thức khai thác',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Chiều sâu khai thác'
                    ),
                    message: 'Dữ liệu thiếu cột Chiều sâu khai thác',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Mục đích sử dụng'
                    ),
                    message: 'Dữ liệu thiếu cột Mục đích sử dụng',
                },
                {
                    condition: !checkColumnExists1Chieu(
                        _data,
                        0,
                        'Tình trạng sử dụng (có/không)'
                    ),
                    message: 'Dữ liệu thiếu cột Tình trạng sử dụng (có/không)',
                },
            ];
            errorConditions.forEach((i) => {
                if (i.condition) {
                    errorMessagesAll.push(i.message);
                }
            });
            const errorMessages = errorMessagesAll.join('\n');
            if (errorMessages) {
                return {
                    errorMessages,
                    error: true,
                };
            }
            // let congTrinhMap = new Map();
            const hoHoacCongTrinhs = resultsB19
                .map((i, index) => {
                    // let rowError = false
                    // const checkTrungKey = i?.[1];
                    // if (congTrinhMap.has(checkTrungKey)) {
                    //     const duplicateIndex = congTrinhMap.get(checkTrungKey);
                    //     errorMessagesAll.push(`tên công trình dòng ${index + 1} bị trùng với dòng ${duplicateIndex + 1}`);
                    //     rowError = true;
                    //     return null;
                    // }
                    // if (!rowError) {
                    //     congTrinhMap.set(checkTrungKey, index);
                    return {
                        stt:
                            convertDataImport(i?.[0], 'String'),
                        tenChuHoHoacCongTrinh: convertDataImport(i?.[1], 'String'),
                        thonXom: convertDataImport(i?.[2], 'String'),
                        soLuongGieng: strToNumber(i?.[3]),
                        luuLuongKhaiThacText: i?.[4] || 0,
                        // loaiCongTrinhId: i?.[5]
                        //     ? i?.[5]
                        //         .split(',')
                        //         .map((tenMuc) =>
                        //             findLoaiCongTrinh(tenMuc.trim())
                        //         )
                        //     : [],

                        // loaiCongTrinh: i?.[5]?.split(',') || [],
                        loaiCongTrinh: convertDataImport(i?.[5], 'String'),
                        loaiCongTrinhId: findLoaiCongTrinh(i?.[5]),
                        hinhThucKhaiThac: convertDataImport(i?.[6], 'String'),
                        chieuSauKhaiThac: typeof i?.[7] === 'number' ? i?.[7] : 0,
                        ...autoMappingMdsd(i?.[8]?.split(",")?.map(i => i?.trim())),
                        tinhTrangSuDung: convertDataImport(i?.[9], 'String') || 'Không',
                        indexOnBieuMau: i?.[10],
                        isDeleted: removeVietnameseTones(i?.[11]) === ('co') ? true : false,
                    };
                    // }
                    // return null;
                });
            // .filter(Boolean);
            return {
                hoHoacCongTrinhs,
                error: false,
                errorMessages: errorMessagesAll.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };
    // hàm convert text-> number
    const convertTextToNumber = (text) => {
        if (text === '') {
            return 0;
        }
        const number = Number(text);
        // Kiểm tra nếu giá trị không phải là số
        if (isNaN(number)) {
            return 'error';
        }

        return number;
    };
    const bieu19MappingMaxFile = (data) => {
        try {
            const headerValues = Object.values(data[0]) || [];
            const resultsB19 = data || [];
            // Bỏ đi dòng đầu của resultsB19
            resultsB19.shift();

            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const keywords = [
                'Phường/xã',
                'Thành phố/thị xã/huyện',
                'Tỉnh',
                'STT',
                'Tên chủ hộ/tên công trình',
                'Tổ/thôn/ấp/khóm',
                'Loại công trình',
                'Số lượng giếng',
                'Mục đích sử dụng',
                'Lưu lượng khai thác (m3/ngày)',
                'Chiều sâu giếng (m)',
                'Hình thức công trình',
                'Tình trạng sử dụng (có/ không)',
                'Người cung cấp thông tin',
                'Cán bộ điều tra',
                'Người nhập',
                'Ngày nhập',
            ];

            // Tìm các chỉ số cột dựa trên tiêu đề chứa từ khóa
            const columnMappings = keywords.map((keyword) => {
                const index = headerValues.findIndex(
                    (header) =>
                        typeof header === 'string' &&
                        header.toLowerCase().includes(keyword.toLowerCase())
                );
                return { name: keyword, index: index >= 0 ? index : -1 };
            });

            // Kiểm tra cột không tìm thấy
            const missingColumns = columnMappings.filter((c) => c.index === -1);
            if (missingColumns.length > 0) {
                return {
                    error: true,
                    message: missingColumns.map(c => `Không tìm thấy cột ${c.name}`).join('\n'),
                };
            }

            const groupedData = {};
            const errorMessages = [];
            const maInFileMap = new Map();
            resultsB19.forEach((row, index) => {
                let rowHasError = false;
                // Kiểm tra các dữ liệu bắt buộc
                const tinhThanhValue = getCellValueProcessed(
                    row,
                    'Tỉnh',
                    columnMappings,
                    'string'
                );
                const phuongXaValue = getCellValueProcessed(
                    row,
                    'Phường/xã',
                    columnMappings,
                    'string'
                );
                const quanHuyenValue = getCellValueProcessed(
                    row,
                    'Thành phố/thị xã/huyện',
                    columnMappings,
                    'string'
                );

                const dataViTriHanhChinh = findViTriHanhChinh(phuongXaValue, quanHuyenValue, tinhThanhValue, index + 1);
                // Lấy mã của phường/xã, quận/huyện, tỉnh/thành phố
                const tinhThanh = dataViTriHanhChinh.dataViTri.tinhThanh;
                const quanHuyen = dataViTriHanhChinh.dataViTri.quanHuyen;
                const phuongXa = dataViTriHanhChinh.dataViTri.phuongXa;
                const phuongXaId = dataViTriHanhChinh.dataViTri.phuongXaId;
                const quanHuyenId = dataViTriHanhChinh.dataViTri.quanHuyenId;
                const tinhThanhId = dataViTriHanhChinh.dataViTri.tinhThanhId;

                const key = `${tinhThanh}-${quanHuyen}-${phuongXa}`;
                const stt = getCellValueProcessed(
                    row,
                    'STT',
                    columnMappings,
                    'string'
                );
                const tenChuHoHoacCongTrinh = getCellValueProcessed(
                    row,
                    'Tên chủ hộ/tên công trình',
                    columnMappings,
                    'string'
                );
                const maCheckTrung = createKey(tenChuHoHoacCongTrinh + phuongXa + quanHuyen + tinhThanh);
                if (maInFileMap.has(maCheckTrung)) {
                    const duplicateIndex = maInFileMap.get(maCheckTrung); // Lấy dòng đã bị trùng trước đó
                    errorMessages.push(
                        `Dữ liệu dòng ${index + 1} công trình: ${tenChuHoHoacCongTrinh} bị trùng với dòng ${duplicateIndex + 1} `
                    );
                    // rowHasError = true;
                } else {
                    // Lưu lại giá trị và chỉ số dòng hiện tại vào Map
                    maInFileMap.set(maCheckTrung, index);
                }
                const thonXom = getCellValueProcessed(
                    row,
                    'Tổ/thôn/ấp/khóm',
                    columnMappings,
                    'string'
                );
                const loaiCongTrinh = getCellValueProcessed(
                    row,
                    'Loại công trình',
                    columnMappings,
                    'string'
                );
                const loaiCongTrinhId = findLoaiCongTrinh(loaiCongTrinh);
                // const loaiCongTrinh = getCellValueProcessed(
                //     row,
                //     'Loại công trình',
                //     columnMappings,
                //     'string'
                // )?.split(',');
                // const loaiCongTrinhId = splitAndMap(
                //     getCellValueProcessed(
                //         row,
                //         'Loại công trình',
                //         columnMappings,
                //         'string'
                //     ),
                //     findLoaiCongTrinh
                // );
                //chuyển muc dich su dung sang  []
                const mucDichSuDungs = getCellValueProcessed(
                    row,
                    'Mục đích sử dụng',
                    columnMappings,
                    'string'
                )?.split(',');
                // nếu k tìm dc muc dich su dung thì trả về '' thêm vào mucDichSuDungIds
                const mucDichSuDungIds = splitAndMap(
                    getCellValueProcessed(
                        row,
                        'Mục đích sử dụng',
                        columnMappings,
                        'string'
                    ),
                    findMucDichSuDung
                );
                const soLuongGieng = convertTextToNumber(
                    getCellValueProcessed(
                        row,
                        'Số lượng giếng',
                        columnMappings,
                        'number'
                    )
                );
                const luuLuongKhaiThacText = getCellValueProcessed(
                    row,
                    'Lưu lượng khai thác (m3/ngày)',
                    columnMappings,
                    'string'
                );
                const chieuSauKhaiThac = convertTextToNumber(
                    getCellValueProcessed(
                        row,
                        'Chiều sâu giếng (m)',
                        columnMappings,
                        'number'
                    )
                );
                const hinhThucKhaiThac = getCellValueProcessed(
                    row,
                    'Hình thức công trình',
                    columnMappings,
                    'string'
                );
                const tinhTrangSuDung = getCellValueProcessed(
                    row,
                    'Tình trạng sử dụng (có/ không)',
                    columnMappings,
                    'string'
                );
                const nguoiCungCapThongTin = getCellValueProcessed(
                    row,
                    'Người cung cấp thông tin',
                    columnMappings,
                    'string'
                );
                const canBoDieuTra = getCellValueProcessed(
                    row,
                    'Cán bộ điều tra',
                    columnMappings,
                    'string'
                );
                const nguoiLapBieu = getCellValueProcessed(
                    row,
                    'Người nhập',
                    columnMappings,
                    'string'
                );
                const ngayLapBieu = getCellValueProcessed(
                    row,
                    'Ngày nhập',
                    columnMappings,
                    'date'
                );

                const errorConditions = [
                    {
                        condition: !phuongXa,
                        message: `Phường/xã không được để trống`,
                    },
                    {
                        condition: !quanHuyen,
                        message: `Quận/huyện không được để trống`,
                    },
                    {
                        condition: !tinhThanh,
                        message: `Tỉnh/thành không được để trống`,
                    },
                    // {
                    //     condition: phuongXa !== null && phuongXaId === null,
                    //     message: `Phường/xã sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    // {
                    //     condition: quanHuyen !== null && quanHuyenId === null,
                    //     message: `Quận/huyện sai chính tả hoặc không có trong danh mục hành chính`,
                    // },
                    {
                        condition: tinhThanh !== null && tinhThanhId === null,
                        message: `Tỉnh/thành sai chính tả hoặc không có trong danh mục hành chính`,
                    },
                    {
                        condition: tenChuHoHoacCongTrinh === '',
                        message: `Tên công trình không được để trống`,
                    },
                    {
                        condition: soLuongGieng === 'error',
                        message: `Số lượng giếng phải là số`,
                    },
                    {
                        condition: luuLuongKhaiThacText === 'error',
                        message: `Lưu lượng khai thác phải là chữ`,
                    },
                    {
                        condition: chieuSauKhaiThac === 'error',
                        message: `Chiều sâu khai thác phải là số`,
                    },
                    {
                        condition: !isExcelDate(
                            getCellValueProcessed(
                                row,
                                'Ngày nhập',
                                columnMappings,
                                'number'
                            )
                        ),
                        message: `Ngày nhập không phải là ngày`,
                    },
                ];
                errorConditions.forEach((error) => {
                    if (error.condition) {
                        errorMessages.push(
                            `Dữ liệu bị lỗi tại dòng ${index + 1}, cột ${error.message}`
                        );
                        rowHasError = true;
                    }
                });
                // Nếu không có lỗi, thêm vào danh sách các dòng hợp lệ
                if (!rowHasError) {
                    // Nếu chưa có nhóm dữ liệu cho key này, khởi tạo nhóm mới
                    if (!groupedData[key]) {
                        groupedData[key] = {
                            tinhThanh,
                            quanHuyen,
                            phuongXa,
                            tinhThanhId,
                            quanHuyenId,
                            phuongXaId,
                            nguoiCungCapThongTin,
                            canBoDieuTra,
                            nguoiLapBieu,
                            ngayLapBieu,
                            hoHoacCongTrinhs: [],
                        };
                    }

                    // Thêm dữ liệu vào nhóm hoHoacCongTrinhs
                    groupedData[key].hoHoacCongTrinhs.push({
                        stt,
                        tenChuHoHoacCongTrinh,
                        thonXom,
                        loaiCongTrinhId,
                        loaiCongTrinh,
                        soLuongGieng,
                        mucDichSuDungIds,
                        mucDichSuDungs,
                        luuLuongKhaiThacText,
                        chieuSauKhaiThac,
                        hinhThucKhaiThac,
                        tinhTrangSuDung,
                    });
                }
            });

            const finalData = Object.values(groupedData);
            return {
                error: false,
                message: finalData,
                messageError: errorMessages?.join('\n'),
            };
        }
        catch (error) {
            return {
                errorMessages: error.message || 'Dữ liệu không đúng cấu trúc',
                error: true,
            };
        }
    };

    const handleFileChange = async (e, callback) => {
        try {
            const file = e.target.files[0];
            e.target.value = null;
            if (!file) {
                throw new Error('Không có file được chọn');
            }
            if (file.size > 10 * 1024 * 1024) {
                throw new Error(
                    'File quá lớn, vui lòng chọn file nhỏ hơn 10MB'
                );
            }
            // Kiểm tra định dạng file (chỉ cho phép .xlsx)
            const validFileTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ];
            if (!validFileTypes.includes(file.type)) {
                throw new Error('Sai định dạng file');
            }

            const results = await readXlsxFile(file);
            if (!results || results.length === 0) {
                throw new Error('File không chứa dữ liệu');
            }
            // Sử dụng map để tạo mảng dữ liệu
            const data = results.map((row) => row);
            callback?.(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    // Hàm kiểm tra nếu là mảng thì sẽ xử lý, nếu không thì trả về chuỗi rỗng
    const isArray = (arr) => (Array.isArray(arr) ? arr : []);
    // Hàm áp dụng style cho các ô


    const exportToExcel = async (excelData, loaiBieuMau) => {
        try {
            // Tạo một workbook và worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data');

            // Định nghĩa các tiêu đề cột
            const columns = Object.keys(excelData[0] || {}).map(key => ({
                header: key,
                key: key,
                width: 15 // Cài đặt chiều rộng cột
            }));
            worksheet.columns = columns;

            // Thêm dữ liệu vào worksheet
            excelData.forEach((rowData) => {
                const row = worksheet.addRow(rowData);
                row.eachCell((cell) => {
                    // Thêm kiểu dáng cho mỗi ô dữ liệu
                    cell.font = { size: 11 }; // Kích thước chữ
                    cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Căn giữa
                    cell.border = { // Kẻ viền cho từng ô
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Kẻ viền cho tiêu đề cột
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, size: 11 }; // Kiểu chữ cho tiêu đề
                cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Căn giữa
                cell.border = { // Kẻ viền cho tiêu đề
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Kẻ viền cho tất cả các ô trong worksheet
            const totalRows = worksheet.rowCount; // Số hàng hiện có trong worksheet
            const totalColumns = worksheet.columnCount; // Số cột hiện có trong worksheet

            for (let i = 1; i <= totalRows; i++) {
                const row = worksheet.getRow(i);
                for (let j = 1; j <= totalColumns; j++) {
                    const cell = row.getCell(j);
                    cell.border = { // Kẻ viền cho ô
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            }

            // Đặt tên và lưu file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `${loaiBieuMau || ''}Max.xlsx`);

            // Thông báo thành công
            toast.success('Xuất file thành công', {
                icon: <Check />,
            });
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };


    const convertToTimestamp = (dateString) => {
        if (!dateString) return null; // Kiểm tra chuỗi rỗng hoặc null

        const [day, month, year] = dateString.split('/');

        // Tạo đối tượng Date với thứ tự: năm, tháng (trừ 1 vì tháng bắt đầu từ 0), ngày
        const dateObject = new Date(year, month - 1, day);

        // Trả về giá trị timestamp của đối tượng Date (số mili giây từ 1/1/1970)
        return dateObject.getTime();
    };
    const exportToExcelDTKK = (data) => {
        if (data?.dataExcel?.length === 0) {
            toast.error('Không có dữ liệu để xuất file', {
                icon: '🚫',
            });
            return;
        }
        switch (data?.bieuMau) {
            case 'BieuMauSo17':
                exportToExcel17(data);
                break;
            case 'BieuMauSo19':
                exportToExcel19(data);
                break;
            case 'BieuMauSo21':
                exportToExcel21(data);
                break;
            case 'BieuMauSo18':
                exportToExcel18(data);
                break;
            case 'BieuMauSo20':
                exportToExcel20(data);
                break;
            case 'BieuMauSo22':
                exportToExcel22(data);
                break;
            default:
                toast.error('Không tìm thấy biểu mẫu', {
                    icon: '🚫',
                });
        }
    };

    const exportToExcel17 = (data) => {
        try {
            const excelData = data?.dataExcel?.map((item, index) => ({
                STT: index + 1,
                'Tên chủ hộ/ công trình': item.tenChuHoHoacCongTrinh,
                'Ấp/Khóm/Tổ dân phố': item.thonXom,
                'Xã/Phường/Thị trấn': item.phuongXa,
                Huyện: item.quanHuyen,
                Tỉnh: item.tinhThanh,
                // 'Loại Công Trình': isArray(item.loaiCongTrinh).join(', '),
                'Loại Công Trình': item.loaiCongTrinh,
                'Tên nguồn nước khai thác': item.tenNguonNuoc,
                'Mục Đích Sử Dụng': isArray(item.mucDichSuDungs).join(', '),
                'Ước tính lượng nước khai thác (m3/ngày)':
                    item.luuLuongKhaiThacText,
                'Diện tích tưới (ha)': item.dienTichTuoi,
                'Diện tích NTTS (ha)': item.dienTichNuoiTrongThuySan,
                'Công suất phát điện (KW)': item.congSuatPhatDien,
                'Số hộ dân được cấp nước': item.soHoDanDuocCapNuoc,
                'Chế độ khai thác': item.cheDoKhaiThac,
                'Ghi Chú': item.ghiChu,
                'Người cung cấp thông tin':
                    item?.nguoiCungCapThongTin,
                'Cán bộ điều tra': item?.canBoDieuTra,
                'Người nhập': item?.nguoiLapBieu,
                'Ngày nhập': item?.ngayLapBieu
                    ? new Date(item?.ngayLapBieu) || ''
                    : '',
                // 'Id hệ thống': item.indexOnBieuMau,
                // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
            }));
            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    const exportToExcel19 = (data) => {
        try {
            const excelData = data?.dataExcel?.map((item, index) => ({
                STT: index + 1,
                'Tên chủ hộ/tên công trình': item.tenChuHoHoacCongTrinh,
                'Tổ/thôn/ấp/khóm': item.thonXom,
                'Phường/xã': item.phuongXa,
                'Thành phố/thị xã/huyện': item.quanHuyen,
                Tỉnh: item.tinhThanh,
                'Số lượng giếng': item.soLuongGieng,
                'Mục đích sử dụng': isArray(item.mucDichSuDungs).join(', '),
                'Lưu lượng khai thác (m3/ngày)': item.luuLuongKhaiThacText,
                // 'Loại công trình': isArray(item.loaiCongTrinh).join(', '),
                'Loại công trình': item.loaiCongTrinh,
                'Chiều sâu giếng (m)': item.chieuSauKhaiThac,
                'Hình thức công trình': item.hinhThucKhaiThac,
                'Tình trạng sử dụng (có/ không)': item.tinhTrangSuDung || "Không",
                'Người cung cấp thông tin':
                    item?.nguoiCungCapThongTin,
                'Cán bộ điều tra': item?.canBoDieuTra,
                'Người nhập': item?.nguoiLapBieu,
                'Ngày nhập': item?.ngayLapBieu
                    ? new Date(item?.ngayLapBieu) || ''
                    : '',
                // 'Id hệ thống': item.indexOnBieuMau,
                // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
            }));
            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    const exportToExcel21 = (data) => {
        try {
            const excelData = data?.dataExcel?.map((item, index) => ({
                STT: index + 1,
                'Tên cơ sở/ chủ hộ sản xuất': item.tenChuHoHoacCongTrinh,
                'Ấp/Khóm/Tổ dân phố': item.thonXom,
                'Xã/Phường/Thị trấn': item.phuongXa,
                Huyện: item.quanHuyen,
                Tỉnh: item.tinhThanh,
                'Loại hình nước thải': item.loaiHinhNuocThai,
                'Quy mô cơ sở hộ sản xuất': item.quyMoLoaiHinhNuocThai,
                'Nguồn nước sử dụng': item.nguonNuocSuDung,
                'Lượng nước SD (m3/ngày)': item.luongNuocSuDung,
                'Lượng nước thải (m3/ngày)': item.luuLuongNuocThai,
                'Nguồn tiếp nhận nước thải': item.nguonTiepNhanNuocThai,
                'Thông tin khác': item.thongTinKhac,
                'Người cung cấp thông tin':
                    item?.nguoiCungCapThongTin,
                'Cán bộ điều tra': item?.canBoDieuTra,
                'Người nhập': item?.nguoiLapBieu,
                'Ngày nhập': item?.ngayLapBieu
                    ? new Date(item?.ngayLapBieu) || ''
                    : '',
                // 'Id hệ thống': item.indexOnBieuMau,
                // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
            }));
            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    const exportToExcel18 = (data) => {
        // chỉ lấy những data có data.dataExcel[].bieuMauSo18
        try {
            const excelData = data?.dataExcel
                // ?.filter((item) => item?.bieuMauSo18)
                .map((item, index) => ({
                    STT: index + 1,
                    'Số hiệu điểm': item?.bieuMauSo18?.soHieuDiem,
                    'Mã tự đánh': item?.bieuMauSo18?.maTuDanh,
                    'Tên chủ hộ/ công trình': item?.bieuMauSo18?.tenCongTrinh,
                    'Tọa độ X': item?.bieuMauSo18?.vN2000x,
                    'Tọa độ Y': item?.bieuMauSo18?.vN2000y,
                    'Ấp/Khóm/Tổ dân phố': item?.bieuMauSo18?.thonXom,
                    'Xã/Phường/Thị trấn': item?.bieuMauSo18?.phuongXa,
                    'Huyện': item?.bieuMauSo18?.quanHuyen,
                    "Tỉnh": item?.bieuMauSo18?.tinhThanh,
                    'Tên tổ chức, cá nhân quản lý':
                        item?.bieuMauSo18?.tenToChucCaNhanQuanLy,
                    'Loại hình doanh nghiệp':
                        item?.bieuMauSo18?.loaiHinhDoanhNghiep,
                    'Tình hình cấp phép': item?.bieuMauSo18?.coThongTinGiayPhep
                        ? 'Đã cấp'
                        : 'Chưa cấp',
                    'Số giấy phép':
                        item?.bieuMauSo18?.thongTinGiayPhep?.soGiayPhep,
                    'Ngày cấp phép': item?.bieuMauSo18?.thongTinGiayPhep
                        ?.ngayCapPhep
                        ? new Date(
                            convertToTimestamp(
                                item?.bieuMauSo18?.thongTinGiayPhep
                                    ?.ngayCapPhep
                            )
                        ) || ''
                        : '',
                    'Thời gian cấp phép':
                        item?.bieuMauSo18?.thongTinGiayPhep?.thoiHanCapPhep,
                    'Cơ quan cấp':
                        item?.bieuMauSo18?.thongTinGiayPhep?.coQuanCap,
                    'Tên nguồn nước khai thác': item?.bieuMauSo18?.tenSongSuoi,
                    'Lưu vực sông': item?.bieuMauSo18?.luuVucSong,
                    'Nguồn nước khác': item?.bieuMauSo18?.nguonNuocKhac,
                    'Phương thức KT': item?.bieuMauSo18?.phuongThucKhaiThac,
                    'Chế độ khai thác (liên tục, gián đoạn, số giờ trên ngày)': item?.bieuMauSo18?.cheDoKhaiThac,
                    'Ước tính lượng nước khai thác (m3/s)':
                        item?.bieuMauSo18?.luuLuongKhaiThacText,
                    'Loại công trình KT-SD':
                        // item?.bieuMauSo18?.loaiCongTrinh?.join(', '),
                        item?.bieuMauSo18?.loaiCongTrinh,
                    'Mục đích sử dụng':
                        item?.bieuMauSo18?.mucDichSuDungs?.join(', '),
                    'Cảm quan về chất lượng nước':
                        item?.bieuMauSo18?.camQuanVeChatLuongNuoc,
                    'Năm xây dựng': item?.bieuMauSo18?.namXayDung,
                    'Năm hoạt động': item?.bieuMauSo18?.namHoatDong,
                    'Dung tích hồ chứa TL (tr.m3)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTL?.dungTich,
                    'DT tưới hồ chứa TL (ha)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTL?.dungTichTuoi,
                    'DT tiêu hồ chứa TL (ha)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTL?.dungTichTieu,
                    'Dung tích hồ chứa TĐ (tr.m3)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD?.dungTich,
                    'DT mặt nước hồ chứa TĐ (ha)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD
                            ?.dienTichMatNuoc,
                    'Số tổ máy hồ chứa TĐ':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD?.soToMay,
                    'Công suất máy hồ chứa TĐ':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD?.congSuatLapMay,
                    'DT nước mặt hồ - NTTS (ha)':
                        item?.bieuMauSo18?.cacThongSo?.hoNTTS?.dungTichMatNuoc,
                    'Diện tích NTTS (ha)':
                        item?.bieuMauSo18?.cacThongSo?.hoNTTS?.dungTichNuoi,
                    'Hình thức NTTS':
                        item?.bieuMauSo18?.cacThongSo?.hoNTTS?.hinhThucNuoi,
                    'Lưu lượng NTTS (m3/s)':
                        item?.bieuMauSo18?.cacThongSo?.hoNTTS?.luuLuong,
                    'Số máy trạm bơm':
                        item?.bieuMauSo18?.cacThongSo?.tramBom?.soMayBom,
                    'Lưu lượng KT trạm bơm (m3/s)':
                        item?.bieuMauSo18?.cacThongSo?.tramBom?.luuLuongKT,
                    'Cửa xả nước trạm bơm':
                        item?.bieuMauSo18?.cacThongSo?.tramBom?.cuaXaNuoc,
                    'Số cửa lấy nước trạm bơm':
                        item?.bieuMauSo18?.cacThongSo?.tramBom?.soCuaLayNuoc,
                    'Lưu lượng cống (m3/s)':
                        item?.bieuMauSo18?.cacThongSo?.cong?.luuLuong,
                    'DT tưới cống (ha)':
                        item?.bieuMauSo18?.cacThongSo?.cong?.dtTuoi,
                    'DT tiêu cống (ha)':
                        item?.bieuMauSo18?.cacThongSo?.cong?.dtTieu,
                    'Số cửa cống':
                        item?.bieuMauSo18?.cacThongSo?.cong?.soCuaCong,
                    'Chiều cao đập dâng (m)':
                        item?.bieuMauSo18?.cacThongSo?.dapDang?.chieuCao,
                    'Chiều dài đập dâng (m)':
                        item?.bieuMauSo18?.cacThongSo?.dapDang?.chieuDai,
                    'Số cửa xả':
                        item?.bieuMauSo18?.cacThongSo?.dapDang?.soCuaXa,
                    'Một số thông tin khác về KT-SD':
                        item?.bieuMauSo18?.cacThongSo?.thongTinKhac,
                    'Lắp đặt TB đo lượng nước KT-SD':
                        item?.bieuMauSo18?.lapDatThietBiDoLuongNuoc,
                    'Quy trình vận hành': item?.bieuMauSo18?.coQuyTrinhVanHanh
                        ? 'Có'
                        : 'Không',
                    'Mô tả QTVH': item?.bieuMauSo18?.moTaQuyTrinhVanHanh,
                    'Nhiệt độ nước':
                        item?.bieuMauSo18?.cacChiTieuChatLuong?.nhietDo,
                    'Độ pH': item?.bieuMauSo18?.cacChiTieuChatLuong?.doPH,
                    'Độ dẫn điện (mS/cm)':
                        item?.bieuMauSo18?.cacChiTieuChatLuong?.doDan,
                    'Độ muối': item?.bieuMauSo18?.cacChiTieuChatLuong?.doMuoi,
                    'Độ đục': item?.bieuMauSo18?.cacChiTieuChatLuong?.doDuc,
                    'Tổng khoáng hóa':
                        item?.bieuMauSo18?.cacChiTieuChatLuong?.tongKhoangHoa,
                    'Một số thông tin về CLN':
                        item?.bieuMauSo18?.cacChiTieuChatLuong?.thongTinKhac,
                    'Người cung cấp thông tin':
                        item?.bieuMauSo18?.nguoiCungCapThongTin,
                    'Cán bộ điều tra': item?.bieuMauSo18?.canBoDieuTra,
                    'Người nhập': item?.bieuMauSo18?.nguoiLapBieu,
                    ' Diện tích tưới (ha)':
                        (item?.bieuMauSo18?.cacThongSo?.hoChuaTL
                            ?.dungTichTuoi || 0) +
                        (item?.bieuMauSo18?.cacThongSo?.hoChuaTD
                            ?.dienTichMatNuoc || 0) +
                        (item?.bieuMauSo18?.cacThongSo?.cong?.dtTuoi || 0),
                    'Công suất phát điện (KW)':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD?.congSuatLapMay,
                    'Số hộ dân được cấp nước':
                        item?.bieuMauSo18?.cacThongSo?.hoChuaTD
                            ?.soHoDanDuocCapNuoc,
                    'Ghi chú': item?.bieuMauSo18?.ghiChu,
                    'Ngày nhập': item?.bieuMauSo18?.ngayLapBieu
                        ? new Date(item.bieuMauSo18.ngayLapBieu) || ''
                        : '',

                    // 'Id hệ thống': item.indexOnBieuMau,
                    // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
                }));
            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    const exportToExcel20 = (data) => {
        // chỉ lấy những data có data.dataExcel[].bieuMauSo20
        try {
            const excelData = data?.dataExcel
                // ?.filter((item) => item?.bieuMauSo20)
                .map((item, index) => ({
                    "STT": index + 1,
                    'Số hiệu điểm': item?.bieuMauSo20?.soHieuDiem,
                    "Mã tự đánh": item?.bieuMauSo20?.maTuDanh,
                    'Tên chủ hộ/tên công trình':
                        item?.bieuMauSo20?.tenChuHoHoacCongTrinh,
                    'Tọa độ X': item?.bieuMauSo20?.vN2000x,
                    'Tọa độ Y': item?.bieuMauSo20?.vN2000y,
                    'Tổ/thôn/ấp/khóm': item?.bieuMauSo20?.thonXom,
                    'Phường/xã': item?.bieuMauSo20?.phuongXa,
                    'Thành phố/thị xã/huyện': item?.bieuMauSo20?.quanHuyen,
                    "Tỉnh": item?.bieuMauSo20?.tinhThanh,
                    'Thuộc khu/KCN': item?.bieuMauSo20?.KhuCumCongNghiep,
                    'Năm xây dựng': item?.bieuMauSo20?.namXayDung,
                    'Năm bắt đầu khai thác': item?.bieuMauSo20?.namKhaiThac,
                    'Loại công trình':
                        // item?.bieuMauSo20?.loaiCongTrinh?.join(', '),
                        item?.bieuMauSo20?.loaiCongTrinh,
                    'Mục đích sử dụng':
                        item?.bieuMauSo20?.mucDichSuDungs?.join(', '),
                    'Lưu lượng khai thác (m3/ngày)':
                        item?.bieuMauSo20?.luuLuongKhaiThacText,
                    'Công trình cấp nước tập trung':
                        item?.bieuMauSo20?.congTrinhCapNuocTapTrung,
                    'Số hộ sử dụng': item?.bieuMauSo20?.soHoSuDung,
                    'Tình trạng sử dụng (có/ không)':
                        item?.bieuMauSo20?.soHoSuDung > 0 ? 'Có' : 'Không',
                    'Số lượng giếng': item?.bieuMauSo20?.soLuongGieng || 0,
                    'Hình thức công trình':
                        item?.bieuMauSo20?.hinhThucCongTrinh,
                    'Phạm vi cấp nước': item?.bieuMauSo20?.phamViCapNuoc,
                    'Chiều sâu giếng (m)': item?.bieuMauSo20?.chieuSauGieng,
                    'Đường kính giếng (mm)': item?.bieuMauSo20?.duongKinhGieng,
                    'Chiều sâu lọc trên (m)':
                        item?.bieuMauSo20?.chieuSauKhaiThacTu,
                    'Chiều sâu lọc dưới (m)':
                        item?.bieuMauSo20?.chieuSauKhaiThacDen,
                    'Tầng chứa nước khai thác':
                        item?.bieuMauSo20?.tangChuaNuocKhaiThac,
                    'Mực nước tĩnh (m)': item?.bieuMauSo20?.mucNuocTinh,
                    'Mực nước động (m)': item?.bieuMauSo20?.mucNuocDong,
                    'Lý do không đo được mực nước':
                        item?.bieuMauSo20?.lyDoKhongDoDuoc,
                    'Sự biến đổi mực nước theo thời gian':
                        item?.bieuMauSo20?.suBienDoiMucNuoc,
                    'Loại máy bơm': item?.bieuMauSo20?.loaiMayBom,
                    'Công suất bơm': item?.bieuMauSo20?.congSuatBom,
                    'Chiều sâu thả máy bơm chìm':
                        item?.bieuMauSo20?.chieuSauThaMayBom,
                    'Chế độ khai thác (giờ/ngày)':
                        item?.bieuMauSo20?.cheDoKhaiThac,
                    'Chất lượng nước': item?.bieuMauSo20?.loaiNuocDoChatLuong,
                    'Màu nước': item?.bieuMauSo20?.mauChatLuongNuoc,
                    'Mùi nước': item?.bieuMauSo20?.muiChatLuongNuoc,
                    'Chỉ tiêu, diễn biến chất lượng khác':
                        item?.bieuMauSo20?.chiTieuDienBienChatLuongKhac,
                    'Tình hình cấp phép': item?.bieuMauSo20?.coThongTinGiayPhep
                        ? 'Đã cấp phép'
                        : 'Chưa cấp phép',
                    'Số giấy phép': item?.bieuMauSo20?.soGiayPhep,
                    'Ngày cấp phép': item?.bieuMauSo20?.ngayCapPhep
                        ? new Date(
                            convertToTimestamp(item.bieuMauSo20.ngayCapPhep)
                        ) || ''
                        : '',
                    'Mô tả thông tin khác': item?.bieuMauSo20?.moTaThongTin,
                    'Người cung cấp thông tin':
                        item?.bieuMauSo20?.nguoiCungCapThongTin,
                    'Cán bộ điều tra': item?.bieuMauSo20?.canBoDieuTra,
                    'Người nhập': item?.bieuMauSo20?.nguoiLapBieu,
                    'Ngày nhập': item?.bieuMauSo20?.ngayLapBieu
                        ? new Date(item.bieuMauSo20.ngayLapBieu) || ''
                        : '',
                    // 'Id hệ thống': item.indexOnBieuMau,
                    // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
                }));

            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    const exportToExcel22 = (data) => {
        try {
            const excelData = data?.dataExcel
                // ?.filter((item) => item?.bieuMauSo22)
                .map((item, index) => ({
                    "STT": index + 1,
                    "Mã tự đánh": item?.bieuMauSo20?.maTuDanh,
                    'Số hiệu điểm': item?.bieuMauSo20?.soHieuDiem,
                    'Tên cơ sở/ chủ hộ sản xuất':
                        item?.bieuMauSo22?.tenChuHoHoacCongTrinh,
                    'Tọa độ X': item?.bieuMauSo22?.vN2000x,
                    'Tọa độ Y': item?.bieuMauSo22?.vN2000y,
                    'Ấp/Khóm/Tổ dân phố': item?.bieuMauSo22?.thonXom,
                    'Xã/Phường/Thị trấn': item?.bieuMauSo22?.phuongXa,
                    "Huyện": item?.bieuMauSo22?.quanHuyen,
                    "Tỉnh": item?.bieuMauSo22?.tinhThanh,
                    'Tên sông điều tra': item?.bieuMauSo22?.tenSong,
                    'Lĩnh vực sản xuất': item?.bieuMauSo22?.linhVucSanXuat,
                    'Công suất sản xuất': item?.bieuMauSo22?.congSuatSanXuat,
                    'Tình trạng hoạt động':
                        item?.bieuMauSo22?.tinhTrangHoatDong,
                    'Có giấy phép XT': item?.bieuMauSo22?.coThongTinGiayPhep
                        ? 'Có'
                        : 'Không',
                    'Số giấy phép': item?.bieuMauSo22?.soGiayPhep,
                    'Ngày cấp phép': item?.bieuMauSo22?.ngayCapPhep
                        ? new Date(
                            convertToTimestamp(item?.bieuMauSo22?.ngayCapPhep)
                        ) || ''
                        : '',
                    'Thời gian cấp phép': item?.bieuMauSo22?.thoiHanCapPhep,
                    'Cơ quan cấp': item?.bieuMauSo22?.coQuanCapPhep,
                    'Lượng nước SD (m3/ngày)':
                        item?.bieuMauSo22?.luongNuocSuDung,
                    'Cho SH (m3/ngày)': item?.bieuMauSo22?.luongNuocSinhHoat,
                    'Cho SX (m3/ngày)': item?.bieuMauSo22?.luongNuocSanXuat,
                    'Nguồn nước sử dụng':
                        item?.bieuMauSo22?.loaiNguonNuocSuDung,
                    'Tên nguồn nước SD': item?.bieuMauSo22?.tenNguonNuocSuDung,
                    'Loại hình nước thải': item?.bieuMauSo22?.loaiHinhNuocThai,
                    'Lượng nước XT trung bình (m3/h)':
                        item?.bieuMauSo22?.luongNuocXaThaiTrungBinh,
                    'Lượng nước XT lớn nhất (m3/h)':
                        item?.bieuMauSo22?.luongNuocXaThaiLonNhat,
                    'Lượng nước thải (m3/ngày)':
                        item?.bieuMauSo22?.tongLuongNuocXaThai,
                    'Phương thức xả thải': item?.bieuMauSo22?.phuongThucXaThai,
                    'Chế độ xả nước thải': item?.bieuMauSo22?.cheDoXaThai,
                    'Quy mô cơ sở hộ sản xuất':
                        item?.bieuMauSo22?.quyMoLoaiHinhNuocThai,
                    'Thời gian xả thải': item?.bieuMauSo22?.thoiGianXaThai,
                    'Màu nước XTSXL':
                        item?.bieuMauSo22?.chatLuongNuocThai?.chatLuongMauNuoc,
                    'Mùi nước XTSXL':
                        item?.bieuMauSo22?.chatLuongNuocThai?.chatLuongMuiNuoc,
                    'pH nước XTSXL':
                        item?.bieuMauSo22?.chatLuongNuocThai?.chiSopH,
                    'DO nước XTSXL (ml/g)':
                        item?.bieuMauSo22?.chatLuongNuocThai?.chiSoDO,
                    'Nhiệt độ nước XTSXL (oC)':
                        item?.bieuMauSo22?.chatLuongNuocThai?.nhietDoNuoc,
                    'Độ dẫn điện nước XTSXL (mS/cm)':
                        item?.bieuMauSo22?.chatLuongNuocThai?.doDanDienNuoc,
                    'TT khác về NXTSXL':
                        item?.bieuMauSo22?.chatLuongNuocThai?.chiSoKhac,
                    'Hệ thông xử lý NT': item?.bieuMauSo22
                        ?.coHeThongXuLyNuocThai
                        ? 'Có'
                        : 'Không',
                    'Công suất xử lý nước thải (m3/ngày)':
                        item?.bieuMauSo22?.congSuatXuLyNuocThai,
                    'Nguồn tiếp nhận nước thải':
                        item?.bieuMauSo22?.nguonTiepNhanNuocThai,
                    'Loại hình cửa xả': item?.bieuMauSo22?.loaiHinhCuaXa,
                    'LL XT1 (m3/ngày)': item?.bieuMauSo22?.viTriXaThais[0]?.luuLuongXa,
                    'Số hiệu XT1':
                        item?.bieuMauSo22?.viTriXaThais[0]?.soHieuDiemXa,
                    'Tọa độ X vị trí XT1':
                        item?.bieuMauSo22?.viTriXaThais[0]?.vN2000x,
                    'Tọa độ Y vị trí XT1':
                        item?.bieuMauSo22?.viTriXaThais[0]?.vN2000y,
                    'LL XT2 (m3/ngày)': item?.bieuMauSo22?.viTriXaThais[1]?.luuLuongXa,
                    'Số hiệu XT2':
                        item?.bieuMauSo22?.viTriXaThais[1]?.soHieuDiemXa,
                    'Tọa độ X vị trí XT2':
                        item?.bieuMauSo22?.viTriXaThais[1]?.vN2000x,
                    'Tọa độ Y vị trí XT2':
                        item?.bieuMauSo22?.viTriXaThais[1]?.vN2000y,
                    'LL XT3 (m3/ngày)': item?.bieuMauSo22?.viTriXaThais[2]?.luuLuongXa,
                    'Số hiệu XT3':
                        item?.bieuMauSo22?.viTriXaThais[2]?.soHieuDiemXa,
                    'Tọa độ X vị trí XT3':
                        item?.bieuMauSo22?.viTriXaThais[2]?.vN2000x,
                    'Tọa độ Y vị trí XT3':
                        item?.bieuMauSo22?.viTriXaThais[2]?.vN2000y,
                    'Độ sâu của nguồn nước ở KV tiếp nhật NT (m)':
                        item?.bieuMauSo22?.doSauMucNuoc,
                    'Tốc độ dòng chảy tại KV tiếp nhận NT (m/s)':
                        item?.bieuMauSo22?.tocDoDongChay,
                    'Màu nước tại HT':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong
                            ?.chatLuongMauNuoc,
                    'Mùi nước tại HT':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong
                            ?.chatLuongMuiNuoc,
                    'pH nước tại HT':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong?.chiSopH,
                    'DO nước tại HT (ml/g)':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong?.chiSoDO,
                    'Nhiệt độ nước tại HT (oC)':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong
                            ?.nhietDoNuoc,
                    'Độ dẫn điện nước tại HT (mS/cm)':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong
                            ?.doDanDienNuoc,
                    'TT khác về Ntại HT':
                        item?.bieuMauSo22?.chatLuongNuocTaiHienTruong
                            ?.chiSoKhac,
                    'Tình hình quan trắn, đo CLN':
                        item?.bieuMauSo22?.tinhHinhQuanTracDoDac,
                    'Người cung cấp thông tin':
                        item?.bieuMauSo22?.nguoiCungCapThongTin,
                    'Cán bộ điều tra': item?.bieuMauSo22?.canBoDieuTra,
                    'Người nhập': item?.bieuMauSo22?.nguoiLapBieu,
                    'Thông tin khác': item?.bieuMauSo22?.thongTinKhac,
                    'Ngày nhập': item?.bieuMauSo22?.ngayLapBieu
                        ? new Date(item.bieuMauSo22.ngayLapBieu) || ''
                        : '',
                    // 'Id hệ thống': item.indexOnBieuMau,
                    // 'Xóa(Có, không thì để trống)': item.isDeleted ? 'Có' : '',
                }));
            const loaiBieuMau = data?.bieuMau;
            exportToExcel(excelData, loaiBieuMau);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi xuất file', {
                icon: '🚫',
            });
        }
    };

    return {
        exportToExcelDTKK,
        handleFormat,
        splitArray,
        handleFileChange,
        bieu10Mapping,
        bieu31Mapping,
        bieu32Mapping,
        bieu3Mapping,
        bieu5Mapping,
        bieu9Mapping,
        removeVietnameseTones,
        bieu8Mapping,
        bieu17Mapping,
        bieu17MappingMaxFile,
        bieu18MappingMaxFile,
        bieu20MappingMaxFile,
        bieu19Mapping,
        bieu19MappingMaxFile,
        bieu22MappingMaxFile,
        bieu6Mapping,
        bieu7Mapping,
        bieu25Mapping,
        bieu21Mapping,
        bieu21MappingMaxFile,
        bieu11Mapping,
        bieu14Mapping,
        bieu4Mapping,
        getAllHeadersByIndex,
        removeEmptyArray,
        splitWithPattern,
        isStringNumber,
        unique,
        findMucDichSuDung,
        findLoaiHinhNuocThai,
        findLoaiCongTrinh,
        mappingByIndex,
        removeStr,
        mappingByName,
        mappingByHeaders,
        isLaMa,
        isBlockHeader,
        trySplitToBlocks,
    };
};
