let anchor = '';
let allData = [];

onmessage = async function (e) {
    const { API_URI, doiTuong, accessToken, data, limitProgess, isContinueFetch, anchors, totalData, dataCalled } = e.data;
    allData = [...dataCalled]; // Dữ liệu cũ + mới
    let limit = 50;
    const processedIds = new Set(dataCalled.map(record => record.id)); // Đã xử lý
    anchor = anchors || '';
    let isContinueFetchs = isContinueFetch || true; // Bắt đầu tiếp tục gọi
    const { bieuMau, ...otherData } = data || {};
    // let groupByDVHC = true;
    let excludeNguonDuLieu = true;
    async function fetchData() {
        try {
            // Chỉ gọi API trang đầu tiên nếu chưa có anchor
            if (anchor === '' && allData.length === 0) {
                const initialResponse = await fetch(`${API_URI}${doiTuong}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        ...otherData, anchor, limit,
                        //  groupByDVHC, 
                        bieuMau, excludeNguonDuLieu
                    }),
                });
                const initialData = await initialResponse.json();
                anchor = initialData?.anchor;
                const uniqueRecords = initialData.records.filter(record => !processedIds.has(record.id));
                uniqueRecords.forEach(record => processedIds.add(record.id));
                allData = allData.concat(uniqueRecords);

                postMessage({
                    status: 'progress',
                    data: allData,
                    countTH: initialData?.count,
                    anchor,
                });

                if (uniqueRecords.length === 0 || !anchor) {
                    isContinueFetchs = false; // Không còn dữ liệu mới
                }
            }

            // Tiếp tục gọi dữ liệu
            while (isContinueFetchs && allData.length < totalData) {
                const start = Date.now();
                const response = await fetch(`${API_URI}${doiTuong}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        ...otherData, anchor,
                        limit,
                        //  groupByDVHC,
                        bieuMau, excludeNguonDuLieu
                    }),
                });

                const data = await response.json();
                anchor = data?.anchor;
                const end = Date.now();
                const responseTime = (end - start) / 1000;

                const uniqueRecords = data.records.filter(record => !processedIds.has(record.id));
                uniqueRecords.forEach(record => processedIds.add(record.id));
                allData = allData.concat(uniqueRecords);

                // Điều chỉnh limit dựa trên thời gian phản hồi
                // if (responseTime < 5) {
                //     limit = Math.min(limit * 2, 5000); // Tăng nhưng không vượt quá 5000
                // } else if (responseTime > 10) {
                //     limit = Math.max(Math.floor(limit * 0.75), 100); // Giảm nhưng không nhỏ hơn 100
                // }

                // Cập nhật tiến độ
                postMessage({
                    status: 'progress',
                    data: allData,
                    progressExport: Math.round((allData.length / totalData) * 100),
                    anchor,
                    countTH: totalData,
                    limitCall: limit,
                });
                isContinueFetchs = false; // Không còn dữ liệu mới
                // Nghỉ 1s giữa các lần gọi
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // // Hoàn thành
            // if (!isContinueFetchs) {
            //     postMessage({
            //         status: 'success',
            //         data: allData,
            //         countTH: totalData,
            //         progressExport: 100,
            //     });
            // }
        } catch (error) {
            postMessage({ status: 'error', message: 'Có lỗi xảy ra: ' + error.message });
        }
    }

    fetchData();
};
