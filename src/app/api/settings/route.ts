import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Ayarları getir
export async function GET() {
    try {
        let settings = await prisma.settings.findUnique({
            where: { id: 'singleton' },
        });

        if (!settings) {
            settings = await prisma.settings.create({
                data: { id: 'singleton' },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Ayarlar alınırken hata:', error);
        return NextResponse.json({ error: 'Ayarlar alınamadı' }, { status: 500 });
    }
}

// PUT: Ayarları güncelle (başlangıç bakiyesi dahil)
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        const settings = await prisma.settings.upsert({
            where: { id: 'singleton' },
            update: {
                initialBalance: body.initialBalance !== undefined ? parseFloat(body.initialBalance) : undefined,
                vatRate: body.vatRate !== undefined ? parseFloat(body.vatRate) : undefined,
                incomeTaxRate: body.incomeTaxRate !== undefined ? parseFloat(body.incomeTaxRate) : undefined,
            },
            create: {
                id: 'singleton',
                initialBalance: parseFloat(body.initialBalance || 0),
                vatRate: parseFloat(body.vatRate || 20),
                incomeTaxRate: parseFloat(body.incomeTaxRate || 15),
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Ayarlar güncellenirken hata:', error);
        return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
    }
}
