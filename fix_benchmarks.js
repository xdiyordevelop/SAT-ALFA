const fs = require('fs');

let code = fs.readFileSync('src/app/admin/mock-tests/analytics/components/PerformanceBenchmarks.tsx', 'utf8');

// Add LineChart imports
code = code.replace(/PieChart,/g, 'PieChart,\n LineChart,\n Line,');

// Replace Average Scores Card (lg:col-span-2) with Completions Over Time
const completionsHtml = `
      {/* Completions Over Time */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 lg:col-span-2">
        <h3 className="text-lg font-bold text-yellow-400 mb-6">Completions Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.completionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Average Scores */}
`;

code = code.replace(/\{\/\* Average Scores \*\/\}/, completionsHtml);

fs.writeFileSync('src/app/admin/mock-tests/analytics/components/PerformanceBenchmarks.tsx', code);
