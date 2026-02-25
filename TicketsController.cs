using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.Drawing.Printing;
using TICKETERA.Data;
using TICKETERA.Models;
using TICKETERA.Dtos;

namespace TICKETERA.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
   {

        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("imprimir")]
        public async Task<IActionResult> ImprimirTicket([FromBody] VentaDto venta)
        {
            try
            {
               
                var nuevaVenta = new Venta
                {
                    Sabor = venta.Sabor,
                    Precio = venta.Precio,
                    Cantidad = venta.Cantidad,
                    Promocion = venta.Promocion,
                    MetodoPago = venta.MetodoPago,
                    Fecha = DateTime.Now
                };
                _context.Ventas.Add(nuevaVenta);
                await _context.SaveChangesAsync();

                int numeroTurno = nuevaVenta.Id;

                
                string ticketId = DateTime.Now.Ticks.ToString().Substring(08);
                string fechaHora = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");

                PrintDocument pd = new PrintDocument();
                pd.DocumentName = "Ticket_" + ticketId;
                pd.PrinterSettings.PrinterName ="EPSON TM-U220 Receipt";

                pd.PrintPage += (sender, e) =>
                {
                    Graphics g = e.Graphics;
                    float y = 10; 
                    float margenX = 10;
                    float anchoTicket = 180;

                    
                    Font fontOrden = new Font("Courier New", 12, FontStyle.Bold); 
                    Font fontTitle = new Font("Courier New", 13, FontStyle.Italic);
                    Font fontFecha = new Font("Courier New", 09, FontStyle.Italic);
                    Font fontBody = new Font("Courier New", 12, FontStyle.Bold);
                    Font fontPromo = new Font("Courier New", 12, FontStyle.Italic);
                    Font fontDetalle = new Font("Courier New", 12, FontStyle.Bold);

                    g.DrawString("ORDEN : #" + numeroTurno, fontBody, Brushes.Black, margenX, y);
                    y += 30;
                    g.DrawString("--------------------------", fontFecha, Brushes.Black, 0, y);
                    y += 15;

                    g.DrawString("DULCES LIMEÑOS ASTRID", fontTitle, Brushes.Black, margenX, y);
                    y += 20;

                   
                    g.DrawString("FECHA: " + fechaHora, fontFecha, Brushes.Black, margenX, y);
                    y += 20;

                    g.DrawString("--------------------------", fontFecha, Brushes.Black, 0, y);
                    y += 15;

                    g.DrawString("DETALLE DEL PEDIDO:", fontFecha, Brushes.Black, margenX, y);
                    y += 20;

                    string[] separadores = new string[] { " + ", "\n", "\r\n" };
                    string[] lineas = venta.Sabor.Split(separadores, StringSplitOptions.RemoveEmptyEntries);

                    foreach (var linea in lineas)
                    {
                        string textoLimpio = linea.Trim().TrimStart('•', '-', ' ').ToUpper();

                        
                        bool esExtra = textoLimpio.Contains("S/");

                       
                        string prefijo = esExtra ? " [+] " : " • ";
                        string textoADibujar = prefijo + textoLimpio;

                        
                        Font fuenteLinea = esExtra ? fontDetalle : fontDetalle;

                        SizeF size = g.MeasureString(textoADibujar, fuenteLinea, (int)anchoTicket);

                        g.DrawString(textoADibujar, fuenteLinea, Brushes.Black,
                                     new RectangleF(margenX, y, anchoTicket, size.Height));

                        y += size.Height + 5; 
                    }

                   
                    y += 5;
                    g.DrawString("--------------------------", fontFecha, Brushes.Black, 0, y);
                    y += 15;

                    
                    g.DrawString("TOTAL A PAGAR: S/ " + venta.Precio.ToString("N2"), fontDetalle, Brushes.Black, margenX, y);
                    y += 30;

                    
                    string metodoTexto = "PAGO CON: " + venta.MetodoPago.ToUpper();
                    g.DrawString(metodoTexto, fontFecha, Brushes.Black, margenX, y); 
                    y += 25;

                    
                    g.DrawString("¡GRACIAS POR SU COMPRA!", fontFecha, Brushes.Black, margenX, y);

                    
                    y += 50;
                    g.DrawString(".", fontBody, Brushes.Transparent, 0, y);

                    e.HasMorePages = false;
                
            };

                _ = Task.Run(() =>
                {
                    try
                    {
                        pd.Print();
                        
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("ERROR DE IMPRESORA: " + ex.Message);
                    }
                });

              
                return Ok(new
                {
                    success = true,
                    turno = numeroTurno,
                    mensaje = "Venta registrada. Imprimiendo..."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, mensaje = "Error en BD: " + ex.Message });
            }
        }
    }
}
