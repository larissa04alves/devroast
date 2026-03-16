import { faker } from "@faker-js/faker";
import { db } from "./index";
import { roastIssues, roasts } from "./schema";

// ─── helpers ────────────────────────────────────────────────────────────────

type Verdict = "good_enough" | "could_be_worse" | "needs_work" | "yikes" | "needs_serious_help";

type Severity = "good" | "warning" | "critical";

type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "rust"
  | "go"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "ruby"
  | "sql"
  | "html"
  | "xml"
  | "css"
  | "bash"
  | "json"
  | "yaml"
  | "markdown"
  | "swift"
  | "kotlin"
  | "scala"
  | "r"
  | "perl"
  | "lua";

const LANGUAGES: Language[] = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "html",
  "css",
  "bash",
];

const VERDICTS: Verdict[] = [
  "good_enough",
  "could_be_worse",
  "needs_work",
  "yikes",
  "needs_serious_help",
];

const ROAST_QUOTES: Record<Verdict, string[]> = {
  good_enough: [
    "Not terrible. Which, for this codebase, is basically a standing ovation.",
    "I've seen worse. In nightmares, but still.",
    "Acceptable. Your future self might only mildly resent you.",
    "It works and I almost respect it. Almost.",
    "Clean enough that I won't cry. That's the bar you cleared.",
  ],
  could_be_worse: [
    "This code is like cheap coffee — functional but leaves a bad taste.",
    "You clearly googled half of this. The other half is concerning.",
    "It runs. Whether it should is a philosophical question.",
    "I've debugged worse things. You're not special.",
    "Technically correct, the worst kind of correct.",
  ],
  needs_work: [
    "Who wrote this? Stack Overflow's worst answers compiled into one file?",
    "This reads like it was written at 3am after five energy drinks.",
    "The variable names alone should be a criminal offense.",
    "Future engineers will find this and weep.",
    "I'd suggest a refactor but honestly a bonfire might be faster.",
  ],
  yikes: [
    "This is what happens when you skip the docs AND the tutorials.",
    "I've seen cargo cults write better abstractions.",
    "Did you just nest ternaries inside a switch inside a for loop? Bold.",
    "Your linter isn't angry, it's just disappointed.",
    "If bad code were currency, you'd be rich.",
  ],
  needs_serious_help: [
    "Delete this. Delete your computer. Start over.",
    "This is less a program and more a cry for help.",
    "I showed this to my rubber duck and it resigned.",
    "The Geneva Convention may not cover code, but it should cover this.",
    "Somewhere a senior dev is having stress flashbacks and doesn't know why.",
  ],
};

const ISSUE_TITLES: Record<Severity, string[]> = {
  good: [
    "Consistent naming convention",
    "Good use of early returns",
    "Proper error boundaries in place",
    "Well-structured module separation",
    "Effective use of type inference",
    "Clear and meaningful variable names",
    "Appropriate abstraction level",
  ],
  warning: [
    "Magic numbers without constants",
    "Missing input validation",
    "Inconsistent error handling",
    "Overly deep nesting",
    "Duplicated logic across functions",
    "Commented-out dead code",
    "Missing null checks",
    "Function doing too many things",
    "Implicit type coercion",
    "No logging strategy",
  ],
  critical: [
    "SQL injection vulnerability",
    "Hardcoded credentials in source",
    "Unbounded recursion risk",
    "Memory leak in event listeners",
    "Race condition in async flow",
    "Missing authentication check",
    "Sensitive data logged to console",
    "Uncaught promise rejections",
    "N+1 query in loop",
    "Exposed API key in client bundle",
  ],
};

