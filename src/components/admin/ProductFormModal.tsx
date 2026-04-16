import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_URL } from '@/config/api';
import { Loader2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Category {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    productToEdit?: Product | null;
}

const ProductFormModal = ({ isOpen, onClose, categories, productToEdit }: Props) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setCategory(productToEdit.category);
            setDescription(productToEdit.description);
            setImagePreview(productToEdit.imageUrl);
            setImage(null);
        } else {
            setName('');
            setPrice('');
            setCategory(categories.length > 0 ? categories[0].name : '');
            setDescription('');
            setImage(null);
            setImagePreview('');
        }
    }, [productToEdit, isOpen, categories]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const saveMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const isEditing = !!productToEdit;
            // 2. Submit Product Data
            const url = isEditing && productToEdit
                ? `${API_URL}/products/${productToEdit._id}`
                : `${API_URL}/products`;

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: formData,
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save product');
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success(productToEdit ? 'Product updated successfully' : 'Product created successfully');
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !category || !description) {
            toast.error('All fields except new image are required');
            return;
        }
        if (!productToEdit && !image) {
            toast.error('Image is required for new products');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }

        saveMutation.mutate(formData);
    };

    if (!isOpen) return null;

    const standardInputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <Label>Product Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] relative group overflow-hidden bg-gray-50 border-gray-200">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0 z-0 opacity-80 group-hover:opacity-40 transition-opacity" />
                                            <div className="z-10 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                                                <Upload className="w-8 h-8 text-primary mb-2" />
                                                <span className="text-sm font-medium text-primary bg-white/80 px-2 py-1 rounded">Change Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                            <span className="text-sm font-medium">Click to upload</span>
                                            <span className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product Title" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price (₹)</Label>
                                        <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select
                                            className={standardInputClass}
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <textarea
                                        className={`${standardInputClass} min-h-[100px] py-3 resize-none`}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        placeholder="Product details..."
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
                    <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" form="product-form" disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {productToEdit ? 'Save Changes' : 'Create Product'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
