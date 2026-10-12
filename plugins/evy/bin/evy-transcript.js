// What EVY's Stop hook sends from a session's transcript: the person's messages and the agent's answers in the JSON
// lines on stdin (the part since the last send), never tool calls, tool output or file contents, with the folder and
// session it came from. Runs with the JavaScript every Mac has: osascript -l JavaScript evy-transcript.js FOLDER
// REPO_FOLDER SESSION KIND. Prints the request body, or nothing when there is nothing to send. Reads Claude Code's
// transcripts and Codex's rollout files.
ObjC.import("Foundation");

const MESSAGE_CHARS = 2000;
const TOTAL_CHARS = 20000;
const NOISE = /<(system-reminder|command-[\w-]+|local-command-[\w-]+|task-notification|environment_context|user_instructions)>[\s\S]*?<\/\1>/g;

function said(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content) || content.some((block) => block && block.type === "tool_result")) return "";
  return content
    .filter((block) => block && ["text", "input_text", "output_text"].includes(block.type))
    .map((block) => block.text || "")
    .join("\n");
}

function clean(text) {
  const kept = String(text || "").replace(NOISE, "").trim();
  if (!kept || kept.startsWith("[Request interrupted") || kept.startsWith("Caveat:") || kept.startsWith("# AGENTS.md")) return "";
  return kept.length > MESSAGE_CHARS ? kept.slice(0, MESSAGE_CHARS) + "…" : kept;
}

function entry(line) {
  if (!line || line.isSidechain || line.isMeta) return null;
  if (line.type === "user" || line.type === "assistant") {
    const text = clean(said((line.message || {}).content));
    return text ? [line.timestamp, line.type === "user" ? "Person" : "Agent", text] : null;
  }
  const item = line.type === "response_item" ? line.payload || {} : {};
  if (item.type === "message" && (item.role === "user" || item.role === "assistant")) {
    const text = clean(said(item.content));
    return text ? [line.timestamp, item.role === "user" ? "Person" : "Agent", text] : null;
  }
  return null;
}

function run(argv) {
  const data = $.NSFileHandle.fileHandleWithStandardInput.readDataToEndOfFile;
  const input = $.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding).js || "";
  const lines = [];
  input.split("\n").forEach((raw) => {
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return;
    }
    const found = entry(parsed);
    if (found) lines.push(`[${found[0] || ""}] ${found[1]}: ${found[2]}`);
  });
  if (!lines.some((line) => / Person: /.test(line))) return "";
  const text = lines.join("\n").slice(-TOTAL_CHARS);
  return JSON.stringify({ text, folder: argv[0] || "", repo_folder: argv[1] || "", session: argv[2] || "", kind: argv[3] || "chat" });
}
