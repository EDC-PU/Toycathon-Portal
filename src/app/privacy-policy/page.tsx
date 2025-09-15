
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="bg-secondary/20 p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: September 5, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/80">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to the Vadodara Toycathon 2025 ("Event", "we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and register for our event. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">2. Collection of Your Information</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register for the Event.
              </li>
              <li>
                <strong>Team and Idea Submissions:</strong> Information you provide as part of team creation and idea submissions, including team member details and descriptions of your projects.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">3. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create and manage your account.</li>
              <li>Process your registration and manage your participation in the Event.</li>
              <li>Email you regarding your account or the Event.</li>
              <li>Compile anonymous statistical data and analysis for use internally.</li>
              <li>Notify you of updates to the Event.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
             <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                </li>
                <li>
                    <strong>Event Organizers and Partners:</strong> We may share your information with our event partners and sponsors for purposes of event administration, prize fulfillment, and communication.
                </li>
             </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: entrepreneurshipclub@paruluniversity.ac.in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
