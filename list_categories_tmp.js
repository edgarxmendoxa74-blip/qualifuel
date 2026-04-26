
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbjddhlrtkxcucwwtycx.supabase.co';
const supabaseKey = 'sb_publishable__KVTjVUUgY2eqm05CD0Vgg__rEZ1f6W';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }

  console.log('CATEGORIES_START');
  console.log(JSON.stringify(data, null, 2));
  console.log('CATEGORIES_END');
}

listCategories();
