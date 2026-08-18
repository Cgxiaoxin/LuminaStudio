const API = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TENANT_ID = '1';

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': TENANT_ID,
    ...(options.headers || {}),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.details ? JSON.stringify(body.details) : '';
    throw new Error(body.message ? `${body.message} ${detail}` : `HTTP ${res.status} ${path}`);
  }
  return body;
}

async function main() {
  console.log('1. Admin login...');
  const admin = await api('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const adminHeaders = { Authorization: `Bearer ${admin.accessToken}` };

  console.log('1b. Reset prior bookings for re-run...');
  const existing = await api('/bookings?limit=50', { headers: adminHeaders });
  for (const booking of existing.data || []) {
    if (!['CANCELED', 'COMPLETED'].includes(booking.status)) {
      await api(`/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ reason: 'e2e reset' }),
      }).catch(() => {});
    }
  }

  console.log('2. List stores...');
  const stores = await api('/stores', { headers: adminHeaders });
  const storeList = stores.data || stores;
  if (!storeList.length) throw new Error('No stores found — run seed first');

  console.log('3. List schedules...');
  const schedules = await api('/schedules?limit=10', { headers: adminHeaders });
  const scheduleList = schedules.data || schedules;
  const paidSchedule = scheduleList.find((s) => Number(s.service?.price) > 0);
  const freeSchedule = scheduleList.find((s) => Number(s.service?.price) === 0);
  if (!paidSchedule || !freeSchedule) throw new Error('Seed schedules missing');

  console.log('4. WeChat login...');
  const clientAuth = await api('/auth/weapp-login', {
    method: 'POST',
    body: JSON.stringify({ code: 'e2e_test_code' }),
  });
  const clientHeaders = { Authorization: `Bearer ${clientAuth.accessToken}` };

  console.log('5. Free booking...');
  const freeBooking = await api('/bookings', {
    method: 'POST',
    headers: clientHeaders,
    body: JSON.stringify({ scheduleId: freeSchedule.id }),
  });
  if (freeBooking.booking.status !== 'CONFIRMED') {
    throw new Error(`Expected CONFIRMED, got ${freeBooking.booking.status}`);
  }

  console.log('6. Paid booking + payment...');
  await api(`/bookings/${paidSchedule.id}`, { headers: clientHeaders }).catch(() => {});
  const paidBooking = await api('/bookings', {
    method: 'POST',
    headers: clientHeaders,
    body: JSON.stringify({ scheduleId: paidSchedule.id }),
  });
  if (!paidBooking.order) throw new Error('Expected order for paid booking');

  const pay = await api('/payments/unified-order', {
    method: 'POST',
    headers: clientHeaders,
    body: JSON.stringify({ orderId: paidBooking.order.id, channel: 'wechat' }),
  });
  await api(`/payments/notify/${pay.payment.id}`, {
    method: 'POST',
    headers: clientHeaders,
    body: JSON.stringify({ transactionId: `e2e_tx_${Date.now()}`, success: true }),
  });

  const paidConfirmed = await api(`/bookings/${paidBooking.booking.id}`, { headers: adminHeaders });
  if (paidConfirmed.status !== 'CONFIRMED') {
    throw new Error(`Paid booking not confirmed: ${paidConfirmed.status}`);
  }

  console.log('7. Check-in + complete...');
  await api(`/bookings/${freeBooking.booking.id}/check-in`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({}),
  });
  await api(`/bookings/${freeBooking.booking.id}/complete`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({}),
  });

  const completed = await api(`/bookings/${freeBooking.booking.id}`, { headers: adminHeaders });
  if (completed.status !== 'COMPLETED') {
    throw new Error(`Expected COMPLETED, got ${completed.status}`);
  }

  console.log('E2E flow passed.');
}

main().catch((err) => {
  console.error('E2E flow failed:', err.message);
  process.exit(1);
});
