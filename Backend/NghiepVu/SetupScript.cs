namespace NghiepVu;

using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NghiepVu.Api.Models;
using NPOI.Util;
using Microsoft.EntityFrameworkCore;

public class SetupScript
{

    public static void LoadKTT()
    {
        using (StreamReader r = new("spatial-init.json"))
        {
            var json = r.ReadToEnd();
            var obj = JObject.Parse(json);
            if (obj == null)
            {
                Console.WriteLine("obj nullllllllllllllllllll");
                return;
            }
            if (obj["dm_ktt"] == null)
            {
                Console.WriteLine("obj[\"dm_ktt\"] nullllllllllllllllllll");
                return;
            }

            var ktts = JsonConvert.DeserializeObject<List<DmKtt>>(obj["dm_ktt"].ToString());
            if (ktts == null || ktts.Count == 0)
            {
                Console.WriteLine("ktts nullllllllllllllllllll");
                return;
            }

            DanhMucs.KTTTinhThanhm = [];
            foreach (var ktt in ktts)
            {
                if (ktt == null || ktt.Matinh == null || ktt.Matinh.Length == 0)
                {
                    continue;
                }
                DanhMucs.KTTTinhThanhm[ktt.Matinh] = ktt;
            }

            Console.WriteLine($"DanhMucs.KTT_TinhThanhm.Count={DanhMucs.KTTTinhThanhm.Count}");
        }
    }

