import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_URL } from '@/config/api';
import { Loader2, X, Upload, ImagePlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MAX_IMAGES = 10;

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
    images?: string[]; // multi-image support
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

    // Multi-image state
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]); // Cloudinary URLs to keep

    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const totalImages = existingImages.length + newFiles.length;

    // ── Reset / populate form ───────────────────────────────────────────────
    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setCategory(productToEdit.category);
            setDescription(productToEdit.description);
            // Use images[] if available, fall back to [imageUrl]
            const imgs =
                productToEdit.images && productToEdit.images.length > 0
                    ? productToEdit.images
                    : productToEdit.imageUrl
                    ? [productToEdit.imageUrl]
                    : [];
            setExistingImages(imgs);
        } else {
            setName('');
            setPrice('');
            setCategory(categories.length > 0 ? categories[0].name : '');
            setDescription('');
            setExistingImages([]);
        }
        // Always clear new file state on open/close
        setNewFiles([]);
        setNewFilePreviews([]);
    }, [productToEdit, isOpen, categories]);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [newFilePreviews]);

    // ── File handling ───────────────────────────────────────────────────────
    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        const remaining = MAX_IMAGES - totalImages;
        if (remaining <= 0) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed. Remove some first.`);
            return;
        }

        const toAdd = selected.slice(0, remaining);
        if (toAdd.length < selected.length) {
            toast.warning(`Only added ${toAdd.length} image(s). Max ${MAX_IMAGES} total.`);
        }

        const oversized = toAdd.filter((f) => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error(`${oversized.length} file(s) exceed the 5 MB limit and were skipped.`);
        }

        const valid = toAdd.filter((f) => f.size <= 5 * 1024 * 1024);
        const previews = valid.map((f) => URL.createObjectURL(f));

        setNewFiles((prev) => [...prev, ...valid]);
        setNewFilePreviews((prev) => [...prev, ...previews]);

        // Reset input so same files can be re-selected after removal
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((u) => u !== url));
    };

    const removeNewFile = (index: number) => {
        URL.revokeObjectURL(newFilePreviews[index]);
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // ── Mutation ────────────────────────────────────────────────────────────
        const saveMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const isEditing = !!productToEdit;
            const url = isEditing
                ? `${API_URL}/products/${productToEdit!._id}`
                : `${API_URL}/products`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
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

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !category || !description) {
            toast.error('All fields are required');
            return;
        }
        if (name.trim().length < 3 || name.trim().length > 120) {
            toast.error('Product name must be between 3 and 120 characters');
            return;
        }
        if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
            toast.error('Price must be a valid number greater than 0');
            return;
        }
        if (description.trim().length < 10) {
            toast.error('Description must be at least 10 characters');
            return;
        }
        if (!productToEdit && newFiles.length === 0) {
            toast.error('At least one image is required for new products');
            return;
        }
        if (totalImages === 0) {
            toast.error('Product must have at least one image');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('description', description);
        // Existing Cloudinary URLs to keep
        formData.append('existingImages', JSON.stringify(existingImages));
        // New file uploads
        newFiles.forEach((file) => formData.append('images', file));

        saveMutation.mutate(formData);
    };

    if (!isOpen) return null;

    const standardInputClass =
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {productToEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* ── Image Upload Section ─────────────────────────────── */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Product Images
                                    <span className="ml-2 text-xs font-normal text-gray-400">
                                        ({totalImages}/{MAX_IMAGES})
                                    </span>
                                </Label>
                                {totalImages < MAX_IMAGES && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                    >
                                        <ImagePlus className="w-3.5 h-3.5" />
                                        Add images
                                    </button>
                                )}
                            </div>

                            {/* Thumbnail Grid */}
                            {totalImages > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {/* Existing Cloudinary images */}
                                    {existingImages.map((url) => (
                                        <div
                                            key={url}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50"
                                        >
                                            <img
                                                src={url}
                                                alt="Product image"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(url)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                                                title="Remove image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {/* "Cover" badge on first image */}
                                            {existingImages.indexOf(url) === 0 && newFiles.length === 0 && (
                                                <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-primary text-white px-1.5 py-0.5 rounded">
                                                    Cover
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {/* New file previews */}
                                    {newFilePreviews.map((preview, idx) => (
                                        <div
                                            key={preview}
                                            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40 shadow-sm bg-gray-50"
                                        >
                                            <img
                                                src={preview}
                                                alt="New image"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                                                title="Remove image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                                New
                                            </span>
                                        </div>
                                    ))}

                                    {/* Add more slot */}
                                    {totalImages < MAX_IMAGES && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/50 bg-gray-50 hover:bg-primary/5 flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-all group"
                                        >
                                            <Upload className="w-5 h-5 mb-1 transition-transform group-hover:scale-110" />
                                            <span className="text-[10px] font-medium">Add more</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Empty drop zone */
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 border-gray-200 hover:border-primary/50 transition-all group"
                                >
                                    <Upload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary">Click to upload images</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · up to 5 MB each · max {MAX_IMAGES} images</span>
                                </button>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                multiple
                                className="hidden"
                                onChange={handleFilesSelected}
                            />

                            {/* Warning when at limit */}
                            {totalImages >= MAX_IMAGES && (
                                <p className="flex items-center gap-1.5 text-xs text-amber-600">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    Maximum image limit reached. Remove an image to add another.
                                </p>
                            )}
                        </div>

                        {/* ── Text Fields ──────────────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Product Title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price (₹)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        placeholder="0.00"
                                    />
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
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    className={`${standardInputClass} h-[172px] py-3 resize-none`}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Product details..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
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
