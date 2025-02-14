namespace NghiepVu.Api.Models;

public class Consts
{
    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string User = "User";
        public const string GiamSat = "GiamSat";
    }

    public static class Scope
    {
        public const string Tw = "tw"; // root
        public const string Dvtt = "dvtt"; // các đơn vị trực thuộc Bộ
        public const string Tinh = "tinh";
    }

    public static Dictionary<string, DanhMuc> MucDichSuDungm { get; set; }
    public static List<DanhMuc> MucDichSuDungs = [
        new() { MaMuc = "DV", TenMuc = "Dịch vụ" },
        new() { MaMuc = "KD", TenMuc = "Kinh Doanh" },
        new() { MaMuc = "SX", TenMuc = "Sản xuất" },
        new() { MaMuc = "CQMT", TenMuc = "Cảnh quan môi trường" },
        new() { MaMuc = "YT", TenMuc = "Y tế" },
        new() { MaMuc = "NTTS", TenMuc = "Nuôi trồng thủy sản" },
        new() { MaMuc = "CNSH", TenMuc = "Cấp nước sinh hoạt" },
        new() { MaMuc = "PD", TenMuc = "Phát điện" },
        new() { MaMuc = "SXCN", TenMuc = "Sản xuất công nghiệp" },
        new() { MaMuc = "TIEU", TenMuc = "Tiêu" }, // ? "Tiêu úng"
        new() { MaMuc = "TNN", TenMuc = "Tưới nông nghiệp" },
        new() { MaMuc = "SH", TenMuc = "Ăn uống sinh hoạt" },
        new() { MaMuc = "KCN", TenMuc = "Khu, cụm công nghiệp" },
        new() { MaMuc = "SXCNTTCN", TenMuc = "Sản xuất công nghiệp, tiểu thủ công nghiệp" },
        new() { MaMuc = "LN", TenMuc = "Làng nghề" },
        new() { MaMuc = "KDDV", TenMuc = "Kinh doanh dịch vụ" },
        new() { MaMuc = "TUOI", TenMuc = "Tưới" },
        new() { MaMuc = "KHAC", TenMuc = "Loại khác" },
        new() { MaMuc = "CNSHNT", TenMuc = "Cấp nước sinh hoạt nông thôn" },
        new() { MaMuc = "CNDT", TenMuc = "Cấp nước đô thị" },
        new() { MaMuc = "CNKK", TenMuc = "Cấp nước khai khoáng" },
        new() { MaMuc = "CNKCN", TenMuc = "Cấp nước khu công nghiệp" },
        new() { MaMuc = "TU", TenMuc = "Tiêu úng" },
        new() { MaMuc = "NDM", TenMuc = "Ngăn đẩy mặn" },
        new() { MaMuc = "DL", TenMuc = "Du lịch" },
        new() { MaMuc = "TS", TenMuc = "Thủy sản" },
    ];

    // NuocMat or NuocNgam
    public static class MucDichKhaiThac
    {
        // is sx nong nghiep
        public static bool IsMucDichTuoi(string maMucDichSuDung) => maMucDichSuDung is (not null and "TNN") or (not null and "TUOI") or (not null and "TIEU");
        private static bool IsMucDichKhac(string maMucDichSuDung)
        {
            if (maMucDichSuDung is null or "")
            {
                return true; // only khac
            }
            // TODO move by a TangDong "SH" is SXKD, "tieu" is Tuoi
            // TODO "nganDayMan" or "ung" is same with "tieu"
            return maMucDichSuDung is "KHAC" or "NDM" or "TU";
        }
        public static bool IsPhiNongNghiep(string maMucDichSuDung)
        {
            if (maMucDichSuDung is null or "")
            {
                return false;
            }
            return !(IsMucDichTuoi(maMucDichSuDung) || IsMucDichKhac(maMucDichSuDung));
        }
    }

    public static class MucDichSuDungNuocBien
    {
        public static bool IsKinhDoanhDV(string maMucDichSuDung)
        {
            if (maMucDichSuDung is null or "")
            {
                return false;
            }
            return maMucDichSuDung is "DV" or "KD" or "KDDV";
        }

        public static bool IsSXCongNghiep(string maMucDichSuDung)
        {
            if (maMucDichSuDung is null or "")
            {
                return false;
            }
            return maMucDichSuDung is "SXCNTTCN" or "KCN" or "SXCN" or "CNKCN";
        }
    }

    public static Dictionary<string, DanhMuc> LoaiHinhNuocThaim { get; set; }
    public static List<DanhMuc> LoaiHinhNuocThais = [
        new() { MaMuc = "SH", TenMuc = "Sinh hoạt" },
        new() { MaMuc = "CN", TenMuc = "Công nghiệp" },
        new() { MaMuc = "YT", TenMuc = "Y tế" },
        new() { MaMuc = "LM", TenMuc = "Làm mát'" },
        new() { MaMuc = "TS", TenMuc = "Thủy sản" },
        new() { MaMuc = "CNU", TenMuc = "Chăn nuôi'" },
        new() { MaMuc = "DVKS", TenMuc = "Dịch vụ khách sạn" },
        new() { MaMuc = "NN", TenMuc = "Nông nghiệp" },
        new() { MaMuc = "LN", TenMuc = "Làng nghề" },
    ];

    public static Dictionary<string, DanhMuc> LoaiCongTrinhm { get; set; }
    public static List<DanhMuc> LoaiCongTrinhs = [
        new() { MaMuc = LoaiCongTrinh.ML, TenMuc = "Mạch lộ" },
        new() { MaMuc = LoaiCongTrinh.TB, TenMuc = "Trạm bơm" },
        new() { MaMuc = LoaiCongTrinh.TCNTT, TenMuc = "Trạm cấp nước tập trung" },
        new() { MaMuc = LoaiCongTrinh.GD, TenMuc = "Giếng đào" },
        new() { MaMuc = LoaiCongTrinh.GK, TenMuc = "Giếng khoan" },
        new() { MaMuc = LoaiCongTrinh.NMN, TenMuc = "Nhà máy nước" },
        new() { MaMuc = LoaiCongTrinh.KD, TenMuc = "Kênh dẫn" },
        new() { MaMuc = LoaiCongTrinh.NTTS, TenMuc = "NTTS" },
        new() { MaMuc = LoaiCongTrinh.HO, TenMuc = "Hồ" },
        new() { MaMuc = LoaiCongTrinh.DD, TenMuc = "Đập dâng" },
        new() { MaMuc = LoaiCongTrinh.CONG, TenMuc = "Cống" },
        new() { MaMuc = LoaiCongTrinh.HCTD, TenMuc = "Hồ chứa TĐ" },
        new() { MaMuc = LoaiCongTrinh.HCTL, TenMuc = "Hồ chứa TL" },
        new() { MaMuc = LoaiCongTrinh.DV, TenMuc = "Dịch vụ" },
        new() { MaMuc = LoaiCongTrinh.KHAC, TenMuc = "Loại khác" },
    ];

    public static class LoaiCongTrinh
    {
        public const string ML = "ML";
        public const string TB = "TB";
        public const string TCNTT = "TCNTT";
        public const string GD = "GD";
        public const string GK = "GK";
        public const string NMN = "NMN";
        public const string KD = "KD";
        public const string NTTS = "NTTS";
        public const string HO = "HO";
        public const string DD = "DD";
        public const string CONG = "CONG";
        public const string HCTD = "HCTD";
        public const string HCTL = "HCTL";
        public const string DV = "DV";
        public const string KHAC = "KHAC";

        public static bool IsGiengKhoan(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is GK;
        }

        public static bool IsCong(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is CONG;
        }

        public static bool IsHoChua(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is HO or HCTD or HCTL;
        }

        public static bool IsDapDang(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is DD;
        }

        public static bool IsTramBom(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is TB;
        }

        public static bool IsNhaMayNuoc(string maLoaiCongTrinh)
        {
            if (maLoaiCongTrinh is null or "")
            {
                return false;
            }

            return maLoaiCongTrinh is NMN;
        }
    }
}
