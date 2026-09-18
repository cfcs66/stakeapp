using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StakeApi.Data;
using StakeApi.Models;

namespace StakeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BankController(AppDbContext db) : ControllerBase
{
    [HttpGet("movimentos")]
    public async Task<ActionResult<List<BankMovement>>> GetMovements()
        => await db.BankMovements.OrderByDescending(m => m.Date).ToListAsync();

    [HttpPost("movimentos")]
    public async Task<ActionResult<BankMovement>> AddMovement(BankMovement movement)
    {
        db.BankMovements.Add(movement);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMovements), movement);
    }

    [HttpGet("atual")]
    public async Task<ActionResult<decimal>> GetCurrentBank()
    {
        var deposits = await db.BankMovements
            .Where(m => m.Type == MovementType.Deposito).SumAsync(m => m.Amount);
        var withdrawals = await db.BankMovements
            .Where(m => m.Type == MovementType.Levantamento).SumAsync(m => m.Amount);
        var profit = await db.Bets
            .Where(b => b.Status == BetStatus.Ganha || b.Status == BetStatus.Perdida)
            .SumAsync(b => b.Profit);

        return deposits - withdrawals + profit;
    }
}
