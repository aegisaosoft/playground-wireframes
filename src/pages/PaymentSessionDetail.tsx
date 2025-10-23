import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { paymentsService } from '@/services/payments.service';
import { ArrowLeft } from 'lucide-react';

const PaymentSessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!sessionId) { setError('Missing session id'); return; }
        const resp = await paymentsService.getPaymentSession(sessionId);
        setData((resp as any).data || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load payment');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (error || !data) return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <Card className="bg-white/5 border-white/10 max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Payment Detail</h2>
          <p className="text-muted-foreground mb-4">{error || 'Not found'}</p>
          <Link to="/settings?section=payments">
            <Button className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {(() => {
              const created = data?.createdAt;
              let ymd = '';
              if (typeof created === 'string' && /^\d{4}-\d{2}-\d{2}/.test(created)) {
                ymd = created.slice(0,10);
              } else if (created) {
                try { ymd = new Date(created).toLocaleDateString('en-CA'); } catch { ymd = ''; }
              }
              const backHref = ymd
                ? `/settings?section=payments&from=${encodeURIComponent(ymd)}&to=${encodeURIComponent(ymd)}&hostId=&hostName=&experienceId=&experienceName=`
                : '/settings?section=payments';
              return (
                <Link
                  to={backHref}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Settings
                </Link>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Session ID</div>
                <div className="text-foreground break-all">{data.sessionId}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="text-foreground">{data.status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="text-foreground">{data.currency} {Number(data.amount).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Quantity</div>
                <div className="text-foreground">{data.quantity}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Payment Intent</div>
                <div className="text-foreground break-all">{data.paymentIntentId || '-'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Created</div>
                <div className="text-foreground">{new Date(data.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-white/10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Experience</h3>
              {data.experience ? (
                <div className="text-sm text-foreground space-y-1">
                  <div><span className="text-muted-foreground">Title: </span>{data.experience.title}</div>
                  <div><span className="text-muted-foreground">Location: </span>{data.experience.location}</div>
                  <div><span className="text-muted-foreground">Dates: </span>{String(data.experience.startDate)} – {String(data.experience.endDate)}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No experience info</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">User</h3>
              {data.user ? (
                <div className="text-sm text-foreground space-y-1">
                  <div><span className="text-muted-foreground">Name: </span>{data.user.name}</div>
                  <div><span className="text-muted-foreground">Email: </span>{data.user.email}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No user info</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSessionDetail;


