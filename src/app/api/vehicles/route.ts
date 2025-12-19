import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Tüm araçları getir
export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                transactions: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(vehicles);
    } catch (error) {
        console.error('Araç listesi alınırken hata:', error);
        return NextResponse.json({ error: 'Araçlar alınamadı' }, { status: 500 });
    }
}

// POST: Yeni araç ekle
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const vehicle = await prisma.vehicle.create({
            data: {
                make: body.make,
                model: body.model,
                year: parseInt(body.year),
                package: body.package || null,
                vin: body.vin || null,
                plate: body.plate || null,
                status: 'STOKTA',
                purchasePrice: parseFloat(body.purchasePrice),
                purchaseDate: new Date(body.purchaseDate),
                description: body.description || null,
                imageUrl: body.imageUrl || null,
            },
        });

        // Araç alışını otomatik olarak gider olarak kaydet
        await prisma.transaction.create({
            data: {
                type: 'GIDER',
                category: 'ARAC_ALISI',
                amount: parseFloat(body.purchasePrice),
                date: new Date(body.purchaseDate),
                description: `${body.make} ${body.model} alışı`,
                vehicleId: vehicle.id,
            },
        });

        return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
        console.error('Araç eklenirken hata:', error);
        return NextResponse.json({ error: 'Araç eklenemedi' }, { status: 500 });
    }
}
