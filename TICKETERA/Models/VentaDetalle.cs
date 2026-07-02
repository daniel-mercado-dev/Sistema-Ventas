namespace TICKETERA.Models
{
    public class VentaDetalle
    {
        public int Id { get; set; }
        public int VentaCabeceraId { get; set; }
        public VentaCabecera Cabecera { get; set; }

        public int? ProductoId { get; set; }
        public Producto Producto { get; set; }

        public string ProductoNombre { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}
