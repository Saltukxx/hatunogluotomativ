import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST: Kasa işlemi (para ekle/çıkar)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // type: 'EKLE' veya 'CIKAR'
        const transactionType = body.type === 'EKLE' ? 'GELIR' : 'GIDER';
        const category = body.type === 'EKLE' ? 'KASA_GIRISI' : 'KASA_CIKISI';

        const transaction = await prisma.transaction.create({
            data: {
                type: transactionType,
                category: category,
                amount: Math.abs(parseFloat(body.amount)),
                date: new Date(body.date || new Date()),
                description: body.description || (body.type === 'EKLE' ? 'Kasaya para eklendi' : 'Kasadan para çekildi'),
                vehicleId: null, // Kasa işlemleri araçla bağlı değil
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Kasa işlemi yapılırken hata:', error);
        return NextResponse.json({ error: 'Kasa işlemi yapılamadı' }, { status: 500 });
    }
}
