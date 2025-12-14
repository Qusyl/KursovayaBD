using KursovayaBD.Models;
using KursovayaBD.Repository.IRepository;
using System.Linq.Expressions;

namespace KursovayaBD.Repository.RepositoryImpl
{
    public class RepositoryWorker : IRepositoryBase<WorkerModel>
    {
        public Task<IEnumerable<WorkerModel>> FindAsync(Expression<Func<WorkerModel, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<WorkerModel>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<WorkerModel> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> InsertAsync(WorkerModel entity)
        {
            throw new NotImplementedException();
        }

        public void RemoveByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public void Update(int id, WorkerModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
