using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryProduct : IRepositoryBase<ProductModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<ProductModel> dbSet;

        public RepositoryProduct(AppDbContext Context)
        {
            context = Context;
            dbSet = context.Set<ProductModel>();    
        }
        public async Task<IEnumerable<ProductModel>> FindAsync(Expression<Func<ProductModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<ProductModel>> GetAllAsync()
        {
           return await dbSet.ToListAsync();
        }

        public async Task<ProductModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task InsertAsync(ProductModel entity)
        {
            await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }

       

        public async Task UpdateAsync(ProductModel entity)
        {
            var existing =  await dbSet.FindAsync(entity.Id);
            if (existing != null)
            {
                context.Entry(existing).CurrentValues.SetValues(entity);
                await context.SaveChangesAsync();
            }
        }

      public async Task RemoveAsync(ProductModel entity)
        {
            dbSet.Remove(entity);
            await context.SaveChangesAsync();
        }
    }
}
