import { useState } from "react";
import {
  Home,
  CreditCard,
  FileText,
  Wallet,
  UserCircle,
  Bell,
  Shield,
  HelpCircle,
  TrendingUp,
  Calendar,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

function MemberHelp() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const helpSections = [
    {
      icon: Home,
      title: "Dashboard Overview",
      description: "Understanding your member dashboard",
      content: [
        {
          question: "What information is on my dashboard?",
          answer:
            "Your dashboard shows your account summary, current share capital balance, active loans, recent payments, upcoming payment due dates, and important announcements from the cooperative.",
        },
        {
          question: "How do I check my current balance?",
          answer:
            "Your share capital balance is displayed prominently on the dashboard. Click on 'Share Capital' or navigate to the Coop Share Capital page for detailed contribution history.",
        },
        {
          question: "What do the status indicators mean?",
          answer:
            "Green badges indicate good standing, yellow shows upcoming due dates or pending actions, and red indicates overdue payments or urgent matters requiring your attention.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Loan Applications",
      description: "Applying for loans and tracking applications",
      content: [
        {
          question: "How do I apply for a loan?",
          answer:
            "Navigate to Loan Application, select the loan product you want, enter the desired amount and term, specify the loan purpose, and submit. Make sure you meet the eligibility requirements before applying.",
        },
        {
          question: "What documents do I need to submit?",
          answer:
            "Typically required: Valid government ID, proof of income, proof of address, and co-maker information (if applicable). Specific requirements depend on the loan product and amount.",
        },
        {
          question: "How long does loan approval take?",
          answer:
            "The Board reviews applications during regular meetings (typically weekly or bi-weekly). You'll be notified via email and SMS once your application is reviewed. Processing usually takes 3-7 business days.",
        },
        {
          question: "Can I check my application status?",
          answer:
            "Yes, go to Loan Applications to view the status of all your applications. Status options include: Pending (under review), Approved (ready for release), Rejected (with reason), or Needs More Info.",
        },
        {
          question: "What if my application is rejected?",
          answer:
            "You'll receive notification with the reason for rejection. You can address the concerns and reapply after meeting the requirements. Contact the Board or Admin if you need clarification.",
        },
        {
          question: "Can I have multiple loans at once?",
          answer:
            "This depends on cooperative policy. Generally, you can have multiple loans if your total obligation doesn't exceed your loanable amount (based on share capital). Check your eligibility in the Loan Application section.",
        },
      ],
    },
    {
      icon: Wallet,
      title: "Loan Accounts & Payments",
      description: "Managing your active loans and making payments",
      content: [
        {
          question: "How do I view my active loans?",
          answer:
            "Go to Loan Accounts to see all your active loans, including principal amount, interest rate, remaining balance, monthly payment, and next due date. Click on any loan to see detailed payment schedule.",
        },
        {
          question: "How do I make a loan payment?",
          answer:
            "Visit the cooperative office or authorized collection center to make payments. Inform the Treasurer which loan account you're paying for. Always request an official receipt for your payment.",
        },
        {
          question: "Can I pay in advance?",
          answer:
            "Yes, advance payments are accepted. The system will credit your payment to upcoming installments in order. Advance payments can help reduce total interest, especially for diminishing balance loans.",
        },
        {
          question: "What happens if I miss a payment?",
          answer:
            "Missed payments accrue penalty fees as per cooperative policy. Your account will be marked as overdue. Contact the Treasurer immediately to arrange payment and avoid additional penalties.",
        },
        {
          question: "How do I view my payment history?",
          answer:
            "Navigate to Payments section to see all your payment transactions including date, amount paid, principal portion, interest portion, and remaining balance after each payment.",
        },
        {
          question: "Can I request to restructure my loan?",
          answer:
            "Yes, if you're having difficulty making payments, you can request loan restructuring. Submit a formal request to the Board explaining your circumstances. Restructuring is subject to Board approval.",
        },
      ],
    },
    {
      icon: TrendingUp,
      title: "Share Capital & Contributions",
      description: "Understanding your cooperative share capital",
      content: [
        {
          question: "What is share capital?",
          answer:
            "Share capital represents your equity/ownership in the cooperative. It's the amount you've contributed that makes you a member-owner. Your share capital determines your voting rights and loan eligibility.",
        },
        {
          question: "How much can I borrow based on my share capital?",
          answer:
            "Loanable amount is typically a percentage of your share capital (e.g., 80-90%), as set by cooperative policy. You can view your maximum loanable amount in the Loan Application section.",
        },
        {
          question: "Can I add to my share capital?",
          answer:
            "Yes, you can increase your share capital anytime. Visit the cooperative office or contact the Treasurer to make additional contributions. Higher share capital increases your loanable amount.",
        },
        {
          question: "Can I withdraw my share capital?",
          answer:
            "Share capital withdrawal requires Board approval and is typically allowed only when leaving the cooperative. You must settle all loan obligations first. Processing may take several weeks.",
        },
        {
          question: "How do I view my contribution history?",
          answer:
            "Go to Coop Share Capital page to see all your share capital contributions, dates, amounts, and current total balance. You can also download statements for your records.",
        },
      ],
    },
    {
      icon: Calendar,
      title: "Payment Schedules",
      description: "Viewing and understanding your payment schedule",
      content: [
        {
          question: "How do I view my payment schedule?",
          answer:
            "Go to Loan Accounts, click on any active loan to see the complete amortization schedule showing all installments, due dates, principal amount, interest amount, and total payment per period.",
        },
        {
          question: "What if I can't pay on the due date?",
          answer:
            "Contact the Treasurer as soon as possible before the due date. Grace periods may be available depending on policy. Late payments incur penalties, so communicate early to explore options.",
        },
        {
          question: "How is interest calculated?",
          answer:
            "Interest calculation depends on the loan product: Flat rate (same interest throughout), or Diminishing balance (interest decreases as principal is paid). Check your loan details for the specific method used.",
        },
        {
          question: "Can I get a printed copy of my schedule?",
          answer:
            "Yes, you can download or print your payment schedule from the Loan Accounts section. Use the export button to generate a PDF copy for your records.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Reports & Statements",
      description: "Accessing your financial reports and statements",
      content: [
        {
          question: "What reports are available to me?",
          answer:
            "You can access: Member Statement of Account, Loan Payment History, Share Capital Contribution History, and Transaction Summary. All reports can be filtered by date range.",
        },
        {
          question: "How do I download my statement?",
          answer:
            "Navigate to Reports section, select the report type, set your date range, and click the PDF or Excel export button. Your statement will be downloaded to your device.",
        },
        {
          question: "How often should I review my statements?",
          answer:
            "Monthly review is recommended to track your payments, contributions, and ensure all transactions are correctly recorded. Report any discrepancies immediately to the Treasurer.",
        },
        {
          question: "Can I request official documents?",
          answer:
            "For official documents like Certificate of Good Standing, Loan Clearance, or Official Receipts, visit the cooperative office or submit a request through the Admin. Processing may take 1-3 business days.",
        },
      ],
    },
    {
      icon: UserCircle,
      title: "Profile & Account Management",
      description: "Managing your personal information and account settings",
      content: [
        {
          question: "How do I update my personal information?",
          answer:
            "Go to Profile or Settings page, click Edit Profile, update your information (contact number, email, address, emergency contact), and save changes. Some fields may require Admin verification.",
        },
        {
          question: "Can I change my email or phone number?",
          answer:
            "Yes, you can update these in your Profile settings. Verify the new contact information to ensure you receive important notifications and payment reminders.",
        },
        {
          question: "How do I update my emergency contact?",
          answer:
            "Navigate to Settings > Profile tab, edit your emergency contact name and phone number, and save. This information is important for the cooperative to reach someone in case of emergencies.",
        },
        {
          question: "What if I forget my password?",
          answer:
            "Click 'Forgot Password' on the login page, enter your registered email, and follow the password reset instructions sent to your email. If you don't receive the email, contact the Admin.",
        },
      ],
    },
    {
      icon: Bell,
      title: "Notifications & Alerts",
      description: "Managing your notification preferences",
      content: [
        {
          question: "How do I receive payment reminders?",
          answer:
            "Enable notifications in Settings > Notifications. You can choose to receive reminders via email and/or SMS. Reminders are sent a few days before your payment due date.",
        },
        {
          question: "What notifications will I receive?",
          answer:
            "You'll receive notifications for: upcoming payments, loan application updates, account changes, announcements, and important cooperative news. Configure your preferences in Settings.",
        },
        {
          question: "Can I turn off certain notifications?",
          answer:
            "Yes, go to Settings > Notifications to customize which alerts you want to receive. You can toggle each notification type independently (email, SMS, promotional).",
        },
        {
          question: "Why am I not receiving notifications?",
          answer:
            "Check: 1) Notification settings are enabled, 2) Email/phone number is correct and verified, 3) Check spam folder for emails, 4) Ensure your phone can receive SMS. Contact Admin if issues persist.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Protecting your account and personal information",
      content: [
        {
          question: "How do I keep my account secure?",
          answer:
            "Use a strong, unique password, enable two-factor authentication if available, never share your login credentials, always log out after each session, and report suspicious activity immediately.",
        },
        {
          question: "What should I do if I suspect unauthorized access?",
          answer:
            "Change your password immediately, review your recent login activity in Settings > Security, check for unauthorized transactions, and report the incident to the Admin immediately.",
        },
        {
          question: "Is my personal information safe?",
          answer:
            "The cooperative implements security measures to protect your data. Your information is used only for cooperative operations and is not shared with third parties without your consent, except as required by law.",
        },
        {
          question: "Can I download my personal data?",
          answer:
            "Yes, you can request a copy of your personal data through Settings > Preferences > Download My Data. This includes your profile information, transaction history, and contribution records.",
        },
      ],
    },
    {
      icon: HelpCircle,
      title: "Common Issues & Troubleshooting",
      description: "Solutions to frequently encountered problems",
      content: [
        {
          question: "I can't log in to my account",
          answer:
            "Check: 1) Username/email and password are correct (case-sensitive), 2) Caps Lock is off, 3) Try password reset, 4) Clear browser cache, 5) Try different browser. Contact Admin if problem persists.",
        },
        {
          question: "My payment is not showing in my account",
          answer:
            "Payments may take 1-2 business days to reflect in the system. Check your official receipt for confirmation. If still not reflected after 2 days, contact the Treasurer with your receipt details.",
        },
        {
          question: "I can't download reports",
          answer:
            "Check: 1) Pop-up blocker is disabled, 2) Browser allows downloads, 3) Stable internet connection, 4) Try different browser. If issue continues, contact technical support.",
        },
        {
          question: "The page won't load or is showing errors",
          answer:
            "Try: 1) Refresh the page, 2) Clear browser cache and cookies, 3) Check internet connection, 4) Try incognito/private browsing mode, 5) Update your browser. Contact support if errors persist.",
        },
        {
          question: "I need to report a problem or ask a question",
          answer:
            "Contact the cooperative office during business hours, send an email through the Contact Admin feature, or visit in person. For urgent matters, call the cooperative hotline.",
        },
      ],
    },
  ];

  const filteredSections = helpSections.filter(
    (section) =>
      searchQuery === "" ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.some(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="px-2 sm:px-4 lg:px-6 min-h-screen py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg lg:text-2xl font-bold">
              Member Help Center
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your complete guide to using DigiTEC cooperative services
            </p>
          </div>
          <span className="badge badge-primary badge-lg">Member Role</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="form-control">
          <div className="input-group flex flex-row gap-2">
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full"
            />
            <button className="btn btn-square">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setSearchQuery("loan")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <CreditCard className="h-4 w-4" /> Loans
        </button>
        <button
          onClick={() => setSearchQuery("payment")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <Wallet className="h-4 w-4" /> Payments
        </button>
        <button
          onClick={() => setSearchQuery("share capital")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <TrendingUp className="h-4 w-4" /> Share Capital
        </button>
        <button
          onClick={() => setSearchQuery("report")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <FileText className="h-4 w-4" /> Reports
        </button>
        <button
          onClick={() => setSearchQuery("security")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <Shield className="h-4 w-4" /> Security
        </button>
      </div>

      {/* Help Sections */}
      <div className="space-y-4">
        {filteredSections.map((section, index) => (
          <div
            key={index}
            className="bg-base-100 rounded-lg shadow-md border border-gray-200"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleSection(index)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSection === index ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Section Content */}
            {expandedSection === index && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base text-primary">
                      Q: {item.question}
                    </h3>
                    <p className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No help topics found for &quot;{searchQuery}&quot;
          </p>
          <button onClick={() => setSearchQuery("")} className="btn btn-link">
            Clear search
          </button>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
        <p className="text-sm text-gray-700 mb-4">
          If you couldn&apos;t find the answer you&apos;re looking for, please
          contact the cooperative office or submit a request through the contact
          form.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn btn-primary btn-sm flex items-center gap-1">
            <Mail className="h-4 w-4" /> Email Support
          </button>
          <button className="btn btn-outline btn-sm flex items-center gap-1">
            <Phone className="h-4 w-4" /> Call Office
          </button>
          <button className="btn btn-outline btn-sm flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> Submit Request
          </button>
        </div>
      </div>

      {/* Tips Footer */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> Member Tips
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Always keep your contact information up to date</li>
          <li>Save or print your payment receipts for your records</li>
          <li>Review your account statement monthly</li>
          <li>Pay your loans on time to avoid penalty fees</li>
          <li>
            Attend general assemblies to stay informed and exercise your voting
            rights
          </li>
          <li>Increase your share capital to boost your loanable amount</li>
          <li>Report any discrepancies or issues immediately</li>
          <li>Keep your login credentials secure and confidential</li>
        </ul>
      </div>
    </div>
  );
}

export default MemberHelp;
