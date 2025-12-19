import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Tek araç detayı
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { transactions: true },
        });

        if (!vehicle) {
            return NextResponse.json({ error: 'Araç bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error('Araç detayı alınırken hata:', error);
        return NextResponse.json({ error: 'Araç alınamadı' }, { status: 500 });
    }
}

// PUT: Araç güncelle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                make: body.make,
                model: body.model,
                year: parseInt(body.year),
                package: body.package || null,
                vin: body.vin || null,
                plate: body.plate || null,
                status: body.status,
                purchasePrice: parseFloat(body.purchasePrice),
                purchaseDate: new Date(body.purchaseDate),
                sellingPrice: body.sellingPrice ? parseFloat(body.sellingPrice) : null,
                saleDate: body.saleDate ? new Date(body.saleDate) : null,
                description: body.description || null,
                imageUrl: body.imageUrl || null,
            },
        });

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error('Araç güncellenirken hata:', error);
        return NextResponse.json({ error: 'Araç güncellenemedi' }, { status: 500 });
    }
}

// DELETE: Araç sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.vehicle.delete({ where: { id } });
        return NextResponse.json({ message: 'Araç silindi' });
    } catch (error) {
        console.error('Araç silinirken hata:', error);
        return NextResponse.json({ error: 'Araç silinemedi' }, { status: 500 });
    }
}
