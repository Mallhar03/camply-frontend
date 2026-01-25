import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Filter, Plus, Search as SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreatePost } from "./CreatePost";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { generateWebSiteSchema } from "@/utils/seo";

const initialMockPosts = [
  {
    id: "1",
    username: "@dev_student_2024",
    trustLevel: "silver" as const,
    timeAgo: "2h ago",
    content: "Can anyone help me understand how to implement OAuth 2.0 in a React app? I'm getting confused with the flow and token management. Any good resources or step-by-step guides?",
    upvotes: 23,
    downvotes: 2,
    comments: 8,
    category: "query" as const
  },
  {
    id: "2", 
    username: "@system_architect_pro",
    trustLevel: "platinum" as const,
    timeAgo: "4h ago",
    content: "Here's a complete guide to microservices architecture that helped me land my FAANG internship. Key points: API Gateway, Service Discovery, Circuit Breakers, and proper monitoring. DM for detailed breakdown!",
    upvotes: 156,
    downvotes: 4,
    comments: 34,
    category: "solution" as const
  },
  {
    id: "3",
    username: "@startup_hunter",
    trustLevel: "gold" as const,
    timeAgo: "6h ago", 
    content: "Looking for a referral at Meta or Google for SWE New Grad 2025. Have solid projects including a distributed chat app and ML recommendation system. GPA: 3.8/4.0. Can share resume!",
    upvotes: 45,
    downvotes: 1,
    comments: 12,
    category: "job" as const
  },
  {
    id: "4",
    username: "@ml_enthusiast",
    trustLevel: "gold" as const,
    timeAgo: "8h ago",
    content: "Just finished implementing a neural network from scratch in Python! The math behind backpropagation finally clicked. Happy to share my notes and code walkthrough with anyone interested in ML fundamentals.",
    upvotes: 89,
    downvotes: 3,
    comments: 18,
    category: "solution" as const
  },
  {
    id: "5",
    username: "@hackathon_queen",
    trustLevel: "silver" as const,
    timeAgo: "12h ago",
    content: "Team won 1st place at Stanford TreeHacks! Our project was an AI-powered study planner that adapts to your learning style. Looking to turn this into a startup - need a business co-founder!",
    upvotes: 234,
    downvotes: 8,
    comments: 67,
    category: "discussion" as const
  },
  {
    id: "6",
    username: "@frontend_wizard",
    trustLevel: "gold" as const,
    timeAgo: "14h ago",
    content: "Created a React component library with 50+ components and TypeScript support. Includes dark mode, animations, and accessibility features. Open source and ready for production use! 🚀",
    upvotes: 178,
    downvotes: 2,
    comments: 45,
    category: "solution" as const
  },
  {
    id: "7",
    username: "@crypto_student",
    trustLevel: "bronze" as const,
    timeAgo: "16h ago",
    content: "Has anyone worked with blockchain development? I'm trying to understand smart contracts and Web3 integration. Looking for study buddies or mentorship opportunities.",
    upvotes: 34,
    downvotes: 5,
    comments: 28,
    category: "query" as const
  },
  {
    id: "8",
    username: "@data_scientist_pro",
    trustLevel: "platinum" as const,
    timeAgo: "18h ago",
    content: "Sharing my journey from CS student to Data Scientist at Netflix. Key skills: Python, SQL, Machine Learning, Statistics. Happy to review resumes and provide career guidance!",
    upvotes: 298,
    downvotes: 6,
    comments: 89,
    category: "discussion" as const
  },
  {
    id: "9",
    username: "@mobile_dev_ninja",
    trustLevel: "silver" as const,
    timeAgo: "20h ago",
    content: "Built a cross-platform mobile app using React Native for my final year project. Features include real-time chat, push notifications, and offline sync. Tech stack: RN, Firebase, Redux.",
    upvotes: 67,
    downvotes: 1,
    comments: 23,
    category: "solution" as const
  },
  {
    id: "10",
    username: "@intern_seeker_2025",
    trustLevel: "bronze" as const,
    timeAgo: "1d ago",
    content: "Amazon SDE Intern interview next week! Any tips for the coding rounds? I've been practicing on LeetCode but feeling nervous about the behavioral questions. What should I expect?",
    upvotes: 156,
    downvotes: 3,
    comments: 78,
    category: "job" as const
  },
  {
    id: "11",
    username: "@ai_researcher",
    trustLevel: "platinum" as const,
    timeAgo: "1d ago",
    content: "Published my first research paper on computer vision! 'Efficient Object Detection using Transformer Architecture' - accepted at CVPR 2024. DM if you want to discuss the methodology or collaborate!",
    upvotes: 445,
    downvotes: 12,
    comments: 134,
    category: "discussion" as const
  },
  {
    id: "12",
    username: "@cloud_architect",
    trustLevel: "gold" as const,
    timeAgo: "1d ago",
    content: "Deployed my first serverless application on AWS! Used Lambda, API Gateway, DynamoDB, and S3. Cost optimization was tricky but managed to keep it under $5/month. Architecture diagram in comments!",
    upvotes: 123,
    downvotes: 4,
    comments: 56,
    category: "solution" as const
  },
  {
    id: "13",
    username: "@freshman_coder",
    trustLevel: "bronze" as const,
    timeAgo: "2h ago",
    content: "Just completed my first-ever coding assignment in C! Took forever but finally understand loops and arrays. College is wild 😂",
    upvotes: 39,
    downvotes: 0,
    comments: 12,
    category: "discussion" as const
},
{
    id: "14",
    username: "@second_year_js",
    trustLevel: "silver" as const,
    timeAgo: "4h ago",
    content: "Built a mini e-commerce app for my Web Dev Lab using React. Not perfect but proud of the cart and payment simulation!",
    upvotes: 61,
    downvotes: 1,
    comments: 20,
    category: "solution" as const
},
{
    id: "15",
    username: "@placement_prep24",
    trustLevel: "gold" as const,
    timeAgo: "8h ago",
    content: "Final year and placements are stressing me out. Anyone cracked Infosys recently? What kind of aptitude questions appear?",
    upvotes: 102,
    downvotes: 2,
    comments: 45,
    category: "job" as const
},
{
    id: "16",
    username: "@hostel_hacker",
    trustLevel: "silver" as const,
    timeAgo: "11h ago",
    content: "Made my hostel attendance app using Flutter for a mini project. Even integrated QR scanning. My prof loved it!",
    upvotes: 88,
    downvotes: 1,
    comments: 17,
    category: "solution" as const
},
{
    id: "17",
    username: "@ai_lab_junior",
    trustLevel: "gold" as const,
    timeAgo: "15h ago",
    content: "Our AI Lab prof assigned a research survey on RAG systems. Any seniors have tips on writing a good academic survey?",
    upvotes: 71,
    downvotes: 0,
    comments: 29,
    category: "discussion" as const
},
{
    id: "18",
    username: "@thirdyear_bugfinder",
    trustLevel: "silver" as const,
    timeAgo: "20h ago",
    content: "Found a SQL injection vulnerability in my college club website while helping them upgrade it fixed it though!",
    upvotes: 94,
    downvotes: 3,
    comments: 31,
    category: "solution" as const
},
{
    id: "19",
    username: "@hackathon_hero",
    trustLevel: "gold" as const,
    timeAgo: "22h ago",
    content: "Just finished a 24hr hackathon! Built a mental health chatbot with peers using Node.js + Gemini API. Slept 2 hours ",
    upvotes: 213,
    downvotes: 5,
    comments: 67,
    category: "discussion" as const
},
{
    id: "20",
    username: "@internship_hopeful",
    trustLevel: "bronze" as const,
    timeAgo: "1d ago",
    content: "Applied for my first internship through LinkedIn. How long do companies usually take to respond?",
    upvotes: 47,
    downvotes: 0,
    comments: 18,
    category: "job" as const
},
{
    id: "21",
    username: "@mini_project_master",
    trustLevel: "silver" as const,
    timeAgo: "1d ago",
    content: "Completed my DBMS mini project: Hostel Mess Management System. Implemented triggers + procedures. Feeling proud!",
    upvotes: 84,
    downvotes: 1,
    comments: 22,
    category: "solution" as const
},
{
    id: "22",
    username: "@research_firsttimer",
    trustLevel: "gold" as const,
    timeAgo: "1d ago",
    content: "Started working under my professor on an NLP-based summarizer. First research experience for me!",
    upvotes: 126,
    downvotes: 3,
    comments: 41,
    category: "discussion" as const
},
{
    id: "23",
    username: "@os_exam_crammer",
    trustLevel: "bronze" as const,
    timeAgo: "2d ago",
    content: "OS internals exam in 2 days. Still don't fully get deadlocks any seniors please explain like I'm 5?",
    upvotes: 53,
    downvotes: 0,
    comments: 37,
    category: "discussion" as const
},
{
    id: "24",
    username: "@coding_club_lead",
    trustLevel: "silver" as const,
    timeAgo: "2d ago",
    content: "Organized our college coding contest! 450 participants. Thinking of making a campus leaderboard next.",
    upvotes: 140,
    downvotes: 2,
    comments: 52,
    category: "discussion" as const
},
{
    id: "25",
    username: "@firstyear_python",
    trustLevel: "bronze" as const,
    timeAgo: "2d ago",
    content: "My first semester Python assignment: BMI calculator. Pretty basic, but I finally get functions!",
    upvotes: 34,
    downvotes: 0,
    comments: 11,
    category: "solution" as const
},
{
    id: "26",
    username: "@senior_mentor",
    trustLevel: "gold" as const,
    timeAgo: "3d ago",
    content: "Seniors: what’s a good final-year project idea that mixes AI + healthcare but isn’t too overdone?",
    upvotes: 168,
    downvotes: 4,
    comments: 63,
    category: "discussion" as const
},
{
    id: "27",
    username: "@mern_stack_student",
    trustLevel: "silver" as const,
    timeAgo: "3d ago",
    content: "Built a campus marketplace using MERN for buying/selling second-hand books. Thinking of deploying on Vercel.",
    upvotes: 115,
    downvotes: 1,
    comments: 28,
    category: "solution" as const
},
{
    id: "28",
    username: "@stress_coder",
    trustLevel: "bronze" as const,
    timeAgo: "3d ago",
    content: "Balancing academics + coding club + LeetCode is killing me. How do you seniors manage everything??",
    upvotes: 75,
    downvotes: 0,
    comments: 42,
    category: "discussion" as const
},
{
    id: "29",
    username: "@android_app_fresher",
    trustLevel: "silver" as const,
    timeAgo: "4d ago",
    content: "Made my first Android app using Kotlin for Mobile Programming Lab. Just a to-do app but super happy!",
    upvotes: 97,
    downvotes: 1,
    comments: 19,
    category: "solution" as const
},
{
    id: "30",
    username: "@finalyear_resume",
    trustLevel: "gold" as const,
    timeAgo: "4d ago",
    content: "Revamping my resume for campus placements. Anyone got suggestions for good college project descriptions?",
    upvotes: 132,
    downvotes: 2,
    comments: 51,
    category: "job" as const
},
{
    id: "31",
    username: "@coding_lab_champion",
    trustLevel: "silver" as const,
    timeAgo: "4d ago",
    content: "Completed DSA Lab assignment: implemented AVL trees + performance comparison. Surprisingly fun!",
    upvotes: 118,
    downvotes: 1,
    comments: 24,
    category: "solution" as const
},
{
    id: "32",
    username: "@iot_finalyear",
    trustLevel: "gold" as const,
    timeAgo: "5d ago",
    content: "For my final-year project, building a smart parking system using Arduino + RFID. Any tips on cloud integration?",
    upvotes: 152,
    downvotes: 3,
    comments: 47,
    category: "discussion" as const
},
{
    id: "33",
    username: "@webdesign_fresher",
    trustLevel: "bronze" as const,
    timeAgo: "5d ago",
    content: "Created my first portfolio website for assignment. My UI looks like 2012 but it's okay 😭",
    upvotes: 42,
    downvotes: 0,
    comments: 13,
    category: "solution" as const
},
{
    id: "34",
    username: "@cse_sleepless",
    trustLevel: "silver" as const,
    timeAgo: "5d ago",
    content: "Pulled an all-nighter to complete CN Lab manual. Why is Wireshark analysis SO LONG 😩",
    upvotes: 89,
    downvotes: 2,
    comments: 25,
    category: "discussion" as const
},
{
    id: "35",
    username: "@hack_club_rookie",
    trustLevel: "bronze" as const,
    timeAgo: "6d ago",
    content: "Joined my college hack club today! Excited to learn Git and contribute to student projects.",
    upvotes: 61,
    downvotes: 0,
    comments: 14,
    category: "discussion" as const
},
{
    id: "36",
    username: "@py_ml_secondyear",
    trustLevel: "silver" as const,
    timeAgo: "6d ago",
    content: "Built a basic spam classifier for my ML assignment using Naive Bayes. Works better than I expected!",
    upvotes: 107,
    downvotes: 2,
    comments: 27,
    category: "solution" as const
},
{
    id: "37",
    username: "@club_treasurer",
    trustLevel: "gold" as const,
    timeAgo: "6d ago",
    content: "Managing finances for tech club events is tougher than any coding assignment 😭",
    upvotes: 94,
    downvotes: 1,
    comments: 21,
    category: "discussion" as const
},
{
    id: "38",
    username: "@thirdyear_placement",
    trustLevel: "silver" as const,
    timeAgo: "1w ago",
    content: "Started solving LeetCode daily for placements. Currently at 30 problems. Goal: 200 before 7th sem!",
    upvotes: 146,
    downvotes: 1,
    comments: 38,
    category: "discussion" as const
},
{
    id: "39",
    username: "@campus_dev",
    trustLevel: "gold" as const,
    timeAgo: "1w ago",
    content: "Built a campus lost-and-found app as a group project. Deployed it on Firebase, and seniors actually used it 😂",
    upvotes: 168,
    downvotes: 2,
    comments: 36,
    category: "solution" as const
},
{
    id: "40",
    username: "@gdsclub_intern",
    trustLevel: "silver" as const,
    timeAgo: "1w ago",
    content: "Completed my Android Study Jam course. Next goal: Build a full feature app before semester ends!",
    upvotes: 74,
    downvotes: 0,
    comments: 18,
    category: "solution" as const
},
{
    id: "41",
    username: "@hostel_wifi",
    trustLevel: "bronze" as const,
    timeAgo: "1w ago",
    content: "Hostel WiFi died again while I was in a Zoom viva. SEND HELP 😭😭",
    upvotes: 201,
    downvotes: 3,
    comments: 49,
    category: "discussion" as const
},
{
    id: "42",
    username: "@fullstack_finalyear",
    trustLevel: "gold" as const,
    timeAgo: "1w ago",
    content: "Final-year project: Attendance System with face recognition using Python. Need help improving accuracy!",
    upvotes: 142,
    downvotes: 2,
    comments: 40,
    category: "discussion" as const
},
{
    id: "43",
    username: "@late_submitter",
    trustLevel: "silver" as const,
    timeAgo: "8d ago",
    content: "Submitted my OS Lab journal 30 minutes before deadline. My heart rate is still high ",
    upvotes: 96,
    downvotes: 0,
    comments: 19,
    category: "discussion" as const
},
{
    id: "44",
    username: "@coding_senior",
    trustLevel: "gold" as const,
    timeAgo: "8d ago",
    content: "Helped juniors debug their React assignments today. Feeling like a TA ",
    upvotes: 122,
    downvotes: 1,
    comments: 27,
    category: "discussion" as const
},
{
    id: "45",
    username: "@lab_partner",
    trustLevel: "bronze" as const,
    timeAgo: "8d ago",
    content: "My lab partner didn't show up again 😒 had to complete the entire experiment solo.",
    upvotes: 58,
    downvotes: 0,
    comments: 22,
    category: "discussion" as const
},
{
    id: "46",
    username: "@campus_freelancer",
    trustLevel: "silver" as const,
    timeAgo: "9d ago",
    content: "Just finished my first freelance website for a local store near campus. Earned my first ₹3000!",
    upvotes: 132,
    downvotes: 2,
    comments: 33,
    category: "job" as const
},
{
    id: "47",
    username: "@arduino_firstyear",
    trustLevel: "bronze" as const,
    timeAgo: "9d ago",
    content: "Made an automatic dustbin with Arduino for my first semester project. My friends loved it!",
    upvotes: 64,
    downvotes: 1,
    comments: 16,
    category: "solution" as const
},
{
    id: "48",
    username: "@exam_survivor",
    trustLevel: "silver" as const,
    timeAgo: "10d ago",
    content: "End-sem exams next week and I havent touched a single unit. Praying for internal marks now 🙏",
    upvotes: 147,
    downvotes: 1,
    comments: 56,
    category: "discussion" as const
},
{
    id: "49",
    username: "@deep_learning_senior",
    trustLevel: "gold" as const,
    timeAgo: "10d ago",
    content: "Our ML Club just trained a CNN to classify cafeteria food items. Accuracy = 82% 😆",
    upvotes: 189,
    downvotes: 3,
    comments: 44,
    category: "solution" as const
},
{
    id: "50",
    username: "@thirdyear_resume",
    trustLevel: "silver" as const,
    timeAgo: "10d ago",
    content: "What's the best way to describe college projects on resume? Should I include tech stack for each?",
    upvotes: 83,
    downvotes: 0,
    comments: 18,
    category: "job" as const
},
{
    id: "51",
    username: "@mini_project_crisis",
    trustLevel: "bronze" as const,
    timeAgo: "11d ago",
    content: "Mini project deadline extended by 1 week. I have been given a second life 😭",
    upvotes: 102,
    downvotes: 1,
    comments: 33,
    category: "discussion" as const
},
{
    id: "52",
    username: "@campus_data_analyst",
    trustLevel: "silver" as const,
    timeAgo: "11d ago",
    content: "Analyzed placement data from last 5 years for our club. Visualizing trends using Python + Matplotlib.",
    upvotes: 117,
    downvotes: 2,
    comments: 26,
    category: "solution" as const
},
{
    id: "53",
    username: "@secondyear_android",
    trustLevel: "silver" as const,
    timeAgo: "12d ago",
    content: "Made a notes-taking app in Android Studio with SQLite storage for my lab. Feeling like a mobile dev!",
    upvotes: 96,
    downvotes: 1,
    comments: 22,
    category: "solution" as const
},
{
    id: "54",
    username: "@firstintern_offer",
    trustLevel: "gold" as const,
    timeAgo: "12d ago",
    content: "Got my first internship offer from a startup! Its unpaid but the experience will be worth it!",
    upvotes: 136,
    downvotes: 6,
    comments: 39,
    category: "job" as const
},
{
    id: "55",
    username: "@finalyear_overflow",
    trustLevel: "silver" as const,
    timeAgo: "13d ago",
    content: "Stuck in a segmentation fault for 3 hours during systems lab. Turns out I forgot a single & sign 💀",
    upvotes: 121,
    downvotes: 0,
    comments: 28,
    category: "discussion" as const
},
{
    id: "56",
    username: "@campus_networking",
    trustLevel: "bronze" as const,
    timeAgo: "13d ago",
    content: "Do companies coming for internship expect DSA knowledge? Or just basic coding?",
    upvotes: 66,
    downvotes: 0,
    comments: 24,
    category: "job" as const
},
{
    id: "57",
    username: "@lab_group_lead",
    trustLevel: "silver" as const,
    timeAgo: "14d ago",
    content: "Led my group to build a Weather Forecast Web App using API integration for Web Tech lab. Demo went amazing!",
    upvotes: 110,
    downvotes: 2,
    comments: 21,
    category: "solution" as const
},
{
    id: "58",
    username: "@event_photographer",
    trustLevel: "bronze" as const,
    timeAgo: "14d ago",
    content: "Covered our college tech fest as the official photographer. Now editing 700+ pics 😭",
    upvotes: 91,
    downvotes: 0,
    comments: 18,
    category: "discussion" as const
},
{
    id: "59",
    username: "@hostel_maker",
    trustLevel: "silver" as const,
    timeAgo: "15d ago",
    content: "Built a smart room automation system using ESP32 + sensors for project expo. Judges seemed impressed!",
    upvotes: 128,
    downvotes: 2,
    comments: 34,
    category: "solution" as const
},
{
    id: "60",
    username: "@fourthyear_diaries",
    trustLevel: "gold" as const,
    timeAgo: "15d ago",
    content: "Final semester starting... can't believe college is almost over. Cherishing the last months 🥺",
    upvotes: 203,
    downvotes: 1,
    comments: 56,
    category: "discussion" as const
}

];

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    setPosts([...initialMockPosts, ...storedPosts]);
  }, []);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === "all" ? "all posts" : filter} posts`,
    });
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "queries") return post.category === "query";
    if (activeFilter === "solutions") return post.category === "solution";
    if (activeFilter === "jobs") return post.category === "job";
    if (activeFilter === "discussions") return post.category === "discussion";
    return true;
  });

  return (
    <>
      <SEO structuredData={generateWebSiteSchema()} />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
          <h1 className="text-xl font-bold text-foreground md:hidden">Camply</h1>
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => toast({ title: "Filter", description: "Filter options opened!" })}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts, users, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
          />
        </div>
      </div>

      {/* Filter Tabs - Desktop */}
      <div className="hidden md:flex items-center gap-2 px-4">
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("all")}
        >
          All
        </Button>
        <Button 
          variant={activeFilter === "queries" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("queries")}
        >
          Queries
        </Button>
        <Button 
          variant={activeFilter === "solutions" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("solutions")}
        >
          Solutions
        </Button>
        <Button 
          variant={activeFilter === "jobs" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("jobs")}
        >
          Jobs
        </Button>
        <Button 
          variant={activeFilter === "discussions" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("discussions")}
        >
          Discussions
        </Button>
      </div>

      {/* Posts */}
      <div className="space-y-4 px-4 pb-20 md:pb-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
      </div>
    </>
  );
}