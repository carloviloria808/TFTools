using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// On Render, DATABASE_URL is a postgres:// URL; locally we use the key-value
// ConnectionStrings:DefaultConnection from appsettings.json.
var databaseUrl = builder.Configuration["DATABASE_URL"];
var connectionString = string.IsNullOrEmpty(databaseUrl)
    ? builder.Configuration.GetConnectionString("DefaultConnection")
    : BuildNpgsqlConnectionString(databaseUrl);

builder.Services.AddDbContext<TFToolsDbContext>(options =>
    options.UseNpgsql(connectionString));

var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Tells the app we'll be using Controllers (like ChampionsController)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // This tells the JSON serializer to ignore circular references
        // instead of looping forever
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Sets up the OpenAPI documentation UI (like Swagger, lets us test endpoints in browser)
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Apply migrations + seed on startup ───────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<TFToolsDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    db.Database.Migrate();
    await TFTools.API.Data.SeedService.SeedCompositionsAsync(db, logger);
}

// Only show the API docs page when running locally, not in production

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Render terminates TLS at its proxy and forwards plain HTTP to the container,
// so only redirect to HTTPS during local development.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Must be placed BEFORE UseAuthorization - order matters in ASP.NET!
app.UseCors("AllowReactApp");

app.UseAuthorization();

// This activates all your Controllers automatically
app.MapControllers();

app.Run();

// Converts a postgres://user:pass@host:port/db URL (Render's format) into the
// key-value connection string Npgsql expects.
static string BuildNpgsqlConnectionString(string databaseUrl)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
    return new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
        Database = uri.AbsolutePath.TrimStart('/'),
        SslMode = Npgsql.SslMode.Require,
    }.ToString();
}
