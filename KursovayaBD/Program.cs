using KursovayaBD.Application.Data;
using KursovayaBD.Application.Services;
using KursovayaBD.Application.Services.IService;
using KursovayaBD.Repository.RepositoryImpl;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
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

var jwtsetting = builder.Configuration.GetSection("Jwt");

var key = Encoding.UTF8.GetBytes(jwtsetting["Key"]!);

builder.Services.AddAuthentication(optinons =>
{
    optinons.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    optinons.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtsetting["Issuer"],
            ValidAudience = jwtsetting["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)

        };
    });

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
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
