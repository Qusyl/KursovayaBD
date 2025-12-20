namespace KursovayaBD.Application.Services.IService
{
    public interface ISalesService
    {
        Task<int> GetNumProductsWithBestProfitAsync();
    }
}
