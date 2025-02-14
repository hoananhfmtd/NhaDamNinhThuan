namespace NghiepVu.Api.Models;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Caching;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
using System.Text.RegularExpressions;

public class Utils
{
    public static class TrangThaiBieuMau
    {
        public const string ChuaKiemTra = "ChuaKiemTra";
        public const string DaKiemTra = "DaKiemTra";
        public const string ChuaCongBo = "ChuaCongBo";
        public const string DaCongBo = "DaCongBo";
    }

    public static class LoaiLuuVucSong
    {
        public const string Lientinh = "lientinh";
        public const string Noitinh = "noitinh";
        public const string Noitinhdoclap = "noitinhdoclap";
    }

    public static class LoaiDiaDiem
    {
        public const string TaiLVSLT = "TaiLVSLT";
        public const string TaiLVSNT = "TaiLVSNT";
        public const string Tram = "Tram";
        public const string ViTriChayVao = "ViTriChayVao";
        public const string ViTriChayRa = "ViTriChayRa";
        public const string ViTri = "ViTri";
    }

    public static class BieuMaus
    {
        public const string BieuMauSo1 = "BieuMauSo1";
        public const string BieuMauSo2 = "BieuMauSo2";
        public const string BieuMauSo3 = "BieuMauSo3";
        public const string BieuMauSo4 = "BieuMauSo4";
        public const string BieuMauSo5 = "BieuMauSo5";
        public const string BieuMauSo6 = "BieuMauSo6";
        public const string BieuMauSo7 = "BieuMauSo7";
        public const string BieuMauSo8 = "BieuMauSo8";
        public const string BieuMauSo9 = "BieuMauSo9";
        public const string BieuMauSo10 = "BieuMauSo10";
        public const string BieuMauSo11 = "BieuMauSo11";
        public const string BieuMauSo12 = "BieuMauSo12";
        public const string BieuMauSo13 = "BieuMauSo13";
        public const string BieuMauSo14 = "BieuMauSo14";
        public const string BieuMauSo15 = "BieuMauSo15";
        public const string BieuMauSo17 = "BieuMauSo17";
        public const string BieuMauSo18 = "BieuMauSo18";
        public const string BieuMauSo19 = "BieuMauSo19";
        public const string BieuMauSo20 = "BieuMauSo20";
        public const string BieuMauSo21 = "BieuMauSo21";
        public const string BieuMauSo22 = "BieuMauSo22";
        public const string BieuMauSo23 = "BieuMauSo23";
        public const string BieuMauSo24 = "BieuMauSo24";
        public const string BieuMauSo25 = "BieuMauSo25";
    }

    public static class TypeOfUsers
    {
        public const string System = "system";
        public const string Monre = "monre";
        public const string Any = "any";
        public const string Email = "email"; // register from app
    }

    public static NguoiDungView? ReadAnyUser(IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, HttpContext httpContext)
    {
        var user = ReadUser(httpContextAccessor, userManager);
        if (user != null)
        {
            return user; // valid user
        }

        httpContext.Request.Headers.TryGetValue("x-client-id", out var xClientId);
        httpContext.Request.Headers.TryGetValue("x-tinh-thanh-id", out var xTinhThanhId);

        var anyone = xClientId.ToString();
        var tinhThanhId = xTinhThanhId.ToString();

        if (anyone == null || !anyone.Contains("any#"))
        {
            return null;
        }
        // TODO more validate

        if (tinhThanhId == null || !DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(tinhThanhId))
        {
            return null;
        }

        return new NguoiDungView()
        {
            UserName = anyone,
            TinhThanhId = tinhThanhId,
            Scope = Consts.Scope.Tinh,
            Role = Consts.UserRoles.User,
        };
    }

    public static bool CheckLogout(IHttpContextAccessor? httpContextAccessor, NguoiDungView user)
    {
        var authorizationHeader = httpContextAccessor?.HttpContext?.Request?.Headers?["Authorization"];
        var accessToken = string.Empty;
        if (authorizationHeader is not null && authorizationHeader.ToString().StartsWith("Bearer"))
        {
            accessToken = authorizationHeader.ToString()["Bearer ".Length..].Trim();
            var thongtindangnhap = user.ThongTinDangNhapJson;
            var lstthongtin = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(thongtindangnhap);
            var check = lstthongtin.Where(x => x.Token == accessToken).ToList();
            if (check != null && check.Count > 0)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        return true;
    }

    public static string LayAccessToken(IHttpContextAccessor? httpContextAccessor)
    {
        var token = "";
        var authorizationHeader = httpContextAccessor?.HttpContext?.Request?.Headers?["Authorization"];
        var accessToken = string.Empty;
        if (authorizationHeader is not null && authorizationHeader.ToString().StartsWith("Bearer"))
        {
            token = authorizationHeader.ToString()["Bearer ".Length..].Trim();
        }
        return token;
    }

    private static readonly MemoryCache cache = MemoryCache.Default;

    public static string? GetClient(IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, string? userName)
    {
        if (userName is null or "")
        {
            return "";
        }

        var token = LayAccessToken(httpContextAccessor);
        if (token is null or "")
        {
            return "";
        }

        var result = userManager.FindByNameAsync(userName).Result;
        if (result == null)
        {
            return "";
        }
        var rs = result.ThongTinDangNhapJson;
        if (rs is null)
        {
            return "";
        }

        var ds = new List<ThietBiDangNhap>();
        ds = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(rs);
        if (ds is null)
        {
            return "";
        }
        ds = ds.Where(x => x.Active == true).ToList();
        foreach (var item in ds)
        {
            if (item is not null && item.Token == token)
            {
                return item.Client;
            }
        }

        return "";
    }

    public static NguoiDungView? ReadUser(IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager)
    {
        // TODO not use username
        var username = httpContextAccessor?.HttpContext?.User?.Identity?.Name;
        if (username is null or "")
        {
            return null;
        }
        var token = LayAccessToken(httpContextAccessor);
        if (cache.Contains("users#" + token))
        {
            var user_cache = cache.Get("users#" + token) as NguoiDungView;
            var check_logout = CheckLogout(httpContextAccessor, user_cache);
            if (check_logout)
            {
                user_cache.Error = "user_logout";
                return null;
            }
            else
            {
                return cache.Get("users#" + token) as NguoiDungView;
            }
        }

        var user = GetUser(httpContextAccessor, userManager);
        if (user == null)
        {
            // TODO return notfound error
            return null;
        }

        if (user.Scope is null or "")
        {
            user.Error = "user_scope_invalid 0";
            return user;
        }

        if (user.Scope == Consts.Scope.Tinh && (user.TinhThanhId == null || user.TinhThanhId == ""))
        {
            user.Error = "user_scope_invalid 1";
            return user;
        }

        if (user.Scope == Consts.Scope.Dvtt && (user.CoQuanThucHienId == null || user.CoQuanThucHienId == ""))
        {
            user.Error = "user_scope_invalid 3";
            return user;
        }

        if (user.Scope is not Consts.Scope.Tinh and not Consts.Scope.Tw and not Consts.Scope.Dvtt)
        {
            user.Error = "user_scope_invalid 2";
            return user;
        }

        var checklogout = CheckLogout(httpContextAccessor, user);
        if (checklogout)
        {
            user.Error = "user_logout";
            return null;
        }

        cache.Add("users#" + token, user, new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddHours(2) });
        return user;
    }

