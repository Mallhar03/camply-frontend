import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { completeOnboarding } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const APPROVED_DOMAINS = [
  'Frontend',
  'Backend',
  'DevOps',
  'Full Stack',
  'Design',
  'Machine Learning',
  'Agentic AI',
  'Prompt Engineering',
  'AI Automation',
  'Operations',
  'DSA / Competitive Programming',
  'Database',
  'Authentication & Security',
] as const;

const HACKATHON_OPTIONS = [
  { value: '1+', label: 'Getting started' },
  { value: '5+', label: 'Experienced' },
  { value: '10+', label: 'Veteran' },
] as const;

export function OnboardingWizard() {
  const { setUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hackathonsCount, setHackathonsCount] = useState<string>('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step transition direction for animation
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  function goNext() {
    setDirection('forward');
    setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s));
  }

  function goBack() {
    setDirection('back');
    setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s));
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 3) return prev; // silently block 4th selection
      return [...prev, skill];
    });
  }

  async function handleFinish() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { user: updatedUser } = await completeOnboarding({
        skills: selectedSkills,
        hackathonsCount,
        bio,
      });
      setUser(updatedUser);
      toast({
        title: "You're all set! 🎉",
        description: 'Your profile is ready.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }

  const trimmedBio = bio.trim();
  const bioLen = trimmedBio.length;
  const bioValid = bioLen >= 10 && bioLen <= 300;
  const bioOverLimit = bioLen > 300;

  return (
    // Full-screen blocking overlay — not dismissible
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onKeyDown={(e) => e.key === 'Escape' && e.preventDefault()}
    >
      <div className="max-w-lg w-full mx-4 rounded-2xl border bg-card shadow-2xl p-8">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                n <= step
                  ? 'w-8 bg-primary'
                  : 'w-2.5 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* ───── STEP 1: Domain Interests ───── */}
        {step === 1 && (
          <div
            key="step1"
            style={{
              animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.25s ease-out`,
            }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">What are you good at?</h2>
            <p className="text-muted-foreground mb-6">Pick 2–3 areas that describe you best</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {APPROVED_DOMAINS.map((domain) => {
                const isSelected = selectedSkills.includes(domain);
                const isDisabled = !isSelected && selectedSkills.length >= 3;
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleSkill(domain)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 select-none
                      ${isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isDisabled
                          ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
                          : 'border-border text-foreground hover:border-primary hover:text-primary cursor-pointer'
                      }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              <span className={selectedSkills.length >= 2 ? 'text-primary font-medium' : ''}>
                {selectedSkills.length}
              </span>{' '}
              / 3 selected
            </p>

            <Button
              className="w-full"
              disabled={selectedSkills.length < 2}
              onClick={goNext}
            >
              Next →
            </Button>
          </div>
        )}

        {/* ───── STEP 2: Hackathon Experience ───── */}
        {step === 2 && (
          <div
            key="step2"
            style={{
              animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.25s ease-out`,
            }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Hackathon experience?</h2>
            <p className="text-muted-foreground mb-6">
              How many hackathons have you participated in or won?
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {HACKATHON_OPTIONS.map(({ value, label }) => {
                const isSelected = hackathonsCount === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHackathonsCount(value)}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-150 cursor-pointer
                      ${isSelected
                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 ring-offset-card'
                        : 'border-border text-foreground hover:border-primary'
                      }`}
                  >
                    <span className="text-2xl font-bold">{value}</span>
                    <span className="text-xs mt-1 opacity-80">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={goBack}>
                ← Back
              </Button>
              <Button
                className="flex-1"
                disabled={!hackathonsCount}
                onClick={goNext}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* ───── STEP 3: Bio ───── */}
        {step === 3 && (
          <div
            key="step3"
            style={{
              animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.25s ease-out`,
            }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Tell teammates about yourself</h2>
            <p className="text-muted-foreground mb-4">One line is enough — just be real</p>

            {/* Amber warning box */}
            <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 mb-4 text-sm text-amber-800 dark:text-amber-300">
              <span className="shrink-0">⚠️</span>
              <span>
                Skipping or writing something vague here will make it harder for the right teammates
                to find you. The more specific you are, the better your matches.
              </span>
            </div>

            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="e.g. Final year CSE student who loves building AI tools and winning hackathons"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={350}
            />

            <div className="flex justify-end mt-1 mb-4">
              <span className={`text-xs ${bioOverLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {bioLen} / 300
              </span>
            </div>

            {/* Inline error */}
            {submitError && (
              <p className="text-sm text-destructive mb-3">{submitError}</p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={goBack} disabled={isSubmitting}>
                ← Back
              </Button>
              <Button
                className="flex-1"
                disabled={!bioValid || isSubmitting}
                onClick={handleFinish}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  'Finish →'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSS keyframe animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
