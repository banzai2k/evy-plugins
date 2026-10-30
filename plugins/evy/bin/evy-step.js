// What EVY's step hook sends after one tool call of a session that claimed an EVY task (QC7): the step it is on, as
// the runner words it for a run it started ("Reading BRIEF.md", "Running: bin/test"), or its checklist when the call
// changed it (Claude Code's TaskCreate and TaskUpdate, TodoWrite on older versions, the desktop app's plan tool).
// Only the line goes out: never what a tool read, wrote or answered. The checklist is kept between calls in STATE.
// Runs with the JavaScript every Mac has: osascript -l JavaScript evy-step.js STATE SESSION TASKS (ids, comma
// separated), with the hook's JSON on stdin. Prints the request body, or nothing when there is nothing to send.
ObjC.import("Foundation");

const LINE_CHARS = 90;
const STATUSES = ["pending", "in_progress", "completed"];

function short(text, n) {
  const s = String(text || "").split(/\s+/).filter(Boolean).join(" ");
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function base(path) {
  const parts = String(path || "").split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : String(path || "");
}

function host(url) {
  const m = /^[a-z]+:\/\/([^/?#]+)/i.exec(String(url || ""));
  return m ? m[1] : "a web page";
}

// One plain line for a tool call, the runner's step_line in the Python runner and the Swift helper.
function stepLine(name, i) {
  if (name === "Read") return `Reading ${base(i.file_path)}`;
  if (name === "Edit" || name === "MultiEdit") return `Editing ${base(i.file_path)}`;
  if (name === "Write") return `Writing ${base(i.file_path)}`;
  if (name === "NotebookEdit") return `Editing ${base(i.notebook_path)}`;
  if (name === "Bash") return "Running: " + short(i.description || i.command, LINE_CHARS);
  if (name === "Grep") return `Searching the code for "${short(i.pattern, 50)}"`;
  if (name === "Glob") return `Listing files ${short(i.pattern, 60)}`;
  if (name === "WebSearch") return "Searching the web: " + short(i.query, LINE_CHARS);
  if (name === "WebFetch") return "Reading " + host(i.url);
  if (name === "Task" || name === "Agent") return "Starting a helper: " + short(i.description || i.prompt, LINE_CHARS);
  if (name === "Skill") return `Using the ${i.skill || i.name || ""} skill`.replace("  ", " ");
  if (["TodoWrite", "ToolSearch", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "TaskOutput"].includes(name)) return null;
  if (name.startsWith("mcp__ccd_")) return null;
  if (name.startsWith("mcp__")) {
    const parts = name.split("__");
    return parts.length >= 3 ? `Using ${parts[1]}: ${parts[parts.length - 1].replace(/_/g, " ")}` : `Using ${name}`;
  }
  return name ? `Using ${name}` : null;
}

function status(value) {
  return STATUSES.includes(value) ? value : "pending";
}

// The checklist after this call, or null when the call does not touch it.
function nextPlan(name, i, response, plan) {
  if (name === "TodoWrite" && Array.isArray(i.todos)) {
    return i.todos.filter((t) => t && t.content).map((t, n) => ({ id: String(n + 1), text: String(t.content), status: status(t.status) }));
  }
  if (name === "TaskCreate" && i.subject) {
    const task = response && typeof response === "object" ? response.task || {} : {};
    const named = /Task #(\w+) created/.exec(JSON.stringify(response || ""));
    const id = String(task.id || (named && named[1]) || plan.length + 1);
    return plan.filter((t) => t.id !== id).concat([{ id, text: String(i.subject), status: "pending" }]);
  }
  if (name === "TaskUpdate") {
    const id = String(i.taskId || "");
    if (!plan.some((t) => t.id === id)) return null;
    if (i.status === "deleted") return plan.filter((t) => t.id !== id);
    return plan.map((t) =>
      t.id === id ? { id, text: i.subject ? String(i.subject) : t.text, status: STATUSES.includes(i.status) ? i.status : t.status } : t,
    );
  }
  if (/__update_plan$/.test(name)) {
    if (Array.isArray(i.items)) {
      return i.items.filter((t) => t && t.content).map((t, n) => ({ id: String(n + 1), text: String(t.content), status: status(t.status) }));
    }
    const next = plan.map((t) => Object.assign({}, t));
    if (i.advance) {
      const at = next.findIndex((t) => t.status === "in_progress");
      if (at >= 0) next[at].status = "completed";
      const after = next.findIndex((t, n) => n > at && t.status === "pending");
      if (after >= 0) next[after].status = "in_progress";
    }
    (Array.isArray(i.done) ? i.done : []).forEach((n) => next[n - 1] && (next[n - 1].status = "completed"));
    if (typeof i.start === "number" && next[i.start - 1]) {
      next.forEach((t) => t.status === "in_progress" && (t.status = "pending"));
      next[i.start - 1].status = "in_progress";
    }
    return next;
  }
  return null;
}

function readFile(path) {
  const text = $.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null);
  return text && !text.isNil() ? text.js : "";
}

function run(argv) {
  const data = $.NSFileHandle.fileHandleWithStandardInput.readDataToEndOfFile;
  const input = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding).js || "";
  let hook;
  try {
    hook = JSON.parse(input);
  } catch (e) {
    return "";
  }
  const name = String(hook.tool_name || "");
  const i = hook.tool_input && typeof hook.tool_input === "object" ? hook.tool_input : {};
  const body = { session: argv[1] || "", tasks: String(argv[2] || "").split(",").filter(Boolean) };
  let plan = [];
  try {
    plan = JSON.parse(readFile(argv[0]) || "[]");
  } catch (e) {
    plan = [];
  }
  const next = nextPlan(name, i, hook.tool_response, Array.isArray(plan) ? plan : []);
  if (next) {
    if (JSON.stringify(next) === JSON.stringify(plan)) return "";
    $(JSON.stringify(next)).writeToFileAtomicallyEncodingError(argv[0], true, $.NSUTF8StringEncoding, null);
    return next.length ? JSON.stringify(Object.assign(body, { plan: next })) : "";
  }
  const line = stepLine(name, i);
  return line ? JSON.stringify(Object.assign(body, { line })) : "";
}
