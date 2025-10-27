
import React, { useState, useMemo } from 'react';
import { Product } from './types';
import { useInventory } from './hooks/useInventory';
import { analyzeInventory } from './services/geminiService';
// FIX: Import EditIcon and TrashIcon to fix 'Cannot find name' errors.
import { PlusIcon, SearchIcon, ChartBarIcon, ListBulletIcon, LoadingSpinner, EditIcon, TrashIcon } from './components/icons';
import Modal from './components/Modal';
import ProductForm from './components/ProductForm';

const App: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useInventory();
    const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
        if ('id' in productData) {
            updateProduct(productData as Product);
        } else {
            addProduct(productData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-primary">
            <Header
                currentView={view}
                onSetView={setView}
                onSearch={setSearchTerm}
                onAddProduct={handleOpenAddModal}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {view === 'dashboard' ? <Dashboard products={products} /> : <ProductList products={filteredProducts} onEdit={handleOpenEditModal} onDelete={deleteProduct} />}
            </main>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
            >
              <ProductForm 
                product={editingProduct} 
                onSave={handleSaveProduct}
                onClose={() => setIsModalOpen(false)}
              />
            </Modal>
        </div>
    );
};


const Header = ({ currentView, onSetView, onSearch, onAddProduct }: { currentView: string, onSetView: (view: 'dashboard' | 'list') => void, onSearch: (term: string) => void, onAddProduct: () => void }) => (
    <header className="bg-secondary shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-light">Estoque IA</h1>
                    <nav className="hidden md:flex space-x-2 bg-primary p-1 rounded-lg">
                        <NavButton icon={<ChartBarIcon />} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => onSetView('dashboard')} />
                        <NavButton icon={<ListBulletIcon />} label="Produtos" isActive={currentView === 'list'} onClick={() => onSetView('list')} />
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {currentView === 'list' && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                className="bg-primary rounded-full pl-10 pr-4 py-2 text-sm text-light focus:ring-2 focus:ring-accent focus:outline-none transition-all w-40 md:w-64"
                                onChange={e => onSearch(e.target.value)}
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    )}
                    <button onClick={onAddProduct} className="flex items-center justify-center bg-accent hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-full transition-colors shadow-lg">
                        <PlusIcon className="h-5 w-5 mr-0 md:mr-2" />
                        <span className="hidden md:inline">Adicionar Produto</span>
                    </button>
                </div>
            </div>
            {/* Mobile Nav */}
            <nav className="md:hidden flex space-x-2 bg-primary p-1 rounded-lg justify-center mb-2">
                <NavButton icon={<ChartBarIcon />} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => onSetView('dashboard')} />
                <NavButton icon={<ListBulletIcon />} label="Produtos" isActive={currentView === 'list'} onClick={() => onSetView('list')} />
            </nav>
        </div>
    </header>
);

const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Dashboard = ({ products }: { products: Product[] }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const stats = useMemo(() => {
        const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
        const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
        const lowStock = products.filter(p => p.quantity <= 10).length;
        return { totalValue, totalItems, lowStock, productCount: products.length };
    }, [products]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        const result = await analyzeInventory(products);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Valor Total do Estoque" value={`R$ ${stats.totalValue.toFixed(2)}`} />
                <StatCard title="Total de Itens" value={stats.totalItems.toString()} />
                <StatCard title="Tipos de Produtos" value={stats.productCount.toString()} />
                <StatCard title="Produtos com Baixo Estoque" value={stats.lowStock.toString()} />
            </div>
            <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-light">Análise de Inventário com IA</h2>
                {analysis ? (
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}></div>
                ) : (
                    <p className="text-gray-400">Clique no botão para gerar uma análise do seu inventário.</p>
                )}
                 <button onClick={handleAnalyze} disabled={isLoading} className="mt-4 flex items-center justify-center bg-accent hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait">
                    {isLoading ? <LoadingSpinner /> : 'Analisar Inventário'}
                 </button>
            </div>
        </div>
    );
};

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-light">{value}</p>
    </div>
);


const ProductList = ({ products, onEdit, onDelete }: { products: Product[], onEdit: (product: Product) => void, onDelete: (id: string) => void }) => {
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
    };
    
    const confirmDelete = () => {
        if(productToDelete) {
            onDelete(productToDelete.id);
            setProductToDelete(null);
        }
    };
    
    if (products.length === 0) {
        return <div className="text-center py-12 text-gray-400">Nenhum produto encontrado.</div>
    }

    return (
        <>
            <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-light sm:pl-6">Produto</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light">SKU</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light">Quantidade</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light">Preço</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-secondary">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-primary transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-light">{product.name}</div>
                                                <div className="text-gray-400">{product.description.substring(0, 30)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{product.sku}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{product.quantity}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">R$ {product.price.toFixed(2)}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => onEdit(product)} className="text-accent hover:text-sky-300"><EditIcon /></button>
                                            <button onClick={() => handleDeleteClick(product)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Confirmar Exclusão">
                <div>
                    <p>Você tem certeza que deseja excluir o produto "{productToDelete?.name}"?</p>
                    <p className="text-sm text-gray-400 mt-1">Essa ação não pode ser desfeita.</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setProductToDelete(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-medium transition-colors">
                          Cancelar
                        </button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-white font-medium transition-colors">
                          Excluir
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default App;