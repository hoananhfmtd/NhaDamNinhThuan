import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import 'jspdf-autotable';
import { fontBold } from '/src/assets/fonts/TimesNewRomanBold.js';
import { fontItalic } from '/src/assets/fonts/TimesNewRomanItalic.js';
import { font } from '/src/assets/fonts/TimesNewRomanNomarl.js';

const addHeader = (doc, kieuInPDF, valueIn, bieuMauBoldphuDe, bieuMauIn, scopeIn) => {
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

    doc.setFontSize(scopeIn === 'dvtt' ? 10 : 13);
    doc.text(`${(valueIn.tieuDe || '').toUpperCase()}`, 150, 45, { align: 'center', fontWeight: 'bold' });
    if (bieuMauBoldphuDe.includes(bieuMauIn)) {
      doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
      doc.setFont("TimesNewRoman", "bold");
      doc.text(`${valueIn.phuDeIn}`, 150, 50
        , { align: 'center' });
    } else {
      doc.setFontSize(scopeIn === 'dvtt' ? 8 : 10);
      doc.setFont("TimesNewRoman", "normal");
      doc.text(`${valueIn.phuDeIn}`, 150, 50
        , { align: 'center', maxWidth: 240 });
    }
    if (bieuMauIn === '17' || bieuMauIn === '19') {
      doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
      doc.setFont("TimesNewRoman", "bold");
      doc.text(`Xã/phường/thị trấn: ${valueIn.phuongXa || '.............'}......, Quận/huyện/thị xã: ${valueIn.quanHuyen || '.............'}......, Tỉnh/thành phố: ${valueIn.tinhThanh || '.............'}......`, 150, 55
        , { align: 'center' });
    }
    if (bieuMauIn === '21') {
      doc.setFontSize(scopeIn === 'dvtt' ? 8 : 10);
      doc.setFont("TimesNewRoman", "bold");
      doc.text(`Xã/phường/thị trấn: ${valueIn.phuongXa || '.............'}......, Quận/huyện/thị xã: ${valueIn.quanHuyen || '.............'}......, Tỉnh/thành phố: ${valueIn.tinhThanh || '.............'}......`, 150, 55
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
    doc.setFontSize(scopeIn === 'dvtt' ? 9 : 12);
    doc.setFont("TimesNewRoman", "normal");
    doc.text(`${valueIn.phuDeIn}`, 110, 50
      , { align: 'center' });
  }
};
const addFooter = (doc, startY, kieuInPDF, valueIn, bieuMauShow, bieuMauIn) => {
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
      doc.text(`${valueIn?.noiLapBieu || "......"} ngày ${valueIn?.ngay || "......"} tháng ${valueIn?.thang || "......"} năm ${valueIn?.nam || "......"}`, 240, footerY + 2, { align: 'center' });
      doc.setFont("TimesNewRoman", "bold");
      doc.text("\nCơ quan thực hiện", 240, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
      doc.setFont("TimesNewRoman", "italic");
      doc.text("\n(Ký, đóng dấu, họ tên)", 240, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
    } else {

      doc.setFont("TimesNewRoman", "normal");
      doc.text(`${valueIn?.noiCungCapThongTin || "......"} ngày ${valueIn?.ngay || "......"} tháng ${valueIn?.thang || "......"} năm ${valueIn?.nam || "......"}`, 240, footerY + 2, { align: 'center' });
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
    doc.text(`${valueIn?.noiLapBieu || "......"} ngày ${valueIn?.ngay || "......"} tháng ${valueIn?.thang || "......"} năm ${valueIn?.nam || "......"}`, 170, footerY + 2, { align: 'center' });
    doc.setFont("TimesNewRoman", "bold");
    doc.text("\nCơ quan thực hiện", 170, footerY + 3, { align: 'center' }); // Dòng này sẽ in đậm
    doc.setFont("TimesNewRoman", "italic");
    doc.text("\n(Ký, đóng dấu, họ tên)", 170, footerY + 8, { align: 'center' }); // Dòng này sẽ in đậm
  }

};
function processData(doc, totalPages, data, columns, fontSize = 9) {
  doc.autoTable({
    startY: totalPages === 0 ? 60 : doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30, // Điều chỉnh startY dựa trên bảng trước đó
    head: columns,
    body: data,
    theme: 'grid',
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      textColor: 0,
      fontSize,
      font: 'TimesNewRoman',
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 0,
      fontSize,
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
      cellWidth: 'wrap',
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    margin: { left: 20, right: 20 },
    // willDrawCell: function (data) {
    //   console.log('data', data.row.index)
    // },
  });

  return doc.lastAutoTable.finalY;
}
let doc;
let totalBanGhiPDF = 0;
let totalFilePDF = 0;
onmessage = async function (e) {
  const message = e.data;
  const bigDataArray = message.dataIn; // Dữ liệu được truyền vào từ UI
  const bieuMauIn = message.bieuMau;
  const bieuMauShow = ['12', '13', '15'];
  const bieuMauBoldphuDe = ['23', '24'];
  const fontSizeTBIn = message.fontSizeTB;
  const columnIn = message.columnPDF;
  const valueIn = message.values;
  const kieuInPDF = message.kieuIn || '';
  const scopeIn = message.scope || '';
  const isLastChunk = message.isLastChunk || false;
  const startIndex = message.startIndex || 0;
  let chunkIndex = message.chunkIndex || 0;
  let totalPages = message.totalPages;
  if (!doc) {
    // Khởi tạo jsPDF
    doc = new jsPDF(kieuInPDF || 'portrait');
    doc.addFileToVFS("TimesNewRoman-normal.ttf", font);
    doc.addFileToVFS("TimesNewRoman-bold.ttf", fontBold);
    doc.addFileToVFS("TimesNewRoman-italic.ttf", fontItalic);
    doc.addFont("TimesNewRoman-normal.ttf", "TimesNewRoman", "normal");
    doc.addFont("TimesNewRoman-bold.ttf", "TimesNewRoman", "bold");
    doc.addFont("TimesNewRoman-italic.ttf", "TimesNewRoman", "italic");
    doc.setFont("TimesNewRoman", "normal");
    if (totalPages === 0) {
      addHeader(doc, kieuInPDF, valueIn, bieuMauBoldphuDe, bieuMauIn, scopeIn);
    }
  }
  // Header chỉ cho trang đầu tiên
  // Dữ liệu bảng
  const columns = columnIn;
  const dataChunk = dataTable(bieuMauIn, bigDataArray, startIndex);
  processData(doc, totalPages, dataChunk, columns, fontSizeTBIn);
  if (isLastChunk) {
    addFooter(doc, doc.lastAutoTable.finalY, kieuInPDF, valueIn, bieuMauShow, bieuMauIn);
  }
  const pdfBlob = doc.output('blob');
  saveToIndexedDB(pdfBlob, chunkIndex);
  doc = null;
  totalPages++;
  chunkIndex++;
  totalBanGhiPDF = totalBanGhiPDF + bigDataArray.length;
  // set số dòng 1 file pdf
  if (totalBanGhiPDF >= 20000 || (isLastChunk && totalBanGhiPDF > 0)) {
    await new Promise((resolve) => {
      mergePDFChunks(async (chunks) => {
        await GopFile(chunks);
        resolve();
      });
    });
    totalBanGhiPDF = 0;
    await clearIndexedDB();
  }
  if (!isLastChunk) {
    postMessage({ status: 'progress', chunkIndex, totalPages });
  } else {
    postMessage({ status: "success", message: "✅ Tất cả các file PDF đã tải xuống hoàn tất!" });
    self.close();
  }
};

async function GopFile(chunks) {
  try {
    let mergedPdfDoc = await PDFDocument.create();
    for (const chunk of chunks) {
      const chunkArrayBuffer = await chunk.arrayBuffer();
      const pdfDoc = await PDFDocument.load(chunkArrayBuffer);
      const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      for (const page of copiedPages) {
        mergedPdfDoc.addPage(page);
      }
    }
    const pdfBlob = await saveAndReset(mergedPdfDoc);
    totalFilePDF++;
    postMessage({
      status: "download",
      pdf: pdfBlob,
      message: `Đang tải xuống file PDF thứ ${totalFilePDF}`,
      totalFilePDF,
    });


  } catch (error) {
    console.error("❌ Lỗi khi gộp PDF:", error);
    postMessage({ status: "error", message: error.message });
  }
}
// 🛠 **Hàm tạo Blob từ PDF**
async function saveAndReset(pdfDoc) {
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}



// 🛠 **Xóa IndexedDB sau khi hợp nhất**
async function clearIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PDFChunksDB", 1);

    request.onsuccess = function () {
      const db = request.result;
      const transaction = db.transaction("pdfChunks", "readwrite");
      const store = transaction.objectStore("pdfChunks");

      store.clear().onsuccess = function () {
        db.close();
        resolve();
      };
    };

    request.onerror = function (e) {
      console.error("❌ Lỗi khi xóa IndexedDB:", e);
      reject(e);
    };
  });
}

