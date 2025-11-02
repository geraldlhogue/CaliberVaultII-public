import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'],              // Error rate under 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function () {
  // Test homepage load
  let res = http.get(BASE_URL);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test inventory page
  res = http.get(`${BASE_URL}/inventory`);
  check(res, {
    'inventory status is 200': (r) => r.status === 200,
    'inventory loads in <1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);

  // Test search functionality
  res = http.get(`${BASE_URL}/inventory?search=glock`);
  check(res, {
    'search status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}
