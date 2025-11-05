using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);
// Register CORS service so UseCors can resolve ICorsService
builder.Services.AddCors();
// Register DbContext with SQLite provider (database file in backend folder)
var dbPath = System.IO.Path.Combine(builder.Environment.ContentRootPath, "examen.db");
builder.Services.AddDbContext<ExamenDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

// Ensure database is created and seed sample data if empty
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ExamenDbContext>();
    db.Database.EnsureCreated();
    if (!db.Participants.Any())
    {
        db.Participants.AddRange(
            new Participant { Nombre = "Carlos", Apellidos = "Perez", Email = "carlos.perez@example.com", Twitter = "carlosp", Ocupacion = "Estudiante", Avatar = "https://i.pravatar.cc/150?img=3", Acepto = true },
            new Participant { Nombre = "Ana", Apellidos = "Lopez", Email = "ana.lopez@example.com", Twitter = "analo", Ocupacion = "Docente", Avatar = "https://i.pravatar.cc/150?img=5", Acepto = true }
        );
        db.SaveChanges();
    }
    else
    {
        // Update existing participants that still point to an invalid/local avatar (like '/vite.svg')
        var needUpdate = db.Participants.Where(p => string.IsNullOrEmpty(p.Avatar) || p.Avatar.Contains("vite.svg") || p.Avatar.StartsWith("/"));
        foreach (var p in needUpdate)
        {
            // assign deterministic avatar based on id/name to keep it stable
            var seed = Math.Abs((p.Nombre + p.Apellidos).GetHashCode()) % 70 + 1; // pravatar supports several ids
            p.Avatar = $"https://i.pravatar.cc/150?img={seed}";
        }
        if (needUpdate.Any()) db.SaveChanges();
    }
}

app.MapGet("/api/listado", async (ExamenDbContext db, HttpRequest req) =>
{
    var q = req.Query["q"].ToString() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(q))
    {
        var all = await db.Participants.AsNoTracking().ToListAsync();
        return Results.Json(all);
    }
    var filtered = await db.Participants.AsNoTracking()
        .Where(p => (p.Nombre + " " + p.Apellidos).ToLower().Contains(q.ToLower()))
        .ToListAsync();
    return Results.Json(filtered);
});

app.MapGet("/api/participante/{id}", async (int id, ExamenDbContext db) =>
{
    var p = await db.Participants.FindAsync(id);
    return p is not null ? Results.Json(p) : Results.NotFound();
});

app.MapPost("/api/registro", async (Participant input, ExamenDbContext db) =>
{
    db.Participants.Add(input);
    await db.SaveChangesAsync();
    return Results.Created($"/api/participante/{input.Id}", input);
});

app.MapPut("/api/participante/{id}", async (int id, Participant updated, ExamenDbContext db) =>
{
    var p = await db.Participants.FindAsync(id);
    if (p is null) return Results.NotFound();
    // Update allowed fields
    p.Nombre = updated.Nombre;
    p.Apellidos = updated.Apellidos;
    p.Email = updated.Email;
    p.Twitter = updated.Twitter;
    p.Ocupacion = updated.Ocupacion;
    p.Avatar = updated.Avatar;
    p.Acepto = updated.Acepto;
    await db.SaveChangesAsync();
    return Results.Ok(p);
});

app.Run();
