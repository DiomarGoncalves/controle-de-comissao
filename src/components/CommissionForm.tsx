import React, { useState } from 'react';
import { Plus } from 'lucide-react';

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

interface CommissionFormProps {
  onCommissionAdded: (commission: Commission) => void;
}

const CommissionForm: React.FC<CommissionFormProps> = ({ onCommissionAdded }) => {
  const [formData, setFormData] = useState({
    nf_number: '',
    order_number_nectar: '',
    order_number_embrascol: '',
    value_nf: '',
    factor: '0.025'
  });
  const [loading, setLoading] = useState(false);

  const calculateCommission = () => {
    const value = parseFloat(formData.value_nf) || 0;
    const factor = parseFloat(formData.factor) || 0;
    return value * factor;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCommission = await response.json();
        onCommissionAdded(newCommission);
        setFormData({
          nf_number: '',
          order_number_nectar: '',
          order_number_embrascol: '',
          value_nf: '',
          factor: '0.025'
        });
      }
    } catch (error) {
      console.error('Error creating commission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-blue-600" />
          Nova Comissão
        </h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nf_number" className="block text-sm font-medium text-gray-700 mb-2">
              Nº Nota Fiscal
            </label>
            <input
              type="text"
              id="nf_number"
              name="nf_number"
              value={formData.nf_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: 12345"
            />
          </div>

          <div>
            <label htmlFor="order_number_nectar" className="block text-sm font-medium text-gray-700 mb-2">
              Nº Pedido Nectar
            </label>
            <input
              type="text"
              id="order_number_nectar"
              name="order_number_nectar"
              value={formData.order_number_nectar}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: NC001"
            />
          </div>

          <div>
            <label htmlFor="order_number_embrascol" className="block text-sm font-medium text-gray-700 mb-2">
              Nº Pedido Embrascol
            </label>
            <input
              type="text"
              id="order_number_embrascol"
              name="order_number_embrascol"
              value={formData.order_number_embrascol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: EM001"
            />
          </div>

          <div>
            <label htmlFor="value_nf" className="block text-sm font-medium text-gray-700 mb-2">
              Valor NF <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="value_nf"
              name="value_nf"
              value={formData.value_nf}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="factor" className="block text-sm font-medium text-gray-700 mb-2">
              Fator de Comissão
            </label>
            <input
              type="number"
              id="factor"
              name="factor"
              value={formData.factor}
              onChange={handleChange}
              step="0.0001"
              min="0"
              max="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0.025"
            />
            <p className="mt-1 text-xs text-gray-500">
              Padrão: 0.025 (2,5%)
            </p>
          </div>

          {formData.value_nf && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">
                Comissão calculada: 
                <span className="ml-2 text-lg">
                  R$ {calculateCommission().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.value_nf}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Adicionar Comissão'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommissionForm;