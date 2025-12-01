import { useState } from "react";
import {
  DollarSign,
  CreditCard,
  FileText,
  Landmark,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Shield,
  Bell,
  Wrench,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

function TreasurerHelp() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const helpSections = [
    {
      icon: DollarSign,
      title: "Dashboard Overview",
      description: "Understanding your treasurer dashboard and key metrics",
      content: [
        {
          question: "What information is displayed on the dashboard?",
          answer:
            "The dashboard shows real-time financial metrics including total cash on hand, pending payments, overdue accounts, recent transactions, and quick action buttons for common tasks.",
        },
        {
          question: "How do I interpret the financial summary cards?",
          answer:
            "Each card displays key financial indicators: Cash Balance shows available funds, Pending Payments shows awaiting transactions, Collections shows received payments for the period, and Disbursements shows outgoing funds.",
        },
        {
          question: "Can I customize the dashboard view?",
          answer:
            "Currently, the dashboard layout is standardized. However, you can filter data by date ranges and export reports for custom analysis.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Recording and managing member payments",
      content: [
        {
          question: "How do I record a loan payment?",
          answer:
            "Navigate to Payments > Record Payment, select the member and loan account, enter the payment amount, choose payment method (Cash/Check/Bank Transfer), and click Submit. Always issue a receipt.",
        },
        {
          question: "What if a member makes a partial payment?",
          answer:
            "Partial payments are accepted. Enter the actual amount received. The system will automatically calculate the remaining balance and adjust the payment schedule accordingly.",
        },
        {
          question: "How do I void or reverse a payment?",
          answer:
            "Only authorized personnel can void payments. Contact the Board or Admin to request a payment reversal with proper documentation and justification.",
        },
        {
          question: "Can I process advance payments?",
          answer:
            "Yes, advance payments are allowed. The system will credit the payment to upcoming installments in chronological order. Always document advance payments clearly.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Financial Reports",
      description: "Generating and exporting financial reports",
      content: [
        {
          question: "What reports are available?",
          answer:
            "Available reports include: Income Statement, Loan Reports, Club/Coop Funds Report, Member Statements, Payment Schedules, and Transaction Logs. Each can be filtered by date range.",
        },
        {
          question: "How do I export reports?",
          answer:
            "Open any report page, set your desired filters (year/month), then click the PDF or Excel export button at the top right. Reports will download to your device.",
        },
        {
          question: "How often should reports be generated?",
          answer:
            "Monthly reports are recommended. Generate end-of-month reports for board meetings and quarterly summaries for member assemblies. Keep archived copies for audit trails.",
        },
        {
          question: "Can I schedule automatic report generation?",
          answer:
            "Automated report scheduling is planned for future updates. Currently, reports must be generated manually.",
        },
      ],
    },
    {
      icon: Landmark,
      title: "Club & Cooperative Funds",
      description: "Managing organizational funds and expenses",
      content: [
        {
          question: "How do I record club fund contributions?",
          answer:
            "Go to Club Funds > Record Contribution, select the member, enter contribution amount and type (Club Fund or Share Capital), add payment date, and submit. Always maintain receipt documentation.",
        },
        {
          question: "How do I track expenses?",
          answer:
            "Navigate to Expenses > Add Expense, enter expense title, category, amount, transaction date, and attach receipts if available. All expenses should be approved by the Board.",
        },
        {
          question:
            "What is the difference between Club Fund and Share Capital?",
          answer:
            "Share Capital is member equity in the cooperative (loanable amount). Club Fund is for operational expenses, activities, and emergency funds (non-loanable).",
        },
        {
          question: "How do I reconcile fund balances?",
          answer:
            "Monthly reconciliation is recommended. Compare system balances with bank statements and physical cash counts. Document any discrepancies and report to the Board immediately.",
        },
      ],
    },
    {
      icon: Calendar,
      title: "Payment Schedules",
      description: "Viewing and managing loan payment schedules",
      content: [
        {
          question: "How do I view a member's payment schedule?",
          answer:
            "Go to Payment Schedules, search for the member by name or account number, and click View Details. The schedule shows all installments with due dates and amounts.",
        },
        {
          question: "What happens when a payment is missed?",
          answer:
            "Missed payments are automatically marked as OVERDUE. Penalty fees are calculated based on system settings. Notify the member immediately and document all communications.",
        },
        {
          question: "Can payment schedules be modified?",
          answer:
            "Payment schedule modifications require Board approval. Submit a request through the Loan Accounts section with valid reasons and supporting documents.",
        },
        {
          question: "How do I handle restructured loans?",
          answer:
            "Loan restructuring requires Board approval. The system will generate a new payment schedule based on approved terms. Archive the original schedule for records.",
        },
      ],
    },
    {
      icon: RefreshCw,
      title: "Loan Releases & Disbursements",
      description: "Processing approved loan releases",
      content: [
        {
          question: "How do I release an approved loan?",
          answer:
            "Navigate to Loan Accounts > Approved Loans, select the loan, verify member details and loan terms, enter disbursement details (check number/transfer reference), and mark as Released. Update cash on hand accordingly.",
        },
        {
          question: "What documents are needed before releasing a loan?",
          answer:
            "Required: Board approval, signed promissory note, valid ID, proof of address. Optional: Co-maker information, collateral documents (if applicable). All documents must be complete before release.",
        },
        {
          question: "How do I handle service fees and deductions?",
          answer:
            "Service fees are automatically calculated. The net amount (principal minus fees) is what the member receives. Always explain deductions clearly to the member before release.",
        },
        {
          question: "What if a member doesn't claim their loan?",
          answer:
            "Unclaimed loans should be reported to the Board. Set a deadline (typically 30 days from approval). Document all attempts to contact the member. Return funds to general pool if unclaimed.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "Overdue Accounts & Collections",
      description: "Managing overdue payments and penalty fees",
      content: [
        {
          question: "How are penalty fees calculated?",
          answer:
            "Penalty fees are calculated based on system settings (typically a percentage of overdue amount per day/month). Penalties apply automatically after the grace period expires.",
        },
        {
          question: "What is the collection process?",
          answer:
            "Follow the escalation process: 1) Send reminder before due date, 2) Contact member on due date, 3) Send overdue notice after 7 days, 4) Board notification after 30 days, 5) Collection committee involvement if needed.",
        },
        {
          question: "Can penalty fees be waived?",
          answer:
            "Penalty waivers require Board approval. Submit a request with member's explanation and your recommendation. Document all waiver approvals for audit purposes.",
        },
        {
          question: "How do I generate overdue reports?",
          answer:
            'Go to Reports > Loan Reports, select the "Overdue Loans" tab. Export the list and use it for collection follow-ups. Update the Board monthly on overdue accounts.',
        },
      ],
    },
    {
      icon: Shield,
      title: "Security & Best Practices",
      description: "Maintaining security and following proper procedures",
      content: [
        {
          question: "How do I protect financial data?",
          answer:
            "Always log out after each session, never share login credentials, use strong passwords, enable two-factor authentication in Settings, and report suspicious activities immediately.",
        },
        {
          question: "What records should I maintain?",
          answer:
            "Maintain: Payment receipts, bank deposit slips, expense vouchers, check stubs, member acknowledgment forms, and all transaction documentation. Keep both digital and physical copies.",
        },
        {
          question: "How often should I backup data?",
          answer:
            "Enable automatic backups in Settings > Security. Manual exports should be done weekly. Store backups in secure, separate locations. Verify backup integrity monthly.",
        },
        {
          question: "What should I do in case of discrepancies?",
          answer:
            "Immediately document the discrepancy, verify against source documents, notify the Board in writing, freeze related transactions until resolved, and cooperate fully with any investigation.",
        },
      ],
    },
    {
      icon: Bell,
      title: "Communication & Notifications",
      description: "Managing member communications and system notifications",
      content: [
        {
          question: "How do I send payment reminders?",
          answer:
            "Enable automatic reminders in Settings > Notifications. Manual reminders can be sent through the Payment Schedules section. Always maintain professional and respectful communication.",
        },
        {
          question: "What notifications should I enable?",
          answer:
            "Recommended: Payment confirmations, overdue alerts, low balance warnings, and monthly summary reports. Configure in Settings > Notifications based on your workflow.",
        },
        {
          question: "How do I communicate with members?",
          answer:
            "Use official channels only: registered email, verified phone numbers, or in-person meetings. Document all communications regarding financial matters. Never discuss member accounts publicly.",
        },
      ],
    },
    {
      icon: Wrench,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      content: [
        {
          question: "Payment not reflecting in the system",
          answer:
            "Check: 1) Internet connection, 2) Transaction receipt, 3) Refresh the page, 4) Verify payment was submitted (not just saved). If issue persists, contact technical support with transaction details.",
        },
        {
          question: "Report export not working",
          answer:
            "Clear browser cache, try different browser, check pop-up blocker settings, ensure stable internet connection. If downloading large reports, wait for processing to complete.",
        },
        {
          question: "Balance discrepancies",
          answer:
            "Run reconciliation report, compare with bank statements, check for pending transactions, verify all payments are recorded. Contact Admin if discrepancy cannot be resolved.",
        },
        {
          question: "Unable to access certain features",
          answer:
            "Verify your role permissions with Admin. Some features require specific authorization levels. Request access elevation if needed for your duties.",
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
              Treasurer Help Center
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete guide for managing cooperative finances
            </p>
          </div>
          <span className="badge badge-primary badge-lg">Treasurer Role</span>
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
          onClick={() => setSearchQuery("payment")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <CreditCard className="h-4 w-4" /> Payments
        </button>
        <button
          onClick={() => setSearchQuery("report")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <FileText className="h-4 w-4" /> Reports
        </button>
        <button
          onClick={() => setSearchQuery("overdue")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <AlertTriangle className="h-4 w-4" /> Overdue
        </button>
        <button
          onClick={() => setSearchQuery("release")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Releases
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
                className={`h-5 w-5 transition-transform ${expandedSection === index ? "rotate-180" : ""}`}
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
          contact the administrator or board members for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn btn-primary btn-sm flex items-center gap-1">
            <Mail className="h-4 w-4" /> Contact Admin
          </button>
          <button className="btn btn-outline btn-sm flex items-center gap-1">
            <Phone className="h-4 w-4" /> Call Support
          </button>
          <button className="btn btn-outline btn-sm flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> Submit Feedback
          </button>
        </div>
      </div>

      {/* Best Practices Footer */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> Treasurer Best Practices
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Always verify member identity before processing transactions</li>
          <li>Issue official receipts for all payments received</li>
          <li>Reconcile cash on hand daily and bank accounts weekly</li>
          <li>Keep detailed records of all financial transactions</li>
          <li>Report discrepancies immediately to the Board</li>
          <li>Maintain confidentiality of member financial information</li>
          <li>Back up data regularly and securely</li>
          <li>
            Follow the cooperative&apos;s financial policies and procedures
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TreasurerHelp;
