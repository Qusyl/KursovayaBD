namespace KursovayaBD.Application.Services.IService
{
    public interface IOwnerService
    {
        Task<List<OwnerWithNonProfitShopResult>> GetOwnersWithNonProfitShopsAsync();
    }
}
