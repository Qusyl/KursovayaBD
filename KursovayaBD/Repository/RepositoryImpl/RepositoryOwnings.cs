using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryOwnings : IRepositoryBase<OwningsModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<OwningsModel> dbSet;

        public RepositoryOwnings(AppDbContext Context)
        {
            context = Context;
            dbSet = context.Set<OwningsModel>();
        }

        public async Task<IEnumerable<OwningsModel>> FindAsync(Expression<Func<OwningsModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();    
        }

        public async Task<IEnumerable<OwningsModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<OwningsModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(ow => ow.IdOwnings == id);
        }

        public async Task InsertAsync(OwningsModel entity)
        {
           await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }


        public async Task UpdateAsync(OwningsModel entity)
        {
            var existing = await dbSet.FindAsync(entity.IdOwnings);
            if(existing != null)
            {
                context.Entry(existing).CurrentValues.SetValues(entity);
                await context.SaveChangesAsync();
            }
        }

      public async  Task RemoveAsync(OwningsModel entity)
        {
            dbSet.Remove(entity);
            await context.SaveChangesAsync();
        }
    }
}
