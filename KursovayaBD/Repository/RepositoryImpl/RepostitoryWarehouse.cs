using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryWarehouse : IRepositoryBase<WarehouseModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<WarehouseModel> dbSet;

        public RepositoryWarehouse(AppDbContext Context)
        {
            context = Context;

            dbSet = context.Set<WarehouseModel>();
        }

        public async Task<IEnumerable<WarehouseModel>> FindAsync(Expression<Func<WarehouseModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<WarehouseModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<WarehouseModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(wm => wm.Id == id);
        }

        public async Task InsertAsync(WarehouseModel entity)
        {
           await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }

        public async Task RemoveAsync(WarehouseModel entity)
        {
            dbSet.Remove(entity);
            await context.SaveChangesAsync();
        }

        public async Task UpdateAsync(WarehouseModel entity)
        {

            var existing = await dbSet.FindAsync(entity.Id);
            if (existing != null)
            {
                context.Entry(existing).CurrentValues.SetValues(entity);
                await context.SaveChangesAsync();
            }
        }
    }
}
