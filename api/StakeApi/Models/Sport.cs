namespace StakeApi.Models;

// Modalidade (Futebol, Basquetebol, Andebol, Ténis, ou o que quiseres) —
// inserida manualmente por ti, numa página própria da app.
public class Sport
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<League> Leagues { get; set; } = [];
    public List<Team> Teams { get; set; } = [];
    public List<Market> Markets { get; set; } = [];
}
