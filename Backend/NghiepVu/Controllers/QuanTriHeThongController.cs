namespace NghiepVu.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NghiepVu.Api.Models;

[Authorize]
[ApiController]
public class QuanTriHeThongController : ControllerBase
{
    private readonly NghiepVuContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private Microsoft.Extensions.Hosting.IHostingEnvironment _hostingEnvironment;

    public QuanTriHeThongController(NghiepVuContext context, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, Microsoft.Extensions.Hosting.IHostingEnvironment environment)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _userManager = userManager;
        _roleManager = roleManager;
        _hostingEnvironment = environment;
    }
    #region Quản lý dịch vụ trong hệ thống
    /// <summary>
    /// danh sách dịch vụ
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/dichvus")]
    [AllowAnonymous]
    public IActionResult danhsach_dichvus(CommonRequest req)
    {
        var qr = (from a in _context.QTHT_DichVus
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && a.Ten.ToLower().Contains(req.Tukhoa.ToLower())))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor > 0)
        {
            qr = qr.Where(t => t.Id < req.Anchor);
        }

        if (req.Limit < 1)
        {
            req.Limit = 10000;
        }
        qr = qr.Take(req.Limit + 1);
        var listRecords = qr.ToList();

        var res = new list_dichvus
        {
            Limit = req.Limit
        };
        if (listRecords.Count > req.Limit)
        {
            res.Anchor = listRecords[req.Limit - 1].Id;
            res.Records = listRecords.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = listRecords;
        }
        res.Count = recordCount;

        return Ok(res);
    }

    /// <summary>
    /// add or update dịch vụ
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/add_or_update_dichvu")]
    [AllowAnonymous]
    public IActionResult add_or_update_dichvu(QTHT_DichVus obj)
    {
        if (string.IsNullOrEmpty(obj.Ten))
        {
            return StatusCode(400, "ten_required");
        }
        var _DbItem = _context.QTHT_DichVus.Find(obj.Id);
        if (_DbItem == null)
        {
            _context.QTHT_DichVus.Add(obj);
        }
        else
        {
            _DbItem.Assign(obj);
            _context.QTHT_DichVus.Update(_DbItem);
        }
        _context.SaveChanges();
        return Ok(obj);
    }
    /// <summary>
    /// lấy thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("api/truyxuat/dichvu/{id}")]
    [AllowAnonymous]
    public IActionResult get_dichvu_byid(int id = 0)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var _DbItem = _context.QTHT_DichVus.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        return Ok(_DbItem);
    }
    /// <summary>
    /// xóa thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/dichvu/delete/{id}")]
    public IActionResult delete_dichvu(int id)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var db_item = _context.QTHT_DichVus.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.QTHT_DichVus.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }

    #endregion

    #region Nhóm người dùng
    [HttpPost("api/truyxuat/roles")]
    [AllowAnonymous]
    public IActionResult danhsach_roles([FromBody] RequestOther req)
    {
        var qr = (from a in _context.Roles
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && a.Name.ToLower().Contains(req.Tukhoa.ToLower())))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == null || req.Anchor.Length == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor != null && req.Anchor.Length > 0)
        {
            qr = qr.Where(t => string.Compare(t.Id, req.Anchor) < 0);
        }

        if (req.Limit < 1)
        {
            req.Limit = 64;
        }
        qr = qr.Take(req.Limit + 1);

        var roles = qr.ToList();

        var res = new list_roles
        {
            Limit = req.Limit
        };
        if (roles.Count > req.Limit)
        {
            res.Anchor = roles[req.Limit - 1].Id;
            res.Records = roles.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = roles;
        }
        res.Count = recordCount;

        return Ok(res);
    }
    [HttpPost("api/truyxuat/create_or_update_role")]
    [AllowAnonymous]
    public async Task<IActionResult> create_or_update_role(IdentityRole obj)
    {
        if (string.IsNullOrEmpty(obj.Name))
        {
            return StatusCode(400, "ten_required");
        }
        var _DbItem = _context.Roles.Find(obj.Id);
        if (_DbItem == null)
        {
            var roleExist = _context.Roles.FirstOrDefault(x => x.Name.ToLower() == obj.Name.ToLower());
            if (roleExist != null)
            {
                return StatusCode(400, "ten_exist");
            }
            obj.Id = Guid.NewGuid().ToString();
            obj.NormalizedName = obj.Name.ToUpper();
            await _context.Roles.AddAsync(obj);
            //_context.Roles.Add(obj);
        }
        else
        {
            var roleExist = _context.Roles.FirstOrDefault(x => x.Name.ToLower() == obj.Name.ToLower() && x.Id != _DbItem.Id);
            if (roleExist != null)
            {
                return StatusCode(400, "ten_exist");
            }
            _DbItem.Name = obj.Name;
            _DbItem.NormalizedName = obj.Name.ToUpper();
            _context.Roles.Update(_DbItem);
        }
        _context.SaveChanges();
        //logs
        add_log(new QTHT_Logs { Content = "Thêm mới, sửa nhóm người dùng", Controller_Action = "QuanTriHeThongController-create_or_update_role", UserCreate = "admin" });
        return Ok(obj);

    }

    [HttpGet("api/truyxuat/role/{id}")]
    [AllowAnonymous]
    public IActionResult get_role_byid(string id)
    {
        if (string.IsNullOrEmpty(id))
            return StatusCode(400, "id_required");
        var _DbItem = _context.Roles.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        return Ok(_DbItem);
    }

    /// <summary>
    /// sau xem xét xóa các bảng liên quan đến role trước khi xóa role
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/role/delete/{id}")]
    public IActionResult delete_role(string id)
    {
        if (string.IsNullOrEmpty(id))
            return StatusCode(400, "id_required");
        var db_item = _context.Roles.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.Roles.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }
    #endregion

    #region Ứng dụng trong hệ thống

    /// <summary>
    /// danh sách apps
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/applications")]
    [AllowAnonymous]
    public IActionResult list_apps(CommonRequest req)
    {
        var qr = (from a in _context.QTHT_Apps
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && a.Name.ToLower().Contains(req.Tukhoa.ToLower())))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor > 0)
        {
            qr = qr.Where(t => t.Id < req.Anchor);
        }

        if (req.Limit < 1)
        {
            req.Limit = 10000;
        }
        qr = qr.Take(req.Limit + 1);
        var listRecords = qr.ToList();

        var res = new list_apps
        {
            Limit = req.Limit
        };
        if (listRecords.Count > req.Limit)
        {
            res.Anchor = listRecords[req.Limit - 1].Id;
            res.Records = listRecords.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = listRecords;
        }
        res.Count = recordCount;

        return Ok(res);
    }

    /// <summary>
    /// add or update app
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/add_or_update_application")]
    [AllowAnonymous]
    public IActionResult add_or_update_application(QTHT_Apps obj)
    {
        if (string.IsNullOrEmpty(obj.Name))
        {
            return StatusCode(400, "ten_required");
        }
        var _DbItem = _context.QTHT_Apps.Find(obj.Id);
        if (_DbItem == null)
        {
            _context.QTHT_Apps.Add(obj);
        }
        else
        {
            _DbItem.Assign(obj);
            _context.QTHT_Apps.Update(_DbItem);
        }
        _context.SaveChanges();
        return Ok(obj);
    }
    /// <summary>
    /// lấy thông tin app
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("api/truyxuat/application/{id}")]
    [AllowAnonymous]
    public IActionResult get_app_byid(int id = 0)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var _DbItem = _context.QTHT_Apps.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        return Ok(_DbItem);
    }
    /// <summary>
    /// xóa thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/application/delete/{id}")]
    public IActionResult delete_app(int id)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var db_item = _context.QTHT_Apps.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.QTHT_Apps.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }

    #endregion

    #region Gán người dùng vào nhóm
    //danh sách người dùng thuộc nhóm
    [HttpPost("api/truyxuat/user_in_role/{roleId}")]
    [AllowAnonymous]
    public async Task<IActionResult> user_in_role(RequestOther req, string roleId)
    {
        try
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return StatusCode(200, "not_found");
            var strUserId = _context.UserRoles.Where(x => x.RoleId == roleId).Select(x => x.UserId);
            var qr = _context.Users.Where(x => strUserId.Contains(x.Id));
            var recordCount = 0;
            if (req.Anchor == null || req.Anchor.Length == 0)
            {
                recordCount = qr.Count();
            }

            qr = qr.OrderByDescending(t => t.Id);
            if (req.Anchor != null && req.Anchor.Length > 0)
            {
                qr = qr.Where(t => string.Compare(t.Id, req.Anchor) < 0);
            }

            if (req.Limit < 1)
            {
                req.Limit = 1000;
            }
            qr = qr.Take(req.Limit + 1);

            var roles = qr.ToList();

            var res = new list_users
            {
                Limit = req.Limit
            };
            if (roles.Count > req.Limit)
            {
                res.Anchor = roles[req.Limit - 1].Id;
                res.Records = roles.Take(req.Limit).ToList();
            }
            else
            {
                res.Records = roles;
            }
            res.Count = recordCount;

            return Ok(res);
        }
        catch (Exception)
        {
            return BadRequest();
        }

    }
    /// <summary>
    /// Danh sách người dùng không thuộc nhóm
    /// </summary>
    /// <param name="req"></param>
    /// <param name="roleId"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/user_notin_role/{roleId}")]
    [AllowAnonymous]
    public async Task<IActionResult> user_notin_role(RequestOther req, string roleId)
    {
        try
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return StatusCode(200, "not_found");
            var strUserId = _context.UserRoles.Where(x => x.RoleId == roleId).Select(x => x.UserId);
            var qr = _context.Users.Where(x => !strUserId.Contains(x.Id));
            var recordCount = 0;
            if (req.Anchor == null || req.Anchor.Length == 0)
            {
                recordCount = qr.Count();
            }

            qr = qr.OrderByDescending(t => t.Id);
            if (req.Anchor != null && req.Anchor.Length > 0)
            {
                qr = qr.Where(t => string.Compare(t.Id, req.Anchor) < 0);
            }

            if (req.Limit < 1)
            {
                req.Limit = 1000;
            }
            qr = qr.Take(req.Limit + 1);

            var roles = qr.ToList();

            var res = new list_users
            {
                Limit = req.Limit
            };
            if (roles.Count > req.Limit)
            {
                res.Anchor = roles[req.Limit - 1].Id;
                res.Records = roles.Take(req.Limit).ToList();
            }
            else
            {
                res.Records = roles;
            }
            res.Count = recordCount;

            return Ok(res);
        }
        catch (Exception)
        {
            return BadRequest();
        }

    }

    /// <summary>
    /// xóa người dùng khỏi nhóm
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/user_role_remove")]
    [AllowAnonymous]
    public async Task<IActionResult> user_role_remove(user_role_remove obj)
    {
        if (obj.UserId == null || string.IsNullOrEmpty(obj.RoleId))
            return StatusCode(400, "parameter_required");
        foreach (var item in obj.UserId)
        {
            var user_role = await _context.UserRoles.Where(x => x.UserId == item && x.RoleId == obj.RoleId).FirstOrDefaultAsync();
            _context.UserRoles.Remove(user_role);
            await _context.SaveChangesAsync();
        }
        return Ok("Xóa người dùng khỏi nhóm thành công!");
    }
    /// <summary>
    /// add người dùng vào nhóm
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/user_role_add")]
    [AllowAnonymous]
    public async Task<IActionResult> user_role_add(user_role_remove obj)
    {
        if (obj.UserId == null || string.IsNullOrEmpty(obj.RoleId))
            return StatusCode(400, "parameter_required");
        var role = await _context.Roles.FindAsync(obj.RoleId);
        if (role == null)
            return StatusCode(400, "not_found");
        foreach (var item in obj.UserId)
        {
            var user = await _context.Users.FindAsync(item);
            await _userManager.AddToRoleAsync(user, role.Name);
            await _context.SaveChangesAsync();
        }
        return Ok("Thêm người dùng vào nhóm thành công!");
    }
    #endregion

    

    #region Nhóm chức năng
    /// <summary>
    /// danh sách nhóm chức năng
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/moduls")]
    [AllowAnonymous]
    public IActionResult get_list_moduls(CommonRequest req)
    {
        var qr = (from a in _context.QTHT_Modules
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && a.Name.ToLower().Contains(req.Tukhoa.ToLower())))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor > 0)
        {
            qr = qr.Where(t => t.Id < req.Anchor);
        }

        if (req.Limit < 1)
        {
            req.Limit = 10000;
        }
        qr = qr.Take(req.Limit + 1);
        var listRecords = qr.ToList();

        var res = new list_modules
        {
            Limit = req.Limit
        };
        if (listRecords.Count > req.Limit)
        {
            res.Anchor = listRecords[req.Limit - 1].Id;
            res.Records = listRecords.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = listRecords;
        }
        res.Count = recordCount;

        return Ok(res);
    }

    /// <summary>
    /// add or update dịch vụ
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/add_or_update_module")]
    [AllowAnonymous]
    public IActionResult add_or_update_module(QTHT_Modules obj)
    {
        if (string.IsNullOrEmpty(obj.Name))
        {
            return StatusCode(400, "ten_required");
        }
        var _DbItem = _context.QTHT_Modules.Find(obj.Id);
        if (_DbItem == null)
        {
            _context.QTHT_Modules.Add(obj);
        }
        else
        {
            _DbItem.Assign(obj);
            _context.QTHT_Modules.Update(_DbItem);
        }
        _context.SaveChanges();
        return Ok(obj);
    }
    /// <summary>
    /// lấy thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("api/truyxuat/module/{id}")]
    [AllowAnonymous]
    public IActionResult get_module_byid(int id = 0)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var _DbItem = _context.QTHT_Modules.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        return Ok(_DbItem);
    }
    /// <summary>
    /// xóa thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/module/delete/{id}")]
    public IActionResult delete_module(int id)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var db_item = _context.QTHT_Modules.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.QTHT_Modules.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }

    #endregion

    #region Chức năng
    /// <summary>
    /// danh sách nhóm chức năng
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/functions")]
    [AllowAnonymous]
    public IActionResult get_list_functions(CommonRequest req)
    {
        var qr = (from a in _context.QTHT_Functions
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && a.Name.ToLower().Contains(req.Tukhoa.ToLower())))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor > 0)
        {
            qr = qr.Where(t => t.Id < req.Anchor);
        }

        if (req.Limit < 1)
        {
            req.Limit = 10000;
        }
        qr = qr.Take(req.Limit + 1);
        var listRecords = qr.ToList();

        var res = new list_functions
        {
            Limit = req.Limit
        };
        if (listRecords.Count > req.Limit)
        {
            res.Anchor = listRecords[req.Limit - 1].Id;
            res.Records = listRecords.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = listRecords;
        }
        res.Count = recordCount;

        return Ok(res);
    }

    /// <summary>
    /// add or update dịch vụ
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/add_or_update_function")]
    [AllowAnonymous]
    public IActionResult add_or_update_function(QTHT_Functions obj)
    {
        if (string.IsNullOrEmpty(obj.Name))
        {
            return StatusCode(400, "ten_required");
        }
        var _DbItem = _context.QTHT_Functions.Find(obj.Id);
        if (_DbItem == null)
        {
            _context.QTHT_Functions.Add(obj);
        }
        else
        {
            _DbItem.Assign(obj);
            _context.QTHT_Functions.Update(_DbItem);
        }
        _context.SaveChanges();
        return Ok(obj);
    }
    /// <summary>
    /// lấy thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("api/truyxuat/function/{id}")]
    [AllowAnonymous]
    public IActionResult get_function_byid(int id = 0)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var _DbItem = _context.QTHT_Functions.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        if (_DbItem.ModuleId > 0)
        {
            _DbItem.Module = _context.QTHT_Modules.Find(_DbItem.ModuleId);
        }
        return Ok(_DbItem);
    }
    /// <summary>
    /// xóa thông tin dịch vụ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/function/delete/{id}")]
    public IActionResult delete_function(int id)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var db_item = _context.QTHT_Functions.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.QTHT_Functions.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }

    #endregion
    #region Phân quyền chức năng
    //danh sách chức năng theo nhóm người dùng
    [HttpGet("api/truyxuat/get_functions_by_role/{roleId}")]
    [AllowAnonymous]
    public IActionResult get_functions_by_role(string roleId)
    {
        List<role_module_functions_view> lstView = new List<role_module_functions_view>();
        var modules = _context.QTHT_Modules.ToList();
        var role_fucs = _context.QTHT_Roles_Functions.Where(x => x.RoleId == roleId).Select(x => x.FunctionId).ToList();
        foreach (var item in modules)
        {
            var functions = (from f in _context.QTHT_Functions
                             where f.ModuleId == item.Id
                             select new functions_view
                             {
                                 AppId = f.Id,
                                 Id = f.Id,
                                 Description = f.Description,
                                 Name = f.Name,
                                 ModuleId = f.ModuleId,
                                 MaChucNang = f.MaChucNang,
                                 IsCheck = role_fucs.Any(x => x == f.Id)
                             }).ToList();
            var checkItem = functions.Any(x => x.IsCheck == true);
            var view = new role_module_functions_view
            {
                Id = item.Id,
                Name = item.Name,
                ModuleCode = item.ModuleCode,
                Children = functions,
                IsCheck = checkItem,
            };
            lstView.Add(view);
        }
        return Ok(lstView);
        //var role_fucs = _context.QTHT_Roles_Functions.Where(x => x.RoleId == roleId).Select(x => x.FunctionId).ToList();
        //var functions = _context.QTHT_Functions.Where(x => role_fucs.Contains(x.Id)).ToList();
        //if (!functions.Any())
        //    return StatusCode(400, "not_found");
        //return Ok(functions);
    }
    //phân quyền chức năng
    [HttpPost("api/truyxuat/add_role_function")]
    [AllowAnonymous]
    public IActionResult add_role_function(role_functions obj)
    {
        if (obj == null)
            return StatusCode(400, "parameter_required");
        var role_fucs = _context.QTHT_Roles_Functions.Where(x => x.RoleId == obj.RoleId);

        foreach (var item in obj.FunctionIds)
        {
            var rf = new QTHT_Roles_Functions
            {
                FunctionId = item,
                RoleId = obj.RoleId
            };
            _context.QTHT_Roles_Functions.Add(rf);
        }
        _context.SaveChanges();
        return Ok(obj);
    }


    //danh sách chức năng thuộc nhóm
    [HttpPost("api/truyxuat/function_in_role/{roleId}")]
    [AllowAnonymous]
    public async Task<IActionResult> function_in_role(CommonRequest req, string roleId)
    {
        try
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return StatusCode(200, "not_found");
            var strFunctionId = _context.QTHT_Roles_Functions.Where(x => x.RoleId == roleId).Select(x => x.FunctionId);
            var qr = _context.QTHT_Functions.Where(x => strFunctionId.Contains(x.Id));
            var recordCount = 0;
            if (req.Anchor == 0)
            {
                recordCount = qr.Count();
            }

            qr = qr.OrderByDescending(t => t.Id);
            if (req.Anchor > 0)
            {
                qr = qr.Where(t => t.Id < req.Anchor);
            }

            if (req.Limit < 1)
            {
                req.Limit = 10000;
            }
            qr = qr.Take(req.Limit + 1);
            var listRecords = qr.ToList();


            var res = new list_functions
            {
                Limit = req.Limit
            };
            if (listRecords.Count > req.Limit)
            {
                res.Anchor = listRecords[req.Limit - 1].Id;
                res.Records = listRecords.Take(req.Limit).ToList();
            }
            else
            {
                res.Records = listRecords;
            }
            res.Count = recordCount;

            return Ok(res);
        }
        catch (Exception)
        {
            return BadRequest();
        }

    }
    /// <summary>
    /// Danh sách chức năng không thuộc nhóm
    /// </summary>
    /// <param name="req"></param>
    /// <param name="roleId"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/function_notin_role/{roleId}")]
    [AllowAnonymous]
    public async Task<IActionResult> function_notin_role(CommonRequest req, string roleId)
    {
        try
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return StatusCode(200, "not_found");
            var strFunctionId = _context.QTHT_Roles_Functions.Where(x => x.RoleId == roleId).Select(x => x.FunctionId);
            var qr = _context.QTHT_Functions.Where(x => !strFunctionId.Contains(x.Id));
            var recordCount = 0;
            if (req.Anchor == 0)
            {
                recordCount = qr.Count();
            }

            qr = qr.OrderByDescending(t => t.Id);
            if (req.Anchor > 0)
            {
                qr = qr.Where(t => t.Id < req.Anchor);
            }

            if (req.Limit < 1)
            {
                req.Limit = 10000;
            }
            qr = qr.Take(req.Limit + 1);
            var listRecords = qr.ToList();


            var res = new list_functions
            {
                Limit = req.Limit
            };
            if (listRecords.Count > req.Limit)
            {
                res.Anchor = listRecords[req.Limit - 1].Id;
                res.Records = listRecords.Take(req.Limit).ToList();
            }
            else
            {
                res.Records = listRecords;
            }
            res.Count = recordCount;

            return Ok(res);
        }
        catch (Exception)
        {
            return BadRequest();
        }

    }

    /// <summary>
    /// xóa chức năng khỏi nhóm
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/function_role_remove")]
    [AllowAnonymous]
    public async Task<IActionResult> function_role_remove(role_functions obj)
    {
        if (obj.FunctionIds == null || string.IsNullOrEmpty(obj.RoleId))
            return StatusCode(400, "parameter_required");
        foreach (var item in obj.FunctionIds)
        {
            var function_role = await _context.QTHT_Roles_Functions.Where(x => x.FunctionId == item && x.RoleId == obj.RoleId).FirstOrDefaultAsync();
            _context.QTHT_Roles_Functions.Remove(function_role);
            await _context.SaveChangesAsync();
        }
        return Ok("Xóa chức năng khỏi nhóm thành công!");
    }
    #endregion


    #region Nhật ký hệ thống
    /// <summary>
    /// danh sách nhật ký theo tên người dùng or nội dung, theo giai đoạn
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/logs")]
    [AllowAnonymous]
    public IActionResult get_list_logs(QTHT_Logs_Request req)
    {
        var qr = (from a in _context.QTHT_Logs
                  where
                 (string.IsNullOrEmpty(req.Tukhoa) || (!string.IsNullOrEmpty(req.Tukhoa) && (a.Content.ToLower().Contains(req.Tukhoa.ToLower()) || (a.UserCreate.ToLower().Contains(req.Tukhoa.ToLower())))))
                 && (req.TuNgay == 0 || (req.TuNgay != 0 && a.NgayTao >= req.TuNgay))
                 && (req.DenNgay == 0 || (req.DenNgay != 0 && a.NgayTao <= req.DenNgay))
                  select a
                );
        var recordCount = 0;
        if (req.Anchor == 0)
        {
            recordCount = qr.Count();
        }

        qr = qr.OrderByDescending(t => t.Id);
        if (req.Anchor > 0)
        {
            qr = qr.Where(t => t.Id < req.Anchor);
        }

        if (req.Limit < 1)
        {
            req.Limit = 10000;
        }
        qr = qr.Take(req.Limit + 1);
        var listRecords = qr.ToList();

        var res = new list_logs
        {
            Limit = req.Limit
        };
        if (listRecords.Count > req.Limit)
        {
            res.Anchor = (int)listRecords[req.Limit - 1].Id;
            res.Records = listRecords.Take(req.Limit).ToList();
        }
        else
        {
            res.Records = listRecords;
        }
        res.Count = recordCount;

        return Ok(res);
    }

    /// <summary>
    /// add or update thông tin liên hệ
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/add_log")]
    [AllowAnonymous]
    public IActionResult add_log(QTHT_Logs obj)
    {
        if (string.IsNullOrEmpty(obj.Content))
        {
            return StatusCode(400, "content_required");
        }
        _context.QTHT_Logs.Add(obj);
        _context.SaveChanges();
        return Ok(obj);
    }
    /// <summary>
    /// lấy thông tin tài liệu
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("api/truyxuat/log/{id}")]
    [AllowAnonymous]
    public IActionResult get_log_byid(long id = 0)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var _DbItem = _context.QTHT_Logs.Find(id);
        if (_DbItem == null)
            return StatusCode(400, "id_notFound");
        return Ok(_DbItem);
    }
    /// <summary>
    /// xóa thông tin liên hệ
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPost("api/truyxuat/log/delete/{id}")]
    public IActionResult delete_log(int id)
    {
        if (id == 0)
            return StatusCode(400, "id_required");
        var db_item = _context.QTHT_Logs.Find(id);
        if (db_item == null)
            return StatusCode(400, "id_notFound");
        _context.QTHT_Logs.Remove(db_item);
        _context.SaveChanges();
        return Ok("Xóa thành công");
    }

    #endregion

}