const ISSUE_DESCRIPTIONS: Record<Severity, string[]> = {
  good: [
    "The codebase consistently uses camelCase for variables and PascalCase for types — makes it readable at a glance.",
    "Early returns are used effectively to reduce nesting and improve readability.",
    "Error boundaries prevent cascading failures. Good defensive coding.",
    "Modules are separated by concern, making it easy to locate and change functionality.",
    "TypeScript inference is leveraged well, avoiding redundant type annotations.",
    "Variable names communicate intent clearly without requiring comments to explain them.",
    "The level of abstraction is appropriate — not over-engineered, not under-engineered.",
  ],
  warning: [
    "Values like `300`, `42`, and `0.75` appear repeatedly without named constants. If the requirement changes, you'll be doing a scavenger hunt.",
    "User input flows directly into business logic without sanitization. One crafted payload away from trouble.",
    "Some functions throw, others return null, others return error objects. Pick a pattern and commit.",
    "Five levels of nesting in a single function. Extract those inner blocks into named helpers.",
    "The same 15-line validation block appears in three different files. Extract it.",
    "There are 23 lines of commented code. Either delete it or open a PR — VCS exists for a reason.",
    "Several nullable values are accessed without guards. This will crash in production.",
    "This function initializes state, fetches data, transforms it, and renders output. That's four jobs.",
    "`== null` and `=== null` are used interchangeably, and sometimes `!value` too. Pick one.",
    "There is no logging at critical boundaries. When (not if) this fails in prod, you'll have no idea why.",
  ],
  critical: [
    "User-supplied input is concatenated directly into a SQL string. Classic injection vector — please use parameterized queries.",
    "Database password is hardcoded as a string literal. Rotate it immediately and move it to environment variables.",
    "This recursive function has no base case guard against adversarial input. Deep enough input will blow the stack.",
    "Event listeners are registered inside a loop but never removed. Memory usage will grow unboundedly over time.",
    "Shared mutable state is modified in two concurrent async flows with no locking mechanism. Data corruption is inevitable.",
    "This route handler skips authentication entirely for admin actions. Any unauthenticated user can call it.",
    "Full user objects including tokens are passed to `console.log`. These will appear in log aggregators in plaintext.",
    "Async operations are not wrapped in try/catch and the promise chain has no `.catch()`. Errors will silently vanish.",
    "A database query is executed inside a loop over a result set. This is O(n) queries — will destroy performance at scale.",
    "The API key is imported in a client-side module and will be included in the public bundle. It's already exposed.",
  ],
};

