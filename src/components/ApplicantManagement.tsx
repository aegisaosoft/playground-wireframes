import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Download, Upload, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Applicant, ApplicationAnswer, RetreatWithApplicants } from "@/types/applicant";

interface ApplicantManagementProps {
  retreat: RetreatWithApplicants;
  onUpdateApplicant: (applicantId: string, status: 'approved' | 'rejected') => void;
  onAddApplicants: (retreatId: number, applicants: Omit<Applicant, 'id' | 'retreatId' | 'appliedAt'>[]) => void;
}

export const ApplicantManagement = ({ retreat, onUpdateApplicant, onAddApplicants }: ApplicantManagementProps) => {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const { toast } = useToast();

  const approvedApplicants = retreat.applicants.filter(a => a.status === 'approved');
  const rejectedApplicants = retreat.applicants.filter(a => a.status === 'rejected');
  const pendingApplicants = retreat.applicants.filter(a => a.status === 'pending');

  const handleApprove = (applicantId: string) => {
    onUpdateApplicant(applicantId, 'approved');
    toast({
      title: "Applicant approved",
      description: "The applicant has been approved for the retreat.",
    });
  };

  const handleReject = (applicantId: string) => {
    onUpdateApplicant(applicantId, 'rejected');
    toast({
      title: "Applicant rejected",
      description: "The applicant has been rejected.",
    });
  };

  const handleViewApplication = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsApplicationModalOpen(true);
  };

  const handleExportApplicants = () => {
    const csvData = [
      ['Name', 'Email', 'Status', 'Applied At', ...retreat.applicants[0]?.applicationAnswers.map(a => a.question) || []],
      ...retreat.applicants.map(applicant => [
        applicant.name,
        applicant.email,
        applicant.status,
        applicant.appliedAt,
        ...applicant.applicationAnswers.map(a => a.answer)
      ])
    ];

    const csvString = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${retreat.title.replace(/\s+/g, '_')}_applicants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Applicant data has been exported to CSV.",
    });
  };

  const handleUploadContacts = () => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));

      if (nameIndex === -1 || emailIndex === -1) {
        throw new Error('CSV must contain Name and Email columns');
      }

      const newApplicants = lines.slice(1).map((line, index) => {
        const fields = line.split(',').map(f => f.trim().replace(/"/g, ''));
        return {
          name: fields[nameIndex] || `Imported User ${index + 1}`,
          email: fields[emailIndex] || `imported${index + 1}@example.com`,
          status: 'approved' as const,
          applicationAnswers: [
            { question: 'How did you hear about this retreat?', answer: 'Imported contact' }
          ],
          processedAt: new Date().toISOString()
        };
      });

      onAddApplicants(retreat.id, newApplicants);
      setIsUploadModalOpen(false);
      setCsvContent("");
      
      toast({
        title: "Contacts uploaded",
        description: `${newApplicants.length} contacts have been added as approved applicants.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV file.",
        variant: "destructive",
      });
    }
  };

  const ApplicantCard = ({ applicant, showActions = true }: { applicant: Applicant; showActions?: boolean }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{applicant.name}</p>
            <p className="text-sm text-muted-foreground">{applicant.email}</p>
            <p className="text-xs text-muted-foreground">
              Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewApplication(applicant)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {showActions && applicant.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(applicant.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(applicant.id)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Retreat Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={retreat.image}
                alt={retreat.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <CardTitle>{retreat.title}</CardTitle>
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
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleExportApplicants}
                disabled={retreat.applicants.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Contacts
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Applicant Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingApplicants.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {pendingApplicants.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="relative">
            Approved
            {approvedApplicants.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {approvedApplicants.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Rejected
            {rejectedApplicants.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {rejectedApplicants.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplicants.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                No pending applications.
              </div>
            </Card>
          ) : (
            pendingApplicants.map(applicant => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedApplicants.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                No approved applications yet.
              </div>
            </Card>
          ) : (
            approvedApplicants.map(applicant => (
              <ApplicantCard key={applicant.id} applicant={applicant} showActions={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedApplicants.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                No rejected applications.
              </div>
            </Card>
          ) : (
            rejectedApplicants.map(applicant => (
              <ApplicantCard key={applicant.id} applicant={applicant} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedApplicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedApplicant.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplicant.email}</p>
                  <Badge variant={
                    selectedApplicant.status === 'approved' ? 'default' :
                    selectedApplicant.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Application Answers</h3>
                {selectedApplicant.applicationAnswers.map((answer, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="font-medium">{answer.question}</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{answer.answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedApplicant.status === 'pending' && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      handleApprove(selectedApplicant.id);
                      setIsApplicationModalOpen(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedApplicant.id);
                      setIsApplicationModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Contacts Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>CSV Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Paste your CSV data below. Make sure it includes Name and Email columns.
              </p>
              <Textarea
                placeholder="Name,Email&#10;John Doe,john@example.com&#10;Jane Smith,jane@example.com"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUploadContacts} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Contacts
              </Button>
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};