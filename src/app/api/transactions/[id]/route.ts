import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Tek işlem detayı
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { vehicle: true },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'İşlem bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('İşlem detayı alınırken hata:', error);
        return NextResponse.json({ error: 'İşlem alınamadı' }, { status: 500 });
    }
}

// PUT: İşlem güncelle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                type: body.type,
                category: body.category,
                amount: parseFloat(body.amount),
                date: new Date(body.date),
                description: body.description || null,
                vehicleId: body.vehicleId || null,
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('İşlem güncellenirken hata:', error);
        return NextResponse.json({ error: 'İşlem güncellenemedi' }, { status: 500 });
    }
}

// DELETE: İşlem sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.transaction.delete({ where: { id } });
        return NextResponse.json({ message: 'İşlem silindi' });
    } catch (error) {
        console.error('İşlem silinirken hata:', error);
        return NextResponse.json({ error: 'İşlem silinemedi' }, { status: 500 });
    }
}
