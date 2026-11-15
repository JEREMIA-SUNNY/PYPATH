/** Build-time switch: "local" (default, Node server + your own Python) or "hosted" (static site, Pyodide, file-based progress). */
export const HOSTED = process.env.NEXT_PUBLIC_PYPATH_MODE === "hosted";

/** Pinned Pyodide release. Keep in sync with the `pyodide` devDependency in package.json. */
export const PYODIDE_VERSION = "314.0.8";
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || "";
