// src/lib/idbTxDone.ts
// Wait for an IndexedDB transaction to fully complete (commit or error).
export async function awaitTxDone(tx: IDBTransaction | any): Promise<void> {
  if (!tx) return;

  // If a promise-like 'done' exists (idb library), await it.
  const maybeDone = (tx as any).done ?? (tx as any).complete ?? (tx as any).completed;
  if (maybeDone && typeof maybeDone.then === 'function') {
    await maybeDone;
    return;
  }

  // Raw IndexedDB path
  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const oncomplete = () => {
      if (!settled) { settled = true; cleanup(); resolve(); }
    };
    const onabort = () => {
      if (!settled) { settled = true; cleanup(); reject(tx.error ?? new Error('IDB transaction aborted')); }
    };
    const onerror = () => {
      if (!settled) { settled = true; cleanup(); reject(tx.error ?? new Error('IDB transaction error')); }
    };

    function cleanup() {
      try { tx.removeEventListener?.('complete', oncomplete); } catch {}
      try { tx.removeEventListener?.('abort', onabort); } catch {}
      try { tx.removeEventListener?.('error', onerror); } catch {}
      try { tx.oncomplete = null; } catch {}
      try { tx.onabort = null; } catch {}
      try { tx.onerror = null; } catch {}
    }

    // Support both event styles
    try {
      tx.addEventListener?.('complete', oncomplete);
      tx.addEventListener?.('abort', onabort);
      tx.addEventListener?.('error', onerror);
    } catch {}
    try { tx.oncomplete = oncomplete; } catch {}
    try { tx.onabort = onabort; } catch {}
    try { tx.onerror = onerror; } catch {}
  });
}

