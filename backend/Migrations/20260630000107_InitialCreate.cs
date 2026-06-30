using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TFTools.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Augments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    TierRating = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Augments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Champions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Cost = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Champions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompositionChangeLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompositionId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: true),
                    ChangeType = table.Column<string>(type: "text", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompositionChangeLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Compositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    PatchVersion = table.Column<string>(type: "text", nullable: false),
                    IsConditional = table.Column<bool>(type: "boolean", nullable: false),
                    CarryImageUrl = table.Column<string>(type: "text", nullable: false),
                    Playstyle = table.Column<string>(type: "text", nullable: false),
                    Difficulty = table.Column<string>(type: "text", nullable: false),
                    Tips = table.Column<string>(type: "text", nullable: false),
                    Augments = table.Column<string>(type: "text", nullable: true),
                    ItemPriority = table.Column<string>(type: "text", nullable: true),
                    EarlyUnits = table.Column<string>(type: "text", nullable: true),
                    Gods = table.Column<string>(type: "text", nullable: true),
                    StageGuide = table.Column<string>(type: "text", nullable: true),
                    Trend = table.Column<string>(type: "text", nullable: true),
                    Top4Rate = table.Column<double>(type: "double precision", nullable: true),
                    WinRate = table.Column<double>(type: "double precision", nullable: true),
                    PlayRate = table.Column<double>(type: "double precision", nullable: true),
                    AvgPlacement = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compositions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Gods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Specialty = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    IsComponent = table.Column<bool>(type: "boolean", nullable: false),
                    Component1Id = table.Column<int>(type: "integer", nullable: true),
                    Component2Id = table.Column<int>(type: "integer", nullable: true),
                    TierRating = table.Column<string>(type: "text", nullable: false)
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
                name: "Settings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "TierListSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatchVersion = table.Column<string>(type: "text", nullable: false),
                    Data = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TierListSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Traits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Traits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChampionAbilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    ChampionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChampionAbilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChampionAbilities_Champions_ChampionId",
                        column: x => x.ChampionId,
                        principalTable: "Champions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChampionStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Health1 = table.Column<int>(type: "integer", nullable: false),
                    Health2 = table.Column<int>(type: "integer", nullable: false),
                    Health3 = table.Column<int>(type: "integer", nullable: false),
                    Armor = table.Column<int>(type: "integer", nullable: false),
                    Damage1 = table.Column<int>(type: "integer", nullable: false),
                    Damage2 = table.Column<int>(type: "integer", nullable: false),
                    Damage3 = table.Column<int>(type: "integer", nullable: false),
                    AttackSpeed = table.Column<double>(type: "double precision", nullable: false),
                    DPS1 = table.Column<int>(type: "integer", nullable: false),
                    DPS2 = table.Column<int>(type: "integer", nullable: false),
                    DPS3 = table.Column<int>(type: "integer", nullable: false),
                    StartingMana = table.Column<int>(type: "integer", nullable: false),
                    TotalMana = table.Column<int>(type: "integer", nullable: false),
                    MR = table.Column<int>(type: "integer", nullable: false),
                    Range = table.Column<int>(type: "integer", nullable: false),
                    ChampionId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "CompositionChampions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompositionId = table.Column<int>(type: "integer", nullable: false),
                    ChampionId = table.Column<int>(type: "integer", nullable: false),
                    Row = table.Column<int>(type: "integer", nullable: false),
                    Col = table.Column<int>(type: "integer", nullable: false),
                    IsCarry = table.Column<bool>(type: "boolean", nullable: false),
                    StarLevel = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "GodOfferings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Stage = table.Column<string>(type: "text", nullable: false),
                    Offerings = table.Column<string>(type: "text", nullable: false),
                    GodId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "ChampionRecommendedItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    ChampionId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "ChampionTrait",
                columns: table => new
                {
                    ChampionsId = table.Column<int>(type: "integer", nullable: false),
                    TraitsId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "TraitBreakpoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UnitsRequired = table.Column<int>(type: "integer", nullable: false),
                    Bonus = table.Column<string>(type: "text", nullable: false),
                    TraitId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "CompositionChampionItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompositionChampionId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    SlotIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompositionChampionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompositionChampionItems_CompositionChampions_CompositionCh~",
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
                name: "IX_ChampionAbilities_ChampionId",
                table: "ChampionAbilities",
                column: "ChampionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChampionRecommendedItems_ChampionId",
                table: "ChampionRecommendedItems",
                column: "ChampionId");

            migrationBuilder.CreateIndex(
                name: "IX_ChampionRecommendedItems_ItemId",
                table: "ChampionRecommendedItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ChampionStats_ChampionId",
                table: "ChampionStats",
                column: "ChampionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChampionTrait_TraitsId",
                table: "ChampionTrait",
                column: "TraitsId");

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

            migrationBuilder.CreateIndex(
                name: "IX_GodOfferings_GodId",
                table: "GodOfferings",
                column: "GodId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_Component1Id",
                table: "Items",
                column: "Component1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Items_Component2Id",
                table: "Items",
                column: "Component2Id");

            migrationBuilder.CreateIndex(
                name: "IX_TraitBreakpoints_TraitId",
                table: "TraitBreakpoints",
                column: "TraitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Augments");

            migrationBuilder.DropTable(
                name: "ChampionAbilities");

            migrationBuilder.DropTable(
                name: "ChampionRecommendedItems");

            migrationBuilder.DropTable(
                name: "ChampionStats");

            migrationBuilder.DropTable(
                name: "ChampionTrait");

            migrationBuilder.DropTable(
                name: "CompositionChampionItems");

            migrationBuilder.DropTable(
                name: "CompositionChangeLogs");

            migrationBuilder.DropTable(
                name: "GodOfferings");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "TierListSnapshots");

            migrationBuilder.DropTable(
                name: "TraitBreakpoints");

            migrationBuilder.DropTable(
                name: "CompositionChampions");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Gods");

            migrationBuilder.DropTable(
                name: "Traits");

            migrationBuilder.DropTable(
                name: "Champions");

            migrationBuilder.DropTable(
                name: "Compositions");
        }
    }
}
