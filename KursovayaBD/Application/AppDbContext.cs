using KursovayaBD.Models;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<OwnerModel> Owners { get; set; }

        public DbSet<ShopModel> Shops { get; set; }

        public DbSet<OwningsModel> Ownings { get; set; }

        public DbSet<ProductAuditModel> ProductAudit { get; set; }

        public DbSet<ProductModel> Products { get; set; }

        public DbSet<WorkerModel> Workers { get; set; }
        public DbSet<WarehouseModel> Warehouses { get; set; }
        public DbSet<SalesModel> Sales { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("public");
        }

        protected AppDbContext()
        {
        }
    }
}
