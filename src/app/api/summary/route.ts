import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Özet istatistikler
export async function GET() {
    try {
        // Tüm araçları al
        const vehicles = await prisma.vehicle.findMany({
            include: { transactions: true },
        });

        // Tüm işlemleri al
        const transactions = await prisma.transaction.findMany();

        // Ayarları al (veya varsayılanları kullan)
        let settings = await prisma.settings.findUnique({
            where: { id: 'singleton' },
        });

        if (!settings) {
            settings = await prisma.settings.create({
                data: { id: 'singleton' },
            });
        }

        // Hesaplamalar
        const stokVehicles = vehicles.filter((v) => v.status === 'STOKTA');
        const soldVehicles = vehicles.filter((v) => v.status === 'SATILDI');

        // Toplam stok değeri (alış fiyatları toplamı)
        const totalStockValue = stokVehicles.reduce(
            (sum, v) => sum + v.purchasePrice,
            0
        );

        // Toplam gelir (tüm GELIR işlemleri)
        const totalIncome = transactions
            .filter((t) => t.type === 'GELIR')
            .reduce((sum, t) => sum + t.amount, 0);

        // Toplam gider (tüm GIDER işlemleri)
        const totalExpense = transactions
            .filter((t) => t.type === 'GIDER')
            .reduce((sum, t) => sum + t.amount, 0);

        // Brüt kar/zarar (Gelir - Gider)
        const grossProfitLoss = totalIncome - totalExpense;

        // Araç bazlı kar hesaplama (sadece satılan araçlar için)
        let totalVehicleProfit = 0;
        const vehicleProfits = soldVehicles.map((vehicle) => {
            // Araç için yapılan tüm giderler (alış dahil)
            const vehicleExpenses = vehicle.transactions
                .filter((t) => t.type === 'GIDER')
                .reduce((sum, t) => sum + t.amount, 0);

            // Kar = Satış - Toplam Gider (alış + masraflar)
            const profit = (vehicle.sellingPrice || 0) - vehicleExpenses;
            totalVehicleProfit += profit;

            // Ek masraflar (alış hariç)
            const additionalExpenses = vehicleExpenses - vehicle.purchasePrice;

            return {
                id: vehicle.id,
                name: `${vehicle.make} ${vehicle.model}`,
                year: vehicle.year,
                purchasePrice: vehicle.purchasePrice,
                additionalExpenses: additionalExpenses,
                totalCost: vehicleExpenses,
                sellingPrice: vehicle.sellingPrice,
                profit,
                profitMargin: vehicle.sellingPrice
                    ? ((profit / vehicle.sellingPrice) * 100).toFixed(1)
                    : 0,
            };
        });

        // ==========================================
        // VERGİ HESAPLAMALARI (Türkiye Mevzuatı)
        // ==========================================

        // Sadece pozitif kar üzerinden vergi hesaplanır
        const taxableProfit = totalVehicleProfit > 0 ? totalVehicleProfit : 0;

        // KDV Hesaplaması (Araç satışlarından tahsil edilen KDV - Alışlarda ödenen KDV)
        // Basit hesaplama: Net kar üzerinden tahmini
        const vatRate = settings.vatRate / 100;
        const estimatedVat = taxableProfit * vatRate;

        // Gelir Vergisi (Kar üzerinden)
        const incomeTaxRate = settings.incomeTaxRate / 100;
        const estimatedIncomeTax = taxableProfit * incomeTaxRate;

        // Toplam Vergi Yükü
        const totalTaxBurden = estimatedVat + estimatedIncomeTax;

        // Vergi Sonrası Net Kar (Gerçek kazanç)
        const netProfitAfterTax = totalVehicleProfit - totalTaxBurden;

        // Kasa durumu (Başlangıç + Gelirler - Giderler)
        const cashBalance = settings.initialBalance + grossProfitLoss;

        // Aylık istatistikler
        const now = new Date();
        const thisMonth = transactions.filter((t) => {
            const txDate = new Date(t.date);
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        });

        const monthlyIncome = thisMonth.filter((t) => t.type === 'GELIR').reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpense = thisMonth.filter((t) => t.type === 'GIDER').reduce((sum, t) => sum + t.amount, 0);

        return NextResponse.json({
            summary: {
                // Kasa ve Stok
                cashBalance,
                initialBalance: settings.initialBalance,
                totalStockValue,
                vehiclesInStock: stokVehicles.length,
                vehiclesSold: soldVehicles.length,
                totalVehicles: vehicles.length,

                // Gelir/Gider
                totalIncome,
                totalExpense,
                grossProfitLoss,

                // Kar Analizi
                totalVehicleProfit,

                // Vergi Analizi (detaylı)
                vatRate: settings.vatRate,
                incomeTaxRate: settings.incomeTaxRate,
                taxableProfit,
                estimatedVat,
                estimatedIncomeTax,
                totalTaxBurden,
                netProfitAfterTax,

                // Aylık
                monthlyIncome,
                monthlyExpense,
                monthlyProfit: monthlyIncome - monthlyExpense,
            },
            vehicleProfits,
            settings,
        });
    } catch (error) {
        console.error('Özet alınırken hata:', error);
        return NextResponse.json({ error: 'Özet alınamadı' }, { status: 500 });
    }
}
