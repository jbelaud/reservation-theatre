// lib/rate-limit.ts
// Rate limiting simple en mémoire (sans Redis)
// Pour production avec plusieurs instances, utiliser @upstash/ratelimit avec Redis

interface RateLimitEntry {
    count: number
    resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les anciennes entrées toutes les 10 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key)
        }
    }
}, 10 * 60 * 1000)

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

/**
 * Vérifie si une requête dépasse la limite de rate limiting
 * @param identifier - Identifiant unique (IP, email, etc.)
 * @param config - Configuration du rate limit
 * @returns Résultat avec success, remaining, reset
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    // Première requête ou fenêtre expirée
    if (!entry || entry.resetAt < now) {
        const resetAt = now + config.windowMs
        rateLimitStore.set(identifier, {
            count: 1,
            resetAt
        })
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: resetAt
        }
    }

    // Incrémenter le compteur
    entry.count++

    // Vérifier si la limite est dépassée
    if (entry.count > config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.resetAt
        }
    }

    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetAt
    }
}

/**
 * Réinitialiser le rate limit pour un identifiant (utile pour les tests)
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier)
}
