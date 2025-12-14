using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryProduct : IRepositoryBase<ProductModel>
    {
        public Task<IEnumerable<ProductModel>> FindAsync(Expression<Func<ProductModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ProductModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(ProductModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, ProductModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
