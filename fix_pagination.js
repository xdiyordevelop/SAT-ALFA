const fs = require('fs');

let tableCode = fs.readFileSync('src/app/admin/mock-tests/analytics/components/AttemptHistoryTable.tsx', 'utf8');

// Add current page state
tableCode = tableCode.replace(/const \[sortOrder, setSortOrder\] = useState<SortOrder>\('desc'\)/, "const [sortOrder, setSortOrder] = useState<SortOrder>('desc')\n const [currentPage, setCurrentPage] = useState(1)\n const itemsPerPage = 15;");

// Reset page on sort
tableCode = tableCode.replace(/setSortOrder\('desc'\)\n\s*\}/, "setSortOrder('desc')\n    }\n    setCurrentPage(1)");

// Slice sorted attempts
tableCode = tableCode.replace(/const sortedAttempts = \[\.\.\.attempts\]\.sort/g, "const sortedAttemptsAll = [...attempts].sort");
tableCode = tableCode.replace(/<\/table>/g, `</table>
      
      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, attempts.length)} to {Math.min(currentPage * itemsPerPage, attempts.length)} of {attempts.length} attempts
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(attempts.length / itemsPerPage), p + 1))}
            disabled={currentPage >= Math.ceil(attempts.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>`);

// Change map iteration from sortedAttempts to paginated
tableCode = tableCode.replace(/sortedAttempts\.map\(/, "sortedAttemptsAll.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(");

fs.writeFileSync('src/app/admin/mock-tests/analytics/components/AttemptHistoryTable.tsx', tableCode);
