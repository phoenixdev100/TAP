import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, BookOpen, Award, Save, X, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    year: string;
    major: string;
    gpa: string;
}

interface ProfileResponse {
    success: boolean;
    message?: string;
    profile?: ProfileData;
}

const defaultProfileData: ProfileData = {
    firstName: "John",
    lastName: "Doe",
    email: "student@example.com",
    phone: "+1 234 567 8900",
    bio: "Computer Science student passionate about technology and innovation.",
    year: "3rd Year",
    major: "Computer Science",
    gpa: "3.8"
};

const Profile = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileData>(defaultProfileData);
    const [originalData, setOriginalData] = useState<ProfileData>(defaultProfileData);

    useEffect(() => {
        // Load profile data from localStorage on component mount
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            try {
                const parsedData = JSON.parse(storedProfile);
                setFormData(parsedData);
                setOriginalData(parsedData);
            } catch (error) {
                console.error('Error parsing profile data:', error);
            }
        } else {
            // If no data in localStorage, use default and save it
            localStorage.setItem('userProfile', JSON.stringify(defaultProfileData));
            setFormData(defaultProfileData);
            setOriginalData(defaultProfileData);
        }
    }, []);

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Try to save to API first
            const response = await api.put<ProfileResponse>('/api/users/profile', formData);
            if (response.data && response.data.success) {
                setIsEditing(false);
                setOriginalData(formData);
                localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`);
                localStorage.setItem('userProfile', JSON.stringify(formData));
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been successfully updated.",
                });
            } else {
                throw new Error(response.data?.message || 'Failed to update profile');
            }
        } catch (error: any) {
            console.error('Error updating profile via API:', error);
            // Fallback to localStorage if API fails
            setIsEditing(false);
            localStorage.setItem('userProfile', JSON.stringify(formData));
            localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`);
            setOriginalData(formData);
            toast({
                title: "Profile Updated",
                description: "Your profile has been saved locally.",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
    };

    return (
        <div className="w-full p-4 sm:p-6 md:p-8 lg:px-12 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Profile
                    </h1>
                    <p className="text-muted-foreground dark:text-gray-400 mt-2 text-lg">
                        Manage your personal information and academic details
                    </p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-lg transition-all duration-300 rounded-2xl flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors rounded-2xl flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="border-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors rounded-2xl flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </motion.div>

            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted dark:bg-slate-800 rounded-2xl p-1">
                    <TabsTrigger value="personal" className="rounded-xl">Personal Info</TabsTrigger>
                    <TabsTrigger value="academic" className="rounded-xl">Academic</TabsTrigger>
                    <TabsTrigger value="achievements" className="rounded-xl">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Manage your personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                                        <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-purple-600 text-white">
                                            {formData.firstName[0]}{formData.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</h3>
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">Student</p>
                                    </div>
                                </div>

                                <Separator className="dark:bg-slate-700" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        className="w-full min-h-[100px] p-3 border-2 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white"
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Academic Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Your academic details and performance
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Academic Year</Label>
                                        <Input
                                            id="year"
                                            value={formData.year}
                                            onChange={(e) => handleInputChange("year", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="major">Major</Label>
                                        <Input
                                            id="major"
                                            value={formData.major}
                                            onChange={(e) => handleInputChange("major", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gpa">GPA</Label>
                                        <Input
                                            id="gpa"
                                            value={formData.gpa}
                                            onChange={(e) => handleInputChange("gpa", e.target.value)}
                                            disabled={!isEditing}
                                            className="border-2 focus:ring-2 focus:ring-purple-500 dark:bg-slate-700/50 dark:border-slate-600 rounded-2xl"
                                        />
                                    </div>
                                </div>

                                <Separator className="dark:bg-slate-700" />

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Current Courses</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="rounded-full dark:bg-slate-700 dark:text-gray-200">Data Structures</Badge>
                                        <Badge variant="secondary" className="rounded-full dark:bg-slate-700 dark:text-gray-200">Algorithm Design</Badge>
                                        <Badge variant="secondary" className="rounded-full dark:bg-slate-700 dark:text-gray-200">Database Systems</Badge>
                                        <Badge variant="secondary" className="rounded-full dark:bg-slate-700 dark:text-gray-200">Software Engineering</Badge>
                                        <Badge variant="secondary" className="rounded-full dark:bg-slate-700 dark:text-gray-200">Computer Networks</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 dark:border-slate-700 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Achievements & Activities
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Your accomplishments and extracurricular activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Academic Achievements</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 border-2 rounded-xl dark:border-slate-600 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/30">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-8 w-8 text-yellow-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Dean's List</p>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">Fall 2023, Spring 2024</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border-2 rounded-xl dark:border-slate-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-900/30">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Hackathon Winner</p>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">Annual Tech Challenge 2024</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="dark:bg-slate-700" />

                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Extracurricular Activities</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 border-2 rounded-xl dark:border-slate-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-900/30">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Computer Science Club</p>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400">Member • 2022 - Present</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border-2 rounded-xl dark:border-slate-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/30">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Peer Tutoring Program</p>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400">Tutor • 2023 - Present</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border-2 rounded-xl dark:border-slate-600 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-900/30">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Student Government</p>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400">Class Representative • 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;
