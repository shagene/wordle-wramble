-- Create function to execute table creation SQL
CREATE OR REPLACE FUNCTION create_setup_logs_table(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to execute profiles table creation SQL
CREATE OR REPLACE FUNCTION create_profiles_table(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to execute word lists table creation SQL
CREATE OR REPLACE FUNCTION create_word_lists_table(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to the service role
GRANT EXECUTE ON FUNCTION create_setup_logs_table TO service_role;
GRANT EXECUTE ON FUNCTION create_profiles_table TO service_role;
GRANT EXECUTE ON FUNCTION create_word_lists_table TO service_role; 