    public static Dictionary<int, bool> BieuMauSoCuaTinhs = new() {
        { 2, true },
        { 3, true },
        { 5, true },
        { 6, true },
        { 10, true },
        { 12, true },
        { 15, true },
        { 16, true },
        { 17, true },
        { 18, true },
        { 21, true },
        { 22, true },
        { 23, true },
        { 24, true },
    };

    public static Dictionary<int, bool> BieuMauTongHops = new()
    {
        { 1, true },
        { 2, true },
        { 9, true },
        { 12, true },
        { 13, true },
        { 15, true },
        { 23, true },
        { 24, true },
    };

    public static string? ScopeError(NguoiDungView? user, int bieumauso)
    {
        if (user == null || user.Scope == null || user.Role == null)
        {
            return $"user_scope_invalid in {bieumauso}, ScopeError";
        }

        if (user.Role != Consts.UserRoles.Admin && BieuMauTongHops.ContainsKey(bieumauso))
        {
            return $"user_scope_invalid in bieu mau tong hop {bieumauso}, ScopeError";
        }

        if (user.Scope == Consts.Scope.Tw)
        {
            return "";
        }
        if (user.Scope == Consts.Scope.Tinh && BieuMauSoCuaTinhs.ContainsKey(bieumauso))
        {
            return "";
        }
        if (user.Scope == Consts.Scope.Dvtt && user.CoQuanThucHienId != null && user.CoQuanThucHienId == DanhMucs.TongCucKhiTuongThuyVan.MaMuc && (bieumauso == 9 || bieumauso == 25))
        {
            return "";
        }
        if (user.Scope == Consts.Scope.Dvtt && user.CoQuanThucHienId != null && user.CoQuanThucHienId != DanhMucs.TongCucKhiTuongThuyVan.MaMuc && bieumauso != 9 && bieumauso != 25)
        {
            return "";
        }
        return $"user_scope_invalid in {bieumauso}, ScopeError";
    }

    public static string? ReadError(NguoiDungView user, string? bieumauScope, string? bieumauCreatedBy, string? tinhThanhId, string? coQuanThucHienId)
    {
        if (user.Scope == Consts.Scope.Tw && user.Role == Consts.UserRoles.Admin)
        {
            return "";
        }

        if (user.Scope != bieumauScope)
        {
            return "user_scope_invalid read1";
        }

        if (user.Scope == Consts.Scope.Tinh && (tinhThanhId == null || tinhThanhId == "" || tinhThanhId != user.TinhThanhId))
        {
            return "user_scope_invalid read2";
        }

        if (user.Scope == Consts.Scope.Dvtt && (coQuanThucHienId == null || coQuanThucHienId == "" || coQuanThucHienId != user.CoQuanThucHienId))
        {
            return "user_scope_invalid read3";
        }

        if (user.Role == Consts.UserRoles.Admin)
        {
            return "";
        }

        if (bieumauScope == null || bieumauCreatedBy == null)
        {
            return "dbbieumau_invalid";
        }

        if (user.UserName == bieumauCreatedBy)
        {
            return "";
        }

        if (user.Role == Consts.UserRoles.GiamSat && user.Members != null && user.Members.Count > 0)
        {
            foreach (var member in user.Members)
            {
                if (member == bieumauCreatedBy)
                {
                    return "";
                }
            }
        }

        return "user_scope_invalid read0";
    }

    // allow not created by
    public static string? WriteDanhMucError(NguoiDungView user, string? bieumauScope, string? bieumauCreatedBy, string? tinhThanhId, string? coQuanThucHienId)
    {
        var rerror = ReadError(user, bieumauScope, bieumauCreatedBy, tinhThanhId, coQuanThucHienId);
        if (rerror is not null and not "")
        {
            return rerror;
        }

        // TODO remove
        if (user.Scope == Consts.Scope.Tw && user.Role == Consts.UserRoles.Admin)
        {
            return "";
        }

        if (user.Role != Consts.UserRoles.Admin)
        {
            return "user_scope_invalid write2";
        }

        if (user.Scope != bieumauScope)
        {
            return "user_scope_invalid write1";
        }

        return "";
    }

