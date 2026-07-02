using Microsoft.AspNetCore.Mvc;
using TICKETERA.Data;
using TICKETERA.Models;
using TICKETERA.Dtos;
using TICKETERA.Services;

namespace TICKETERA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TicketPrintingService _printingService;

        public TicketsController(ApplicationDbContext context, TicketPrintingService printingService)
        {
            _context = context;
            _printingService = printingService;
        }

        [HttpPost("imprimir")]
        public async Task<IActionResult> ImprimirTicket([FromBody] VentaDto venta)
        {
            // Validación básica antes de procesar
            if (venta.Items == null || !venta.Items.Any())
                return BadRequest(new { success = false, mensaje = "El pedido no tiene items." });

            try
            {
                var nuevaVenta = new VentaCabecera
                {
                    Fecha = DateTime.Now,
                    MetodoPago = venta.MetodoPago,
                    MontoTotal = venta.Items.Sum(i => i.Precio * i.Cantidad),
                    Detalles = venta.Items.Select(i => new VentaDetalle
                    {
                        ProductoNombre = i.Producto,// Nuevo nombre de la propiedad
                        Cantidad = i.Cantidad,
                        PrecioUnitario = i.Precio
                    }).ToList()
                };

                // Ahora Ventas es DbSet<VentaCabecera>, esto compila correctamente
                _context.Ventas.Add(nuevaVenta);
                await _context.SaveChangesAsync();

                // Imprimir recibe solo VentaCabecera, que ya tiene todo lo necesario
                _printingService.Imprimir(nuevaVenta);

                return Ok(new
                {
                    success = true,
                    turno = nuevaVenta.Id,
                    mensaje = "Venta registrada con éxito y enviada a impresión."
                });
            }
            catch (Exception ex)
            {
                // Cambia esto temporalmente para ver el error real
                return BadRequest(new
                {
                    success = false,
                    mensaje = ex.Message,           // mensaje principal
                    detalle = ex.InnerException?.Message  // causa raíz
                });
            }
        }
    }
}