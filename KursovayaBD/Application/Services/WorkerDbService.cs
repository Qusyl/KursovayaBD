using KursovayaBD.Application.Data;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Application.Services
{
    public class WorkerDbService
    {
        private readonly AppDbContext _context;

        public WorkerDbService(AppDbContext context) => _context = context; 

        public async Task<IEnumerable<WorkerWithShops>> GetWorkersWithShopAsync()
        {
            return await _context.WorkerWithShops.FromSqlRaw("SELECT * FROM return_workers_with_shops()").ToListAsync();
        }  
    }
    [Keyless]
   public class WorkerWithShops
    {
        public int Id { get; set; }
        public string Name { get; set; }    

        public string Surname { get; set; }

        public string Lastname { get; set; }    

        public string ShopName { get; set; }    

    }
}