function saveToIndexedDB(blob, chunkIndex) {
  const request = indexedDB.open("PDFChunksDB", 1);

  request.onupgradeneeded = function () {
    const db = request.result;
    if (!db.objectStoreNames.contains("pdfChunks")) {
      db.createObjectStore("pdfChunks", { keyPath: "chunkIndex" });
    }
  };

  request.onsuccess = function () {
    const db = request.result;
    const transaction = db.transaction("pdfChunks", "readwrite");
    const store = transaction.objectStore("pdfChunks");

    store.put({ chunkIndex, blob });

    transaction.oncomplete = function () {
    };

    transaction.onerror = function (e) {
      console.error("Error saving chunk to IndexedDB:", e);
    };
  };

  request.onerror = function (e) {
    console.error("Error opening IndexedDB:", e);
  };
}

function mergePDFChunks(callback) {
  const request = indexedDB.open("PDFChunksDB", 1);

  request.onsuccess = function () {
    const db = request.result;
    const transaction = db.transaction("pdfChunks", "readonly");
    const store = transaction.objectStore("pdfChunks");
    const chunks = [];

    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        chunks.push(cursor.value.blob);
        cursor.continue();
      } else {
        // Sau khi đọc hết các chunk, callback để xử lý
        callback(chunks);
      }
    };

    transaction.onerror = function (e) {
      console.error("Error reading chunks from IndexedDB:", e);
    };
  };

  request.onerror = function (e) {
    console.error("Error opening IndexedDB:", e);
  };
}