    public static string? WriteError(NguoiDungView user, string? bieumauScope, string? bieumauCreatedBy, string? tinhThanhId, string? coQuanThucHienId)
    {
        var rerror = ReadError(user, bieumauScope, bieumauCreatedBy, tinhThanhId, coQuanThucHienId);
        if (rerror is not null and not "")
        {
            return rerror;
        }

        // TODO remove
        if (user.Scope == Consts.Scope.Tw && user.Role == Consts.UserRoles.Admin)
        {
            return "";
        }

        if (user.Scope != bieumauScope)
        {
            return "user_scope_invalid write1";
        }

        // because everyone wants to be in charge but no one wants to be responsible
        if (user.UserName != bieumauCreatedBy)
        {
            return "user_scope_invalid write2";
        }

        return "";
    }
    public static string? PublishError(NguoiDungView user, string? bieumauScope, string? bieumauCreatedBy, string? tinhThanhId, string? coQuanThucHienId)
    {
        var rerror = ReadError(user, bieumauScope, bieumauCreatedBy, tinhThanhId, coQuanThucHienId);
        if (rerror is not null and not "")
        {
            return rerror;
        }

        if (user.Scope != bieumauScope)
        {
            return "user_scope_invalid publish1";
        }

        if (user.Role is not Consts.UserRoles.Admin and not Consts.UserRoles.GiamSat)
        {
            return "user_scope_invalid publish2";
        }

        return "";
    }

    public static string? ConfirmError(NguoiDungView user, string? bieumauScope, string? bieumauCreatedBy, string? tinhThanhId, string? coQuanThucHienId)
    {
        var rerror = ReadError(user, bieumauScope, bieumauCreatedBy, tinhThanhId, coQuanThucHienId);
        if (rerror is not null and not "")
        {
            return rerror;
        }

        if (user.Scope != bieumauScope)
        {
            return "user_scope_invalid confirm1";
        }

        if (user.Role is not Consts.UserRoles.Admin and not Consts.UserRoles.GiamSat)
        {
            return "user_scope_invalid confirm2";
        }

        return "";
    }

    public static string? ListError(NguoiDungView user, string? reqCreatedBy, out List<string> validCreatedBys)
    {
        validCreatedBys = [];

        if (user.Role == Consts.UserRoles.Admin)
        {
            if (reqCreatedBy is not null and not "")
            {
                validCreatedBys.Add(reqCreatedBy);
            }
            return "";
        }

        validCreatedBys.Add(user.UserName);
        if (user.Role == Consts.UserRoles.GiamSat)
        {
            if (user.Members != null)
            {
                validCreatedBys.AddRange(user.Members);
            }
        }

        if (reqCreatedBy is null or "")
        {
            return "";
        }

        foreach (var validCreatedBy in validCreatedBys)
        {
            if (validCreatedBy == reqCreatedBy)
            {
                validCreatedBys = [reqCreatedBy];
                return "";
            }
        }

        return "created_by_invalid";
    }

    public static NguoiDungView GetUser(IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager)
    {
        NguoiDungView rs = new();
        var username = httpContextAccessor?.HttpContext?.User?.Identity?.Name;
        var result = userManager.FindByNameAsync(username!).Result;
        if (result != null)
        {
            rs.Id = result.Id.ToString();
            rs.UserName = result.UserName;
            rs.Phone = result.PhoneNumber;
            rs.Email = result.Email;
            rs.TinhThanhId = result.TinhThanhId;
            rs.TinhThanh = NghiepVuConfig.TinhThanh(rs.TinhThanhId);
            rs.CoQuanThucHienId = result.CoQuanThucHienId;
            rs.Scope = result.Scope;
            rs.Supervisor = result.Supervisor;
            rs.Members = result.Members;
            rs.TypeOfUser = result.TypeOfUser;
            rs.FullName = result.FullName;
            var userRoles = userManager.GetRolesAsync(result).Result.FirstOrDefault();
            if (userRoles != null)
            {
                rs.Role = userRoles.ToString();
            }

            rs.ThongTinDangNhapJson = result.ThongTinDangNhapJson;
            rs.LuuVucSongLienTinhIds = result.LuuVucSongLienTinhIds;
            rs.LuuVucSongNoiTinhIds = result.LuuVucSongNoiTinhIds;
            rs.TinhThanhIds = result.TinhThanhIds;
        }

        if (rs.Scope == Consts.Scope.Dvtt)
        {
            var coQuanThucHien = GetCoQuanThucHien(rs.CoQuanThucHienId);
            if (coQuanThucHien != null)
            {
                rs.CoQuanThucHien = coQuanThucHien.TenMuc;
            }
        }

        if (rs.Scope == Consts.Scope.Tinh)
        {
            rs.CoQuanThucHien = "Sở Tài nguyên và Môi trường " + rs.TinhThanh;
        }

        if (rs.Scope == Consts.Scope.Tw)
        {
            rs.CoQuanThucHien = "Cục Quản lý tài nguyên nước";
        }

        return rs;
    }

    public static DanhMuc? GetCoQuanThucHien(string? id)
    {
        if (id is null or "")
        {
            return null;
        }

        foreach (var coquan in DanhMucs.DonViTrucThuocBos)
        {
            if (coquan.MaMuc == id)
            {
                return coquan;
            }
        }

        return null;
    }

    // TODO remove, replace by DateTimeToUnixTimeMilliseconds
    public static long DateTimeToUnixTimeStamp(DateTime dtDateTime) => new DateTimeOffset(dtDateTime).ToUnixTimeSeconds();
    public static long DateTimeToUnixTimeMilliseconds(DateTime dtDateTime) => new DateTimeOffset(dtDateTime).ToUnixTimeMilliseconds();

