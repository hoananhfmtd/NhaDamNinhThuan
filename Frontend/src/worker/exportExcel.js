import ExcelJS from 'exceljs';
// import * as XLSX from 'xlsx';
onmessage = async function (e) {
    const dataSend = e.data; // Nhận ArrayBuffer từ main thread
    const dataExcelEP = dataSend?.dataExcel;
    const isLastChunk = dataSend?.isLastChunk || false;
    const bieuMau = dataSend?.bieuMau || '';
    try {
        if (dataSend?.dataExcel?.length === 0) {
            postMessage({ status: 'error', message: 'Không có dữ liệu ' });
            return;
        }
        if (dataExcelEP?.length > 0) {
            switch (bieuMau) {
                case 'BieuMauSo17':
                    exportToExcel17(dataExcelEP, bieuMau, isLastChunk);
                    break;
                case 'BieuMauSo19':
                    exportToExcel19(dataExcelEP, bieuMau, isLastChunk);
                    break;
                case 'BieuMauSo21':
                    exportToExcel21(dataExcelEP, bieuMau, isLastChunk);
                    break;
                case 'BieuMauSo18':
                    exportToExcel18(dataExcelEP, bieuMau, isLastChunk);
                    break;
                case 'BieuMauSo20':
                    exportToExcel20(dataExcelEP, bieuMau, isLastChunk);
                    break;
                case 'BieuMauSo22':
                    exportToExcel22(dataExcelEP, bieuMau, isLastChunk);
                    break;
                default:
                    break;
            }
        }

    } catch (error) {
        postMessage({
            status: 'error',
            message: 'Có lỗi xảy ra khi đọc tệp Excel: ' + error.message,
        });
    }
};

// lưu vào indexedDB
// const saveToIndexedDB = (dbName, storeName, data) => {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(dbName, 1);

//         request.onupgradeneeded = (event) => {
//             const db = event.target.result;
//             if (!db.objectStoreNames.contains(storeName)) {
//                 db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
//             }
//         };

//         request.onsuccess = (event) => {
//             const db = event.target.result;
//             const transaction = db.transaction(storeName, 'readwrite');
//             const store = transaction.objectStore(storeName);
//             const request = store.add(data);

//             request.onsuccess = () => resolve('Saved to IndexedDB');
//             request.onerror = (err) => reject(err);
//         };

//         request.onerror = (err) => reject(err);
//     });
// };
// // Đọc dữ liệu từ indexedDB
// const readFromIndexedDB = (dbName, storeName) => {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(dbName, 1);
//         request.onsuccess = (event) => {
//             const db = event.target.result;
//             const transaction = db.transaction(storeName, 'readonly');
//             const store = transaction.objectStore(storeName);
//             const request = store.getAll();

//             request.onsuccess = () => resolve(request.result);
//             request.onerror = (err) => reject(err);
//         };

//         request.onerror = (err) => reject(err);
//     });
// };


