using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NghiepVu.Migrations
{
    /// <inheritdoc />
    public partial class quantri_hethong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QTHT_Apps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Url = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    AllowedCorsOrigins = table.Column<string>(type: "text", nullable: true),
                    ApiResources = table.Column<string>(type: "text", nullable: true),
                    PostLogoutRedirectUris = table.Column<string>(type: "text", nullable: true),
                    RedirectUris = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_Apps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_DichVus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ma = table.Column<string>(type: "text", nullable: true),
                    Ten = table.Column<string>(type: "text", nullable: true),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    NgayTao = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_DichVus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_DM_DVHCs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TenDVHC = table.Column<string>(type: "text", nullable: true),
                    MaTinh = table.Column<string>(type: "text", nullable: true),
                    MaHuyen = table.Column<string>(type: "text", nullable: true),
                    MaXa = table.Column<string>(type: "text", nullable: true),
                    HoatDong = table.Column<int>(type: "integer", nullable: false),
                    Cap = table.Column<int>(type: "integer", nullable: false),
                    Ten = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_DM_DVHCs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_Functions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ModuleId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    MaChucNang = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_Functions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_Logs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Controller_Action = table.Column<string>(type: "text", nullable: true),
                    UserCreate = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    NgayTao = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_Logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_Modules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    ModuleCode = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_Modules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QTHT_Roles_Functions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FunctionId = table.Column<int>(type: "integer", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QTHT_Roles_Functions", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QTHT_Apps");

            migrationBuilder.DropTable(
                name: "QTHT_DichVus");

            migrationBuilder.DropTable(
                name: "QTHT_DM_DVHCs");

            migrationBuilder.DropTable(
                name: "QTHT_Functions");

            migrationBuilder.DropTable(
                name: "QTHT_Logs");

            migrationBuilder.DropTable(
                name: "QTHT_Modules");

            migrationBuilder.DropTable(
                name: "QTHT_Roles_Functions");
        }
    }
}
