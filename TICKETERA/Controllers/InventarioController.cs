using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TICKETERA.Data;
using TICKETERA.Models;

namespace TICKETERA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventarioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventarioController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarInventario([FromBody] List<Inventario> items)
        {
            try
            {
                var hoy = DateTime.Today;

                foreach (var item in items)
                {
                    // Buscamos si el producto ya se registró hoy
                    var registroExistente = await _context.InventarioDiario
                        .FirstOrDefaultAsync(x => x.Producto == item.Producto && x.Fecha.Date == hoy);

                    if (registroExistente != null)
                    {
                        // MODO TARDE: Actualizamos solo el stock que quedó
                        registroExistente.StockFinal = item.StockFinal;
                        // Opcional: Actualizar precio por si cambió
                        registroExistente.PrecioUnitario = item.PrecioUnitario;
                    }
                    else
                    {
                        // MODO MAÑANA: Creamos el registro con el stock inicial
                        item.Fecha = DateTime.Now;
                        // El StockFinal inicia igual al Inicial para que "Vendido" sea 0 al empezar
                        if (item.StockFinal == 0) item.StockFinal = item.StockInicial;

                        _context.InventarioDiario.Add(item);
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, mensaje = "Inventario actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = "Error: " + ex.Message });
            }
        }
    }
}