using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services.IService;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Application.Services
{
    public class WorkerDbService : IWorkerService
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
       
        [Column("worker_id")]
        public int Id { get; set; }

        [Column("worker_name")]
        public string Name { get; set; } = string.Empty;

        [Column("worker_surname")]
        public string Surname { get; set; } = string.Empty;

        [Column("worker_lastname")]
        public string Lastname { get; set; } = string.Empty;

        [Column("shop_name")]
        public string ShopName { get; set; } = string.Empty;
    }
}
