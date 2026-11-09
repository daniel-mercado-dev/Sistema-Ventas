using Microsoft.EntityFrameworkCore;
using PosAstrid.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Configurar DbContext con la cadena de conexión de appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/", () => "API PosAstrid corriendo en .NET 9");

app.Run();