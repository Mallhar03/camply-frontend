import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { Loader2, Calendar as CalendarIcon, MapPin, Globe, Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface HostEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostEventModal({ open, onOpenChange }: HostEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    registrationUrl: '',
    bannerUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/v1/events', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!res.success) throw new Error(res.message);

      toast({
        title: "Event submitted! 🎉",
        description: "Your event is now pending admin approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        registrationUrl: '',
        bannerUrl: '',
      });
    } catch (error: any) {
      toast({
        title: "Failed to host event",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary" />
              Host an Event
            </DialogTitle>
            <DialogDescription>
              Create a campus event. Pro users only. Events require admin approval before going live.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g. Winter Hackathon 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us more about your event..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Auditorium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Date & Time
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationUrl" className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Registration Link
              </Label>
              <Input
                id="registrationUrl"
                type="url"
                placeholder="https://..."
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerUrl" className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Banner Image URL
              </Label>
              <Input
                id="bannerUrl"
                type="url"
                placeholder="https://..."
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Approval'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
