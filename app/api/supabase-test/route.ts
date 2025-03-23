import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabase';

export async function GET() {
  try {
    // Use the admin client for direct API access
    const { data, error } = await supabaseAdmin.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      timestamp: new Date().toISOString(),
      sessionStatus: data.session ? 'Active session exists' : 'No active session',
    });
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 