    public static Dictionary<char, string> telexDictionary = new Dictionary<char, string>
    {
        {'á', "as"}, {'à', "af"}, {'ả', "ar"}, {'ã', "ax"}, {'ạ', "aj"},
        {'â', "aa"}, {'ấ', "aas"}, {'ầ', "aaf"}, {'ẩ', "aar"}, {'ẫ', "aax"}, {'ậ', "aaj"},
        {'ă', "aw"}, {'ắ', "aws"}, {'ằ', "awf"}, {'ẳ', "awr"}, {'ẵ', "awx"}, {'ặ', "awj"},
        {'Á', "As"}, {'À', "Af"}, {'Ả', "Ar"}, {'Ã', "Ax"}, {'Ạ', "Aj"},
        {'Â', "Aa"}, {'Ấ', "Aas"}, {'Ầ', "Aaf"}, {'Ẩ', "Aar"}, {'Ẫ', "Aax"}, {'Ậ', "Aaj"},
        {'Ă', "Aw"}, {'Ắ', "Aws"}, {'Ằ', "Awf"}, {'Ẳ', "Awr"}, {'Ẵ', "Awx"}, {'Ặ', "Awj"},
        {'é', "es"}, {'è', "ef"}, {'ẻ', "er"}, {'ẽ', "ex"}, {'ẹ', "ej"},
        {'ê', "ee"}, {'ế', "ees"}, {'ề', "eef"}, {'ể', "eer"}, {'ễ', "eex"}, {'ệ', "eej"},
        {'É', "Es"}, {'È', "Ef"}, {'Ẻ', "Er"}, {'Ẽ', "Ex"}, {'Ẹ', "Ej"},
        {'Ê', "Ee"}, {'Ế', "Ees"}, {'Ề', "Eef"}, {'Ể', "Eer"}, {'Ễ', "Eex"}, {'Ệ', "Eej"},
        {'í', "is"}, {'ì', "if"}, {'ỉ', "ir"}, {'ĩ', "ix"}, {'ị', "ij"},
        {'Í', "Is"}, {'Ì', "If"}, {'Ỉ', "Ir"}, {'Ĩ', "Ix"}, {'Ị', "Ij"},
        {'ó', "os"}, {'ò', "of"}, {'ỏ', "or"}, {'õ', "ox"}, {'ọ', "oj"},
        {'ô', "oo"}, {'ố', "oos"}, {'ồ', "oof"}, {'ổ', "oor"}, {'ỗ', "oox"}, {'ộ', "ooj"},
        {'ơ', "ow"}, {'ớ', "ows"}, {'ờ', "owf"}, {'ở', "owr"}, {'ỡ', "owx"}, {'ợ', "owj"},
        {'Ó', "Os"}, {'Ò', "Of"}, {'Ỏ', "Or"}, {'Õ', "Ox"}, {'Ọ', "Oj"},
        {'Ô', "Oo"}, {'Ố', "Oos"}, {'Ồ', "Oof"}, {'Ổ', "Oor"}, {'Ỗ', "Oox"}, {'Ộ', "Ooj"},
        {'Ơ', "Ow"}, {'Ớ', "Ows"}, {'Ờ', "Owf"}, {'Ở', "Owr"}, {'Ỡ', "Owx"}, {'Ợ', "Owj"},
        {'ú', "us"}, {'ù', "uf"}, {'ủ', "ur"}, {'ũ', "ux"}, {'ụ', "uj"},
        {'ư', "uw"}, {'ứ', "uws"}, {'ừ', "uwf"}, {'ử', "uwr"}, {'ữ', "uwx"}, {'ự', "uwj"},
        {'Ú', "Us"}, {'Ù', "Uf"}, {'Ủ', "Ur"}, {'Ũ', "Ux"}, {'Ụ', "Uj"},
        {'Ư', "Uw"}, {'Ứ', "Uws"}, {'Ừ', "Uwf"}, {'Ử', "Uwr"}, {'Ữ', "Uwx"}, {'Ự', "Uwj"},
        {'ý', "ys"}, {'ỳ', "yf"}, {'ỷ', "yr"}, {'ỹ', "yx"}, {'ỵ', "yj"},
        {'Ý', "Ys"}, {'Ỳ', "Yf"}, {'Ỷ', "Yr"}, {'Ỹ', "Yx"}, {'Ỵ', "Yj"},
        {'đ', "dd"}, {'Đ', "Dd"}
    };

    public static string ConvertToASCII(string input)
    {
        StringBuilder result = new StringBuilder();

        foreach (char c in input)
        {
            if (telexDictionary.ContainsKey(c))
            {
                result.Append(telexDictionary[c]);
            }
            else
            {
                result.Append(c);
            }
        }

        return result.ToString();
    }

    public static string ToID0(string name)
    {
        name = name.Trim().ToLower(System.Globalization.CultureInfo.CurrentCulture);
        var arr = name.ToCharArray();
        var arrout = new char[arr.Length];
        // remove accents
        Lucene.FoldToASCII(arr, 0, arrout, 0, arr.Length);
        name = new string(arrout);
        return new string(name.Where((c, i) => c is '-' or '.' or (>= '0' and <= '9') or (>= 'a' and <= 'z')).ToArray());
    }

    public static string ToID(string name)
    {
        name = ConvertToASCII(name);
        name = name.Trim().ToLower(System.Globalization.CultureInfo.CurrentCulture);
        return new string(name.Where((c, i) => c is '-' or '.' or (>= '0' and <= '9') or (>= 'a' and <= 'z')).ToArray());
    }


    public static DanhMuc DanhMuc_Empty = new DanhMuc() { MaMuc = "", TenMuc = "", MaMuc0 = ""};
    public static List<DanhMuc> DanhMucs_Empty = [];

    public static List<DanhMuc> FindMucDichSuDungs(List<string>? maMucs, List<string>? tenMucs)
    {
        return FindDanhMucs(maMucs, tenMucs, Consts.MucDichSuDungm);
    }

    public static DanhMuc FindMucDichSuDung(string? maMuc, string? tenMuc)
    {
        return FindDanhMuc(maMuc, tenMuc, Consts.MucDichSuDungm);
    }

    public static DanhMuc FindLoaiCongTrinh(string? maMuc, string? tenMuc)
    {
        return FindDanhMuc(maMuc, tenMuc, Consts.LoaiCongTrinhm);
    }

    public static DanhMuc FindLoaiHinhNuocThai(string? maMuc, string? tenMuc)
    {
        return FindDanhMuc(maMuc, tenMuc, Consts.LoaiHinhNuocThaim);
    }


    // require danhmucm inited
    public static DanhMuc FindDanhMuc(string? maMuc, string? tenMuc, Dictionary<string, DanhMuc> danhmucm)
    {
        if (danhmucm is null || danhmucm.Count == 0)
        {
            return DanhMuc_Empty;
        }
        if (maMuc is not null and not "" && danhmucm.ContainsKey(maMuc))
        {
            return danhmucm[maMuc];
        }

        if (tenMuc is null or "")
        {
            return DanhMuc_Empty;
        }

        if (danhmucm.ContainsKey(tenMuc))
        {
            return danhmucm[tenMuc];
        }
        if (danhmucm.ContainsKey(tenMuc.Trim().ToLower()))
        {
            return danhmucm[tenMuc.Trim().ToLower()];
        }

        return new DanhMuc() { TenMuc = tenMuc.Trim(), MaMuc = "" };
    }

