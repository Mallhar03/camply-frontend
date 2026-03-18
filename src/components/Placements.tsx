/**
 * Placements.tsx
 *
 * Main orchestrator for the Placements page.
 * Manages tab state and renders the correct section per tab.
 */

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Users, Star, Building, BookOpen, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import {
  fetchJobs,
  fetchPartnerTests,
  fetchPlacements,
} from "@/services/placements";
import { JobPostCard } from "./placements/JobPostCard";
import { PartnerTestCard } from "./placements/PartnerTestCard";
import { PlacementExperienceCard } from "./placements/PlacementExperienceCard";
import { PlacementsSkeleton } from "./placements/PlacementsSkeleton";
import { JobSubmissionModal } from "./JobSubmissionModal";

const tabs = [
  { id: "all", label: "All" },
  { id: "jobs", label: "Job Posts" },
  { id: "tests", label: "Online Tests" },
  { id: "experience", label: "Experiences" },
  { id: "gd", label: "Group Discussions" },
] as const;

type TabId = typeof tabs[number]["id"];

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-center py-12 space-y-3 bg-accent/5 rounded-xl border border-dashed border-accent/20">
    <p className="text-muted-foreground">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 bg-accent/5 rounded-xl border border-dashed border-accent/20">
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

export function Placements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // 1. Jobs query
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Partner tests query
  const {
    data: testsData,
    isLoading: testsLoading,
    error: testsError,
  } = useQuery({
    queryKey: ["partner-tests"],
    queryFn: fetchPartnerTests,
    staleTime: 10 * 60 * 1000,
  });

  // 3. All placement experiences query
  const {
    data: placementsData,
    isLoading: placementsLoading,
    error: placementsError,
  } = useQuery({
    queryKey: ["placements"],
    queryFn: () => fetchPlacements(),
    staleTime: 2 * 60 * 1000,
  });

  // 4. GD-only query
  const {
    data: gdData,
    isLoading: gdLoading,
  } = useQuery({
    queryKey: ["placements", "GROUP_DISCUSSION"],
    queryFn: () => fetchPlacements("GROUP_DISCUSSION"),
    staleTime: 2 * 60 * 1000,
  });

  const JobPostsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold text-foreground">Job Posts</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsJobModalOpen(true)}
        >
          Post a Job
        </Button>
      </div>
      {jobsLoading ? (
        <PlacementsSkeleton />
      ) : jobsError ? (
        <ErrorState
          message="Failed to load job posts."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })}
        />
      ) : !jobsData?.jobs.length ? (
        <EmptyState message="No job posts available right now." />
      ) : (
        jobsData.jobs.map((job) => <JobPostCard key={job.id} job={job} />)
      )}
    </div>
  );

  const OnlineTestsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-foreground">Online Tests</h2>
      </div>
      {testsLoading ? (
        <PlacementsSkeleton />
      ) : testsError ? (
        <ErrorState
          message="Failed to load test platforms."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["partner-tests"] })}
        />
      ) : !testsData?.tests.length ? (
        <EmptyState message="No test platforms available right now." />
      ) : (
        testsData.tests.map((test) => <PartnerTestCard key={test.id} test={test} />)
      )}
    </div>
  );

  const PlacementExperiencesSection = () => {
    const experiencePosts = placementsData?.posts.filter(
      (p) => p.type !== "GROUP_DISCUSSION"
    ) ?? [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">
              Placement Experiences
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                title: "Coming soon",
                description: "Experience submission form is in progress.",
              })
            }
          >
            Share Experience
          </Button>
        </div>
        {placementsLoading ? (
          <PlacementsSkeleton />
        ) : placementsError ? (
          <ErrorState
            message="Failed to load placement experiences."
            onRetry={() =>
              queryClient.invalidateQueries({ queryKey: ["placements"] })
            }
          />
        ) : !experiencePosts.length ? (
          <EmptyState message="No experiences shared yet. Be the first!" />
        ) : (
          experiencePosts.map((post) => (
            <PlacementExperienceCard key={post.id} post={post} />
          ))
        )}
      </div>
    );
  };

  const GroupDiscussionsSection = () => {
    const gdPosts = gdData?.posts ?? [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold text-foreground">
            Group Discussions
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Real-time insights from group discussion rounds across various companies.
        </p>
        {gdLoading ? (
          <PlacementsSkeleton />
        ) : !gdPosts.length ? (
          <EmptyState message="No group discussion experiences yet." />
        ) : (
          gdPosts.map((post) => (
            <PlacementExperienceCard key={post.id} post={post} />
          ))
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return (
          <div className="space-y-12">
            <JobPostsSection />
            <div className="h-px bg-accent/10" />
            <OnlineTestsSection />
            <div className="h-px bg-accent/10" />
            <PlacementExperiencesSection />
          </div>
        );
      case "jobs":
        return <JobPostsSection />;
      case "tests":
        return <OnlineTestsSection />;
      case "experience":
        return <PlacementExperiencesSection />;
      case "gd":
        return <GroupDiscussionsSection />;
      default:
        return null;
    }
  };

  return (
    <>
      <SEO title="Placements | Camply" />
      <div className="space-y-6">
        {/* Mobile header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-foreground">
            Placements
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsJobModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-4 space-y-8 pb-24 md:pb-8">
          {/* Desktop Heading */}
          <div className="hidden md:flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Briefcase className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Campus Careers & Placements
                </h1>
                <p className="text-sm text-muted-foreground">
                  Find jobs, practice tests, and learn from seniors.
                </p>
              </div>
            </div>
            <Button
              className="gap-2 shadow-lg shadow-accent/20"
              onClick={() => setIsJobModalOpen(true)}
            >
              <Briefcase className="h-4 w-4" />
              Post a Job
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-background to-accent/5 border-accent/10">
              <Building className="h-5 w-5 md:h-6 md:w-6 text-accent mx-auto mb-2" />
              <p className="text-xl md:text-3xl font-bold text-foreground leading-tight">
                {jobsData?.total ?? 0}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Open Roles
              </p>
            </Card>
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-background to-accent/5 border-accent/10">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-accent mx-auto mb-2" />
              <p className="text-xl md:text-3xl font-bold text-foreground leading-tight">
                {placementsData?.posts.length ?? 0}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Experiences
              </p>
            </Card>
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-background to-accent/5 border-accent/10">
              <Star className="h-5 w-5 md:h-6 md:w-6 text-accent mx-auto mb-2" />
              <p className="text-xl md:text-3xl font-bold text-foreground leading-tight">
                {testsData?.total ?? 0}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                Platforms
              </p>
            </Card>
          </div>

          {/* Tab bar — horizontally scrollable on mobile */}
          <div className="sticky top-[60px] md:top-0 bg-background/95 backdrop-blur z-10 -mx-4 px-4 py-2 border-y md:border-none md:bg-transparent md:backdrop-blur-none md:p-0 md:relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-full px-5 transition-all ${
                    activeTab === tab.id ? "shadow-md shadow-accent/20" : "hover:bg-accent/5"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Job submission modal */}
      <JobSubmissionModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
      />
    </>
  );
}