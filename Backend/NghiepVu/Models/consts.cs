namespace NghiepVu.Api.Models;

public class Consts
{
    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string User = "User";
        public const string GiamSat = "GiamSat";
    }

    public static class Scope
    {
        public const string Tw = "tw"; // root
        public const string Dvtt = "dvtt"; // các đơn vị trực thuộc Bộ
        public const string Tinh = "tinh";
    }
}
