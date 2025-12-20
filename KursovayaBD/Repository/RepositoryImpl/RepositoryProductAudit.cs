using KursovayaBD.Application.Data;
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

        public RepositoryProductAudit(AppDbContext Context)
        {
            context = Context;
            dbSet = context.Set<ProductAuditModel>();
        }
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

        public async Task RemoveAsync(ProductAuditModel entity)
        {

            dbSet.Remove(entity);
            await context.SaveChangesAsync(); 
        
        }


        public async Task UpdateAsync(ProductAuditModel entity)
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