    public static List<DanhMuc> FindDanhMucs(List<string>? maMucs, List<string>? tenMucs, Dictionary<string, DanhMuc> danhmucm)
    {
        if (danhmucm is null || danhmucm.Count == 0)
        {
            return DanhMucs_Empty;
        }

        if ((maMucs is null || maMucs.Count == 0) && (tenMucs is null || tenMucs.Count == 0))
        {
            return DanhMucs_Empty;
        }

        if (maMucs.Count == tenMucs.Count)
        {
            var arr0 = new List<DanhMuc>();
            for (var i = 0; i < maMucs.Count; i++)
            {
                arr0.Add(FindDanhMuc(maMucs[i], tenMucs[i], danhmucm));
            }
            return arr0;
        }

        // tenMucs > maMucs
        var arr = new List<DanhMuc>();
        for (var i = 0; i < tenMucs.Count; i++)
        {
            arr.Add(FindDanhMuc("", tenMucs[i], danhmucm));
        }

        return arr;
    }

    public static string? ToLuuLuongKhaiThacText(string? loaiNguonNuoc, List<string>? mucDichSuDungIds, List<string>? mucDichSuDungs, double? luuLuongKhaiThac)
    {
        if (luuLuongKhaiThac is null or 0)
        {
            return "";
        }

        DanhMuc dm = null;

        if (loaiNguonNuoc == "NuocBien")
        {
            var isSXCN = false;
            var idSXCN = "";
            var isKDDV = false;
            var idKDDV = "";
            if (mucDichSuDungIds is not null)
            {
                foreach (var mucDichSuDungId in mucDichSuDungIds)
                {
                    if (Consts.MucDichSuDungNuocBien.IsSXCongNghiep(mucDichSuDungId))
                    {
                        isSXCN = true;
                        idSXCN = mucDichSuDungId;
                    }
                    if (Consts.MucDichSuDungNuocBien.IsKinhDoanhDV(mucDichSuDungId))
                    {
                        isKDDV = true;
                        idKDDV = mucDichSuDungId;
                    }
                }
            }

            // isSXCN > isKDDV > isKhaiThacNuocBienKhac in BieuMauSo1 10.1, 10.2
            if (isSXCN)
            {
                dm = FindMucDichSuDung(idSXCN, "");
            }
            else if (isKDDV)
            {
                dm = FindMucDichSuDung(idKDDV, "");
            }
        }

        if (loaiNguonNuoc is "NuocMat" or "NuocNgam")
        {
            var isTuoi = false;
            var idTuoi = "";
            var isPhiNongNghiep = false;
            var idPhiNongNghiep = "";
            if (mucDichSuDungIds is not null)
            {
                foreach (var mucDichSuDungId in mucDichSuDungIds)
                {
                    if (Consts.MucDichKhaiThac.IsMucDichTuoi(mucDichSuDungId))
                    {
                        isTuoi = true;
                        idTuoi = mucDichSuDungId;
                    }
                    if (Consts.MucDichKhaiThac.IsPhiNongNghiep(mucDichSuDungId))
                    {
                        isPhiNongNghiep = true;
                        idPhiNongNghiep = mucDichSuDungId;
                    }
                }
            }

            // tuoi > phinongnghiep > khac
            if (isTuoi)
            {
                dm = FindMucDichSuDung(idTuoi, "");
            }
            else if (isPhiNongNghiep)
            {
                dm = FindMucDichSuDung(idPhiNongNghiep, "");
            }
        }

        var tenMucDich = "";
        if (dm is not null)
        {
            tenMucDich = dm.TenMuc;
        }
        if (tenMucDich is null or "" && mucDichSuDungs != null && mucDichSuDungs.Count > 0)
        {
            foreach (var s in mucDichSuDungs)
            {
                if (s is not null and not "")
                {
                    tenMucDich = s;
                    break;
                }
            }
        }
        if (tenMucDich is null or "")
        {
            tenMucDich = "Loại khác";
        }

        return $"{luuLuongKhaiThac} {tenMucDich};";
    }

    public static double? ExtractNumber(string? str)
    {
        if (str is null)
        {
            return 0;
        }

        str = str.Trim().ToLower();
        if (str is "")
        {
            return 0;
        }

        char[] charArray = str.ToCharArray();
        var listArr = new List<char[]>();

        var listc = new List<char>();
        if (IsDigit(charArray[0]))
        {
            listc.Add(charArray[0]);
        }
        var notPrefix = !IsDigitPrefix(charArray[0]) && !IsDigit(charArray[0]);
        for (var i = 1; i < charArray.Length; i++)
        {
            if (!IsDigit(charArray[i]))
            {
                if (listc.Count > 0)
                {
                    listArr.Add(listc.ToArray());
                }
                listc = new List<char>();
                notPrefix = !IsDigitPrefix(charArray[i]) && !IsDigit(charArray[i]);
                continue;
            }
            if (notPrefix)
            {
                if (IsDigitPrefix(charArray[i]))
                {
                    notPrefix = false;
                }
                continue;
            }
            listc.Add(charArray[i]);
        }
        if (listc.Count > 0)
        {
            listArr.Add(listc.ToArray());
        }

        if (listArr.Count == 0)
        {
            return 0;
        }

        // use first number found
        foreach (var arr in listArr)
        {
            var number = ToNumber(arr);
            if (number is not null && number > 0)
            {
                return number;
            }
        }

        return 0; // TODO
    }

