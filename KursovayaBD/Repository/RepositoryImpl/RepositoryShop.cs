using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryShop : IRepositoryBase<ShopModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<ShopModel> dbSet;

        public RepositoryShop(AppDbContext context)
        {
            this.context = context;
            dbSet = context.Set<ShopModel>();
        }
        public async Task<IEnumerable<ShopModel>> FindAsync(Expression<Func<ShopModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<ShopModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<ShopModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task InsertAsync(ShopModel entity)
        {
           await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }

        public async Task RemoveAsync(ShopModel entity)
        {
            dbSet.Remove(entity);
            await context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ShopModel entity)
        {
            var existing =await dbSet.FindAsync(entity.Id);
            if (existing != null)
            {
                context.Entry(existing).CurrentValues.SetValues(entity);
                await context.SaveChangesAsync();
            }
        }
    }

}
