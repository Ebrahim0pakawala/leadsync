import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dclguidhgvvgpzvmqzba.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbGd1aWRoZ3Z2Z3B6dm1xemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTIyMjIsImV4cCI6MjA5MzAyODIyMn0.49O32kfUnECAr5YYGBa6nK_aBumAoo-bRJTnmEzoThE'

export const supabase = createClient(supabaseUrl, supabaseKey)