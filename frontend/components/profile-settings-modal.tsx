"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { X, Info, Globe, User, Lock } from "lucide-react";

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) return null;

  const firstLetter = displayName.charAt(0).toUpperCase() || "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>My profile</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-1 border-b md:border-r md:border-b-0 pb-4 md:pb-0">
            <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-accent text-accent-foreground">
              General
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground/70 hover:bg-accent/50">
              Email preferences
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground/70 hover:bg-accent/50">
              Active sessions
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            <Accordion type="single" collapsible defaultValue="profile-info">
              {/* Profile Info */}
              <AccordionItem value="profile-info">
                <AccordionTrigger className="hover:no-underline flex items-center gap-3">
                  <Info className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">Profile info</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-foreground/70">
                    Change your login email and edit your displayed name.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Display name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Language */}
              <AccordionItem value="language">
                <AccordionTrigger className="hover:no-underline flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">Language</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-foreground/70">
                    Change the language for Host mode.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred language</Label>
                    <select
                      id="language"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                      <option>English</option>
                      <option>Español</option>
                      <option>Français</option>
                      <option>Deutsch</option>
                    </select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Customize Avatar */}
              <AccordionItem value="avatar">
                <AccordionTrigger className="hover:no-underline flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">Customize your avatar</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-foreground/70">
                    Brighten up your profile with a Slido Dotty.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {firstLetter}
                    </div>
                    <Button variant="outline">Choose Dotty</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Privacy */}
              <AccordionItem value="privacy">
                <AccordionTrigger className="hover:no-underline flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">Privacy preferences</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-foreground/70">
                    Please choose what cookies can be used by Slido.
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Necessary cookies</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Analytics cookies</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Marketing cookies</span>
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Change Password */}
              <AccordionItem value="password">
                <AccordionTrigger className="hover:no-underline flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">Change password</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <p className="text-sm text-foreground/70">
                    You are logged in with single sign-on account. Your password can't be changed through your Slido account.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Save changes</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
