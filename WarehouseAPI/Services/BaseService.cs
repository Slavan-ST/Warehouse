using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using WarehouseAPI.Data;

namespace WarehouseAPI.Services
{
    public abstract class BaseService<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly ILogger _logger;
        public IQueryable<T> Query() => _context.Set<T>();

        public BaseService(AppDbContext context, ILogger logger)
        {
            _context = context;
            _logger = logger;
        }

        protected async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await _context.Set<T>().AnyAsync(predicate);
        }

        protected async Task<bool> IsUsedInRelationships(int id, params IQueryable<object>[] relationshipQueries)
        {
            foreach (var query in relationshipQueries)
            {
                if (await query.AnyAsync())
                    return true;
            }
            return false;
        }
    }
}
