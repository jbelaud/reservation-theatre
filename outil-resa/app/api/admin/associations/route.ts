// app/api/admin/associations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateSlug } from '@/lib/auth'
import { verifyAdminToken } from '@/lib/admin-auth'

// GET - Liste toutes les associations avec statistiques
export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification admin
        const token = request.cookies.get('admin_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const payload = await verifyAdminToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
        }

        // Récupérer toutes les associations avec leurs statistiques
        const associations = await prisma.association.findMany({
            include: {
                _count: {
                    select: {
                        representations: true,
                        plansSalle: true
                    }
                },
                paiements: {
                    orderBy: { datePaiement: 'desc' },
                    take: 5
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Formater les données
        const formattedAssociations = associations.map(assoc => ({
            id: assoc.id,
            nom: assoc.nom,
            slug: assoc.slug,
            email: assoc.email,
            telephone: assoc.telephone,
            licenceActive: assoc.licenceActive,
            licenceExpire: assoc.licenceExpire,
            createdAt: assoc.createdAt,
            nbRepresentations: assoc._count.representations,
            nbPlansSalle: assoc._count.plansSalle,
            paiements: assoc.paiements
        }))

        return NextResponse.json({ associations: formattedAssociations })

    } catch (error) {
        console.error('Error fetching associations:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

// POST - Créer une nouvelle association (admin uniquement)
export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification admin
        const token = request.cookies.get('admin_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const payload = await verifyAdminToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
        }

        const body = await request.json()
        const { nom, email, password, telephone, slug: customSlug } = body

        // Validation
        if (!nom || !email || !password) {
            return NextResponse.json(
                { error: 'Nom, email et mot de passe requis' },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        // Vérifier email unique
        const existingEmail = await prisma.association.findUnique({
            where: { email }
        })
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email déjà utilisé' },
                { status: 400 }
            )
        }

        // Générer ou vérifier slug
        const slug = customSlug || generateSlug(nom)
        const existingSlug = await prisma.association.findUnique({
            where: { slug }
        })
        if (existingSlug) {
            return NextResponse.json(
                { error: 'Ce slug est déjà pris, choisissez-en un autre' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Créer association + plan de salle par défaut
        const association = await prisma.association.create({
            data: {
                nom,
                slug,
                email,
                password: hashedPassword,
                telephone: telephone || null,
                plansSalle: {
                    create: {
                        nom: 'Salle principale',
                        capaciteTotal: 100,
                        structure: JSON.stringify({
                            rangees: [
                                { id: 'A', sieges: 12 },
                                { id: 'B', sieges: 14 },
                                { id: 'C', sieges: 14 },
                                { id: 'D', sieges: 12 },
                                { id: 'E', sieges: 12 },
                                { id: 'F', sieges: 12 },
                                { id: 'G', sieges: 12 },
                                { id: 'H', sieges: 12 }
                            ]
                        })
                    }
                }
            },
            include: {
                plansSalle: true,
                _count: {
                    select: {
                        representations: true
                    }
                }
            }
        })

        return NextResponse.json({
            association: {
                id: association.id,
                nom: association.nom,
                slug: association.slug,
                email: association.email,
                telephone: association.telephone,
                licenceActive: association.licenceActive,
                createdAt: association.createdAt,
                nbRepresentations: association._count.representations
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating association:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
// PATCH - Modifier une association (admin uniquement)
export async function PATCH(request: NextRequest) {
    try {
        // Vérifier l'authentification admin
        const token = request.cookies.get('admin_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const payload = await verifyAdminToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
        }

        const body = await request.json()
        const { id, nom, email, password, telephone, slug: customSlug, licenceActive } = body

        if (!id) {
            return NextResponse.json({ error: 'ID requis' }, { status: 400 })
        }

        // Vérifier si l'association existe
        const existingAssoc = await prisma.association.findUnique({
            where: { id }
        })

        if (!existingAssoc) {
            return NextResponse.json({ error: 'Association introuvable' }, { status: 404 })
        }

        // Préparer les données à mettre à jour
        const updateData: any = {
            nom,
            email,
            telephone: telephone || null,
        }

        // Mise à jour de la licence si fournie
        if (typeof licenceActive === 'boolean') {
            updateData.licenceActive = licenceActive
        }

        // Gestion du changement d'email
        if (email !== existingAssoc.email) {
            const emailExists = await prisma.association.findUnique({
                where: { email }
            })
            if (emailExists) {
                return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
            }
        }

        // Gestion du changement de slug
        if (customSlug && customSlug !== existingAssoc.slug) {
            const slugExists = await prisma.association.findUnique({
                where: { slug: customSlug }
            })
            if (slugExists) {
                return NextResponse.json({ error: 'Ce slug est déjà pris' }, { status: 400 })
            }
            updateData.slug = customSlug
        }

        // Gestion du mot de passe (optionnel)
        if (password && password.length >= 8) {
            console.log('Updating password for association:', id)
            updateData.password = await hashPassword(password)
        } else if (password && password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        // Mise à jour
        const updatedAssoc = await prisma.association.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        representations: true
                    }
                }
            }
        })

        return NextResponse.json({
            association: {
                id: updatedAssoc.id,
                nom: updatedAssoc.nom,
                slug: updatedAssoc.slug,
                email: updatedAssoc.email,
                telephone: updatedAssoc.telephone,
                licenceActive: updatedAssoc.licenceActive,
                createdAt: updatedAssoc.createdAt,
                nbRepresentations: updatedAssoc._count.representations
            }
        })

    } catch (error) {
        console.error('Error updating association:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
