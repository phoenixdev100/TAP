import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, BookOpen, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

    const handleSave = () => {
        setIsEditing(false);
        localStorage.setItem('userProfile', JSON.stringify(formData));
        localStorage.setItem("userName", `${formData.firstName} ${formData.lastName}`);
        setOriginalData(formData);
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Profile</h1>
            </div>

            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Manage your personal details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                                    <AvatarFallback className="text-lg">
                                        {formData.firstName[0]}{formData.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-medium">{formData.firstName} {formData.lastName}</h3>
                                    <p className="text-sm text-muted-foreground">Student</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        disabled={!isEditing}
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
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Academic Information
                            </CardTitle>
                            <CardDescription>
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
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="major">Major</Label>
                                    <Input
                                        id="major"
                                        value={formData.major}
                                        onChange={(e) => handleInputChange("major", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gpa">GPA</Label>
                                    <Input
                                        id="gpa"
                                        value={formData.gpa}
                                        onChange={(e) => handleInputChange("gpa", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="font-medium">Current Courses</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary">Data Structures</Badge>
                                    <Badge variant="secondary">Algorithm Design</Badge>
                                    <Badge variant="secondary">Database Systems</Badge>
                                    <Badge variant="secondary">Software Engineering</Badge>
                                    <Badge variant="secondary">Computer Networks</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Achievements & Activities
                            </CardTitle>
                            <CardDescription>
                                Your accomplishments and extracurricular activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Academic Achievements</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Award className="h-8 w-8 text-yellow-500" />
                                            <div>
                                                <p className="font-medium">Dean's List</p>
                                                <p className="text-sm text-muted-foreground">Fall 2023, Spring 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Award className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <p className="font-medium">Hackathon Winner</p>
                                                <p className="text-sm text-muted-foreground">Annual Tech Challenge 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Extracurricular Activities</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Computer Science Club</p>
                                            <p className="text-sm text-muted-foreground">Member • 2022 - Present</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Peer Tutoring Program</p>
                                            <p className="text-sm text-muted-foreground">Tutor • 2023 - Present</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Student Government</p>
                                            <p className="text-sm text-muted-foreground">Class Representative • 2024</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;
