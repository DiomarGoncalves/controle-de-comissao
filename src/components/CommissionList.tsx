import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, DollarSign } from 'lucide-react';

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

interface CommissionListProps {
  commissions: Commission[];
  onCommissionUpdated: (commission: Commission) => void;
  onCommissionDeleted: (id: string) => void;
}

const CommissionList: React.FC<CommissionListProps> = ({
  commissions,
  onCommissionUpdated,
  onCommissionDeleted,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Commission>>({});

  const handleEdit = (commission: Commission) => {
    setEditingId(commission.id);
    setEditData({ ...commission });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/commissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedCommission = await response.json();
        onCommissionUpdated(updatedCommission);
        setEditingId(null);
        setEditData({});
      }
    } catch (error) {
      console.error('Error updating commission:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta comissão?')) {
      try {
        const response = await fetch(`/api/commissions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          onCommissionDeleted(id);
        }
      } catch (error) {
        console.error('Error deleting commission:', error);
      }
    }
  };

  const togglePaidStatus = async (commission: Commission) => {
    try {
      const response = await fetch(`/api/commissions/${commission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ is_paid: !commission.is_paid }),
      });

      if (response.ok) {
        const updatedCommission = await response.json();
        onCommissionUpdated(updatedCommission);
      }
    } catch (error) {
      console.error('Error updating commission status:', error);
    }
  };

  if (commissions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Nenhuma comissão encontrada</p>
        <p className="text-sm">Adicione uma nova comissão usando o formulário ao lado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NF / Pedidos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor NF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fator
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comissão
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {commissions.map((commission) => (
            <tr key={commission.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                {editingId === commission.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.nf_number || ''}
                      onChange={(e) => setEditData({ ...editData, nf_number: e.target.value })}
                      className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                      placeholder="NF"
                    />
                    <input
                      type="text"
                      value={editData.order_number_nectar || ''}
                      onChange={(e) => setEditData({ ...editData, order_number_nectar: e.target.value })}
                      className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                      placeholder="Nectar"
                    />
                    <input
                      type="text"
                      value={editData.order_number_embrascol || ''}
                      onChange={(e) => setEditData({ ...editData, order_number_embrascol: e.target.value })}
                      className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                      placeholder="Embrascol"
                    />
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      NF: {commission.nf_number || '-'}
                    </div>
                    <div className="text-gray-500">
                      Nectar: {commission.order_number_nectar || '-'}
                    </div>
                    <div className="text-gray-500">
                      Embrascol: {commission.order_number_embrascol || '-'}
                    </div>
                  </div>
                )}
              </td>
              
              <td className="px-6 py-4">
                {editingId === commission.id ? (
                  <input
                    type="number"
                    value={editData.value_nf || ''}
                    onChange={(e) => setEditData({ ...editData, value_nf: parseFloat(e.target.value) })}
                    className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                    step="0.01"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    R$ {Number(commission.value_nf).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                {editingId === commission.id ? (
                  <input
                    type="number"
                    value={editData.factor || ''}
                    onChange={(e) => setEditData({ ...editData, factor: parseFloat(e.target.value) })}
                    className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                    step="0.0001"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {(Number(commission.factor) * 100).toFixed(2)}%
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  R$ {Number(commission.commission_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </td>

              <td className="px-6 py-4">
                <button
                  onClick={() => togglePaidStatus(commission)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    commission.is_paid
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  {commission.is_paid ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Pago
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Pendente
                    </>
                  )}
                </button>
              </td>

              <td className="px-6 py-4">
                {editingId === commission.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSave(commission.id)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(commission)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(commission.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionList;