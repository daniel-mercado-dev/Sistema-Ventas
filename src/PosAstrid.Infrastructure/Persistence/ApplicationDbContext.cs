namespace PosAstrid.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using PosAstrid.Domain.Ventas;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<VentaDetalle> VentasDetalles => Set<VentaDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Venta>(builder =>
        {
            builder.ToTable("Ventas");
            builder.HasKey(v => v.Id);
            builder.Property(v => v.MetodoPago).HasMaxLength(50).IsRequired();
            builder.Property(v => v.MontoTotal).HasPrecision(18, 2);
            builder.HasMany(v => v.Detalles).WithOne().HasForeignKey(d => d.VentaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VentaDetalle>(builder =>
        {
            builder.ToTable("VentasDetalles");
            builder.HasKey(vd => vd.Id);
            builder.Property(vd => vd.ProductoNombre).HasMaxLength(150).IsRequired();
            builder.Property(vd => vd.PrecioUnitario).HasPrecision(18, 2);
        });
    }
}