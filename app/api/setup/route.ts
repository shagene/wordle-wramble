import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');
  const setupKey = process.env.SETUP_SECRET_KEY;

  if (!setupKey || key !== setupKey) {
    return NextResponse.json(
      { error: 'Invalid setup key' },
      { status: 401 }
    );
  }

  try {
    // Check setup_logs table
    const { error: logsError } = await supabaseAdmin
      .from('setup_logs')
      .select('*')
      .limit(1);

    // Check profiles table
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);

    // Check word_lists table
    const { error: wordListsError } = await supabaseAdmin
      .from('word_lists')
      .select('*')
      .limit(1);

    const tableStatus = {
      setup_logs: !logsError || logsError.code !== '42P01',
      profiles: !profilesError || profilesError.code !== '42P01',
      word_lists: !wordListsError || wordListsError.code !== '42P01'
    };

    // If any table is missing, return instructions
    if (!tableStatus.setup_logs || !tableStatus.profiles || !tableStatus.word_lists) {
      return NextResponse.json({
        error: 'Some tables are missing',
        status: tableStatus,
        instructions: 'Please run the SQL migration script in supabase/migrations/20240319000000_create_tables.sql using the Supabase dashboard SQL editor'
      }, { status: 404 });
    }

    // Log successful check
    const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await supabaseAdmin
      .from('setup_logs')
      .insert({
        ip_address: clientIP,
        success: true,
        error_message: 'Tables verified successfully'
      });

    return NextResponse.json({
      success: true,
      message: 'All required tables exist',
      status: tableStatus
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error during setup check' },
      { status: 500 }
    );
  }
} 