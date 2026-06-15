using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTraitsItemsCompositions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Compositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PatchVersion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsConditional = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compositions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsComponent = table.Column<bool>(type: "bit", nullable: false),
                    Component1Id = table.Column<int>(type: "int", nullable: true),
                    Component2Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Items_Items_Component1Id",
                        column: x => x.Component1Id,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Items_Items_Component2Id",
                        column: x => x.Component2Id,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Traits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Traits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChampionComposition",
                columns: table => new
                {
                    ChampionsId = table.Column<int>(type: "int", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "ChampionTrait",
                columns: table => new
                {
                    ChampionsId = table.Column<int>(type: "int", nullable: false),
                    TraitsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChampionTrait", x => new { x.ChampionsId, x.TraitsId });
                    table.ForeignKey(
                        name: "FK_ChampionTrait_Champions_ChampionsId",
                        column: x => x.ChampionsId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChampionTrait_Traits_TraitsId",
                        column: x => x.TraitsId,
                        principalTable: "Traits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChampionComposition_CompositionsId",
                table: "ChampionComposition",
                column: "CompositionsId");

            migrationBuilder.CreateIndex(
                name: "IX_ChampionTrait_TraitsId",
                table: "ChampionTrait",
                column: "TraitsId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_Component1Id",
                table: "Items",
                column: "Component1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Items_Component2Id",
                table: "Items",
                column: "Component2Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChampionComposition");

            migrationBuilder.DropTable(
                name: "ChampionTrait");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Compositions");

            migrationBuilder.DropTable(
                name: "Traits");
        }
    }
}
