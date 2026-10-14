// True when the URL answers with a real file. Static hosts and `vite preview` may answer a
// missing file with 200 + index.html, so a text/html response counts as missing.
export async function modelExists(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(url, { method: "HEAD" });
    if (!res.ok) return false;
    return !(res.headers.get("content-type") || "").includes("text/html");
  } catch {
    return false;
  }
}
