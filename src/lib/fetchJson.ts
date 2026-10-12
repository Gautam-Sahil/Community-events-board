export async function fetchJson<
  T = Record<string, unknown>
>(
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<{ ok: boolean; status: number; data: T }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const rawText = await res.text();

      let data: T;
      try {
        data = (rawText ? JSON.parse(rawText) : {}) as T;
      } catch {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        throw new Error("Server is warming up, please try again.");
      }

      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Request failed");
}