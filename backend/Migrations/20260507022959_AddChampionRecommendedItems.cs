using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddChampionRecommendedItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChampionRecommendedItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ChampionId = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChampionRecommendedItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChampionRecommendedItems_Champions_ChampionId",
                        column: x => x.ChampionId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChampionRecommendedItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChampionRecommendedItems_ChampionId",
                table: "ChampionRecommendedItems",
                column: "ChampionId");

            migrationBuilder.CreateIndex(
                name: "IX_ChampionRecommendedItems_ItemId",
                table: "ChampionRecommendedItems",
                column: "ItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChampionRecommendedItems");
        }
    }
}
