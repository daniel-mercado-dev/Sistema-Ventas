namespace PosAstrid.Domain.Ventas;

public class Venta
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime Fecha { get; private set; } = DateTime.UtcNow;
    public string MetodoPago { get; private set; } = string.Empty;

    public decimal MontoTotal { get; private set; }
    
    private readonly List<VentaDetalle> _detalles = new();
    public IReadOnlyCollection<VentaDetalle> Detalles => _detalles.AsReadOnly();

    public Venta() { }

    public Venta(string metodoPago)
    {
        MetodoPago = metodoPago;
    }
}

public class VentaDetalle
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid VentaId { get; private set; }
    public string ProductoNombre { get; private set; } = string.Empty;
    public decimal PrecioUnitario { get; private set; }
    public int Cantidad { get; private set; }
    public decimal Subtotal => PrecioUnitario * Cantidad;

    public VentaDetalle() { }
}