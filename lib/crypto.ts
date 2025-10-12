/**
 * End-to-End Encryption Utilities
 * Simplified implementation inspired by Signal Protocol
 * Uses Web Crypto API for ECDH key exchange and AES-GCM encryption
 */

// Type definitions
export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface SerializedKeyPair {
  publicKey: string // base64
  privateKey: string // base64
}

export interface PreKeyBundle {
  identityKey: string // base64 public key
  signedPreKey: string // base64 public key
  preKey: string // base64 public key
  signature: string // base64 signature
}

export interface EncryptedMessage {
  ciphertext: string // base64
  iv: string // base64
  ephemeralPublicKey: string // base64
}

/**
 * Generate ECDH key pair for identity or ephemeral keys
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable
    ["deriveKey", "deriveBits"]
  )

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

/**
 * Generate signing key pair for signatures
 */
export async function generateSigningKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  )

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

/**
 * Export public key to base64 string
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key)
  return arrayBufferToBase64(exported)
}

/**
 * Export private key to base64 string
 */
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key)
  return arrayBufferToBase64(exported)
}

/**
 * Import public key from base64 string
 */
export async function importPublicKey(
  base64Key: string,
  algorithm: "ECDH" | "ECDSA" = "ECDH"
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key)
  const usages: KeyUsage[] = algorithm === "ECDH" ? [] : ["verify"]

  return await crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: algorithm,
      namedCurve: "P-256",
    },
    true,
    usages
  )
}

/**
 * Import private key from base64 string
 */
export async function importPrivateKey(
  base64Key: string,
  algorithm: "ECDH" | "ECDSA" = "ECDH"
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key)
  const usages: KeyUsage[] = algorithm === "ECDH" ? ["deriveKey", "deriveBits"] : ["sign"]

  return await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    {
      name: algorithm,
      namedCurve: "P-256",
    },
    true,
    usages
  )
}

/**
 * Sign data with ECDSA private key
 */
export async function signData(
  privateKey: CryptoKey,
  data: ArrayBuffer
): Promise<string> {
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    privateKey,
    data
  )

  return arrayBufferToBase64(signature)
}

/**
 * Verify signature with ECDSA public key
 */
export async function verifySignature(
  publicKey: CryptoKey,
  signature: string,
  data: ArrayBuffer
): Promise<boolean> {
  const signatureBuffer = base64ToArrayBuffer(signature)

  return await crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    publicKey,
    signatureBuffer,
    data
  )
}

/**
 * Derive shared secret using ECDH
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false, // not extractable for security
    ["encrypt", "decrypt"]
  )
}

/**
 * Encrypt message with AES-GCM
 */
export async function encryptMessage(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  )

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
  }
}

/**
 * Decrypt message with AES-GCM
 */
export async function decryptMessage(
  key: CryptoKey,
  ciphertext: string,
  iv: string
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext)
  const ivBuffer = base64ToArrayBuffer(iv)

  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(plaintext)
}

/**
 * X3DH-like key exchange: Encrypt a message to a recipient using their pre-key bundle
 */
export async function encryptWithPreKeyBundle(
  message: string,
  preKeyBundle: PreKeyBundle
): Promise<EncryptedMessage> {
  // Generate ephemeral key pair
  const ephemeralKeyPair = await generateKeyPair()

  // Import recipient's public keys
  const recipientIdentityKey = await importPublicKey(preKeyBundle.identityKey)
  const recipientPreKey = await importPublicKey(preKeyBundle.preKey)

  // Perform multiple DH exchanges (simplified X3DH)
  // DH1: ephemeral * identity
  const dh1 = await deriveSharedSecret(
    ephemeralKeyPair.privateKey,
    recipientIdentityKey
  )

  // DH2: ephemeral * preKey
  const dh2 = await deriveSharedSecret(
    ephemeralKeyPair.privateKey,
    recipientPreKey
  )

  // Combine shared secrets using HKDF (simplified: we'll XOR the key material)
  // In production, use proper HKDF
  const sharedSecret = dh1 // Simplified: use first DH result

  // Encrypt message
  const { ciphertext, iv } = await encryptMessage(sharedSecret, message)

  // Export ephemeral public key
  const ephemeralPublicKeyB64 = await exportPublicKey(ephemeralKeyPair.publicKey)

  return {
    ciphertext,
    iv,
    ephemeralPublicKey: ephemeralPublicKeyB64,
  }
}

/**
 * Decrypt message using identity and pre-key private keys
 */
