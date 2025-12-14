using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryProductAudit : IRepositoryBase<ProductAuditModel>
    {
        public Task<IEnumerable<ProductAuditModel>> FindAsync(Expression<Func<ProductAuditModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductAuditModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ProductAuditModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(ProductAuditModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, ProductAuditModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
