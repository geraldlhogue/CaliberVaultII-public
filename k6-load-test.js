import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const inventoryLoadTime = new Trend('inventory_load_time');
const searchTime = new Trend('search_time');
const addItemTime = new Trend('add_item_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Spike to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    errors: ['rate<0.05'], // Custom error rate < 5%
    inventory_load_time: ['p(95)<1000'],
    search_time: ['p(95)<300'],
    add_item_time: ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const SUPABASE_URL = __ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;

export default function () {
  // Test 1: Load homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Load inventory (simulated API call)
  const startInventory = Date.now();
  response = http.get(`${SUPABASE_URL}/rest/v1/inventory?select=*&limit=50`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  const inventoryDuration = Date.now() - startInventory;
  inventoryLoadTime.add(inventoryDuration);
  
  check(response, {
    'inventory status is 200': (r) => r.status === 200,
    'inventory returns data': (r) => JSON.parse(r.body).length > 0,
  }) || errorRate.add(1);

  sleep(2);

  // Test 3: Search functionality
  const startSearch = Date.now();
  response = http.get(`${SUPABASE_URL}/rest/v1/inventory?name=ilike.*Glock*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  const searchDuration = Date.now() - startSearch;
  searchTime.add(searchDuration);
  
  check(response, {
    'search status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Filter by category
  response = http.get(`${SUPABASE_URL}/rest/v1/inventory?category=eq.firearms`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  check(response, {
    'filter status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: Load manufacturers
  response = http.get(`${SUPABASE_URL}/rest/v1/manufacturers?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  check(response, {
    'manufacturers status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

// Spike test scenario
export function spikeTest() {
  const response = http.get(`${BASE_URL}/`);
  check(response, {
    'spike test status is 200': (r) => r.status === 200,
  });
}

// Stress test scenario
export function stressTest() {
  const response = http.get(`${SUPABASE_URL}/rest/v1/inventory?select=*&limit=100`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  check(response, {
    'stress test status is 200': (r) => r.status === 200,
  });
}

// Soak test scenario (long duration)
export function soakTest() {
  const response = http.get(`${BASE_URL}/`);
  check(response, {
    'soak test status is 200': (r) => r.status === 200,
  });
  sleep(5);
}