export async function decryptWithPreKeys(
  encryptedMessage: EncryptedMessage,
  identityPrivateKey: CryptoKey,
  preKeyPrivateKey: CryptoKey
): Promise<string> {
  // Import sender's ephemeral public key
  const senderEphemeralKey = await importPublicKey(
    encryptedMessage.ephemeralPublicKey
  )

  // Perform DH to get shared secret
  const sharedSecret = await deriveSharedSecret(
    identityPrivateKey,
    senderEphemeralKey
  )

  // Decrypt message
  return await decryptMessage(
    sharedSecret,
    encryptedMessage.ciphertext,
    encryptedMessage.iv
  )
}

/**
 * Generate pre-key bundle for registration
 */
export async function generatePreKeyBundle(): Promise<{
  identityKeyPair: SerializedKeyPair
  signedPreKeyPair: SerializedKeyPair
  preKeyPairs: SerializedKeyPair[]
  signingKeyPair: SerializedKeyPair
  preKeyBundle: PreKeyBundle
}> {
  // Generate identity key (long-term)
  const identityKeyPair = await generateKeyPair()

  // Generate signed pre-key
  const signedPreKeyPair = await generateKeyPair()

  // Generate one-time pre-keys (in production, generate ~100)
  const preKeyPairs: KeyPair[] = []
  for (let i = 0; i < 10; i++) {
    preKeyPairs.push(await generateKeyPair())
  }

  // Generate signing key
  const signingKeyPair = await generateSigningKeyPair()

  // Sign the signed pre-key with signing key
  const signedPreKeyPublicExport = await exportPublicKey(
    signedPreKeyPair.publicKey
  )
  const signedPreKeyData = base64ToArrayBuffer(signedPreKeyPublicExport)
  const signature = await signData(signingKeyPair.privateKey, signedPreKeyData)

  // Create pre-key bundle (using first pre-key)
  const preKeyBundle: PreKeyBundle = {
    identityKey: await exportPublicKey(identityKeyPair.publicKey),
    signedPreKey: signedPreKeyPublicExport,
    preKey: await exportPublicKey(preKeyPairs[0].publicKey),
    signature,
  }

  // Serialize all keys
  const serializedIdentityKeyPair: SerializedKeyPair = {
    publicKey: await exportPublicKey(identityKeyPair.publicKey),
    privateKey: await exportPrivateKey(identityKeyPair.privateKey),
  }

  const serializedSignedPreKeyPair: SerializedKeyPair = {
    publicKey: await exportPublicKey(signedPreKeyPair.publicKey),
    privateKey: await exportPrivateKey(signedPreKeyPair.privateKey),
  }

  const serializedPreKeyPairs: SerializedKeyPair[] = []
  for (const preKeyPair of preKeyPairs) {
    serializedPreKeyPairs.push({
      publicKey: await exportPublicKey(preKeyPair.publicKey),
      privateKey: await exportPrivateKey(preKeyPair.privateKey),
    })
  }

  const serializedSigningKeyPair: SerializedKeyPair = {
    publicKey: await exportPublicKey(signingKeyPair.publicKey),
    privateKey: await exportPrivateKey(signingKeyPair.privateKey),
  }

  return {
    identityKeyPair: serializedIdentityKeyPair,
    signedPreKeyPair: serializedSignedPreKeyPair,
    preKeyPairs: serializedPreKeyPairs,
    signingKeyPair: serializedSigningKeyPair,
    preKeyBundle,
  }
}

/**
 * Simple KDF for ratcheting (in production, use HKDF)
 */
export async function ratchetKey(key: CryptoKey): Promise<CryptoKey> {
  // Export key material
  const keyMaterial = await crypto.subtle.exportKey("raw", key)

  // Hash with SHA-256
  const hashed = await crypto.subtle.digest("SHA-256", keyMaterial)

  // Import as new AES key
  return await crypto.subtle.importKey(
    "raw",
    hashed,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  )
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Store keys securely in browser
 */
export const KeyStorage = {
  async saveIdentityKeyPair(matchId: string, keyPair: SerializedKeyPair) {
    localStorage.setItem(`identity_${matchId}`, JSON.stringify(keyPair))
  },

  async getIdentityKeyPair(matchId: string): Promise<SerializedKeyPair | null> {
    const stored = localStorage.getItem(`identity_${matchId}`)
    return stored ? JSON.parse(stored) : null
  },

  async savePreKeyPair(matchId: string, keyPair: SerializedKeyPair) {
    localStorage.setItem(`prekey_${matchId}`, JSON.stringify(keyPair))
  },

  async getPreKeyPair(matchId: string): Promise<SerializedKeyPair | null> {
    const stored = localStorage.getItem(`prekey_${matchId}`)
    return stored ? JSON.parse(stored) : null
  },

  async clearKeys(matchId: string) {
    localStorage.removeItem(`identity_${matchId}`)
    localStorage.removeItem(`prekey_${matchId}`)
  },
}
