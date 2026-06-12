import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.argv[2]
const supabaseKey = process.argv[3]

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  console.log('Testing INSERT on categories...')
  const { data, error } = await supabase.from('categories').insert({
    id: 'test-category',
    name: 'Test Category',
    icon: '🧪'
  }).select()

  if (error) {
    console.error('❌ INSERT failed:', error.message, error.hint, error.details)
  } else {
    console.log('✅ INSERT successful:', data)
    
    console.log('Cleaning up...')
    await supabase.from('categories').delete().eq('id', 'test-category')
  }
}

testInsert()
