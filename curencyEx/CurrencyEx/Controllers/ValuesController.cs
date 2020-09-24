using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CurrencyEx
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        [HttpGet]
        public async Task<string> Get()
        {
            var url = "https://www.boi.org.il/currency.xml";
            var rssContent = await (await new HttpClient().GetAsync(url)).Content.ReadAsStringAsync();
            return rssContent;
        }
    }
}
