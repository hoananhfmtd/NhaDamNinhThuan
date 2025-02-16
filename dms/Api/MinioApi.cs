using Minio.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Minio;
using Microsoft.AspNetCore.Http;
using DMS.Api.Models;

namespace DMS.Api.Utils
{
    /// <summary>
    /// minio api for upload, download
    /// </summary>
    public class MinioApi
    {
        private readonly MinioClient _minioClient;
        public MinioApi(MinioClient minioClient)
        {
            _minioClient = minioClient;
        }

        /// <summary>
        /// download file
        /// </summary>
        /// <param name="bucketname">bucket name</param>
        /// <param name="objectname">object name</param>
        /// <returns>stream of file</returns>
        public async Task<Stream> Download(string bucket_name, string objectname)
        {
            try
            {
                Stream streamFile = new MemoryStream();
                // Check whether the object exists using statObject().
                // If the object is not found, statObject() throws an exception,
                // else it means that the object exists.
                // Execution is successful.
                bucket_name = bucket_name.ToLower().Trim();
                objectname = objectname.Trim().Replace("\\", "/");
                await _minioClient.StatObjectAsync(bucket_name, objectname);
                // Get input stream to have content of 'my-objectname' from 'my-bucketname'
                await _minioClient.GetObjectAsync(bucket_name, objectname,
                                                 (stream) =>
                                                 {
                                                     stream.CopyTo(streamFile);
                                                 });
                streamFile.Position = 0;
                return streamFile;
            }
            catch (MinioException ex){throw;}
        }

        /// <summary>
        /// upload file
        /// </summary>
        /// <param name="files">file model</param>
        /// <returns>true/fale</returns>
        public async Task<FileUploaded> Upload(IFormFile file)
        {
            try
            {
                DateTime dtNow = DateTime.Now;
                string bucket_name = dtNow.Year+"-"+dtNow.Month+"-"+dtNow.Day;
                bool found = await _minioClient.BucketExistsAsync(bucket_name);
                if (!found)
                {
                    await _minioClient.MakeBucketAsync(bucket_name);
                }
                if (file != null)
                {
                    Guid guid= Guid.NewGuid();
                    string ext = file.FileName.Substring(file.FileName.LastIndexOf(".") + 1).ToLower();
                    string name = file.FileName.Substring(0, file.FileName.LastIndexOf("."));
                    string filename_system = name+"_"+guid.ToString()+"."+ext;
                    // Upload a file to bucket.string bucketName, string objectName, Stream data, long size
                    using (var stream = file.OpenReadStream())
                    {
                        await _minioClient.PutObjectAsync(bucket_name, filename_system, stream, file.Length);
                    }
                    FileUploaded fileUploaded = new FileUploaded()
                    {
                        bucket_name = bucket_name,
                        file_oid = 0,
                        file_name = file.FileName,
                        file_path = filename_system,
                        file_ext = ext,
                        file_size = file.Length
                    };
                    return fileUploaded;
                }
                return null;
            }
            catch (MinioException ex){throw;}
        }

        /// <summary>
        /// delete file
        /// </summary>
        /// <param name="bucketname">bucket name</param>
        /// <param name="objectname">object name</param>
        /// <returns></returns>
        public async Task<bool> Delete(string bucket_name, string objectname)
        {
            try
            {
                bucket_name = bucket_name.ToLower().Trim();
                objectname = objectname.Trim().Replace("\\", "/");
                await _minioClient.RemoveObjectAsync(bucket_name, objectname);
                return true;
            }
            catch (MinioException ex){throw;}
        }

        /// <summary>
        /// get content type of file
        /// </summary>
        /// <param name="fileName">file name</param>
        /// <returns></returns>
        public static string GetContentType(string fileName)
        {
            var types = GetMimeTypes();
            var ext = fileName.Substring(fileName.LastIndexOf(".")).ToLower();
            return types[ext];
        }

        /// <summary>
        /// get mime type
        /// </summary>
        /// <returns></returns>
        private static Dictionary<string, string> GetMimeTypes()
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