const CODE_SNIPPETS: Record<Language, string[]> = {
  javascript: [
    `function fetchUser(id) {\n  var user = db.query("SELECT * FROM users WHERE id = " + id);\n  if (user != null) {\n    if (user.active != false) {\n      if (user.role != undefined) {\n        return user;\n      }\n    }\n  }\n  return null;\n}`,
    `const getData = async () => {\n  const res = await fetch('/api/data');\n  const json = await res.json();\n  setData(json);\n  setLoading(false);\n  setError(null);\n  console.log('user token:', localStorage.getItem('token'));\n}`,
    `var count = 0;\nsetInterval(function() {\n  count++;\n  document.getElementById('counter').innerHTML = count;\n  if (count == 100) {\n    console.log('done');\n  }\n}, 1000);`,
  ],
  typescript: [
    `async function processOrder(orderId: string) {\n  const order = await db.orders.findById(orderId);\n  const items = await db.items.findByOrderId(orderId);\n  const user = await db.users.findById(order.userId);\n  const address = await db.addresses.findById(order.addressId);\n  // N+1 queries ahead\n  for (const item of items) {\n    const product = await db.products.findById(item.productId);\n    order.total += product.price * item.quantity;\n  }\n  return order;\n}`,
    `type ApiResponse<T> = {\n  data: T;\n  error: string | null;\n  status: number;\n};\n\nfunction handleResponse(response: any): any {\n  if (response.status === 200) {\n    return response.data as any;\n  }\n  throw new Error(response.error);\n}`,
    `const config = {\n  apiKey: "sk-prod-abc123xyz789secretkey",\n  baseUrl: "https://api.example.com",\n  timeout: 5000,\n};\n\nexport { config };`,
  ],
  python: [
    `def get_user(user_id):\n    query = f"SELECT * FROM users WHERE id = {user_id}"\n    result = db.execute(query)\n    return result\n\ndef process_users():\n    users = get_all_users()\n    for user in users:\n        data = get_user(user['id'])  # N+1\n        print(data)`,
    `import os\n\nDB_PASSWORD = "super_secret_password_123"\nAPI_KEY = "hardcoded-api-key-do-not-share"\n\ndef connect():\n    return psycopg2.connect(\n        host="localhost",\n        password=DB_PASSWORD\n    )`,
    `def calculate(a, b, op):\n    if op == 'add':\n        if a != None:\n            if b != None:\n                result = a + b\n                if result != None:\n                    return result\n    elif op == 'sub':\n        if a != None:\n            if b != None:\n                return a - b`,
  ],
  rust: [
    `fn process_data(input: &str) -> String {\n    let mut result = String::new();\n    for c in input.chars() {\n        result.push(c); // allocating one char at a time\n    }\n    result\n}\n\nfn main() {\n    let data = process_data("hello world");\n    println!("{}", data);\n}`,
    `use std::collections::HashMap;\n\nfn count_words(text: &str) -> HashMap<&str, usize> {\n    let mut map = HashMap::new();\n    for word in text.split_whitespace() {\n        let count = map.entry(word).or_insert(0);\n        *count += 1;\n    }\n    map\n}`,
  ],
  go: [
    `func getUserByID(db *sql.DB, id string) (*User, error) {\n    query := "SELECT * FROM users WHERE id = '" + id + "'"\n    row := db.QueryRow(query)\n    var user User\n    err := row.Scan(&user.ID, &user.Name, &user.Email)\n    return &user, err\n}`,
    `func handleRequest(w http.ResponseWriter, r *http.Request) {\n    body, _ := ioutil.ReadAll(r.Body)\n    var data map[string]interface{}\n    json.Unmarshal(body, &data)\n    // ignoring all errors\n    w.Write([]byte("ok"))\n}`,
  ],
  java: [
    `public class UserService {\n    private static final String DB_URL = "jdbc:mysql://localhost/db";\n    private static final String PASSWORD = "admin123";\n\n    public User getUser(String id) {\n        Statement stmt = conn.createStatement();\n        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id=" + id);\n        // SQL injection, hardcoded creds, unclosed resources\n    }\n}`,
    `public List<Order> getOrders(int userId) {\n    List<Order> orders = orderRepo.findByUserId(userId);\n    for (Order order : orders) {\n        List<Item> items = itemRepo.findByOrderId(order.getId()); // N+1\n        order.setItems(items);\n    }\n    return orders;\n}`,
  ],
  c: [
    `char* get_input() {\n    char buffer[64];\n    gets(buffer); // buffer overflow\n    return buffer; // returning stack pointer\n}\n\nvoid process(char* data) {\n    char result[32];\n    strcpy(result, data); // no bounds check\n    printf(data); // format string vuln\n}`,
  ],
  cpp: [
    `class ResourceManager {\n    int* data;\npublic:\n    ResourceManager() { data = new int[100]; }\n    // missing destructor — memory leak\n    void process() {\n        for (int i = 0; i <= 100; i++) { // off-by-one\n            data[i] = i * 2;\n        }\n    }\n};`,
  ],
  csharp: [
    `public async Task<User> GetUserAsync(string id)\n{\n    var query = $"SELECT * FROM Users WHERE Id = {id}";\n    var result = await _db.ExecuteQueryAsync(query);\n    Console.WriteLine($"Fetched user: {result.Token}");\n    return result;\n}`,
    `public void ProcessPayment(decimal amount)\n{\n    if (amount > 0)\n    {\n        if (_account != null)\n        {\n            if (_account.Balance >= amount)\n            {\n                if (!_account.IsFrozen)\n                {\n                    _account.Deduct(amount);\n                }\n            }\n        }\n    }\n}`,
  ],
  php: [
    `<?php\n$id = $_GET['id'];\n$query = "SELECT * FROM users WHERE id = $id";\n$result = mysqli_query($conn, $query);\n$user = mysqli_fetch_assoc($result);\necho $user['password_hash'];\n?>`,
  ],
  ruby: [
    `def find_user(id)\n  User.where("id = '#{id}'")\nend\n\ndef process_all\n  User.all.each do |user|\n    orders = Order.where(user_id: user.id)  # N+1\n    puts user.inspect\n  end\nend`,
  ],
  sql: [
    `SELECT u.*, p.*, o.*, oi.*, pr.*\nFROM users u\nJOIN profiles p ON p.user_id = u.id\nJOIN orders o ON o.user_id = u.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products pr ON pr.id = oi.product_id\nWHERE u.id = 42;\n-- No index on foreign keys, cartesian risk`,
  ],
  html: [
    `<div class="container">\n  <div class="wrapper">\n    <div class="inner">\n      <div class="content">\n        <div class="text">\n          <p>Hello</p>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<!-- div soup -->`,
  ],
  css: [
    `.button {\n  color: red !important;\n  background: blue !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  font-size: 14px !important;\n  /* !important on everything */\n}`,
  ],
  bash: [
    `#!/bin/bash\nPASSWORD="mysecretpassword"\nDB_HOST="localhost"\n\nmysql -u root -p$PASSWORD -h $DB_HOST -e "SELECT * FROM users" > /tmp/dump.txt\nchmod 777 /tmp/dump.txt\ncurl -X POST https://api.example.com/upload -d @/tmp/dump.txt`,
  ],
  xml: [
    `<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<user>\n  <name>&xxe;</name>\n</user>`,
  ],
  json: [
    `{\n  "apiKey": "sk-prod-1234567890abcdef",\n  "dbPassword": "supersecret",\n  "debug": true,\n  "allowAllOrigins": true\n}`,
  ],
  yaml: [
    `database:\n  host: localhost\n  password: admin123\napi:\n  key: hardcoded-key-12345\ndebug: true\nallow_all: true`,
  ],
  markdown: [
    `# TODO\n- [ ] fix the bug\n- [ ] write tests (someday)\n- [ ] refactor everything\n- [ ] add docs\n\n<!-- This file has been here for 3 years untouched -->`,
  ],
  swift: [
    `func fetchData(userId: String) {\n    let url = URL(string: "https://api.example.com/users/" + userId)!\n    let data = try! Data(contentsOf: url)\n    let user = try! JSONDecoder().decode(User.self, from: data)\n    print("User token: \\(user.authToken)")\n}`,
  ],
  kotlin: [
    `fun processUser(id: String): User {\n    val query = "SELECT * FROM users WHERE id = $id"\n    val result = db.execute(query) // SQL injection\n    return result.first()!!\n}`,
  ],
  scala: [
    'def getUsers(): List[User] = {\n  val users = db.query("SELECT * FROM users")\n  users.map { user =>\n    val orders = db.query(s"SELECT * FROM orders WHERE user_id = ${user.id}") // N+1\n    user.copy(orders = orders)\n  }\n}',
  ],
  r: [
    `password <- "mysecretpassword"\nconn <- dbConnect(MySQL(), password = password)\nquery <- paste("SELECT * FROM data WHERE id =", user_input)\nresult <- dbGetQuery(conn, query)`,
  ],
  perl: [
    `my $id = $ENV{QUERY_STRING};\nmy $query = "SELECT * FROM users WHERE id = $id";\nmy $sth = $dbh->prepare($query);\n$sth->execute();`,
  ],
  lua: [
    `function getUser(id)\n  local query = "SELECT * FROM users WHERE id = " .. id\n  local result = db:execute(query)\n  print(result) -- logs sensitive data\n  return result\nend`,
  ],
};

