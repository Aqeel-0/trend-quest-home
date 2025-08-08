import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useState } from "react";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address." });
      return;
    }
    toast({ title: "Subscribed!", description: "You'll receive our best deals weekly." });
    setEmail("");
  };

  return (
    <footer className="mt-16 border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">ShopScout aggregates products from multiple stores to help you find the best price fast.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><a className="story-link" href="#">Support</a></li>
              <li><a className="story-link" href="#">Partnerships</a></li>
              <li><a className="story-link" href="#">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">Get top deals in your inbox.</p>
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} ShopScout</div>
      </div>
    </footer>
  );
};

export default Footer;
