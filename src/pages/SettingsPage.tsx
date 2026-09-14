import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Users, Store, Banknote, AlertCircle, Loader2, CheckCircle2, Bell, Moon, Sun, Upload, Download, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/hooks/use-toast';

interface Setting {
  id: string;
  name: string;
  description: string;
  category: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: string[];
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStore, setStore } = useStore();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [apiUrl, setApiUrl] = useState('https://onestoresolution-api.onrender.com');
  const [isApiUrlChanged, setIsApiUrlChanged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app this would be API calls or reading from config/localStorage
        const mockSettings: Setting[] = [
          // General Settings
          {
            id: 'gen-001',
            name: 'Company Name',
            description: 'The legal name of your business',
            category: 'general',
            value: 'OneStoreSolution Demo',
            type: 'text'
          },
          {
            id: 'gen-002',
            name: 'Business Registration Number',
            description: 'Your official business registration or tax ID',
            category: 'general',
            value: 'GB123456789',
            type: 'text'
          },
          {
            id: 'gen-003',
            name: 'Default Currency',
            description: 'The default currency for all transactions',
            category: 'general',
            value: 'GBP',
            type: 'select',
            options: ['GBP', 'USD', 'EUR', 'CAD', 'AUD']
          },
          {
            id: 'gen-004',
            name: 'Tax Rate (%)',
            description: 'Default tax rate applied to sales',
            category: 'general',
            value: 20,
            type: 'number'
          },
          {
            id: 'gen-005',
            name: 'Date Format',
            description: 'How dates are displayed throughout the system',
            category: 'general',
            value: 'DD/MM/YYYY',
            type: 'select',
            options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
          },
          {
            id: 'gen-006',
            name: 'Time Format',
            description: 'How times are displayed throughout the system',
            category: 'general',
            value: '24-hour',
            type: 'select',
            options: ['12-hour', '24-hour']
          },
          // Store Settings
          {
            id: 'sto-001',
            name: 'Store Name',
            description: 'The display name of your current store',
            category: 'store',
            value: currentStore?.name || 'Main Store',
            type: 'text'
          },
          {
            id: 'sto-002',
            name: 'Store Code',
            description: 'Unique identifier for your store',
            category: 'store',
            value: currentStore?.code || 'STORE_001',
            type: 'text'
          },
          {
            id: 'sto-003',
            name: 'Store Address',
            description: 'Physical address of your store',
            category: 'store',
            value: currentStore?.address || '123 Retail Street',
            type: 'textarea'
          },
          {
            id: 'sto-004',
            name: 'Store City',
            description: 'City where your store is located',
            category: 'store',
            value: currentStore?.city || 'London',
            type: 'text'
          },
          {
            id: 'sto-005',
            name: 'Store Postal Code',
            description: 'Postal code for your store location',
            category: 'store',
            value: currentStore?.postalCode || 'SW1A 1AA',
            type: 'text'
          },
          {
            id: 'sto-006',
            name: 'Store Phone Number',
            description: 'Contact phone number for your store',
            category: 'store',
            value: currentStore?.phone || '020 7946 0123',
            type: 'text'
          },
          {
            id: 'sto-007',
            name: 'Store Email',
            description: 'Contact email address for your store',
            category: 'store',
            value: currentStore?.email || 'store@onestoresolution.com',
            type: 'text'
          },
          // User Settings
          {
            id: 'usr-001',
            name: 'Full Name',
            description: 'Your full name as displayed in the system',
            category: 'users',
            value: user?.full_name || 'Demo User',
            type: 'text'
          },
          {
            id: 'usr-002',
            name: 'Email Address',
            description: 'Your email address for login and notifications',
            category: 'users',
            value: user?.email || 'user@onestoresolution.com',
            type: 'text'
          },
          {
            id: 'usr-003',
            name: 'Phone Number',
            description: 'Your contact phone number',
            category: 'users',
            value: user?.phone || '07700 900123',
            type: 'text'
          },
          {
            id: 'usr-004',
            name: 'Preferred Language',
            description: 'Language for the user interface',
            category: 'users',
            value: 'English (UK)',
            type: 'select',
            options: ['English (UK)', 'English (US)', 'Spanish', 'French', 'German']
          },
          {
            id: 'usr-005',
            name: 'Date Format Preference',
            description: 'Your preferred date format',
            category: 'users',
            value: 'DD/MM/YYYY',
            type: 'select',
            options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
          },
          // Notification Settings
          {
            id: 'not-001',
            name: 'Email Notifications',
            description: 'Receive email notifications for important events',
            category: 'notifications',
            value: true,
            type: 'boolean'
          },
          {
            id: 'not-002',
            name: 'Low Stock Alerts',
            description: 'Get notified when inventory falls below minimum levels',
            category: 'notifications',
            value: true,
            type: 'boolean'
          },
          {
            id: 'not-003',
            name: 'Order Notifications',
            description: 'Receive notifications for new orders',
            category: 'notifications',
            value: true,
            type: 'boolean'
          },
          {
            id: 'not-004',
            name: 'Promotional Emails',
            description: 'Receive marketing and promotional communications',
            category: 'notifications',
            value: false,
            type: 'boolean'
          },
          // System Settings
          {
            id: 'sys-001',
            name: 'API Endpoint URL',
            description: 'URL of the OneStoreSolution backend API',
            category: 'system',
            value: 'https://onestoresolution-api.onrender.com',
            type: 'text'
          },
          {
            id: 'sys-002',
            name: 'Enable Debug Mode',
            description: 'Show additional debugging information (development only)',
            category: 'system',
            value: false,
            type: 'boolean'
          },
          {
            id: 'sys-003',
            name: 'Data Backup Frequency',
            description: 'How often automatic backups are performed',
            category: 'system',
            value: 'Daily',
            type: 'select',
            options: ['Hourly', 'Daily', 'Weekly', 'Monthly']
          },
          {
            id: 'sys-004',
            name: 'Session Timeout (minutes)',
            description: 'Automatic logout after period of inactivity',
            category: 'system',
            value: 30,
            type: 'number'
          }
        ];

        setSettings(mockSettings);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
        toast({
          title: "Error",
          description: err.message || 'Failed to load settings',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentStore, user]);

  // Filter settings by category
  const filteredSettings = settings.filter(setting => 
    activeTab === 'all' || setting.category === activeTab
  );

  // Handle setting changes
  const handleSettingChange = (id: string, value: any) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
    
    // Special handling for API URL change
    if (id === 'sys-001') {
      setApiUrl(value);
      setIsApiUrlChanged(true);
      
      toast({
        title: "API URL Changed",
        description: "API endpoint has been updated. Changes will take effect on next page load.",
        variant: "default"
      });
    }
    
    // Special handling for store changes
    if (id.startsWith('sto-')) {
      // Update store context
      const storeUpdates: Partial<typeof currentStore> = {};
            if (id === 'sto-001') storeUpdates.name = value;
            if (id === 'sto-002') storeUpdates.code = value;
            if (id === 'sto-003') storeUpdates.address = value;
            if (id === 'sto-004') storeUpdates.city = value;
            if (id === 'sto-005') storeUpdates.postalCode = value;
            if (id === 'sto-006') storeUpdates.phone = value;
            if (id === 'sto-007') storeUpdates.email = value;
      
      if (currentStore) {
        setStore({
          ...currentStore,
          ...storeUpdates
        });
      }
    }
    
    toast({
      title: "Setting Saved",
      description: `${settings.find(s => s.id === id)?.name} has been updated`,
      variant: "default"
    });
  };

  const handleResetToDefaults = () => {
    // In real app: reset to default values
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
      variant: "default"
    });
    // Would trigger a refetch of default settings
  };

  const handleSaveAllChanges = () => {
    // In real app: save all settings to backend/localStorage
    toast({
      title: "Settings Saved",
      description: "All settings have been saved successfully",
      variant: "default"
    });
    
    // Reset API URL change flag after save
    setIsApiUrlChanged(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
            <Trash2 className="mr-2 h-4 w-4" /> Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveAllChanges}
            className="flex-1 px-4 py-2 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white"
            isLoading={isApiUrlChanged}
          >
            {isApiUrlChanged ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>

            
           ) : (
  <>
    <Save className="mr-2 h-4 w-4" />
    Save All Changes
  </>
)

            
          </Button>
        </div>
      </div>

      {/* Tabs for Settings Categories */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'all' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            All Settings
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'general' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'store' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            Store
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'users' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'notifications' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === 'system' ? "text-white bg-[#0176D3]" : "text-slate-600 hover:bg-[#F1F5F9]"
            )}
          >
            System
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader className="pb-4">
          <h2 className="text-lg font-medium text-slate-900">{activeTab === 'all' ? 'All Settings' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h2>
        </CardHeader>
        <CardContent>
          {isLoading && settings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#0176D3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading settings...</p>
            </div>
          ) : (
            <>
              {filteredSettings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No settings found for the selected category
                </div>
              ) : (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="border border-[#E2E8F0] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{setting.name}</h3>
                          <p className="text-sm text-slate-600">{setting.description}</p>
                        </div>
                        {setting.type === 'boolean' && (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={!!setting.value}
                              onChange={(checked) => handleSettingChange(setting.id, checked)}
                              className="h-4 w-8"
                            />
                          </div>
                        )}
                      </div>
                      
                      {setting.type === 'text' && (
                        <Input
                          type="text"
                          placeholder={`Enter ${setting.name.toLowerCase()}...`}
                          value={setting.value || ''}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                        />
                      )}
                      
                      {setting.type === 'number' && (
                        <Input
                          type="number"
                          placeholder={`Enter ${setting.name.toLowerCase()}...`}
                          value={setting.value !== null && setting.value !== undefined ? setting.value : ''}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                        />
                      )}
                      
                      {setting.type === 'select' && (
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Select ${setting.name.toLowerCase()}...`}>
                              {setting.value}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-56">
                            {setting.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {setting.type === 'textarea' && (
                        <Textarea
                          placeholder={`Enter ${setting.name.toLowerCase()}...`}
                          value={setting.value || ''}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icons
function Save() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    </svg>
  );
}

function Loader2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2.06" y1="2.06" x2="4.89" y2="4.89"></line>
      <line x1="18.11" y1="18.11" x2="20.94" y2="20.94"></line>
    </svg>
  );
}

function Trash2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 5 6 5 20 9 20 9 6 13 6 13 20 17 20 17 6 19 6 19 20 21 20 21 6 23 6 23 4 3 4"></polygon>
    </svg>
  );
}

function Edit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.364 5.636l-2.828 2.828-8.485-8.485L5.636 18.364l1.414 1.414L16.95 7.05z"></path>
      <path d="M11.364 15.364l1.414-1.414L3 7.364l-1.414 1.414 9.778 9.778z"></path>
    </svg>
  );
}

function CheckCircle2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4"></path>
    </svg>
  );
}

function Bell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

function Moon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

function Sun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 22v2"></path>
      <path d="M4.22 12h2"></path>
      <path d="M19.78 12h2"></path>
      <path d="M7.76 4.22l2 2"></path>
      <path d="M16.24 19.78l2 2"></path>
    </svg>
  );
}

function Upload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="4" x2="12" y2="15"></line>
    </svg>
  );
}

function Download() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="4" x2="12" y2="15"></line>
    </svg>
  );
}

// Helper function for conditional class names
function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}
