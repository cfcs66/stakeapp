using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StakeApi.Data;
using StakeApi.Models;

namespace StakeApi.Controllers;

// Catálogo de Modalidade → (Campeonato | Equipa), tudo inserido manualmente
// por ti (ver página "Catálogo" no frontend). Campeonatos e Equipas são
// ambos filhos diretos da Modalidade — uma equipa NÃO pertence a um único
// campeonato (o FC Porto joga na Liga Portugal e na Champions League ao
// mesmo tempo), por isso o campeonato é escolhido à parte em cada aposta.
[ApiController]
[Route("api")]
public class SportsController(AppDbContext db) : ControllerBase
{
    public record CreateRequest(string Name);

    // --- Modalidades ---
    [HttpGet("sports")]
    public async Task<ActionResult<List<Sport>>> GetSports()
        => await db.Sports.OrderBy(s => s.Name).ToListAsync();

    [HttpPost("sports")]
    public async Task<ActionResult<Sport>> CreateSport(CreateRequest req)
    {
        var name = req.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Nome obrigatório.");
        if (await db.Sports.AnyAsync(s => s.Name == name)) return Conflict("Já existe uma modalidade com este nome.");

        var sport = new Sport { Name = name };
        db.Sports.Add(sport);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSports), sport);
    }

    [HttpDelete("sports/{id:int}")]
    public async Task<IActionResult> DeleteSport(int id)
    {
        var sport = await db.Sports.FindAsync(id);
        if (sport is null) return NotFound();
        db.Sports.Remove(sport); // cascata apaga campeonatos e equipas associadas
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --- Campeonatos (filhos da Modalidade) ---
    [HttpGet("sports/{sportId:int}/campeonatos")]
    public async Task<ActionResult<List<League>>> GetLeagues(int sportId)
        => await db.Leagues.Where(l => l.SportId == sportId).OrderBy(l => l.Name).ToListAsync();

    [HttpPost("sports/{sportId:int}/campeonatos")]
    public async Task<ActionResult<League>> CreateLeague(int sportId, CreateRequest req)
    {
        var name = req.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Nome obrigatório.");
        if (!await db.Sports.AnyAsync(s => s.Id == sportId)) return NotFound("Modalidade não encontrada.");
        if (await db.Leagues.AnyAsync(l => l.SportId == sportId && l.Name == name)) return Conflict("Já existe um campeonato com este nome nesta modalidade.");

        var league = new League { Name = name, SportId = sportId };
        db.Leagues.Add(league);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetLeagues), new { sportId }, league);
    }

    [HttpDelete("campeonatos/{id:int}")]
    public async Task<IActionResult> DeleteLeague(int id)
    {
        var league = await db.Leagues.FindAsync(id);
        if (league is null) return NotFound();
        db.Leagues.Remove(league);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --- Equipas (filhas da Modalidade, NÃO do Campeonato) ---
    [HttpGet("sports/{sportId:int}/equipas")]
    public async Task<ActionResult<List<Team>>> GetTeams(int sportId)
        => await db.Teams.Where(t => t.SportId == sportId).OrderBy(t => t.Name).ToListAsync();

    [HttpPost("sports/{sportId:int}/equipas")]
    public async Task<ActionResult<Team>> CreateTeam(int sportId, CreateRequest req)
    {
        var name = req.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Nome obrigatório.");
        if (!await db.Sports.AnyAsync(s => s.Id == sportId)) return NotFound("Modalidade não encontrada.");
        if (await db.Teams.AnyAsync(t => t.SportId == sportId && t.Name == name)) return Conflict("Já existe uma equipa com este nome nesta modalidade.");

        var team = new Team { Name = name, SportId = sportId };
        db.Teams.Add(team);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTeams), new { sportId }, team);
    }

    [HttpDelete("equipas/{id:int}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        var team = await db.Teams.FindAsync(id);
        if (team is null) return NotFound();
        db.Teams.Remove(team);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --- Mercados (filhos da Modalidade, tal como as Equipas) ---
    [HttpGet("sports/{sportId:int}/mercados")]
    public async Task<ActionResult<List<Market>>> GetMarkets(int sportId)
        => await db.Markets.Where(m => m.SportId == sportId).OrderBy(m => m.Name).ToListAsync();

    [HttpPost("sports/{sportId:int}/mercados")]
    public async Task<ActionResult<Market>> CreateMarket(int sportId, CreateRequest req)
    {
        var name = req.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Nome obrigatório.");
        if (!await db.Sports.AnyAsync(s => s.Id == sportId)) return NotFound("Modalidade não encontrada.");
        if (await db.Markets.AnyAsync(m => m.SportId == sportId && m.Name == name)) return Conflict("Já existe um mercado com este nome nesta modalidade.");

        var market = new Market { Name = name, SportId = sportId };
        db.Markets.Add(market);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMarkets), new { sportId }, market);
    }

    [HttpDelete("mercados/{id:int}")]
    public async Task<IActionResult> DeleteMarket(int id)
    {
        var market = await db.Markets.FindAsync(id);
        if (market is null) return NotFound();
        db.Markets.Remove(market);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
