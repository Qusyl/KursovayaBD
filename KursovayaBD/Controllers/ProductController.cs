using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly RepositoryProduct repository;

        public ProductController(RepositoryProduct repository)
        {
            this.repository = repository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var products = await repository.GetAllAsync();

                return Ok(products);
            }

            catch (Exception ex) {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                var product = await repository.GetByIdAsync(id);
                if (product == null)
                {
                    return NotFound($"Не найдено : продукт с id = {id}");
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка в {nameof(GetProductById)}: " + ex.Message);
            }
        }
        [HttpPost]
        [ProducesResponseType(typeof(ProductModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> InsertProduct([FromBody] ProductModel product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }

            try
            {
                await repository.InsertAsync(product);
                return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
            }
            catch (Exception ex) {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}");
            }

        }
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductModel product)
        {
            if (id != product.Id)
            {
                return BadRequest("ID не совпадает с ID в теле запроса! ");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingProduct = await repository.GetByIdAsync(id);

                if (existingProduct == null)
                {
                    return NotFound($"Продукт с таким Id [{id}] не найден!");
                }
                repository.Update(existingProduct);

                return NoContent();
            }

            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError,$"Неизвестная ошибка в методе {nameof(UpdateProduct)}: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> RemoveProduct(int id)
        {
            try
            {
                var product = await repository.GetByIdAsync(id);
                if (product == null)
                {
                    return NotFound($"Продукта с ID = {id} не существует!");
                }
                repository.RemoveAsync(product);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка: {ex.Message}");
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<ProductModel>), StatusCodes.Status200OK)]
      
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> SearchProduct(string name)
        {
            try
            {
                var products =  await repository.FindAsync(p => p.ProductName != null && p.ProductName.Contains(name));

                return Ok(products);
            }catch(Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"неизвестная ошибка: {ex.Message}");
            }
        }
    }
}
