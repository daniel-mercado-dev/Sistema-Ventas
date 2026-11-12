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
        var lima = TimeZoneInfo.FindSystemTimeZoneById("America/Lima");
        var hoyLima = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, lima).Date;
        var hoy = DateTime.SpecifyKind(hoyLima, DateTimeKind.Utc);

        foreach (var item in items)
        {
            // Verificar que el producto exista
            var existeProducto = await _context.Set<Producto>().AnyAsync(p => p.Id == item.ProductoId);
            if (!existeProducto)
                return BadRequest(new { success = false, mensaje = $"El producto {item.ProductoId} no existe." });

            item.Producto = null!;   // evita que EF intente insertar el producto
            item.Fecha = hoy;

            var registroExistente = await _context.InventarioDiario
                .FirstOrDefaultAsync(x => x.ProductoId == item.ProductoId && x.Fecha == hoy);

            if (registroExistente != null)
            {
                registroExistente.StockFinal = item.StockFinal;
                registroExistente.PrecioUnitario = item.PrecioUnitario;
            }
            else
            {
                item.Id = 0;
                if (item.StockFinal == 0) item.StockFinal = item.StockInicial;
                _context.InventarioDiario.Add(item);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, mensaje = "Inventario actualizado correctamente." });
    }
    catch (Exception ex)
    {
        // Muestra el error REAL de Postgres
        var detalle = ex.InnerException?.Message ?? ex.Message;
        return BadRequest(new { success = false, mensaje = "Error: " + detalle });
        }
    }
}
}

    