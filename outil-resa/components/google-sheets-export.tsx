'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Reservation {
    id: string
    prenom: string
    nom: string
    telephone: string
    email?: string
    nbPlaces: number
    sieges: string[]
    statut: string
}

interface GoogleSheetsExportProps {
    representationId: string
    representationTitle: string
    representationDate: string
    reservations: Reservation[]
}

export function GoogleSheetsExport({
    representationId,
    representationTitle,
    representationDate,
    reservations,
}: GoogleSheetsExportProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleExport = () => {
        // Filtrer uniquement les réservations confirmées et présentes
        const activeReservations = reservations.filter(
            (r) => r.statut === 'confirmé' || r.statut === 'présent'
        )

        // Créer les en-têtes
        const headers = ['Nom', 'Prénom', 'Téléphone', 'Email', 'Nombre de places', 'Numéros de places']

        // Créer les lignes de données
        const rows = activeReservations.map((r) => {
            // Trier les sièges pour un affichage cohérent
            const siegesSorted = [...r.sieges].sort((a, b) => {
                // Extraire la rangée et le numéro (ex: "A-1" -> ["A", "1"])
                const [rowA, numA] = a.split('-')
                const [rowB, numB] = b.split('-')

                // Comparer d'abord par rangée
                if (rowA !== rowB) {
                    return rowA.localeCompare(rowB)
                }

                // Puis par numéro
                return parseInt(numA) - parseInt(numB)
            })

            return [
                r.nom.toUpperCase(),
                r.prenom,
                r.telephone,
                r.email || '',
                r.nbPlaces.toString(),
                siegesSorted.join(', '),
            ]
        })

        // Créer le contenu CSV avec BOM pour Excel/Google Sheets
        const BOM = '\uFEFF'
        const csvContent = [
            headers.join(';'),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
        ].join('\n')

        // Créer le blob et télécharger
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)

        // Nom de fichier avec date et titre de la représentation
        const fileName = `${representationTitle.replace(/[^a-z0-9]/gi, '_')}_${representationDate.replace(/[^a-z0-9]/gi, '_')}_spectateurs.csv`
        link.download = fileName
        link.click()

        // Fermer le dialogue après un court délai
        setTimeout(() => setIsOpen(false), 500)
    }

    const activeCount = reservations.filter(
        (r) => r.statut === 'confirmé' || r.statut === 'présent'
    ).length

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Exporter vers Google Sheets
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Export pour Google Sheets
                    </DialogTitle>
                    <DialogDescription>
                        Exportez la liste des spectateurs pour l'importer dans Google Sheets
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Informations sur l'export */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <strong>{activeCount} spectateur{activeCount > 1 ? 's' : ''}</strong> sera
                            {activeCount > 1 ? 'ont' : ''} exporté{activeCount > 1 ? 's' : ''} (réservations confirmées et présentes uniquement).
                        </AlertDescription>
                    </Alert>

                    {/* Aperçu des colonnes */}
                    <div>
                        <h4 className="font-semibold mb-2">Colonnes exportées :</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Nom (en majuscules)</li>
                            <li>Prénom</li>
                            <li>Téléphone</li>
                            <li>Email</li>
                            <li>Nombre de places</li>
                            <li>Numéros de places (triés par rangée et numéro)</li>
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-blue-900">📝 Comment importer dans Google Sheets :</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                            <li>Cliquez sur "Télécharger le fichier CSV" ci-dessous</li>
                            <li>Ouvrez <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Sheets</a> (gratuit avec un compte Google)</li>
                            <li>Créez une nouvelle feuille vierge</li>
                            <li>Allez dans <strong>Fichier → Importer</strong></li>
                            <li>Cliquez sur l'onglet <strong>"Importer"</strong> puis glissez votre fichier CSV ou cliquez pour le sélectionner</li>
                            <li>
                                <strong>Important :</strong> Dans les options d'import :
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li>Type de séparateur : <strong>Point-virgule</strong></li>
                                    <li>Emplacement : <strong>"Remplacer la feuille de calcul actuelle"</strong></li>
                                </ul>
                            </li>
                            <li>Cliquez sur <strong>"Importer les données"</strong></li>
                        </ol>
                    </div>

                    {/* Note sur les alternatives */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                            💡 <strong>Pas d'Excel ?</strong> Google Sheets est 100% gratuit et fonctionne dans votre navigateur.
                            Alternatives : <a href="https://www.libreoffice.org/" target="_blank" rel="noopener noreferrer" className="underline">LibreOffice Calc</a> (gratuit, installable)
                            ou <a href="https://www.office.com/launch/excel" target="_blank" rel="noopener noreferrer" className="underline">Excel Online</a> (gratuit avec compte Microsoft).
                        </p>
                    </div>

                    {/* Bouton de téléchargement */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleExport} className="gap-2">
                            <Download className="h-4 w-4" />
                            Télécharger le fichier CSV
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
