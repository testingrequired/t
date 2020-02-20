export default function createSpy() {
  const calls: any[] = [];

  function spy(...args: any[]) {
    calls.push(args);
  }

  spy.calls = calls;

  spy.clear = () => (calls.length = 0);

  return spy;
}
