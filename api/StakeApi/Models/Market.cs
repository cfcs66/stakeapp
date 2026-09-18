namespace StakeApi.Models;

// Mercado (1X2, Over/Under, Handicap Asiático, Vencedor do Encontro...) —
// pertence à Modalidade, gerido manualmente por ti, tal como Campeonatos
// e Equipas. Os mercados fazem sentido diferentes por desporto (Ténis não
// tem "1X2"), por isso ficam ligados à Modalidade, não são globais.
public class Market
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int SportId { get; set; }
    public Sport? Sport { get; set; }
}
