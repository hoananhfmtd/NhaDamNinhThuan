namespace NghiepVu.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class NghiepVuContext(DbContextOptions<NghiepVuContext> options) : IdentityDbContext<ApplicationUser>(options)
{

    #region models
    public DbSet<EndUserBug> EndUserBugs { get; set; }
    public DbSet<UserEvent> UserEvents { get; set; }
    #endregion

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);// builder.HasPostgresExtension("uuid-ossp");
        // TODO manual set id auto increment start
    }
}
