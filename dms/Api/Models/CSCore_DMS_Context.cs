using Microsoft.EntityFrameworkCore;

namespace DMS.Api.Models
{
    public class CSCore_DMS_Context : DbContext
    {
        public CSCore_DMS_Context(DbContextOptions<CSCore_DMS_Context> options): base(options){ }
        protected override void OnModelCreating(ModelBuilder builder){base.OnModelCreating(builder);}
    }
}