const dataTable = (bieuMauIn, datas, startIndex) => {
  switch (bieuMauIn) {
    case '4':
      return dataIn4(datas);
    case '6':
      return dataIn6(datas);
    case '7':
      return dataIn7(datas);
    case '8':
      return dataIn8(datas);
    case '10':
      return dataIn10(datas);
    case '12':
      return dataIn12(datas);
    case '13':
      return dataIn13(datas);
    case '14':
      return dataIn14(datas);
    case '15':
      return dataIn15(datas);
    case '17':
      return dataIn17(datas);
    case '19':
      return dataIn19(datas);
    case '21':
      return dataIn21(datas);
    case '23':
      return dataIn23(datas, startIndex);
    case '24':
      return dataIn24(datas);
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
const dataIn4 = (datas) => {

  const data = [];
  data.push([
    { content: 'I', styles: { fontStyle: 'bold' } },
    { content: 'Cả nước', styles: { fontStyle: 'bold' } }
  ]);
  if (datas.luuVucSongs) {
    datas?.luuVucSongs.forEach((item, index) => {
      data.push([
        { content: convertNummberToLaMa(index + 1), styles: { fontStyle: 'bold' } },
        { content: item.luuVucSong, styles: { fontStyle: 'bold' } },
      ]);
      item.tangChuaNuocs.forEach((tcn, indexTangChua) => {
        data.push([
          { content: indexTangChua + 1, styles: { fontStyle: 'bold' } },
          { content: `${tcn.tangChuaNuoc || ''}` },
          { content: `${tcn.dienTichPhanBo || 0}` },
          { content: `${tcn.chieuSauPhanBoTu || 0}` },
          { content: `${tcn.chieuSauPhanBoDen || 0}` },
          { content: `${tcn.ghiChu || ''}` },
        ]);
      });

    });
  }

  if (datas?.tinh) {
    datas?.tinhs.forEach((item, index) => {
      data.push([
        { content: convertNummberToLaMa(index + 1), styles: { fontStyle: 'bold' } },
        { content: item.tinh, styles: { fontStyle: 'bold' } },
      ]);
      item.tangChuaNuocs.forEach((tcn, indexTangChua) => {
        data.push([
          { content: indexTangChua + 1, styles: { fontStyle: 'bold' } },
          { content: `${tcn.tangChuaNuoc || ''}` },
          { content: `${tcn.dienTichPhanBo || 0}` },
          { content: `${tcn.chieuSauPhanBoTu || 0}` },
          { content: `${tcn.chieuSauPhanBoDen || 0}` },
          { content: `${tcn.ghiChu || ''}` },
        ]);
      });
    });
  }

  return data;
};

const dataIn6 = (datas) => {
  const data = [];
  if (datas?.tinhs) {
    datas.tinhs.forEach((item, index) => {
      data.push([
        { content: `${index + 1}`, styles: { fontStyle: 'bold' } },
        { content: `${item.tinh}`, styles: { fontStyle: 'bold' } },
      ]);
      if (item.luuVucSongLienTinhs && item.luuVucSongNoiTinhs.length === 0) {
        data.push([
          { content: `1.1`, styles: { fontStyle: 'bold' } },
          { content: 'Lưu vực sông liên tỉnh', styles: { fontStyle: 'bold' } },
        ]);
        item.luuVucSongLienTinhs.forEach((song, indexLv) => {
          data.push([
            { content: `1.1.${indexLv + 1}`, styles: { fontStyle: 'bold' } },
            { content: `${song.luuVucSong}` },
          ]);
          song.viTris.forEach((viTri, indexViTri) => {
            const rowData = [
              '-',
              viTri.viTri,
              viTri.phuongXa,
              viTri.quanHuyen,
              viTri.thang1,
              viTri.thang2,
              viTri.thang3,
              viTri.thang4,
              viTri.thang5,
              viTri.thang6,
              viTri.thang7,
              viTri.thang8,
              viTri.thang9,
              viTri.thang10,
              viTri.thang11,
              viTri.thang12,
              viTri.muaMua,
              viTri.muaKho,
              viTri.caNam
            ];
            data.push(rowData);
          });
        });
      }
      if (item.luuVucSongNoiTinhs && !item.luuVucSongLienTinhs?.length === 0) {
        data.push([
          { content: `1.1`, styles: { fontStyle: 'bold' } },
          { content: 'Lưu vực sông nội tỉnh', styles: { fontStyle: 'bold' } },
        ]);
        item.luuVucSongNoiTinhs.forEach((song, indexLv) => {
          const rowData = [
            indexLv + 1,
            song.viTri,
            song.phuongXa,
            song.quanHuyen,
            song.thang1,
            song.thang2,
            song.thang3,
            song.thang4,
            song.thang5,
            song.thang6,
            song.thang7,
            song.thang8,
            song.thang9,
            song.thang10,
            song.thang11,
            song.thang12,
            song.muaMua,
            song.muaKho,
            song.caNam
          ];
          data.push(rowData);
        });
      }
      if (item.luuVucSongNoiTinhs?.length > 0 && item.luuVucSongLienTinhs?.length > 0) {
        if (item.luuVucSongLienTinhs) {
          data.push([
            { content: `1.1`, styles: { fontStyle: 'bold' } },
            { content: 'Lưu vực sông liên tỉnh', styles: { fontStyle: 'bold' } },
          ]);
          item.luuVucSongLienTinhs.forEach((song, indexLv) => {
            data.push([
              { content: `1.1.${indexLv + 1}`, },
              { content: `${song.luuVucSong}` },
            ]);
            song.viTris.forEach((viTri, indexViTri) => {
              const rowData = [
                '-',
                viTri.viTri,
                viTri.phuongXa,
                viTri.quanHuyen,
                viTri.thang1,
                viTri.thang2,
                viTri.thang3,
                viTri.thang4,
                viTri.thang5,
                viTri.thang6,
                viTri.thang7,
                viTri.thang8,
                viTri.thang9,
                viTri.thang10,
                viTri.thang11,
                viTri.thang12,
                viTri.muaMua,
                viTri.muaKho,
                viTri.caNam
              ];
              data.push(rowData);
            });
          }
          );
        }

        if (item.luuVucSongNoiTinhs) {
          data.push([
            { content: `1.2`, styles: { fontStyle: 'bold' } },
            { content: 'Lưu vực sông nội tỉnh', styles: { fontStyle: 'bold' } },
          ]);
          item.luuVucSongNoiTinhs.forEach((song, indexLv) => {
            const rowData = [
              indexLv + 1,
              song.viTri,
              song.phuongXa,
              song.quanHuyen,
              song.thang1,
              song.thang2,
              song.thang3,
              song.thang4,
              song.thang5,
              song.thang6,
              song.thang7,
              song.thang8,
              song.thang9,
              song.thang10,
              song.thang11,
              song.thang12,
              song.muaMua,
              song.muaKho,
              song.caNam
            ];
            data.push(rowData);
          });
        }
      }
    });
  }
  return data;
};
const dataIn7 = (datas) => {
  const data = [];
  if (datas?.luuVucSongs) {
    datas.luuVucSongs.forEach((item, index) => {
      data.push([
        { content: convertNummberToLaMa(index + 1), styles: { fontStyle: 'bold' } },
        { content: `${item.luuVucSong}`, styles: { fontStyle: 'bold' } },
      ]);
      if (item.songs?.length > 0) {
        item.songs.forEach((song, indexLv) => {
          data.push([
            { content: `  ${indexLv + 1}`, },
            { content: `${song.song}` },
          ]);
          const rowData1 = [
            '-',
            song.viTriChayVao.viTri,
            song.viTriChayVao.phuongXa,
            song.viTriChayVao.quanHuyen,
            song.viTriChayVao.tinhThanh,
            song.viTriChayVao.thang1,
            song.viTriChayVao.thang2,
            song.viTriChayVao.thang3,
            song.viTriChayVao.thang4,
            song.viTriChayVao.thang5,
            song.viTriChayVao.thang6,
            song.viTriChayVao.thang7,
            song.viTriChayVao.thang8,
            song.viTriChayVao.thang9,
            song.viTriChayVao.thang10,
            song.viTriChayVao.thang11,
            song.viTriChayVao.thang12,
            song.viTriChayVao.muaMua,
            song.viTriChayVao.muaKho,
            song.viTriChayVao.caNam
          ];
          const rowData2 = [
            '-',
            song.viTriChayRa.viTri,
            song.viTriChayRa.phuongXa,
            song.viTriChayRa.quanHuyen,
            song.viTriChayRa.tinhThanh,
            song.viTriChayRa.thang1,
            song.viTriChayRa.thang2,
            song.viTriChayRa.thang3,
            song.viTriChayRa.thang4,
            song.viTriChayRa.thang5,
            song.viTriChayRa.thang6,
            song.viTriChayRa.thang7,
            song.viTriChayRa.thang8,
            song.viTriChayRa.thang9,
            song.viTriChayRa.thang10,
            song.viTriChayRa.thang11,
            song.viTriChayRa.thang12,
            song.viTriChayRa.muaMua,
            song.viTriChayRa.muaKho,
            song.viTriChayRa.caNam
          ];
          data.push(rowData1);
          data.push(rowData2);
        });
      }
    });
  }
  return data;
};
const dataIn8 = (datas) => {
  const data = [];
  if (datas?.luuVucSongs) {
    datas.luuVucSongs.forEach((item, index) => {
      data.push([
        { content: convertNummberToLaMa(index + 1), styles: { fontStyle: 'bold' } },
        { content: `${item.luuVucSong}`, styles: { fontStyle: 'bold' } },
      ]);
      if (item.congTrinhs?.length > 0) {
        item.congTrinhs.forEach((ctrinh, indexct) => {
          const rowData1 = [
            indexct + 1,
            ctrinh?.ten || '',
            ctrinh?.phuongXa || '',
            ctrinh?.quanHuyen || '',
            ctrinh?.tinhThanh || '',
            ctrinh?.luuVucSongNhanNuoc || '',
            ctrinh?.trungBinhMuaLu || 0,
            ctrinh?.trungBinhMuaCan || 0,
            ctrinh?.trungBinhCaNam || 0,
          ];
          data.push(rowData1);
        });
      }
    });
  }
  return data;
};
const dataIn10 = (datas) => {
  const data = [];
  if (datas?.length !== 0) {
    datas?.forEach((item, index) => {
      data.push([
        index + 1,
        item.nguonNuoc,
        item.phuongXa,
        item.quanHuyen,
        item.tinhThanh,
        item.luuVucSong,
        item.giaTriWQI,
        item.thoiGian,
      ]);
    });
    return data;
  }

};
const dataIn12 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.luuVucSong,
      item.loaiCongTrinh,
      // Array.isArray(item.loaiCongTrinhs) ? item.loaiCongTrinhs.join(', ') : '',
      item.tenNguonNuoc,
      Array.isArray(item.mucDichSuDungs) ? item.mucDichSuDungs.join(', ') : '',
      item.dungTichHoChua,
      item.luuLuongKhaiThacTuoi,
      item.luuLuongPhiNongNghiep,
      item.congSuatPhatDien,
      item.mucDichKhac,
    ];
  });
};
// Gửi file PDF về UI dưới dạng Blob
const dataIn13 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.luuVucSong,
      item.loaiCongTrinh,
      // Array.isArray(item.loaiCongTrinhs) ? item.loaiCongTrinhs.join(', ') : '',
      Array.isArray(item.mucDichSuDungs) ? item.mucDichSuDungs.join(', ') : '',
      item.luuLuongKhaiThacTuoi,
      item.luuLuongPhiNongNghiep,
      item.luuLuongKhac
    ];
  });
};

