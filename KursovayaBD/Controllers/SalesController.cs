using KursovayaBD.Application.Services;
using KursovayaBD.Application.Services.IService;
using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
    
        private readonly RepositorySales repository;
        private readonly ISalesService salesService;
        public SalesController(
        RepositorySales repository,
        ISalesService salesService)
        {
            this.repository = repository;
            this.salesService = salesService;
        }
        [HttpGet("best-profit-products-count")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetBestProfitProductsCount()
        {
            try
            {
                var count = await salesService.GetNumProductsWithBestProfitAsync();
                return Ok(new
                {
                    Count = count,
                    Description = $"Количество продуктов с прибылью ≥ 1,800,000",
                    Threshold = 1800000
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка: {ex.Message}");
            }
        }
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SalesModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var sales = await repository.GetAllAsync();

                return Ok(sales);
            }

            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> GetSalesById(int id)
        {
            try
            {
                var sales = await repository.GetByIdAsync(id);
                if (sales == null)
                {
                    return NotFound($"Не найдено : продажа с id = {id}");
                }
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка в {nameof(GetSalesById)}: " + ex.Message);
            }
        }
        [HttpPost]
        [ProducesResponseType(typeof(SalesModel), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertSales([FromBody] SalesModel sales)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Не верный формат для Sales");
            }
            try
            {
                 await repository.InsertAsync(sales);
                return CreatedAtAction(nameof(GetSalesById), new { id = sales.Id }, sales);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}");
            }
        }



        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateSales(int id, [FromBody] SalesModel sales)
        {
            if (id != sales.Id) 
            {
                return BadRequest("ID не совпадает с ID в теле запроса! ");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingSales = await repository.GetByIdAsync(id);

                if (existingSales == null)
                {
                    return NotFound($"Продажи с таким Id [{id}] не найден!");
                }
                await repository.UpdateAsync(sales);

                return NoContent();
            }

            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка в методе {nameof(UpdateSales)}: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> RemoveSale(int id)
        {
            try
            {
                var sales = await repository.GetByIdAsync(id);
                if (sales == null)
                {
                    return NotFound($"Продаж с ID = {id} не существует!");
                }
                await repository.RemoveAsync(sales);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка: {ex.Message}");
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<SalesModel>), StatusCodes.Status200OK)]

        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> SearchSale([FromQuery] decimal profit)
        {
            if (decimal.IsNegative(profit))
            {
                return BadRequest("is negative!");
            }
            try
            {
                var sales = await repository.FindAsync(s => s.Profit >= profit && decimal.IsPositive(profit) );

                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"неизвестная ошибка: {ex.Message}");
            }
        }
    }
}

