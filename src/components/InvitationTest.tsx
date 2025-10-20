import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/use-toast';

export const InvitationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testUserSearch = async () => {
    setIsLoading(true);
    try {
      console.log('Testing user search...');
      const results = await usersService.searchUsers('test');
      console.log('Search results:', results);
      toast({
        title: "Test Complete",
        description: `Found ${results.length} users`,
      });
    } catch (error) {
      console.error('Search test failed:', error);
      toast({
        title: "Test Failed",
        description: "User search API is not working",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testInvitation = async () => {
    setIsLoading(true);
    try {
      console.log('Testing invitation...');
      await usersService.inviteUser({
        userId: 'test-user-id',
        brandId: 'test-brand-id',
        message: 'Test invitation'
      });
      toast({
        title: "Test Complete",
        description: "Invitation API is working",
      });
    } catch (error) {
      console.error('Invitation test failed:', error);
      toast({
        title: "Test Failed",
        description: "Invitation API is not working",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold">API Test</h3>
      <Button onClick={testUserSearch} disabled={isLoading}>
        Test User Search
      </Button>
      <Button onClick={testInvitation} disabled={isLoading}>
        Test Invitation
      </Button>
    </div>
  );
};
