using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryShop : IRepositoryBase<ShopModel>
    {
        public Task<IEnumerable<ShopModel>> FindAsync(Expression<Func<ShopModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ShopModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ShopModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(ShopModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, ShopModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
