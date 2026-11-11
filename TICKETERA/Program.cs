using Microsoft.EntityFrameworkCore;
using TICKETERA.Data;
using TICKETERA.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS SEPARADO Y LIMPIO 

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// Registro del servicio UNA sola vez , fuera del bloque CORS
builder.Services.AddScoped<TicketPrintingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TICKETERA API v1");
    c.RoutePrefix = string.Empty; // Opcional: hace que Swagger abra directamente en la raíz de la URL
});


app.UseAuthorization();
app.UseDefaultFiles(); // Para que busque el index.html autom�ticamente
app.UseStaticFiles();  // Para que permita ver archivos en wwwroot
app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();
app.Run();

builder.WebHost.UseUrls("http://0.0.0.0:7000");