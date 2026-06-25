/**
 * Concurrent booking stress test.
 * Usage: node scripts/booking-concurrency.mjs [baseUrl] [scheduleId] [concurrency]
 */
const baseUrl = process.argv[2] || 'http://localhost:3000/api';
const scheduleId = Number(process.argv[3] || 0);
const concurrency = Number(process.argv[4] || 20);

async function login() {
  const res = await fetch(`${baseUrl}/auth/weapp-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': '1' },
    body: JSON.stringify({ code: 'dev_stress_test' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'login failed');
  return data.accessToken;
}

async function findOpenSchedule(token) {
  if (scheduleId) return scheduleId;
  const res = await fetch(`${baseUrl}/schedules?limit=20`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': '1' },
  });
  const data = await res.json();
  const list = data.data || data;
  const open = list.find((item) => item.capacity > item.bookedCount);
  if (!open) throw new Error('No open schedule found');
  return open.id;
}

async function createBooking(token, targetScheduleId) {
  const res = await fetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': '1',
    },
    body: JSON.stringify({ scheduleId: targetScheduleId }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  const token = await login();
  const targetScheduleId = await findOpenSchedule(token);
  console.log(`Stress test schedule #${targetScheduleId}, concurrency=${concurrency}`);

  const results = await Promise.all(
    Array.from({ length: concurrency }, () => createBooking(token, targetScheduleId)),
  );

  const success = results.filter((r) => r.ok).length;
  const full = results.filter((r) => r.body?.message?.includes('full') || r.status === 400).length;
  const failed = results.length - success;

  console.log({ success, full, failed, total: results.length });
  if (success > 1) {
    console.warn('WARNING: more than one booking succeeded — capacity guard may be broken');
    process.exitCode = 1;
  } else {
    console.log('Capacity guard looks healthy');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
