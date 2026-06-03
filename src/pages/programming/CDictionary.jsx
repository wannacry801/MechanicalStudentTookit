import { useState } from 'react';

export default function CDictionary() {
  const [activeCategory, setActiveCategory] = useState('data_types');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const dictionaryData = {
    data_types: [
      { cmd: 'int', desc: 'เก็บจำนวนเต็ม (Integer)', syntax: 'int age = 25;', size: '4 bytes', range: '-2,147,483,648 ถึง 2,147,483,647' },
      { cmd: 'float', desc: 'เก็บตัวเลขทศนิยม (ความละเอียด 6 ตำแหน่ง)', syntax: 'float pi = 3.14159f;', size: '4 bytes', range: '±3.4 × 10^-38 to 10^38' },
      { cmd: 'double', desc: 'เก็บตัวเลขทศนิยมความละเอียดสูง (15 ตำแหน่ง)', syntax: 'double value = 0.123456789;', size: '8 bytes', range: '±1.7 × 10^-308 to 10^308' },
      { cmd: 'char', desc: 'เก็บตัวอักษรเดี่ยวหรือรหัส ASCII', syntax: 'char grade = \'A\';', size: '1 byte', range: '-128 ถึง 127' },
      { cmd: 'unsigned int', desc: 'จำนวนเต็มบวกเท่านั้น', syntax: 'unsigned int count = 100;', size: '4 bytes', range: '0 ถึง 4,294,967,295' }
    ],
    operators: [
      { cmd: '+, -, *, /', desc: 'ตัวดำเนินการทางคณิตศาสตร์', syntax: 'int result = a + b;\nint product = a * b;', size: 'N/A', range: 'N/A' },
      { cmd: '%', desc: 'เศษจากการหาร (Modulo)', syntax: 'int remainder = 10 % 3; // result = 1', size: 'N/A', range: 'N/A' },
      { cmd: '==, !=, <, >, <=, >=', desc: 'ตัวดำเนินการเปรียบเทียบ', syntax: 'if (x == y) { printf("Equal"); }', size: 'N/A', range: 'N/A' },
      { cmd: '&&, ||, !', desc: 'ตัวดำเนินการตรรมชาติ (AND, OR, NOT)', syntax: 'if (x > 0 && x < 10) { // code }', size: 'N/A', range: 'N/A' },
      { cmd: '++, --', desc: 'เพิ่มหรือลดค่าตัวแปรทีละ 1', syntax: 'i++; // หรือ ++i;\nj--;', size: 'N/A', range: 'N/A' }
    ],
    control_flow: [
      { cmd: 'if / else', desc: 'ตรวจสอบเงื่อนไขและทำงานแตกต่างกัน', syntax: 'if (x > 0) {\n  printf("Positive");\n} else if (x < 0) {\n  printf("Negative");\n} else {\n  printf("Zero");\n}', size: 'N/A', range: 'N/A' },
      { cmd: 'switch', desc: 'เลือกทำงานตามค่าของตัวแปร (ใช้ในเมนู)', syntax: 'switch(choice) {\n  case 1:\n    printf("Option 1");\n    break;\n  default:\n    printf("Invalid");\n}', size: 'N/A', range: 'N/A' },
      { cmd: 'ternary (?:)', desc: 'สั้น if-else ที่เขียนในบรรทัดเดียว', syntax: 'int max = (a > b) ? a : b;', size: 'N/A', range: 'N/A' }
    ],
    loops: [
      { cmd: 'for', desc: 'วนลูปด้วยจำนวนรอบที่รู้แน่นอน', syntax: 'for (int i = 0; i < 10; i++) {\n  printf("%d\\n", i);\n}', size: 'N/A', range: 'N/A' },
      { cmd: 'while', desc: 'วนลูปตราบใดที่เงื่อนไขเป็นจริง', syntax: 'while (x > 0) {\n  printf("%d\\n", x);\n  x--;\n}', size: 'N/A', range: 'N/A' },
      { cmd: 'do-while', desc: 'ทำงานอย่างน้อย 1 ครั้ง แล้วตรวจเงื่อนไข', syntax: 'do {\n  printf("Enter: ");\n  scanf("%d", &x);\n} while (x < 0);', size: 'N/A', range: 'N/A' },
      { cmd: 'break, continue', desc: 'ออกจากลูป หรือข้ามไปรอบถัดไป', syntax: 'for (int i = 0; i < 10; i++) {\n  if (i == 5) break;\n  if (i == 2) continue;\n}', size: 'N/A', range: 'N/A' }
    ],
    io_functions: [
      { cmd: 'printf()', desc: 'แสดงผลข้อมูลออกทางหน้าจอ', syntax: 'printf("Name: %s, Age: %d\\n", name, age);', size: '<stdio.h>', range: 'N/A' },
      { cmd: 'scanf()', desc: 'รับค่าจากคีย์บอร์ด (⚠️ จำ &)', syntax: 'scanf("%d %s", &age, name);', size: '<stdio.h>', range: 'N/A' },
      { cmd: 'getchar(), putchar()', desc: 'รับและแสดงตัวอักษรเดี่ยว', syntax: 'char c = getchar();\nputchar(c);', size: '<stdio.h>', range: 'N/A' },
      { cmd: 'gets(), puts()', desc: 'รับและแสดงสตริง (⚠️ gets ไม่ปลอดภัย)', syntax: 'puts("Hello, World!");', size: '<stdio.h>', range: 'N/A' }
    ],
    arrays_strings: [
      { cmd: 'array[]', desc: 'เก็บข้อมูลหลายตัวในตัวแปรเดียว', syntax: 'int arr[5] = {1, 2, 3, 4, 5};\nint val = arr[0]; // 1', size: 'ขึ้นอยู่กับ type', range: 'N/A' },
      { cmd: 'char string[]', desc: 'เก็บข้อความ (สตริง)', syntax: 'char name[20] = "Arduino";\nprintf("%s\\n", name);', size: 'N/A', range: 'N/A' },
      { cmd: 'strlen()', desc: 'หาความยาวของสตริง', syntax: 'int len = strlen("Hello"); // 5', size: '<string.h>', range: 'N/A' },
      { cmd: 'strcpy(), strcat()', desc: 'คัดลอกและต่อสตริง', syntax: 'strcpy(dest, src);\nstrcat(str1, str2);', size: '<string.h>', range: 'N/A' }
    ],
    pointers: [
      { cmd: '&', desc: 'ตัวดำเนินการ address-of (หาที่อยู่ของตัวแปร)', syntax: 'int x = 10;\nint *ptr = &x;', size: 'N/A', range: 'N/A' },
      { cmd: '*', desc: 'ตัวดำเนินการ dereference (ไปถึงค่าที่ pointer ชี้ไป)', syntax: 'printf("%d\\n", *ptr); // ได้ 10', size: 'N/A', range: 'N/A' },
      { cmd: 'pointer', desc: 'ตัวแปรที่เก็บที่อยู่หน่วยความจำ', syntax: 'int *ptr = NULL;\nint arr[5];\nint *p = arr; // ชี้ไปยัง arr[0]', size: '4/8 bytes', range: 'N/A' }
    ],
    functions: [
      { cmd: 'void function()', desc: 'สร้างฟังก์ชันที่ไม่คืนค่า', syntax: 'void greet() {\n  printf("Hello!\\n");\n}\ngreet();', size: 'N/A', range: 'N/A' },
      { cmd: 'int function()', desc: 'สร้างฟังก์ชันที่คืนค่า', syntax: 'int add(int a, int b) {\n  return a + b;\n}\nint sum = add(5, 3);', size: 'N/A', range: 'N/A' },
      { cmd: 'main()', desc: 'ฟังก์ชันหลักของโปรแกรม (จุดเริ่มต้น)', syntax: 'int main() {\n  printf("Start");\n  return 0;\n}', size: 'N/A', range: 'N/A' }
    ],
    memory: [
      { cmd: 'malloc()', desc: 'จองพื้นที่หน่วยความจำแบบ dynamic', syntax: 'int *arr = (int*)malloc(10 * sizeof(int));\n// ใช้งาน\nfree(arr);', size: '<stdlib.h>', range: 'N/A' },
      { cmd: 'free()', desc: 'ปล่อยพื้นที่หน่วยความจำที่จองไว้', syntax: 'free(ptr);\nptr = NULL;', size: '<stdlib.h>', range: 'N/A' },
      { cmd: 'sizeof()', desc: 'หาขนาด (bytes) ของ type หรือตัวแปร', syntax: 'int size = sizeof(int); // 4\nint arr_size = sizeof(arr) / sizeof(arr[0]);', size: 'N/A', range: 'N/A' }
    ],
    format_specifiers: [
      { cmd: '%d, %i', desc: 'จำนวนเต็ม (Decimal Integer)', syntax: 'printf("%d\\n", 42);', size: 'N/A', range: 'N/A' },
      { cmd: '%f, %lf', desc: 'จำนวนทศนิยม (Float/Double)', syntax: 'printf("%.2f\\n", 3.14159); // 3.14', size: 'N/A', range: 'N/A' },
      { cmd: '%s', desc: 'สตริง (String)', syntax: 'printf("%s\\n", "Hello");', size: 'N/A', range: 'N/A' },
      { cmd: '%c', desc: 'ตัวอักษร (Character)', syntax: 'printf("%c\\n", \'A\');', size: 'N/A', range: 'N/A' },
      { cmd: '%x, %X', desc: 'เลขฐาน 16 (Hexadecimal)', syntax: 'printf("%x\\n", 255); // ff', size: 'N/A', range: 'N/A' },
      { cmd: '%p', desc: 'ที่อยู่หน่วยความจำ (Pointer)', syntax: 'printf("%p\\n", &x);', size: 'N/A', range: 'N/A' }
    ],
    libraries: [
      { cmd: '#include <stdio.h>', desc: 'I/O - printf, scanf, getchar, putchar', syntax: '#include <stdio.h>\nprintf("Hello");', size: 'Standard Library', range: 'N/A' },
      { cmd: '#include <stdlib.h>', desc: 'Standard Library - malloc, free, rand, exit', syntax: '#include <stdlib.h>\nint *ptr = malloc(100);', size: 'Standard Library', range: 'N/A' },
      { cmd: '#include <string.h>', desc: 'String - strlen, strcpy, strcat, strcmp', syntax: '#include <string.h>\nint len = strlen("test");', size: 'Standard Library', range: 'N/A' },
      { cmd: '#include <math.h>', desc: 'Math - sin, cos, sqrt, pow, abs', syntax: '#include <math.h>\ndouble x = sqrt(16.0); // 4.0', size: 'Standard Library', range: 'N/A' }
    ]
  };

  const allItems = Object.keys(dictionaryData).flatMap(cat => dictionaryData[cat]);
  const filteredItems = searchQuery.trim() !== ''
    ? allItems.filter(item => 
        item.cmd.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dictionaryData[activeCategory];

  const categories = [
    { key: 'data_types', label: 'Data Types' },
    { key: 'operators', label: 'Operators' },
    { key: 'control_flow', label: 'Control Flow' },
    { key: 'loops', label: 'Loops' },
    { key: 'io_functions', label: 'I/O Functions' },
    { key: 'arrays_strings', label: 'Arrays & Strings' },
    { key: 'pointers', label: 'Pointers' },
    { key: 'functions', label: 'Functions' },
    { key: 'memory', label: 'Memory' },
    { key: 'format_specifiers', label: 'Format Specifiers' },
    { key: 'libraries', label: 'Libraries' }
  ];

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const headerStyle = {
    padding: 16,
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 4,
  };

  const subtitleStyle = {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  };

  const searchInputStyle = {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #374151',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#60a5fa',
    fontSize: 13,
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: 6,
    background: '#111827',
    padding: 6,
    borderRadius: 14,
    border: '1px solid #1f2937',
    overflowX: 'auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const tabButtonStyle = (isActive) => ({
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  });

  const cardStyle = {
    padding: 14,
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 12,
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  const cmdLabelStyle = {
    display: 'inline-block',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'monospace',
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(16,185,129,0.2)',
    width: 'fit-content',
  };

  const descStyle = {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 1.4,
  };

  const codeBlockStyle = {
    background: '#0d1117',
    border: '1px solid #1f2937',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#9ca3af',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    position: 'relative',
  };

  const copyButtonStyle = (isCopied) => ({
    position: 'absolute',
    top: 6,
    right: 6,
    padding: '4px 8px',
    fontSize: 10,
    background: isCopied ? '#10b981' : '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  });

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  };

  return (
    <div style={containerStyle}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={titleStyle}>📚 C Language Dictionary</div>
        <div style={subtitleStyle}>Complete Reference for Embedded & Mechanical Engineering</div>
        <input
          type="text"
          placeholder="🔍 Search (e.g. printf, malloc, for)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...searchInputStyle, marginTop: 12 }}
        />
      </div>

      {/* TABS */}
      {searchQuery.trim() === '' && (
        <div style={tabsContainerStyle}>
          {categories.map(cat => (
            <button
              key={cat.key}
              style={tabButtonStyle(activeCategory === cat.key)}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filteredItems.map((item, idx) => (
          <div key={idx} style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1f2937'}>
            
            <div style={cmdLabelStyle}>{item.cmd}</div>
            
            <div style={descStyle}>{item.desc}</div>
            
            <div style={metaStyle}>
              <span>Header: {item.size}</span>
              <span>{item.range}</span>
            </div>

            <div style={codeBlockStyle}>
              <button
                style={copyButtonStyle(copiedIndex === idx)}
                onClick={() => copyToClipboard(item.syntax, idx)}
              >
                {copiedIndex === idx ? '✓ Copied' : 'Copy'}
              </button>
              {item.syntax}
            </div>

          </div>
        ))}

        {filteredItems.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#6b7280', fontSize: 13, fontStyle: 'italic' }}>
            No results found for "{searchQuery}"
          </div>
        )}
      </div>

    </div>
  );
}