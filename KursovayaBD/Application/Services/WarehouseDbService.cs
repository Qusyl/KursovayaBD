using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services.IService;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Services
{
    public class WarehouseDbService : IWarehouseService
    {
        private readonly AppDbContext _context;

        public WarehouseDbService(AppDbContext context) => _context = context;
        public async Task<int> CheckTotalProductInStockAsync(int shopId)
        {
          try
            {
                await using var command = _context.Database.GetDbConnection().CreateCommand();

                command.CommandText = $"SELECT check_total_product_in_stock({shopId})";

                if(command.Connection.State != System.Data.ConnectionState.Open)
                {
                    await command.Connection.OpenAsync();

                }

                var result = await command.ExecuteScalarAsync();

                return Convert.ToInt32(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CheckTotalProductInStockAsync: {ex.Message}");
                return 0;
            }
        }
    }
}
