using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Models;


namespace WarehouseAPI.Data
{
    

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Resource> Resources { get; set; }
        public DbSet<UnitOfMeasure> UnitsOfMeasure { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Balance> Balances { get; set; }
        public DbSet<ReceiptDocument> ReceiptDocuments { get; set; }
        public DbSet<ReceiptResource> ReceiptResources { get; set; }
        public DbSet<ShipmentDocument> ShipmentDocuments { get; set; }
        public DbSet<ShipmentResource> ShipmentResources { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка enum преобразования
            modelBuilder.Entity<Resource>()
                .Property(r => r.Status)
                .HasConversion<string>();

            modelBuilder.Entity<UnitOfMeasure>()
                .Property(u => u.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Client>()
                .Property(c => c.Status)
                .HasConversion<string>();

            modelBuilder.Entity<ShipmentDocument>()
                .Property(s => s.Status)
                .HasConversion<string>();
        }
    }
}
