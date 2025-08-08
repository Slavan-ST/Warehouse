using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text.Json.Serialization;
using TechTalk.SpecFlow.Assist;
using WarehouseAPI.Data;
using WarehouseAPI.Services;
using AutoMapper;
using WarehouseAPI.Mapping;

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

            if (app.Environment.IsDevelopment())
            {
                //swagger должен быть тут (так как он для разработки), но для удобства проверки АПИ "на проде" вынес отсюда
            }

            app.Use((context, next) =>
            {
                if (context.Request.Path.StartsWithSegments("/swagger"))
                {
                    context.Response.Headers["Content-Type"] = "application/json; charset=utf-8";
                }
                return next();
            });

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Warehouse API v1");
                c.RoutePrefix = "api-docs";
                c.DisplayOperationId();
                c.DisplayRequestDuration();
            });

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>();
                context.Database.Migrate();
            }

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
