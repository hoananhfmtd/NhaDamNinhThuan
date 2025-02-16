using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DMS.Api.Models;
using DMS.Api.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Minio;
using Minio.Exceptions;
using Npgsql;

namespace DMS.Api.Controllers
{
    [Route("api/dms/[controller]")]
    [ApiController]
    //[Authorize]
    [AllowAnonymous]
    public class DownloadController : ControllerBase
    {
        private readonly string _connStr;
        private readonly string _str_dms_type;
        private readonly MinioClient _minioClient;

        public DownloadController(string connStr, string str_dms_type, MinioClient minioClient)
        {
            _connStr = connStr;
            _str_dms_type = str_dms_type;
            _minioClient = minioClient; 
        }

        /// <summary>
        /// http://localhost:5500/api/download
        /// </summary>
        /// <param name="fileDownload"></param>
        /// <returns></returns>
        //POST api/download
        [HttpPost]
        public async Task<IActionResult> Download([FromBody] FileDownload fileDownload)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                if (_str_dms_type == "MINIO")
                {
                    try
                    {
                        //download file by minio api
                        MinioApi minio_api = new MinioApi(_minioClient);
                        Stream streamFile = await minio_api.Download(fileDownload.bucket_name, fileDownload.file_path);
                        return File(streamFile, MinioApi.GetContentType(fileDownload.file_name), fileDownload.file_name);
                    }
                    catch (MinioException ex){return StatusCode(500, "Nội dung lỗi: " + ex.Message);}
                }
                else
                {
                    using (var conn = new NpgsqlConnection(_connStr))
                    {
                        await conn.OpenAsync();
                        var manager = new NpgsqlLargeObjectManager(conn);
                        using (var transaction = conn.BeginTransaction())
                        {
                            using (var stream = manager.OpenReadWrite(fileDownload.file_oid))
                            {
                                try
                                {
                                    Stream streamFile = new MemoryStream();
                                    await stream.CopyToAsync(streamFile);
                                    if (streamFile == null)
                                        return NotFound(new { Message = "Tệp tin này không còn tồn tại trên hệ thống, vui lòng kiểm tra lại." });
                                    streamFile.Position = 0;
                                    return File(streamFile, GetContentType(fileDownload.file_name), fileDownload.file_name);
                                }
                                catch (Exception ex){return StatusCode(500, "Lỗi, chi tiết: " + ex.Message);}
                            }
                        }
                    }
                }
                
            }
            catch (Exception ex){return StatusCode(500, "Lỗi, chi tiết: " + ex.Message);}
        }

        private string GetContentType(string fileName)
        {
            var types = GetMimeTypes();
            var ext = fileName.Substring(fileName.LastIndexOf(".")).ToLower();
            return types[ext];
        }

        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                {".txt", "text/plain"},
                {".pdf", "application/pdf"},
                {".doc", "application/vnd.ms-word"},
                {".docx", "application/vnd.ms-word"},
                {".xls", "application/vnd.ms-excel"},
                {".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},  
                {".png", "image/png"},
                {".jpg", "image/jpeg"},
                {".jpeg", "image/jpeg"},
                {".gif", "image/gif"},
                {".csv", "text/csv"},
                {".rar", "application/x-rar-compressed" },
                {".zip", "application/zip"},
                {".ppt", "application/vnd.ms-powerpoint"},
                 {".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"}
            };
        }

        [HttpGet]
        [Route("url-image")]
        public async Task<IActionResult> UrlImage(string bucketName, string objectName, int expirationTime)
        {
            var reqParams = new Dictionary<string, string>(StringComparer.Ordinal)
        { { "response-content-type", "image/jpeg" } };

            PresignedGetObjectArgs args = new PresignedGetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithHeaders(reqParams)
                .WithExpiry(expirationTime);

            string url = await _minioClient.PresignedGetObjectAsync(args);
            return Ok(url);
        }
    }
}