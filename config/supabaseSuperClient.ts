import {createClient} from '@supabase/supabase-js'

require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SUPER_KEY as string);

export {supabase}
