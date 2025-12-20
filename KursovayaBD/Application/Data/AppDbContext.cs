using KursovayaBD.Application.Services;
using KursovayaBD.Models;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

       

        public DbSet<OwnerModel> Owners { get; set; }

        public DbSet<OwningsModel> Ownings { get; set; }

        public DbSet<ShopModel> Shops { get; set; }

     

        public DbSet<ProductAuditModel> ProductAudit { get; set; }

        public DbSet<ProductModel> Products { get; set; }

        public DbSet<WorkerModel> Workers { get; set; }

        public DbSet<WorkerWithShops> WorkerWithShops { get; set; }
        public DbSet<WarehouseModel> Warehouses { get; set; }
        public DbSet<SalesModel> Sales { get; set; }

        public int? CheckTotalProductInStock(int shopId)
        {
            
            throw new NotSupportedException("linq вызов");
        }

        public string AddWarehouseIfStockAccessible(int id, int shop, int product, string productName, int inStock)
        {
            throw new NotSupportedException("linq вызов");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("public");

            modelBuilder.Entity<OwnerModel>()
                .HasIndex(e => e.Id)
                .IsUnique()
                .HasDatabaseName("owner_pkey");
            modelBuilder.Entity<SalesModel>()
                .HasIndex(e => e.Id).IsUnique()
                .HasDatabaseName("ownings_pkey");
            modelBuilder.Entity<ProductModel>()
                .HasIndex(e => e.ProductName).IsUnique().HasDatabaseName("product_name_index");
            modelBuilder.Entity<ProductModel>()
                .HasIndex(e => e.Id).IsUnique().HasDatabaseName("product_pkey");
            modelBuilder.Entity<ProductAuditModel>().HasIndex(e => e.Id).IsUnique().HasDatabaseName("product_insert_audit_pkey");
            modelBuilder.Entity<SalesModel>().HasIndex(e => e.Id).IsUnique().HasDatabaseName("sales_pkey");
            modelBuilder.Entity<ShopModel>().HasIndex(e => e.ShopName).IsUnique().HasDatabaseName("shop_name_Index");
            modelBuilder.Entity<ShopModel>().HasIndex(e => e.Id).IsUnique().HasDatabaseName("shop_pkey");
            modelBuilder.Entity<WarehouseModel>().HasIndex(e => e.Id).IsUnique().HasDatabaseName("warehouse_pkey");
            modelBuilder.Entity<WorkerModel>().HasIndex(e => e.Id).IsUnique().HasDatabaseName("worker_pkey");


            //ф-ции

            modelBuilder.HasDbFunction(typeof(AppDbContext).GetMethod(nameof(CheckTotalProductInStock))!).HasName("check_total_product_in_stock");
            modelBuilder.HasDbFunction(typeof(AppDbContext).GetMethod(nameof(AddWarehouseIfStockAccessible))!).HasName("add_warehouse_if_stock_accessible");
        }

        protected AppDbContext()
        {
        }
    }
}
