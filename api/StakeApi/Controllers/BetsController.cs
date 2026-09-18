using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StakeApi.Data;
using StakeApi.Models;

namespace StakeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BetsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Bet>>> GetAll()
        => await db.Bets.Include(b => b.Legs).OrderByDescending(b => b.EventDate).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Bet>> GetById(int id)
    {
        var bet = await db.Bets.Include(b => b.Legs).FirstOrDefaultAsync(b => b.Id == id);
        return bet is null ? NotFound() : bet;
    }

    [HttpPost]
    public async Task<ActionResult<Bet>> Create(Bet bet)
    {
        db.Bets.Add(bet);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = bet.Id }, bet);
    }

    [HttpPut("{id:int}/resultado")]
    public async Task<IActionResult> UpdateResult(int id, [FromBody] BetStatus status)
    {
        var bet = await db.Bets.FindAsync(id);
        if (bet is null) return NotFound();

        bet.Status = status;
        bet.Profit = status switch
        {
            BetStatus.Ganha => Math.Round(bet.Stake * (bet.Odd - 1), 2),
            BetStatus.Perdida => -bet.Stake,
            BetStatus.Anulada => 0,
            _ => 0 // Pendente
        };

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var bet = await db.Bets.FindAsync(id);
        if (bet is null) return NotFound();

        db.Bets.Remove(bet);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
