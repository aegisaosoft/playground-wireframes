import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService, UserProfile } from "@/services/user.service";

const Settings = () => {
  const [section, setSection] = useState<'users' | 'brands'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    document.title = "Settings";
  }, []);

  useEffect(() => {
    if (section === 'users' && users.length === 0 && !loadingUsers) {
      setLoadingUsers(true);
      userService.getAllUsers()
        .then(list => setUsers(list))
        .finally(() => setLoadingUsers(false));
    }
  }, [section, users.length, loadingUsers]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: section info */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Admin Settings</div>
              </div>

              {/* Vertical nav like Account page */}
              <div className="flex flex-col gap-2">
                <Button
                  variant={section === 'users' ? 'default' : 'ghost'}
                  className={section === 'users' ? 'justify-start bg-gradient-neon text-background hover:opacity-90 shadow-neon' : 'justify-start text-neon-cyan hover:text-neon-cyan/80'}
                  onClick={() => setSection('users')}
                >
                  Users
                </Button>
                <Button
                  variant={section === 'brands' ? 'default' : 'ghost'}
                  className={section === 'brands' ? 'justify-start bg-gradient-neon text-background hover:opacity-90 shadow-neon' : 'justify-start text-neon-cyan hover:text-neon-cyan/80'}
                  onClick={() => setSection('brands')}
                >
                  Brands
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: content */}
        <div className="lg:col-span-9">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {section === 'users' ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Users</h2>
                  {loadingUsers ? (
                    <div className="text-muted-foreground">Loading users...</div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {users.map(u => (
                        <div key={u.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={u.profileImageUrl} />
                              <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
                                {u.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-foreground font-medium">{u.name}</div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-2 py-1 rounded-full bg-white/10 text-foreground border border-white/20">{u.role}</span>
                            <span className={`px-2 py-1 rounded-full border ${u.isEmailVerified ? 'bg-neon-green/20 text-neon-green border-neon-green/40' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'}`}>
                              {u.isEmailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="text-muted-foreground">No users found.</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Manage Brands</h2>
                  <p className="text-muted-foreground">Brand management tools will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
