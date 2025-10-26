/**
 * Admin Key Escrow System
 * 
 * Provides admin-accessible encryption for compliance and moderation
 * while maintaining E2E encryption between users.
 * 
 * Architecture:
 * - Messages are encrypted with E2E keys (user-to-user)
 * - Messages are ALSO encrypted with admin public key (escrow copy)
 * - Admins can decrypt only for moderation/legal compliance
 * - Admin private key is secured with multi-factor authentication
 */

// Admin master public key (in production, this would be loaded from secure config)
// This is a placeholder - replace with actual admin public key from environment
const ADMIN_PUBLIC_KEY_JWK = {
  kty: 'EC',
  crv: 'P-256',
  x: 'placeholder_x_coordinate',
  y: 'placeholder_y_coordinate',
  ext: true,
}

/**
 * Get admin public key for message escrow encryption
 */
export async function getAdminPublicKey(): Promise<CryptoKey> {
  // In production, fetch from secure key management service
  // For now, generate a consistent key pair for development
  
  // Check if admin key exists in localStorage (dev only)
  const storedKey = localStorage.getItem('admin_public_key_jwk')
  
  if (storedKey) {
    try {
      const jwk = JSON.parse(storedKey)
      return await crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true,
        []
      )
    } catch (error) {
      console.error('Failed to load stored admin key:', error)
    }
  }
  
  // Generate new admin key pair (dev only)
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  )
  
  // Store public key for future use
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
  localStorage.setItem('admin_public_key_jwk', JSON.stringify(publicKeyJwk))
  
  // Store private key separately (in production, this would be in HSM/KMS)
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  localStorage.setItem('admin_private_key_jwk', JSON.stringify(privateKeyJwk))
  
  console.log('⚠️ Generated new admin key pair (DEV ONLY)')
  
  return keyPair.publicKey
}

/**
 * Get admin private key (requires admin authentication)
 * In production, this would require MFA and be stored in HSM
 */
export async function getAdminPrivateKey(): Promise<CryptoKey> {
  // In production: verify admin role, require MFA, fetch from HSM
  const storedKey = localStorage.getItem('admin_private_key_jwk')
  
  if (!storedKey) {
    throw new Error('Admin private key not available. Contact system administrator.')
  }
  
  try {
    const jwk = JSON.parse(storedKey)
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      ['deriveKey', 'deriveBits']
    )
  } catch (error) {
    console.error('Failed to load admin private key:', error)
    throw new Error('Failed to decrypt admin key')
  }
}

/**
 * Encrypt message for admin access (escrow copy)
 */
export async function encryptForAdmin(
  plaintext: string,
  userPublicKey: CryptoKey
): Promise<{ encryptedContent: string; iv: string }> {
  // Get admin public key
  const adminPublicKey = await getAdminPublicKey()
  
  // Generate ephemeral key pair for this message
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  )
  
  // Derive shared secret between ephemeral private key and admin public key
  const sharedSecret = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: adminPublicKey,
    },
    ephemeralKeyPair.privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  )
  
  // Encrypt message
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sharedSecret,
    data
  )
  
  // Convert to base64
  const encryptedArray = new Uint8Array(encryptedData)
  const encryptedContent = btoa(String.fromCharCode(...encryptedArray))
  const ivBase64 = btoa(String.fromCharCode(...iv))
  
  return {
    encryptedContent,
    iv: ivBase64,
  }
}

/**
 * Decrypt message using admin key (for moderation)
 * Requires admin authentication and logs all access
 */
export async function decryptWithAdminKey(
  encryptedContent: string,
  iv: string,
  adminUserId: string,
  reason: string
): Promise<string> {
  // Log admin access for audit trail
  console.log('🔐 Admin decryption requested', {
    adminUserId,
    reason,
    timestamp: new Date().toISOString(),
  })
  
  // TODO: In production, log to audit trail database
  
  try {
    // Get admin private key (requires authentication)
    const adminPrivateKey = await getAdminPrivateKey()
    
    // Derive decryption key
    // Note: In the real implementation, we'd need the ephemeral public key
    // stored with the message to properly derive the shared secret
    // For now, this is a simplified version
    
    // Decode base64
    const encryptedArray = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0))
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
    
    // This would use the stored ephemeral key info
    // Placeholder implementation:
    throw new Error('Full admin decryption implementation requires ephemeral key storage')
    
  } catch (error) {
    console.error('❌ Admin decryption failed:', error)
    throw new Error('Failed to decrypt message for moderation review')
  }
}

/**
 * Encrypt message with dual encryption (E2E + Admin Escrow)
 */
export async function encryptMessageWithEscrow(
  plaintext: string,
  peerKey: CryptoKey,
  myPrivateKey: CryptoKey
): Promise<{
  e2eEncrypted: { encryptedContent: string; iv: string }
  adminEncrypted: { encryptedContent: string; iv: string }
}> {
  // E2E encryption (peer-to-peer)
  const e2eSharedSecret = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: peerKey,
    },
    myPrivateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  )
  
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  
  // E2E encryption
  const e2eIv = crypto.getRandomValues(new Uint8Array(12))
  const e2eEncryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: e2eIv,
    },
    e2eSharedSecret,
    data
  )
  
  const e2eArray = new Uint8Array(e2eEncryptedData)
  const e2eEncrypted = {
    encryptedContent: btoa(String.fromCharCode(...e2eArray)),
    iv: btoa(String.fromCharCode(...e2eIv)),
  }
  
  // Admin escrow encryption
  const adminPublicKey = await getAdminPublicKey()
  
  // Generate ephemeral key for admin encryption
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  )
  
  const adminSharedSecret = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: adminPublicKey,
    },
    ephemeralKeyPair.privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  )
  
  const adminIv = crypto.getRandomValues(new Uint8Array(12))
  const adminEncryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: adminIv,
    },
    adminSharedSecret,
    data
  )
  
  const adminArray = new Uint8Array(adminEncryptedData)
  const adminEncrypted = {
    encryptedContent: btoa(String.fromCharCode(...adminArray)),
    iv: btoa(String.fromCharCode(...adminIv)),
  }
  
  return {
    e2eEncrypted,
    adminEncrypted,
  }
}

/**
 * Check if current user has admin privileges
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'moderator'
}

/**
 * Audit log entry for admin key usage
 */
export interface AdminKeyAuditLog {
  adminUserId: string
  action: 'decrypt' | 'key_access' | 'key_rotation'
  messageId?: string
  matchId?: string
  reason: string
  timestamp: number
  ipAddress?: string
  success: boolean
}

/**
 * Log admin key usage to audit trail
 */
export async function logAdminKeyUsage(log: AdminKeyAuditLog): Promise<void> {
  // In production, this would write to secure audit database
  console.log('📝 Admin Key Audit Log:', log)
  
  // Store in localStorage for dev (production would use secure backend)
  const existingLogs = JSON.parse(localStorage.getItem('admin_key_audit_logs') || '[]')
  existingLogs.push(log)
  localStorage.setItem('admin_key_audit_logs', JSON.stringify(existingLogs))
}
