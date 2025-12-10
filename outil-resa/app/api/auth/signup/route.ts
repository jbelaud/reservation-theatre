// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    // L'inscription publique est désactivée
    // Seul l'admin peut créer des comptes via /api/admin/associations
    return NextResponse.json(
        {
            error: 'L\'inscription publique n\'est plus disponible. Veuillez contacter ets-belaud@gmail.com pour obtenir un accès.'
        },
        { status: 403 }
    )
}
