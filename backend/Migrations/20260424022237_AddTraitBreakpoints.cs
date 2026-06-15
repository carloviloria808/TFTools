using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTraitBreakpoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TraitBreakpoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnitsRequired = table.Column<int>(type: "int", nullable: false),
                    Bonus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TraitId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TraitBreakpoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TraitBreakpoints_Traits_TraitId",
                        column: x => x.TraitId,
                        principalTable: "Traits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TraitBreakpoints_TraitId",
                table: "TraitBreakpoints",
                column: "TraitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TraitBreakpoints");
        }
    }
}
