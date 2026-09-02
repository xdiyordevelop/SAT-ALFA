const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/mock-tests/import/route.ts', 'utf8');

const newGet = `
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json([], { status: 401 });
    
    const tests = await prisma.sATMockTest.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true,
        questions: { select: { module: true } }
      }
    });
    
    const formatted = tests.map(t => ({
      id: t.id,
      name: t.name,
      modules: Array.from(new Set(t.questions.map(q => q.module)))
    }));
    
    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}
`;

code = code.replace(/export async function GET[\s\S]*?\} catch \(err\) \{[\s\S]*?\}\n\}/, newGet.trim());
fs.writeFileSync('src/app/api/admin/mock-tests/import/route.ts', code);
