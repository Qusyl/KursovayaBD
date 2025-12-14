using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositorySales : IRepositoryBase<SalesModel>
    {
        public Task<IEnumerable<SalesModel>> FindAsync(Expression<Func<SalesModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<SalesModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<SalesModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(SalesModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, SalesModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
