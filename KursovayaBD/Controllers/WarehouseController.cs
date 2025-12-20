using KursovayaBD.Application.Services;
using KursovayaBD.Application.Services.IService;
using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WarehouseController : ControllerBase
    {
        private readonly RepositoryWarehouse repository;
        private readonly IWarehouseService warehouseService;

        public WarehouseController(
        RepositoryWarehouse repository,
        IWarehouseService warehouseService)
        {
            this.repository = repository;
            this.warehouseService = warehouseService;
        }
        [HttpGet("total-stock/{shopId}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTotalStock(int shopId)
        {
            try
            {
                var totalStock = await warehouseService.CheckTotalProductInStockAsync(shopId);
                return Ok(new
                {
                    ShopId = shopId,
                    TotalProductsInStock = totalStock,
                    Message = totalStock >= 2000 ?
                        "Внимание: достигнут максимальный лимит склада (2000)" :
                        $"Доступно места: {2000 - totalStock}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка: {ex.Message}");
            }
        }
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WarehouseModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllWarehouse()
        {
            try
            {
                var warehouse = await repository.GetAllAsync();
                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка во время получения данных о складах! {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WarehouseModel), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetWarehouseById(int id)
        {
            try
            {
                var warehouse = await repository.GetByIdAsync(id);
                if (warehouse == null) { return NotFound($"Не найдено : Склада с id = {id}"); }
                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка : {ex.Message}");
            }

        }

        [HttpPost]
        [ProducesResponseType(typeof(WarehouseModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertShop([FromBody] WarehouseModel warehouse)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                await repository.InsertAsync(warehouse);
                return CreatedAtAction(nameof(GetWarehouseById), new { id = warehouse.Id }, warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка добавления : {ex.Message}");
            }

        }
        [HttpPut("{id}")]
        [ProducesResponseType(statusCode: StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> UpdateShop(int id, [FromBody] WarehouseModel warehouse)
        {
            if (id != warehouse.Id)
            {
                return BadRequest("Url ID совпадает с ID в теле запроса");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingWarehouse = await repository.GetByIdAsync(id);
                if (existingWarehouse == null)
                {
                    return NotFound($"Не существует склада с таким Id [{id}]");
                }
               await repository.UpdateAsync(warehouse);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка обновления : {ex.Message}");
            }
        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RemoveWarehouse(int id)
        {
            try
            {
                var warehouse = await repository.GetByIdAsync(id);
                if (warehouse == null)
                {
                    return BadRequest($"Не найдено склада с Id = [{id}]");
                }
                repository.RemoveAsync(warehouse);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка во время удаления shop - {ex.Message} ");


            }
        }
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<WarehouseModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchWarehouse([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("параметр поиска не установлен не установлен!");
            }
            try
            {
                var shops = await repository.FindAsync(w => w.ProductName != null && w.ProductName.Contains(name));

                return Ok(shops);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка поиска : {ex.Message}");
            }
        }
    }
}
