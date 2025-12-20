namespace KursovayaBD.Application.Services.IService
{
    public interface IWarehouseService
    {
        Task<int> CheckTotalProductInStockAsync(int shopId);
    }
}
