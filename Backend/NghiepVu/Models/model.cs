using Microsoft.AspNetCore.Identity;
using NetTopologySuite.Operation.Polygonize;
using NPOI.POIFS.Properties;
using NPOI.SS.Formula.Functions;
using Org.BouncyCastle.Bcpg.OpenPgp;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace NghiepVu.Api.Models
{
    #region default api
    public partial class CommonRequest
    {
        public int Limit { get; set; }
        public int Anchor { get; set; }
        public string? Tukhoa { get; set; }
        public int Count { get; set; }
    }
    public partial class RequestOther
    {
        public int Limit { get; set; }
        public string? Anchor { get; set; }
        public string? Tukhoa { get; set; }
        public int Count { get; set; }
    }
  
    public partial class QTHT_DM_DVHCs_Request
    {
        public int Limit { get; set; }
        public string? Anchor { get; set; }
        public string? Tukhoa { get; set; }
        public int Count { get; set; }
        public string? MaTinh { get; set; }
        public string? MaHuyen { get; set; }
        public int Cap { get; set; }
    }
    public partial class QTHT_Logs_Request : CommonRequest
    {
        public long TuNgay { get; set; } = 0;
        public long DenNgay { get; set; } = 0;

    }
    #endregion

    #region quan tri he thong
    public partial class QTHT_Apps
    {
        [Key]
        public int Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Note { get; set; }
        public string? AllowedCorsOrigins { get; set; }
        public string? ApiResources { get; set; }
        public string? PostLogoutRedirectUris { get; set; }
        public string? RedirectUris { get; set; }
        public void Assign(QTHT_Apps candidate)
        {
            Code = candidate.Code;
            Name = candidate.Name;
            Url = candidate.Url;
            Note = candidate.Note;
            AllowedCorsOrigins = candidate.AllowedCorsOrigins;
            ApiResources = candidate.ApiResources;
            PostLogoutRedirectUris = candidate.PostLogoutRedirectUris;
            RedirectUris = candidate.RedirectUris;
        }
    }
    //Nhóm chức năng
    public partial class QTHT_Modules
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int AppId { get; set; }
        public string? ModuleCode { get; set; }
        public void Assign(QTHT_Modules obj)
        {
            Name = obj.Name;
            Description = obj.Description;
            AppId = obj.AppId;
            ModuleCode = obj.ModuleCode;
        }
    }
    //chức năng
    public partial class QTHT_Functions
    {
        [Key]
        public int Id { get; set; }
        public int ModuleId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int AppId { get; set; }
        public string? MaChucNang { get; set; }
        public void Assign(QTHT_Functions obj)
        {
            Name = obj.Name;
            Description = obj.Description;
            ModuleId = obj.ModuleId;
            MaChucNang = obj.MaChucNang;
        }
        [NotMapped]
        public QTHT_Modules? Module { get; set; }
    }
    //phân quyền chức năng
    public partial class QTHT_Roles_Functions
    {
        public int Id { get; set; }
        public int FunctionId { get; set; }
        public string? RoleId { get; set; }

    }
    //Logs
    public partial class QTHT_Logs
    {
        [Key]
        public long Id { get; set; }
        public string? Controller_Action { get; set; }
        public string? UserCreate { get; set; }
        public string? Content { get; set; }
        public long NgayTao { get; set; } = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now);
    }
    public partial class QTHT_DM_DVHCs
    {
        [Key]
        public string Id { get; set; }
        public string? TenDVHC { get; set; }
        public string? MaTinh { get; set; }
        public string? MaHuyen { get; set; }
        public string? MaXa { get; set; }
        public int HoatDong { get; set; } = 1;
        public int Cap { get; set; }
        public string? Ten { get; set; }
        [NotMapped] public bool IsUpdate { get; set; }
        public void Assign(QTHT_DM_DVHCs candidate)
        {
            TenDVHC = candidate.TenDVHC;
            MaTinh = candidate.MaTinh;
            MaHuyen = candidate.MaHuyen;
            MaXa = candidate.MaXa;
            HoatDong = candidate.HoatDong;
            Cap = candidate.Cap;
            Ten = candidate.Ten;
        }
    }
    //dịch vụ trong hệ thống
    public partial class QTHT_DichVus
    {
        [Key]
        public int Id { get; set; }
        public string? Ma { get; set; }
        public string? Ten { get; set; }
        public string? MoTa { get; set; }
        public long NgayTao { get; set; } = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now);
        public void Assign(QTHT_DichVus obj)
        {
            Ma = obj.Ma;
            Ten = obj.Ten;
            MoTa = obj.MoTa;
        }
    }

    #endregion

    #region get list model
    public partial class list_dichvus : CommonRequest
    {
        public List<QTHT_DichVus> Records { get; set; }

    }
    public partial class list_roles : RequestOther
    {
        public List<IdentityRole> Records { get; set; }
    }
    public partial class list_apps : CommonRequest
    {
        public List<QTHT_Apps> Records { get; set; }

    }
    public partial class list_users : RequestOther
    {
        public List<ApplicationUser> Records { get; set; }
    }

    public partial class user_role_remove
    {
        public string? RoleId { get; set; }
        public List<string>? UserId { get; set; }
    }

   

    public partial class List_QTHT_DM_DVHCs : RequestOther
    {
        public List<QTHT_DM_DVHCs>? Records { get; set; }
    }
    public partial class list_modules : CommonRequest
    {
        public List<QTHT_Modules> Records { get; set; }
    }
    public partial class list_functions : CommonRequest
    {
        public List<QTHT_Functions> Records { get; set; }
    }
    public partial class role_functions
    {
        public string? RoleId { get; set; }
        public List<int>? FunctionIds { get; set; }
    }
   
    public partial class list_logs : CommonRequest
    {
        public List<QTHT_Logs> Records { get; set; }
    }

    public partial class role_module_functions_view
    {
        public string? Name { get; set; } //module name
        public string? ModuleCode { get; set; }
        public bool? IsCheck { get; set; } = false;
        public int Id { get; set; }
        public List<functions_view>? Children { get; set; }
    }
    public partial class functions_view : QTHT_Functions
    {
        public bool? IsCheck { get; set; } = false;
    }
    public partial class dvhc_view : QTHT_DM_DVHCs
    {
        public bool? IsCheck { get; set; } = false;
    }

    public partial class list_dvhcs : RequestOther
    {
        public List<dvhc_view> Records { get; set; }
    }
    public partial class view_logs
    {
        public string? NgayTao { get; set; }
        public string? NguoiTao { get; set; }
        public string? Controller { get; set; }
        public string? NoiDung { get; set; }
    }

    #endregion
}
