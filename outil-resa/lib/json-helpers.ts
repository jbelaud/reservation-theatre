/**
 * Utilitaires pour la gestion JSON avec SQLite
 * SQLite stocke les JSON en String, donc on doit les parser/stringify
 */

/**
 * Parse un champ JSON stocké en String
 * Gère à la fois les String (SQLite) et les objets (pour compatibilité)
 */
export function parseJsonField<T>(value: unknown, defaultValue: T): T {
    if (value === null || value === undefined) {
        return defaultValue
    }

    // Si c'est déjà un objet/array (migration depuis Postgres), on le retourne
    if (typeof value === 'object') {
        return value as T
    }

    // Si c'est un string, on le parse
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T
        } catch {
            return defaultValue
        }
    }

    return defaultValue
}

/**
 * Stringify un objet pour stockage en SQLite
 */
export function stringifyJsonField(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }
    return JSON.stringify(value)
}

/**
 * Parse les places occupées d'une représentation
 */
export function parsePlacesOccupees(value: unknown): string[] {
    return parseJsonField<string[]>(value, [])
}

/**
 * Parse les sièges d'une réservation
 */
export function parseSieges(value: unknown): string[] {
    return parseJsonField<string[]>(value, [])
}

/**
 * Parse la structure du plan de salle
 */
export function parsePlanStructure(value: unknown): { rangees: any[]; configuration?: string } {
    return parseJsonField(value, { rangees: [], configuration: 'standard' })
}
