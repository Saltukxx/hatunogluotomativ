'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  DollarSign,
  Package,
  ReceiptText,
  PiggyBank,
  Calculator,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit,
  Trash2,
  Menu,
} from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  package?: string;
  plate?: string;
  status: string;
  purchasePrice: number;
  purchaseDate: string;
  sellingPrice?: number;
  saleDate?: string;
  description?: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  vehicleId?: string;
  vehicle?: Vehicle;
}

interface Summary {
  cashBalance: number;
  initialBalance: number;
  totalStockValue: number;
  vehiclesInStock: number;
  vehiclesSold: number;
  totalVehicles: number;
  totalIncome: number;
  totalExpense: number;
  grossProfitLoss: number;
  totalVehicleProfit: number;
  vatRate: number;
  incomeTaxRate: number;
  taxableProfit: number;
  estimatedVat: number;
  estimatedIncomeTax: number;
  totalTaxBurden: number;
  netProfitAfterTax: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyProfit: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

const statusLabels: Record<string, string> = {
  STOKTA: 'Stokta',
  SATILDI: 'Satıldı',
  REZERVE: 'Rezerve',
};

const statusStyles: Record<string, string> = {
  STOKTA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SATILDI: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REZERVE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const categoryLabels: Record<string, string> = {
  ARAC_SATISI: 'Araç Satışı',
  ARAC_ALISI: 'Araç Alışı',
  BAKIM: 'Bakım/Onarım',
  VERGI: 'Vergi',
  NOTER: 'Noter',
  KOMISYON: 'Komisyon',
  KASA_GIRISI: 'Kasa Girişi',
  KASA_CIKISI: 'Kasa Çıkışı',
  DIGER: 'Diğer',
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isKasaDialogOpen, setIsKasaDialogOpen] = useState(false);
  const [isEditTxDialogOpen, setIsEditTxDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    package: '',
    plate: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'BAKIM',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vehicleId: '',
  });

  const [sellForm, setSellForm] = useState({
    sellingPrice: '',
    saleDate: new Date().toISOString().split('T')[0],
  });

