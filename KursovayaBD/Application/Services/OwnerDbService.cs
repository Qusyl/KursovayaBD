using KursovayaBD.Application.Data;

namespace KursovayaBD.Application.Services
{
    public class OwnerDbService
    {
        private readonly AppDbContext _context;

        public OwnerDbService(AppDbContext context)
        {
            _context = context;
        }

        public async Task InsertOwner()
    }
}
