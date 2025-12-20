using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services.IService;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Services
{
    public class OwnerDbService : IOwnerService
    {
        private readonly AppDbContext _context;

        public OwnerDbService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OwnerWithNonProfitShopResult>> GetOwnersWithNonProfitShopsAsync()
        {
            var results = new List<OwnerWithNonProfitShopResult>();

            try
            {
                await using var command = _context.Database.GetDbConnection().CreateCommand();
                command.CommandText = "SELECT * FROM get_owners_with_non_profit_shops()";

                if (command.Connection.State != System.Data.ConnectionState.Open)
                {
                    await command.Connection.OpenAsync();
                }

                await using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var result = new OwnerWithNonProfitShopResult
                    {
                        Name = reader.IsDBNull(0) ? "" : reader.GetString(0),
                        Surname = reader.IsDBNull(1) ? "" : reader.GetString(1),
                        Lastname = reader.IsDBNull(2) ? "" : reader.GetString(2),
                        ShopId = reader.IsDBNull(3) ? 0 : reader.GetInt32(3)
                    };

                    results.Add(result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetOwnersWithNonProfitShopsAsync: {ex.Message}");
            }

            return results;
        }
    }
}
    public class OwnerWithNonProfitShopResult
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public int ShopId { get; set; }
    }

