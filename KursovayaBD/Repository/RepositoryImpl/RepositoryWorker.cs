using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryWorker : IRepositoryBase<WorkerModel>
    {
        private readonly AppDbContext context;
        private readonly DbSet<WorkerModel> dbSet;

        public RepositoryWorker(AppDbContext Context)
        {
            context = Context;  

            dbSet = context.Set<WorkerModel>();
        }
        public async Task<IEnumerable<WorkerModel>> FindAsync(Expression<Func<WorkerModel, bool>> predicate)
        {
            return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<WorkerModel>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<WorkerModel> GetByIdAsync(int id)
        {
            return await dbSet.FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task InsertAsync(WorkerModel entity)
        {
            await dbSet.AddAsync(entity);
            await context.SaveChangesAsync();
        }

        public async Task RemoveAsync(WorkerModel entity)
        {
            dbSet.Remove(entity);
            await context.SaveChangesAsync();
        }

        public async Task UpdateAsync(WorkerModel entity)
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
