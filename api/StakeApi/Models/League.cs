namespace StakeApi.Models;

// Campeonato — pertence a uma Modalidade, inserido manualmente por ti.
public class League
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int SportId { get; set; }
    public Sport? Sport { get; set; }
}
