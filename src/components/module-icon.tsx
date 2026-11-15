import {
  BarChart3, Binary, BookOpen, Bot, Boxes, Brackets, Braces, Brain, Bug, Calculator, Code2, Cpu, Database, FileText, Flag,
  FunctionSquare, GitBranch, GitMerge, Globe, Grid3x3, Hash, Layers, ListTree, MoveHorizontal, Network, Package, Plug, Repeat,
  Rocket, Server, Spade, Sparkles, Table2, Terminal, TestTube2, Timer, Type, Wand2, Workflow, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  terminal: Terminal, calculator: Calculator, type: Type, brackets: Brackets, braces: Braces, file: FileText,
  branch: GitBranch, repeat: Repeat, function: FunctionSquare, grid: Grid3x3, boxes: Boxes, package: Package,
  bug: Bug, spade: Spade, wand: Wand2, wrench: Wrench, globe: Globe, layers: Layers, sparkles: Sparkles,
  rocket: Rocket, flag: Flag, binary: Binary, code: Code2, book: BookOpen, database: Database, server: Server,
  chart: BarChart3, bot: Bot, cpu: Cpu, workflow: Workflow, git: GitMerge, test: TestTube2, network: Network,
  tree: ListTree, hash: Hash, timer: Timer, brain: Brain, plug: Plug, table: Table2, pointers: MoveHorizontal,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? BookOpen;
  return <Icon className={className} strokeWidth={1.75} />;
}