const dataIn14 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.ten,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.luuLuongKhaiThacText,
      Array.isArray(item.mucDichSuDungs) ? item.mucDichSuDungs.join(', ') : '',
      item.ghiChu,
    ];
  });
};
const dataIn15 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.luuLuongNuocThai,
      item.loaiHinhNuocThai,
      item.nguonTiepNhanNuocThai,
      item.luuVucSong,
      item.ghiChu
    ];
  });
};
const dataIn17 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.thonXom,
      // item.loaiCongTrinhs.join(', '),
      item.loaiCongTrinh,
      item.tenNguonNuoc,
      item.mucDichSuDungs.join(', '),
      item.luuLuongKhaiThacText,
      item.dienTichTuoi,
      item.dienTichNuoiTrongThuySan,
      item.congSuatPhatDien,
      item.soHoDanDuocCapNuoc,
      item.cheDoKhaiThac,
      item.ghiChu
    ];
  });
};
const dataIn19 = (datas) => {

  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.thonXom,
      item.soLuongGieng,
      item.luuLuongKhaiThacText,
      item.loaiCongTrinh,
      // item.loaiCongTrinhs.join(', '),
      item.hinhThucKhaiThac,
      item.chieuSauKhaiThac,
      item.mucDichSuDungs.join(', '),
      item.tinhTrangSuDung
    ];
  });
};
const dataIn21 = (datas) => {

  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.thonXom,
      item.loaiHinhNuocThai,
      item.quyMoLoaiHinhNuocThai,
      item.nguonNuocSuDung,
      item.luongNuocSuDung,
      item.luuLuongNuocThai,
      item.nguonTiepNhanNuocThai,
      item.thongTinKhac
    ];
  });
};
const dataIn23 = (datas, startIndex) => {
  return datas?.map((item, index) => {
    return [
      startIndex + index + 1,
      item.tenChuHoHoacCongTrinh,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.loaiCongTrinh,
      // Array.isArray(item.loaiCongTrinhs) ? item.loaiCongTrinhs.join(', ') : '',
      item.tenNguonNuoc,
      Array.isArray(item.mucDichSuDungs) ? item.mucDichSuDungs.join(', ') : '',
      item.luuLuongKhaiThac,
      item.dienTichTuoi,
      item.dienTichNuoiTrongThuySan,
      item.congSuatPhatDien,
      item.chieuSauKhaiThac,
      item.soHoDanDuocCapNuoc,
      item.cheDoKhaiThac,
      item.ghiChu,
    ];
  });
}

const dataIn24 = (datas) => {
  return datas?.map((item, index) => {
    return [
      index + 1,
      item.tenChuHoHoacCongTrinh,
      item.vN2000x,
      item.vN2000y,
      item.phuongXa,
      item.quanHuyen,
      item.tinhThanh,
      item.loaiHinhNuocThai,
      item.quyMoLoaiHinhNuocThai,
      item.nguonNuocSuDung,
      item.luongNuocSuDung,
      item.luuLuongNuocThai,
      item.nguonTiepNhanNuocThai,
      item.thongTinKhac,
    ];
  });
}