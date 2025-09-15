
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="bg-secondary/20 p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: September 5, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/80">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing our website and participating in the Vadodara Toycathon 2025 ("Event"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access the website or participate in the Event.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">2. Event Participation</h2>
            <p>
              You agree to abide by all rules and eligibility criteria set forth by the Event organizers. This includes rules regarding team formation, idea originality, prototype submission, and safety standards. Failure to comply with these rules may result in disqualification.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password. We reserve the right to refuse service, terminate accounts, remove or edit content in our sole discretion.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
            <p>
              By submitting an idea or prototype, you represent and warrant that you have the right to do so and that your submission does not infringe upon the intellectual property rights of any third party. While you retain ownership of your original work, you grant the Event organizers a non-exclusive, worldwide, royalty-free license to use, display, and distribute your submission for promotional and archival purposes related to the Event.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>
              In no event shall the Event organizers, its affiliates, or their respective directors, employees, or agents be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with your participation in the Event.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">6. Changes to Terms</h2>
            <p>
             We reserve the right, in our sole discretion, to change these Terms at any time. We will provide notice of any changes by posting the new Terms on the Site. Your continued use of the Site and participation in the Event after such changes have been posted will constitute your acceptance of the new Terms.
            </p>
          </div>
           <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: entrepreneurshipclub@paruluniversity.ac.in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
