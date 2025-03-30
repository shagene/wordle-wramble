import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogBody } from '@/app/components/dialog';
import { Button } from '@/app/components/button';
import { Text } from '@/app/components/text';
import { Heading } from '@/app/components/heading';
import { checkMigrationNeeded, migrateDataWithProgress } from '@/app/utils/dataMigration';
import { useAuth } from '@/app/hooks/useAuth';

interface MigrationStats {
  wordListsCount: number;
  progressItemsCount: number;
  settingsMigrated: boolean;
}

export function DataMigrationDialog() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if migration is needed when the component mounts or user changes
  useEffect(() => {
    if (!user) return;

    const checkMigration = async () => {
      try {
        // Check if we've already shown the dialog to this user
        const dialogShown = localStorage.getItem('migration_dialog_shown');
        // Check if migration was already completed
        const migrationCompleted = localStorage.getItem('migration_completed');
        
        // Skip if we've already completed migration or if the user dismissed the dialog
        if (migrationCompleted === 'true') {
          return;
        }
        
        const needs = await checkMigrationNeeded(user.id);
        console.log('Migration needed check result:', needs);
        
        // Set dialog state based on migration need
        setNeedsMigration(needs);
        
        // Only open automatically if we haven't shown it before
        if (needs && dialogShown !== 'true') {
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error checking migration status:', err);
      }
    };

    // Check for migration need
    checkMigration();
  }, [user]);

  // Handle manual close
  const handleCloseDialog = () => setIsOpen(false);

  // Start the migration process
  const handleStartMigration = async () => {
    if (!user) return;
    
    setIsMigrating(true);
    setError(null);
    
    try {
      const result = await migrateDataWithProgress(user.id, (progress) => {
        setProgress(progress);
      });
      
      if (result.success) {
        setMigrationComplete(true);
        localStorage.setItem('migration_completed', 'true');
        setStats({
          wordListsCount: result.wordListsCount || 0,
          progressItemsCount: result.progressItemsCount || 0,
          settingsMigrated: result.settingsMigrated || false
        });
      } else {
        setError(result.error || 'Migration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred during migration');
      console.error('Migration error:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  // Skip migration for now
  const handleSkipMigration = () => {
    setIsOpen(false);
    // Store that the user has seen the migration dialog
    localStorage.setItem('migration_dialog_shown', 'true');
  };

  // Check if the component should render at all
  if (!needsMigration && !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={handleCloseDialog}>
      <DialogTitle>Welcome to the New Wordle Wramble!</DialogTitle>
      <DialogBody>
        {!migrationComplete ? (
          <>
            <Heading level={3} className="mb-4">Migrate Your Data</Heading>
            <Text className="mb-4">
              We&apos;ve updated our app to provide you with more features and better performance. 
              Would you like to migrate your existing word lists and progress to your new account?
            </Text>

            {isMigrating ? (
              <div className="my-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <Text className="text-sm text-gray-600">
                  Migration in progress ({progress}%)
                </Text>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <Text className="text-red-600">{error}</Text>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-6">
                  <Button 
                    onClick={handleStartMigration} 
                    disabled={isMigrating}
                    className="w-full"
                  >
                    Migrate My Data
                  </Button>
                  <Button 
                    onClick={handleSkipMigration}
                    className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isMigrating}
                  >
                    Skip For Now
                  </Button>
                </div>

                <Text className="text-sm text-gray-500 mt-4">
                  Note: Based on your subscription tier, some data limits may apply.
                </Text>
              </>
            )}
          </>
        ) : (
          <>
            <Heading level={3} className="mb-4">Migration Complete!</Heading>
            {stats && (
              <div className="mb-6">
                <Text className="mb-2">Successfully migrated:</Text>
                <ul className="list-disc pl-5 mb-4">
                  <li>
                    <Text>{stats.wordListsCount} word lists</Text>
                  </li>
                  <li>
                    <Text>{stats.progressItemsCount} progress records</Text>
                  </li>
                  {stats.settingsMigrated && (
                    <li>
                      <Text>Your personal settings</Text>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button 
              onClick={handleCloseDialog}
              className="w-full"
            >
              Continue to App
            </Button>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
} 