import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Users, Hash, Send, Smile, Paperclip, MoreVertical } from "lucide-react";

const communities = [
  { 
    id: 1, 
    name: "CS Students", 
    members: 1240, 
    online: 89, 
    description: "Computer Science community",
    channels: ["general", "programming", "projects", "help"],
    color: "bg-blue-500"
  },
  { 
    id: 2, 
    name: "Design Hub", 
    members: 856, 
    online: 34, 
    description: "UI/UX and Design enthusiasts",
    channels: ["showcase", "feedback", "resources", "jobs"],
    color: "bg-purple-500"
  },
  { 
    id: 3, 
    name: "Startup Founders", 
    members: 623, 
    online: 67, 
    description: "Entrepreneurship and startup discussions",
    channels: ["ideas", "funding", "networking", "success-stories"],
    color: "bg-green-500"
  },
  { 
    id: 4, 
    name: "Data Science", 
    members: 945, 
    online: 56, 
    description: "ML, AI, and Data Analytics",
    channels: ["datasets", "models", "tutorials", "news"],
    color: "bg-orange-500"
  }
];

const mockMessages = [
  { 
    id: 1, 
    user: "Alex Chen", 
    avatar: "AC", 
    message: "Hey everyone! Just deployed my React portfolio website 🚀", 
    time: "2m ago",
    reactions: ["👍", "🚀", "❤️"]
  },
  { 
    id: 2, 
    user: "Sarah Kumar", 
    avatar: "SK", 
    message: "Looking for teammates for the upcoming hackathon. Anyone interested in working on an AI project?", 
    time: "5m ago",
    reactions: ["🤝", "🔥"]
  },
  { 
    id: 3, 
    user: "Mike Torres", 
    avatar: "MT", 
    message: "Check out this amazing design inspiration I found!", 
    time: "12m ago",
    reactions: ["😍", "💡"]
  },
  { 
    id: 4, 
    user: "Emma Wilson", 
    avatar: "EW", 
    message: "Does anyone have experience with TensorFlow? Need some help with model optimization.", 
    time: "18m ago",
    reactions: ["🤔", "👋"]
  }
];

export function CommunityChats() {
  const [selectedCommunity, setSelectedCommunity] = useState(communities[0]);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Communities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((community) => (
          <Card 
            key={community.id} 
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-medium border-2 ${
              selectedCommunity.id === community.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedCommunity(community)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 ${community.color} rounded-lg flex items-center justify-center`}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{community.name}</h3>
                <p className="text-sm text-muted-foreground">{community.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{community.members} members</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{community.online} online</span>
                </div>
              </div>
              <Button size="sm" variant={selectedCommunity.id === community.id ? "default" : "outline"}>
                {selectedCommunity.id === community.id ? "Active" : "Join Chat"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Chat Interface */}
      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${selectedCommunity.color} rounded-lg flex items-center justify-center`}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedCommunity.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCommunity.online} members online</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-96">
          {/* Channels Sidebar */}
          <div className="w-64 border-r bg-muted/20">
            <div className="p-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">CHANNELS</h4>
              <div className="space-y-1">
                {selectedCommunity.channels.map((channel) => (
                  <Button
                    key={channel}
                    variant={selectedChannel === channel ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 h-8"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Hash className="h-3 w-3" />
                    <span className="text-sm">{channel}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 group hover:bg-muted/20 p-2 rounded-lg transition-all duration-200">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {msg.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{msg.message}</p>
                      <div className="flex items-center gap-1">
                        {msg.reactions.map((reaction, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-accent/20"
                          >
                            {reaction}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Smile className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border-2 focus-within:border-primary transition-all duration-300">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message #${selectedChannel}`}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}