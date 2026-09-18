using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace StakeApi.Controllers;

public record LoginRequest(string Password);
public record LoginResponse(string Token);

// Login simples de "utilizador único" — não há gestão de contas, é só uma
// password partilhada (a tua) que dá acesso à app. Suficiente para uso
// pessoal; não confundir com autenticação multi-utilizador.
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(IConfiguration config) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login(LoginRequest request)
    {
        var expected = config["Auth:Password"];
        if (string.IsNullOrEmpty(expected) || request.Password != expected)
            return Unauthorized(new { message = "Password incorreta." });

        var secret = config["Auth:JwtSecret"]
            ?? throw new InvalidOperationException("Auth:JwtSecret não está configurado.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Name, "carlos")],
            expires: DateTime.UtcNow.AddDays(30), // app pessoal — sessão longa, não precisas de fazer login todos os dias
            signingCredentials: creds
        );

        return new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token));
    }
}
