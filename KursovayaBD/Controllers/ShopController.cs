using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using System.Security.Cryptography.X509Certificates;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {
        private readonly RepositoryShop repository;

        public ShopController(RepositoryShop repository)
        {
            this.repository = repository;
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ShopModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllShops()
        {
            try
            {
                var shops = await repository.GetAllAsync();
                return Ok(shops);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка во время получения данных о магазинах! {ex.Message}");
            }
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ShopModel), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetShopById(int id)
        {
            try
            {
                var shop = await repository.GetByIdAsync(id);
                if (shop == null) { return NotFound($"Не найдено : Магазин с id = {id}"); }
                return Ok(shop);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка : {ex.Message}");
            }

        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ProducesResponseType(typeof(ShopModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertShop([FromBody] ShopModel shop)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                await repository.InsertAsync(shop);
                return CreatedAtAction(nameof(GetShopById), new { id = shop.Id }, shop);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка добавления : {ex.Message}");
            }

        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        [ProducesResponseType(statusCode: StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> UpdateShop(int id, [FromBody] ShopModel shop)
        {
            if (id != shop.Id)
            {
                return BadRequest("Url ID совпадает с ID в теле запроса");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingShop = await repository.GetByIdAsync(id);
                if (existingShop == null)
                {
                    return NotFound($"Не существует магазина с таким Id [{id}]");
                }
                await repository.UpdateAsync(shop);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка обновления : {ex.Message}");
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RemoveShop(int id)
        {
            try
            {
                var shop = await repository.GetByIdAsync(id);
                if (shop == null)
                {
                    return BadRequest($"Не найдено магазин с Id = [{id}]");
                }
                await repository.RemoveAsync(shop);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка во время удаления shop - {ex.Message} ");


            }
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<ShopModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchShops([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("параметр поиска не установлен не установлен!");
            }
            try
            {
                var shops = await repository.FindAsync(s => s.ShopName != null && s.ShopName.Contains(name));

                return Ok(shops);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка поиска : {ex.Message}");
            }
        }
    }
}
