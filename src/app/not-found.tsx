import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[80vh] max-w-xl place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">NameError: page is not defined</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">That page doesn&apos;t exist. It may have been renamed in the content folder.</p>
        <ButtonLink href="/" className="mt-6">
          Back to dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
