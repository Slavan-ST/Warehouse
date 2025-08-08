using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using WarehouseAPI.Data;
using WarehouseAPI.Services;
using WarehouseAPI.Mapping;

namespace WarehouseAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "Warehouse API",
                        Version = "v1",
                        Description = "API управления складом",
                        Contact = new OpenApiContact
                        {
                            Name = "Slavan",
                            Email = "support@yourcompany.com"
                        }
                    });

                    c.UseInlineDefinitionsForEnums();
                });

                builder.Services.AddCors(options =>
                {
                    options.AddPolicy("AllowAll", policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
                });

                builder.Services
                    .AddControllers()
                    .AddJsonOptions(options =>
                    {
                        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                        options.JsonSerializerOptions.Encoder =
                            System.Text.Encodings.Web.JavaScriptEncoder.Create(System.Text.Unicode.UnicodeRanges.All);
                    });

                builder.Services.AddAutoMapper(typeof(MappingProfile));

                builder.Services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

                builder.Services.AddScoped<ResourceService>();
                builder.Services.AddScoped<UnitOfMeasureService>();
                builder.Services.AddScoped<ClientService>();
                builder.Services.AddScoped<ReceiptDocumentService>();
                builder.Services.AddScoped<ShipmentDocumentService>();
                builder.Services.AddScoped<BalanceService>();

                var app = builder.Build();

                app.UseCors("AllowAll");

                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Warehouse API v1");
                    c.RoutePrefix = "api-docs";
                    c.DisplayOperationId();
                    c.DisplayRequestDuration();
                });

                // Безопасный запуск миграций
                try
                {
                    using var scope = app.Services.CreateScope();
                    var services = scope.ServiceProvider;
                    var context = services.GetRequiredService<AppDbContext>();
                    context.Database.Migrate();
                    Console.WriteLine("Миграции успешно применены.");
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Ошибка при применении миграций:");
                    Console.ResetColor();
                    Console.WriteLine(ex);
                }

                app.UseAuthorization();

                app.MapControllers();

                app.Run();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Критическая ошибка при запуске API:");
                Console.ResetColor();
                Console.WriteLine(ex);
            }
        }
    }
}
