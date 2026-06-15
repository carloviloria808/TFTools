using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Registers the DbContext and tells it to use SQL Server with the connection string
builder.Services.AddDbContext<TFToolsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Allows the React frontend to communicate with this API without being blocked
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Default React/Vite port
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

// ── Run composition seed on startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<TFToolsDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await TFTools.API.Data.SeedService.SeedCompositionsAsync(db, logger);
}

// Only show the API docs page when running locally, not in production

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Must be placed BEFORE UseAuthorization - order matters in ASP.NET!
app.UseCors("AllowReactApp");

app.UseAuthorization();

// This activates all your Controllers automatically
app.MapControllers();

app.Run();
