using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerController : ControllerBase
    {
        private readonly RepositoryWorker repository;

        public WorkerController(RepositoryWorker repository)
        {
            this.repository = repository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WorkerModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllWorkers()
        {
            try
            {
                var worker = await repository.GetAllAsync();
                return Ok(worker);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка во время получения данных о работнике! {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WorkerModel), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetWorkerById(int id)
        {
            try
            {
                var worker = await repository.GetByIdAsync(id);
                if (worker == null) { return NotFound($"Не найдено : работник с id = {id}"); }
                return Ok(worker);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка : {ex.Message}");
            }

        }

        [HttpPost]
        [ProducesResponseType(typeof(WorkerModel), statusCode: StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<IActionResult> InsertWorker([FromBody] WorkerModel worker)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState} - INSERTED WORKER IS NOT VALID!");
            }
            try
            {
                await repository.InsertAsync(worker);
                return CreatedAtAction(nameof(GetWorkerById), new { id = worker.Id }, worker);
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

        public async Task<IActionResult> UpdateWorker(int id, [FromBody] WorkerModel worker)
        {
            if (id != worker.Id)
            {
                return BadRequest("Url ID совпадает с ID в теле запроса");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest($"{ModelState} - в UpdateWorker!");
            }
            try
            {
                var existingWorker = await repository.GetByIdAsync(id);
                if (existingWorker == null)
                {
                    return NotFound($"Не существует worker с таким Id [{id}]");
                }
                await repository.UpdateAsync(worker);
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                
                Console.WriteLine($"DbUpdateException: {dbEx.Message}");
                Console.WriteLine($"InnerException: {dbEx.InnerException?.Message}");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Ошибка добавления: {dbEx.InnerException?.Message ?? dbEx.Message}");
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
        public async Task<IActionResult> RemoveWorker(int id)
        {
            try
            {
                var worker = await repository.GetByIdAsync(id);
                if (worker == null)
                {
                    return BadRequest($"Не найдено склада с Id = [{id}]");
                }
                await repository.RemoveAsync(worker);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Неизвестная ошибка во время удаления worker - {ex.Message} ");


            }
        }
        [HttpGet("search/name")]
        [ProducesResponseType(typeof(IEnumerable<WorkerModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchWorkerByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("параметр поиска не установлен не установлен!");
            }
            try
            {
                var worker = await repository.FindAsync(w => w.WorkerName != null && w.WorkerName.Contains(name));

                return Ok(worker);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка поиска : {ex.Message}");
            }
        }
            [HttpGet("search/surname")]
            [ProducesResponseType(typeof(IEnumerable<WorkerModel>), statusCode: StatusCodes.Status200OK)]
            [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
            public async Task<IActionResult> SearchWorkerBySurname([FromQuery] string Surname)
            {
                if (string.IsNullOrEmpty(Surname))
                {
                    return BadRequest("параметр поиска не установлен не установлен!");
                }
                try
                {
                    var worker = await repository.FindAsync(w => w.WorkerSurname != null && w.WorkerSurname.Contains(Surname));

                    return Ok(worker);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка поиска : {ex.Message}");
                }
            }
  
    [HttpGet("search/lastname")]
        [ProducesResponseType(typeof(IEnumerable<WorkerModel>), statusCode: StatusCodes.Status200OK)]
        [ProducesResponseType(statusCode: StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchWorkerByLastName([FromQuery] string Lastname)
        {
            if (string.IsNullOrEmpty(Lastname))
            {
                return BadRequest("параметр поиска не установлен не установлен!");
            }
            try
            {
                var worker = await repository.FindAsync(w => w.WorkerLastname != null && w.WorkerLastname.Contains(Lastname));

                return Ok(worker);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка поиска : {ex.Message}");
            }
        }
    }
}


