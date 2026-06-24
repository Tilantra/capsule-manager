import { useState, useEffect, useMemo } from "react";
import { BrowserGuideraClient } from "@/lib/guidera-browser-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Plus, UserPlus, UserMinus, Crown, Shield, Layers } from "lucide-react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Team {
    team_id: string;
    name: string;
    description?: string;
    color_tag?: string;
    members?: string[]; // Array of strings (emails)
    admin_email: string;
    created_at?: string;
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamDescription, setNewTeamDescription] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newTeamColor, setNewTeamColor] = useState("#3b82f6");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [teamCapsuleCounts, setTeamCapsuleCounts] = useState<Record<string, number>>({});

    const client = useMemo(() => new BrowserGuideraClient(), []);

    const fetchTeamsAndUser = async () => {
        setLoading(true);
        try {
            // Get current user info
            const user = await client.getSingleUser();
            setCurrentUser(user);

            // Fetch all teams the user belongs to directly
            const fetchedTeams = await client.getCurrentUserTeams();

            // Get capsule counts for each team
            for (const team of fetchedTeams) {
                try {
                    const capsulesResponse = await client.getTeamCapsules(team.team_id, 1000, 0);
                    const uniqueCapsuleIds = new Set(capsulesResponse.results.map((c: any) => c.capsule_id));
                    setTeamCapsuleCounts(prev => ({ ...prev, [team.team_id]: uniqueCapsuleIds.size }));
                } catch (error) {
                    console.error(`Failed to fetch count for team ${team.team_id}:`, error);
                }
            }

            setTeams(fetchedTeams);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamsAndUser();
    }, []);

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) {
            toast.error("Team name is required");
            return;
        }

        try {
            await client.createTeam(newTeamName, newTeamDescription || "", newTeamColor);
            toast.success("Team created successfully");
            setCreateDialogOpen(false);
            setNewTeamName("");
            setNewTeamDescription("");
            fetchTeamsAndUser();
        } catch (error) {
            console.error("Failed to create team:", error);
            toast.error("Failed to create team");
        }
    };

    const handleAddMember = async () => {
        if (!selectedTeam || !newMemberEmail.trim()) {
            toast.error("Email is required");
            return;
        }

        try {
            await client.addTeamMember(selectedTeam.team_id, newMemberEmail);
            toast.success("Member added successfully");
            setNewMemberEmail("");

            // Refresh team details
            const updatedTeam = await client.getTeamDetails(selectedTeam.team_id);
            setSelectedTeam(updatedTeam);
            fetchTeamsAndUser();
        } catch (error) {
            console.error("Failed to add member:", error);
            toast.error("Failed to add member");
        }
    };

    const handleRemoveMember = async (email: string) => {
        if (!selectedTeam) return;

        if (!confirm(`Remove ${email} from the team?`)) return;

        try {
            await client.removeTeamMember(selectedTeam.team_id, email);
            toast.success("Member removed successfully");

            // Refresh team details
            const updatedTeam = await client.getTeamDetails(selectedTeam.team_id);
            setSelectedTeam(updatedTeam);
            fetchTeamsAndUser();
        } catch (error) {
            console.error("Failed to remove member:", error);
            toast.error("Failed to remove member");
        }
    };

    const openManageMembers = async (team: Team) => {
        try {
            // Fetch latest team details to get members
            const teamDetails = await client.getTeamDetails(team.team_id);
            setSelectedTeam(teamDetails);
            setManageMembersDialogOpen(true);
        } catch (error) {
            console.error("Failed to load team details:", error);
            toast.error("Failed to load team details");
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "owner":
                return <Crown className="h-3.5 w-3.5" />;
            case "admin":
                return <Shield className="h-3.5 w-3.5" />;
            default:
                return <Users className="h-3.5 w-3.5" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "owner":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
            case "admin":
                return "bg-blue-500/10 text-blue-600 border-blue-500/30";
            default:
                return "bg-gray-500/10 text-gray-600 border-gray-500/30";
        }
    };

    const getUserRole = (team: Team): "owner" | "admin" | "member" => {
        if (!currentUser || !currentUser.email || !team.admin_email) return "member";
        if (currentUser.email.toLowerCase() === team.admin_email.toLowerCase()) return "admin";
        return "member";
    };

    const canManageMembers = (team: Team): boolean => {
        return getUserRole(team) === "admin";
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Teams
                    </h1>
                    <p className="text-muted-foreground mt-1">Collaborate with your team members.</p>
                </div>
                {currentUser?.tier && (currentUser.tier.toLowerCase() === "elite" || currentUser.tier.toLowerCase() === "enterprise") && (
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Team
                    </Button>
                )}
            </div>


            {/* Teams List */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-dashed border-muted-foreground/30">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Users className="h-10 w-10 text-primary opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold">No teams yet</h3>
                    <p className="text-muted-foreground mt-1 text-sm">Create your first team to start collaborating.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team, index) => {
                        const userRole = getUserRole(team);
                        const capsuleCount = teamCapsuleCounts[team.team_id] || 0;
                        const teamColor = team.color_tag || '#3b82f6';
                        const memberPreview = (team.members || []).slice(0, 4);
                        const overflow = Math.max(0, (team.members?.length || 0) - 4);

                        return (
                            <motion.div
                                key={team.team_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            >
                                <Card className="group relative flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card to-card/50 cursor-default">
                                    {/* Left accent bar using team color */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: teamColor }}
                                    />

                                    {/* Subtle gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-purple-500/3 transition-all duration-500" />

                                    <CardHeader className="pb-2 pl-7 relative z-10">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                                        style={{ background: teamColor }}
                                                    />
                                                    <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                                                        {team.name || 'Unnamed Team'}
                                                    </CardTitle>
                                                </div>
                                                <Badge variant="secondary" className={`text-[11px] gap-1 ${getRoleBadgeColor(userRole)}`}>
                                                    {getRoleIcon(userRole)}
                                                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col gap-4 pl-7 relative z-10">
                                        {/* Description */}
                                        <div className="min-h-[2rem]">
                                            {team.description ? (
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{team.description}</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground/30 italic">No description</p>
                                            )}
                                        </div>

                                        {/* Member avatar row */}
                                        {memberPreview.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {memberPreview.map((email, i) => (
                                                        <div
                                                            key={i}
                                                            title={email}
                                                            className="h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold uppercase"
                                                            style={{ background: `${teamColor}30`, color: teamColor, zIndex: memberPreview.length - i }}
                                                        >
                                                            {email.substring(0, 2)}
                                                        </div>
                                                    ))}
                                                    {overflow > 0 && (
                                                        <div className="h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                                            +{overflow}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* Stats row */}
                                        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Layers className="h-3.5 w-3.5" />
                                                <span>{capsuleCount} capsule{capsuleCount !== 1 ? 's' : ''}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-3 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-semibold transition-colors"
                                                onClick={() => openManageMembers(team)}
                                            >
                                                {userRole === 'admin' ? 'Manage' : 'View'} →
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create Team Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>Create a team to collaborate with others.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input
                                id="team-name"
                                placeholder="Engineering Team"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team-description">Description (Optional)</Label>
                            <Input
                                id="team-description"
                                placeholder="Team workspace for collaboration"
                                value={newTeamDescription}
                                onChange={(e) => setNewTeamDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Team Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "#3b82f6", // Blue
                                    "#22c55e", // Green
                                    "#a855f7", // Purple
                                    "#f97316", // Orange
                                    "#ef4444", // Red
                                    "#14b8a6", // Teal
                                    "#ec4899", // Pink
                                    "#eab308", // Yellow
                                ].map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full transition-all border-2 ${newTeamColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewTeamColor(color)}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTeam}>Create Team</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Members Dialog */}
            <Dialog open={manageMembersDialogOpen} onOpenChange={setManageMembersDialogOpen}>
                <DialogContent className="sm:max-w-2xl w-[calc(100vw-2rem)]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {selectedTeam?.name} - Members
                        </DialogTitle>
                        <DialogDescription>
                            View and manage team members
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-4">
                            {/* Add Member Section */}
                             {selectedTeam && canManageMembers(selectedTeam) && (
                                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                                    <Label className="text-sm font-semibold">Add New Member</Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            placeholder="member@example.com"
                                            value={newMemberEmail}
                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleAddMember} className="gap-2 w-full sm:w-auto shrink-0 justify-center">
                                            <UserPlus className="h-4 w-4" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Members List */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Team Members ({selectedTeam?.members?.length || 0})</Label>
                                <div className="space-y-2">
                                    {selectedTeam?.members?.map((memberEmail) => {
                                        const isAdmin = memberEmail && selectedTeam.admin_email && memberEmail.toLowerCase() === selectedTeam.admin_email.toLowerCase();
                                        const roleLabel = isAdmin ? "admin" : "member";

                                        return (
                                            <div
                                                key={memberEmail}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                                                    <Avatar className="h-9 w-9 shrink-0">
                                                        <AvatarFallback className="text-xs font-semibold">
                                                            {memberEmail.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate" title={memberEmail}>{memberEmail}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                                                    <Badge variant="secondary" className={`text-xs gap-1 ${getRoleBadgeColor(roleLabel)}`}>
                                                        {getRoleIcon(roleLabel)}
                                                        {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}
                                                    </Badge>
                                                    {selectedTeam && canManageMembers(selectedTeam) && !isAdmin && memberEmail.toLowerCase() !== currentUser?.email?.toLowerCase() && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemoveMember(memberEmail)}
                                                        >
                                                            <UserMinus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setManageMembersDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
