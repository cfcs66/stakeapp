namespace StakeApi.Models;

// Depósitos e levantamentos da banca
public class BankMovement
{
    public int Id { get; set; }
    public MovementType Type { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
