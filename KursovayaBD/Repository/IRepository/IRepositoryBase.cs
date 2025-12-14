using System.Linq.Expressions;

namespace KursovayaBD.Repository.IRepository
{
    public interface IRepositoryBase<T> where T : class
    {
        Task<bool> InsertAsync(T entity);

        void RemoveByIdAsync(int id);

        Task<T> GetByIdAsync(int id);

        void Update(int id,  T entity);

        Task<IEnumerable<T>> GetAllAsync();

        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    }
}
