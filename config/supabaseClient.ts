import {createClient} from '@supabase/supabase-js'

require('dotenv').config();

console.log(process.env.SUPABASE_KEY)
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string);

module.exports = { supabase };
