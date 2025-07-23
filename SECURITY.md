# Security Policy

## Supported Versions

We actively support the following versions of Project Atlas:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Project Atlas, please report it to us privately.

### How to Report

1. **Email**: Send details to security@project-atlas.dev
2. **GitHub**: Use the private vulnerability reporting feature
3. **Discord**: Contact moderators in our Discord server

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Depends on severity (1-30 days)

## Security Best Practices

### For Users

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Use environment variables for all sensitive data
3. **Database**: Use strong passwords and limit access
4. **Network**: Run behind a firewall in production
5. **Updates**: Keep dependencies up to date

### For Contributors

1. **Dependencies**: Regularly audit dependencies with `npm audit`
2. **Code Review**: All security-related changes require review
3. **Testing**: Include security tests for new features
4. **Documentation**: Update security docs when needed

## Known Security Considerations

### Current Limitations

1. **File System Access**: The application requires file system access for repository analysis
2. **Git Operations**: Clones repositories which may contain malicious code
3. **Code Execution**: Static analysis only - no code execution
4. **Network Access**: Requires internet access for Git operations

### Mitigation Strategies

1. **Sandboxing**: Run in containerized environments
2. **Resource Limits**: Configure memory and CPU limits
3. **Network Isolation**: Limit outbound network access
4. **Input Validation**: All user inputs are validated
5. **Rate Limiting**: API endpoints are rate-limited

## Security Features

### Built-in Security

- **Input Validation**: All API inputs are validated
- **SQL Injection Protection**: Using parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CORS Configuration**: Configurable CORS settings
- **Rate Limiting**: Configurable rate limiting
- **JWT Authentication**: Secure token-based authentication

### Configuration Security

```env
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Vulnerability Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Report vulnerabilities privately first
2. **Coordinated Disclosure**: Work with us on timing
3. **Public Disclosure**: After fix is released and deployed
4. **Credit**: Security researchers will be credited (if desired)

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 0.1.1 → 0.1.2)
- Documented in CHANGELOG.md
- Announced on our security mailing list
- Tagged with `security` label in releases

## Contact

For security-related questions or concerns:

- **Email**: security@project-atlas.dev
- **PGP Key**: Available on request
- **Response Time**: Within 24 hours

---

Thank you for helping keep Project Atlas secure!