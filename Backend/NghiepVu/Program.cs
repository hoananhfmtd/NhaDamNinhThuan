using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Minio;
using NghiepVu;
using NghiepVu.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// minio injection
var minio_cfg = builder.Configuration.GetSection("MinIO").Get<CfgMinio>();
var minio = new MinioClient().WithEndpoint(minio_cfg.Url).WithCredentials(minio_cfg.AccessKey, minio_cfg.SecretKey).WithSSL(Convert.ToBoolean(minio_cfg.Secure)).Build();
builder.Services.AddSingleton(minio);

builder.Services.AddIdentity<ApplicationUser, IdentityRole>().AddEntityFrameworkStores<NghiepVuContext>().AddDefaultTokenProviders();
builder.Services.AddDbContext<NghiepVuContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), x => x.UseNetTopologySuite().CommandTimeout(120)));

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault);


builder.Services.AddHttpClient();

builder.Services.AddAuthorization();

builder.Services.AddAuthentication(option =>
{
    option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(option =>
{
    option.SaveToken = true;
    option.RequireHttpsMetadata = false;
    option.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Serect"]))
    };
});

builder.Services.AddMvc().AddControllersAsServices(); // call between 2 controllers

builder.Services.Configure<IdentityOptions>(options =>
{
    // Default Password settings.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;
});

builder.Services.Configure<KestrelServerOptions>(options => options.Limits.MaxRequestBodySize = int.MaxValue);


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // swagger
}
else
{
    app.UseHsts();
}

app.MapPost("/logout", async (SignInManager<ApplicationUser> signInManager, [FromBody] object empty) =>
{
    if (empty != null)
    {
        await signInManager.SignOutAsync();
        return Results.Ok();
    }
    return Results.Unauthorized();
})
.WithOpenApi()
.RequireAuthorization();

app.UseForwardedHeaders(new ForwardedHeadersOptions { ForwardedHeaders = ForwardedHeaders.XForwardedProto });
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(c => c.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

//SetupScript.LoadDvhcXas();
//Console.WriteLine(DanhMucs.DvhcVNDB.Indexmap["tinhthanhs"].Length);
//SetupScript.LoadKTT();
NghiepVuConfig.SpatialUrl = builder.Configuration.GetSection("spatial_url").Value;
NghiepVuConfig.ApiName = builder.Configuration.GetSection("ApiName").Value;
NghiepVuConfig.app = app;
using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider;
    var context = service.GetService<NghiepVuContext>();
    // TODO SetupScript.InsertLuuVucSong(context);

    // SetupScript.FixDoiTuongKhaiThacNuocMat(context);
    // TODO SetupScript.FixDoiTuongKhaiThacNuocNgam(context);

    // var userManager = service.GetService<UserManager<ApplicationUser>>();
    // var roleManager = service.GetService<RoleManager<IdentityRole>>();
    // SetupScript.CreateAccount(context, userManager, roleManager);
}

//string s0 = null;
//Console.WriteLine($"RUN 23/08 {s0 is "notnull"}");

//Console.WriteLine($"3.375 = {Utils.ExtractNumber("3.375")}");

//Console.WriteLine($"{Utils.ToID("Căn")} {Utils.ToID("Cân")}");

app.Run();
