
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateDescription } from '../services/geminiService';
import { LoadingSpinner, SparklesIcon } from './icons';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '0',
    price: '0.00',
    description: '',
    imageUrl: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        quantity: String(product.quantity),
        price: String(product.price),
        description: product.description,
        imageUrl: product.imageUrl,
      });
    } else {
       setFormData({
        name: '',
        sku: '',
        quantity: '0',
        price: '0.00',
        description: '',
        imageUrl: '',
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      alert("Por favor, insira um nome de produto primeiro.");
      return;
    }
    setIsGenerating(true);
    try {
      const desc = await generateDescription(formData.name, `sku ${formData.sku}`);
      setFormData(prev => ({ ...prev, description: desc }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productToSave = {
      ...formData,
      quantity: parseInt(formData.quantity, 10) || 0,
      price: parseFloat(formData.price) || 0,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/400/300`,
    };
    if (product) {
        onSave({ ...product, ...productToSave });
    } else {
        onSave(productToSave);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome do Produto</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
        </div>
        <div className="col-span-1">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-300">SKU</label>
          <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
        </div>
        <div className="col-span-1">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantidade</label>
          <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
        </div>
        <div className="col-span-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">Preço (R$)</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
        </div>
        <div className="col-span-2">
            <div className="flex justify-between items-center">
                 <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descrição</label>
                 <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm text-accent hover:text-sky-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                     {isGenerating ? <LoadingSpinner className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                     {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                 </button>
            </div>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent"></textarea>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-accent hover:bg-sky-400 rounded-md text-white font-medium transition-colors">
          Salvar Produto
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
