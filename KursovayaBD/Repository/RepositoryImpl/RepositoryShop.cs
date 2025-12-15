using KursovayaBD.Application;
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

        public void RemoveAsync(ShopModel entity)
        {
            dbSet.Remove(entity);
            context.SaveChanges();
        }

        public void Update(ShopModel entity)
        {
           dbSet.Update (entity);

            context.SaveChanges ();
        }
    }

}
