using KursovayaBD.Application;
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

        public void RemoveAsync(ProductModel entity)
        {
            dbSet.Remove(entity);
            context.SaveChanges();
        }

        public void Update(ProductModel entity)
        {
            dbSet.Update(entity);
            context.SaveChanges();
        }
    }
}
