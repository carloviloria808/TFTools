using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddChampionStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChampionStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Health1 = table.Column<int>(type: "int", nullable: false),
                    Health2 = table.Column<int>(type: "int", nullable: false),
                    Health3 = table.Column<int>(type: "int", nullable: false),
                    Armor = table.Column<int>(type: "int", nullable: false),
                    Damage1 = table.Column<int>(type: "int", nullable: false),
                    Damage2 = table.Column<int>(type: "int", nullable: false),
                    Damage3 = table.Column<int>(type: "int", nullable: false),
                    AttackSpeed = table.Column<double>(type: "float", nullable: false),
                    DPS1 = table.Column<int>(type: "int", nullable: false),
                    DPS2 = table.Column<int>(type: "int", nullable: false),
                    DPS3 = table.Column<int>(type: "int", nullable: false),
                    StartingMana = table.Column<int>(type: "int", nullable: false),
                    TotalMana = table.Column<int>(type: "int", nullable: false),
                    MR = table.Column<int>(type: "int", nullable: false),
                    Range = table.Column<int>(type: "int", nullable: false),
                    ChampionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChampionStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChampionStats_Champions_ChampionId",
                        column: x => x.ChampionId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChampionStats_ChampionId",
                table: "ChampionStats",
                column: "ChampionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChampionStats");
        }
    }
}
