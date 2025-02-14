import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { font } from '/src/assets/fonts/TimesNewRomanNomarl.js';
import { fontBold } from '/src/assets/fonts/TimesNewRomanBold.js';
import { fontItalic } from '/src/assets/fonts/TimesNewRomanItalic.js';
onmessage = function (e) {
  const message = e.data;
  const bigDataArray = message.dataIn; // Dữ liệu được truyền vào từ UI
  const bieuMauIn = message.bieuMau;
  const bieuMauShow = ['12', '13', '15'];
  const bieuMauBoldphuDe = ['23', '24'];
  const fontSizeTBIn = message.fontSizeTB;
  const columnIn1 = message.columnPDF1;
  const columnIn2 = message.columnPDF2;
  const valueIn = message.values;
  const kieuInPDF = message.kieuIn || '';
  const scopeIn = message.scope || '';
  let doc = new jsPDF(kieuInPDF);
  let totalPages = 0;
  doc.addFileToVFS("TimesNewRoman-normal.ttf", font);
  doc.addFileToVFS("TimesNewRoman-bold.ttf", fontBold);
  doc.addFileToVFS("TimesNewRoman-italic.ttf", fontItalic);
  doc.addFont("TimesNewRoman-normal.ttf", "TimesNewRoman", "normal");
  doc.addFont("TimesNewRoman-bold.ttf", "TimesNewRoman", "bold");
  doc.addFont("TimesNewRoman-italic.ttf", "TimesNewRoman", "italic");
  doc.setFont("TimesNewRoman", "normal");
  // Header chỉ cho trang đầu tiên
  // Dữ liệu bảng
  const columns1 = columnIn1;
  const columns2 = columnIn2;
  let data1 = [];
  let data2 = [];
  if (columns1.length > 0) {
    data1 = dataTable1(bieuMauIn, bigDataArray);
  }
  if (columns2?.length > 0) {
    data2 = dataTable2(bieuMauIn, bigDataArray);
  }
  const addHeader = () => {
    if (kieuInPDF) {// in ngang
      doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
      doc.text(`${(valueIn.coQuanCapTinh || 'BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG').toUpperCase()}`, 70, 15, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text(`\n${(valueIn.coQuanThucHien || 'CƠ QUAN THỰC HIỆN').toUpperCase()}`, 70, 15, { align: 'center' }); // Dòng này sẽ in đậm
      doc.text("\n___________________", 70, 16, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "normal");
      doc.text("\n“Đề án tổng kiểm kê tài nguyên nước quốc gia,\ngiai đoạn đến năm 2025”", 70, 22, { align: 'center' });

      doc.setFont("TimesNewRoman", "bold");
      doc.text(`Biểu mẫu số ${bieuMauIn || ''}`, 280, 8, { align: 'right' });
      doc.text("_____________", 280, 9, { align: 'right' }); // Dòng này sẽ in đậm

      doc.setFont("TimesNewRoman", "normal");
      doc.text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", 220, 15, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text("\nĐộc lập - Tự do - Hạnh phúc", 220, 15, { align: 'center' }); // Dòng này sẽ in đậm
      doc.text("\n___________________", 220, 16, { align: 'center' }); // Dòng này sẽ in đậm

      doc.setFontSize(scopeIn === 'dvtt' ? 13 : 16);
      doc.text(`${(valueIn.tieuDe || '').toUpperCase()}`, 150, 45, { align: 'center', fontWeight: 'bold' });
      if (bieuMauBoldphuDe.includes(bieuMauIn)) {
        doc.setFontSize(12);
        doc.setFont("TimesNewRoman", "bold");
        doc.text(`${valueIn.phuDeIn}`, 150, 50
          , { align: 'center' });
      } else {
        doc.setFontSize(10);
        doc.setFont("TimesNewRoman", "normal");
        doc.text(`${valueIn.phuDeIn}`, 150, 50
          , { align: 'center' });
      }
    }
    else {// in dọc
      doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
      doc.text(`${(valueIn.coQuanCapTinh || 'BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG').toUpperCase()}`, 60, 15, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text(`\n${(valueIn.coQuanThucHien || 'CƠ QUAN THỰC HIỆN').toUpperCase()}`, 60, 15, { align: 'center' }); // Dòng này sẽ in đậm
      doc.text("\n___________________", 60, 16, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "normal");
      doc.text("\n“Đề án tổng kiểm kê tài nguyên nước quốc gia,\ngiai đoạn đến năm 2025”", 60, 22, { align: 'center' });

      doc.setFont("TimesNewRoman", "bold");
      doc.text(`Biểu mẫu số ${bieuMauIn || ''}`, 200, 8, { align: 'right' });
      doc.text("_____________", 200, 8.5, { align: 'right' }); // Dòng này sẽ in đậm

      doc.setFont("TimesNewRoman", "normal");
      doc.text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", 150, 15, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text("\nĐộc lập - Tự do - Hạnh phúc", 150, 15, { align: 'center' }); // Dòng này sẽ in đậm
      doc.text("\n___________________", 150, 16, { align: 'center' }); // Dòng này sẽ in đậm

      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.text(`${(valueIn.tieuDe || '').toUpperCase()}`, 110, 45, { align: 'center', fontWeight: 'bold' });
      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.setFont("TimesNewRoman", "normal");
      doc.text(`${valueIn.phuDeIn}`, 110, 50
        , { align: 'center' });
      if (columns1.length > 0) {
        if (bieuMauIn === '5') {
          doc.setFont("TimesNewRoman", "bold");
          doc.text(`5.1. Tổng lượng dòng chảy theo lưu vực sông và cả nước`, 20, 57, { align: 'left' });
          doc.setFont("TimesNewRoman", "normal");
          doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
          doc.text(`Đơn vị: mm`, 190, 59, { align: 'right' })
        }
        else if (bieuMauIn === '11') {
          doc.setFont("TimesNewRoman", "bold");
          doc.text(`11.1. Kiểm kê lượng nước và chất lượng nước dưới đất theo lưu vực sông`, 20, 57, { align: 'left' });
        }
        else if (bieuMauIn === '9') {
          doc.setFont("TimesNewRoman", "bold");
          doc.text(`9.1. Tổng lượng mưa phân bố theo lưu vực sông và cả nước`, 20, 57, { align: 'left' });
          doc.setFont("TimesNewRoman", "normal");
          doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
          doc.text(`Đơn vị: mm`, 190, 59, { align: 'right' })
        }
        else if (bieuMauIn === '3') {
          doc.setFont("TimesNewRoman", "bold");
          doc.text(`3.1. Số lượng nguồn nước mặt là các sông, suối, kênh, rạch`, 20, 57, { align: 'left' });
        }
      }


    }
  };

  const footHeader = (doc, startY) => {
    // Thêm footer ở dưới dòng cuối cùng của bảng
    const footerY = startY + 10; // Bắt đầu vẽ footer dưới dòng cuối cùng của bảng, có thể điều chỉnh độ chênh lệch tùy thích
    // Tạo footer
    doc.setFontSize(12);
    if (kieuInPDF) {// in ngang
      if (bieuMauShow.includes(bieuMauIn)) {
        doc.setFont("TimesNewRoman", "bold");
        doc.text("Người lập biểu", 60, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
        doc.setFont("TimesNewRoman", "italic");
        doc.text("\n(Ký và ghi rõ họ tên)", 60, footerY + 8, { align: 'center' });
        doc.setFont("TimesNewRoman", "bold");
        doc.text("\nNgười kiểm tra", 150, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
        doc.setFont("TimesNewRoman", "italic");
        doc.text("\n(Ký và ghi rõ họ tên)", 150, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
        doc.setFont("TimesNewRoman", "normal");
        doc.text(`${valueIn.noiLapBieu || "......"} ngày ${valueIn.ngay || "......"} tháng ${valueIn.thang || "......"} năm ${valueIn.nam || "......"}`, 235, footerY + 2, { align: 'center' });
        doc.setFont("TimesNewRoman", "bold");
        doc.text("\nCơ quan thực hiện", 240, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
        doc.setFont("TimesNewRoman", "italic");
        doc.text("\n(Ký, đóng dấu, họ tên)", 240, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
      } else {
        doc.setFont("TimesNewRoman", "normal");
        doc.text(`${valueIn.noiCungCapThongTin || "......"} ngày ${valueIn.ngay || "......"} tháng ${valueIn.thang || "......"} năm ${valueIn.nam || "......"}`, 235, footerY + 2, { align: 'center' });
        doc.setFont("TimesNewRoman", "bold");
        doc.text("\nNgười cung cấp thông tin", 240, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
        doc.setFont("TimesNewRoman", "italic");
        doc.text("\n(Ký và ghi rõ họ tên)", 240, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
      }
    } else// in dọc
    {
      doc.setFont("TimesNewRoman", "bold");
      doc.text("Người lập biểu", 40, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "italic");
      doc.text("\n(Ký và ghi rõ họ tên)", 40, footerY + 8, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text("\nNgười kiểm tra", 110, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "italic");
      doc.text("\n(Ký và ghi rõ họ tên)", 110, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "normal");
      doc.text(`${valueIn.noiLapBieu || "......"} ngày ${valueIn.ngay || "......"} tháng ${valueIn.thang || "......"} năm ${valueIn.nam || "......"}`, 165, footerY + 2, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text("\nCơ quan thực hiện", 170, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "italic");
      doc.text("\n(Ký, đóng dấu, họ tên)", 170, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
    }

  };



  // Vẽ bảng
  doc.autoTable({
    startY: 60,
    head: columns1,
    body: data1,
    theme: 'grid',
    styles: {
      textColor: 0, // Màu chữ đen
      fontSize: fontSizeTBIn || 9,
      font: 'TimesNewRoman',
      halign: 'center',
      cellPadding: 0,
      valign: 'middle',// Căn giữa theo chiều dọc;
      lineColor: [0, 0, 0], // Màu sắc của đường kẻ (màu đen)
    },
    margin: {
      right: 20,
      left: 20,
    },
    headStyles: {
      fillColor: [255, 255, 255],  // Nền trắng cho header
      textColor: 0, // Màu chữ đen
      fontSize: fontSizeTBIn || 9,
      halign: 'center',  // Căn giữa chữ
      lineWidth: 0.1, // Độ dày đường kẻ của header
      valign: 'middle',// Căn giữa theo chiều dọc;
      cellPadding: 0,
      lineColor: [0, 0, 0], // Màu đường kẻ
    },
    didDrawPage: function (data) {
      totalPages = doc.internal.getNumberOfPages();
      // Chỉ vẽ header ở trang đầu tiên
      if (data.pageNumber === 1) {
        addHeader();
      }
      // Chỉ vẽ footer ở trang cuối cùng
      // if (data.pageNumber === totalPages) {
      //   const startY = data.cursor.y; // Lấy vị trí Y của dòng cuối cùng trong bảng
      //   footHeader(doc, startY);
      // }
    },
  });
  // bảng 2
  const endY = (columns2?.length > 0 && columns1?.length > 0) ? doc.lastAutoTable.finalY + 20 : doc.lastAutoTable.finalY;
  if (columns2.length > 0) {
    if (bieuMauIn === '11') {
      doc.setFont("TimesNewRoman", "bold");
      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.text(`11.2. Kiểm kê lượng nước và chất lượng nước dưới đất theo tỉnh, thành phố và cả nước`, 20, endY - 3, { align: 'left' })
    }
    else if (bieuMauIn === '3') {
      doc.setFont("TimesNewRoman", "bold");
      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.text(`3.2. Số lượng nguồn nước mặt là các hồ, ao, đầm, phá`, 20, endY - 3, { align: 'left' })
    }
    else if (bieuMauIn === '9') {
      doc.setFont("TimesNewRoman", "bold");
      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.text(`9.2. Tổng lượng mưa phân bố theo địa phương`, 20, endY - 3, { align: 'left' })
      doc.setFont("TimesNewRoman", "normal");
      doc.setFontSize(12);
      doc.text(`Đơn vị: mm`, 190, endY - 1, { align: 'right' })
    }
    else if (bieuMauIn === '5') {
      doc.setFont("TimesNewRoman", "bold");
      doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
      doc.text(`5.2. Tổng lượng dòng chảy tại trạm`, 20, endY - 3, { align: 'left' })
      doc.setFont("TimesNewRoman", "normal");
      doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
      doc.text(`Đơn vị: mm`, 190, endY - 1, { align: 'right' })
    }
  }

  doc.autoTable({
    startY: endY,
    head: columns2,
    body: data2,
    theme: 'grid',
    styles: {
      textColor: 0, // Màu chữ đen
      fontSize: fontSizeTBIn || 9,
      font: 'TimesNewRoman',
      halign: 'center',
      cellPadding: 0,
      valign: 'middle',// Căn giữa theo chiều dọc;
      lineColor: [0, 0, 0], // Màu sắc của đường kẻ (màu đen)
    },
    margin: {
      right: 20,
      left: 20
    },
    headStyles: {
      fillColor: [255, 255, 255],  // Nền trắng cho header
      textColor: 0, // Màu chữ đen
      fontSize: fontSizeTBIn || 9,
      halign: 'center',  // Căn giữa chữ
      lineWidth: 0.1, // Độ dày đường kẻ của header
      valign: 'middle',// Căn giữa theo chiều dọc;
      cellPadding: 0,
      lineColor: [0, 0, 0], // Màu đường kẻ
    },


    didDrawPage: function (data) {
      // totalPages = doc.internal.getNumberOfPages();
      // // Chỉ vẽ header ở trang đầu tiên
      // // if (data.pageNumber === 1) {
      // //   addHeader();
      // // }
      // // Chỉ vẽ footer ở trang cuối cùng
      // if (data.pageNumber === totalPages) {
      //   const startY = data.cursor.y; // Lấy vị trí Y của dòng cuối cùng trong bảng
      //   footHeader(doc, startY);
      // }
    },
  });
  const finalY = doc.lastAutoTable.finalY;
  totalPages = doc.internal.getNumberOfPages();
  doc.setPage(totalPages); // Chuyển đến trang cuối
  footHeader(doc, finalY + 10); // Gọi hàm footHeader ở cuối tài liệu, tại vị trí cuối cùng của bảng
  // Xuất file PDF
  // doc.save('Biểu 13 KIỂM KÊ KHAI THÁC, SỬ DỤNG NƯỚC DƯỚI ĐẤT.pdf');
  // Xuất file PDF
  const pdfBlob = doc.output('blob');
  postMessage({ status: 'success', pdf: pdfBlob });
};

const dataTable1 = (bieuMauIn, datas) => {
  switch (bieuMauIn) {
    case '3':
      return dataTB1InBieu3(datas);
    case '5':
      return dataTB1InBieu5(datas);
    case '9':
      return dataTB1InBieu9(datas);
    case '11':
      return dataTB1InBieu11(datas);
    default:
      return [];
  }
}
const dataTable2 = (bieuMauIn, datas) => {
  switch (bieuMauIn) {
    case '3':
      return dataTB2InBieu3(datas);
    case '5':
      return dataTB2InBieu5(datas);
    case '9':
      return dataTB2InBieu9(datas);
    case '11':
      return dataTB2InBieu11(datas);
    default:
      return [];
  }
}
const convertNummberToLaMa = (num) => {
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
};
// biểu 3
// biểu 5
const dataTB1InBieu3 = (datas) => {
  const data1 = [
  ];
  if (datas?.luuVucSongs) {
    datas?.luuVucSongs?.forEach((lvs, lvsIndex) => {
      data1.push([
        { content: convertNummberToLaMa(lvsIndex + 1), styles: { fontStyle: 'bold' } },
        { content: `Thuộc ${lvs?.luuVucSong || ''}`, styles: { fontStyle: 'bold', align: 'left' }, colSpan: 13 }
      ]);
      lvs.modelSong.forEach((modal, index) => {
        const rowData = [
          index + 1,
          modal.maSong1,
          modal.maSong2,
          modal.maSong3,
          modal.maSong4,
          modal.maSong5,
          modal.maSong6,
          modal.maSong7,
          modal.maSong8,
          modal.maSong9,
          modal.maSong10,
          modal.maSong11,
          modal.maSong12,
          modal.maSong13,
          modal?.ten,
          modal?.chayRa,
          modal?.chieuDai,
          modal?.chieuDaiThuocTinhThanh,
          modal?.viTriDauSong?.vN2000x,
          modal?.viTriDauSong?.vN2000y,
          modal?.viTriDauSong?.xaHuyenTinh,
          // `${modal?.viTriDauSong?.phuongXa ? modal?.viTriDauSong?.phuongXa + ',' : ''}${modal?.viTriDauSong?.quanHuyen ? modal?.viTriDauSong?.quanHuyen + ',' : ''} ${modal?.viTriDauSong?.tinhThanh ?? ''}`,
          modal?.viTriCuoiSong?.vN2000x,
          modal?.viTriCuoiSong?.vN2000y,
          modal?.viTriCuoiSong?.xaHuyenTinh,
          // `${modal?.viTriCuoiSong?.phuongXa ? modal?.viTriCuoiSong?.phuongXa + ',' : ''} ${modal?.viTriCuoiSong?.quanHuyen ? modal?.viTriCuoiSong?.quanHuyen + ',' : ''} ${modal?.viTriCuoiSong?.tinhThanh ?? ''}`,
          modal.ghiChu
        ];
        data1.push(rowData);
      });
    });
  }
  return data1;
};

const dataTB2InBieu3 = (datas) => {
  const data2 = [];
  datas?.aoHoDamPhas?.forEach((item, index) => {
    const rowData = [
      index + 1,
      item.ten,
      item.nguonNuocKhaiThac,
      item.luuVucSong,
      item.dienTichMatNuoc,
      item.dungTichToanBo,
      item.dungTichHuuIch,
      item.viTriHanhChinh,
      item.mucDichSuDungs,
      item.ghiChu,
    ];
    data2.push(rowData);
  });
  return data2;
};
// biểu 5
const dataTB1InBieu5 = (datas) => {
  const data1 = [
    [
      { content: "I" },
      { content: "Cả nước", styles: { fontStyle: 'bold', align: 'left' } }
    ]
  ];
  if (datas?.luuVucSongLienTinhs && !datas?.luuVucSongNoiTinhs) {
    data1.push([
      { content: "II", styles: { fontStyle: 'bold' } },
      { content: `Lưu vực sông liên tỉnh`, styles: { fontStyle: 'bold', align: 'left' } }
    ]);
    datas?.luuVucSongLienTinhs?.forEach((lvs, lvsIndex) => {
      const rowData = [
        lvsIndex + 1,
        lvs.luuVucSong,
        lvs.phuongXa,
        lvs.quanHuyen,
        lvs.tinhThanh,
        lvs.thang1,
        lvs.thang2,
        lvs.thang3,
        lvs.thang4,
        lvs.thang5,
        lvs.thang6,
        lvs.thang7,
        lvs.thang8,
        lvs.thang9,
        lvs.thang10,
        lvs.thang11,
        lvs.thang12,
        lvs.muaMua,
        lvs.muaKho,
        lvs.caNam
      ];
      data1.push(rowData);
    });
  }
  if (datas?.luuVucSongNoiTinhs && !datas?.luuVucSongLienTinhs) {
    data1.push([
      { content: "II", styles: { fontStyle: 'bold' } },
      { content: `Lưu vực sông nội tỉnh`, styles: { fontStyle: 'bold', textAlign: 'left' } }
    ]);
    datas?.luuVucSongNoiTinhs?.forEach((lvs, lvsIndex) => {
      const rowData = [
        lvsIndex + 1,
        lvs.luuVucSong,
        lvs.phuongXa,
        lvs.quanHuyen,
        lvs.tinhThanh,
        lvs.thang1,
        lvs.thang2,
        lvs.thang3,
        lvs.thang4,
        lvs.thang5,
        lvs.thang6,
        lvs.thang7,
        lvs.thang8,
        lvs.thang9,
        lvs.thang10,
        lvs.thang11,
        lvs.thang12,
        lvs.muaMua,
        lvs.muaKho,
        lvs.caNam
      ];
      data1.push(rowData);
    });
  }
  if (datas?.luuVucSongNoiTinhs && datas?.luuVucSongLienTinhs) {
    data1.push([
      { content: "II", styles: { fontStyle: 'bold' } },
      { content: `Lưu vực sông liên tỉnh`, styles: { fontStyle: 'bold', textAlign: 'left' } }
    ]);
    datas?.luuVucSongLienTinhs?.forEach((lvs, lvsIndex) => {
      const rowData = [
        lvsIndex + 1,
        lvs.luuVucSong,
        lvs.phuongXa,
        lvs.quanHuyen,
        lvs.tinhThanh,
        lvs.thang1,
        lvs.thang2,
        lvs.thang3,
        lvs.thang4,
        lvs.thang5,
        lvs.thang6,
        lvs.thang7,
        lvs.thang8,
        lvs.thang9,
        lvs.thang10,
        lvs.thang11,
        lvs.thang12,
        lvs.muaMua,
        lvs.muaKho,
        lvs.caNam
      ];
      data1.push(rowData);
    });
    data1.push([
      { content: "III", styles: { fontStyle: 'bold' } },
      { content: `Lưu vực sông nội tỉnh`, styles: { fontStyle: 'bold', textAlign: 'left' } }
    ]);
    datas?.luuVucSongNoiTinhs?.forEach((lvs, lvsIndex) => {
      const rowData = [
        lvsIndex + 1,
        lvs.luuVucSong,
        lvs.phuongXa,
        lvs.quanHuyen,
        lvs.tinhThanh,
        lvs.thang1,
        lvs.thang2,
        lvs.thang3,
        lvs.thang4,
        lvs.thang5,
        lvs.thang6,
        lvs.thang7,
        lvs.thang8,
        lvs.thang9,
        lvs.thang10,
        lvs.thang11,
        lvs.thang12,
        lvs.muaMua,
        lvs.muaKho,
        lvs.caNam
      ];
      data1.push(rowData);
    });
  }
  return data1;
};

const dataTB2InBieu5 = (datas) => {
  const data2 = [];
  datas?.luuVucSongs?.forEach((lvs, lvsIndex) => {
    data2.push([
      { content: `${lvsIndex + 1}` },
      { content: `${lvs.luuVucSong}` }
    ]);
    // Duyệt qua các trạm
    lvs.trams.forEach((tram, index) => {
      const rowData = [
        index + 1,
        tram.tram,
        tram.phuongXa,
        tram.quanHuyen,
        tram.tinhThanh,
        tram.thang1,
        tram.thang2,
        tram.thang3,
        tram.thang4,
        tram.thang5,
        tram.thang6,
        tram.thang7,
        tram.thang8,
        tram.thang9,
        tram.thang10,
        tram.thang11,
        tram.thang12,
        tram.muaMua,
        tram.muaKho,
        tram.caNam
      ];
      data2.push(rowData);
    });
  });
  return data2;
};
// biểu 9 

const dataTB1InBieu9 = (datas) => {
  const data1 = [
    [
      { content: "" },
      { content: "Cả nước", styles: { fontStyle: 'bold' } }
    ]
  ];
  datas?.namVaLuuVucSongs?.forEach((nam, namIndex) => {
    // Dòng chỉ năm
    data1.push([
      { content: `${convertNummberToLaMa(namIndex + 1)}`, styles: { fontStyle: 'bold' } },
      { content: `Năm ${nam.nam}`, styles: { fontStyle: 'bold' } }
    ]);
    // Dòng "Cả nước" cho từng năm
    data1.push([
      { content: `${namIndex + 1}`, styles: { fontStyle: 'bold' } },
      { content: "Cả nước", styles: { fontStyle: 'bold' } }
    ]);
    // Duyệt qua các lưu vực sông
    nam.luuVucSongs.forEach((lvs, lvsIndex) => {
      // Dòng lưu vực sông
      data1.push([
        { content: `${namIndex + 1}.${lvsIndex + 1}` },
        { content: `${lvs.luuVucSong}` }
      ]);

      // Duyệt qua các trạm
      lvs.trams.forEach((tram, index) => {
        const rowData = [
          lvsIndex + 1,
          tram.tram,
          tram.xa,
          tram.huyen,
          tram.tinh,
          tram.thang1,
          tram.thang2,
          tram.thang3,
          tram.thang4,
          tram.thang5,
          tram.thang6,
          tram.thang7,
          tram.thang8,
          tram.thang9,
          tram.thang10,
          tram.thang11,
          tram.thang12,
          tram.muaMua,
          tram.muaKho,
          tram.caNam
        ];
        data1.push(rowData);
      });
    });
  });
  return data1;
};

const dataTB2InBieu9 = (datas) => {
  const data2 = [];
  datas?.namVaTinhs?.forEach((nam, namIndex) => {
    // Dòng chỉ năm
    data2.push([
      { content: `${convertNummberToLaMa(namIndex + 1)}`, styles: { fontStyle: 'bold' } },
      { content: `Năm ${nam.nam}`, styles: { fontStyle: 'bold' } }
    ]);
    // Dòng "Cả nước" cho từng năm
    data2.push([
      { content: `${namIndex + 1}`, styles: { fontStyle: 'bold' } },
      { content: "Cả nước", styles: { fontStyle: 'bold' } }
    ]);
    // Duyệt qua các lưu vực sông
    nam.tinhs.forEach((tinh, tinhIndex) => {
      // Dòng lưu vực sông
      data2.push([
        { content: `${namIndex + 1}.${tinhIndex + 1}` },
        { content: `${tinh.tinh}` }
      ]);

      // Duyệt qua các trạm
      tinh.trams.forEach((tram, index) => {
        const rowData = [
          index + 1,
          tram.tram,
          tram.xa,
          tram.huyen,
          tram.tinh,
          tram.thang1,
          tram.thang2,
          tram.thang3,
          tram.thang4,
          tram.thang5,
          tram.thang6,
          tram.thang7,
          tram.thang8,
          tram.thang9,
          tram.thang10,
          tram.thang11,
          tram.thang12,
          tram.muaMua,
          tram.muaKho,
          tram.caNam
        ];
        data2.push(rowData);
      });
    });
  });
  return data2;
};
// biểu 11

const dataTB1InBieu11 = (datas) => {
  const data1 = [];
  datas?.luuVucSongs2?.forEach((lvs, lvsIndex) => {
    data1.push([
      { content: `${convertNummberToLaMa(lvsIndex + 1)}`, styles: { fontStyle: 'bold' } }, // Ô số thứ tự
      {
        content: ` ${lvs.luuVucSong}`, styles: { fontStyle: 'bold' }
      }
    ]);
    // Thêm các tầng chứa nước của lưu vực sông
    lvs.tangChuaNuocs.forEach((tcn, index) => {
      const row = [
        index + 1,
        tcn.nuocNgotDienTichPhanBo,
        tcn.nuocNgotTruLuongTiemNang,
        tcn.nuocNgotTruLuongCoTheKhaiThac,
        tcn.nuocManDienTichPhanBo,
        tcn.nuocManTruLuong,
        // thêm các thuộc tính khác của tầng chứa nước theo cột dữ liệu của bạn
      ];
      data1.push(row);
    });
  });
  return data1;
};

const dataTB2InBieu11 = (datas) => {
  const data2 = [];
  data2.push([
    { content: "" }, // Ô số thứ tự
    { content: "Cả nước", styles: { fontStyle: 'bold' } } // Ô tên tỉnh thành trải dài qua các cột còn lại
  ]);
  datas?.tinhThanhs?.forEach((tinh, tinhIndex) => {
    // thêm cả STT vào ô 1 lvs ở ô 2 
    data2.push([
      { content: `${tinhIndex + 1}` }, // Ô số thứ tự
      { content: tinh.tinhThanh } // Ô tên tỉnh thành trải dài qua các cột còn lại
    ]);
    tinh.tangChuaNuocs.forEach((tcn, index) => {
      const row = [
        index + 1,
        tcn.tangChuaNuoc,
        tcn.nuocNgotDienTichPhanBo,
        tcn.nuocNgotViTriHanhChinh,
        tcn.nuocNgotTruLuongTiemNang,
        tcn.nuocNgotTruLuongCoTheKhaiThac,
        tcn.nuocManDienTichPhanBo,
        tcn.nuocManViTriHanhChinh,
        tcn.nuocManTruLuong,
      ];
      data2.push(row);
    });
  });
  return data2;
};
