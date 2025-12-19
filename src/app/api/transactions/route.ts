import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Tüm işlemleri getir
export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                vehicle: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('İşlemler alınırken hata:', error);
        return NextResponse.json({ error: 'İşlemler alınamadı' }, { status: 500 });
    }
}

// POST: Yeni işlem (gider) ekle
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const transaction = await prisma.transaction.create({
            data: {
                type: body.type,
                category: body.category,
                amount: parseFloat(body.amount),
                date: new Date(body.date),
                description: body.description || null,
                vehicleId: body.vehicleId || null,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('İşlem eklenirken hata:', error);
        return NextResponse.json({ error: 'İşlem eklenemedi' }, { status: 500 });
    }
}
