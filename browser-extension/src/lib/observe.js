(function (global) {
  const OWN_CLASS_RE = /(^|\s)md-to-docx-/;

  function isOwnElement(el) {
    if (!el || el.nodeType !== 1) return false;
    try {
      if (typeof el.className === "string" && OWN_CLASS_RE.test(el.className)) {
        return true;
      }
      if (typeof el.closest === "function" && el.closest("[class*='md-to-docx-']")) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  function isOwnNode(node) {
    if (!node) return true;
    if (node.nodeType === 1) return isOwnElement(node);
    return isOwnElement(node.parentElement);
  }

  /**
   * Skip feedback from our own inserts. Do NOT skip when own nodes were
   * removed (SPA wiped UI) or when non-extension DOM changed.
   */
  function shouldIgnoreMutations(mutations) {
    if (!mutations || !mutations.length) return true;
    let sawOwnAdd = false;
    let sawOwnRemove = false;
    let sawNonOwn = false;
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      const added = m.addedNodes;
      for (let j = 0; j < added.length; j++) {
        if (isOwnNode(added[j])) sawOwnAdd = true;
        else sawNonOwn = true;
      }
      const removed = m.removedNodes;
      for (let j = 0; j < removed.length; j++) {
        if (isOwnNode(removed[j])) sawOwnRemove = true;
        else sawNonOwn = true;
      }
    }
    if (sawNonOwn || sawOwnRemove) return false;
    return sawOwnAdd;
  }

  /**
   * @param {Node} root
   * @param {(mutations?: MutationRecord[]) => void} onMutate
   * @param {{ debounceMs?: number, childList?: boolean, subtree?: boolean, attributes?: boolean }} [opts]
   * @returns {{ runQuiet: (fn: Function) => *, disconnect: () => void, observe: () => void }}
   */
  function watch(root, onMutate, opts) {
    const options = opts || {};
    const debounceMs =
      typeof options.debounceMs === "number" ? options.debounceMs : 200;
    const observeOpts = {
      childList: options.childList !== false,
      subtree: options.subtree !== false,
    };
    if (options.attributes) observeOpts.attributes = true;

    let timer = null;
    let raf = null;
    let pending = null;
    let quietDepth = 0;
    let observer = null;

    function flush() {
      timer = null;
      raf = null;
      const mutations = pending;
      pending = null;
      if (quietDepth > 0) return;
      if (shouldIgnoreMutations(mutations)) return;
      try {
        onMutate(mutations);
      } catch (_) {}
    }

    function schedule(mutations) {
      if (quietDepth > 0) return;
      if (pending) {
        pending = pending.concat(mutations);
      } else {
        pending = Array.prototype.slice.call(mutations);
      }
      if (timer != null || raf != null) return;
      if (typeof requestAnimationFrame === "function") {
        raf = requestAnimationFrame(() => {
          raf = null;
          timer = setTimeout(flush, debounceMs);
        });
      } else {
        timer = setTimeout(flush, debounceMs);
      }
    }

    function startObserve() {
      if (!observer || !root) return;
      try {
        observer.observe(root, observeOpts);
      } catch (_) {}
    }

    function disconnect() {
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
        raf = null;
      }
      pending = null;
      if (observer) {
        try {
          observer.disconnect();
        } catch (_) {}
      }
    }

    function runQuiet(fn) {
      quietDepth += 1;
      if (observer) {
        try {
          observer.disconnect();
        } catch (_) {}
      }
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
        raf = null;
      }
      pending = null;
      try {
        return fn();
      } finally {
        quietDepth -= 1;
        if (quietDepth <= 0) {
          quietDepth = 0;
          startObserve();
        }
      }
    }

    if (typeof MutationObserver !== "undefined" && root) {
      observer = new MutationObserver((mutations) => schedule(mutations));
      startObserve();
    }

    return {
      runQuiet,
      disconnect,
      observe: startObserve,
      shouldIgnoreMutations,
    };
  }

  global.MdToDocxObserve = {
    watch,
    shouldIgnoreMutations,
    isOwnNode,
    isOwnElement,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.MdToDocxObserve;
  }
})(typeof window !== "undefined" ? window : globalThis);
