namespace DMS.Api.Models
{
    /// <summary>
    /// minio config
    /// </summary>
    public class cfg_minio
    {
        public string Url { get; set; }
        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
        public string Secure { get; set; }
    }
}