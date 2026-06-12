import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.argv[2]
const supabaseKey = process.argv[3]

if (!supabaseUrl || !supabaseKey) {
  console.error('Usage: node check_supabase.js <url> <key>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const tables = ['menu_items', 'categories', 'payment_methods', 'site_settings']
  
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase.from(table).select('*', { count: 'exact' })
      if (error) {
        console.error(`❌ Table "${table}": ${error.message}`)
      } else {
        console.log(`✅ Table "${table}" has ${count} rows.`)
      }
    } catch (e) {
      console.error(`💥 Unexpected error checking table "${table}":`, e.message)
    }
  }
}

checkData()
