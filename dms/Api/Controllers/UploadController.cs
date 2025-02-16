using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using DMS.Api.Models;
using DMS.Api.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Minio;
using Npgsql;

namespace DMS.Api.Controllers
{
    [Route("api/dms/[controller]")]
    [ApiController]
    //[Authorize]
    [AllowAnonymous]
    public class UploadController : ControllerBase
    {
        private readonly string _connStr;
        private readonly string _str_dms_type;
        private readonly MinioClient _minioClient;
        public UploadController(string connStr, string str_dms_type, MinioClient minioClient)
        {
            _connStr = connStr;
            _str_dms_type = str_dms_type;
            _minioClient = minioClient;
        }

        /// <summary>
        /// http://localhost:5500/api/upload
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 209715200)]
        [RequestSizeLimit(209715200)]
        public async Task<IActionResult> UploadFile()
        {
            if (Request.Form == null || Request.Form.Files == null || Request.Form.Files.Count == 0) return BadRequest(new { Message = "Không có tệp tin nào được tải lên." });
            try
            {
                List<FileUploaded> lstFileUpload = new List<FileUploaded>();
                if (_str_dms_type == "MINIO")
                {
                    MinioApi minio_api = new MinioApi(_minioClient);
                    foreach (var file in Request.Form.Files)
                    {
                        FileUploaded fileUploaded = await minio_api.Upload(file);
                        var ext = file.FileName.Substring(file.FileName.LastIndexOf(".")).ToLower();
                        if(fileUploaded != null) lstFileUpload.Add(fileUploaded);
                    }
                }
                else
                {
                    using (var conn = new NpgsqlConnection(_connStr))
                    {
                        await conn.OpenAsync();
                        var manager = new NpgsqlLargeObjectManager(conn);
                        using (var transaction = conn.BeginTransaction())
                        {
                            foreach (var file in Request.Form.Files)
                            {
                                if (file.Length > 0)
                                {
                                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                                    var ext = fileName.Substring(fileName.LastIndexOf(".")).ToLower();
                                    var oid = manager.Create();
                                    using (var stream = manager.OpenReadWrite(oid)){await file.CopyToAsync(stream);}
                                    lstFileUpload.Add(new FileUploaded()
                                    {
                                        file_oid = oid,
                                        file_name = fileName,
                                        file_ext = ext,
                                        bucket_name="",
                                        file_path=fileName,
                                        file_size=file.Length
                                    });
                                }
                            }
                            transaction.Commit();
                        }
                    }
                }
                return Ok(lstFileUpload);
            }
            catch (System.Exception ex){return StatusCode(500, "Lỗi, chi tiết: " + ex.Message);}
        }
    }
}