    // TODO norm ten dvhc
    public static void LoadDvhcXas()
    {
        using (StreamReader r = new("dvhc-xas.json"))
        {
            var json = r.ReadToEnd();
            var dvhcVNs = JsonConvert.DeserializeObject<List<DvhcXa>>(json);

            DanhMucs.DvhcVNDB = new DvhcVNDB
            {
                Dvhcmap = [],
                Indexmap = []
            };

            var tinhthanhs = new List<DvhcVN>();
            var tinhthanhQuanHuyenm = new Dictionary<string, List<string>>();
            var quanhuyenPhuongXam = new Dictionary<string, List<string>>();

            foreach (var dvhc in dvhcVNs)
            {
                if (dvhc.PhuongXaId == null || dvhc.PhuongXaId.Length == 0)
                {
                    continue;
                }
                if (dvhc.PhuongXa == null || dvhc.PhuongXa.Length == 0)
                {
                    continue;
                }
                if (dvhc.QuanHuyenId == null || dvhc.QuanHuyenId.Length == 0)
                {
                    continue;
                }
                if (dvhc.QuanHuyenId == null || dvhc.QuanHuyenId.Length == 0)
                {
                    continue;
                }
                if (dvhc.TinhThanhId == null || dvhc.TinhThanhId.Length == 0)
                {
                    continue;
                }
                if (dvhc.TinhThanhId == null || dvhc.TinhThanhId.Length == 0)
                {
                    continue;
                }

                var xa = new DvhcVN()
                {
                    Ma = dvhc.PhuongXaId,
                    Ten = dvhc.PhuongXa,
                    TenDVHC = dvhc.PhuongXa,
                    TenRutGon = RemovePrefixs(dvhc.PhuongXa, ["Phường", "Xã", "Thị Trấn"]),
                    Cap = 3,
                    MaXa = dvhc.PhuongXaId,
                    MaTinh = dvhc.TinhThanhId,
                    MaHuyen = dvhc.QuanHuyenId,
                };
                var huyen = new DvhcVN()
                {
                    Ma = dvhc.QuanHuyenId,
                    Ten = dvhc.QuanHuyen,
                    TenRutGon = RemovePrefixs(dvhc.QuanHuyen, ["Quận", "Huyện", "Thị Xã", "Thành phố"]),
                    TenDVHC = dvhc.QuanHuyen,
                    Cap = 2,
                    MaTinh = dvhc.TinhThanhId,
                    MaHuyen = dvhc.QuanHuyenId,
                };
                var tinh = new DvhcVN()
                {
                    Ma = dvhc.TinhThanhId,
                    Ten = dvhc.TinhThanh,
                    TenRutGon = RemovePrefixs(dvhc.TinhThanh, ["Thành phố", "Tỉnh"]),
                    TenDVHC = dvhc.TinhThanh,
                    Cap = 1,
                    MaTinh = dvhc.TinhThanhId,
                };

                DanhMucs.DvhcVNDB.Dvhcmap[xa.Ma] = xa;
                DanhMucs.DvhcVNDB.Dvhcmap[huyen.Ma] = huyen;
                DanhMucs.DvhcVNDB.Dvhcmap[tinh.Ma] = tinh;

                if (!DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey("tinhthanhs#" + tinh.TenDVHC))
                {
                    tinhthanhs.Add(tinh);
                    DanhMucs.DvhcVNDB.Dvhcmap["tinhthanhs#" + tinh.TenDVHC] = tinh;
                    DanhMucs.DvhcVNDB.Dvhcmap["tinhthanhs#" + tinh.TenRutGon] = tinh;
                }

                if (!tinhthanhQuanHuyenm.TryGetValue(huyen.MaTinh, out var value))
                {
                    value = ([]);
                    tinhthanhQuanHuyenm[huyen.MaTinh] = value;
                }

                if (!DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(huyen.MaTinh + "#" + huyen.TenDVHC))
                {
                    DanhMucs.DvhcVNDB.Dvhcmap[huyen.MaTinh + "#" + huyen.TenDVHC] = huyen;
                    DanhMucs.DvhcVNDB.Dvhcmap[huyen.MaTinh + "#" + huyen.TenRutGon] = huyen;
                    value.Add(huyen.Ma);

                }

                if (!quanhuyenPhuongXam.TryGetValue(xa.MaHuyen, out value))
                {
                    value = ([]);
                    quanhuyenPhuongXam[xa.MaHuyen] = value;
                }

                if (!DanhMucs.DvhcVNDB.Dvhcmap.ContainsKey(xa.MaHuyen + "#" + xa.TenDVHC))
                {
                    DanhMucs.DvhcVNDB.Dvhcmap[xa.MaHuyen + "#" + xa.TenDVHC] = xa;
                    DanhMucs.DvhcVNDB.Dvhcmap[xa.MaHuyen + "#" + xa.TenRutGon] = xa;
                    value.Add(xa.Ma);
                }
            }

            var mas = new List<string>();
            foreach (var tinhthanh in tinhthanhs)
            {
                mas.Add(tinhthanh.Ma);
            }
            DanhMucs.DvhcVNDB.Indexmap["tinhthanhs"] = [.. mas];

            foreach (var kv in tinhthanhQuanHuyenm)
            {
                DanhMucs.DvhcVNDB.Indexmap[kv.Key] = [.. kv.Value];
            }
            foreach (var kv in quanhuyenPhuongXam)
            {
                DanhMucs.DvhcVNDB.Indexmap[kv.Key] = [.. kv.Value];
            }

            DanhMucs.DvhcVNDB.AllTinhThanhs = [];
            var ten0Tinhm = new Dictionary<string, DvhcVN>();
            foreach (var ma in DanhMucs.DvhcVNDB.Indexmap["tinhthanhs"])
            {
                if (ten0Tinhm.TryGetValue(DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon, out var value))
                {
                    ten0Tinhm[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon].TenRutGon = value.TenDVHC;
                    DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon = DanhMucs.DvhcVNDB.Dvhcmap[ma].TenDVHC;
                }
                else
                {
                    ten0Tinhm[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon] = DanhMucs.DvhcVNDB.Dvhcmap[ma];
                }
                DanhMucs.DvhcVNDB.AllTinhThanhs.Add(DanhMucs.DvhcVNDB.Dvhcmap[ma]);
            }

            DanhMucs.DvhcVNDB.AllQuanHuyens = [];
            foreach (var maTinh in DanhMucs.DvhcVNDB.Indexmap["tinhthanhs"])
            {
                if (!DanhMucs.DvhcVNDB.Indexmap.ContainsKey(maTinh))
                {
                    continue;
                }

                var ten0Huyenm = new Dictionary<string, DvhcVN>();
                foreach (var ma in DanhMucs.DvhcVNDB.Indexmap[maTinh])
                {
                    if (ten0Huyenm.TryGetValue(DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon, out var value))
                    {
                        ten0Huyenm[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon].TenRutGon = value.TenDVHC;
                        DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon = DanhMucs.DvhcVNDB.Dvhcmap[ma].TenDVHC;
                    }
                    else
                    {
                        ten0Huyenm[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon] = DanhMucs.DvhcVNDB.Dvhcmap[ma];
                    }
                    DanhMucs.DvhcVNDB.AllQuanHuyens.Add(DanhMucs.DvhcVNDB.Dvhcmap[ma]);
                }
            }

            DanhMucs.DvhcVNDB.AllPhuongXas = [];
            foreach (var quanHuyen in DanhMucs.DvhcVNDB.AllQuanHuyens)
            {
                if (!DanhMucs.DvhcVNDB.Indexmap.ContainsKey(quanHuyen.Ma))
                {
                    continue;
                }

                var ten0Xam = new Dictionary<string, DvhcVN>();
                foreach (var ma in DanhMucs.DvhcVNDB.Indexmap[quanHuyen.Ma])
                {
                    if (ten0Xam.TryGetValue(DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon, out var value))
                    {
                        ten0Xam[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon].TenRutGon = value.TenDVHC;
                        DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon = DanhMucs.DvhcVNDB.Dvhcmap[ma].TenDVHC;
                    }
                    else
                    {
                        ten0Xam[DanhMucs.DvhcVNDB.Dvhcmap[ma].TenRutGon] = DanhMucs.DvhcVNDB.Dvhcmap[ma];
                    }
                    DanhMucs.DvhcVNDB.AllPhuongXas.Add(DanhMucs.DvhcVNDB.Dvhcmap[ma]);
                }
            }

            DanhMucs.DvhcVNDB.TinhThanhsIncludeQhpx = [];

            foreach (var maTinhThanh in DanhMucs.DvhcVNDB.Indexmap["tinhthanhs"])
            {
                var tinhThanh = DanhMucs.DvhcVNDB.Dvhcmap[maTinhThanh].Copy();
                DanhMucs.DvhcVNDB.TinhThanhsIncludeQhpx.Add(tinhThanh);
                if (!DanhMucs.DvhcVNDB.Indexmap.ContainsKey(tinhThanh.Ma))
                {
                    continue;
                }

                tinhThanh.QuanHuyens = [];
                foreach (var maQuanHuyen in DanhMucs.DvhcVNDB.Indexmap[tinhThanh.Ma])
                {
                    var quanHuyen = DanhMucs.DvhcVNDB.Dvhcmap[maQuanHuyen].Copy();
                    tinhThanh.QuanHuyens.Add(quanHuyen);
                    if (!DanhMucs.DvhcVNDB.Indexmap.ContainsKey(quanHuyen.Ma))
                    {
                        continue;
                    }

                    quanHuyen.PhuongXas = [];
                    foreach (var maPhuongXa in DanhMucs.DvhcVNDB.Indexmap[quanHuyen.Ma])
                    {
                        quanHuyen.PhuongXas.Add(DanhMucs.DvhcVNDB.Dvhcmap[maPhuongXa].Copy());
                    }
                }
            }

            DanhMucs.DvhcVNDB.TinhThanhsIncludeQhpx = [.. DanhMucs.DvhcVNDB.TinhThanhsIncludeQhpx.OrderBy(tinhThanh => tinhThanh.TenDVHC)];
            foreach (var tinhThanh in DanhMucs.DvhcVNDB.TinhThanhsIncludeQhpx)
            {
                if (tinhThanh == null || tinhThanh.QuanHuyens == null || tinhThanh.QuanHuyens.Count == 0)
                { continue; }
                tinhThanh.QuanHuyens = [.. tinhThanh.QuanHuyens.OrderBy(quanHuyen => quanHuyen.TenDVHC)];

                foreach (var quanHuyen in tinhThanh.QuanHuyens)
                {
                    if (quanHuyen == null || quanHuyen.PhuongXas == null || quanHuyen.PhuongXas.Count == 0)
                    { continue; }
                    quanHuyen.PhuongXas = [.. quanHuyen.PhuongXas.OrderBy(phuongXa => phuongXa.TenDVHC)];
                }
            }

            DanhMucs.DvhcVNDB.AllTinhThanhs = [.. DanhMucs.DvhcVNDB.AllTinhThanhs.OrderBy(tinhThanh => tinhThanh.TenDVHC)];
            DanhMucs.DvhcVNDB.AllQuanHuyens = [.. DanhMucs.DvhcVNDB.AllQuanHuyens.OrderBy(quanHuyen => quanHuyen.TenDVHC)];
            DanhMucs.DvhcVNDB.AllPhuongXas = [.. DanhMucs.DvhcVNDB.AllPhuongXas.OrderBy(phuongXa => phuongXa.TenDVHC)];
        }
    }

    public static string RemovePrefixs(string text, string[] prefixs)
    {
        text = text.Trim();

        if (prefixs == null || prefixs.Length == 0)
        {
            return text;
        }
        foreach (var prefix in prefixs)
        {
            if (prefix is not null and not "")
            {
                text = Regex.Replace(text, prefix, "", RegexOptions.IgnoreCase);
                text = text.Trim();
            }
        }

        return text;
    }

}

internal sealed class DvhcXa
{
    public string TinhThanh { get; set; }
    public string TinhThanhId { get; set; }
    public string QuanHuyen { get; set; }
    public string QuanHuyenId { get; set; }
    public string PhuongXa { get; set; }
    public string PhuongXaId { get; set; }
}

public class CfgMinio
{
    public string Url { get; set; }
    public string AccessKey { get; set; }
    public string SecretKey { get; set; }
    public string Secure { get; set; }
}

// dotnet format ./SolutionName.sln --no-restore
