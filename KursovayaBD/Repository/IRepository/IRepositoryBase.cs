using System.Linq.Expressions;

namespace KursovayaBD.Repository.IRepository
{
    public interface IRepositoryBase<T> where T : class
    {
        Task InsertAsync(T entity);

        void RemoveAsync(T entity);

        Task<T> GetByIdAsync(int id);

        void Update(T entity);

        Task<IEnumerable<T>> GetAllAsync();

        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    }
}
