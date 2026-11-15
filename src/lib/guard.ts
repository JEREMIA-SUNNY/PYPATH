import "server-only";

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

function hostnameOf(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  if (hostHeader.startsWith("[")) return hostHeader.slice(0, hostHeader.indexOf("]") + 1);
  return hostHeader.split(":")[0];
}

/**
 * PyPath's API runs code on your machine, so it only answers requests that
 * come from the PyPath page itself, opened on this computer.
 *  - Host must be a loopback name (blocks LAN access and DNS rebinding).
 *  - Origin, when sent, must match the Host (blocks other websites).
 *  - Writes need the custom x-pypath header, which forces a CORS preflight.
 */
export function rejectUnlessLocal(req: Request, { write }: { write: boolean }): Response | null {
  const host = req.headers.get("host");
  const hostname = hostnameOf(host);
  if (!hostname || !LOCAL_HOSTS.has(hostname)) {
    return Response.json({ error: "PyPath only accepts requests from this computer." }, { status: 403 });
  }
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== host) throw new Error("mismatch");
    } catch {
      return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
  }
  if (write && req.headers.get("x-pypath") !== "1") {
    return Response.json({ error: "Missing x-pypath header." }, { status: 403 });
  }
  return null;
}
