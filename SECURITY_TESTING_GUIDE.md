# Security Testing Guide for CaliberVault

## Overview
Comprehensive security testing suite to identify and prevent vulnerabilities in CaliberVault.

## Running Security Tests

### All Security Tests
```bash
npm run test:security
```

### Specific Test Categories
```bash
# Authentication tests only
npx playwright test src/test/security/security.spec.ts -g "Authentication"

# Authorization tests only
npx playwright test src/test/security/security.spec.ts -g "Authorization"

# Injection tests only
npx playwright test src/test/security/security.spec.ts -g "SQL Injection"
```

## Security Test Categories

### 1. Authentication Security

#### Tests Covered
- Unauthorized access prevention
- Password complexity enforcement
- Rate limiting on login attempts
- Session management
- Multi-factor authentication (if enabled)

#### Manual Testing
```bash
# Test weak passwords
1. Navigate to signup page
2. Try passwords: "123", "password", "abc"
3. Verify rejection with clear error messages

# Test rate limiting
1. Attempt 10 failed logins in 1 minute
2. Verify account lockout or CAPTCHA
```

### 2. Authorization Security

#### Tests Covered
- Row Level Security (RLS) policies
- Role-based access control (RBAC)
- Cross-user data access prevention
- API endpoint authorization

#### Verification Checklist
- [ ] Users can only see their own inventory
- [ ] Team members see only shared inventory
- [ ] Admins have appropriate elevated access
- [ ] API calls include proper authorization headers

### 3. SQL Injection Prevention

#### Common Attack Vectors
```sql
-- Test these in search/filter fields
'; DROP TABLE inventory; --
1' OR '1'='1
admin'--
' UNION SELECT * FROM users--
```

#### Protection Mechanisms
- Parameterized queries (Supabase handles this)
- Input sanitization
- Type validation
- Query builder usage

### 4. Cross-Site Scripting (XSS) Prevention

#### Test Payloads
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
```

#### Test Locations
- Search fields
- Item names
- Descriptions
- Comments
- User profiles

#### Protection Mechanisms
- HTML entity encoding
- Content Security Policy (CSP)
- React's built-in XSS protection
- DOMPurify for user-generated content

### 5. Cross-Site Request Forgery (CSRF)

#### Protection Mechanisms
- SameSite cookie attribute
- CSRF tokens in forms
- Origin/Referer header validation
- Supabase JWT authentication

#### Verification
```bash
# Check cookies
1. Open DevTools → Application → Cookies
2. Verify SameSite=Strict or Lax
3. Verify Secure flag on production
```

### 6. Sensitive Data Protection

#### Data Classification
- **Critical**: Passwords, API keys, tokens
- **Sensitive**: Serial numbers, personal info
- **Public**: Product names, categories

#### Protection Checklist
- [ ] No secrets in client-side code
- [ ] No secrets in Git repository
- [ ] Environment variables for all keys
- [ ] Encrypted data at rest
- [ ] HTTPS for all communications

### 7. Session Security

#### Best Practices
- HttpOnly cookies
- Secure flag on production
- Session timeout (30 minutes default)
- Automatic logout on inactivity
- Session invalidation on logout

#### Testing
```bash
# Test session timeout
1. Login to application
2. Wait 30 minutes without activity
3. Try to perform action
4. Verify redirect to login
```

### 8. Input Validation

#### Validation Rules
- Email format validation
- Phone number format
- Numeric ranges (prices, quantities)
- File type restrictions
- File size limits
- String length limits

#### Test Cases
```javascript
// Invalid inputs to test
const invalidInputs = {
  email: ['notanemail', '@example.com', 'user@'],
  price: [-1, 'abc', 999999999],
  quantity: [-5, 0.5, 'ten'],
  phone: ['123', 'abcdefghij'],
};
```

## Automated Security Scanning

### OWASP ZAP
```bash
# Install OWASP ZAP
brew install --cask owasp-zap

# Run automated scan
zap-cli quick-scan http://localhost:5173

# Generate report
zap-cli report -o security-report.html -f html
```

### Snyk (Dependency Scanning)
```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Scan for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

### npm audit
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

## Security Headers

### Required Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Vercel Configuration
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## Supabase Security

### Row Level Security (RLS)
```sql
-- Example RLS policy
CREATE POLICY "Users can only see their own inventory"
ON inventory
FOR SELECT
USING (auth.uid() = user_id);

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### API Key Security
```bash
# Never expose these in client code
SUPABASE_SERVICE_ROLE_KEY  # Server-side only
OPENAI_API_KEY             # Edge functions only
STRIPE_SECRET_KEY          # Edge functions only

# Safe for client
SUPABASE_URL               # Public
SUPABASE_ANON_KEY          # Public (with RLS)
```

## Compliance

### GDPR Compliance
- [ ] Data export functionality
- [ ] Data deletion (right to be forgotten)
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] Data processing agreements

### CCPA Compliance
- [ ] Do Not Sell My Data option
- [ ] Data disclosure
- [ ] Opt-out mechanisms

### SOC 2 Considerations
- [ ] Access controls
- [ ] Audit logging
- [ ] Encryption at rest and in transit
- [ ] Incident response plan

## Penetration Testing

### Manual Testing Checklist
- [ ] Test all authentication flows
- [ ] Attempt privilege escalation
- [ ] Test file upload vulnerabilities
- [ ] Check for information disclosure
- [ ] Test API rate limiting
- [ ] Verify error messages don't leak info
- [ ] Test password reset flow
- [ ] Check for open redirects

### Tools
- **Burp Suite**: Web vulnerability scanner
- **OWASP ZAP**: Automated security testing
- **Nikto**: Web server scanner
- **SQLMap**: SQL injection testing
- **XSSer**: XSS vulnerability scanner

## Security Monitoring

### Real-Time Monitoring
```typescript
// Sentry for error tracking
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Audit Logging
```sql
-- Check audit logs
SELECT * FROM audit_logs 
WHERE action IN ('login_failed', 'unauthorized_access')
ORDER BY created_at DESC
LIMIT 100;
```

## Incident Response

### Security Incident Checklist
1. **Identify**: Detect and confirm incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Document**: Record incident details
6. **Review**: Post-incident analysis

### Emergency Contacts
- Security Team Lead
- Database Administrator
- DevOps Engineer
- Legal/Compliance Officer

## Best Practices

### Development
- Use environment variables for secrets
- Never commit secrets to Git
- Use `.gitignore` for sensitive files
- Regular dependency updates
- Code review for security issues

### Deployment
- Enable HTTPS everywhere
- Use security headers
- Implement rate limiting
- Monitor for suspicious activity
- Regular security audits

### User Education
- Strong password requirements
- Two-factor authentication
- Phishing awareness
- Secure device practices

## Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Security Academy](https://portswigger.net/web-security)
- [Security Headers](https://securityheaders.com/)
