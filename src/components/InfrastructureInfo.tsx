import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Flag, 
  MapPin, 
  Wrench,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Leaf
} from 'lucide-react';

interface InfrastructureAsset {
  id: string;
  name: string;
  type: string;
  location_lat: number;
  location_lng: number;
  address?: string;
  construction_cost?: number;
  maintenance_cost?: number;
  funding_source?: string;
  construction_date?: string;
  last_maintenance_date?: string;
  status: string;
  environmental_impact?: string;
  social_impact?: string;
  contractor_name?: string;
  project_id?: string;
  description?: string;
}

interface InfrastructureInfoProps {
  asset: InfrastructureAsset;
  onReportIssue: () => void;
  onClose: () => void;
}

export function InfrastructureInfo({ asset, onReportIssue, onClose }: InfrastructureInfoProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'under_maintenance': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'abandoned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFundingColor = (source?: string) => {
    switch (source?.toLowerCase()) {
      case 'central': return 'bg-blue-100 text-blue-800';
      case 'state': return 'bg-green-100 text-green-800';
      case 'municipal': return 'bg-purple-100 text-purple-800';
      case 'private': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building className="w-5 h-5" />
                {asset.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {asset.address || `${asset.location_lat.toFixed(6)}, ${asset.location_lng.toFixed(6)}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{asset.type}</Badge>
            <Badge className={getStatusColor(asset.status)}>
              {asset.status.replace('_', ' ')}
            </Badge>
            {asset.funding_source && (
              <Badge className={getFundingColor(asset.funding_source)}>
                {asset.funding_source} funding
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Construction Cost</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(asset.construction_cost)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Maintenance Cost</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(asset.maintenance_cost)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Construction Date:</span>
                <p className="font-medium">{formatDate(asset.construction_date)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Maintenance:</span>
                <p className="font-medium">{formatDate(asset.last_maintenance_date)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Details */}
          {(asset.contractor_name || asset.project_id) && (
            <div className="space-y-3">
              <h3 className="font-semibold">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {asset.contractor_name && (
                  <div>
                    <span className="text-muted-foreground">Contractor:</span>
                    <p className="font-medium">{asset.contractor_name}</p>
                  </div>
                )}
                {asset.project_id && (
                  <div>
                    <span className="text-muted-foreground">Project ID:</span>
                    <p className="font-medium">{asset.project_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impact Information */}
          {(asset.environmental_impact || asset.social_impact) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Impact Assessment</h3>
                
                {asset.environmental_impact && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Environmental Impact</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {asset.environmental_impact}
                    </p>
                  </div>
                )}

                {asset.social_impact && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">Social Impact</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {asset.social_impact}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Description */}
          {asset.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">{asset.description}</p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={onReportIssue} className="flex-1">
              <Flag className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Share Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}