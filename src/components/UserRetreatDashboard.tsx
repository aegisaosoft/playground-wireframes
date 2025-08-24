import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Eye } from "lucide-react";
import { Retreat } from "@/components/RetreatGrid";
import { Applicant } from "@/types/applicant";

interface UserRetreat extends Retreat {
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  isHost?: boolean;
}

interface UserRetreatDashboardProps {
  retreats: Retreat[];
  userApplications: Applicant[];
  userEmail: string;
  onViewRetreat: (retreat: Retreat) => void;
  onEditRetreat: (retreat: Retreat) => void;
  onEditBrand?: () => void;
  brandData?: { name: string; logo?: string };
}

export const UserRetreatDashboard = ({ 
  retreats, 
  userApplications, 
  userEmail, 
  onViewRetreat, 
  onEditRetreat,
  onEditBrand,
  brandData 
}: UserRetreatDashboardProps) => {
  // For demo purposes, assume user is host of all retreats
  // In real app, this would be based on organizer data
  const hostingRetreats = retreats;
  
  // Get retreats user has applied to
  const appliedRetreatIds = userApplications.map(app => app.retreatId);
  const appliedRetreats = retreats.filter(retreat => appliedRetreatIds.includes(retreat.id));
  
  // Separate by application status
  const approvedRetreats = appliedRetreats.filter(retreat => {
    const application = userApplications.find(app => app.retreatId === retreat.id);
    return application?.status === 'approved';
  });

  const pendingRetreats = appliedRetreats.filter(retreat => {
    const application = userApplications.find(app => app.retreatId === retreat.id);
    return application?.status === 'pending';
  });

  const RetreatCard = ({ 
    retreat, 
    showStatus = false, 
    status, 
    showEditButton = false 
  }: { 
    retreat: Retreat; 
    showStatus?: boolean; 
    status?: string;
    showEditButton?: boolean;
  }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={retreat.image}
            alt={retreat.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{retreat.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {retreat.location}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {retreat.date}
              </span>
            </div>
            {retreat.price && (
              <p className="text-sm font-medium text-coral mt-1">${retreat.price}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showStatus && status && (
            <Badge variant={
              status === 'approved' ? 'default' :
              status === 'pending' ? 'secondary' : 'destructive'
            }>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}
          {showEditButton ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditRetreat(retreat)}
            >
              Edit Retreat
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRetreat(retreat)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Approved Retreats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Approved Retreats
            <Badge variant="secondary">{approvedRetreats.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedRetreats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No approved retreats yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Apply to retreats to see them here once approved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedRetreats.map((retreat) => {
                const application = userApplications.find(app => app.retreatId === retreat.id);
                return (
                  <RetreatCard
                    key={retreat.id}
                    retreat={retreat}
                    showStatus={true}
                    status={application?.status}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Retreats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pending Retreats
            <Badge variant="secondary">{pendingRetreats.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRetreats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending applications.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your retreat applications awaiting approval will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRetreats.map((retreat) => {
                const application = userApplications.find(app => app.retreatId === retreat.id);
                return (
                  <RetreatCard
                    key={retreat.id}
                    retreat={retreat}
                    showStatus={true}
                    status={application?.status}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Brand Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-coral text-white rounded-full flex items-center justify-center font-semibold">
                {brandData?.logo ? (
                  <img 
                    src={brandData.logo} 
                    alt="Brand logo" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  userEmail.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-medium">{brandData?.name || "Your Brand"}</p>
                <p className="text-sm text-muted-foreground">
                  {hostingRetreats.length} retreat{hostingRetreats.length !== 1 ? 's' : ''} under this brand
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEditBrand}
            >
              Edit Brand Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hosting Retreats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hosting
            <Badge variant="secondary">{hostingRetreats.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostingRetreats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't created any retreats yet.</p>
              <Button variant="outline" className="mt-4">
                Create Your First Retreat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hostingRetreats.map((retreat) => (
                <RetreatCard
                  key={retreat.id}
                  retreat={retreat}
                  showEditButton={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};