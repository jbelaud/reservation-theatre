'use client'

import { useState } from 'react'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    folder?: string
    label?: string
}

export function ImageUpload({ value, onChange, folder = 'associations', label = 'Télécharger une image' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    return (
        <div className="space-y-4">
            <CldUploadWidget
                uploadPreset="ml_default"
                options={{
                    folder: folder,
                    maxFiles: 1,
                    resourceType: 'image',
                }}
                onUpload={(result: any) => {
                    setIsUploading(false)
                    if (result.event === 'success') {
                        onChange(result.info.public_id)
                    }
                }}
                onOpen={() => setIsUploading(true)}
                onClose={() => setIsUploading(false)}
            >
                {({ open }) => (
                    <div>
                        {value ? (
                            <div className="relative">
                                <CldImage
                                    src={value}
                                    width="300"
                                    height="300"
                                    crop={{
                                        type: 'auto',
                                        source: true
                                    }}
                                    alt="Image uploadée"
                                    className="rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => onChange('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => open()}
                                disabled={isUploading}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? 'Upload en cours...' : label}
                            </Button>
                        )}
                    </div>
                )}
            </CldUploadWidget>
        </div>
    )
}
