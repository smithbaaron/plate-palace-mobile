import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { Plate } from "@/components/seller/PlateFormTypes";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/hooks/use-notifications";

interface ScheduleEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  existingPlates: Plate[];
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({
  open,
  onOpenChange,
  selectedDate,
  existingPlates
}) => {
  const [eventType, setEventType] = useState<'plate' | 'pickup' | 'custom'>('plate');
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const { notifySuccess } = useNotifications();

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setEventType('plate');
      setEventTitle('');
      setEventTime('');
      setEventNotes('');
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedDate || !eventTitle.trim()) return;

    // In a real app, this would save to the database
    notifySuccess("Event scheduled", `${eventTitle} has been scheduled for ${format(selectedDate, 'PPP')}`);
    onOpenChange(false);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'plate': return 'bg-nextplate-orange';
      case 'pickup': return 'bg-blue-600';
      case 'custom': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 text-nextplate-orange" size={20} />
            Schedule Event
            {selectedDate && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Plates for this date */}
          {existingPlates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-400">Already Scheduled</h3>
              <div className="space-y-2">
                {existingPlates.map((plate) => (
                  <Card key={plate.id} className="bg-nextplate-darkgray border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{plate.name}</div>
                          <div className="text-sm text-gray-400">
                            {plate.quantity} servings • ${plate.price.toFixed(2)} each
                          </div>
                        </div>
                        <div className="text-sm text-nextplate-orange font-medium">
                          ${(plate.price * plate.quantity).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Event Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Event Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'plate', label: 'New Plate', icon: Plus },
                { type: 'pickup', label: 'Pickup Time', icon: Clock },
                { type: 'custom', label: 'Custom Event', icon: Calendar }
              ].map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant={eventType === type ? 'default' : 'outline'}
                  onClick={() => setEventType(type as any)}
                  className={`
                    ${eventType === type ? getEventTypeColor(type) : 'border-gray-600 hover:bg-gray-800'}
                  `}
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventTitle" className="text-sm font-medium">
                {eventType === 'plate' ? 'Plate Name' : eventType === 'pickup' ? 'Pickup Details' : 'Event Title'}
              </Label>
              <Input
                id="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={
                  eventType === 'plate' ? 'e.g., Grilled Salmon with Quinoa' :
                  eventType === 'pickup' ? 'e.g., Downtown Location Pickup' :
                  'e.g., Kitchen Maintenance'
                }
                className="bg-nextplate-darkgray border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="eventTime" className="text-sm font-medium">
                Time
              </Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-nextplate-darkgray border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="eventNotes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="eventNotes"
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Additional details or instructions..."
                className="bg-nextplate-darkgray border-gray-600"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!eventTitle.trim()}
              className="bg-nextplate-orange hover:bg-orange-600"
            >
              Schedule Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleEventModal;
