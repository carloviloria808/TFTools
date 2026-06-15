using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositionTrend : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Trend",
                table: "Compositions",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Trend",
                table: "Compositions");
        }
    }
}
