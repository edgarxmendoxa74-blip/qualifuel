
import { MenuItem } from '../types';

export const SAMPLE_PRODUCTS: MenuItem[] = [
  {
    id: 'sample-1',
    name: 'QualiFuel High Protein Salad',
    description: 'Fresh greens topped with seared salmon, avocado, hard-boiled eggs, and our signature balsamic dressing.',
    basePrice: 250,
    category: 'food',
    popular: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
    effectivePrice: 250
  },
  {
    id: 'sample-2',
    name: 'Signature Beef Tapa',
    description: 'Tender marinated beef served with garlic fried rice and a sunny-side-up egg. A Filipino classic.',
    basePrice: 180,
    category: 'food',
    popular: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
    effectivePrice: 180
  },
  {
    id: 'sample-3',
    name: 'Iced Americano',
    description: 'Double shot of our premium espresso over ice and water for a clean, bold finish.',
    basePrice: 120,
    category: 'coffee',
    popular: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1551046775-32521941656b?auto=format&fit=crop&q=80&w=1000',
    effectivePrice: 120
  }
];
