using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using WarehouseAPI.Data;
using WarehouseAPI.Services;

namespace WarehouseAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Warehouse API",
                    Version = "v1",
                    Description = "API для управления складом, поступлениями и отгрузками",
                    Contact = new OpenApiContact
                    {
                        Name = "Ваша команда",
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


            builder.Services.AddControllers();

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
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Warehouse API v1");
                    c.RoutePrefix = "api-docs"; // Доступ по /api-docs
                    c.DisplayOperationId();
                    c.DisplayRequestDuration();
                });
            }

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
