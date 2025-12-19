import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST: Araç satışı yap
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            return NextResponse.json({ error: 'Araç bulunamadı' }, { status: 404 });
        }

        // Aracı SATILDI olarak güncelle
        const updatedVehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                status: 'SATILDI',
                sellingPrice: parseFloat(body.sellingPrice),
                saleDate: new Date(body.saleDate || new Date()),
            },
        });

        // Satışı gelir olarak kaydet
        await prisma.transaction.create({
            data: {
                type: 'GELIR',
                category: 'ARAC_SATISI',
                amount: parseFloat(body.sellingPrice),
                date: new Date(body.saleDate || new Date()),
                description: `${vehicle.make} ${vehicle.model} satışı`,
                vehicleId: id,
            },
        });

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        console.error('Satış yapılırken hata:', error);
        return NextResponse.json({ error: 'Satış yapılamadı' }, { status: 500 });
    }
}
