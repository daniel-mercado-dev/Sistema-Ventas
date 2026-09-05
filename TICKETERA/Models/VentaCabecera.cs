namespace TICKETERA.Models
{
    public class VentaCabecera
    {
       
            public int Id { get; set; }
            public DateTime Fecha { get; set; }
            public decimal MontoTotal { get; set; }
            public string MetodoPago { get; set; }
            // Esta es la clave: un ticket tiene muchos detalles
            public List<VentaDetalle> Detalles { get; set; }
        }
    }

// Comentario de prueba