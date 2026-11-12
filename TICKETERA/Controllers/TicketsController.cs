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
        Fecha = DateTime.UtcNow,
        MetodoPago = venta.MetodoPago,
        MontoTotal = venta.Items.Sum(i => i.Precio * i.Cantidad),
        Detalles = venta.Items.Select(i => new VentaDetalle
        {
            ProductoNombre = i.Producto,
            Cantidad = i.Cantidad,
            PrecioUnitario = i.Precio
        }).ToList()
    };

    _context.Ventas.Add(nuevaVenta);
    await _context.SaveChangesAsync();

    try
    {
        _printingService.Imprimir(nuevaVenta);
    }
    catch (Exception ex)
    {
        return Ok(new
        {
            success = true,
            turno = nuevaVenta.Id,
            mensaje = "Venta registrada, pero no se pudo imprimir: " + ex.Message
        });
    }

    return Ok(new
    {
        success = true,
        turno = nuevaVenta.Id,
        mensaje = "Venta registrada con éxito y enviada a impresión."
    });
}
catch (Exception ex)
{
    return BadRequest(new
    {
        success = false,
        mensaje = ex.Message,
        detalle = ex.InnerException?.Message
    });
}
}
}
}