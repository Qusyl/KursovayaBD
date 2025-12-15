using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.Json;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositorySales : IRepositoryBase<SalesModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<SalesModel> dbSet;
        public async Task<IEnumerable<SalesModel>> FindAsync(Expression<Func<SalesModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<SalesModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<SalesModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task InsertAsync(SalesModel entity)
        {
            await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }

        public void RemoveAsync(SalesModel entity)
        {
            dbSet.Remove(entity);
            context.SaveChanges();
        }

        public void Update(SalesModel entity)
        {
            dbSet.Update(entity);
            context.SaveChanges();
        }
    }
}
