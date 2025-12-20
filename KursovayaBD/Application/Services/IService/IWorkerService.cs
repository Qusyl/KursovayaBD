namespace KursovayaBD.Application.Services.IService
{
    public interface IWorkerService 
    {
        Task<IEnumerable<WorkerWithShops>> GetWorkersWithShopAsync();
    }
}
