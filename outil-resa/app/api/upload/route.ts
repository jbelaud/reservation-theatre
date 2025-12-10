import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const uniqueId = uuidv4()
        const originalName = file.name
        const extension = originalName.split('.').pop()
        const filename = `${uniqueId}.${extension}`

        // Save to public/uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return NextResponse.json({
            url: `/uploads/${filename}`,
            success: true
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload' },
            { status: 500 }
        )
    }
}
