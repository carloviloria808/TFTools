using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositionChampions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove the old simple many-to-many join table
            migrationBuilder.DropTable(
                name: "ChampionComposition");

            // Add new detail fields to Compositions
            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Compositions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Playstyle",
                table: "Compositions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tips",
                table: "Compositions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Create CompositionChampions join table (with position + carry flag)
            migrationBuilder.CreateTable(
                name: "CompositionChampions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompositionId = table.Column<int>(type: "int", nullable: false),
                    ChampionId = table.Column<int>(type: "int", nullable: false),
                    Row = table.Column<int>(type: "int", nullable: false),
                    Col = table.Column<int>(type: "int", nullable: false),
                    IsCarry = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompositionChampions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompositionChampions_Champions_ChampionId",
                        column: x => x.ChampionId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompositionChampions_Compositions_CompositionId",
                        column: x => x.CompositionId,
                        principalTable: "Compositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create CompositionChampionItems (items per champion slot)
            migrationBuilder.CreateTable(
                name: "CompositionChampionItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompositionChampionId = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    SlotIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompositionChampionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompositionChampionItems_CompositionChampions_CompositionChampionId",
                        column: x => x.CompositionChampionId,
                        principalTable: "CompositionChampions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompositionChampionItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompositionChampionItems_CompositionChampionId",
                table: "CompositionChampionItems",
                column: "CompositionChampionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompositionChampionItems_ItemId",
                table: "CompositionChampionItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_CompositionChampions_ChampionId",
                table: "CompositionChampions",
                column: "ChampionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompositionChampions_CompositionId",
                table: "CompositionChampions",
                column: "CompositionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CompositionChampionItems");
            migrationBuilder.DropTable(name: "CompositionChampions");

            migrationBuilder.DropColumn(name: "Difficulty",  table: "Compositions");
            migrationBuilder.DropColumn(name: "Playstyle",   table: "Compositions");
            migrationBuilder.DropColumn(name: "Tips",        table: "Compositions");

            migrationBuilder.CreateTable(
                name: "ChampionComposition",
                columns: table => new
                {
                    ChampionsId    = table.Column<int>(type: "int", nullable: false),
                    CompositionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChampionComposition", x => new { x.ChampionsId, x.CompositionsId });
                    table.ForeignKey(
                        name: "FK_ChampionComposition_Champions_ChampionsId",
                        column: x => x.ChampionsId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChampionComposition_Compositions_CompositionsId",
                        column: x => x.CompositionsId,
                        principalTable: "Compositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChampionComposition_CompositionsId",
                table: "ChampionComposition",
                column: "CompositionsId");
        }
    }
}
