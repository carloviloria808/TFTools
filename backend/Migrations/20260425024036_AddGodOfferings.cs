using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGodOfferings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Boon",
                table: "Gods");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Gods");

            migrationBuilder.CreateTable(
                name: "GodOfferings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Stage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Offerings = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GodId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GodOfferings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GodOfferings_Gods_GodId",
                        column: x => x.GodId,
                        principalTable: "Gods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GodOfferings_GodId",
                table: "GodOfferings",
                column: "GodId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GodOfferings");

            migrationBuilder.AddColumn<string>(
                name: "Boon",
                table: "Gods",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Gods",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
