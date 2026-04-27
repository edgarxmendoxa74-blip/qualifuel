
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbjddhlrtkxcucwwtycx.supabase.co';
const supabaseKey = 'sb_publishable__KVTjVUUgY2eqm05CD0Vgg__rEZ1f6W';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProducts = [
  {
    name: 'QualiFuel High Protein Salad',
    description: 'Fresh greens topped with grilled chicken, avocado, hard-boiled eggs, and our signature balsamic dressing.',
    base_price: 250,
    category: 'food',
    popular: true,
    available: true,
    image_url: '/images/protein-salad.png'
  },
  {
    name: 'Signature Beef Tapa',
    description: 'Tender marinated beef served with garlic fried rice and a sunny-side-up egg. A Filipino classic.',
    base_price: 180,
    category: 'food',
    popular: true,
    available: true,
    image_url: '/images/beef-tapa.png'
  },
  {
    name: 'Iced Americano',
    description: 'Double shot of our premium espresso over ice and water for a clean, bold finish.',
    base_price: 120,
    category: 'coffee',
    popular: false,
    available: true,
    image_url: 'https://images.unsplash.com/photo-1551046775-32521941656b?auto=format&fit=crop&q=80&w=1000'
  }
];

async function addSampleProducts() {
  console.log('Adding sample products...');
  
  for (const product of sampleProducts) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(product)
      .select();

    if (error) {
      console.error(`Error adding ${product.name}:`, error);
    } else {
      console.log(`Successfully added: ${product.name}`);
    }
  }
}

addSampleProducts();
