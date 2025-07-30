import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArScanner } from '@/components/ArScanner';
import { InfrastructureInfo } from '@/components/InfrastructureInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scan, 
  LogOut, 
  User, 
  Map, 
  History, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Demo infrastructure data
const demoAssets = [
  {
    id: '1',
    name: 'Central Bridge',
    type: 'Bridge',
    location_lat: 28.6139,
    location_lng: 77.2090,
    address: 'Central Delhi, New Delhi',
    construction_cost: 50000000,
    maintenance_cost: 2000000,
    funding_source: 'central',
    construction_date: '2018-03-15',
    last_maintenance_date: '2024-01-10',
    status: 'active',
    environmental_impact: 'Reduced traffic congestion, improved air quality in surrounding areas',
    social_impact: 'Enhanced connectivity between communities, reduced travel time by 30%',
    contractor_name: 'National Infrastructure Ltd.',
    project_id: 'NIL-2018-001',
    description: 'A modern concrete bridge spanning the central district, designed to handle 50,000 vehicles per day with pedestrian walkways and cycle paths.'
  },
  {
    id: '2',
    name: 'Community Park',
    type: 'Park',
    location_lat: 28.6129,
    location_lng: 77.2080,
    address: 'Sector 15, New Delhi',
    construction_cost: 15000000,
    maintenance_cost: 500000,
    funding_source: 'municipal',
    construction_date: '2020-06-01',
    last_maintenance_date: '2024-02-15',
    status: 'active',
    environmental_impact: 'Created green space with 200+ trees, improved local air quality',
    social_impact: 'Recreational facility serving 5,000+ residents, improved community health',
    contractor_name: 'Green Spaces Pvt. Ltd.',
    project_id: 'GS-2020-045',
    description: 'A 5-acre community park featuring playground equipment, walking paths, outdoor gym, and landscaped gardens.'
  }
];

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showScanner, setShowScanner] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message
      });
    } else {
      navigate('/auth');
    }
  };

  const handleScanResult = (location: { lat: number; lng: number }) => {
    // Find nearby infrastructure (simulation)
    const nearbyAsset = demoAssets.find(asset => 
      Math.abs(asset.location_lat - location.lat) < 0.01 && 
      Math.abs(asset.location_lng - location.lng) < 0.01
    ) || demoAssets[0]; // Fallback to first asset

    setSelectedAsset(nearbyAsset);
    setShowScanner(false);
    
    // Add to recent scans
    setRecentScans(prev => [nearbyAsset, ...prev.slice(0, 4)]);
  };

  const handleReportIssue = () => {
    toast({
      title: "Report Submitted",
      description: "Your issue report has been submitted to the authorities."
    });
    setSelectedAsset(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading Civic Mirror AR...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-black">
        <ArScanner onScanResult={handleScanResult} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Scan className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Civic Mirror AR</h1>
                <p className="text-sm text-muted-foreground">Your civic lens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}>
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="bg-background border-b p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <History className="w-4 h-4 mr-2" />
            Scan History
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Map className="w-4 h-4 mr-2" />
            Infrastructure Map
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome back, {user.user_metadata?.full_name || 'Citizen'}!</h2>
          <p className="text-muted-foreground">
            Transform your surroundings into transparent civic data. Point your camera at any public infrastructure.
          </p>
        </div>

        {/* Main Scanner Button */}
        <Card className="border-2 border-dashed border-primary/50 hover:border-primary transition-colors">
          <CardContent className="p-8 text-center">
            <Button 
              size="lg" 
              onClick={() => setShowScanner(true)}
              className="w-full max-w-xs h-16 text-lg"
            >
              <Scan className="w-6 h-6 mr-2" />
              Start AR Scanning
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Point at roads, bridges, parks, or buildings to reveal funding, costs, and maintenance data
            </p>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Scans</h3>
            <div className="grid gap-4">
              {recentScans.map((asset, index) => (
                <Card key={`${asset.id}-${index}`} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedAsset(asset)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{asset.name}</h4>
                        <p className="text-sm text-muted-foreground">{asset.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{asset.type}</Badge>
                        <Badge variant="outline">{asset.funding_source}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Demo Infrastructure */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Nearby Infrastructure</h3>
          <div className="grid gap-4">
            {demoAssets.map((asset) => (
              <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAsset(asset)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{asset.name}</h4>
                      <p className="text-sm text-muted-foreground">{asset.address}</p>
                      <p className="text-xs text-muted-foreground">Tap to view details</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{asset.type}</Badge>
                      <Badge variant="outline">{asset.funding_source}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Infrastructure Info Modal */}
      {selectedAsset && (
        <InfrastructureInfo
          asset={selectedAsset}
          onReportIssue={handleReportIssue}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default Index;
