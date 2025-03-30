'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';

interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  filingUpdates: boolean;
  priceAlerts: boolean;
}

interface DisplaySettings {
  darkMode: boolean;
  compactView: boolean;
  showCharts: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    pushNotifications: true,
    filingUpdates: true,
    priceAlerts: false,
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    darkMode: false,
    compactView: false,
    showCharts: true,
  });

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleDisplayChange = (setting: keyof DisplaySettings) => {
    setDisplaySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement settings update API call
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your application preferences
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <Switch
                      id="emailAlerts"
                      checked={notificationSettings.emailAlerts}
                      onCheckedChange={() => handleNotificationChange('emailAlerts')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={() => handleNotificationChange('pushNotifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="filingUpdates">Filing Updates</Label>
                    <Switch
                      id="filingUpdates"
                      checked={notificationSettings.filingUpdates}
                      onCheckedChange={() => handleNotificationChange('filingUpdates')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="priceAlerts">Price Alerts</Label>
                    <Switch
                      id="priceAlerts"
                      checked={notificationSettings.priceAlerts}
                      onCheckedChange={() => handleNotificationChange('priceAlerts')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display</CardTitle>
                  <CardDescription>
                    Customize your display preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <Switch
                      id="darkMode"
                      checked={displaySettings.darkMode}
                      onCheckedChange={() => handleDisplayChange('darkMode')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compactView">Compact View</Label>
                    <Switch
                      id="compactView"
                      checked={displaySettings.compactView}
                      onCheckedChange={() => handleDisplayChange('compactView')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCharts">Show Charts</Label>
                    <Switch
                      id="showCharts"
                      checked={displaySettings.showCharts}
                      onCheckedChange={() => handleDisplayChange('showCharts')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}