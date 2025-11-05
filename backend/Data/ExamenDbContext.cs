using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ExamenDbContext : DbContext
    {
        public ExamenDbContext(DbContextOptions<ExamenDbContext> options) : base(options) { }

        public DbSet<Participant> Participants { get; set; } = null!;
    }
}
