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

public class CfgMinio
{
    public string Url { get; set; }
    public string AccessKey { get; set; }
    public string SecretKey { get; set; }
    public string Secure { get; set; }
}