    private static double? ToNumber(char[] arr)
    {
        if (arr is null || arr.Count() == 0)
        {
            return 0;
        }
        var foundNumber = false;
        foreach (var ch in arr)
        {
            if (ch >= '0' && ch <= '9')
            {
                foundNumber = true;
                break;
            }
        }
        if (!foundNumber)
        {
            return 0;
        }

        // VN format
        if (IsNumberVN(arr))
        {
            var numberVN = ToNumberVN(arr);
            if (numberVN is not null && numberVN > 0)
            {
                return numberVN;
            }
        }

        return ToNumberDefault(arr);
    }

    public static bool IsValidVietnamNumberFormat(char[] arr)
    {
        // Kết hợp mảng ký tự thành chuỗi
        string input = new string(arr);

        // Biểu thức chính quy kiểm tra định dạng Việt Nam
        string pattern = @"^(\d{1,3}(\.\d{3})*)(,\d{1,3})?$";

        // Kiểm tra nếu chuỗi khớp với biểu thức chính quy
        return Regex.IsMatch(input, pattern);
    }

    private static bool IsNumberVN(char[] arr)
    {
        var countdot = 0;
        var countcomma = 0;
        var lastch = '_';
        var lastchi = -1;
        for (var i = 0; i < arr.Length; i++)
        {
            var ch = arr[i];
            if (ch is ',')
            {
                countcomma++;
                lastch = ch;
                lastchi = i;
            }
            if (ch is '.')
            {
                countdot++;
                lastch = ch;
                lastchi = i;
            }
        }

        if (lastch is '_' || (countdot + countcomma) <= 0)
        {
            return true; // or false
        }

        var numberAfter = arr.Length - lastchi - 1;
        if (numberAfter != 3 || (lastchi == 1 && arr[0] == '0'))
        {
            if (lastch == ',')
            {
                return true;
            }
            return false;
        }

        if (lastch == ',')
        {
            if (countdot == 0 && countcomma > 1)
            {
                return false;
            }
            if (countdot == 0 && countcomma == 1)
            {
                return true; // 123,456 not sure more vn
            }
            return true;
        }

        // lastch is .
        if (countcomma == 0 && countdot > 1)
        {
            return true;
        }
        if (countcomma == 0 && countdot == 1)
        {
            return false; // 123.456 not sure, true if vn 1st
        }

        return false;
    }

    private static double? ToNumberDefault(char[] arr)
    {
        arr = arr.Where(chr => chr != ',').ToArray();

        string str = new string(arr);
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

    private static double? ToNumberVN(char[] arr)
    {
        CultureInfo vietnamCulture = new CultureInfo("vi-VN");

        // Thử chuyển chuỗi thành số thực (float hoặc double)
        try
        {
            // Sử dụng TryParseExact để chuyển chuỗi theo định dạng của Việt Nam
            double result = double.Parse(new string(arr), vietnamCulture);
            return result;
        }
        catch (FormatException ex)
        {
            return null;
        }
    }

    private static double? ToNumberVN0(char[] arr)
    {
        arr = arr.Where(chr => chr != '.').ToArray();

        for (var i = 0; i < arr.Length; i++)
        {
            //if (arr[i] == '.')
            //{
            //    arr[i] = ',';
            //}
            if (arr[i] == ',')
            {
                arr[i] = '.';
            }
        }

        string str = new string(arr);
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

    private static bool IsDigitPrefix(char ch)
    {
        return ch == '(' || ch == '+' || ch == ' ';
    }

    private static bool IsDigit(char ch)
    {
        return (ch >= '0' && ch <= '9') || ch == '.' || ch == ',';
    }

    public static List<DateTime> TinhSoNgay(long? tuNgay, long? denNgay)
    {
        var tungaymillion = tuNgay * 3600000;
        var denngaymillion = denNgay * 3600000;
        var tungay = UnixTimeToDateTime(tungaymillion);
        var dengay = UnixTimeToDateTime(denngaymillion);
        var longdengay = new DateTimeOffset(dengay).ToUnixTimeSeconds();
        var longtungay = new DateTimeOffset(tungay).ToUnixTimeSeconds();
        var lst = new List<DateTime>();
        var songay = (longdengay - longtungay) / 86400;
        if (songay > 31)
        {
            return lst;
        }

        for (var i = 0; i < songay + 1; i++)
        {
            var date = tungay.AddDays(i);
            lst.Add(date);
        }
        return lst;

    }

    public static long GetTimeLogout()
    {
        var tomorrow = DateTime.Today.AddDays(1);
        var now = DateTimeOffset.Now.ToUnixTimeSeconds();
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)tomorrow.DayOfWeek + 7) % 7;
        var nextMonday = tomorrow.AddDays(daysUntilMonday);
        var timeUnixMonday = new DateTimeOffset(nextMonday).ToUnixTimeSeconds();
        var timeMini = (timeUnixMonday - now) / 60;
        return timeMini;
    }


    public static DateTime UnixTimeStampToDateTimeVN(long unixTimeStamp)
    {
        var d = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(unixTimeStamp);
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Saigon");
        d = TimeZoneInfo.ConvertTimeFromUtc(d, tz);
        return d;
    }
    public static DateTime UnixTimeStampToDateTime(long unixTimeStamp)
    {
        var d = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(unixTimeStamp);
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Saigon");
        d = TimeZoneInfo.ConvertTimeFromUtc(d, tz);
        return d.Date;
    }
    public static DateTime UnixTimeToDateTime(long? unixTimeStamp)
    {
        var d = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(double.Parse(unixTimeStamp.ToString()));
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Saigon");
        d = TimeZoneInfo.ConvertTimeFromUtc(d, tz);
        return d.Date;
    }


    public static string ScopeId(string? scope, string? coQuanThucHienId, string? tinhThanhId)
    {
        if (scope is null or "")
        {
            return "";
        }

        if (scope == Consts.Scope.Dvtt && coQuanThucHienId is not null and not "")
        {
            return scope + "." + coQuanThucHienId;
        }

        if (scope == Consts.Scope.Tinh && tinhThanhId is not null and not "")
        {
            return scope + "." + tinhThanhId;
        }

        return scope;
    }

