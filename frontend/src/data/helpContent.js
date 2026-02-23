export const helpContent = [
    // General
    {
        id: 'g1',
        category: 'General',
        question: 'What is Naija Trust?',
        answer: 'Naija Trust is a consumer review platform connecting Nigerian businesses with customers. We help you find trusted businesses and allow you to share your experiences through reviews.',
        keywords: ['about', 'platform', 'what is']
    },
    {
        id: 'g2',
        category: 'General',
        question: 'Is Naija Trust free to use?',
        answer: 'Yes! For users, searching for businesses and reading/writing reviews is completely free. For businesses, we offer a free Basic plan along with paid premium options for advanced features.',
        keywords: ['free', 'cost', 'price']
    },
    {
        id: 'g3',
        category: 'General',
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button in the top right corner. You can register as a regular user to write reviews, or as a business owner to claim your listing.',
        keywords: ['register', 'signup', 'account', 'join']
    },

    // For Businesses
    {
        id: 'b1',
        category: 'For Businesses',
        question: 'How do I claim my business?',
        answer: 'Search for your business on our platform. If you see it, click "Claim this Business" on the profile page. If it\'s not listed, navigate to "For Businesses" > "Register Business" to create a new profile.',
        keywords: ['claim', 'register', 'add business', 'owner']
    },
    {
        id: 'b2',
        category: 'For Businesses',
        question: 'What are the benefits of the Verified plan?',
        answer: 'The Verified plan allows you to respond to unlimited reviews, access basic analytics, display a "Verified" badge to build trust, and appear in multiple business categories.',
        keywords: ['verified', 'plan', 'benefits', 'premium']
    },
    {
        id: 'b3',
        category: 'For Businesses',
        question: 'How can I remove a bad review?',
        answer: 'We do not remove negative reviews unless they violate our content policy (e.g., hate speech, spam, or conflict of interest). However, you can respond to the review to address the customer\'s concerns publicly, or report it if you believe it violates our guidelines.',
        keywords: ['remove review', 'delete review', 'bad review', 'report']
    },

    // Account Management
    {
        id: 'a1',
        category: 'Account Management',
        question: 'I forgot my password. How do I reset it?',
        answer: 'Go to the Login page and click "Forgot Password?". Enter your email address, and we will send you a link to reset your password securely.',
        keywords: ['password', 'reset', 'forgot', 'login']
    },
    {
        id: 'a2',
        category: 'Account Management',
        question: 'How do I change my profile picture?',
        answer: 'Log in and go to "Settings" from your user dashboard. You will see an option to upload or update your profile photo.',
        keywords: ['profile picture', 'photo', 'avatar', 'upload']
    },

    // Reviews & Trust
    {
        id: 'r1',
        category: 'Reviews & Trust',
        question: 'What is your Content Moderation Policy?',
        answer: 'We do not allow defamation, hate speech, harassment, fraud, or spam. We use AI screening, human review, and community reporting to enforce our policies. Read our full Content Moderation Policy at /content-moderation.',
        keywords: ['removed', 'moderation', 'policy', 'rules']
    },
    {
        id: 'r2',
        category: 'Reviews & Trust',
        question: 'How do you handle Defamation and False Accusations?',
        answer: 'We require accounts to be real and verify transactions when necessary. False or malicious users face suspension or permanent bans in compliance with Nigerian defamation laws. Check out our Anti-Defamation Framework at /anti-defamation.',
        keywords: ['defamation', 'false', 'fake', 'framework']
    },
    {
        id: 'r3',
        category: 'Reviews & Trust',
        question: 'How can I submit a Dispute or Request a Content Take-Down?',
        answer: 'You can submit a complaint via our support. We will review the evidence, notify the business, and may remove content that violates laws or our Terms within 48-72 hours. For detailed guidelines, view our Dispute Resolution Policy (/dispute-resolution) and Content Take-Down Policy (/content-take-down).',
        keywords: ['takedown', 'dispute', 'resolution', 'remove review', 'conflict']
    }
];

export const helpCategories = [
    { id: 'General', label: 'General', icon: 'Info' },
    { id: 'For Businesses', label: 'For Businesses', icon: 'Briefcase' },
    { id: 'Account Management', label: 'Account & Security', icon: 'Shield' },
    { id: 'Reviews & Trust', label: 'Reviews & Trust', icon: 'Star' }
];
