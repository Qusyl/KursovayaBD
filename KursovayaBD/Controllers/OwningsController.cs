using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OwningsController : ControllerBase
    {
        private readonly RepositoryOwnings repository;
        
        public OwningsController(RepositoryOwnings repository)
        {
            this.repository = repository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OwningsModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllOwnings()
        {
            try
            {
                var ownings = await repository.GetAllAsync();
                return Ok(ownings);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwnings)}");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OwningsModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOwningsById(int id)
        {
            try
            {
                var owner = await repository.GetByIdAsync(id);
                if (owner == null)
                {
                    NotFound("Владений с таким Id не существует!");
                }
                return Ok(owner);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwnings)}");
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<OwningsModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchOwner([FromQuery] decimal holding)
        {
            if (decimal.IsNegative(holding))
            {
                return BadRequest(holding + "is negative!");
            }
            try
            {
                var ownings = await repository.FindAsync(ow => ow.Holding >= holding);
                if (ownings == null)
                {
                    return NotFound("Нет владений с такой долей!");
                }
                return Ok(ownings);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwnings)}");
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(OwningsModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertOwner([FromBody] OwningsModel ownings)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                await repository.InsertAsync(ownings);
                return CreatedAtAction(nameof(GetOwningsById), new { id = ownings.IdOwnings }, ownings);
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

        public async Task<IActionResult> UpdateOwnings(int id, [FromBody] OwningsModel ownings)
        {
            if (id != ownings.IdOwnings)
            {
                return BadRequest("Url ID совпадает с ID в теле запроса");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingOwnings = await repository.GetByIdAsync(id);
                if (existingOwnings == null)
                {
                    return NotFound($"Не существует владений с таким Id [{id}]");
                }
               await repository.UpdateAsync(ownings);
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
        public async Task<IActionResult> RemoveOwnings(int id)
        {
            try
            {
                var ownings = await repository.GetByIdAsync(id);
                if (ownings == null)
                {
                    return BadRequest($"Не найдено владений с Id = [{id}]");
                }
                await repository.RemoveAsync(ownings);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка во время удаления shop - {ex.Message} ");


            }
        }
    }
}