  const [kasaForm, setKasaForm] = useState({
    type: 'EKLE',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [vehiclesRes, transactionsRes, summaryRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/transactions'),
        fetch('/api/summary'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const transactionsData = await transactionsRes.json();
      const summaryData = await summaryRes.json();

      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setSummary(summaryData.summary || null);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleForm),
      });
      setIsVehicleDialogOpen(false);
      setVehicleForm({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        package: '',
        plate: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        description: '',
      });
      fetchData();
    } catch (error) {
      console.error('Araç eklenirken hata:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          type: 'GIDER',
          vehicleId: expenseForm.vehicleId === 'none' ? null : expenseForm.vehicleId,
        }),
      });
      setIsExpenseDialogOpen(false);
      setExpenseForm({
        category: 'BAKIM',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        vehicleId: '',
      });
      fetchData();
    } catch (error) {
      console.error('Gider eklenirken hata:', error);
    }
  };

  const handleSellVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      await fetch(`/api/vehicles/${selectedVehicle.id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellForm),
      });
      setIsSellDialogOpen(false);
      setSellForm({
        sellingPrice: '',
        saleDate: new Date().toISOString().split('T')[0],
      });
      setSelectedVehicle(null);
      fetchData();
    } catch (error) {
      console.error('Satış yapılırken hata:', error);
    }
  };

  const handleKasaTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/kasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kasaForm),
      });
      setIsKasaDialogOpen(false);
      setKasaForm({
        type: 'EKLE',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      fetchData();
    } catch (error) {
      console.error('Kasa işlemi yapılırken hata:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    try {
      await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTransaction.type,
          category: selectedTransaction.category,
          amount: selectedTransaction.amount,
          date: selectedTransaction.date,
          description: selectedTransaction.description,
          vehicleId: selectedTransaction.vehicleId,
        }),
      });
      setIsEditTxDialogOpen(false);
      setSelectedTransaction(null);
      fetchData();
    } catch (error) {
      console.error('İşlem güncellenirken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Hatunoğlu Otomotiv</h1>
                <p className="text-xs sm:text-sm text-zinc-500 hidden sm:block">Araç Takip ve Finans Yönetimi</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Kasa Dialog */}
              <Dialog open={isKasaDialogOpen} onOpenChange={setIsKasaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300">
                    <PiggyBank className="h-4 w-4 mr-2" />
                    Kasa İşlemi
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Kasa İşlemi</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleKasaTransaction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={kasaForm.type === 'EKLE' ? 'default' : 'outline'}
                        className={kasaForm.type === 'EKLE'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'}
                        onClick={() => setKasaForm({ ...kasaForm, type: 'EKLE' })}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Para Ekle
                      </Button>
                      <Button
                        type="button"
                        variant={kasaForm.type === 'CIKAR' ? 'default' : 'outline'}
                        className={kasaForm.type === 'CIKAR'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'}
                        onClick={() => setKasaForm({ ...kasaForm, type: 'CIKAR' })}
                      >
                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                        Para Çek
                      </Button>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Tutar (₺)</Label>
                      <Input
                        type="number"
                        value={kasaForm.amount}
                        onChange={(e) => setKasaForm({ ...kasaForm, amount: e.target.value })}
                        placeholder="50000"
                        required
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Tarih</Label>
                      <Input
                        type="date"
                        value={kasaForm.date}
                        onChange={(e) => setKasaForm({ ...kasaForm, date: e.target.value })}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Açıklama</Label>
                      <Input
                        value={kasaForm.description}
                        onChange={(e) => setKasaForm({ ...kasaForm, description: e.target.value })}
                        placeholder="Örn: Banka havalesi, nakit giriş..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      className={`w-full ${kasaForm.type === 'EKLE'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'} text-white`}
                    >
                      {kasaForm.type === 'EKLE' ? 'Kasaya Ekle' : 'Kasadan Çek'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Gider Ekle */}
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300">
                    <ReceiptText className="h-4 w-4 mr-2" />
                    Gider Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Yeni Gider Ekle</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                      <Label className="text-zinc-300">Kategori</Label>
                      <Select
                        value={expenseForm.category}
                        onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="BAKIM" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Bakım/Onarım</SelectItem>
                          <SelectItem value="VERGI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Vergi</SelectItem>
                          <SelectItem value="NOTER" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Noter</SelectItem>
                          <SelectItem value="KOMISYON" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Komisyon</SelectItem>
                          <SelectItem value="DIGER" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Bağlı Araç (Opsiyonel)</Label>
                      <Select
                        value={expenseForm.vehicleId || 'none'}
                        onValueChange={(value) => setExpenseForm({ ...expenseForm, vehicleId: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Araç seçin..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="none" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Genel Gider</SelectItem>
                          {vehicles.filter(v => v.status === 'STOKTA').map((v) => (
                            <SelectItem key={v.id} value={v.id} className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                              {v.make} {v.model} ({v.plate || 'Plakasız'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">Tutar (₺)</Label>
                        <Input
                          type="number"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          placeholder="5000"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Tarih</Label>
                        <Input
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          required
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Açıklama</Label>
                      <Input
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        placeholder="Gider açıklaması..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Gider Ekle
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Araç Ekle */}
              <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Araç Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Yeni Araç Ekle</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">Marka</Label>
                        <Input
                          value={vehicleForm.make}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                          placeholder="BMW"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Model</Label>
                        <Input
                          value={vehicleForm.model}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                          placeholder="320i"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">Yıl</Label>
                        <Input
                          type="number"
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                          required
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Plaka</Label>
                        <Input
                          value={vehicleForm.plate}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                          placeholder="34 ABC 123"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-zinc-300">Alış Fiyatı (₺)</Label>
                        <Input
                          type="number"
                          value={vehicleForm.purchasePrice}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, purchasePrice: e.target.value })}
                          placeholder="500000"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Alış Tarihi</Label>
                        <Input
                          type="date"
                          value={vehicleForm.purchaseDate}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })}
                          required
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Açıklama / Notlar</Label>
                      <Input
                        value={vehicleForm.description}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                        placeholder="Araç hakkında notlar..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Araç Ekle
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-3 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"
              onClick={() => { setIsKasaDialogOpen(true); setMobileMenuOpen(false); }}
            >
              <PiggyBank className="h-4 w-4 mr-2" />
              Kasa İşlemi
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"
              onClick={() => { setIsExpenseDialogOpen(true); setMobileMenuOpen(false); }}
            >
              <ReceiptText className="h-4 w-4 mr-2" />
              Gider Ekle
            </Button>
            <Button
              className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => { setIsVehicleDialogOpen(true); setMobileMenuOpen(false); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Araç Ekle
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Summary Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Kasa */}
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Kasa</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">
                {formatCurrency(summary?.cashBalance || 0)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Mevcut nakit durumu</p>
            </CardContent>
          </Card>

          {/* Stok Değeri */}
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Stok Değeri</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {formatCurrency(summary?.totalStockValue || 0)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {summary?.vehiclesInStock || 0} araç stokta
              </p>
            </CardContent>
          </Card>

          {/* Brüt Kar */}
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Brüt Kar</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(summary?.totalVehicleProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(summary?.totalVehicleProfit || 0)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {summary?.vehiclesSold || 0} araç satıldı
              </p>
            </CardContent>
          </Card>

          {/* Net Kar (Vergi Sonrası) */}
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Net Kar</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(summary?.netProfitAfterTax || 0) >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {formatCurrency(summary?.netProfitAfterTax || 0)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Vergi sonrası</p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">Vergi Analizi</CardTitle>
                <p className="text-sm text-zinc-500">Tahmini vergi yükümlülükleri</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Vergiye Tabi Kar</p>
                <p className="text-xl font-semibold text-white">{formatCurrency(summary?.taxableProfit || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">KDV (%{summary?.vatRate || 20})</p>
                <p className="text-xl font-semibold text-red-400">{formatCurrency(summary?.estimatedVat || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Gelir V. (%{summary?.incomeTaxRate || 15})</p>
                <p className="text-xl font-semibold text-red-400">{formatCurrency(summary?.estimatedIncomeTax || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Toplam Vergi</p>
                <p className="text-xl font-semibold text-red-400">{formatCurrency(summary?.totalTaxBurden || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger
              value="vehicles"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <Car className="h-4 w-4 mr-2" />
              Araçlar ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <ReceiptText className="h-4 w-4 mr-2" />
              İşlemler ({transactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Araç Envanteri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Araç</TableHead>
                        <TableHead className="text-zinc-400 hidden sm:table-cell">Plaka</TableHead>
                        <TableHead className="text-zinc-400">Durum</TableHead>
                        <TableHead className="text-zinc-400 text-right hidden md:table-cell">Alış</TableHead>
                        <TableHead className="text-zinc-400 text-right hidden lg:table-cell">Masraf</TableHead>
                        <TableHead className="text-zinc-400 text-right hidden md:table-cell">Satış</TableHead>
                        <TableHead className="text-zinc-400 text-right">Kar</TableHead>
                        <TableHead className="text-zinc-400 text-center">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => {
                        const vehicleExpenses = vehicle.transactions
                          .filter((t) => t.type === 'GIDER')
                          .reduce((sum, t) => sum + t.amount, 0);
                        const additionalExpenses = vehicleExpenses - vehicle.purchasePrice;
                        const profit = vehicle.status === 'SATILDI' && vehicle.sellingPrice
                          ? vehicle.sellingPrice - vehicleExpenses
                          : null;

                        return (
                          <TableRow key={vehicle.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-white">
                              <div>
                                <span>{vehicle.make} {vehicle.model}</span>
                                <span className="text-zinc-500 ml-2">({vehicle.year})</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-300 hidden sm:table-cell">{vehicle.plate || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusStyles[vehicle.status]}>
                                {statusLabels[vehicle.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 hidden md:table-cell">{formatCurrency(vehicle.purchasePrice)}</TableCell>
                            <TableCell className="text-right text-zinc-300 hidden lg:table-cell">
                              {additionalExpenses > 0 ? formatCurrency(additionalExpenses) : '-'}
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 hidden md:table-cell">
                              {vehicle.sellingPrice ? formatCurrency(vehicle.sellingPrice) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {profit !== null ? (
                                <span className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(profit)}
                                </span>
                              ) : (
                                <span className="text-zinc-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {vehicle.status === 'STOKTA' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsSellDialogOpen(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Sat
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {vehicles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-zinc-500 py-12">
                            <Car className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Henüz araç eklenmemiş.</p>
                            <p className="text-sm">Yukarıdaki &quot;Araç Ekle&quot; butonuna tıklayarak başlayın.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Son İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Tarih</TableHead>
                        <TableHead className="text-zinc-400 hidden sm:table-cell">Tür</TableHead>
                        <TableHead className="text-zinc-400">Kategori</TableHead>
                        <TableHead className="text-zinc-400 hidden md:table-cell">Açıklama</TableHead>
                        <TableHead className="text-zinc-400 hidden lg:table-cell">Bağlı Araç</TableHead>
                        <TableHead className="text-zinc-400 text-right">Tutar</TableHead>
                        <TableHead className="text-zinc-400 text-center">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell className="text-zinc-300">{formatDate(tx.date)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'GELIR'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                              }`}>
                              {tx.type === 'GELIR' ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {tx.type === 'GELIR' ? 'Gelir' : 'Gider'}
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">{categoryLabels[tx.category] || tx.category}</TableCell>
                          <TableCell className="text-zinc-300 hidden md:table-cell">{tx.description || '-'}</TableCell>
                          <TableCell className="text-zinc-300 hidden lg:table-cell">
                            {tx.vehicle ? `${tx.vehicle.make} ${tx.vehicle.model}` : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${tx.type === 'GELIR' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'GELIR' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedTransaction({ ...tx, date: tx.date.split('T')[0] });
                                  setIsEditTxDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-zinc-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-zinc-500 py-12">
                            <ReceiptText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Henüz işlem bulunmuyor.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sell Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedVehicle && `${selectedVehicle.make} ${selectedVehicle.model} Satışı`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSellVehicle} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Satış Fiyatı (₺)</Label>
              <Input
                type="number"
                value={sellForm.sellingPrice}
                onChange={(e) => setSellForm({ ...sellForm, sellingPrice: e.target.value })}
                placeholder="600000"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Satış Tarihi</Label>
              <Input
                type="date"
                value={sellForm.saleDate}
                onChange={(e) => setSellForm({ ...sellForm, saleDate: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Satışı Onayla
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTxDialogOpen} onOpenChange={setIsEditTxDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">İşlem Düzenle</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <form onSubmit={handleEditTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedTransaction.type === 'GELIR' ? 'default' : 'outline'}
                  className={selectedTransaction.type === 'GELIR'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'}
                  onClick={() => setSelectedTransaction({ ...selectedTransaction, type: 'GELIR' })}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gelir
                </Button>
                <Button
                  type="button"
                  variant={selectedTransaction.type === 'GIDER' ? 'default' : 'outline'}
                  className={selectedTransaction.type === 'GIDER'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'}
                  onClick={() => setSelectedTransaction({ ...selectedTransaction, type: 'GIDER' })}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Gider
                </Button>
              </div>
              <div>
                <Label className="text-zinc-300">Kategori</Label>
                <Select
                  value={selectedTransaction.category}
                  onValueChange={(value) => setSelectedTransaction({ ...selectedTransaction, category: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="ARAC_SATISI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Araç Satışı</SelectItem>
                    <SelectItem value="ARAC_ALISI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Araç Alışı</SelectItem>
                    <SelectItem value="BAKIM" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Bakım/Onarım</SelectItem>
                    <SelectItem value="VERGI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Vergi</SelectItem>
                    <SelectItem value="NOTER" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Noter</SelectItem>
                    <SelectItem value="KOMISYON" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Komisyon</SelectItem>
                    <SelectItem value="KASA_GIRISI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Kasa Girişi</SelectItem>
                    <SelectItem value="KASA_CIKISI" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Kasa Çıkışı</SelectItem>
                    <SelectItem value="DIGER" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Tutar (₺)</Label>
                  <Input
                    type="number"
                    value={selectedTransaction.amount}
                    onChange={(e) => setSelectedTransaction({ ...selectedTransaction, amount: parseFloat(e.target.value) || 0 })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Tarih</Label>
                  <Input
                    type="date"
                    value={typeof selectedTransaction.date === 'string' ? selectedTransaction.date.split('T')[0] : ''}
                    onChange={(e) => setSelectedTransaction({ ...selectedTransaction, date: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">Açıklama</Label>
                <Input
                  value={selectedTransaction.description || ''}
                  onChange={(e) => setSelectedTransaction({ ...selectedTransaction, description: e.target.value })}
                  placeholder="Açıklama..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Kaydet
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
