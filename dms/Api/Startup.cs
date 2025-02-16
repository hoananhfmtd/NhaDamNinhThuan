using System;
using DMS.Api.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Minio;

namespace Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            CurrentEnvironment = env;
        }
        private IHostingEnvironment CurrentEnvironment { get; set; }

        public IConfiguration Configuration { get; }
        //const configure key
        public const string Cfg_Authority_Development = "Authority_Development";
        public const string Cfg_Authority_Production = "Authority_Production";
        public const string Cfg_RequireHttpsMetadata_Development = "RequireHttpsMetadata_Development";
        public const string Cfg_RequireHttpsMetadata_Production = "RequireHttpsMetadata_Production";
        public const string Cfg_ApiName = "ApiName";
        public const string Cfg_Cors_WithOrigins_Development = "Cors_WithOrigins_Development";
        public const string Cfg_Cors_WithOrigins_Production = "Cors_WithOrigins_Production";
        public const string Cfg_DefaultConnection = "DefaultConnection";
        public const string Cfg_Minio = "MinIO";
        public const string Cfg_DMS_TYPE = "DMS_TYPE";
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers().AddNewtonsoftJson();
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            });
            string str_dms_type = Configuration.GetSection(Cfg_DMS_TYPE).Get<string>();
            if (str_dms_type == "POSTGRESQL")
            {
                //db setting
                services.AddDbContext<CSCore_DMS_Context>(options =>
                    options.UseNpgsql(Configuration.GetConnectionString(Cfg_DefaultConnection)));
                //
                // conn string
                var connStr = Configuration.GetConnectionString(Cfg_DefaultConnection);
                services.AddSingleton<string>(connStr);
            }   
            if(str_dms_type == "MINIO")
            {
                //minio injection
                var minio_cfg = Configuration.GetSection(Cfg_Minio).Get<cfg_minio>();//get config minio
                MinioClient minio = new MinioClient()
                                    .WithEndpoint(minio_cfg.Url)
                                    .WithCredentials(minio_cfg.AccessKey, minio_cfg.SecretKey)
                                    .WithSSL(Convert.ToBoolean(minio_cfg.Secure))
                                    .Build();//init minio by config info
                services.AddSingleton(minio);//add to service
            }
            services.AddSingleton<string>(str_dms_type);
            // accepts any access token issued by identity server
            services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = CurrentEnvironment.IsDevelopment() ?
                    Configuration.GetSection(Cfg_Authority_Development).Value :
                    Configuration.GetSection(Cfg_Authority_Production).Value;

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false
                    };
                    options.RequireHttpsMetadata = CurrentEnvironment.IsDevelopment() ?
                    Convert.ToBoolean(Configuration.GetSection(Cfg_RequireHttpsMetadata_Development).Value) :
                    Convert.ToBoolean(Configuration.GetSection(Cfg_RequireHttpsMetadata_Production).Value);
                });

            // adds an authorization policy to make sure the token is for scope 'api1'
            services.AddAuthorization(options =>
            {
                options.AddPolicy("ApiScope", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("scope", Configuration.GetSection(Cfg_ApiName).Value);
                });
            });
            //add gen api document
            if (CurrentEnvironment.IsDevelopment())
            {
                services.AddSwaggerGen(c => {
                    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "CSDL Files API", Version = "V1" });
                });
            }
            services.Configure<FormOptions>(x =>
            {
                x.MultipartBodyLengthLimit = 2097152000;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedProto
            });
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quan tri he thong API V1");
                });
            }
            else
            {
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers()
                    .RequireAuthorization("ApiScope");
            });
        }
    }
}