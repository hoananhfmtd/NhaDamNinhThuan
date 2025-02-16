using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Api.Models;
using DMS.Api.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Minio;
using Minio.Exceptions;

namespace DMS.Api.Controllers
{
    [Route("api/dms/[controller]")]
    [ApiController]
    [Authorize]
    public class DeleteController : ControllerBase
    {
        private readonly string _str_dms_type;
        private readonly MinioClient _minioClient;

        public DeleteController(string str_dms_type, MinioClient minioClient)
        {
            _str_dms_type = str_dms_type;
            _minioClient = minioClient; 
        }

        /// <summary>
        /// http://localhost:5500/api/delete
        /// </summary>
        /// <param name="fileDownload"></param>
        /// <returns></returns>
        //POST api/Delete
        [HttpPost]
        public async Task<IActionResult> Delete([FromBody] FileDownload fileDownload)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                if (_str_dms_type == "MINIO")
                {
                    try
                    {
                        //delete file by minio api
                        MinioApi minio_api = new MinioApi(_minioClient);
                        var res = await minio_api.Delete(fileDownload.bucket_name, fileDownload.file_path);
                        return Ok(new {result=res});
                    }
                    catch (MinioException ex){return StatusCode(500, "Nội dung lỗi: " + ex.Message);}
                }
                else return Ok(new { result = false });
            }
            catch (Exception ex){ return StatusCode(500, "Lỗi, chi tiết: " + ex.Message);}
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
    }
}