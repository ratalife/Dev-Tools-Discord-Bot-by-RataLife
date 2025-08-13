import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bot, Shield, Code, Image, FileText, Users } from "lucide-react";

interface BotStatus {
  status: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  userId: string;
  username: string;
  channelId: string;
  guildId: string;
  type: string;
  status: string;
  createdAt: string;
}

export function Home() {
  const { data: botStatus, isLoading: statusLoading } = useQuery<BotStatus>({
    queryKey: ['/api/bot/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const inviteLink = "https://discord.com/api/oauth2/authorize?client_id=1405056608928665703&permissions=8&scope=bot%20applications.commands";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Bot className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">DevTools Discord Bot</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A powerful Discord bot that provides development tools for AOB/Byte conversion, 
            image processing, font conversion, and source code analysis through private ticket channels.
          </p>
        </div>

        {/* Bot Status and Invite */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Bot Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant={botStatus?.status === 'active' ? 'default' : 'secondary'}
                  className={botStatus?.status === 'active' ? 'bg-green-500' : ''}
                >
                  {statusLoading ? 'Checking...' : (botStatus?.status || 'Offline')}
                </Badge>
                {botStatus?.timestamp && (
                  <span className="text-sm text-gray-500">
                    Last check: {new Date(botStatus.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Add to Discord
              </CardTitle>
              <CardDescription>
                Invite the bot to your Discord server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={inviteLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Invite Bot
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Tools</CardTitle>
            <CardDescription>
              Use <code>/devtools</code> command in Discord to access these features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                <Code className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">AOB ↔ Byte Conversion</h3>
                  <p className="text-sm text-gray-600">Convert between AOB and Byte formats</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
                <Image className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Image to Byte Array</h3>
                  <p className="text-sm text-gray-600">Convert images to byte arrays</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50">
                <FileText className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Font to Byte Array</h3>
                  <p className="text-sm text-gray-600">Convert fonts to byte arrays</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                <FileText className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Source Code Processing</h3>
                  <p className="text-sm text-gray-600">Extract offsets from C# files</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Tickets
            </CardTitle>
            <CardDescription>
              Currently active support tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading tickets...</div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{ticket.username}</div>
                      <div className="text-sm text-gray-600 capitalize">{ticket.type.replace('_', ' ')}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{ticket.status}</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No active tickets</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold">Invite the Bot</h3>
                  <p className="text-gray-600">Click the "Invite Bot" button above and add it to your Discord server</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold">Use the Command</h3>
                  <p className="text-gray-600">Type <code>/devtools</code> in any channel to start</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold">Get Your Private Channel</h3>
                  <p className="text-gray-600">The bot will create a private ticket channel just for you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold">Select Your Tool</h3>
                  <p className="text-gray-600">Choose from the menu what you need help with and follow the instructions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Dev by RataLife • DevTools Discord Bot v1.0</p>
        </div>
      </div>
    </div>
  );
}