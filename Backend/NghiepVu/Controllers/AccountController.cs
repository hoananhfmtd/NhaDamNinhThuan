namespace NghiepVu.Api.Controllers;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.Caching;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NghiepVu.Api.Models;

[Authorize]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly NghiepVuContext context;
    private readonly SignInManager<ApplicationUser> signInManager;
    private readonly UserManager<ApplicationUser> userManager;
    private readonly RoleManager<IdentityRole> roleManager;
    private readonly IConfiguration configuration;
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly MemoryCache cache = MemoryCache.Default;
    public AccountController(NghiepVuContext context, SignInManager<ApplicationUser> kksignInManager, UserManager<ApplicationUser> kkuserManager, IConfiguration kkconfiguration, RoleManager<IdentityRole> kkroleManager, IHttpContextAccessor kkhttpContextAccessor)
    {
        this.context = context;
        this.signInManager = kksignInManager;
        this.userManager = kkuserManager;
        this.signInManager = kksignInManager;
        this.configuration = kkconfiguration;
        this.roleManager = kkroleManager;
        this.httpContextAccessor = kkhttpContextAccessor;
    }

    #region POST api/nghiepvukk/accounts-register deprecated
    [HttpPost("api/nghiepvukk/accounts-register")]
    [HttpPost("api/nghiepvukk/users/register")]
    public async Task<IActionResult> Register(NguoiDung nguoidung)
    {
        if (nguoidung.UserName == null || nguoidung.Password == null)
        {
            return this.Unauthorized();
        }

        var userexist = await this.userManager.FindByNameAsync(nguoidung.UserName);
        if (userexist != null)
        {
            return this.StatusCode(400, "TaiKhoanDaTonTai");
        }

        var user = new ApplicationUser
        {
            UserName = nguoidung.UserName,
            Email = nguoidung.Email,
            PhoneNumber = nguoidung.Phone,
            PasswordHash = nguoidung.Password,
            TinhThanhId = nguoidung.TinhThanhId,
            FullName = nguoidung.FullName,
            Scope = nguoidung.Scope,
            Supervisor = nguoidung.Supervisor,
            CoQuanThucHienId = nguoidung.CoQuanThucHienId,
            Members = nguoidung.Members,
            DaXoa = 0,
            Created = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now)
        };

        user.CreatedBy = user.UserName;

        var result = await this.userManager.CreateAsync(user, nguoidung.Password);
        return this.Ok(user);
        ;
    }
    #endregion

    #region POST api/nghiepvukk/accounts-register-by-email
    [HttpPost("api/nghiepvukk/accounts-register-by-email")]
    [HttpPost("api/nghiepvukk/users/registeremail")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterByEmail(NguoiDung nguoidung)
    {
        if (nguoidung.Email == null || nguoidung.Password == null)
        {
            return this.Unauthorized();
        }

        var userexist = await this.userManager.FindByNameAsync(nguoidung.Email);
        if (userexist != null)
        {
            return this.StatusCode(400, "TaiKhoanDaTonTai");
        }

        var user = new ApplicationUser
        {
            UserName = nguoidung.Email,
            Email = nguoidung.Email,
            PhoneNumber = nguoidung.Phone,
            PasswordHash = nguoidung.Password,
            TinhThanhId = nguoidung.TinhThanhId,
            FullName = nguoidung.FullName,
            Scope = nguoidung.Scope,
            CoQuanThucHienId = nguoidung.CoQuanThucHienId,
            Supervisor = nguoidung.Supervisor,
            Members = nguoidung.Members,
            DaXoa = 0,
            Created = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now)
        };

        user.CreatedBy = user.UserName;

        var result = await this.userManager.CreateAsync(user, nguoidung.Password);
        return this.Ok(user);
        ;
    }
    #endregion

    #region POST api/nghiepvukk/accounts-logout
    [HttpPost("api/nghiepvukk/accounts-logout")]
    [HttpPost("api/nghiepvukk/users/logout/")]
    public async Task<IActionResult> Logout(ThietBis? danhsach)
    {
        var username = this.httpContextAccessor?.HttpContext?.User?.Identity?.Name;
        var user = this.userManager.FindByNameAsync(username!).Result;
        if (user != null)
        {
            var info_dangnhap = user.ThongTinDangNhapJson;
            if (info_dangnhap != null)
            {
                if (danhsach != null)
                {
                    if (danhsach.IdThietBi != null && danhsach.IdThietBi.Count > 0)
                    {
                        var lst = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(info_dangnhap);
                        if (lst != null)
                        {
                            foreach (var item in danhsach.IdThietBi)
                            {
                                var thietbi = lst.FirstOrDefault(x => x.Id == item);
                                if (thietbi != null)
                                {
                                    this.cache.Remove("users#" + thietbi.Token);
                                    thietbi.Token = "";
                                    thietbi.Active = false;

                                }
                                user.ThongTinDangNhapJson = JsonSerializer.Serialize(lst);
                                await this.userManager.UpdateAsync(user);
                                this.context.SaveChanges();
                            }
                        }
                    }
                    else
                    {

                        var token = Utils.LayAccessToken(this.httpContextAccessor);
                        var lstthongtin = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(info_dangnhap);
                        if (lstthongtin != null)
                        {
                            var thietbi = lstthongtin.FirstOrDefault(x => x.Token == token);
                            if (thietbi != null)
                            {
                                this.cache.Remove("users#" + token);
                                thietbi.Token = "";
                                thietbi.Active = false;
                                user.ThongTinDangNhapJson = JsonSerializer.Serialize(lstthongtin);
                                await this.userManager.UpdateAsync(user);
                                this.context.SaveChanges();
                            }
                        }
                    }
                }
            }
        }
        await this.signInManager.SignOutAsync();

        return this.Ok(1);
    }
    #endregion

    #region POST api/nghiepvukk/accounts-login
    [HttpPost("api/nghiepvukk/accounts-login")]
    [HttpPost("api/nghiepvukk/users/login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(ThongTinDangNhap nguoidung)
    {
        if (nguoidung.UserName == null)
        {
            return this.Unauthorized();
        }

        if (nguoidung.Password == null)
        {
            return this.Unauthorized();
        }

        var user = await this.userManager.FindByNameAsync(nguoidung.UserName);
        if (user != null)
        {
            if (user.DaXoa == 0)
            {
                var role = "";
                var result = await this.signInManager.PasswordSignInAsync(
                    userName: nguoidung.UserName,
                    password: nguoidung.Password,
                    isPersistent: false,
                    lockoutOnFailure: false
                    );
                if (result.Succeeded)
                {
                    var authen = new List<Claim>
                {
                new(ClaimTypes.Name,nguoidung.UserName),
                new(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),

                };
                    var userRoles = await this.userManager.GetRolesAsync(user);
                    foreach (var userRole in userRoles)
                    {
                        authen.Add(new Claim(ClaimTypes.Role, userRole.ToString()));
                        role = userRole.ToString();
                    }

                    var token = this.CreateToken(authen);
                    var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

                    var tt = new ThietBiDangNhap
                    {
                        Ip = nguoidung.Ip,
                        Client = nguoidung.Client,
                        ClientId = nguoidung.ClientId,
                        DeviceInfo = nguoidung.DeviceInfo,
                        Token = accessToken,

                    };
                    var nowms = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now);
                    tt.TimeLogin = nowms;
                    var id = Guid.NewGuid().ToString();
                    tt.Id = id;
                    tt.Active = true;
                    if (user != null && user.ThongTinDangNhapJson != null && user.ThongTinDangNhapJson != "")
                    {
                        user.ThongTinDangNhaps = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(user.ThongTinDangNhapJson);
                        user.ThongTinDangNhaps ??= [];
                        user.ThongTinDangNhaps.Add(tt);
                        user.ThongTinDangNhapJson = JsonSerializer.Serialize(user.ThongTinDangNhaps);
                        await this.userManager.UpdateAsync(user);
                        this.context.SaveChanges();
                    }
                    else if (user != null && (user.ThongTinDangNhapJson == null))
                    {
                        user.ThongTinDangNhaps = [tt];
                        user.ThongTinDangNhapJson = JsonSerializer.Serialize(user.ThongTinDangNhaps);
                        await this.userManager.UpdateAsync(user);
                        this.context.SaveChanges();
                    }
                    return this.Ok(new
                    {
                        Token = new JwtSecurityTokenHandler().WriteToken(token),
                        user.Email,
                        user.UserName,
                        Phone = user.PhoneNumber,
                        Role = role,
                        user.Scope,
                        user.FullName,
                        user.TinhThanhId,
                        //TinhThanh = NghiepVuConfig.TinhThanh(user.TinhThanhId),
                        TypeOfUsers = user.TypeOfUser,
                        user.CoQuanThucHienId,
                        //CoQuanThucHien = Utils.GetCoQuanThucHien(user.CoQuanThucHienId),
                    });
                }
                else
                {
                    return this.StatusCode(400, "error_login");
                }
            }
        }

        return this.Unauthorized();
    }
    #endregion

    #region POST api/nghiepvukk/accounts-reset-password
    [HttpPost("api/nghiepvukk/accounts-reset-password")]
    [HttpPost("api/nghiepvukk/users/resetmatkhau")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetMatKhau(ReSetPass reSetPass)
    {
        if (reSetPass.Token is null)
        {
            return this.Unauthorized();
        }
        if (reSetPass.MatKhau is null)
        {
            return this.StatusCode(400, "MatKhau.Error");
        }

        var username = new JwtSecurityTokenHandler().ReadJwtToken(reSetPass.Token).Claims.FirstOrDefault().Value;
        var user = await this.userManager.FindByNameAsync(username);
        if (user is null)
        {
            return this.StatusCode(400, "User.Error");
        }

        if (user.ResetToken != reSetPass.Token)
        {
            return this.StatusCode(400, "Token.Error");
        }

        var handler = new JwtSecurityTokenHandler();
        var jwtSecurityToken = handler.ReadJwtToken(user.ResetToken);

        var tokenExp = jwtSecurityToken.Claims.First(claim => claim.Type.Equals("exp", StringComparison.Ordinal)).Value;

        var timeExp = long.Parse(tokenExp);
        var now = DateTime.Now.ToUniversalTime();
        var timeNow = Utils.DateTimeToUnixTimeStamp(now);
        if (timeExp < timeNow)
        {
            return this.StatusCode(400, "Time.Expired");
        }

        var resetToken = await this.userManager.GeneratePasswordResetTokenAsync(user);
        await this.userManager.ResetPasswordAsync(user, resetToken, reSetPass.MatKhau);
        this.context.SaveChanges();
        return this.Ok("1");

    }
    #endregion

    #region private functions
    private JwtSecurityToken CreateToken(List<Claim> authClaims)
    {
        var authenkey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(this.configuration["JWT:Serect"]));
        var sophutdenkhilogout = Utils.GetTimeLogout();
        var token = new JwtSecurityToken(
               issuer: this.configuration["JWT:ValidIssuer"],
                audience: this.configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddMinutes(sophutdenkhilogout),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authenkey, SecurityAlgorithms.HmacSha512Signature)
               );
        return token;
    }
    #endregion


    #region GET api/nghiepvukk/me
    [HttpGet("api/nghiepvukk/me")]
    [HttpGet("api/nghiepvukk/users/me")]
    public IActionResult GetMe()
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        return this.Ok(issuer);
    }
    #endregion

    #region GET api/nghiepvukk/users/{username}/list-devices deprecated
    [HttpGet("api/nghiepvukk/users/{username}/list-devices")]
    [HttpGet("api/nghiepvukk/users/getdsdangnhap/{username}")]
    public async Task<IActionResult> GetDanhSachDangNhap(string username)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (username is null)
        {
            return this.StatusCode(400, "username_null");
        }
        var result = await this.userManager.FindByNameAsync(username);
        if (result == null)
        {
            return this.StatusCode(400, "username_not exist");
        }
        var rs = result.ThongTinDangNhapJson;
        var ds = new List<ThietBiDangNhap>();
        if (rs != null)
        {
            ds = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(rs);
            ds = ds.Where(x => x.Active == true).ToList();
        }

        return this.Ok(ds);
    }
    #endregion

    #region GET api/nghiepvukk/me-list-devices
    [HttpGet("api/nghiepvukk/me-list-devices")]
    public async Task<IActionResult> GetDevices()
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (issuer.UserName is null or "")
        {
            return this.StatusCode(500, "username_required");
        }

        var result = await this.userManager.FindByNameAsync(issuer.UserName);
        if (result == null)
        {
            return this.StatusCode(400, "username_not exist");
        }
        var rs = result.ThongTinDangNhapJson;
        var ds = new List<ThietBiDangNhap>();
        if (rs != null)
        {
            ds = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(rs);
            ds = ds.Where(x => x.Active == true).ToList();
        }

        return this.Ok(ds);
    }
    #endregion

    #region POST api/nghiepvukk/me-updateinfo
    [HttpPost("api/nghiepvukk/me-updateinfo")]
    [HttpPost("api/nghiepvukk/users/updateinfo")]
    public async Task<IActionResult> UpdateInfo(NguoiDungInfo nguoidung)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (nguoidung.Id == null)
        {
            return this.Ok(0);
        }

        var result = this.userManager.Users.Where(x => x.Id == nguoidung.Id).FirstOrDefault();
        if (result != null)
        {
            result.PhoneNumber = nguoidung.Phone;
            result.Email = nguoidung.Email;
            result.FullName = nguoidung.FullName;
            result.Updated = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now);
            result.UpdatedBy = issuer.UserName;
            var kq = await this.userManager.UpdateAsync(result);
            var token = Utils.LayAccessToken(this.httpContextAccessor);
            this.cache.Remove("users#" + token);
        }
        return this.Ok(1);
    }
    #endregion


    #region POST api/nghiepvukk/users-create
    [HttpPost("api/nghiepvukk/users-create")]
    [HttpPost("api/nghiepvukk/users/createaccount")]
    public async Task<IActionResult> CreateAccount(NguoiDung nguoidung)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (nguoidung.UserName == null || nguoidung.Password == null)
        {
            return this.Unauthorized();
        }

        var userexist = await this.userManager.FindByNameAsync(nguoidung.UserName);
        if (userexist != null)
        {
            return this.StatusCode(400, "TaiKhoanDaTonTai");
        }

        var user = new ApplicationUser
        {
            UserName = nguoidung.UserName,
            Email = nguoidung.Email,
            PhoneNumber = nguoidung.Phone,
            PasswordHash = nguoidung.Password,
            TinhThanhId = nguoidung.TinhThanhId,
            FullName = nguoidung.FullName,
            Scope = nguoidung.Scope,
            CoQuanThucHienId = nguoidung.CoQuanThucHienId,
            Supervisor = nguoidung.Supervisor,
            Members = nguoidung.Members,
            DaXoa = 0,
            TypeOfUser = Utils.TypeOfUsers.Monre,
            Created = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now),
            CreatedBy = issuer.UserName,
            LuuVucSongLienTinhIds = nguoidung.LuuVucSongLienTinhIds,
            LuuVucSongNoiTinhIds = nguoidung.LuuVucSongNoiTinhIds,
            TinhThanhIds = nguoidung.TinhThanhIds
        };
        var result = await this.userManager.CreateAsync(user, nguoidung.Password);
        if (result.Succeeded)
        {
            if (!await this.roleManager.RoleExistsAsync(Consts.UserRoles.Admin))
            {
                await this.roleManager.CreateAsync(new IdentityRole(Consts.UserRoles.Admin));
            }

            if (!await this.roleManager.RoleExistsAsync(Consts.UserRoles.User))
            {
                await this.roleManager.CreateAsync(new IdentityRole(Consts.UserRoles.User));
            }

            if (!await this.roleManager.RoleExistsAsync(Consts.UserRoles.GiamSat))
            {
                await this.roleManager.CreateAsync(new IdentityRole(Consts.UserRoles.GiamSat));
            }

            if (await this.roleManager.RoleExistsAsync(nguoidung.Role))
            {
                await this.userManager.AddToRoleAsync(user, nguoidung.Role);
            }
            if (user.Members != null)
            {
                foreach (var item in user.Members)
                {
                    var userMember = await this.userManager.FindByNameAsync(item);
                    if (userMember != null)
                    {
                        userMember.Supervisor = user.UserName;
                        await this.userManager.UpdateAsync(userMember);
                    }
                }
            }

            return this.Ok("true");
        }
        return this.Ok("false");
        ;
    }
    #endregion

    #region GET api/nghiepvukk/users/{id}
    [HttpGet("api/nghiepvukk/users/{id}")]
    [HttpGet("api/nghiepvukk/users/getbyid/{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        var rs = new NguoiDungView();
        if (id == null)
        {
            return this.Ok(rs);
        }

        var result = this.userManager.Users.Where(x => x.Id == id).FirstOrDefault();
        if (result != null)
        {
            var userRoles = await this.userManager.GetRolesAsync(result);
            foreach (var userRole in userRoles)
            {
                rs.Role = userRole.ToString();
            }
            rs.Id = result.Id;
            rs.UserName = result.UserName;
            rs.Phone = result.PhoneNumber;
            rs.Email = result.Email;
            rs.TinhThanhId = result.TinhThanhId;
            rs.Scope = result.Scope;
            rs.Supervisor = result.Supervisor;
            rs.Members = result.Members;
            rs.FullName = result.FullName;
            rs.TypeOfUser = result.TypeOfUser;
            rs.CoQuanThucHienId = result.CoQuanThucHienId;
            rs.LuuVucSongNoiTinhIds = result.LuuVucSongNoiTinhIds;
            rs.LuuVucSongLienTinhIds = result.LuuVucSongLienTinhIds;
            rs.TinhThanhIds = result.TinhThanhIds;

        }
        return this.Ok(rs);
    }
    #endregion

    #region POST api/nghiepvukk/users-delete/{id}
    [HttpPost("api/nghiepvukk/users-delete/{id}")]
    [HttpDelete("api/nghiepvukk/users/delete/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (id is null or "")
        {
            return this.Ok(0);
        }

        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }

        var user = this.userManager.Users.Where(x => x.Id == id).FirstOrDefault();
        if (user == null || (user.UserName is not null and "userhanoi1"))
        {
            return this.Ok(0);
        }

        if (issuer.Role != Consts.UserRoles.Admin && issuer.Id != user.Id)
        {
            return this.StatusCode(400, "role_invalid");
        }

        if (issuer.Scope != Consts.Scope.Tw && issuer.Scope != user.Scope)
        {
            return this.StatusCode(400, "scope_invalid");
        }

        user.DaXoa = 1;
        await this.userManager.UpdateAsync(user);
        this.context.SaveChanges();
        return this.Ok(1);
    }
    #endregion

    #region POST api/nghiepvukk/users-update
    [HttpPost("api/nghiepvukk/users-update")]
    [HttpPost("api/nghiepvukk/users/update")]
    public async Task<IActionResult> Update(NguoiDung nguoidung)
    {
        if (nguoidung.Id == null)
        {
            return this.Ok(0);
        }

        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }

        var result = this.userManager.Users.Where(x => x.Id == nguoidung.Id).FirstOrDefault();
        if (result != null)
        {
            if (nguoidung.UserName == null || nguoidung.Password == null)
            {
                return this.StatusCode(400, "user_error");
            }

            var userexist = await this.userManager.FindByNameAsync(nguoidung.UserName);
            if (userexist != null && userexist.Id != result.Id)
            {
                return this.StatusCode(400, "TaiKhoanDaTonTai");
            }

            var new_Supervisor = nguoidung.Supervisor;
            var old_Supervisor = result.Supervisor;
            var old_member = result.Members;
            result.UserName = nguoidung.UserName;
            result.PhoneNumber = nguoidung.Phone;
            result.Email = nguoidung.Email;
            result.TinhThanhId = nguoidung.TinhThanhId;
            result.FullName = nguoidung.FullName;
            result.Scope = nguoidung.Scope;
            result.Supervisor = nguoidung.Supervisor;
            result.CoQuanThucHienId = nguoidung.CoQuanThucHienId;
            result.Members = nguoidung.Members;
            result.Updated = Utils.DateTimeToUnixTimeMilliseconds(DateTime.Now);
            result.UpdatedBy = issuer.UserName;
            result.LuuVucSongLienTinhIds = nguoidung.LuuVucSongLienTinhIds;
            result.LuuVucSongNoiTinhIds = nguoidung.LuuVucSongNoiTinhIds;
            result.TinhThanhIds = nguoidung.TinhThanhIds;
            await this.userManager.UpdateAsync(result);

            if (new_Supervisor != old_Supervisor)
            {
                if (new_Supervisor != null)
                {
                    var user = await this.userManager.FindByNameAsync(new_Supervisor);
                    if (user != null)
                    {
                        user.Members ??= [];

                        user.Members.Add(result.UserName);
                        await this.userManager.UpdateAsync(user);
                    }
                }
                if (old_Supervisor != null)
                {
                    var user_old = await this.userManager.FindByNameAsync(old_Supervisor);
                    if (user_old != null)
                    {
                        if (user_old.Members != null)
                        {
                            user_old.Members.Remove(result.UserName);
                            await this.userManager.UpdateAsync(user_old);
                        }
                    }
                }
            }

            if (await this.roleManager.RoleExistsAsync(nguoidung.Role))
            {
                var userRoles = await this.userManager.GetRolesAsync(result);
                await this.userManager.RemoveFromRoleAsync(result, userRoles.ToString());
                await this.userManager.AddToRoleAsync(result, nguoidung.Role);
            }

            if (old_member != null)
            {
                foreach (var item in old_member)
                {
                    var userMember = await this.userManager.FindByNameAsync(item);
                    if (userMember != null)
                    {
                        userMember.Supervisor = null;
                        await this.userManager.UpdateAsync(userMember);
                    }
                }
            }

            if (nguoidung.Members != null)
            {
                foreach (var item in nguoidung.Members)
                {

                    var userMember = await this.userManager.FindByNameAsync(item);
                    if (userMember != null)
                    {
                        userMember.Supervisor = result.UserName;
                        await this.userManager.UpdateAsync(userMember);
                    }
                }
            }

        }
        return this.Ok(1);
    }
    #endregion

    #region POST api/nghiepvukk/users-update-password
    [HttpPost("api/nghiepvukk/users-update-password")]
    [HttpPost("api/nghiepvukk/users/doimatkhau")]
    public async Task<IActionResult> DoiMatKhau(DoiPass doiPass)
    {
        if (doiPass.OldPass is null)
        {
            return this.StatusCode(400, "matkhau_null");
        }
        if (doiPass.NewPass is null)
        {
            return this.StatusCode(400, "matkhau_null");
        }

        var anyuser = Utils.ReadAnyUser(this.httpContextAccessor, this.userManager, this.HttpContext);
        if (anyuser == null)
        {
            return this.Unauthorized();
        }

        if (anyuser.UserName is null or "" or "userhanoi1")
        {
            return this.Ok("0"); // return this.StatusCode(400, "username_invalid");
        }

        var result = await this.userManager.FindByNameAsync(anyuser.UserName);
        if (result == null)
        {
            return this.StatusCode(400, "username_invalid");
        }

        var rs = await this.userManager.ChangePasswordAsync(result, doiPass.OldPass, doiPass.NewPass);
        if (rs.Succeeded)
        {
            return this.Ok("1");
        }
        else
        {
            return this.StatusCode(400, rs.Errors.ToString());
        }
    }
    #endregion

    #region POST api/nghiepvukk/users/createtoken/{username}
    [HttpPost("api/nghiepvukk/users/createtoken/{username}")]
    public async Task<IActionResult> CreateTokenByUser(string username)
    {
        var anyuser = Utils.ReadAnyUser(this.httpContextAccessor, this.userManager, this.HttpContext);
        if (anyuser == null)
        {
            return this.Unauthorized();
        }
        if (anyuser.Role != Consts.UserRoles.Admin)
        {
            return this.Unauthorized();
        }

        var user = await this.userManager.FindByNameAsync(username);
        if (user == null)
        {
            return this.StatusCode(400, "user_error");
        }

        if (anyuser.Scope == Consts.Scope.Dvtt)
        {
            if (anyuser.CoQuanThucHienId != user.CoQuanThucHienId)
            {
                return this.StatusCode(400, "user1_error");
            }
        }

        if (anyuser.Scope == Consts.Scope.Tinh)
        {
            if (anyuser.TinhThanhId != user.TinhThanhId)
            {
                return this.StatusCode(400, "user2_error");
            }
        }

        if (user != null)
        {
            if (user.DaXoa == 0)
            {
                var role = "";
                var authen = new List<Claim>
                {
                new(ClaimTypes.Name,username),
                new(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),

                };
                var userRoles = await this.userManager.GetRolesAsync(user);
                foreach (var userRole in userRoles)
                {
                    authen.Add(new Claim(ClaimTypes.Role, userRole.ToString()));
                    role = userRole.ToString();
                }

                var token = this.CreateToken(authen);
                var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
                user.ResetToken = accessToken;
                await this.userManager.UpdateAsync(user);
                this.context.SaveChanges();

                return this.Ok(new
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    UserName = username
                });

            }
        }
        else
        {
            return this.StatusCode(400, "User.Error");
        }

        return this.Unauthorized();
    }
    #endregion

    #region POST api/nghiepvukk/users-list
    [HttpPost("api/nghiepvukk/users-list")]
    [HttpPost("api/nghiepvukk/users/list")]
    public IActionResult GetAll(NguoiDungRequest req)
    {
        var qr = (from users in this.context.Users
                  join userRole in this.context.UserRoles
                on users.Id equals userRole.UserId
                  join roles in this.context.Roles on userRole.RoleId equals roles.Id
                  select new NguoiDungView
                  {
                      Id = users.Id,
                      UserName = users.UserName,
                      Email = users.Email,
                      Phone = users.PhoneNumber,
                      FullName = users.FullName,
                      TinhThanhId = users.TinhThanhId,
                      DaXoa = users.DaXoa,
                      Supervisor = users.Supervisor,
                      Scope = users.Scope,
                      TypeOfUser = users.TypeOfUser,
                      CoQuanThucHienId = users.CoQuanThucHienId,
                      Role = roles.Name,
                      ThongTinDangNhapJson = users.ThongTinDangNhapJson,
                      LuuVucSongLienTinhIds = users.LuuVucSongLienTinhIds,
                      LuuVucSongNoiTinhIds = users.LuuVucSongNoiTinhIds,
                      TinhThanhIds = users.TinhThanhIds
                  }).AsEnumerable();



        var role = "";
        var tinhthanhid = "";
        var scope = "";
        var dvtt = "";
        List<string> members = [];

        var nguoidung = Utils.GetUser(this.httpContextAccessor, this.userManager);
        if (nguoidung != null)
        {
            role = nguoidung.Role;
            tinhthanhid = nguoidung.TinhThanhId;
            scope = nguoidung.Scope;
            members = nguoidung.Members;
            dvtt = nguoidung.CoQuanThucHienId;
        }
        if (role == Consts.UserRoles.User)
        {
            qr = qr.Where(x => x.UserName == nguoidung.UserName);
        }
        else if (role == Consts.UserRoles.Admin)
        {
            if (nguoidung != null && nguoidung.Scope != "tw")
            {
                qr = qr.Where(x => x.Scope == scope);
                if (tinhthanhid != "")
                {
                    qr = qr.Where(x => x.TinhThanhId == tinhthanhid);
                }

                if (dvtt != "")
                {
                    qr = qr.Where(x => x.CoQuanThucHienId == dvtt);
                }
            }

        }
        else if (role == Consts.UserRoles.GiamSat)
        {
            qr = qr.Where(x => nguoidung != null && (x.Supervisor == nguoidung.UserName || x.UserName == nguoidung.UserName));
        }

        if (!string.IsNullOrEmpty(req.TuKhoa))
        {
            qr = qr.Where(x => (x.UserName != null && x.UserName.Contains(req.TuKhoa, StringComparison.CurrentCultureIgnoreCase)) || (x.Email != null && x.Email.Contains(req.TuKhoa, StringComparison.CurrentCultureIgnoreCase)) || (x.Phone != null && x.Phone.Contains(req.TuKhoa, StringComparison.CurrentCultureIgnoreCase)) || (x.FullName != null && x.FullName.Contains(req.TuKhoa, StringComparison.CurrentCultureIgnoreCase)));
        }

        if (req.Scope is not null and not "")
        {
            qr = qr.Where(t => t.Scope == req.Scope);
        }
        if (req.Scope is not null and Consts.Scope.Dvtt && req.CoQuanThucHienIds != null && req.CoQuanThucHienIds.Count > 0)
        {
            qr = qr.Where(t => t.CoQuanThucHienId != null && req.CoQuanThucHienIds.Contains(t.CoQuanThucHienId));
        }
        if (req.Scope is not null and Consts.Scope.Tinh && req.CoQuanThucHienIds != null && req.CoQuanThucHienIds.Count > 0)
        {
            qr = qr.Where(t => t.TinhThanhId != null && req.CoQuanThucHienIds.Contains(t.TinhThanhId));
        }

        if (!string.IsNullOrEmpty(req.TinhId))
        {
            qr = qr.Where(x => x.TinhThanhId == req.TinhId);
        }
        if (!string.IsNullOrEmpty(req.CoQuanThucHienId))
        {
            qr = qr.Where(x => x.CoQuanThucHienId == req.CoQuanThucHienId);
        }
        if (!string.IsNullOrEmpty(req.Role))
        {
            qr = qr.Where(x => x.Role == req.Role);
        }

        if (req.CanBoDieuTra == true)
        {
            var resnguoidung = new NguoiDungs
            {
                Records = qr.ToList(),
                Count = qr.ToList().Count
            };

            return this.Ok(resnguoidung);
        }

        qr = qr.Where(x => x.DaXoa == 0);

        var recordCount = 0;
        if (req.Anchor == null || req.Anchor.Length == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor != null && req.Anchor.Length > 0)
        {
            qr = qr.Where(t => string.Compare(t.Id, req.Anchor, StringComparison.Ordinal) < 0);
        }

        if (req.Limit < 1)
        {
            req.Limit = 64;
        }
        qr = qr.Take(req.Limit + 1);

        var nguoidungs = qr.ToList();

        if (!string.IsNullOrEmpty(req.Role))
        {
            nguoidungs = [.. nguoidungs.AsQueryable().Where(x => x.Role == req.Role)];
        }

        var res = new NguoiDungs
        {
            Limit = req.Limit
        };
        if (nguoidungs.Count > req.Limit)
        {
            res.Anchor = nguoidungs[req.Limit - 1].Id;
            res.Records = nguoidungs.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = nguoidungs;
        }

        foreach (var item in res.Records)
        {
            if (item.ThongTinDangNhapJson != null)
            {
                item.ThongTinDangNhaps = JsonSerializer.Deserialize<List<ThietBiDangNhap>>(item.ThongTinDangNhapJson);
            }
        }
        res.Count = recordCount;

        return this.Ok(res);

    }
    #endregion

    #region GET api/nghiepvukk/users/getgiamsatbyscope/{scope} users-list
    [HttpGet("api/nghiepvukk/users/getgiamsatbyscope/{scope}")]
    public IActionResult GetGiamSatByScope(string scope)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (scope == null)
        {
            return this.Ok(null);
        }

        var result = this.userManager.GetUsersInRoleAsync(Consts.UserRoles.GiamSat).Result.ToList();
        result = result.Where(x => x.Scope == scope).ToList();
        return this.Ok(result);
    }
    #endregion

    #region GET api/nghiepvukk/users/getuserbyscope/{scope} users-list
    [HttpGet("api/nghiepvukk/users/getuserbyscope/{scope}")]
    public IActionResult GetUserByScope(string scope)
    {
        var issuer = Utils.ReadUser(this.httpContextAccessor, this.userManager);
        if (issuer == null)
        {
            return this.Unauthorized();
        }
        if (issuer.Error is not null and not "")
        {
            return this.StatusCode(400, issuer.Error);
        }
        if (scope == null)
        {
            return this.Ok(null);
        }

        var result = this.userManager.GetUsersInRoleAsync(Consts.UserRoles.User).Result.ToList();
        result = result.Where(x => x.Scope == scope && x.Supervisor == null && x.DaXoa == 0).ToList();
        return this.Ok(result);
    }
    #endregion


}
