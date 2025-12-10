'use client'

import { Button } from '@/components/ui/button'

export function PrintButton() {
    return (
        <Button className="w-full" onClick={() => window.print()}>
            Imprimer / Enregistrer PDF
        </Button>
    )
}
