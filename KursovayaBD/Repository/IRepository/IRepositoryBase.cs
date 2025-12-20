using System.Linq.Expressions;

namespace KursovayaBD.Repository.IRepository
{
    public interface IRepositoryBase<T> where T : class
    {
        Task InsertAsync(T entity);

        Task RemoveAsync(T entity);

        Task<T> GetByIdAsync(int id);

        Task UpdateAsync(T entity);

        Task<IEnumerable<T>> GetAllAsync();

        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    }
}
