export const emit = (n: string) => window.dispatchEvent(new Event(n));
export const on = (n: string, f: () => void) => {
  window.addEventListener(n, f);
  return () => window.removeEventListener(n, f);
};
