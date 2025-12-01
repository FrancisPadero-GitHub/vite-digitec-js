import { useState } from "react";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Megaphone,
  Settings,
  FileText,
  TrendingUp,
  Shield,
  AlertCircle,
  Gavel,
  Search,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

function BoardHelp() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const helpSections = [
    {
      icon: LayoutDashboard,
      title: "Dashboard Overview",
      description: "Understanding board dashboard metrics and insights",
      content: [
        {
          question: "What metrics are displayed on the board dashboard?",
          answer:
            "The dashboard shows key performance indicators including total active members, pending loan applications, approved loans, overdue accounts, total funds, recent activities, and membership growth trends.",
        },
        {
          question: "How do I interpret the financial health indicators?",
          answer:
            "Financial health indicators show the cooperative's overall performance: liquidity ratios, loan portfolio quality, collection efficiency, and fund utilization. Green indicators mean healthy, yellow means caution, and red requires immediate attention.",
        },
        {
          question: "Can I customize the dashboard widgets?",
          answer:
            "Dashboard customization is limited to date range filtering. For specialized reports, use the Reports section where you can generate custom analytics and export data.",
        },
      ],
    },
    {
      icon: FileCheck,
      title: "Loan Application Review",
      description: "Evaluating and approving loan applications",
      content: [
        {
          question: "How do I review a loan application?",
          answer:
            "Navigate to Loan Applications, click on a pending application to view details including member profile, credit history, loan amount requested, purpose, and supporting documents. Review all information carefully before making a decision.",
        },
        {
          question: "What criteria should I consider when approving loans?",
          answer:
            "Consider: Member's payment history, tenure with cooperative, share capital balance, existing loan obligations, debt-to-income ratio, purpose of loan, and collateral (if required). Ensure member meets minimum eligibility requirements.",
        },
        {
          question: "Can I request additional documents from applicants?",
          answer:
            "Yes, you can request additional documentation before approval. Use the 'Request More Info' button to specify what documents are needed. The application status will change to 'Pending Additional Info'.",
        },
        {
          question: "What happens after I approve a loan?",
          answer:
            "Once approved by the Board, the loan moves to the Treasurer for disbursement. You can set approval conditions or notes that the Treasurer must verify before releasing funds.",
        },
        {
          question: "How do I reject a loan application?",
          answer:
            "Click 'Reject' and provide a clear, professional reason. The member will be notified. Document the rejection rationale for records and potential appeals. Rejected applications can be archived for audit trails.",
        },
      ],
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Overseeing membership and member accounts",
      content: [
        {
          question: "How do I view member details?",
          answer:
            "Go to Members section, search by name or account number. View comprehensive member profile including personal information, share capital contributions, loan history, payment records, and account status.",
        },
        {
          question: "What actions can I take on member accounts?",
          answer:
            "Board members can view member details, review transaction history, check loan eligibility, generate member statements, and recommend account status changes (active/inactive). Account modifications require Admin approval.",
        },
        {
          question: "How do I handle member disputes?",
          answer:
            "Document all disputes formally. Review member's account history, gather evidence, consult with other board members, and make a fair decision based on cooperative bylaws. All dispute resolutions must be documented.",
        },
        {
          question: "Can I approve new member applications?",
          answer:
            "Yes, pending member applications require Board approval. Review membership requirements, verify documentation, conduct background checks if necessary, and vote on acceptance during board meetings.",
        },
      ],
    },
    {
      icon: Megaphone,
      title: "Announcements & Communications",
      description: "Managing cooperative announcements and notices",
      content: [
        {
          question: "How do I create an announcement?",
          answer:
            "Navigate to Announcements > Create New. Enter title, message content, select priority (High/Medium/Low), set target audience (All Members/Specific Groups), and publish. You can schedule announcements for future posting.",
        },
        {
          question: "Who receives the announcements?",
          answer:
            "Announcements can be sent to all members, specific member types (regular/associate), or targeted groups. Members receive notifications via email and see announcements in their dashboard.",
        },
        {
          question: "Can I edit or delete published announcements?",
          answer:
            "Yes, you can edit or delete announcements. Editing creates a revision history. Important announcements should be archived rather than deleted for record-keeping purposes.",
        },
        {
          question: "What types of announcements should I post?",
          answer:
            "Post about: upcoming meetings, policy changes, new loan products, holiday schedules, payment deadlines, interest rate updates, cooperative events, financial results, and important reminders.",
        },
      ],
    },
    {
      icon: TrendingUp,
      title: "Loan Accounts & Portfolio",
      description: "Monitoring active loans and portfolio health",
      content: [
        {
          question: "How do I monitor the loan portfolio?",
          answer:
            "Access Loan Accounts section to view all active loans with filters by status, amount, or date. Monitor key metrics: total outstanding, collection rate, portfolio at risk, and aging analysis.",
        },
        {
          question: "What is Portfolio at Risk (PAR)?",
          answer:
            "PAR measures the percentage of loan portfolio with overdue payments. PAR30 (30+ days overdue) is a critical indicator. High PAR requires immediate action: enhanced collection efforts and policy review.",
        },
        {
          question: "How do I handle loan restructuring requests?",
          answer:
            "Review member's payment history and circumstances. Evaluate if restructuring is in the cooperative's best interest. Consider: extended terms, payment holidays, or reduced installments. Document all restructuring agreements.",
        },
        {
          question: "Can I view individual loan payment schedules?",
          answer:
            "Yes, click on any loan account to view detailed payment schedule, remaining balance, payment history, penalties assessed, and next due date. Export schedules for detailed analysis.",
        },
      ],
    },
    {
      icon: AlertCircle,
      title: "Overdue Management",
      description: "Handling overdue accounts and collections",
      content: [
        {
          question: "How are overdue accounts identified?",
          answer:
            "System automatically flags accounts with missed payments. Accounts are categorized by aging: 1-30 days (early), 31-60 days (concerning), 61-90 days (serious), 90+ days (critical). Monitor the Overdue Dashboard regularly.",
        },
        {
          question: "What is the Board's role in collections?",
          answer:
            "Board sets collection policies, approves write-offs, reviews seriously delinquent accounts, authorizes legal action if needed, and supports the Treasurer's collection efforts with policy guidance.",
        },
        {
          question: "Can the Board waive penalties?",
          answer:
            "Yes, but only with documented justification. Penalty waivers require majority board vote and must be recorded in meeting minutes. Establish clear criteria to maintain fairness and prevent abuse.",
        },
        {
          question: "When should we consider legal action?",
          answer:
            "Consider legal action for accounts 120+ days overdue with significant balances, after exhausting collection efforts. Consult legal counsel, document all attempts to collect, and vote on proceeding with legal remedies.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Reports & Analytics",
      description: "Generating reports and analyzing cooperative performance",
      content: [
        {
          question: "What reports are available to the Board?",
          answer:
            "Available reports: Income Statement, Balance Sheet (planned), Loan Portfolio Report, Collection Report, Member Growth Report, Fund Utilization Report, and Delinquency Report. All reports can be filtered by date range.",
        },
        {
          question: "How often should we review financial reports?",
          answer:
            "Monthly financial reports are mandatory. Quarterly comprehensive reviews recommended. Annual audited statements required. Regular report review helps identify trends, risks, and opportunities early.",
        },
        {
          question: "Can I export reports for presentations?",
          answer:
            "Yes, all reports can be exported to PDF or Excel. Use exports for board meetings, member assemblies, regulatory submissions, and annual reports. Maintain archives of key reports.",
        },
        {
          question: "How do I analyze cooperative performance trends?",
          answer:
            "Compare period-over-period metrics: membership growth, loan disbursements, collection rates, fund balances. Look for patterns in delinquency, seasonal variations, and product performance.",
        },
      ],
    },
    {
      icon: Settings,
      title: "System Settings & Configuration",
      description: "Managing cooperative settings and loan products",
      content: [
        {
          question: "What settings can the Board configure?",
          answer:
            "Board can configure: loan eligibility criteria (minimum tenure, age, share capital), interest rates, penalty rates, grace periods, loan product terms, and approval workflows. Changes require board vote.",
        },
        {
          question: "How do I create a new loan product?",
          answer:
            "Go to Settings > Loan Products > Add New. Define: product name, interest rate type (flat/diminishing), maximum amount, term limits, eligibility requirements, and special conditions. Test thoroughly before launch.",
        },
        {
          question: "Can I modify existing loan product terms?",
          answer:
            "Yes, but changes typically apply to new loans only. Modifying terms for existing loans requires individual agreements. Document all product changes and communicate to members in advance.",
        },
        {
          question: "How do I set loan approval limits?",
          answer:
            "Configure approval authority levels in Settings. Small loans might be treasurer-approved, medium loans require single board member, large loans need majority board vote. Document in policies.",
        },
      ],
    },
    {
      icon: Gavel,
      title: "Governance & Compliance",
      description: "Maintaining governance standards and compliance",
      content: [
        {
          question: "What are the Board's governance responsibilities?",
          answer:
            "Board must: ensure compliance with cooperative laws, maintain fiduciary duty, approve major policies, oversee financial management, protect member interests, conduct regular meetings, and maintain proper documentation.",
        },
        {
          question: "How should board meetings be documented?",
          answer:
            "All meetings must have: agenda, attendance record, minutes of discussions, motions and votes, decisions made, action items assigned. Minutes should be approved at next meeting and securely archived.",
        },
        {
          question: "What policies should the Board establish?",
          answer:
            "Essential policies: Loan Policy, Collection Policy, Investment Policy, Dividend Distribution Policy, Conflict of Interest Policy, Privacy Policy, and Emergency Procedures. Review annually.",
        },
        {
          question: "How do we handle conflicts of interest?",
          answer:
            "Board members must disclose conflicts, abstain from voting on affected matters, and recuse themselves from related discussions. Maintain a conflicts register and follow bylaws strictly.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Identifying and mitigating operational risks",
      content: [
        {
          question: "What risks should the Board monitor?",
          answer:
            "Monitor: Credit risk (loan defaults), liquidity risk (cash flow), operational risk (fraud, errors), compliance risk (regulatory), reputational risk, and strategic risk. Maintain a risk register.",
        },
        {
          question: "How do we manage credit risk?",
          answer:
            "Implement: thorough credit assessment, loan limits based on share capital, diversification across borrowers, regular portfolio review, adequate reserves for bad debts, and active collection management.",
        },
        {
          question: "What internal controls should be in place?",
          answer:
            "Essential controls: segregation of duties, dual authorization for large transactions, regular reconciliations, audit trails, secure record-keeping, and periodic internal audits.",
        },
        {
          question: "How do we prepare for emergencies?",
          answer:
            "Develop contingency plans for: system failures, fraud incidents, natural disasters, key personnel loss. Maintain emergency fund, backup systems, insurance coverage, and succession plans.",
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
            <h1 className="text-lg lg:text-2xl font-bold">Board Help Center</h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete guide for board members and cooperative governance
            </p>
          </div>
          <span className="badge badge-primary badge-lg">Board Role</span>
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
          onClick={() => setSearchQuery("application")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <FileCheck className="h-4 w-4" /> Applications
        </button>
        <button
          onClick={() => setSearchQuery("member")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <Users className="h-4 w-4" /> Members
        </button>
        <button
          onClick={() => setSearchQuery("overdue")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" /> Overdue
        </button>
        <button
          onClick={() => setSearchQuery("report")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <FileText className="h-4 w-4" /> Reports
        </button>
        <button
          onClick={() => setSearchQuery("governance")}
          className="btn btn-outline btn-sm flex items-center gap-1"
        >
          <Gavel className="h-4 w-4" /> Governance
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
          contact the administrator or consult with other board members.
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
          <Lightbulb className="h-5 w-5" /> Board Member Best Practices
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Attend all board meetings and participate actively</li>
          <li>Review financial reports thoroughly before meetings</li>
          <li>Maintain confidentiality of member information</li>
          <li>Act in the best interest of all members, not personal gain</li>
          <li>Stay informed about cooperative laws and regulations</li>
          <li>Declare conflicts of interest immediately</li>
          <li>Support decisions made by majority vote</li>
          <li>Regularly communicate with members about cooperative status</li>
          <li>Continuously educate yourself on cooperative governance</li>
          <li>Document all decisions and maintain proper records</li>
        </ul>
      </div>
    </div>
  );
}

export default BoardHelp;
