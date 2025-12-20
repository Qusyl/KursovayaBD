using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services.IService;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Services
{
    public class SalesDbSevice : ISalesService
    {
        private readonly AppDbContext _context;

       public SalesDbSevice(AppDbContext context)
        {
            _context = context; 
        }
        public async Task<int> GetNumProductsWithBestProfitAsync()
        {
            try
            {
                await using var command = _context.Database.GetDbConnection().CreateCommand();
                command.CommandText = $"SELECT get_num_products_with_best_profit()";
                if (command.Connection.State != System.Data.ConnectionState.Open)
                {
                    await command.Connection.OpenAsync();
                }
                var result = await command.ExecuteScalarAsync();
                return Convert.ToInt32(result ?? 0);
            }
            catch (Exception ex) {
                Console.WriteLine($"Error in GetNumProductsWithBestProfitAsync: {ex.Message}");
                return 0;
            }
        }
    }
}
