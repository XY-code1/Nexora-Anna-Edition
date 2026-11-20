import { useEffect, useState } from "react";
import type { AccessLevel, Memory } from "../../domain/memory";
import { extractCandidates } from "../services/anna-llm";
import { access, addCandidates, context, deleteAll, exportAll, list, transition } from "../services/memory-api";

type Page = "Welcome" | "Review" | "Library" | "Privacy";
type Toast = { message: string; tone: "success" | "error" } | null;

const NAV_ITEMS: Array<{ id: Page; number: string; label: string }> = [
  { id: "Welcome", number: "01", label: "输入对话" },
  { id: "Review", number: "02", label: "审核候选" },
  { id: "Library", number: "03", label: "记忆库" },
  { id: "Privacy", number: "04", label: "隐私与授权" },
];

const ACCESS_OPTIONS: Array<{ value: AccessLevel; label: string; description: string }> = [
  { value: "allowed", label: "允许全文", description: "Anna 可在任务相关时读取完整内容" },
  { value: "summary-only", label: "仅摘要", description: "Anna 只能读取你确认过的最小摘要" },
  { value: "denied", label: "不允许", description: "这条记忆不会进入任何授权上下文" },
];

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作未完成，请稍后重试。";
}

export function App() {
  const [page, setPage] = useState<Page>("Welcome");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const refresh = async () => setMemories(await list());

  useEffect(() => {
    refresh().catch((error) => setToast({ message: `读取记忆失败：${errorMessage(error)}`, tone: "error" }));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function submit(conversation: string) {
    setBusy(true);
    try {
      const candidates = await extractCandidates(conversation);
      await addCandidates(candidates);
      await refresh();
      setPage("Review");
      setToast({
        message: candidates.length ? `已生成 ${candidates.length} 条候选记忆，等待你的确认。` : "没有发现适合长期保存的内容。",
        tone: "success",
      });
    } catch (error) {
      setToast({ message: `候选提取失败：${errorMessage(error)}`, tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, action: "confirm" | "reject", patch?: Partial<Memory>) {
    try {
      await transition(id, action, patch);
      await refresh();
      setToast({ message: action === "confirm" ? "记忆已确认并保存。" : "候选记忆已拒绝。", tone: "success" });
    } catch (error) {
      setToast({ message: `操作失败：${errorMessage(error)}`, tone: "error" });
    }
  }

  async function setLevel(id: string, level: AccessLevel) {
    try {
      await access(id, level);
      await refresh();
      setToast({ message: "访问权限已更新。", tone: "success" });
    } catch (error) {
      setToast({ message: `权限更新失败：${errorMessage(error)}`, tone: "error" });
    }
  }

  return (
    <main className="app-shell">
      <header className="product-bar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">N</span>
          <div>
            <div className="brand-title">Nexora Memory <span className="edition-badge">Anna Edition</span></div>
            <p>由你确认、由你授权的个人记忆</p>
          </div>
        </div>
        <div className={`connection-status ${window.anna ? "is-connected" : "is-preview"}`}>
          <span aria-hidden="true" />
          {window.anna ? "APS 已连接" : "开发预览"}
        </div>
      </header>

      <nav className="step-nav" aria-label="记忆流程">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? "step-item is-active" : "step-item"}
            onClick={() => setPage(item.id)}
            aria-current={page === item.id ? "page" : undefined}
          >
            <span>{item.number}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className={`toast toast-${toast.tone}`} role={toast.tone === "error" ? "alert" : "status"}>
          <span aria-hidden="true">{toast.tone === "error" ? "!" : "✓"}</span>
          {toast.message}
          <button type="button" onClick={() => setToast(null)} aria-label="关闭通知">×</button>
        </div>
      )}

      <div className="page-stage" key={page}>
        {page === "Welcome" && <Welcome onSubmit={submit} busy={busy} />}
        {page === "Review" && (
          <Review
            items={memories.filter((memory) => memory.status === "candidate")}
            onAct={act}
            onNext={() => setPage("Library")}
          />
        )}
        {page === "Library" && (
          <Library
            items={memories.filter((memory) => memory.status === "confirmed")}
            onLevel={setLevel}
            onEmptyAction={() => setPage("Welcome")}
          />
        )}
        {page === "Privacy" && (
          <Privacy
            items={memories}
            onDelete={async () => {
              try {
                await deleteAll();
                await refresh();
                setToast({ message: "所有 APS 应用数据已删除。", tone: "success" });
              } catch (error) {
                setToast({ message: `删除失败：${errorMessage(error)}`, tone: "error" });
              }
            }}
          />
        )}
      </div>
    </main>
  );
}

function Welcome({ onSubmit, busy }: { onSubmit: (value: string) => void; busy: boolean }) {
  const [conversation, setConversation] = useState("");
  const guarantees = ["原始对话默认不保存", "候选记忆必须人工确认", "AI 只能读取明确授权的内容"];

  return (
    <section className="welcome-page" aria-labelledby="welcome-title">
      <div className="page-heading welcome-heading">
        <span className="section-kicker">个人记忆控制台</span>
        <h1 id="welcome-title">由你决定，什么值得被记住</h1>
        <p>提交一段你主动选择的对话。Anna 会提取候选记忆，但只有经过你的审核，内容才会成为长期记忆。</p>
      </div>

      <div className="input-card">
        <div className="card-heading">
          <div>
            <span className="step-label">步骤 01</span>
            <h2>输入一段对话</h2>
          </div>
          <span className="transient-badge">仅用于本次提取</span>
        </div>
        <label className="sr-only" htmlFor="conversation-input">待提取的对话</label>
        <textarea
          id="conversation-input"
          value={conversation}
          onChange={(event) => setConversation(event.target.value)}
          placeholder="粘贴或输入一段对话。开发和测试请仅使用合成数据。"
          rows={7}
        />
        <div className="input-footer">
          <span>{conversation.trim().length} 个字符</span>
          <button
            className="button button-primary"
            type="button"
            disabled={busy || conversation.trim().length < 8}
            onClick={() => onSubmit(conversation)}
          >
            {busy ? "正在提取…" : "提取候选记忆"}
          </button>
        </div>
      </div>

      <ul className="privacy-promises" aria-label="隐私保证">
        {guarantees.map((guarantee) => (
          <li key={guarantee}><span aria-hidden="true">✓</span>{guarantee}</li>
        ))}
      </ul>
    </section>
  );
}

function Review({ items, onAct, onNext }: { items: Memory[]; onAct: (id: string, action: "confirm" | "reject", patch?: Partial<Memory>) => void; onNext: () => void }) {
  return (
    <section aria-labelledby="review-title">
      <PageHeading kicker="步骤 02" title="审核候选记忆" description="逐条核对、编辑并决定。AI 无权替你确认长期记忆。" />
      {items.length === 0 ? (
        <EmptyState title="没有待审核的候选" description="新的候选记忆会出现在这里。你也可以继续查看已经确认的记忆。" actionLabel="查看记忆库" onAction={onNext} />
      ) : (
        <div className="card-list">
          {items.map((memory, index) => <CandidateEditor key={memory.id} memory={memory} index={index + 1} onAct={onAct} />)}
        </div>
      )}
    </section>
  );
}

function CandidateEditor({ memory, index, onAct }: { memory: Memory; index: number; onAct: (id: string, action: "confirm" | "reject", patch?: Partial<Memory>) => void }) {
  const [title, setTitle] = useState(memory.title);
  const [content, setContent] = useState(memory.content);
  const [summary, setSummary] = useState(memory.summary);

  return (
    <article className="memory-card review-card">
      <div className="memory-card-header">
        <div><span className="candidate-number">候选 {String(index).padStart(2, "0")}</span><span className="status-badge">等待确认</span></div>
        <span className="access-lock">默认不允许 AI 读取</span>
      </div>
      <div className="form-grid">
        <label>记忆标题<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>完整内容<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} /></label>
        <label>最小摘要<span className="field-hint">选择“仅摘要”时，Anna 只会看到这里的内容</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} /></label>
      </div>
      <div className="card-actions">
        <button className="button button-danger-ghost" type="button" onClick={() => onAct(memory.id, "reject")}>拒绝</button>
        <button className="button button-primary" type="button" onClick={() => onAct(memory.id, "confirm", { title, content, summary })}>确认记忆</button>
      </div>
    </article>
  );
}