    public static string AcronymNameToId(string name)
    {
        name = name.Trim().ToLower(System.Globalization.CultureInfo.CurrentCulture);
        var arr = name.ToCharArray();
        var arrout = new char[arr.Length];
        // remove accents
        Lucene.FoldToASCII(arr, 0, arrout, 0, arr.Length);
        name = new string(arrout);
        return new string(name.Where((c, i) => c != ' ' && (i == 0 || name[i - 1] == ' ')).ToArray());
    }
}

public partial class MixID
{
    public int Type { get; set; }
    public string Id { get; set; } // include type
    public string DiaDiemId { get; set; }
}

public static class DanhMucs
{
    public static DvhcVNDB DvhcVNDB = new();

    public static Dictionary<string, DmKtt> KTTTinhThanhm { get; set; }

    // MaMuc of dvtt require <> all tinhthanh-id
    public static List<DanhMuc> DonViTrucThuocBos = [
        new() { MaMuc = "01dvtt", TenMuc = "Trung tâm Giám sát tài nguyên nước và Hỗ trợ phát triển lưu vực sông" },
        new() { MaMuc = "02dvtt", TenMuc = "Trung tâm Thẩm Định và Kiểm định tài nguyên nước" },
        new() { MaMuc = "03dvtt", TenMuc = "Trung tâm Thông tin - Kinh tế Tài nguyên nước" },
        new() { MaMuc = "04dvtt", TenMuc = "Trung tâm Quy hoạch và Điều tra tài nguyên nước quốc gia" },
        new() { MaMuc = "05dvtt", TenMuc = "Viện Khoa học Tài nguyên nước" },
        new() { MaMuc = "06dvtt", TenMuc = "Tổng cục Khí tượng Thủy văn" }, // if change index, update DonViTrucThuocBos[5]
        new() { MaMuc = "c1dvtt", TenMuc = "Trung tâm Công nghệ phần mềm và Nền tảng số" },
    ];
    public static DanhMuc TongCucKhiTuongThuyVan = DonViTrucThuocBos[5];
}

public partial class DanhMuc
{
    public int? Id { get; set; } // only LVS
    public string? MaMuc0 { get; set; } // only LVS
    public string? MaMuc { get; set; }
    public string? TenMuc { get; set; }
    public string? KyHieu { get; set; }
    public string? MaQuyChuan { get; set; }
    public string? LuuVucSongLienTinhMa { get; set; }

    // only for CoQuanThucHien
    public string? CoQuanThucHienId { get; set; }
    public List<string>? LuuVucSongIds { get; set; }
}

public partial class DmKtt
{
    public int Id { set; get; }
    public short? Cap { get; set; }
    public string? Matinh { get; set; } = "";
    public string? Tendvhc { get; set; } = "";
    public int Do { get; set; } // int?
    public int Phut { get; set; } // int?
    public short? Daxoa { get; set; }
    public string? Ten { get; set; } = "";
    public int Srid { get; set; }
}

public partial class Spatial
{
    [JsonPropertyName("madinhdanh")]
    [Key] public string madinhdanh { get; set; }
    public long Created { get; set; }
    [JsonPropertyName("ktt")]
    [NotMapped]
    public string ktt { get; set; }
    [JsonPropertyName("muichieu")]
    [NotMapped]
    public int muichieu { get; set; }
    [JsonPropertyName("geojson")]
    [NotMapped]
    public string geojson { get; set; }
    [JsonPropertyName("matinh")]
    [NotMapped]
    public string? matinh { get; set; }
    [JsonPropertyName("mahuyen")]
    [NotMapped]
    public string? maHuyen { get; set; }
    [JsonPropertyName("maxa")]
    [NotMapped]
    public string? maxa { get; set; }
    [JsonPropertyName("diachi")]
    [NotMapped]
    public string diachi { get; set; }
    [JsonPropertyName("typegeom")]
    [NotMapped]
    public int typegeom { get; set; }
    [JsonPropertyName("vn2000")]
    [NotMapped]
    public string vn2000 { get; set; }
    [JsonPropertyName("arrpoint")]
    [NotMapped]
    public int[] arrpoint { get; set; }
    [JsonPropertyName("loai")]
    [NotMapped]
    public string loai { get; set; }
    [JsonPropertyName("ten")]
    [NotMapped]
    public string? ten { get; set; }
    [JsonPropertyName("bieu_mau")]
    [NotMapped]
    public string? bieuMau { get; set; }
    [JsonPropertyName("bieu_mau_id")]
    [NotMapped]
    public int bieuMauId { get; set; }
    public string? doituongId { get; set; }
    [JsonPropertyName("x")]
    [NotMapped]
    public double? x { get; set; }
    [JsonPropertyName("y")]
    [NotMapped]
    public double? y { get; set; }
}

public partial class DvhcVNs
{
    public List<DvhcVN> Records { get; set; }
}

public partial class DvhcVN
{
    // public Int64 Id { get; set; }
    public string TenDVHC { get; set; }
    public string TenRutGon { get; set; }
    public string Ten { get; set; }
    public string Ma { get; set; } // derived
    public string MaTinh { get; set; }
    public string MaHuyen { get; set; }
    public string MaXa { get; set; }
    public int Cap { get; set; }
    public string Geometry { get; set; }
    public List<DvhcVN> QuanHuyens { get; set; }
    public List<DvhcVN> PhuongXas { get; set; }

    public DvhcVN CLone() => new()
    {
        TenDVHC = this.TenDVHC,
        Ten = this.Ten,
        Ma = this.Ma,
        MaTinh = this.MaTinh,
        MaHuyen = this.MaHuyen,
        MaXa = this.MaXa,
        Cap = this.Cap,
        Geometry = this.Geometry,
    };
}

public partial class DvhcVNDB
{
    public Dictionary<string, DvhcVN> Dvhcmap { get; set; }
    public Dictionary<string, string[]> Indexmap { get; set; }
    public List<DvhcVN> AllTinhThanhs { get; set; }
    public List<DvhcVN> AllQuanHuyens { get; set; }
    public List<DvhcVN> AllPhuongXas { get; set; }
    public List<DvhcVN> TinhThanhsIncludeQhpx { get; set; } // include quanhuyen, phuongxa
}

