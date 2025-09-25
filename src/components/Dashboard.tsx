import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CommissionForm from './CommissionForm';
import CommissionList from './CommissionList';
import { LogOut, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Commission {
  id: string;
  nf_number?: string;
  order_number_nectar?: string;
  order_number_embrascol?: string;
  value_nf: number;
  factor: number;
  commission_value: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  useEffect(() => {
    filterCommissions();
  }, [commissions, filter]);

  const fetchCommissions = async () => {
    try {
      const response = await fetch('/api/commissions', {
        credentials: 'include'
      });
      const data = await response.json();
      setCommissions(data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommissions = () => {
    let filtered = commissions;
    
    if (filter === 'pending') {
      filtered = commissions.filter(c => !c.is_paid);
    } else if (filter === 'paid') {
      filtered = commissions.filter(c => c.is_paid);
    }
    
    setFilteredCommissions(filtered);
  };

  const handleCommissionAdded = (newCommission: Commission) => {
    setCommissions(prev => [newCommission, ...prev]);
  };

  const handleCommissionUpdated = (updatedCommission: Commission) => {
    setCommissions(prev => 
      prev.map(c => c.id === updatedCommission.id ? updatedCommission : c)
    );
  };

  const handleCommissionDeleted = (deletedId: string) => {
    setCommissions(prev => prev.filter(c => c.id !== deletedId));
  };

  const exportCSV = async () => {
    try {
      const response = await fetch('/api/commissions/export', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'comissoes.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const stats = {
    total: commissions.length,
    pending: commissions.filter(c => !c.is_paid).length,
    paid: commissions.filter(c => c.is_paid).length,
    totalValue: commissions.reduce((sum, c) => sum + Number(c.commission_value), 0),
    pendingValue: commissions.filter(c => !c.is_paid).reduce((sum, c) => sum + Number(c.commission_value), 0),
    paidValue: commissions.filter(c => c.is_paid).reduce((sum, c) => sum + Number(c.commission_value), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Comissões
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Olá, {user?.username}
              </span>
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Comissões</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">
                  R$ {stats.pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.paid}</p>
                <p className="text-sm text-gray-500">
                  R$ {stats.paidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {stats.total > 0 ? (stats.totalValue / stats.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <CommissionForm onCommissionAdded={handleCommissionAdded} />
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                    Lista de Comissões
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex rounded-lg border">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                          filter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          filter === 'pending'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Pendentes
                      </button>
                      <button
                        onClick={() => setFilter('paid')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                          filter === 'paid'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Pagas
                      </button>
                    </div>
                    <button
                      onClick={exportCSV}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>

              <CommissionList 
                commissions={filteredCommissions}
                onCommissionUpdated={handleCommissionUpdated}
                onCommissionDeleted={handleCommissionDeleted}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;