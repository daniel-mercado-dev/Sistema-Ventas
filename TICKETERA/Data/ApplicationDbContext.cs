
using Microsoft.EntityFrameworkCore;
using TICKETERA.Models;

namespace TICKETERA.Data // Cambiado para que coincida con la carpeta Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        // Ventas ahora apunta a VentaCabecera (el modelo nuevo
        public DbSet<VentaCabecera> Ventas { get; set; }    
        public DbSet<VentaDetalle> VentasDetalles { get; set; } 


        // Todavia  no incluyo este paso por ello esta aparte
        public DbSet<Inventario> InventarioDiario { get; set; }
    }
}