import axios from "axios";
import { ar } from "date-fns/locale";

onmessage = async function (e) {
    const { API_URI, doiTuong, limitProgess, accessToken, data } = e.data;
    let limit = limitProgess || 1000;
    const processedIds = new Set(); // Để lưu trữ ID đã xử lý
    const { bieuMau, ...otherData } = data || {};
    let anchor = '';
    let totalRecords = 0;
    // let groupByDVHC = true;
    let totalBanGhiDaLay = 0;
    let excludeNguonDuLieu = true;
    async function fetchData() {
        try {
            // Gửi yêu cầu ban đầu
            const initialResponse = await axios.post(`${API_URI}${doiTuong}`, {
                ...otherData,
                anchor,
                limit,
                // groupByDVHC,
                bieuMau,
                excludeNguonDuLieu
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const initialData = initialResponse?.data;
            totalRecords = initialData?.count;
            totalBanGhiDaLay = initialData?.records.length;
            let progressPercentage = 0;

            // Lấy dữ liệu ban đầu
            let uniqueRecords = initialData?.records.filter(record => !processedIds.has(record.id));
            uniqueRecords.forEach(record => processedIds.add(record.id));

            anchor = initialData?.anchor;

            // Gửi dữ liệu ban đầu
            postMessage({
                status: 'progress',
                data: uniqueRecords, // Clone dữ liệu trước khi gửi
                progressExport: Math.round((processedIds.size / totalRecords) * 100),
                countTH: totalRecords,
            });

            // Tiến hành lấy thêm dữ liệu cho đến khi đủ tổng số bản ghi
            while (totalBanGhiDaLay < totalRecords) {
                const start = Date.now();
                const response = await axios.post(`${API_URI}${doiTuong}`, {
                    ...otherData,
                    anchor,
                    limit,
                    // groupByDVHC,
                    bieuMau,
                    excludeNguonDuLieu
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const data = response?.data;
                anchor = data?.anchor;

                // Lọc các bản ghi chưa xử lý
                uniqueRecords = data?.records.filter(record => !processedIds.has(record.id));
                uniqueRecords.forEach(record => processedIds.add(record.id));
                totalBanGhiDaLay += data?.records.length;
                // Gửi dữ liệu từng phần
                progressPercentage = (processedIds.size / totalRecords) * 100;
                postMessage({
                    status: 'progress',
                    data: uniqueRecords, // Clone dữ liệu trước khi gửi
                    progressExport: Math.round(progressPercentage),
                    limitCall: limit,
                });

                // Điều chỉnh `limit` dựa trên thời gian phản hồi
                const responseTime = (Date.now() - start) / 1000;
                if (responseTime < 3) {
                    limit = limit * 2;
                } else if (responseTime > 6 && responseTime <= 12) {
                    limit = Math.max(Math.floor(limit * 0.75), 100);
                } else if (responseTime > 12) {
                    limit = Math.max(Math.floor(limit / 2), 100);
                }
            }
            // const idss = Array.from(processedIds);
            // Gửi thông báo thành công
            postMessage({
                status: 'success',
                progressExport: 100,
                // idSaves: idss,
            });
            // giải phóng bộ nhớ
            close();

        } catch (error) {
            postMessage({ status: 'error', message: 'Có lỗi xảy ra: ' + error.message });
        }
    }

    fetchData();
};
