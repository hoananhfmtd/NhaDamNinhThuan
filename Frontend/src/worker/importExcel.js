import * as XLSX from 'xlsx';
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
        if (rows?.length === 0) {
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
