# Security Quick Reference 🔒

## ✅ What's Protected Now

Your `.gitignore` now protects these files from being committed:

- ✅ `.env*` files (all variations)
- ✅ `jwt_key.pem` and all `*.pem` files
- ✅ `*.key` files (private keys)
- ✅ `*.zip` archives
- ✅ Credentials and secrets files
- ✅ Database files
- ✅ Backup files

## 🚨 Critical Actions Required

### 1. Rotate Your JWT Keys (DO THIS NOW!)

Your JWT private key was exposed in git. Generate new keys:

```powershell
# Generate new key
openssl genpkey -algorithm RSA -out jwt_key_new.pem -pkeyopt rsa_keygen_bits:2048
openssl pkcs8 -topk8 -in jwt_key_new.pem -out jwt_key.pem -nocrypt
Remove-Item jwt_key_new.pem

# Update Convex
Get-Content jwt_key.pem -Raw | npx convex env set JWT_PRIVATE_KEY

# Generate and set JWKS
node -e "const crypto = require('crypto'); const fs = require('fs'); const privateKey = fs.readFileSync('jwt_key.pem', 'utf8'); const publicKey = crypto.createPublicKey(privateKey); const jwk = publicKey.export({ format: 'jwk' }); const jwks = { keys: [{ ...jwk, use: 'sig', alg: 'RS256', kid: 'default' }] }; console.log(JSON.stringify(jwks));" | npx convex env set JWKS
```

### 2. Push Your Changes

```powershell
git push origin main
```

### 3. Optional: Clean Git History

To completely remove exposed files from history:

```powershell
# Install git-filter-repo
pip install git-filter-repo

# Remove jwt_key.pem from entire history
git filter-repo --path jwt_key.pem --invert-paths

# Force push
git push origin --force --all
```

**⚠️ Warning**: Force push rewrites history. Coordinate with your team!

## 📋 Quick Checks

### Verify .gitignore is Working
```powershell
# Check if file is ignored
git check-ignore -v jwt_key.pem

# Should output: .gitignore:65:*_key.pem jwt_key.pem
```

### Check What's Tracked
```powershell
# List tracked files
git ls-files

# Search for sensitive patterns
git ls-files | Select-String -Pattern "(\.env|\.pem|\.key|secret)"
```

### Before Committing
```powershell
# Always check status
git status

# Review changes
git diff

# Check staged files
git diff --cached
```

## 🛡️ Best Practices

### DO ✅
- Use `.env.local` for secrets (it's ignored)
- Store secrets in Convex environment variables
- Use `.env.example` as a template
- Review files before committing
- Keep security docs updated

### DON'T ❌
- Commit `.env` or `.env.local` files
- Commit API keys, passwords, or tokens
- Commit `*.pem` or `*.key` files
- Commit database files
- Commit backup or zip files with data

## 📁 File Protection Summary

| File Type | Protected | Location |
|-----------|-----------|----------|
| `.env.local` | ✅ Yes | Line 37 of `.gitignore` |
| `jwt_key.pem` | ✅ Yes | Line 65 of `.gitignore` |
| `*.pem` | ✅ Yes | Line 22 & 64 of `.gitignore` |
| `*.key` | ✅ Yes | Line 23 & 65 of `.gitignore` |
| `*.zip` | ✅ Yes | Line 95 of `.gitignore` |
| `.env.example` | ❌ No (template) | Safe to commit |

## 🆘 Emergency Contacts

If you've accidentally committed secrets:

1. **Stop immediately** - Don't push if not pushed yet
2. **Rotate credentials** - Change all exposed secrets
3. **Remove from git** - Use `git rm --cached <file>`
4. **Clean history** - Use git-filter-repo or BFG
5. **Document incident** - Update security logs

## 📚 More Information

- Full guide: `SECURITY_GUIDE.md`
- Environment template: `.env.example`
- Protected patterns: `.gitignore`

---

**Status**: Security measures implemented ✅  
**Action**: Rotate JWT keys immediately ⚠️  
**Updated**: October 12, 2025
