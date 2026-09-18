using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StakeApi.Data;
using StakeApi.Models;

namespace StakeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController(AppDbContext db) : ControllerBase
{
    [HttpGet("geral")]
    public async Task<ActionResult> GetGeneral()
    {
        var now = DateTime.UtcNow;
        var monthBets = await db.Bets
            .Where(b => b.EventDate.Year == now.Year && b.EventDate.Month == now.Month)
            .ToListAsync();

        return Ok(new
        {
            apostasNoMes = monthBets.Count,
            lucroMensal = monthBets.Sum(b => b.Profit)
        });
    }

    // Agregado por dia, para pintar o calendário (ano/mês pedidos pelo frontend
    // consoante a navegação Anterior/Seguinte).
    [HttpGet("calendario")]
    public async Task<ActionResult> GetCalendar([FromQuery] int year, [FromQuery] int month)
    {
        var bets = await db.Bets
            .Where(b => b.EventDate.Year == year && b.EventDate.Month == month
                     && (b.Status == BetStatus.Ganha || b.Status == BetStatus.Perdida))
            .ToListAsync();

        var porDia = bets
            .GroupBy(b => b.EventDate.Day)
            .Select(g => new { dia = g.Key, valor = Math.Round(g.Sum(b => b.Profit), 2) })
            .ToList();

        return Ok(porDia);
    }

    // Apostas de um dia específico, para o painel "Detalhe do Dia".
    [HttpGet("dia")]
    public async Task<ActionResult> GetDay([FromQuery] int year, [FromQuery] int month, [FromQuery] int day)
    {
        var bets = await db.Bets
            .Include(b => b.Legs)
            .Where(b => b.EventDate.Year == year && b.EventDate.Month == month && b.EventDate.Day == day)
            .ToListAsync();

        return Ok(bets);
    }

    // Nota: uma aposta "Simples" envolve 2 equipas (casa/fora) sem indicar
    // explicitamente qual delas o utilizador está a apoiar — por simplicidade,
    // cada aposta conta para as estatísticas de AMBAS as equipas do jogo.
    [HttpGet("equipas")]
    public async Task<ActionResult> GetByTeam()
    {
        var bets = await db.Bets
            .Where(b => b.Type == BetType.Simples && b.HomeTeam != null && b.AwayTeam != null)
            .ToListAsync();

        // Agrupado só por Equipa+Desporto — uma equipa como o FC Porto conta
        // para as mesmas estatísticas quer tenha jogado na Liga Portugal
        // quer na Champions League. Os campeonatos em que apareceu ficam
        // listados como contexto, não como critério de separação.
        var porEquipa = bets
            .SelectMany(b => new[] { (Team: b.HomeTeam!, Bet: b), (Team: b.AwayTeam!, Bet: b) })
            .GroupBy(x => new { x.Team, x.Bet.Sport })
            .Select(g => new
            {
                equipa = g.Key.Team,
                desporto = g.Key.Sport,
                campeonatos = string.Join(", ", g.Select(x => x.Bet.League).Where(l => !string.IsNullOrEmpty(l)).Distinct()),
                apostas = g.Count(),
                winRate = WinRate(g.Select(x => x.Bet)),
                lucro = Math.Round(g.Sum(x => x.Bet.Profit), 2)
            })
            .OrderByDescending(t => t.apostas)
            .ToList();

        return Ok(porEquipa);
    }

    [HttpGet("tipos")]
    public async Task<ActionResult> GetByType()
    {
        var bets = await db.Bets.ToListAsync();

        var porTipo = bets
            .GroupBy(b => b.Type)
            .Select(g => new
            {
                tipo = g.Key.ToString(),
                apostas = g.Count(),
                winRate = WinRate(g),
                lucro = Math.Round(g.Sum(b => b.Profit), 2)
            })
            .ToList();

        var porMercado = bets
            .Where(b => !string.IsNullOrEmpty(b.Market))
            .GroupBy(b => b.Market)
            .Select(g => new
            {
                mercado = g.Key,
                apostas = g.Count(),
                winRate = WinRate(g),
                lucro = Math.Round(g.Sum(b => b.Profit), 2)
            })
            .ToList();

        return Ok(new { porTipo, porMercado });
    }

    private static double WinRate(IEnumerable<Bet> bets)
    {
        var resolved = bets.Where(b => b.Status is BetStatus.Ganha or BetStatus.Perdida).ToList();
        if (resolved.Count == 0) return 0;
        return Math.Round(resolved.Count(b => b.Status == BetStatus.Ganha) * 100.0 / resolved.Count, 1);
    }
}
