/**
 * Add Pulse in three steps.
 * 1. Copy this file next to your module Worker's entry point.
 * 2. Set the plain Worker variable PULSE_PROJECT_ID to the app's public project ID.
 * 3. Import { withPulse } from './pulse.js' and wrap the fetch handler:
 *      export default { fetch: withPulse(handleFetch) };
 *    handleFetch receives the original request, env and ctx.
 *    In production the Worker clock advances on I/O, so use delayed I/O to check slow reports.
 *
 * Copied from project-tracker's pulse/worker.js — do not hand-edit the wrapper logic
 * here, pull a fresh copy from that repo instead.
 */
export function withPulse(handler) {
  return async function (request, env, ctx) {
    const start = performance.now();
    let errorEvent;
    try {
      return await handler.call(this, request, env, ctx);
    } catch (error) {
      errorEvent = { kind: 'server-error', message: pulseErrorName(error), file: '', line: 0, column: 0 };
      throw error;
    } finally {
      try {
        const events = errorEvent ? [errorEvent] : [];
        const ms = Math.ceil(performance.now() - start);
        if (ms > 5000) events.push({ kind: 'server-slow', ms });
        const project_id = env.PULSE_PROJECT_ID;
        if (events.length && typeof project_id === 'string' &&
            /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(project_id)) {
          ctx.waitUntil(fetch('https://brain-api.almon-cohel.workers.dev/?action=pulse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id, events }),
            // Workers refuse redirect: 'error' and the credentials option (fetch rejects, and the
            // .catch below would hide it), so neither is set here.
            redirect: 'manual',
            signal: AbortSignal.timeout(2000),
          }).catch(() => {}));
        }
      } catch { /* Pulse delivery must preserve the original result. */ }
    }
  };
}

function pulseErrorName(error) {
  try {
    const name = error?.name;
    if (typeof name === 'string' && /^(Type|Reference|Syntax|Range|URI|Eval|Aggregate)Error$/.test(name)) return name;
  } catch { /* A thrown value may have a getter that throws. */ }
  return 'Error';
}
