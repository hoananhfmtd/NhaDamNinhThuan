import * as XLSX from 'xlsx';

onmessage = async function (e) {
    const { arrayBuffer } = e.data; // Nhận ArrayBuffer từ main thread
    try {
        const startTime = performance.now(); // Bắt đầu đo thời gian

        // Đọc tệp Excel từ ArrayBuffer
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Kiểm tra xem file có sheet nào không
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            postMessage({ status: 'error', message: 'File không có dữ liệu' });
            return;
        }

        // Lấy sheet đầu tiên
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Chuyển đổi sheet thành mảng 2D (giữ giá trị mặc định cho ô rỗng)
        let rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "", // Gán giá trị mặc định cho ô trống
        });

        // Xóa các hàng trống
        rows = rows.filter((row) => !row.every((cell) => cell === ""));
        if (rows.length === 0) {
            postMessage({ status: 'error', message: 'File không có dữ liệu' });
            return;
        }

        // Định dạng dữ liệu
        const formattedData = handleFormat(rows);
        // Gửi kết quả về main thread
        postMessage({
            status: 'success',
            data: formattedData,
        });

        const endTime = performance.now();
        console.log('Thời gian đọc file: ', (endTime - startTime).toFixed(2) + 'ms');
    } catch (error) {
        postMessage({
            status: 'error',
            message: 'Có lỗi xảy ra khi đọc tệp Excel: ' + error.message,
        });
    }
};

// Hàm định dạng dữ liệu
const handleFormat = (data = []) => {
    try {
        // Loại bỏ hàng toàn null hoặc toàn giá trị rỗng ''
        const result = data
            .map((row) => {
                if (row.every((cell) => cell === null || cell === '')) {
                    return 'null';
                }
                return row;
            })
            .filter((row) => row !== 'null'); // Loại bỏ hàng 'null'

        // Loại bỏ các giá trị null hoặc '' đầu dòng
        result.forEach((row) => {
            while (row[0] === null || row[0] === '') {
                row.shift();
            }
        });

        return result;
    } catch (error) {
        console.error('Đã có lỗi khi cấu trúc lại dữ liệu:', error);
        throw new Error('Đã xảy ra lỗi khi cấu trúc lại dữ liệu');
    }
};
