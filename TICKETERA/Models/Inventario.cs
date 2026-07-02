using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TICKETERA.Models
{
    public class Inventario
    {
        [Key]
        public int Id { get; set; }

        public int ProductoId { get; set; }
        public Producto Producto { get; set; }

        public int StockInicial { get; set; }

        public int StockFinal { get; set; }

        // Avisamos que SQL Server calcula esta columna (StockInicial - StockFinal)
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public int Vendido { get; private set; }

        public decimal PrecioUnitario { get; set; }

        // Avisamos que SQL Server calcula esta columna (Vendido * PrecioUnitario)
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal MontoTotal { get; private set; }

        public DateTime Fecha { get; set; }
    }
}