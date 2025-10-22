import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  useEffect(() => {
    document.title = "Settings";
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      <Separator className="my-6" />
      <div className="text-muted-foreground">This page is coming soon.</div>
    </div>
  );
};

export default Settings;
