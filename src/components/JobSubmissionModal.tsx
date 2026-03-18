/**
 * JobSubmissionModal.tsx
 *
 * Modal form for companies to submit a job post for review.
 * Triggered by "Post a Job" button in the Job Posts tab.
 */

import { useState } from "react";
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitJob } from "@/services/placements";

interface JobSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JobSubmissionModal({ isOpen, onClose }: JobSubmissionModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    companyName: "",
    role: "",
    location: "",
    description: "",
    compensationType: "",
    compensationNote: "",
    perks: [""],
    requirements: [""],
    applyEmail: "",
    applySubject: "",
    submitterName: "",
    submitterEmail: "",
    submitterNote: "",
  };

  const [form, setForm] = useState(initialFormState);

  const addListItem = (field: "perks" | "requirements") => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const updateListItem = (
    field: "perks" | "requirements",
    index: number,
    value: string
  ) => {
    setForm((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const removeListItem = (field: "perks" | "requirements", index: number) => {
    if (form[field].length <= 1) return;
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!form.companyName || !form.role || !form.location || !form.description ||
        !form.compensationType || !form.compensationNote || !form.applyEmail ||
        !form.applySubject || !form.submitterName || !form.submitterEmail) {
      toast({ title: "Required fields missing", description: "Please fill in all mandatory fields.", variant: "destructive" });
      return false;
    }

    if (form.description.length < 50) {
      toast({ title: "Description too short", description: "Please provide at least 50 characters of detail.", variant: "destructive" });
      return false;
    }

    if (!emailRegex.test(form.applyEmail) || !emailRegex.test(form.submitterEmail)) {
      toast({ title: "Invalid email", description: "Please enter valid email addresses.", variant: "destructive" });
      return false;
    }

    if (form.perks.filter(p => !!p).length === 0 || form.requirements.filter(r => !!r).length === 0) {
      toast({ title: "Lists empty", description: "Add at least one perk and one requirement.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...form,
        perks: form.perks.filter(p => !!p),
        requirements: form.requirements.filter(r => !!r)
      };
      await submitJob(data);
      toast({ title: "Submitted for review", description: "Thank you! Our team will verify the job post shortly." });
      setForm(initialFormState);
      onClose();
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Post a Job at Camply</DialogTitle>
          <DialogDescription>
            Submit your role for review. Active students and alumni will see your post once approved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g. Acme Corp"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g. Backend Engineer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Bangalore (Hybrid)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compensationType">Compensation Type *</Label>
              <Input
                id="compensationType"
                placeholder="e.g. Paid, Performance-based"
                value={form.compensationType}
                onChange={(e) => setForm({ ...form, compensationType: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description * (min 50 chars)</Label>
            <Textarea
              id="description"
              placeholder="Tell us more about the role, day-to-day tasks, and team culture."
              className="min-h-[120px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensationNote">Compensation Details & Notes *</Label>
            <Textarea
              id="compensationNote"
              placeholder="e.g. ₹15 LPA Fixed + 2 LPA Bonus. Health insurance included."
              value={form.compensationNote}
              onChange={(e) => setForm({ ...form, compensationNote: e.target.value })}
              required
            />
          </div>

          {/* Perks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Perks & Benefits *</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem("perks")}>
                <Plus className="h-3 w-3 mr-1" /> Add Perk
              </Button>
            </div>
            <div className="space-y-2">
              {form.perks.map((perk, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="e.g. Free lunch"
                    value={perk}
                    onChange={(e) => updateListItem("perks", i, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.perks.length <= 1}
                    onClick={() => removeListItem("perks", i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Requirements *</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem("requirements")}>
                <Plus className="h-3 w-3 mr-1" /> Add Requirement
              </Button>
            </div>
            <div className="space-y-2">
              {form.requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="e.g. 2+ years React experience"
                    value={req}
                    onChange={(e) => updateListItem("requirements", i, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.requirements.length <= 1}
                    onClick={() => removeListItem("requirements", i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-accent/5 rounded-lg space-y-4 border border-accent/10">
            <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Application & Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applyEmail">Apply Email *</Label>
                <Input
                  id="applyEmail"
                  type="email"
                  placeholder="hiring@company.com"
                  value={form.applyEmail}
                  onChange={(e) => setForm({ ...form, applyEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applySubject">Email Subject *</Label>
                <Input
                  id="applySubject"
                  placeholder="Application for [Role]"
                  value={form.applySubject}
                  onChange={(e) => setForm({ ...form, applySubject: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitterName">Your Name *</Label>
                <Input
                  id="submitterName"
                  placeholder="Recruiter / Founder Name"
                  value={form.submitterName}
                  onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Your Work Email *</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="name@company.com"
                  value={form.submitterEmail}
                  onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="submitterNote">Note to Camply Team (Optional)</Label>
              <Textarea
                id="submitterNote"
                placeholder="Anything else we should know?"
                value={form.submitterNote}
                onChange={(e) => setForm({ ...form, submitterNote: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Job Post
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
