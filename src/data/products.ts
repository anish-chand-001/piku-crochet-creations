export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  featured: boolean;
  image?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Daisy Bouquet Amigurumi",
    price: 1299,
    description: "A charming bouquet of hand-crocheted daisies that never wilt. Perfect for gifting or home décor.",
    category: "Flowers",
    featured: true,
  },
  {
    id: "2",
    name: "Cozy Bear Plushie",
    price: 1899,
    description: "An adorable teddy bear made with premium cotton yarn. Soft, huggable, and made to last.",
    category: "Plushies",
    featured: true,
  },
  {
    id: "3",
    name: "Rose Garden Set",
    price: 2499,
    description: "A stunning set of crocheted roses in blush pink and cream. Each petal is carefully shaped by hand.",
    category: "Flowers",
    featured: true,
  },
  {
    id: "4",
    name: "Baby Bunny Rattle",
    price: 899,
    description: "A gentle rattle perfect for little hands. Made with baby-safe materials and filled with love.",
    category: "Baby",
    featured: true,
  },
  {
    id: "5",
    name: "Sunflower Keychain",
    price: 399,
    description: "Carry a little sunshine wherever you go. A tiny crocheted sunflower on a sturdy keyring.",
    category: "Accessories",
    featured: true,
  },
  {
    id: "6",
    name: "Lavender Sachet",
    price: 599,
    description: "A delicate crocheted pouch filled with dried lavender. Brings calm to any space.",
    category: "Home",
    featured: true,
  },
  {
    id: "7",
    name: "Strawberry Bag Charm",
    price: 349,
    description: "A sweet little strawberry to adorn your bag. Handmade with vibrant red and green yarn.",
    category: "Accessories",
    featured: false,
  },
  {
    id: "8",
    name: "Elephant Baby Mobile",
    price: 3499,
    description: "A whimsical mobile featuring pastel elephants and clouds. Perfect for nurseries.",
    category: "Baby",
    featured: false,
  },
  {
    id: "9",
    name: "Mushroom Desk Buddy",
    price: 699,
    description: "An adorable spotted mushroom to keep you company at your desk. Quirky and cute.",
    category: "Plushies",
    featured: false,
  },
  {
    id: "10",
    name: "Cactus Pot Set",
    price: 1599,
    description: "A trio of crocheted cacti in tiny pots. No watering needed — just smiles.",
    category: "Home",
    featured: false,
  },
  {
    id: "11",
    name: "Tulip Bouquet",
    price: 1499,
    description: "Elegant crocheted tulips in spring pastels. A timeless gift of color and craft.",
    category: "Flowers",
    featured: false,
  },
  {
    id: "12",
    name: "Owl Bookmark",
    price: 299,
    description: "A wise little owl to mark your page. Flat-crocheted for easy use between pages.",
    category: "Accessories",
    featured: false,
  },
];

export const categories = ["All", "Flowers", "Plushies", "Baby", "Accessories", "Home"];

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString("en-IN")}`;
};
