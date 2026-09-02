const fs = require('fs');
let code = fs.readFileSync('src/app/admin/mock-tests/import/content.tsx', 'utf8');

code = code.replace(/useState<\{id: string, name: string\}\[\]>\(\[\]\)/, 'useState<{id: string, name: string, modules: string[]}[]>([])');

const modOptions = `
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Module</label>
            <select
              value={targetModule}
              onChange={e => setTargetModule(e.target.value as any)}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
            >
              {(() => {
                const currentTest = existingTests.find(t => t.id === selectedTestId);
                const hasMod = (mod) => currentTest?.modules?.includes(mod);
                return (
                  <>
                    <option value="MODULE_1">Reading & Writing - Module 1 {hasMod('MODULE_1') ? '(Already Exists - Will Replace)' : ''}</option>
                    <option value="MODULE_2">Reading & Writing - Module 2 {hasMod('MODULE_2') ? '(Already Exists - Will Replace)' : ''}</option>
                    <option value="MODULE_3">Math - Module 1 {hasMod('MODULE_3') ? '(Already Exists - Will Replace)' : ''}</option>
                    <option value="MODULE_4">Math - Module 2 {hasMod('MODULE_4') ? '(Already Exists - Will Replace)' : ''}</option>
                  </>
                );
              })()}
            </select>
          </div>
`;

code = code.replace(/<div>\s*<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Module<\/label>[\s\S]*?<\/div>/, modOptions);

fs.writeFileSync('src/app/admin/mock-tests/import/content.tsx', code);
