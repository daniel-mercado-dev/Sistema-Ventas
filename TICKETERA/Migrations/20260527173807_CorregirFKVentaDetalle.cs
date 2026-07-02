using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TICKETERA.Migrations
{
    /// <inheritdoc />
    public partial class CorregirFKVentaDetalle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VentasDetalles_Ventas_CabeceraId",
                table: "VentasDetalles");

            migrationBuilder.DropIndex(
                name: "IX_VentasDetalles_CabeceraId",
                table: "VentasDetalles");

            migrationBuilder.DropColumn(
                name: "CabeceraId",
                table: "VentasDetalles");

            migrationBuilder.RenameColumn(
                name: "VentaId",
                table: "VentasDetalles",
                newName: "VentaCabeceraId");

            migrationBuilder.CreateIndex(
                name: "IX_VentasDetalles_VentaCabeceraId",
                table: "VentasDetalles",
                column: "VentaCabeceraId");

            migrationBuilder.AddForeignKey(
                name: "FK_VentasDetalles_Ventas_VentaCabeceraId",
                table: "VentasDetalles",
                column: "VentaCabeceraId",
                principalTable: "Ventas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VentasDetalles_Ventas_VentaCabeceraId",
                table: "VentasDetalles");

            migrationBuilder.DropIndex(
                name: "IX_VentasDetalles_VentaCabeceraId",
                table: "VentasDetalles");

            migrationBuilder.RenameColumn(
                name: "VentaCabeceraId",
                table: "VentasDetalles",
                newName: "VentaId");

            migrationBuilder.AddColumn<int>(
                name: "CabeceraId",
                table: "VentasDetalles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_VentasDetalles_CabeceraId",
                table: "VentasDetalles",
                column: "CabeceraId");

            migrationBuilder.AddForeignKey(
                name: "FK_VentasDetalles_Ventas_CabeceraId",
                table: "VentasDetalles",
                column: "CabeceraId",
                principalTable: "Ventas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
