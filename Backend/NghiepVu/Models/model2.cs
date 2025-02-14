namespace NghiepVu.Api.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;


public partial class MediaFile
{
    [JsonPropertyName("bucket_name")]
    public string? bucketName { get; set; }
    [JsonPropertyName("file_path")]
    public string? filePath { get; set; }
    [JsonPropertyName("file_oid")]
    public uint fileOid { get; set; }
    [Required]
    [JsonPropertyName("file_name")]
    public string? fileName { get; set; }
    [JsonPropertyName("file_ext")]
    public string? fileExt { get; set; }
    [JsonPropertyName("file_size")]
    [JsonConverter(typeof(StringToLongConverter))]
    public long fileSize { get; set; }
}

public partial class HeQuyChieu
{
    [JsonConverter(typeof(StringToIntConverter))]
    public int KTTDo { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int KTTPhut { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int KTTGiay { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int MuiChieu { get; set; } // 6 for 105_00(default), 3
}

#region taikhoannguoidung
public partial class NguoiDung
{
    public string? Id { get; set; }
    public string UserName { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; }
    public string? TinhThanhId { get; set; }
    public string? Scope { get; set; }
    public List<string>? Members { get; set; }
    public string? Supervisor { get; set; }
    public string? FullName { get; set; }
    public string? CoQuanThucHienId { get; set; }
    // for role user
    public List<string>? LuuVucSongLienTinhIds { get; set; }
    public List<string>? TinhThanhIds { get; set; }
    public List<string>? LuuVucSongNoiTinhIds { get; set; }
}
public partial class NguoiDungInfo
{
    public string? Id { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
}

public partial class ThongTinDangNhap
{
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Ip { get; set; }
    public string? Client { get; set; } // android, ios, web, app
    public string? DeviceInfo { get; set; } //Thiết bị: iPhone, Tên thiết bị: iPhone 11 Pro Max, phiên bản hệ điều hành: iOS 13.1 ...
    public string? ClientId { get; set; }

}

public partial class ThietBis
{
    public List<string>? IdThietBi { get; set; }
}


public partial class ReSetPass
{
    public string? Token { get; set; }
    public string? MatKhau { get; set; }
}
public partial class DoiPass
{
    public string? OldPass { get; set; }
    public string? NewPass { get; set; }
}

public partial class NguoiDungView
{
    public string? Id { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public string? TinhThanhId { get; set; }
    public string? TinhThanh { get; set; }
    public string? CoQuanThucHienId { get; set; }
    public string? CoQuanThucHien { get; set; }
    public string? FullName { get; set; }
    public string? Scope { get; set; }
    public List<string>? Members { get; set; }
    public string? Supervisor { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int DaXoa { get; set; }
    public string? Error { get; set; } // only server
    public string? TypeOfUser { get; set; }
    public List<ThietBiDangNhap>? ThongTinDangNhaps { get; set; }
    public string? ThongTinDangNhapJson { get; set; }

    // for role user
    public List<string>? LuuVucSongLienTinhIds { get; set; }
    public List<string>? TinhThanhIds { get; set; }
    public List<string>? LuuVucSongNoiTinhIds { get; set; }
}

public partial class NguoiDungRequest
{
    [JsonConverter(typeof(StringToIntConverter))]
    public int Limit { get; set; }
    public string Anchor { get; set; }
    public string? TuKhoa { get; set; }
    public string? TinhId { get; set; }
    public string? CoQuanThucHienId { get; set; }
    public string? Scope { get; set; }
    public string? Role { get; set; }
    public bool? CanBoDieuTra { get; set; }
    public List<string>? CoQuanThucHienIds { get; set; }
}

public partial class NguoiDungs
{
    public List<NguoiDungView>? Records { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int Limit { get; set; }
    public string? Anchor { get; set; }
    public int Count { get; set; }
}

#endregion

// account.scope = [tw, tinh], [account.matinh if scope = tinh], account.role = [admin, supervisor, user], account.id, [account.member_ids]
// list entities require query scope=account.scope, if scope==tinh require query tinhthanhId=account.tinhthanhId
// and if role==user require query created_by=account.id and if role==supervisor require query created_by in [account.id, account.member_ids...]
// there for create or update entity, should assign created_by, updated_by = account.id

// scope of entity is "tinh" if LVSid == null && tinhThanhId != null, elsewhere scope is "tw"

/// <summary>
/// 1. if role=admin, scope=tw, typeOfUser=system, account can create all include admintw
/// 2. if role=admin, scope=tw, account can create usertw, giamsattw, admintinh, usertinh, giamsattinh
/// 3. if role=admin, scope=tinh, account can create usertinh, giamsattinh
/// all account has default typeOfUser=monre
/// some account has typeOfUser=system, only firsttime
/// </summary>
// TODO system
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Created { get; set; }
    public string? CreatedBy { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Updated { get; set; }
    public string? UpdatedBy { get; set; }
    public string? ResetToken { get; set; }
    // role in scope
    // TODO co quan thuc hien
    public string? Scope { get; set; }
    public string? TinhThanhId { get; set; }
    public string? CoQuanThucHienId { get; set; }
    public List<string>? Members { get; set; }
    public string? Supervisor { get; set; }
    public string? ThongTinDangNhapJson { get; set; }
    [NotMapped] public List<ThietBiDangNhap>? ThongTinDangNhaps { get; set; }
    // limited in system
    [JsonConverter(typeof(StringToIntConverter))]
    public int DaXoa { get; set; } //0:khongxoa,1: xoa
    public string? TypeOfUser { get; set; } // [system, monre] and other [email in app, any in app]
    [NotMapped] public string? X { get; set; } // only for script

    // for role user
    public List<string>? LuuVucSongLienTinhIds { get; set; }
    public List<string>? TinhThanhIds { get; set; }
    public List<string>? LuuVucSongNoiTinhIds { get; set; }
}

public partial class ThietBiDangNhap
{

    public string? Id { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? TimeLogin { get; set; }
    public string? Ip { get; set; }
    public string? Token { get; set; }
    public string? Client { get; set; } // android, ios, web, app
    public string? DeviceInfo { get; set; } //Thiết bị: iPhone, Tên thiết bị: iPhone 11 Pro Max, phiên bản hệ điều hành: iOS 13.1 ...
    public string? ClientId { get; set; }
    public bool? Active { get; set; }

}

public class LuongNuocMatView
{
    public string? TinhThanhId { get; set; }
    public string? TinhThanh { get; set; }
    public string? CoQuanThucHienId { get; set; }
    public string? CoQuanThucHien { get; set; }
    public string? NguoiLapBieu { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long NgayLapBieu { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long NgayLapBieuHour { get; set; }
    public string? NguoiKiemTra { get; set; }
    public string? NoiLapBieu { get; set; }
    public string? LuuVucSong { get; set; }
    public string? LuuVucSongId { get; set; }
    [JsonConverter(typeof(StringToDoubleConverter))]
    public double? LuongNuoc { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int Id { get; set; }
    public string? TenBieuMau { get; set; }
}

public class ThongKeSoLuongBieuMau(string? tenbieumau, int? soluong)
{
    public string? TenBieuMau { get; set; } = tenbieumau;
    [JsonConverter(typeof(StringToIntConverter))]
    public int? SoLuong { get; set; } = soluong;
    [JsonConverter(typeof(StringToLongConverter))]
    public long? NgayThang { get; set; }
}

public class SoLuongBieuMau
{
    [JsonConverter(typeof(StringToIntConverter))]
    public int? SoLuong { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? NgayThang { get; set; }
    public string? NguoiTao { get; set; }
    public DateTime NgayThangDate { get; set; }
}

public class ReportDashBoardByDoiTuong
{
    public int SoLuongSongSuoiKenhRach { get; set; }
    public int SoLuongAoHoDamPha { get; set; }
    public double? SoDiemChatLuongNuocMat { get; set; }
    public int SoLuongCongTrinhKTSDNuocDD { get; set; }
    public double LuongNuocKTSDNuocDD { get; set; }
    public int SoLuongNguonNuocDD { get; set; }
    public double? TruLuongTiemNangNuocDD { get; set; }
    public double? TruLuongCoTheKhaiThacNuocDD { get; set; }
    public int SoLuongCongTrinhKTSDNuocBien { get; set; }
    public double? LuongNuocKTSDNuocBien { get; set; }
    public double? TongLuongDongChay { get; set; }
    public double? TongLuongDongChayVaoBienGioi { get; set; }
    public double? TongLuongDongChayRaBienGioi { get; set; }
    public double? LuongNuocChuyenGiuaCacLVS { get; set; }
    public double? TongDungTichCacHoChua { get; set; }
    public double? DienTichPhanBoNuocNgot { get; set; }
    public double? DienTichPhanBoNuocMan { get; set; }
    public int SoLuongCongTrinhXaThai { get; set; }
    public double? LuongNuocKTSDXaThai { get; set; }
    public double? TongLuongMuaCaNam { get; set; }
    public int SoLuongCongTrinhKTSDNuocMat { get; set; }
    public double LuongNuocKTSDNuocMat { get; set; }
}

public class QueryReportDashBoardByDoiTuong
{
    public string? Scope { get; set; }
    public List<string>? CoQuanThucHienIds { get; set; }
    public List<string>? TinhThanhIds { get; set; }
}

public class EndUserBug
{
    [Key] public int Id { get; set; }
    public string? MoTa { get; set; }
    [NotMapped] public List<MediaFile>? TepDinhKems { get; set; }
    public string? TepDinhKemsJSON { get; set; }
    public string? Status { get; set; } // new, open, closed
    public string? StatusNote { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Created { get; set; }
    public string? CreatedBy { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Updated { get; set; }
    public string? UpdatedBy { get; set; }
    public string? Scope { get; set; }
    public string? TinhThanhId { get; set; }
    public string? CoQuanThucHienId { get; set; }
    public void Deserialize()
    {
        if (this.TepDinhKemsJSON != null && this.TepDinhKemsJSON.Length > 0)
        {
            this.TepDinhKems = JsonSerializer.Deserialize<List<MediaFile>?>(this.TepDinhKemsJSON);
        }
    }

    public void Serialize() => this.TepDinhKemsJSON = JsonSerializer.Serialize(this.TepDinhKems);

}

// data from client
public partial class UserEventData
{
    public static List<string> EventTypes = [
        "create_bieu_mau",
        "update_bieu_mau",
        "delete_bieu_mau",
        "confirm_bieu_mau",
        "publish_bieu_mau",
        "open_app",
        "import_excel",
        "syncthetic_bieu_mau"
    ];
    public string? EventType { get; set; }
    public string? Description { get; set; } // for more information e.g import_excel
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Created { get; set; }
    public string? Ip { get; set; }
    public string? Client { get; set; } // android, ios, web, app
    public string? DeviceInfo { get; set; } //Thiết bị: iPhone, Tên thiết bị: iPhone 11 Pro Max, phiên bản hệ điều hành: iOS 13.1 ...
    public string? ClientId { get; set; }
    public string? WGS84 { get; set; } // GeoJSON gobal e.g POINT(21.0431097 105.7813832)
    public string? BieuMau { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int BieuMauId { get; set; }
}

public class UserEvent
{
    [Key] public int Id { get; set; }
    public string? Issuer { get; set; }
    [JsonConverter(typeof(StringToLongConverter))]
    public long? Created { get; set; }
    public string? EventType { get; set; }
    public string? Ip { get; set; }
    public string? Client { get; set; }
    public string? ClientId { get; set; }
    public string? WGS84 { get; set; } // GeoJSON gobal e.g POINT(21.0431097 105.7813832)
    [NotMapped] public UserEventData? Data { get; set; }
    public string? DataJSON { get; set; }
    public string? BieuMau { get; set; }
    [JsonConverter(typeof(StringToIntConverter))]
    public int BieuMauId { get; set; }

    public void Deserialize()
    {
        if (this.DataJSON != null && this.DataJSON.Length > 0)
        {
            this.Data = JsonSerializer.Deserialize<UserEventData?>(this.DataJSON);
        }
    }

    public void Serialize() => this.DataJSON = JsonSerializer.Serialize(this.Data);
}

public sealed class StringToLongConverter : JsonConverter<long>
{
    public override long Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {

        using (var jsonDoc = JsonDocument.ParseValue(ref reader))
        {
            if (jsonDoc.RootElement.ValueKind == JsonValueKind.Number)
            {
                if (jsonDoc.RootElement.TryGetInt64(out long number))
                {
                    return number;
                }

                reader.TryGetInt64(out number);
            }
        }

        var str = reader.GetString();
        if (str is null or "")
        {
            return 0;
        }
        if (long.TryParse(str, out long value))
        {
            return value;
        }

        reader.TryGetInt64(out value);
        return value;
    }

    public override void Write(
        Utf8JsonWriter writer,
        long value,
        JsonSerializerOptions options) => writer.WriteNumberValue(value);
}

public sealed class StringToIntConverter : JsonConverter<int>
{
    public override int Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {

        using (var jsonDoc = JsonDocument.ParseValue(ref reader))
        {
            if (jsonDoc.RootElement.ValueKind == JsonValueKind.Number)
            {
                if (jsonDoc.RootElement.TryGetInt32(out int number))
                {
                    return number;
                }

                reader.TryGetInt32(out number);
                return number;
            }
        }

        var str = reader.GetString();
        if (str is null or "")
        {
            return 0;
        }
        if (int.TryParse(str, out int value))
        {
            return value;
        }

        reader.TryGetInt32(out value);
        return value;
    }

    public override void Write(
        Utf8JsonWriter writer,
        int value,
        JsonSerializerOptions options) => writer.WriteNumberValue(value);
}

public sealed class StringToDoubleConverter : JsonConverter<double>
{
    public override double Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        using (var jsonDoc = JsonDocument.ParseValue(ref reader))
        {
            if (jsonDoc.RootElement.ValueKind == JsonValueKind.Number)
            {
                if (jsonDoc.RootElement.TryGetDouble(out double number))
                {
                    return number;
                }

                reader.TryGetDouble(out number);
                return number;
            }
        }

        var str = reader.GetString();
        if (str is null or "")
        {
            return 0;
        }

        if (double.TryParse(str, out double value))
        {
            return value;
        }

        double.TryParse(str, out value);
        return value;
    }

    public override void Write(
        Utf8JsonWriter writer,
        double value,
        JsonSerializerOptions options) => writer.WriteNumberValue(value);
}
