using Microsoft.EntityFrameworkCore;
using StakeApi.Models;

namespace StakeApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Bet> Bets => Set<Bet>();
    public DbSet<BetLeg> BetLegs => Set<BetLeg>();
    public DbSet<BankMovement> BankMovements => Set<BankMovement>();
    public DbSet<Sport> Sports => Set<Sport>();
    public DbSet<League> Leagues => Set<League>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Market> Markets => Set<Market>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bet>()
            .HasMany(b => b.Legs)
            .WithOne(l => l.Bet)
            .HasForeignKey(l => l.BetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Guarda os enums como texto na BD (mais legível que números ao inspecionar a BD)
        modelBuilder.Entity<Bet>().Property(b => b.Type).HasConversion<string>();
        modelBuilder.Entity<Bet>().Property(b => b.Status).HasConversion<string>();
        modelBuilder.Entity<BankMovement>().Property(m => m.Type).HasConversion<string>();

        // Hierarquia Modalidade → Campeonato → Equipa, gerida manualmente por ti
        modelBuilder.Entity<Sport>()
            .HasIndex(s => s.Name)
            .IsUnique();

        modelBuilder.Entity<League>()
            .HasOne(l => l.Sport)
            .WithMany(s => s.Leagues)
            .HasForeignKey(l => l.SportId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<League>()
            .HasIndex(l => new { l.SportId, l.Name })
            .IsUnique();

        modelBuilder.Entity<Team>()
            .HasOne(t => t.Sport)
            .WithMany(s => s.Teams)
            .HasForeignKey(t => t.SportId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Team>()
            .HasIndex(t => new { t.SportId, t.Name })
            .IsUnique();

        modelBuilder.Entity<Market>()
            .HasOne(m => m.Sport)
            .WithMany(s => s.Markets)
            .HasForeignKey(m => m.SportId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Market>()
            .HasIndex(m => new { m.SportId, m.Name })
            .IsUnique();
    }
}
