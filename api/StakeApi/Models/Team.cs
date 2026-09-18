namespace StakeApi.Models;

// Equipa (ou jogador, no caso de desportos individuais) — pertence à
// Modalidade, NÃO a um Campeonato específico. Uma equipa como o FC Porto
// joga na Liga Portugal e na Champions League ao mesmo tempo; o Campeonato
// é escolhido à parte, por aposta, não é uma propriedade fixa da equipa.
public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int SportId { get; set; }
    public Sport? Sport { get; set; }
}
