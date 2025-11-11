import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { toast } from 'sonner';

const DeliverySettings = () => {
  const [settings, setSettings] = useState({
    delivery_enabled: true,
    delivery_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    delivery_time_slots: [
      { start: '09:00', end: '12:00', label: 'Morning (9 AM - 12 PM)' },
      { start: '12:00', end: '15:00', label: 'Afternoon (12 PM - 3 PM)' },
      { start: '15:00', end: '18:00', label: 'Evening (3 PM - 6 PM)' },
      { start: '18:00', end: '21:00', label: 'Night (6 PM - 9 PM)' }
    ],
    delivery_pincodes: [],
    delivery_areas: []
  });

  const [newPincode, setNewPincode] = useState('');
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings({
          delivery_enabled: response.data.delivery_enabled ?? true,
          delivery_days: response.data.delivery_days || allDays,
          delivery_time_slots: response.data.delivery_time_slots || settings.delivery_time_slots,
          delivery_pincodes: response.data.delivery_pincodes || [],
          delivery_areas: response.data.delivery_areas || []
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      toast.success('Delivery settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    const newDays = settings.delivery_days.includes(day)
      ? settings.delivery_days.filter(d => d !== day)
      : [...settings.delivery_days, day];
    setSettings({ ...settings, delivery_days: newDays });
  };

  const addPincode = () => {
    if (newPincode && newPincode.length === 6 && /^\d+$/.test(newPincode)) {
      if (!settings.delivery_pincodes.includes(newPincode)) {
        setSettings({ ...settings, delivery_pincodes: [...settings.delivery_pincodes, newPincode] });
        setNewPincode('');
        toast.success('Pincode added');
      } else {
        toast.error('Pincode already exists');
      }
    } else {
      toast.error('Enter valid 6-digit pincode');
    }
  };

  const removePincode = (pincode) => {
    setSettings({
      ...settings,
      delivery_pincodes: settings.delivery_pincodes.filter(p => p !== pincode)
    });
  };

  const addArea = () => {
    if (newArea && newArea.trim()) {
      const areaName = newArea.trim();
      if (!settings.delivery_areas.includes(areaName)) {
        setSettings({ ...settings, delivery_areas: [...settings.delivery_areas, areaName] });
        setNewArea('');
        toast.success('Area added');
      } else {
        toast.error('Area already exists');
      }
    } else {
      toast.error('Enter area name');
    }
  };

  const removeArea = (area) => {
    setSettings({
      ...settings,
      delivery_areas: settings.delivery_areas.filter(a => a !== area)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Delivery Settings</h2>
        <Button onClick={handleSaveSettings} disabled={loading} className="bg-pink-600 hover:bg-pink-700">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Delivery Days */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-800">Delivery Days</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Select which days delivery is available</p>
        <div className="flex flex-wrap gap-3">
          {allDays.map(day => (
            <Button
              key={day}
              onClick={() => toggleDay(day)}
              variant={settings.delivery_days.includes(day) ? 'default' : 'outline'}
              className={settings.delivery_days.includes(day) ? 'bg-pink-600 hover:bg-pink-700' : ''}
            >
              {day.substring(0, 3)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Delivery Time Slots */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-800">Delivery Time Slots</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Available delivery time slots (default slots shown)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.delivery_time_slots.map((slot, index) => (
            <div key={index} className="p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
              <p className="font-semibold text-gray-800">{slot.label}</p>
              <p className="text-sm text-gray-600">{slot.start} - {slot.end}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery Pincodes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-800">Delivery Pincodes</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Add pincodes where delivery is available</p>
        
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter 6-digit pincode"
            value={newPincode}
            onChange={(e) => setNewPincode(e.target.value)}
            maxLength={6}
            className="flex-1"
          />
          <Button onClick={addPincode} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.delivery_pincodes.length === 0 ? (
            <p className="text-sm text-gray-500">No pincodes added yet</p>
          ) : (
            settings.delivery_pincodes.map(pincode => (
              <Badge key={pincode} variant="secondary" className="text-sm py-1 px-3">
                {pincode}
                <button
                  onClick={() => removePincode(pincode)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </Card>

      {/* Delivery Areas */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-800">Delivery Areas</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Add area names where delivery is available</p>
        
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Enter area name (e.g., Bopal, Ahmedabad)"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addArea} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.delivery_areas.length === 0 ? (
            <p className="text-sm text-gray-500">No areas added yet</p>
          ) : (
            settings.delivery_areas.map(area => (
              <Badge key={area} variant="secondary" className="text-sm py-1 px-3">
                {area}
                <button
                  onClick={() => removeArea(area)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default DeliverySettings;
