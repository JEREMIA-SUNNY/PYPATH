import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

type MdNode = { type: string; value?: string; children?: MdNode[]; data?: Record<string, unknown> };
type HastNode = { type: string; value?: string; tagName?: string; properties?: { className?: string[] }; children?: HastNode[] };

/** Turns "> [!TIP]" style blockquotes into styled callouts. */
function remarkCallouts() {
  return (tree: MdNode) => {
    const walk = (node: MdNode) => {
      if (node.type === "blockquote") {
        const first = node.children?.[0];
        const text = first?.children?.[0];
        const m = text?.type === "text" ? /^\[!(TIP|NOTE|WARNING)\]\s*/i.exec(text.value ?? "") : null;
        if (m && text) {
          text.value = (text.value ?? "").slice(m[0].length);
          node.data = { hProperties: { className: `callout callout-${m[1].toLowerCase()}` } };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

function hastText(node?: HastNode): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

export function Markdown({ children, runnable = true }: { children: string; runnable?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkCallouts]}
      rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      components={{
        pre({ node, children: kids }) {
          const codeEl = (node as unknown as HastNode)?.children?.find((c) => c.tagName === "code");
          const cls = codeEl?.properties?.className ?? [];
          const lang = cls.find((c) => c.startsWith("language-"))?.replace("language-", "") ?? "";
          const raw = hastText(codeEl).replace(/\n$/, "");
          return (
            <CodeBlock code={raw} lang={lang} runnable={runnable && lang === "python"}>
              {kids}
            </CodeBlock>
          );
        },
        a({ href, children: kids }) {
          const external = href?.startsWith("http");
          return (
            <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
              {kids}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
