namespace TICKETERA.Dtos
{
    public class VentaDto
    {
        public string MetodoPago { get; set; }
        // Aquí recibes todos los productos que seleccionó el cliente
        public List<DetalleItemDto> Items { get; set; }
    }

    public class DetalleItemDto
    {
        public string Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal Precio { get; set; }
    }
}
