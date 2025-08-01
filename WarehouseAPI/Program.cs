using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Services;

namespace WarehouseAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

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

            // Configure the HTTP request pipeline.

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
