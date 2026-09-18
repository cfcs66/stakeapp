using System.Text.Json.Serialization;

namespace StakeApi.Models;

// Um "jogo" dentro de uma aposta Múltipla
public class BetLeg
{
    public int Id { get; set; }

    public int BetId { get; set; }

    // Navegação de volta para a Bet "pai" — só serve para o EF Core relacionar
    // as tabelas. Sem [JsonIgnore] o System.Text.Json entra num ciclo infinito
    // (Bet → Legs → Bet → Legs → ...) e a API rebenta com "possible object cycle".
    [JsonIgnore]
    public Bet? Bet { get; set; }

    public string Sport { get; set; } = string.Empty;
    public string League { get; set; } = string.Empty;
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public string Market { get; set; } = string.Empty;
    public decimal Odd { get; set; }
}
