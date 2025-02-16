using System.ComponentModel.DataAnnotations;

namespace DMS.Api.Models
{
    public class FileUploaded
    {
        /// <summary>
        /// bucket name
        /// </summary>
        public string bucket_name { get; set; }
        /// <summary>
        /// path of file
        /// </summary>
        public string file_path { get; set; }
        /// <summary>
        /// object id
        /// </summary>
        public uint file_oid { get; set; }
        /// <summary>
        /// tên tệp tin bao gồm cả phần mở rộng vd: .doc, .docx
        /// </summary>
        [Required]
        public string file_name { get; set; }
        /// <summary>
        /// vd: .doc, .docx...
        /// </summary>
        public string file_ext { get; set; }
        /// <summary>
        /// dung lượng file
        /// </summary>
        public long file_size { get; set; }
    }
}