function scoreForVerdict(verdict: Verdict): string {
  const ranges: Record<Verdict, [number, number]> = {
    good_enough: [7.5, 9.9],
    could_be_worse: [5.5, 7.4],
    needs_work: [3.5, 5.4],
    yikes: [2.0, 3.4],
    needs_serious_help: [0.0, 1.9],
  };
  const [min, max] = ranges[verdict];
  return faker.number.float({ min, max, fractionDigits: 1 }).toFixed(1);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSnippet(lang: Language): string {
  const snippets = CODE_SNIPPETS[lang];
  if (snippets && snippets.length > 0) return pickRandom(snippets);
  return `// ${lang} code snippet\nfunction example() {\n  console.log("hello world");\n}`;
}

function buildIssues(
  roastId: string,
  lineCount: number,
  verdict: Verdict
): (typeof roastIssues.$inferInsert)[] {
  const issueCount =
    verdict === "good_enough"
      ? faker.number.int({ min: 1, max: 3 })
      : verdict === "could_be_worse"
        ? faker.number.int({ min: 2, max: 4 })
        : verdict === "needs_work"
          ? faker.number.int({ min: 3, max: 5 })
          : verdict === "yikes"
            ? faker.number.int({ min: 4, max: 6 })
            : faker.number.int({ min: 5, max: 8 });

  const severityWeights: Record<Verdict, Severity[]> = {
    good_enough: ["good", "good", "warning"],
    could_be_worse: ["good", "warning", "warning"],
    needs_work: ["warning", "warning", "critical"],
    yikes: ["warning", "critical", "critical"],
    needs_serious_help: ["critical", "critical", "critical", "warning"],
  };

  const pool = severityWeights[verdict];

  return Array.from({ length: issueCount }, (_, i) => {
    const severity = pickRandom(pool);
    const titlePool = ISSUE_TITLES[severity];
    const descPool = ISSUE_DESCRIPTIONS[severity];

    const lineStart = lineCount > 1 ? faker.number.int({ min: 1, max: lineCount - 1 }) : undefined;
    const lineEnd =
      lineStart !== undefined && lineCount > lineStart
        ? faker.number.int({ min: lineStart, max: Math.min(lineStart + 10, lineCount) })
        : undefined;

    return {
      roastId,
      severity,
      title: pickRandom(titlePool),
      description: pickRandom(descPool),
      lineStart: lineStart ?? null,
      lineEnd: lineEnd ?? null,
      sortOrder: i,
    };
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

async function seed() {
  const ROAST_COUNT = 100;

  console.log(`Seeding ${ROAST_COUNT} roasts...`);

  let totalIssues = 0;

  for (let i = 0; i < ROAST_COUNT; i++) {
    const language = pickRandom(LANGUAGES);
    const verdict = pickRandom(VERDICTS);
    const code = pickSnippet(language);
    const lineCount = code.split("\n").length;
    const score = scoreForVerdict(verdict);
    const roastQuote = pickRandom(ROAST_QUOTES[verdict]);

    const hasDiff = faker.datatype.boolean({ probability: 0.4 });
    const suggestedDiff = hasDiff ? `- ${faker.hacker.phrase()}\n+ ${faker.hacker.phrase()}` : null;

    const createdAt = faker.date.between({
      from: new Date("2024-01-01"),
      to: new Date(),
    });

    const [inserted] = await db
      .insert(roasts)
      .values({
        code,
        language,
        lineCount,
        score,
        verdict,
        roastQuote,
        suggestedDiff,
        createdAt,
      })
      .returning({ id: roasts.id });

    const issues = buildIssues(inserted.id, lineCount, verdict);
    if (issues.length > 0) {
      await db.insert(roastIssues).values(issues);
      totalIssues += issues.length;
    }

    process.stdout.write(`\r  ${i + 1}/${ROAST_COUNT} roasts inserted`);
  }

  console.log(`\nDone. ${ROAST_COUNT} roasts and ${totalIssues} issues inserted.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
