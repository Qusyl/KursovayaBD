using KursovayaBD.Application.Services;
using KursovayaBD.Application.Services.IService;
using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OwnerController : ControllerBase
    {
        private readonly RepositoryOwner repository;
        private readonly IOwnerService ownerService;

        public OwnerController(
            RepositoryOwner repository,
            IOwnerService ownerService)
        {
            this.repository = repository;
            this.ownerService = ownerService;
        }
        [HttpGet("non-profit-shops")]
        [ProducesResponseType(typeof(IEnumerable<OwnerWithNonProfitShopResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOwnersWithNonProfitShops()
        {
            try
            {
                var owners = await ownerService.GetOwnersWithNonProfitShopsAsync();

                if (!owners.Any())
                {
                    return Ok(new
                    {
                        Message = "Нет владельцев с магазинами, имеющими прибыль ≥ 2,500,000",
                        Threshold = 2500000
                    });
                }

                return Ok(new
                {
                    Count = owners.Count,
                    Threshold = 2500000,
                    Owners = owners
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка: {ex.Message}");
            }
        }
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OwnerModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllOwners()
        {
            try
            {
                var owners = await repository.GetAllAsync();
                return Ok(owners);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwners)}");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OwnerModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOwnerById(int id)
        {
            try
            {
                var owner = await repository.GetByIdAsync(id);
                if(owner == null)
                {
                    NotFound("Пользователя с таким Id не существует!");
                }
                return Ok(owner);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwners)}");
            }
        }

        [HttpGet("search/name")]
        [ProducesResponseType(typeof(IEnumerable<OwnerModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchOwnerByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest(name + "is empty or null!");
            }
            try
            {
                var owners = await repository.FindAsync(o => o.Name.Contains(name));
                if(owners == null)
                {
                    return NotFound("Нет владельцев с таким именем!");
                }
                return Ok(owners);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwners)}");
            }
        }
        [HttpGet("search/surname")]
        [ProducesResponseType(typeof(IEnumerable<OwnerModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchOwnerBySurname([FromQuery] string Surname)
        {
            if (string.IsNullOrEmpty(Surname))
            {
                return BadRequest(Surname + "is empty or null!");
            }
            try
            {
                var owners = await repository.FindAsync(o => o.Surname.Contains(Surname));
                if (owners == null)
                {
                    return NotFound("Нет владельцев с такой фамилией!");
                }
                return Ok(owners);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwners)}");
            }
        }
        [HttpGet("search/lastname")]
        [ProducesResponseType(typeof(IEnumerable<OwnerModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchOwnerByLastName([FromQuery] string LastName)
        {
            if (string.IsNullOrEmpty(LastName))
            {
                return BadRequest(LastName + "is empty or null!");
            }
            try
            {
                var owners = await repository.FindAsync(o => o.Lastname.Contains(LastName));
                if (owners == null)
                {
                    return NotFound("Нет владельцев с таким отчеством!");
                }
                return Ok(owners);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllOwners)}");
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(OwnerModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertOwner([FromBody] OwnerModel owner)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                await repository.InsertAsync(owner);
                return CreatedAtAction(nameof(GetOwnerById), new { id = owner.Id }, owner);
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

        public async Task<IActionResult> UpdateOwner(int id, [FromBody] OwnerModel owner)
        {
            if (id != owner.Id)
            {
                return BadRequest("Url ID совпадает с ID в теле запроса");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState}");
            }
            try
            {
                var existingOwner = await repository.GetByIdAsync(id);
                if (existingOwner == null)
                {
                    return NotFound($"Не существует владельца с таким Id [{id}]");
                }
               await repository.UpdateAsync(owner);
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
        public async Task<IActionResult> RemoveOwner(int id)
        {
            try
            {
                var owner = await repository.GetByIdAsync(id);
                if (owner == null)
                {
                    return BadRequest($"Не найдено владелец с Id = [{id}]");
                }
               await repository.RemoveAsync(owner);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка во время удаления shop - {ex.Message} ");


            }
        }
    }
}
