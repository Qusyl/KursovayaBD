using KursovayaBD.Session;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration configuration;

        public AuthController(IConfiguration config)
        {
            configuration = config;
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            var user = ValidateUser(request.Username, request.Password);

            if (user == null)
            {
                return Unauthorized("Неверный логин или пароль!");
            }
            string username = user.Value.username;
            string role = user.Value.role;
            var token = GenerateJwtToken(username, role);
            return Ok(new
            {
                token,
                role = role
            });
        }
        private (string username, string role)? ValidateUser(string username, string password) {

            if (username == "admin_user" && password == "ltybc1977")
                return (username, "Admin");

            if (username == "regular_user" && password == "user")
                return (username, "User");

            if (username == "guest_user" && password == "1234")
                return (username, "Guest");

            return null;
        }
        private string GenerateJwtToken(string username, string role)
        {
            var Jwt = configuration.GetSection("Jwt");

            var Key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Jwt["Key"]!));

            var claims = new[] {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                    issuer: Jwt["Issuer"],
                    audience: Jwt["Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(int.Parse(Jwt["ExpireMinutes"]!)),
                    signingCredentials: new SigningCredentials(Key, SecurityAlgorithms.HmacSha256)
                );
                

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
