using KursovayaBD.Application;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.Json;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryProductAudit : IRepositoryBase<ProductAuditModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<ProductAuditModel> dbSet;
        public async Task<IEnumerable<ProductAuditModel>> FindAsync(Expression<Func<ProductAuditModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<ProductAuditModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<ProductAuditModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task InsertAsync(ProductAuditModel entity)
        {
            await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();   

        }

        public void RemoveAsync(ProductAuditModel entity)
        {
            dbSet.Remove(entity);
            context.SaveChanges();
        }

        public void Update(ProductAuditModel entity)
        {
            dbSet.Update(entity);
            context.SaveChanges();
        }
    }
}
