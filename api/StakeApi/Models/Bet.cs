namespace StakeApi.Models;

// Uma aposta — Simples (1 jogo) ou Múltipla (várias "legs", ver BetLeg)
public class Bet
{
    public int Id { get; set; }

    public BetType Type { get; set; }
    public BetStatus Status { get; set; } = BetStatus.Pendente;

    // Preenchido apenas quando Type == Simples
    public string? Sport { get; set; }
    public string? League { get; set; }
    public string? HomeTeam { get; set; }
    public string? AwayTeam { get; set; }
    public string? Market { get; set; }

    public decimal Odd { get; set; }
    public decimal Stake { get; set; }
    public decimal Profit { get; set; }

    public DateTime EventDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Só relevante para Type == Multipla
    public List<BetLeg> Legs { get; set; } = [];
}
