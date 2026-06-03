import { useState } from 'react';

export default function PyDictionary() {
  const [activeCategory, setActiveCategory] = useState('data_types');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const dictionaryData = {
    data_types: [
      { cmd: 'int', desc: 'จำนวนเต็ม (สามารถเป็น negative)', syntax: 'age = 25\nspeed = -10', output: '25\n-10', tip: 'ไม่มีขีดจำกัดขนาด' },
      { cmd: 'float', desc: 'ตัวเลขทศนิยม', syntax: 'pi = 3.14159\ntemp = -5.5', output: '3.14159\n-5.5', tip: 'ใช้ 64-bit double precision' },
      { cmd: 'str', desc: 'ข้อความ (String)', syntax: 'name = "Arduino"\nquote = \'single or double\'', output: 'Arduino\nsingle or double', tip: 'ใช้ "" หรือ \'\'' },
      { cmd: 'bool', desc: 'จริง/เท็จ (True/False)', syntax: 'is_active = True\nis_error = False', output: 'True\nFalse', tip: 'Case-sensitive: True != true' },
      { cmd: 'list', desc: 'ลิสต์ (เปลี่ยนแปลงได้)', syntax: 'numbers = [1, 2, 3, 4]\nmixed = [1, "text", 3.14, True]', output: '[1, 2, 3, 4]\n[1, \'text\', 3.14, True]', tip: 'สามารถเก็บ type ต่างๆ ผสมได้' },
      { cmd: 'tuple', desc: 'ทูเพล (ไม่เปลี่ยนแปลงได้)', syntax: 'point = (10, 20)\ncoord = (x, y, z)', output: '(10, 20)\n(x, y, z)', tip: 'เร็วกว่า list เพราะ immutable' },
      { cmd: 'dict', desc: 'พจนานุกรม (Key-Value)', syntax: 'student = {"name": "John", "age": 20}\nprops = {"area": 50, "color": "red"}', output: '{\'name\': \'John\', \'age\': 20}', tip: 'ใช้ key เพื่อเข้าถึง value' },
      { cmd: 'set', desc: 'เซต (ไม่มี duplicate)', syntax: 'colors = {"red", "blue", "green"}\nnums = {1, 2, 3}', output: '{\'red\', \'blue\', \'green\'}\n{1, 2, 3}', tip: 'อันดับไม่แน่นอน, ลบ duplicate' }
    ],
    operators: [
      { cmd: '+, -, *, /', desc: 'ตัวดำเนินการทางคณิตศาสตร์', syntax: 'sum = 10 + 5\ndiff = 10 - 3\nprod = 4 * 3\ndiv = 10 / 3  # 3.333...', output: '15\n7\n12\n3.333...', tip: '/ ได้ float เสมอ' },
      { cmd: '//', desc: 'หารแบบปัดลง (Floor Division)', syntax: 'result = 10 // 3\nneg = -10 // 3', output: '3\n-4', tip: 'คล้าย int(a/b) แต่ต่างกันที่ negative' },
      { cmd: '**', desc: 'ยกกำลัง (Power)', syntax: 'power = 2 ** 3\nsqrt = 16 ** 0.5', output: '8\n4.0', tip: 'ใช้ ** แทน ^ หรือ pow()' },
      { cmd: '%', desc: 'เศษจากการหาร (Modulo)', syntax: 'remainder = 10 % 3\nis_even = num % 2 == 0', output: '1\nTrue (ถ้า num คู่)', tip: 'ใช้ตรวจสอบคี่-คู่' },
      { cmd: '==, !=, <, >, <=, >=', desc: 'ตัวดำเนินการเปรียบเทียบ', syntax: 'x == y\na != b\nx > 5\ntemp <= 100', output: 'True/False', tip: '== เปรียบเทียบค่า, is เปรียบเทียบ object' },
      { cmd: 'and, or, not', desc: 'ตัวดำเนินการตรรมชาติ', syntax: 'if x > 0 and x < 10:\nif x < 0 or x > 100:\nif not is_active:', output: 'True/False', tip: 'ใช้ and, or, not แทน &&, ||, !' }
    ],
    control_flow: [
      { cmd: 'if / elif / else', desc: 'การตรวจสอบเงื่อนไข', syntax: 'if temp > 30:\n  print("Hot")\nelif temp > 20:\n  print("Warm")\nelse:\n  print("Cold")', output: 'Hot/Warm/Cold', tip: '⚠️ Indentation สำคัญ!' },
      { cmd: 'if ... else (One-liner)', desc: 'แบบสั้น Ternary', syntax: 'max_val = a if a > b else b\nstatus = "Pass" if score >= 50 else "Fail"', output: 'ค่าที่มากกว่า/Pass/Fail', tip: 'อ่านจากขวาไปซ้าย' },
      { cmd: 'match (Python 3.10+)', desc: 'เลือกตามเคส', syntax: 'match choice:\n  case 1:\n    print("One")\n  case 2:\n    print("Two")\n  case _:\n    print("Other")', output: 'One/Two/Other', tip: 'ใหม่ใน Python 3.10' }
    ],
    loops: [
      { cmd: 'for', desc: 'วนลูปผ่านลำดับ', syntax: 'for i in range(5):\n  print(i)\n\nfor item in [1, 2, 3]:\n  print(item)', output: '0 1 2 3 4\n1 2 3', tip: 'range(n) = 0 ถึง n-1' },
      { cmd: 'while', desc: 'วนลูปตราบใดที่เงื่อนไขเป็นจริง', syntax: 'x = 0\nwhile x < 5:\n  print(x)\n  x += 1', output: '0 1 2 3 4', tip: '⚠️ ระวัง Infinite loop' },
      { cmd: 'break, continue', desc: 'ออกจาก/ข้ามไปรอบถัดไป', syntax: 'for i in range(10):\n  if i == 5:\n    break\n  if i == 2:\n    continue\n  print(i)', output: '0 1 3 4', tip: 'break=ออก, continue=ข้าม' },
      { cmd: 'enumerate()', desc: 'ได้ index และ value', syntax: 'for idx, val in enumerate(["a", "b", "c"]):\n  print(idx, val)', output: '0 a\n1 b\n2 c', tip: 'สะดวกเมื่อต้อง index' },
      { cmd: 'range()', desc: 'สร้างลำดับเลข', syntax: 'range(5)      # 0-4\nrange(2, 8)   # 2-7\nrange(0, 10, 2) # 0,2,4,6,8', output: '[0,1,2,3,4]\n[2,3,4,5,6,7]\n[0,2,4,6,8]', tip: 'range(start, stop, step)' }
    ],
    string_methods: [
      { cmd: 'len()', desc: 'หาความยาวของสตริง', syntax: 'text = "Python"\nlength = len(text)  # 6', output: '6', tip: 'นับตัวอักษรทั้งหมด' },
      { cmd: 'upper(), lower()', desc: 'เปลี่ยนเป็นตัวใหญ่/เล็ก', syntax: 'text = "hello"\nprint(text.upper())  # HELLO\nprint(text.lower())  # hello', output: 'HELLO\nhello', tip: 'ไม่เปลี่ยนตัวแปรเดิม' },
      { cmd: 'strip()', desc: 'ลบเว้นวรรค (space) ด้านหน้าหลัง', syntax: 'text = "  hello  "\nprint(text.strip())  # "hello"', output: 'hello', tip: 'ใช้กับ input จาก user' },
      { cmd: 'split(), join()', desc: 'แยก/รวมสตริง', syntax: 'text = "a,b,c"\nlist_val = text.split(",")  # ["a", "b", "c"]\nresult = "-".join(list_val)  # "a-b-c"', output: '[\'a\', \'b\', \'c\']\na-b-c', tip: 'split=สตริง→list, join=list→สตริง' },
      { cmd: 'replace()', desc: 'แทนที่ข้อความ', syntax: 'text = "hello world"\nprint(text.replace("world", "python"))  # "hello python"', output: 'hello python', tip: 'ไม่เปลี่ยนตัวแปรเดิม' },
      { cmd: 'f-string (format)', desc: 'เขียนข้อความแบบ format', syntax: 'name = "John"\nage = 25\nprint(f"Name: {name}, Age: {age}")\nprint(f"Result: {3.14159:.2f}")  # 3.14', output: 'Name: John, Age: 25\nResult: 3.14', tip: 'สะดวก ใช้ f"" เพื่อแทรก variable' }
    ],
    list_methods: [
      { cmd: 'append()', desc: 'เพิ่มตัวเดี่ยว', syntax: 'numbers = [1, 2, 3]\nnumbers.append(4)  # [1, 2, 3, 4]', output: '[1, 2, 3, 4]', tip: 'เปลี่ยนลิสต์เดิม' },
      { cmd: 'extend()', desc: 'รวมลิสต์เข้าไป', syntax: 'list1 = [1, 2]\nlist2 = [3, 4]\nlist1.extend(list2)  # [1, 2, 3, 4]', output: '[1, 2, 3, 4]', tip: 'ต่างจาก + ที่ไม่เปลี่ยนเดิม' },
      { cmd: 'insert()', desc: 'เพิ่มที่ตำแหน่งกำหนด', syntax: 'numbers = [1, 2, 4]\nnumbers.insert(2, 3)  # [1, 2, 3, 4]', output: '[1, 2, 3, 4]', tip: 'insert(index, value)' },
      { cmd: 'remove()', desc: 'ลบตัวแรกที่จับตัวได้', syntax: 'numbers = [1, 2, 3, 2]\nnumbers.remove(2)  # [1, 3, 2]', output: '[1, 3, 2]', tip: 'ลบแค่ตัวแรก' },
      { cmd: 'pop()', desc: 'ลบและคืนค่า', syntax: 'numbers = [1, 2, 3]\nlast = numbers.pop()  # last=3, numbers=[1,2]\nfirst = numbers.pop(0)  # first=1, numbers=[2]', output: '3 แล้ว [1,2]\n1 แล้ว [2]', tip: 'pop() ลบตัวสุดท้าย' },
      { cmd: 'sort(), reverse()', desc: 'เรียงลำดับ/กลับลำดับ', syntax: 'numbers = [3, 1, 4, 1, 5]\nnumbers.sort()  # [1, 1, 3, 4, 5]\nnumbers.reverse()  # [5, 4, 3, 1, 1]', output: '[1, 1, 3, 4, 5]\n[5, 4, 3, 1, 1]', tip: 'sorted() return ใหม่, sort() แก้เดิม' }
    ],
    functions: [
      { cmd: 'def function():', desc: 'สร้างฟังก์ชัน', syntax: 'def greet(name):\n  return f"Hello, {name}!"\n\nresult = greet("Alice")', output: 'Hello, Alice!', tip: 'ใช้ return เพื่อคืนค่า' },
      { cmd: 'lambda', desc: 'ฟังก์ชัน Anonymous (เขียนในบรรทัดเดียว)', syntax: 'square = lambda x: x ** 2\nprint(square(5))  # 25\n\n# ใช้กับ map, filter\nnums = [1, 2, 3]\nsquares = list(map(lambda x: x**2, nums))  # [1, 4, 9]', output: '25\n[1, 4, 9]', tip: 'ใช้สำหรับ simple operations' },
      { cmd: 'map(), filter()', desc: 'ใช้ฟังก์ชันกับลิสต์', syntax: 'numbers = [1, 2, 3, 4, 5]\n\n# map: ใช้ฟังก์ชันกับทุกตัว\nsquares = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16, 25]\n\n# filter: กรองเอาแต่ที่ตรงเงื่อนไข\nevens = list(filter(lambda x: x % 2 == 0, numbers))  # [2, 4]', output: '[1, 4, 9, 16, 25]\n[2, 4]', tip: 'ใช้ lambda ร่วมกับ map/filter' },
      { cmd: '*args, **kwargs', desc: 'พารามิเตอร์จำนวนแปรผัน', syntax: 'def func(*args, **kwargs):\n  print(args)  # tuple\n  print(kwargs)  # dict\n\nfunc(1, 2, 3, name="John", age=25)', output: '(1, 2, 3)\n{\'name\': \'John\', \'age\': 25}', tip: '*args=ตำแหน่ง, **kwargs=named' }
    ],
    file_io: [
      { cmd: 'open(), read()', desc: 'เปิดไฟล์และอ่าน', syntax: 'with open("data.txt", "r") as file:\n  content = file.read()\n  print(content)', output: 'เนื้อหาของไฟล์', tip: 'with = อ่อปแฟล์อัตโนมัติ' },
      { cmd: 'write()', desc: 'เขียนลงไฟล์', syntax: 'with open("output.txt", "w") as file:\n  file.write("Hello, World!")', output: 'สร้างไฟล์ output.txt', tip: '"w"=เขียนใหม่, "a"=ต่อท้าย' },
      { cmd: 'readlines()', desc: 'อ่านไฟล์เป็นบรรทัด', syntax: 'with open("file.txt", "r") as file:\n  lines = file.readlines()  # List of lines\n  for line in lines:\n    print(line.strip())', output: 'แต่ละบรรทัด', tip: 'เก็บเป็น list ของสตริง' },
      { cmd: 'json.load(), json.dump()', desc: 'อ่าน/เขียน JSON', syntax: 'import json\n\n# อ่าน\nwith open("data.json", "r") as f:\n  data = json.load(f)\n\n# เขียน\nwith open("data.json", "w") as f:\n  json.dump(data, f)', output: 'dict จาก JSON file', tip: 'ใช้กับ API, config files' }
    ],
    numpy: [
      { cmd: 'np.array()', desc: 'สร้าง NumPy array', syntax: 'import numpy as np\n\narr = np.array([1, 2, 3, 4])\nmatrix = np.array([[1, 2], [3, 4]])', output: 'array([1, 2, 3, 4])\n[[1 2]\n [3 4]]', tip: 'เร็วกว่า list สำหรับ data' },
      { cmd: 'np.arange(), np.linspace()', desc: 'สร้างลำดับ', syntax: 'a = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]\nb = np.linspace(0, 10, 5)  # [0, 2.5, 5, 7.5, 10]', output: '[0 2 4 6 8]\n[0. 2.5 5. 7.5 10.]', tip: 'arange=step, linspace=จำนวนตัว' },
      { cmd: 'np.zeros(), np.ones()', desc: 'สร้าง array เต็มด้วย 0 หรือ 1', syntax: 'zeros = np.zeros((3, 3))\nones = np.ones(5)', output: 'Matrix 3x3 ของ 0\n[1. 1. 1. 1. 1.]', tip: 'ใช้สร้าง matrix สำหรับการคำนวณ' },
      { cmd: 'arr.shape, arr.dtype', desc: 'ตรวจสอบ shape และ type', syntax: 'arr = np.array([[1, 2, 3], [4, 5, 6]])\nprint(arr.shape)  # (2, 3)\nprint(arr.dtype)  # int64', output: '(2, 3)\nint64', tip: 'shape=มิติ, dtype=data type' }
    ],
    matplotlib: [
      { cmd: 'plot()', desc: 'วาดกราฟเส้น', syntax: 'import matplotlib.pyplot as plt\n\nx = [1, 2, 3, 4, 5]\ny = [2, 4, 6, 8, 10]\n\nplt.plot(x, y, label="Linear")\nplt.xlabel("X axis")\nplt.ylabel("Y axis")\nplt.legend()\nplt.show()', output: 'กราฟเส้น', tip: 'เหมาะสำหรับ engineering data' },
      { cmd: 'scatter()', desc: 'วาดจุด', syntax: 'plt.scatter([1, 2, 3], [2, 4, 6], label="Points")\nplt.legend()\nplt.show()', output: 'กราฟจุด', tip: 'แสดงสัมพันธ์ระหว่างตัวแปร' },
      { cmd: 'bar()', desc: 'วาดแท่ง', syntax: 'categories = ["A", "B", "C"]\nvalues = [10, 20, 15]\n\nplt.bar(categories, values)\nplt.ylabel("Values")\nplt.show()', output: 'กราฟแท่ง', tip: 'เปรียบเทียบหมวดหมู่' },
      { cmd: 'hist()', desc: 'วาดฮิสโตแกรม', syntax: 'data = [1, 2, 2, 3, 3, 3, 4, 4, 5]\n\nplt.hist(data, bins=5, edgecolor="black")\nplt.show()', output: 'ฮิสโตแกรม', tip: 'แสดงการแจกแจง' }
    ],
    sympy: [
      { cmd: 'symbols(), solve()', desc: 'ตัวแปรสัญลักษณ์และแก้สมการ', syntax: 'from sympy import symbols, solve\n\nx = symbols("x")\nequation = x**2 - 5*x + 6\nsolutions = solve(equation, x)  # [2, 3]', output: '[2, 3]', tip: 'แก้สมการพีชคณิต' },
      { cmd: 'diff(), integrate()', desc: 'ดิฟเฟอร์เรนเชียลและอินทิเกรต', syntax: 'from sympy import symbols, diff, integrate\n\nx = symbols("x")\nf = x**3 + 2*x**2 + 1\n\nderivative = diff(f, x)  # 3*x^2 + 4*x\nintegral = integrate(f, x)  # x^4/4 + 2x^3/3 + x', output: 'สูตร calculus', tip: 'Symbolic calculus สำหรับ engineering' },
      { cmd: 'Matrix()', desc: 'ทำงานกับเมทริกซ์', syntax: 'from sympy import Matrix\n\nA = Matrix([[1, 2], [3, 4]])\nB = Matrix([[5, 6], [7, 8]])\n\nC = A * B  # Matrix multiplication\ndet = A.det()  # Determinant\nreverse = A.inv()  # Inverse', output: 'Matrix result', tip: 'Linear algebra สำหรับ mechanical' }
    ],
    classes_oop: [
      { cmd: 'class', desc: 'สร้างคลาส (Object-Oriented)', syntax: 'class Car:\n  def __init__(self, brand, speed):\n    self.brand = brand\n    self.speed = speed\n  \n  def accelerate(self):\n    self.speed += 10\n    return f"{self.brand} speeds up to {self.speed}"', output: 'Object instance', tip: '__init__ = constructor' },
      { cmd: 'inheritance', desc: 'สืบทอดจากคลาสแม่', syntax: 'class Vehicle:\n  def __init__(self, speed):\n    self.speed = speed\n\nclass Car(Vehicle):\n  def __init__(self, brand, speed):\n    super().__init__(speed)\n    self.brand = brand', output: 'Car inherits from Vehicle', tip: 'super() เรียกแม่คลาส' }
    ],
    error_handling: [
      { cmd: 'try / except', desc: 'จัดการ error', syntax: 'try:\n  result = 10 / 0\nexcept ZeroDivisionError:\n  print("Cannot divide by zero")\nexcept Exception as e:\n  print(f"Error: {e}")\nfinally:\n  print("Done")', output: 'Cannot divide by zero\nDone', tip: 'finally ทำงานเสมอ' },
      { cmd: 'raise', desc: 'ยิง error เอง', syntax: 'def check_age(age):\n  if age < 0:\n    raise ValueError("Age cannot be negative")\n\ntry:\n  check_age(-5)\nexcept ValueError as e:\n  print(e)', output: 'Age cannot be negative', tip: 'ใช้ validate input' }
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
    { key: 'string_methods', label: 'String Methods' },
    { key: 'list_methods', label: 'List Methods' },
    { key: 'functions', label: 'Functions' },
    { key: 'file_io', label: 'File I/O' },
    { key: 'numpy', label: 'NumPy' },
    { key: 'matplotlib', label: 'Matplotlib' },
    { key: 'sympy', label: 'SymPy (Calc)' },
    { key: 'classes_oop', label: 'OOP/Classes' },
    { key: 'error_handling', label: 'Error Handling' }
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
    marginTop: 12,
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
    background: isActive ? '#8b5cf6' : 'transparent',
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
    background: 'rgba(139,92,246,0.15)',
    color: '#c084fc',
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(139,92,246,0.2)',
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

  const outputBoxStyle = {
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 6,
    padding: 8,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#c084fc',
  };

  const tipStyle = {
    fontSize: 10,
    color: '#fbbf24',
    fontStyle: 'italic',
    padding: 6,
    background: 'rgba(251,191,36,0.1)',
    borderLeft: '2px solid #fbbf24',
    paddingLeft: 10,
  };

  return (
    <div style={containerStyle}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={titleStyle}>🐍 Python Dictionary</div>
        <div style={subtitleStyle}>Complete Reference for Mechanical Engineering & Data Analysis</div>
        <input
          type="text"
          placeholder="🔍 Search (e.g. for, numpy, plot, class)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
        {filteredItems.map((item, idx) => (
          <div key={idx} style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1f2937'}>
            
            <div style={cmdLabelStyle}>{item.cmd}</div>
            
            <div style={descStyle}>{item.desc}</div>
            
            <div style={codeBlockStyle}>
              <button
                style={copyButtonStyle(copiedIndex === idx)}
                onClick={() => copyToClipboard(item.syntax, idx)}
              >
                {copiedIndex === idx ? '✓ Copied' : 'Copy'}
              </button>
              {item.syntax}
            </div>

            {item.output && (
              <div>
                <span style={{ fontSize: 10, color: '#6b7280' }}>Output:</span>
                <div style={outputBoxStyle}>{item.output}</div>
              </div>
            )}

            {item.tip && (
              <div style={tipStyle}>💡 {item.tip}</div>
            )}

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