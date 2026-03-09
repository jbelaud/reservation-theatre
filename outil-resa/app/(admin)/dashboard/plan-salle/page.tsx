'use client'

import { useEffect, useState } from 'react'
import { SeatingPlanEditor } from '@/components/seating-plan-editor'
import { useToast } from '@/components/ui/use-toast'
import { DashboardHeader } from '@/components/admin/dashboard-header'

// Helper pour parser la structure (compatibilité SQLite/PostgreSQL)
const parsePlanStructure = (structure: unknown): { rangees: any[]; configuration?: string; pmrDouble?: boolean } => {
    if (typeof structure === 'object' && structure !== null) {
        return structure as any
    }
    if (typeof structure === 'string') {
        try { return JSON.parse(structure) } catch { return { rangees: [], configuration: 'standard', pmrDouble: true } }
    }
    return { rangees: [], configuration: 'standard', pmrDouble: true }
}

export default function PlanSallePage() {
    const [plan, setPlan] = useState<any>(null)
    const [associationName, setAssociationName] = useState('Théâtre')
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        Promise.all([
            fetch('/api/plan-salle').then(res => res.json()),
            fetch('/api/association').then(res => res.json())
        ])
            .then(([planData, assoData]) => {
                setPlan(planData)
                setAssociationName(assoData.nom || 'Théâtre')
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleSave = async (structure: any) => {
        try {
            const res = await fetch('/api/plan-salle', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    structure: {
                        rangees: structure.rangees,
                        configuration: structure.configuration,
                        pmrDouble: structure.pmrDouble
                    }
                })
            })

            if (!res.ok) throw new Error('Erreur sauvegarde')

            const updatedPlan = await res.json()
            setPlan(updatedPlan)

            const representationsCount = updatedPlan.representationsUpdated || 0

            toast({
                title: "Plan sauvegardé",
                description: `Capacité mise à jour : ${updatedPlan.capaciteTotal} places${representationsCount > 0 ? ` • ${representationsCount} représentation(s) synchronisée(s)` : ''}`,
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder le plan",
                variant: "destructive"
            })
        }
    }

    if (loading) return <div className="p-8">Chargement...</div>

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-8 py-2.5 mb-8">
                <div className="flex items-center justify-end">
                    <DashboardHeader associationName={associationName} />
                </div>
            </div>

            <div className="p-8 max-w-[1600px] mx-auto pt-0">
                <h1 className="text-3xl font-bold mb-2">Configuration de la salle</h1>
                <p className="text-slate-600 mb-8">
                    Définissez la structure de votre salle. Cette configuration sera utilisée pour le placement automatique.
                </p>

                {plan && (
                    <SeatingPlanEditor
                        initialStructure={parsePlanStructure(plan.structure)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    )
}