function Library({ items, onLevel, onEmptyAction }: { items: Memory[]; onLevel: (id: string, level: AccessLevel) => void; onEmptyAction: () => void }) {
  return (
    <section aria-labelledby="library-title">
      <PageHeading kicker="步骤 03" title="记忆库" description="这里仅展示你已经确认的长期记忆。你可以随时调整 Anna 的读取权限。" />
      {items.length === 0 ? (
        <EmptyState title="还没有已确认的记忆" description="先提交一段合成对话，并在审核页确认候选记忆。" actionLabel="输入对话" onAction={onEmptyAction} />
      ) : (
        <div className="card-list">
          {items.map((memory) => (
            <article className="memory-card library-card" key={memory.id}>
              <div className="memory-card-header">
                <div><span className="confirmed-dot" aria-hidden="true" /> <span className="confirmed-label">已确认</span></div>
                <span className="memory-date">更新于 {new Date(memory.updatedAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <h2>{memory.title}</h2>
              <p className="memory-content">{memory.content}</p>
              <div className="summary-box"><span>最小摘要</span><p>{memory.summary}</p></div>
              <fieldset className="access-fieldset">
                <legend>Anna 访问级别</legend>
                <div className="segmented-control">
                  {ACCESS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={memory.aiAccess === option.value ? "is-selected" : ""}
                      onClick={() => onLevel(memory.id, option.value)}
                      aria-pressed={memory.aiAccess === option.value}
                    >{option.label}</button>
                  ))}
                </div>
                <p>{ACCESS_OPTIONS.find((option) => option.value === memory.aiAccess)?.description ?? "未知权限会按不允许处理"}</p>
              </fieldset>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Privacy({ items, onDelete }: { items: Memory[]; onDelete: () => void }) {
  const [task, setTask] = useState("");
  const [preview, setPreview] = useState("");
  const confirmedCount = items.filter((item) => item.status === "confirmed").length;
  const authorizedCount = items.filter((item) => item.status === "confirmed" && item.aiAccess !== "denied").length;

  async function exportData() {
    const blob = new Blob([await exportAll()], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "nexora-memory-export.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  return (
    <section aria-labelledby="privacy-title">
      <PageHeading kicker="步骤 04" title="隐私与授权" description="查看 APS 数据状态，并在分享给 Anna 前预览最小授权上下文。" />
      <div className="privacy-grid">
        <article className="panel overview-panel">
          <div className="panel-title-row"><h2>APS 数据概览</h2><span className="cloud-badge">云端持久化</span></div>
          <p className="panel-description">记忆、访问设置与审计记录存储在 Anna Persistent Storage 的应用隔离空间。</p>
          <dl className="stats-grid">
            <div><dt>全部记录</dt><dd>{items.length}</dd></div>
            <div><dt>已确认</dt><dd>{confirmedCount}</dd></div>
            <div><dt>已授权</dt><dd>{authorizedCount}</dd></div>
          </dl>
          <button className="button button-secondary" type="button" onClick={exportData}>导出 JSON 数据</button>
        </article>

        <article className="panel context-panel">
          <h2>最小授权上下文预览</h2>
          <p className="panel-description">输入一项任务，查看 Anna 在当前权限下实际可以读取的内容。</p>
          <label htmlFor="task-input">当前任务</label>
          <div className="context-input-row">
            <input id="task-input" value={task} onChange={(event) => setTask(event.target.value)} placeholder="例如：帮我规划 Python 学习" />
            <button className="button button-primary" type="button" disabled={!task.trim()} onClick={async () => setPreview(JSON.stringify(await context(task), null, 2))}>生成预览</button>
          </div>
          <pre className={preview ? "context-preview" : "context-preview is-empty"}>{preview || "尚未生成。未授权的记忆不会出现在这里。"}</pre>
        </article>
      </div>

      <article className="danger-zone">
        <div><h2>删除全部数据</h2><p>这会删除此应用在 APS 中保存的全部记忆、权限设置和审计记录。此操作无法撤销。</p></div>
        <button className="button button-danger" type="button" onClick={() => window.confirm("永久删除全部 APS 应用数据？此操作无法撤销。") && onDelete()}>删除全部数据</button>
      </article>
    </section>
  );
}

function PageHeading({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="page-heading"><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>;
}

function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">○</span><h2>{title}</h2><p>{description}</p><button className="button button-secondary" type="button" onClick={onAction}>{actionLabel}</button></div>;
}
