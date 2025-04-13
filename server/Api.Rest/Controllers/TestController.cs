using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public ActionResult<string> Get()
        {
            return "API is working!";
        }
    }
}