using KursovayaBD.Application.Data;
using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryOwner : IRepositoryBase<OwnerModel>
    {
        private readonly AppDbContext context;

        private readonly DbSet<OwnerModel> dbSet;   
        public async Task<IEnumerable<OwnerModel>> FindAsync(Expression<Func<OwnerModel, bool>> predicate)
        {
           return await dbSet.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<OwnerModel>> GetAllAsync()
        {
            return  await dbSet.ToListAsync();
        }

        public async Task<OwnerModel> GetByIdAsync(int id)
        {
           return await dbSet.FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task InsertAsync(OwnerModel entity)
        {
           await dbSet.AddAsync(entity);
           await context.SaveChangesAsync();
        }

        public void RemoveAsync(OwnerModel entity)
        {
            dbSet.Remove(entity);
            context.SaveChangesAsync();
        }

        public void Update(OwnerModel entity)
        {
            dbSet.Update(entity);
            context.SaveChanges();
        }
    }
}
