namespace NghiepVu.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class NghiepVuContext(DbContextOptions<NghiepVuContext> options) : IdentityDbContext<ApplicationUser>(options)
{

    #region models
    public DbSet<EndUserBug> EndUserBugs { get; set; }
    public DbSet<UserEvent> UserEvents { get; set; }
    #endregion
    #region dbset for qtht
    public DbSet<QTHT_Apps> QTHT_Apps { get; set; }
    public DbSet<QTHT_Modules> QTHT_Modules { get; set; }
    public DbSet<QTHT_Functions> QTHT_Functions { get; set; }
    public DbSet<QTHT_Roles_Functions> QTHT_Roles_Functions { get; set; }

    public DbSet<QTHT_Logs> QTHT_Logs { get; set; }

    public DbSet<QTHT_DM_DVHCs> QTHT_DM_DVHCs { get; set; }
    public DbSet<QTHT_DichVus> QTHT_DichVus { get; set; }


    #endregion
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);// builder.HasPostgresExtension("uuid-ossp");
        // TODO manual set id auto increment start
    }
}
