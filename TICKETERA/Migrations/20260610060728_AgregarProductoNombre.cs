using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TICKETERA.Migrations
{
    /// <inheritdoc />
    public partial class AgregarProductoNombre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Producto",
                table: "InventarioDiario");

            migrationBuilder.RenameColumn(
                name: "Producto",
                table: "VentasDetalles",
                newName: "ProductoNombre");

            migrationBuilder.AddColumn<int>(
                name: "ProductoId",
                table: "VentasDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductoId",
                table: "InventarioDiario",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrecioBase = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VentasDetalles_ProductoId",
                table: "VentasDetalles",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventarioDiario_ProductoId",
                table: "InventarioDiario",
                column: "ProductoId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventarioDiario_Producto_ProductoId",
                table: "InventarioDiario",
                column: "ProductoId",
                principalTable: "Producto",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_VentasDetalles_Producto_ProductoId",
                table: "VentasDetalles",
                column: "ProductoId",
                principalTable: "Producto",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventarioDiario_Producto_ProductoId",
                table: "InventarioDiario");

            migrationBuilder.DropForeignKey(
                name: "FK_VentasDetalles_Producto_ProductoId",
                table: "VentasDetalles");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropIndex(
                name: "IX_VentasDetalles_ProductoId",
                table: "VentasDetalles");

            migrationBuilder.DropIndex(
                name: "IX_InventarioDiario_ProductoId",
                table: "InventarioDiario");

            migrationBuilder.DropColumn(
                name: "ProductoId",
                table: "VentasDetalles");

            migrationBuilder.DropColumn(
                name: "ProductoId",
                table: "InventarioDiario");

            migrationBuilder.RenameColumn(
                name: "ProductoNombre",
                table: "VentasDetalles",
                newName: "Producto");

            migrationBuilder.AddColumn<string>(
                name: "Producto",
                table: "InventarioDiario",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
