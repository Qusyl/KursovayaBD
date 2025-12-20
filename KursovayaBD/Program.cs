using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services;
using KursovayaBD.Application.Services.IService;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));

   
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
});


// Add services to the container.
builder.Services.AddScoped<RepositoryShop>();
builder.Services.AddScoped<RepositoryWorker>();
builder.Services.AddScoped<RepositorySales>();
builder.Services.AddScoped<RepositoryOwner>();
builder.Services.AddScoped<RepositoryOwnings>();
builder.Services.AddScoped<RepositoryProductAudit>();
builder.Services.AddScoped<RepositoryProduct>();
builder.Services.AddScoped<RepositoryWarehouse>();


builder.Services.AddScoped<ISalesService, SalesDbSevice>();
builder.Services.AddScoped<IWarehouseService, WarehouseDbService>();
builder.Services.AddScoped<IOwnerService,OwnerDbService>();
builder.Services.AddScoped<IWorkerService,WorkerDbService>();

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbcontext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbcontext.Database.Migrate();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
       
    }
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
