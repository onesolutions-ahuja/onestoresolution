import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('general');
  const [isApiUrlChanged, setIsApiUrlChanged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const mockSettings: Setting[] = [
          // General Settings
          {
            id: 'gen-001',
            name: 'Company Name',
            description: 'The legal name of your business',
            category: 'general',
            value: 'OneStoreSolution Demo',
            type: 'text',
          },
          {
            id: 'gen-002',
            name: 'Business Registration Number',
            description: 'Your official business registration or tax ID',
            category: 'general',
            value: 'GB123456789',
            type: 'text',
          },
          {
            id: 'gen-003',
            name: 'Default Currency',
            description: 'The default currency for all transactions',
            category: 'general',
            value: 'GBP',
            type: 'select',
            options: ['GBP', 'USD', 'EUR', 'CAD', 'AUD'],
          },
          {
            id: 'gen-004',
            name: 'Tax Rate (%)',
            description: 'Default tax rate applied to sales',
            category: 'general',
            value: 20,
            type: 'number',
          },
          {
            id: 'gen-005',
            name: 'Date Format',
            description: 'How dates are displayed throughout the system',
            category: 'general',
            value: 'DD/MM/YYYY',
            type: 'select',
            options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
          },
          {
            id: 'gen-006',
            name: 'Time Format',
            description: 'How times are displayed throughout the system',
            category: 'general',
            value: '24-hour',
            type: 'select',
            options: ['12-hour', '24-hour'],
          },

          // Store Settings
          {
            id: 'sto-001',
            name: 'Store Name',
            description: 'The display name of your current store',
            category: 'store',
            value: currentStore?.name || 'Main Store',
            type: 'text',
          },
          {
            id: 'sto-002',
            name: 'Store Code',
            description: 'Unique identifier for your store',
            category: 'store',
            value: currentStore?.code || 'STORE_001',
            type: 'text',
          },
          {
            id: 'sto-003',
            name: 'Store Address',
            description: 'Physical address of your store',
            category: 'store',
            value: currentStore?.address || '123 Retail Street',
            type: 'textarea',
          },
          {
            id: 'sto-004',
            name: 'Store City',
            description: 'City where your store is located',
            category: 'store',
            value: currentStore?.city || 'London',
            type: 'text',
          },
          {
            id: 'sto-005',
            name: 'Store Postal Code',
            description: 'Postal code for your store location',
            category: 'store',
            value: currentStore?.postalCode || 'SW1A 1AA',
            type: 'text',
          },
          {
            id: 'sto-006',
            name: 'Store Phone Number',
            description: 'Contact phone number for your store',
            category: 'store',
            value: currentStore?.phone || '020 7946 0123',
            type: 'text',
          },
          {
            id: 'sto-007',
            name: 'Store Email',
            description: 'Contact email address for your store',
            category: 'store',
            value:
              currentStore?.email ||
              'store@onestoresolution.com',
            type: 'text',
          },

          // User Settings
          {
            id: 'usr-001',
            name: 'Full Name',
            description:
              'Your full name as displayed in the system',
            category: 'users',
            value: user?.full_name || 'Demo User',
            type: 'text',
          },
          {
            id: 'usr-002',
            name: 'Email Address',
            description:
              'Your email address for login and notifications',
            category: 'users',
            value:
              user?.email ||
              'user@onestoresolution.com',
            type: 'text',
          },
          {
            id: 'usr-003',
            name: 'Phone Number',
            description:
              'Your contact phone number',
            category: 'users',
            value:
              user?.phone ||
              '07700 900123',
            type: 'text',
          },
          {
            id: 'usr-004',
            name: 'Preferred Language',
            description:
              'Language for the user interface',
            category: 'users',
            value: 'English (UK)',
            type: 'select',
            options: [
              'English (UK)',
              'English (US)',
              'Spanish',
              'French',
              'German',
            ],
          },
          {
            id: 'usr-005',
            name: 'Date Format Preference',
            description:
              'Your preferred date format',
            category: 'users',
            value: 'DD/MM/YYYY',
            type: 'select',
            options: [
              'DD/MM/YYYY',
              'MM/DD/YYYY',
              'YYYY-MM-DD',
            ],
          },

          // Notification Settings
          {
            id: 'not-001',
            name: 'Email Notifications',
            description:
              'Receive email notifications for important events',
            category: 'notifications',
            value: true,
            type: 'boolean',
          },
          {
            id: 'not-002',
            name: 'Low Stock Alerts',
            description:
              'Get notified when inventory falls below minimum levels',
            category: 'notifications',
            value: true,
            type: 'boolean',
          },
          {
            id: 'not-003',
            name: 'Order Notifications',
            description:
              'Receive notifications for new orders',
            category: 'notifications',
            value: true,
            type: 'boolean',
          },
          {
            id: 'not-004',
            name: 'Promotional Emails',
            description:
              'Receive marketing and promotional communications',
            category: 'notifications',
            value: false,
            type: 'boolean',
          },

          // System Settings
          {
            id: 'sys-001',
            name: 'API Endpoint URL',
            description:
              'URL of the OneStoreSolution backend API',
            category: 'system',
            value:
              'https://onestoresolution-api.onrender.com',
            type: 'text',
          },
          {
            id: 'sys-002',
            name: 'Enable Debug Mode',
            description:
              'Show additional debugging information (development only)',
            category: 'system',
            value: false,
            type: 'boolean',
          },
          {
            id: 'sys-003',
            name: 'Data Backup Frequency',
            description:
              'How often automatic backups are performed',
            category: 'system',
            value: 'Daily',
            type: 'select',
            options: [
              'Hourly',
              'Daily',
              'Weekly',
              'Monthly',
            ],
          },
          {
            id: 'sys-004',
            name: 'Session Timeout (minutes)',
            description:
              'Automatic logout after period of inactivity',
            category: 'system',
            value: 30,
            type: 'number',
          },
        ];

        setSettings(mockSettings);
      } catch (err: any) {
        toast({
          title: 'Error',
          description:
            err?.message || 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentStore, user, toast]);

  const filteredSettings = settings.filter(
    (setting) =>
      activeTab === 'all' ||
      setting.category === activeTab
  );

  const handleSettingChange = (
    id: string,
    value: any
  ) => {
    setSettings((previousSettings) =>
      previousSettings.map((setting) =>
        setting.id === id
          ? { ...setting, value }
          : setting
      )
    );

    if (id === 'sys-001') {
      setIsApiUrlChanged(true);

      toast({
        title: 'API URL Changed',
        description:
          'API endpoint has been updated. Changes will take effect on next page load.',
      });
    }

    if (id.startsWith('sto-') && currentStore) {
      const storeUpdates: Record<string, any> = {};

      if (id === 'sto-001') {
        storeUpdates.name = value;
      }

      if (id === 'sto-002') {
        storeUpdates.code = value;
      }

      if (id === 'sto-003') {
        storeUpdates.address = value;
      }

      if (id === 'sto-004') {
        storeUpdates.city = value;
      }

      if (id === 'sto-005') {
        storeUpdates.postalCode = value;
      }

      if (id === 'sto-006') {
        storeUpdates.phone = value;
      }

      if (id === 'sto-007') {
        storeUpdates.email = value;
      }

      setStore({
        ...currentStore,
        ...storeUpdates,
      });
    }

    const changedSetting = settings.find(
      (setting) => setting.id === id
    );

    if (changedSetting) {
      toast({
        title: 'Setting Saved',
        description: `${changedSetting.name} has been updated`,
      });
    }
  };

  const handleResetToDefaults = () => {
    toast({
      title: 'Settings Reset',
      description:
        'All settings have been reset to default values',
    });
  };

  const handleSaveAllChanges = () => {
    toast({
      title: 'Settings Saved',
      description:
        'All settings have been saved successfully',
    });

    setIsApiUrlChanged(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold te
