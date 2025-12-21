using KursovayaBD.Models;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KursovayaBD.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductAuditController : ControllerBase
    {
        private readonly RepositoryProductAudit repository;

        public ProductAuditController(RepositoryProductAudit repository)
        {
            this.repository = repository;
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductAuditModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllAudit()
        {
            try
            {
                var audit = await repository.GetAllAsync();
                return Ok(audit);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllAudit)}");
            }
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet("search/new")]
        [ProducesResponseType(typeof(IEnumerable<ProductAuditModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchAuditNew([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest(name + "is empty or null!");
            }
            try
            {
                var audit = await repository.FindAsync(a => a.NewName.Contains(name));
                if (audit == null)
                {
                    return NotFound("Нет владельцев с таким именем!");
                }
                return Ok(audit);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllAudit)}");
            }
        }
        [Authorize(Roles = "Admin,User,Guest")]
        [HttpGet("search/old")]
        [ProducesResponseType(typeof(IEnumerable<ProductAuditModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchAuditOld([FromQuery] string OldName)
        {
            if (string.IsNullOrEmpty(OldName))
            {
                return BadRequest(OldName + "is empty or null!");
            }
            try
            {
                var audit = await repository.FindAsync(a => a.OldName.Contains(OldName));
                if (audit == null)
                {
                    return NotFound("Нет владельцев с таким именем!");
                }
                return Ok(audit);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message + $"от {nameof(GetAllAudit)}");
            }
        }

    }
}
