let isPaused = false;
let isCancelled = false;
// Worker này sẽ thực hiện import dữ liệu bảng 19
const self = this;
self.onmessage = async function (e) {
  if (e.data.command === 'start') {
    isPaused = false;
    isCancelled = false;
    const { initialValues, selectLVS, scope, coQuanThucHien, API_URI, accessoken, saveCompletedGroups, bieuMau, fileName } = e.data;
    let completedGroups = saveCompletedGroups || 0;
    const totalGroups = initialValues.length;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = completedGroups; i < totalGroups; i++) { // Tiếp tục từ nơi đã dừng
      const group = initialValues[i];
      if (isCancelled) {
        this.self.postMessage({ status: 'cancelled', group, completedGroups: 0, progress: 0 }); // Gửi thông báo hủy về luồng chính
        return; // Dừng quá trình import
      }
      while (isPaused) {
        await sleep(1000);
      }

      const dateObject = new Date(`${group.nam}-${group.thang}-${group.ngay}`); // Sửa lại để sử dụng group
      const dateNow = new Date();
      const ngayLapBieu = dateObject.getTime() || dateNow.getTime();
      const values = {
        ...group,
        Id: 0,
        ngayLapBieu: ngayLapBieu,
        coQuanCapTinh: 'Bộ Tài nguyên và Môi trường',
        hoHoacCongTrinhs: group.hoHoacCongTrinhs.map((ho) => ({ ...ho })),
        luuVucSong: selectLVS?.luuVucSong,
        luuVucSongId: selectLVS?.luuVucSongId,
        tinhThanh: group.tinhThanh,
        createdByFile: fileName,
        quanHuyen: group.quanHuyen,
        phuongXa: group.phuongXa,
      };

      if (scope === 'dvtt') {
        values.coQuanThucHien = coQuanThucHien?.tenMuc;
      }
      if (scope === 'tw') {
        values.coQuanThucHien = 'Bộ Tài nguyên và Môi trường';
      }
      let data = convertToFloatForSelectedKeys(values, ['soLuongGieng', 'chieuSauKhaiThac', 'luongNuocUocTinh']);
      if (bieuMau === '19') {
        data = convertToFloatForSelectedKeys(values, ['soLuongGieng', 'chieuSauKhaiThac', 'luongNuocUocTinh']);
      }
      if (bieuMau === '17') {
        data = convertToFloatForSelectedKeys({ ...values }, ['luongNuocUocTinh', 'dienTichTuoi', 'dienTichNuoiTrongThuySan', 'congSuatPhatDien', 'soHoDanDuocCapNuoc']);
      }
      if (bieuMau === '21') {
        data = convertToFloatForSelectedKeys({ ...values }, ['luuLuongNuocThai', 'luongNuocSuDung']);
      }
      try {
        const response = await fetch(`${API_URI}bieu${bieuMau}/addorupdate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessoken}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          completedGroups++;
          const progress = Math.round((completedGroups / totalGroups) * 100);
          self.postMessage({ status: 'success', group, completedGroups, totalGroups, progress });

          if (progress === 100) {
            await sleep(1000);
            self.postMessage({ status: 'completed', progress });
          }
        } else {
          throw new Error('Lỗi kết nối!');

        }
      } catch (error) {
        self.postMessage({ status: 'error', message: error.message });
        return; // Dừng quá trình import
      }

      await sleep(1000); // Thời gian nghỉ giữa các nhóm
    }
  } else if (e.data.command === 'pause') {
    isPaused = true;
  } else if (e.data.command === 'resume') {
    isPaused = false;
  }
  else if (e.data.command === 'cancel') {
    //thoát khỏi hàm
    isCancelled = true;
    isPaused = false;

  }
};

// Hàm để chuyển đổi giá trị sang số thập phân
function convertToFloatForSelectedKeys(obj, keys) {
  const newObj = { ...obj };
  keys.forEach(key => {
    if (newObj[key]) {
      newObj[key] = parseFloat(newObj[key]);
    }
  });
  return newObj;
}
