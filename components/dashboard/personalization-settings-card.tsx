/**
 * LSTM Personalization Settings Component
 * Allows users to manage AI personalization based on their conversation patterns
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  RefreshCw, 
  Trash2, 
  TrendingUp, 
  MessageSquare, 
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PersonalizationSettingsCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);

  // Load current status
  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analyze-patterns");
      const data = await response.json();
      setStatus(data);
      setPersonalizationEnabled(data.pattern?.personalizationEnabled || false);
    } catch (error) {
      console.error("Failed to load personalization status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Trigger pattern analysis
  const handleAnalyze = async (force = false) => {
    try {
      setAnalyzing(true);
      const response = await fetch("/api/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Analysis Complete",
          description: `Analyzed ${data.conversationsAnalyzed} conversations in ${(data.processingTime / 1000).toFixed(2)}s`,
        });
        await loadStatus();
      } else {
        toast({
          title: "⚠️ Cannot Analyze Yet",
          description: data.message,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Toggle personalization
  const handleToggle = async (enabled: boolean) => {
    try {
      // Note: This would call a toggle endpoint once implemented
      setPersonalizationEnabled(enabled);
      toast({
        title: enabled ? "✅ Personalization Enabled" : "⏸️ Personalization Paused",
        description: enabled 
          ? "AI will use your conversation patterns for better responses" 
          : "AI will use default behavior",
      });
    } catch (error: any) {
      toast({
        title: "❌ Failed to Update",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete pattern data
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete all your personalization data? This cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch("/api/analyze-patterns", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🗑️ Data Deleted",
          description: "All personalization data has been removed",
        });
        await loadStatus();
        setPersonalizationEnabled(false);
      }
    } catch (error: any) {
      toast({
        title: "❌ Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Personalization</CardTitle>
          </div>
          <CardDescription>
            Loading personalization status...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const hasPattern = status?.hasPattern;
  const canEnable = status?.eligibility?.canEnable;
  const conversationCount = status?.eligibility?.conversationCount || 0;
  const minRequired = status?.eligibility?.minRequired || 5;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Personalization (LSTM)</CardTitle>
          </div>
          {hasPattern && (
            <Badge variant={personalizationEnabled ? "default" : "secondary"}>
              {personalizationEnabled ? "Active" : "Paused"}
            </Badge>
          )}
        </div>
        <CardDescription>
          Uses advanced LSTM models to learn your patterns and personalize responses
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="personalization-toggle">Enable Personalization</Label>
              <p className="text-sm text-muted-foreground">
                AI learns from your conversation history
              </p>
            </div>
            <Switch
              id="personalization-toggle"
              checked={personalizationEnabled}
              onCheckedChange={handleToggle}
              disabled={!hasPattern}
            />
          </div>

          {/* Eligibility Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              {canEnable ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {canEnable ? "Eligible for Personalization" : "More Conversations Needed"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>
                {conversationCount} / {minRequired} conversations
              </span>
            </div>

            {!canEnable && (
              <p className="text-xs text-muted-foreground">
                Have {minRequired - conversationCount} more conversations to unlock personalization
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Pattern Details */}
        {hasPattern && status.pattern && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Your Conversation Patterns
            </h4>

            <div className="grid gap-3">
              {/* Emotional Profile */}
              {status.pattern.emotionalProfile?.dominantEmotions?.length > 0 && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Emotional Patterns
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {status.pattern.emotionalProfile.dominantEmotions.slice(0, 3).map((emotion: string) => (
                      <Badge key={emotion} variant="outline" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {status.pattern.topicPreferences?.interests?.length > 0 && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Topics of Interest
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {status.pattern.topicPreferences.interests.slice(0, 5).map((topic: string) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Style */}
              {status.pattern.communicationStyle && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Communication Style
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {status.pattern.communicationStyle.preferredTone}
                    </span>
                    {" • "}
                    <span>
                      {status.pattern.communicationStyle.responseLength} responses
                    </span>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {status.pattern.lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last analyzed: {new Date(status.pattern.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => handleAnalyze(false)}
            disabled={analyzing || !canEnable}
            className="w-full"
            variant={hasPattern ? "outline" : "default"}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Patterns...
              </>
            ) : hasPattern ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Analysis
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analyze My Patterns
              </>
            )}
          </Button>

          {hasPattern && (
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Pattern Data
                </>
              )}
            </Button>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium">🔒 Privacy & Data</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>All data is encrypted and private to you</li>
            <li>Patterns are extracted using LSTM neural networks</li>
            <li>You can delete your data anytime</li>
            <li>No raw messages are stored for analysis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
