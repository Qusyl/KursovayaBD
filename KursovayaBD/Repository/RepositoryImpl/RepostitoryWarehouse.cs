using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepostitoryWarehouse : IRepositoryBase<WarehouseModel>
    {
        public Task<IEnumerable<WarehouseModel>> FindAsync(Expression<Func<WarehouseModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<WarehouseModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<WarehouseModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(WarehouseModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, WarehouseModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
