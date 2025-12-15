using KursovayaBD.Application.Data;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Services
{
    public class WarehouseDbService
    {
        private readonly AppDbContext _context;

        public WarehouseDbService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int?> GetTotalProductsInStock(int shopId)
        {
            return await _context.Warehouses
                .Where(w => w.Shop == shopId)
                .GroupBy(w => w.Shop)
                .Select(g => _context.CheckTotalProductInStock(shopId))
                .FirstOrDefaultAsync();
        }

        public async Task<string> AddWarehouseIfStockAccessible(int w_id, int w_shop, int w_product, string w_product_name, int in_stock)
        {
            var result = await _context.Database.SqlQuery<string>($"SELECT add_warehouse_if_stock_accessible({w_id},{w_shop},{w_product},{w_product_name},{in_stock})").FirstOrDefaultAsync();
            return result ?? $"неизвестный результат - метод {nameof(AddWarehouseIfStockAccessible)}";
        }



    }
}
