# Security Best Practices - MindBridge

## 🚨 CRITICAL: JWT Key Security

### The Issue That Was Fixed
Your `jwt_key.pem` file containing your JWT private key was being tracked by git and pushed to GitHub. **This is a critical security vulnerability!**

### What We Did
1. ✅ Updated `.gitignore` with comprehensive security patterns
2. ✅ Removed `jwt_key.pem` from git tracking (kept local file)
3. ✅ Removed `mindbridge_backend_implementation.zip` from tracking
4. ✅ Committed changes to protect future sensitive data

### ⚠️ IMPORTANT NEXT STEPS

#### 1. Rotate Your JWT Keys IMMEDIATELY
Since your JWT private key was exposed in git history, you need to generate new keys:

```powershell
# Generate new JWT private key
openssl genpkey -algorithm RSA -out jwt_key_new.pem -pkeyopt rsa_keygen_bits:2048

# Convert to PKCS#8 format
openssl pkcs8 -topk8 -in jwt_key_new.pem -out jwt_key.pem -nocrypt

# Remove old key
Remove-Item jwt_key_new.pem

# Update Convex environment with new key
Get-Content jwt_key.pem -Raw | npx convex env set JWT_PRIVATE_KEY

# Generate new JWKS from the new private key
node -e "const crypto = require('crypto'); const fs = require('fs'); const privateKey = fs.readFileSync('jwt_key.pem', 'utf8'); const publicKey = crypto.createPublicKey(privateKey); const jwk = publicKey.export({ format: 'jwk' }); const jwks = { keys: [{ ...jwk, use: 'sig', alg: 'RS256', kid: 'default' }] }; console.log(JSON.stringify(jwks));" | npx convex env set JWKS
```

#### 2. Clean Git History (OPTIONAL BUT RECOMMENDED)

The sensitive file is still in your git history. To completely remove it:

**Option A: Using git filter-repo (Recommended)**
```powershell
# Install git-filter-repo (if not installed)
pip install git-filter-repo

# Remove file from entire history
git filter-repo --path jwt_key.pem --invert-paths

# Force push to remote
git push origin --force --all
```

**Option B: Using BFG Repo-Cleaner**
```powershell
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files jwt_key.pem

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

**⚠️ WARNING**: Force pushing rewrites history. Coordinate with team members!

#### 3. Check Other Repositories
If you've forked or cloned this repository elsewhere, ensure those copies also:
- Have the updated `.gitignore`
- Have new JWT keys
- Don't expose the old keys

## Protected File Types

The updated `.gitignore` now protects:

### Environment & Configuration
- `.env*` files (all variations)
- `credentials.json`
- `secrets.json`
- `api_keys.json`

### Certificates & Keys
- `*.pem` files (JWT keys, SSL certificates)
- `*.key` files (private keys)
- `*.crt` files (certificates)
- `*.p12` files (PKCS#12 keystores)

### Archives
- `*.zip`, `*.tar`, `*.tar.gz` (often contain backups)
- `*.rar`, `*.7z`

### Database Files
- `*.db`, `*.sqlite`, `*.sqlite3`

### Backups
- `*.bak`, `*.backup`, `*_backup`
- `backup/` directory

### Build & Cache
- `node_modules/`
- `.next/`, `/out/`, `/build/`
- `.cache/`, `.parcel-cache/`
- `convex/_generated/`

## Best Practices Going Forward

### 1. Never Commit Sensitive Data
- API keys
- Private keys
- Passwords
- Database credentials
- JWT secrets
- OAuth client secrets
- Personal access tokens

### 2. Use Environment Variables
Store all secrets in `.env.local`:
```env
# .env.local (NEVER commit this file!)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
JWT_PRIVATE_KEY=your-private-key-here
DATABASE_URL=your-database-url
API_KEY=your-api-key
```

### 3. Use Convex Environment Variables
For backend secrets:
```powershell
npx convex env set SECRET_NAME "secret-value"
```

### 4. Pre-Commit Checks
Add a pre-commit hook to catch sensitive files:

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Check for sensitive patterns
if git diff --cached --name-only | grep -E "\.(pem|key|env)$"; then
    echo "ERROR: Attempting to commit sensitive files!"
    echo "Please remove them from staging."
    exit 1
fi
```

### 5. Regular Security Audits
```powershell
# Check what's tracked by git
git ls-files | Select-String -Pattern "(\.env|\.pem|\.key|secret|credential)" -CaseSensitive:$false

# Check for accidentally tracked files
git status --ignored

# Verify .gitignore is working
git check-ignore -v <file-path>
```

## What to Do If You Accidentally Commit Secrets

1. **DO NOT** just remove the file in a new commit - it's still in history!
2. **Immediately** rotate the exposed credentials
3. Remove from git history (see cleaning instructions above)
4. Check if the exposed credentials were used maliciously
5. Update all environments with new credentials

## GitHub Security Features

Enable these on your repository:

1. **Secret Scanning** - GitHub will alert you to committed secrets
2. **Dependabot** - Alerts for vulnerable dependencies
3. **Branch Protection** - Require reviews before merging
4. **Code Scanning** - Automated security analysis

## Environment-Specific Files

### Safe to Commit
- `.env.example` (template with placeholder values)
- `README.md` with setup instructions
- Configuration schemas

### Never Commit
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

## Example .env.example File

Create this as a template for other developers:

```env
# .env.example - Template for environment variables
# Copy this to .env.local and fill in your actual values

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# JWT (generate your own using OpenSSL)
JWT_PRIVATE_KEY=your-private-key-here
JWKS=your-jwks-json-here

# External APIs (if any)
# OPENAI_API_KEY=your-key-here
# ANALYTICS_ID=your-id-here
```

## Monitoring & Alerts

### GitHub Security Alerts
- Enable "Secret scanning" in repository settings
- Enable "Dependabot alerts"
- Review security tab regularly

### Local Monitoring
```powershell
# Check for high-entropy strings (potential secrets)
git log -p | Select-String -Pattern "[A-Za-z0-9]{20,}"

# Search for API key patterns
git log -p | Select-String -Pattern "(api[_-]?key|secret|token|password)"
```

## Recovery Checklist

If secrets are exposed:

- [ ] Rotate all exposed credentials immediately
- [ ] Check GitHub security alerts
- [ ] Review access logs for suspicious activity
- [ ] Remove secrets from git history
- [ ] Update `.gitignore`
- [ ] Notify team members
- [ ] Update documentation
- [ ] Set up monitoring/alerts
- [ ] Review and update security policies

## Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-secrets by AWS](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)

## Questions?

If you have questions about security practices:
1. Review this document
2. Check the SECURITY.md file (if exists)
3. Consult with your security team
4. Review GitHub's security documentation

---

**Remember**: Security is not a one-time task. Make it a habit to review and update security practices regularly.

**Status**: `.gitignore` updated and sensitive files removed from tracking ✅

**Action Required**: Rotate JWT keys immediately! ⚠️

**Last Updated**: October 12, 2025