public partial class DashboardDanhMucs
{
    public List<DvhcVN>? TinhThanhs { get; set; }
    public List<DanhMuc>? LoaiCongTrinhs { get; set; }
    public List<DanhMuc>? MucDichSuDungs { get; set; }
    public List<DanhMuc>? LoaiHinhNuocThais { get; set; }
    public List<DanhMuc>? CoQuanThucHiens { get; set; }
    public DanhMuc? TongCucKhiTuongThuyVan { get; set; }
}

// TODO merge to Util
public static class NghiepVuConfig
{
    public static string? ApiName { get; set; }
    public static string? SpatialUrl { get; set; }
    public static WebApplication app { get; set; }

    public static string FindTinhThanhId(string? tinhThanh)
    {
        if (tinhThanh != null && DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey("tinhthanhs#" + tinhThanh))
        {
            var tinh = DanhMucs.DvhcVNDB.Dvhcmap["tinhthanhs#" + tinhThanh];
            return tinh.MaTinh;
        }
        return "";
    }

    public static string FindTinhThanh(string? tinhThanhId)
    {
        if (tinhThanhId is not null and not "" && DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(tinhThanhId))
        {
            return DanhMucs.DvhcVNDB.Dvhcmap[tinhThanhId].TenDVHC;
        }
        return "";
    }

    public static string FindQuanHuyenId(string? tinhthanhid, string? quanhuyen)
    {
        if (quanhuyen != null && DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(tinhthanhid + "#" + quanhuyen))
        {
            var huyen = DanhMucs.DvhcVNDB.Dvhcmap[tinhthanhid + "#" + quanhuyen];
            return huyen.MaHuyen;
        }
        return "";
    }

    public static string FindPhuongXaId(string? quanhuyenid, string? phuongxa)
    {
        if (phuongxa != null && DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(quanhuyenid + "#" + phuongxa))
        {
            var xa = DanhMucs.DvhcVNDB.Dvhcmap[quanhuyenid + "#" + phuongxa];
            return xa.MaXa;
        }
        return "";
    }

    public static string TinhThanh(string? tinhThanhId)
    {
        if (tinhThanhId == null || tinhThanhId.Length == 0)
        {
            return "";
        }

        if (DanhMucs.DvhcVNDB.Dvhcmap.TryGetValue(tinhThanhId, out var value))
        {
            return value.TenDVHC;
        }

        return "";
    }


    private static void ToadoToSpatial(Spatial spatial, double? vn2000x, double? vn2000y, HeQuyChieu? heQuyChieu, string? wgS84)
    {
        if (vn2000x.HasValue && vn2000y.HasValue)
        {
            var vn2000 = $"POINT({vn2000y} {vn2000x})"; // ? why

            // spatial.vn2000 = vn2000;
            spatial.geojson = vn2000;

            // TODO remove
            spatial.x = vn2000x;
            spatial.y = vn2000y;

            if (heQuyChieu != null && heQuyChieu.KTTDo > 0 && heQuyChieu.KTTPhut > 0)
            {
                spatial.ktt = $"{heQuyChieu.KTTDo}_{heQuyChieu.KTTPhut}";
                spatial.muichieu = heQuyChieu.MuiChieu;
            }

            // TODO need more test
            // TODO default is not assign, and move this logic to spatial
            spatial.ktt ??= "";

            //if (spatial.ktt is null or "")
            //{
            //    spatial.ktt = "105_00";
            //    spatial.muichieu = 6;
            //}

            //if (spatial.ktt != "105_00" && spatial.muichieu == 0)
            //{
            //    spatial.muichieu = 3;
            //}

            //if (spatial.ktt == "105_00" && spatial.muichieu == 0)
            //{
            //    spatial.muichieu = 6;
            //}

            return;
        }

        if (wgS84 == null)
        {
            return;
        }

        // TODO assign x=lat, y=lng

        spatial.ktt = "4326";
        spatial.geojson = wgS84;
    }

    public static async Task RemoveSpatial(List<string> ids)
    {
        if (ids == null || ids.Count == 0)
        {
            Console.WriteLine("List id required");
            return;
        }

        if (string.IsNullOrEmpty(SpatialUrl))
        {
            Console.WriteLine("spatial_url is not set");
            return;
        }

        HttpClient client = new()
        {
            BaseAddress = new Uri(SpatialUrl)
        };
        client.DefaultRequestHeaders.Accept.Clear();

        try
        {
            var jsonContent = new StringContent(
                Newtonsoft.Json.JsonConvert.SerializeObject(ids),
                Encoding.UTF8,
                "application/json"
            );

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Delete,
                RequestUri = new Uri("api/spatial/Spatial/DeleteSpatial_List_DoiTuongKiemKe", UriKind.Relative),
                Content = jsonContent
            };
            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Xóa thành công tất cả đối tượng.");
            }
            else if (response.StatusCode == (System.Net.HttpStatusCode)299)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Một số đối tượng không thể xóa: {responseContent}");
            }
            else
            {
                Console.WriteLine($"Không thể xóa đối tượng");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi khi gọi API: {ex.Message}");
        }
    }

    public static async Task<string> TransformGeometry3(double lat, double lng, string src, string matinh)
    {
        if (SpatialUrl == null || SpatialUrl.Length == 0)
        {
            Console.WriteLine("spatial_url is not set");
            // TODO return error
            return "";
        }

        HttpClient client = new()
        {
            BaseAddress = new Uri(SpatialUrl)
        };
        client.DefaultRequestHeaders.Accept.Clear();

        var query = HttpUtility.ParseQueryString(string.Empty);
        query["lat"] = $"{lat}";
        query["lng"] = $"{lng}";
        query["src"] = src;
        query["matinh"] = matinh;
        var queryString = query.ToString();
        Console.WriteLine("queryString=" + queryString);

        var response = await client.GetAsync("api/spatial/Spatial/transform3?" + queryString);
        Console.WriteLine(response.StatusCode);
        if (response.StatusCode.ToString() != "OK")
        {
            // TODO return error
            return "";
        }

        var resbody = await response.Content.ReadAsStringAsync();
        return resbody;
    }
}
