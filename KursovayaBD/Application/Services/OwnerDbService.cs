using KursovayaBD.Application.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace KursovayaBD.Application.Services
{
    public class OwnerDbService
    {
        private readonly AppDbContext _context;

        public OwnerDbService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> InsertOwner(int Id, string Name, string Surname, string Lastname, string Address, string Phone)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync($"SELECT insert_owner({Id}, {Name}, {Surname}, {Lastname}, {Address}, {Phone})");
                return "Запись успешно добавлена!";
            }
            catch (PostgresException E) when (E.SqlState == "23505") {
                return "Запись с таким ID уже существует! ";
            }
            catch (Exception ex)
            {
                return $"Ошибка транзакции: {ex.Message}";
            }

        }
        
    }
}