const isArray = (arr) => (Array.isArray(arr) ? arr : []);
let totalProcessed = 0;
const exportToExcel17 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP?.map((item, index) => ({
            'STT': index + 1,
            'Tên chủ hộ/ công trình': item.tenChuHoHoacCongTrinh,
            'Ấp/Khóm/Tổ dân phố': item.thonXom,
            'Xã/Phường/Thị trấn': item.phuongXa,
            'Huyện': item.quanHuyen,
            'Tỉnh': item.tinhThanh,
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
        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};
const exportToExcel18 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP
            .map((item, index) => ({
                'STT': index + 1,
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

        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};
const exportToExcel19 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP.map((item, index) => ({
            'STT': totalProcessed + index + 1, // Tính STT dựa trên tổng số bản ghi đã xử lý
            'Tên chủ hộ/tên công trình': item.tenChuHoHoacCongTrinh,
            'Tổ/thôn/ấp/khóm': item.thonXom,
            'Phường/xã': item.phuongXa,
            'Thành phố/thị xã/huyện': item.quanHuyen,
            'Tỉnh': item.tinhThanh,
            'Số lượng giếng': item.soLuongGieng,
            'Mục đích sử dụng': Array.isArray(item.mucDichSuDungs) ? item.mucDichSuDungs.join(', ') : '',
            'Lưu lượng khai thác (m3/ngày)': item.luuLuongKhaiThacText,
            'Loại công trình': item.loaiCongTrinh,
            'Chiều sâu giếng (m)': item.chieuSauKhaiThac,
            'Hình thức công trình': item.hinhThucKhaiThac,
            'Tình trạng sử dụng (có/ không)': item.tinhTrangSuDung || "Không",
            'Người cung cấp thông tin': item?.nguoiCungCapThongTin,
            'Cán bộ điều tra': item?.canBoDieuTra,
            'Người nhập': item?.nguoiLapBieu,
            'Ngày nhập': item?.ngayLapBieu ? new Date(item.ngayLapBieu).toLocaleDateString() : '',
        }));

        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};
const exportToExcel20 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP?.map((item, index) => ({
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
        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};
const exportToExcel21 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP?.map((item, index) => ({
            'STT': index + 1,
            'Tên cơ sở/ chủ hộ sản xuất': item.tenChuHoHoacCongTrinh,
            'Ấp/Khóm/Tổ dân phố': item.thonXom,
            'Xã/Phường/Thị trấn': item.phuongXa,
            'Huyện': item.quanHuyen,
            'Tỉnh': item.tinhThanh,
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
        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};
const exportToExcel22 = (dataExcelEP, bieuMau, isLastChunk) => {
    try {
        // Định dạng dữ liệu cho chunk
        const excelData = dataExcelEP
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
        // Cập nhật tổng số bản ghi đã xử lý
        totalProcessed += dataExcelEP.length;
        // Xuất Excel   
        exportToExcel(excelData, bieuMau, isLastChunk);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
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

// const mergeExcelFiles = async (dbName, storeName, bieuMau) => {
//     try {
//         postMessage({ status: 'progressDownload', message: `Đang gộp dữ liệu` });
//         const dataChunks = await readFromIndexedDB(dbName, storeName);
//         if (dataChunks.length === 0) {
//             console.error('Không có dữ liệu để gộp.');
//             postMessage({ status: 'error', message: 'Không có dữ liệu để gộp.' });
//             return;
//         }

//         const MAX_ROWS_PER_SHEET = 50000;
//         const MAX_SHEETS_PER_FILE = 2;
//         let currentFileIndex = 1;
//         let currentSheetIndex = 1;
//         let currentRowCount = 0;
//         let totalRowCount = 0;
//         let totalFiles = 0;
//         let processedRows = 0;
//         const firstChunk = XLSX.read(new Uint8Array(dataChunks[0].buffer), { type: 'array' });
//         const firstWorksheet = firstChunk.Sheets[firstChunk.SheetNames[0]];
//         const columns = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 })[0];

//         let workbook = XLSX.utils.book_new();
//         let worksheet = XLSX.utils.aoa_to_sheet([columns]);
//         let sheetName = `Sheet${currentSheetIndex}`;
//         XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

//         for (const chunk of dataChunks) {
//             const tempWorkbook = XLSX.read(new Uint8Array(chunk.buffer), { type: 'array' });
//             const tempWorksheet = tempWorkbook.Sheets[tempWorkbook.SheetNames[0]];
//             const rows = XLSX.utils.sheet_to_json(tempWorksheet, { header: 1 });
//             totalRowCount += rows.length - 1;
//         }

//         totalFiles = Math.ceil((totalRowCount / MAX_ROWS_PER_SHEET) / MAX_SHEETS_PER_FILE);

//         for (const chunk of dataChunks) {
//             const tempWorkbook = XLSX.read(new Uint8Array(chunk.buffer), { type: 'array' });
//             const tempWorksheet = tempWorkbook.Sheets[tempWorkbook.SheetNames[0]];
//             const rows = XLSX.utils.sheet_to_json(tempWorksheet, { header: 1 });
//             debugger
//             for (let i = 1; i < rows.length; i++) {
//                 if (!rows[i] || rows[i].length === 0) continue;

//                 XLSX.utils.sheet_add_aoa(worksheet, [rows[i]], { origin: -1 });
//                 currentRowCount++;
//                 processedRows++;
//                 if (processedRows % 500 === 0) {
//                     postMessage({
//                         status: 'progressDownload',
//                         message: `Đang xử lý... ${processedRows}/${totalRowCount} dòng (${Math.floor((processedRows / totalRowCount) * 100)}%)`
//                     });
//                 }

//                 if (currentRowCount >= MAX_ROWS_PER_SHEET) {
//                     if (currentSheetIndex < MAX_SHEETS_PER_FILE) {
//                         // Tạo sheet mới trong cùng file
//                         currentSheetIndex++;
//                         sheetName = `Sheet${currentSheetIndex}`;
//                         worksheet = XLSX.utils.aoa_to_sheet([columns]);
//                         XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
//                         currentRowCount = 0;
//                     } else {
//                         // Tạo file mới
//                         ({ workbook, worksheet, currentSheetIndex } = await saveAndResetWorkbook(
//                             workbook, worksheet, bieuMau, currentFileIndex++, totalFiles, columns
//                         ));
//                         currentSheetIndex = 1;
//                         currentRowCount = 0;
//                     }
//                 }
//             }
//         }

//         if (currentRowCount > 0 || currentSheetIndex > 1) {
//             await saveAndResetWorkbook(workbook, worksheet, bieuMau, currentFileIndex, totalFiles, columns);
//         }

//         console.log('Gộp file thành công!');
//         postMessage({ status: 'success', message: `Xuất Excel thành công! Tổng số dòng: ${totalRowCount}, Tổng số file: ${totalFiles}` });

//     } catch (error) {
//         console.error('Lỗi khi gộp file:', error.message);
//         postMessage({ status: 'error', message: 'Có lỗi xảy ra khi gộp file Excel: ' + error.message });
//     }
// };

// const saveAndResetWorkbook = async (workbook, worksheet, bieuMau, fileIndex, totalFiles, columns) => {
//     const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

//     //  Đảm bảo xuất file Excel đúng MIME
//     const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//     //  Gửi blob về main thread để tải file
//     postMessage({
//         status: 'download',
//         fileName: `${bieuMau}_Part${fileIndex}.xlsx`,
//         blob,
//         message: `Đã tạo file ${fileIndex}/${totalFiles}`
//     });
//     // 🛠 Reset workbook để chuẩn bị cho file tiếp theo
//     let newWorkbook = XLSX.utils.book_new();
//     let newWorksheet = XLSX.utils.aoa_to_sheet([columns]);
//     XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");

//     return { workbook: newWorkbook, worksheet: newWorksheet, currentSheetIndex: 1 };
// };

// Hàm chính để xuất Excel
// const exportToExcel2 = async (excelData, bieuMau, isLastChunk) => {
//     try {
//         if (totalDataExcel.length > 0 && totalDataExcel?.length === 200000) {

//         }
//         totalDataExcel.push(excelData)
//         const wb = XLSX.utils.book_new();
//         const ws = XLSX.utils.json_to_sheet(excelData);
//         // Tạo workbook từ worksheet
//         XLSX.utils.book_append_sheet(wb, ws, 'Data');

//         // Tạo file Excel dưới dạng buffer
//         const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//         // Lưu buffer vào IndexedDB
//         saveToIndexedDB('ExcelDB', 'chunks', {
//             id: fileIndex,
//             buffer: excelBuffer,
//         });
//         fileIndex++;

//         // Nếu chưa là chunk cuối, gửi thông báo tiếp tục tiến trình
//         if (!isLastChunk) {
//             postMessage({ status: 'progress' });
//         }

//         // Nếu là chunk cuối, gộp các file lại và xuất
//         if (isLastChunk) {
//             mergeExcelFiles('ExcelDB', 'chunks', bieuMau);
//         }

//     } catch (error) {
//         console.error('Lỗi khi xuất Excel:', error.message);
//         postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
//     }
// };
let fileIndex = 1;
let totalFiles = 0; // Biến đếm tổng số file đã tạo
let totalDataExcel = []; // Dữ liệu Excel tạm thời

const exportToExcel = async (excelData, bieuMau, isLastChunk) => {
    try {
        // Đẩy dữ liệu vào bộ nhớ tạm
        totalDataExcel.push(...excelData);

        // Kiểm tra nếu đủ 100.000 dòng thì xuất file
        while (totalDataExcel.length >= 100000) {
            const chunk = totalDataExcel.splice(0, 100000); // Lấy 100.000 dòng và xóa khỏi bộ nhớ
            await generateExcelFile(chunk, `${bieuMau}_Part${fileIndex}.xlsx`);
            fileIndex++;
            totalFiles++;
        }

        // Nếu là chunk cuối cùng và vẫn còn dữ liệu => Xuất file cuối
        if (isLastChunk && totalDataExcel.length > 0) {
            await generateExcelFile(totalDataExcel, `${bieuMau}_Final.xlsx`);
            totalFiles++;
            totalDataExcel = []; // Xóa dữ liệu sau khi xuất
        }

        // Gửi trạng thái về main thread
        postMessage({
            status: isLastChunk ? 'success' : 'progress',
            message: isLastChunk ? `Xuất Excel thành công! Tổng số file: ${totalFiles}` : null,
            totalFiles
        });

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error.message);
        postMessage({ status: 'error', message: 'Có lỗi xảy ra khi xuất Excel: ' + error.message });
    }
};

// Hàm tạo file Excel bằng thư viện ExcelJS
const generateExcelFile = async (data, fileName) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Tạo header từ object keys
        worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

        // Thêm dữ liệu vào sheet
        worksheet.addRows(data);

        // Xuất buffer thành file Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        postMessage({ status: 'download', fileName, blob });
    } catch (error) {
        console.error('Lỗi khi tạo file Excel:', error.message);
        postMessage({ status: 'error', message: 'Lỗi khi tạo file Excel: ' + error.message });
    }
};

// xuất file bằng thư viện xlsx
// const generateExcelFile = async (data, fileName) => {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(data);
//     XLSX.utils.book_append_sheet(wb, ws, 'Data');

//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//     postMessage({ status: 'download', fileName, blob, totalFiles });
// };