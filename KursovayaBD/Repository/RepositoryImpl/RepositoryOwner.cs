using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryOwner : IRepositoryBase<OwnerModel>
    {
        public Task<IEnumerable<OwnerModel>> FindAsync(Expression<Func<OwnerModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<OwnerModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<OwnerModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(OwnerModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, OwnerModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
