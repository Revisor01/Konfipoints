import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { getGlobalStatistics } from '../../../services/statistics';
import { getPendingRequestsCount } from '../../../services/activityRequest';

const OverviewView = () => {
  const { konfis, activities, badges, activityRequests, jahrgaenge } = useApp();
  const [statistics, setStatistics] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [stats, pending] = await Promise.all([
        getGlobalStatistics(),
        getPendingRequestsCount()
      ]);
      setStatistics(stats);
      setPendingCount(pending);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.positive ? '' : 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const RecentActivity = () => {
    const recentRequests = activityRequests
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Letzte Aktivitäts-Anfragen
        </h3>
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {request.konfi?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {request.activity?.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString('de-DE')}
                </span>
                {request.status === 'pending' && (
                  <Clock className="w-4 h-4 text-yellow-600" />
                )}
                {request.status === 'approved' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {request.status === 'rejected' && (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Keine Anfragen vorhanden
            </p>
          )}
        </div>
      </div>
    );
  };

  const TopPerformers = () => {
    const topKonfis = konfis
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performer
        </h3>
        <div className="space-y-3">
          {topKonfis.map((konfi, index) => (
            <div key={konfi.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{konfi.name}</p>
                  <p className="text-sm text-gray-600">
                    {konfi.jahrgang?.name || 'Kein Jahrgang'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  {konfi.total_points || 0}
                </p>
                <p className="text-xs text-gray-500">Punkte</p>
              </div>
            </div>
          ))}
          {topKonfis.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Keine Konfis vorhanden
            </p>
          )}
        </div>
      </div>
    );
  };

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Konfis gesamt"
        value={konfis.length}
        icon={Users}
        color="bg-blue-500"
        subtitle={`${jahrgaenge.filter(j => j.is_active).length} aktive Jahrgänge`}
      />
      <StatCard
        title="Aktivitäten"
        value={activities.length}
        icon={Activity}
        color="bg-green-500"
        subtitle="verfügbare Aktivitäten"
      />
      <StatCard
        title="Badges"
        value={badges.length}
        icon={Award}
        color="bg-yellow-500"
        subtitle="erstellte Badges"
      />
      <StatCard
        title="Offene Anfragen"
        value={pendingCount}
        icon={Clock}
        color="bg-red-500"
        subtitle="warten auf Bearbeitung"
      />
    </div>
  );

  const SystemHealth = () => {
    const totalPoints = konfis.reduce((sum, konfi) => sum + (konfi.total_points || 0), 0);
    const averagePoints = konfis.length > 0 ? Math.round(totalPoints / konfis.length) : 0;
    const approvedRequests = activityRequests.filter(r => r.status === 'approved').length;
    const rejectedRequests = activityRequests.filter(r => r.status === 'rejected').length;
    const approvalRate = activityRequests.length > 0 ? 
      Math.round((approvedRequests / (approvedRequests + rejectedRequests)) * 100) : 0;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System-Übersicht
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{averagePoints}</p>
            <p className="text-sm text-gray-600">Ø Punkte/Konfi</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{approvedRequests}</p>
            <p className="text-sm text-gray-600">Genehmigt</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{rejectedRequests}</p>
            <p className="text-sm text-gray-600">Abgelehnt</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{approvalRate}%</p>
            <p className="text-sm text-gray-600">Genehmigungsrate</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('de-DE')}</span>
        </div>
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <TopPerformers />
      </div>

      <SystemHealth />
    </div>
  );
};

export default OverviewView;